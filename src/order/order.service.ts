import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, Order, OrderItem, Client, Product, OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, ReturnItemsDto, CreateOrderWithCustomerDto } from '../dto/order.dto';

// Define a type for OrderItem with included Product data
type OrderItemWithProduct = OrderItem & {
  product: {
    id: number;
    name: string;
    size: string;
    price: number;
  };
};

// Define a type for Order with included Client and OrderItems
type OrderWithDetails = Order & {
  client: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
  };
  items: OrderItemWithProduct[];
};

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { clientId, items, fromDate, toDate, taxPercent } = createOrderDto;

    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      throw new BadRequestException('Invalid dates provided for fromDate or toDate');
    }
    const ms = Math.max(0, d2.getTime() - d1.getTime());
    const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));

    const order = await this.prisma.$transaction(async (prisma) => {
      // Check if client exists
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      let subtotal = 0;

      // Check if all products exist and have enough quantity, and calculate subtotal
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.count < item.quantity) {
          throw new BadRequestException(
            `Product ${product.name} has only ${product.count} items in stock, but ${item.quantity} requested`,
          );
        }

        subtotal += item.quantity * product.price * days;
      }

      const tax = Math.round(subtotal * taxPercent / 100);
      const total = subtotal + tax;

      // Create order
      const newOrder = await prisma.order.create({
        data: {
          clientId,
          status: 'PENDING',
          fromDate: d1,
          toDate: d2,
          subtotal,
          tax,
          total,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      // Create order items and update product quantities
      const orderItems: OrderItemWithProduct[] = [];
      for (const item of items) {
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            returned: 0,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
              },
            },
          },
        });

        // Update product quantity
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            count: {
              decrement: item.quantity,
            },
          },
        });

        orderItems.push(orderItem);
      }

      return {
        ...newOrder,
        items: orderItems,
      };
    });

    return {
      message: 'Order created successfully',
      order,
    };
  }

async createWithCustomer(createOrderWithCustomerDto: CreateOrderWithCustomerDto) {
  const { customer, items, fromDate, toDate, taxPercent } = createOrderWithCustomerDto;
  const d1 = new Date(fromDate);
  const d2 = new Date(toDate);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    throw new BadRequestException('Invalid dates provided for fromDate or toDate');
  }
  const ms = Math.max(0, d2.getTime() - d1.getTime());
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  const order = await this.prisma.$transaction(async (prisma) => {
    // Check if customer with this phone already exists
    let client = await prisma.client.findFirst({
      where: { phone: customer.phone },
    });
    // If client doesn't exist, create a new one
    if (!client) {
      client = await prisma.client.create({
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
      });
    }
    let subtotal = 0;
    // Check if all products exist and have enough quantity, and calculate subtotal
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
      if (product.count < item.quantity) {
        throw new BadRequestException(
          `Product ${product.name} has only ${product.count} items in stock, but ${item.quantity} requested`,
        );
      }
      subtotal += item.quantity * product.price * days;
    }
    const tax = Math.round(subtotal * taxPercent / 100);
    const total = subtotal + tax;
    // Create order with the existing or new customer
    const newOrder = await prisma.order.create({
      data: {
        clientId: client.id,
        status: 'PENDING',
        fromDate: d1,
        toDate: d2,
        subtotal,
        tax,
        total,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
    // Create order items and update product quantities
    const orderItems: OrderItemWithProduct[] = [];
    for (const item of items) {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          returned: 0,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              size: true,
              price: true,
            },
          },
        },
      });
      // Update product quantity
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          count: {
            decrement: item.quantity,
          },
        },
      });
      orderItems.push(orderItem);
    }
    return {
      ...newOrder,
      items: orderItems,
    };
  });
  return {
    order,
  };
}

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            returned: true,
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      orders,
      total: orders.length,
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            returned: true,
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return { order };
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            returned: true,
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Order status updated successfully',
      order: updatedOrder,
    };
  }

  async returnItems(id: number, returnItemsDto: ReturnItemsDto) {
    const { items } = returnItemsDto;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Items array must not be empty');
    }

    // Validate each item
    items.forEach((item, index) => {
      if (!item.orderItemId || typeof item.orderItemId !== 'number' || item.orderItemId <= 0) {
        throw new BadRequestException(`items.${index}.orderItemId must be a positive number`);
      }
      if (!item.returnQuantity || typeof item.returnQuantity !== 'number' || item.returnQuantity <= 0) {
        throw new BadRequestException(`items.${index}.returnQuantity must be a positive number`);
      }
    });

    const result = await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const returnResults: OrderItemWithProduct[] = [];

      for (const returnItem of items) {
        const orderItem = await prisma.orderItem.findUnique({
          where: { id: returnItem.orderItemId },
        });

        if (!orderItem || orderItem.orderId !== id) {
          throw new NotFoundException(`Order item with ID ${returnItem.orderItemId} not found in order ${id}`);
        }

        if (returnItem.returnQuantity > orderItem.quantity - orderItem.returned) {
          throw new BadRequestException(
            `Cannot return ${returnItem.returnQuantity} items for order item ${returnItem.orderItemId}. Only ${orderItem.quantity - orderItem.returned} items available to return.`,
          );
        }

        // Update order item returned quantity
        const updatedOrderItem = await prisma.orderItem.update({
          where: { id: returnItem.orderItemId },
          data: {
            returned: {
              increment: returnItem.returnQuantity,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
              },
            },
          },
        });

        // Update product quantity (add back to inventory)
        await prisma.product.update({
          where: { id: orderItem.productId },
          data: {
            count: {
              increment: returnItem.returnQuantity,
            },
          },
        });

        returnResults.push(updatedOrderItem);
      }

      // Calculate return status
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: id },
      });
      const totalRented = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalReturned = orderItems.reduce((sum, item) => sum + item.returned, 0);

      let newStatus: OrderStatus;
      if (totalReturned === 0) {
        newStatus = 'PENDING';
      } else if (totalReturned < totalRented) {
        newStatus = 'PARTIALLY_RETURNED';
      } else {
        newStatus = 'RETURNED' as OrderStatus;
      }

      // Update order status
      await prisma.order.update({
        where: { id },
        data: { 
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      return returnResults;
    });

    return {
      message: 'Items returned successfully',
      returnedItems: result,
    };
  }

  async remove(id: number) {
    await this.prisma.$transaction(async (prisma) => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Return all items to inventory before deleting
      for (const item of order.items) {
        const remainingQuantity = item.quantity - item.returned;
        if (remainingQuantity > 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              count: {
                increment: remainingQuantity,
              },
            },
          });
        }
      }

      // Delete order (cascade will delete order items)
      await prisma.order.delete({
        where: { id },
      });
    });

    return {
      message: 'Order deleted successfully',
    };
  }

  async getClientOrders(clientId: number) {
    const orders = await this.prisma.order.findMany({
      where: { clientId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            returned: true,
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      orders: orders.map((order) => ({
        ...order,
        items: order.items.map((item) => ({
          orderItemId: item.id,
          productId: item.productId,
          quantity: item.quantity,
          returned: item.returned,
          product: {
            name: item.product.name,
            size: item.product.size,
            price: item.product.price,
          },
        })),
      })),
      total: orders.length,
    };
  }
}