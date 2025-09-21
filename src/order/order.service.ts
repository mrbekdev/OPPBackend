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
    const { clientId, items, startDateTime, taxPercent, advancePayment } = createOrderDto;

    const startDate = new Date(startDateTime);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDateTime provided');
    }

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

        // Base price calculation - actual billing will be calculated on return
        subtotal += item.quantity * product.price;
      }

      const tax = Math.round(subtotal * taxPercent / 100);
      const total = subtotal + tax;

      // Create order
      const newOrder = await prisma.order.create({
        data: {
          clientId,
          status: 'PENDING',
          fromDate: null, // Not used anymore, start time stored in createdAt
          toDate: null, // Will be set when returned
          subtotal,
          advancePayment: advancePayment || 0,
          tax,
          total,
          createdAt: startDate, // Store start time in createdAt
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
    const { customer, items, startDateTime, taxPercent, advancePayment } = createOrderWithCustomerDto;
    const startDate = new Date(startDateTime);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDateTime provided');
    }
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
      } else {
        // If client exists, update their information
        client = await prisma.client.update({
          where: { id: client.id },
          data: {
            firstName: customer.firstName,
            lastName: customer.lastName,
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
        // Base price calculation - actual billing will be calculated on return
        subtotal += item.quantity * product.price;
      }
      const tax = Math.round(subtotal * taxPercent / 100);
      const total = subtotal + tax;
      // Create order with the existing or new customer
      const newOrder = await prisma.order.create({
        data: {
          clientId: client.id,
          status: 'PENDING',
          fromDate: null, // Not used anymore, start time stored in createdAt
          toDate: null, // Will be set when returned
          subtotal,
          advancePayment: advancePayment || 0,
          tax,
          total,
          createdAt: startDate, // Store start time in createdAt
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
      data: { 
        status,
        returnedAt: status === 'RETURNED' ? new Date() : null
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
    const { items, rentalDays, rentalHours, billingMultiplier } = returnItemsDto;

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

    // Validate duration data if provided
    if (rentalDays !== undefined && (typeof rentalDays !== 'number' || rentalDays < 0)) {
      throw new BadRequestException('rentalDays must be a non-negative number');
    }
    if (rentalHours !== undefined && (typeof rentalHours !== 'number' || rentalHours < 0 || rentalHours >= 24)) {
      throw new BadRequestException('rentalHours must be a number between 0 and 23');
    }
    if (billingMultiplier !== undefined && (typeof billingMultiplier !== 'number' || billingMultiplier <= 0)) {
      throw new BadRequestException('billingMultiplier must be a positive number');
    }

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
      const returnRecords: any[] = [];

      // Calculate duration if not provided
      let calculatedDays = rentalDays || 0;
      let calculatedHours = rentalHours || 0;
      let calculatedMultiplier = billingMultiplier || 1;

      if (!billingMultiplier && order.createdAt) {
        const startDate = new Date(order.createdAt);
        const now = new Date();
        const totalHours = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));
        calculatedDays = Math.floor(totalHours / 24);
        calculatedHours = totalHours % 24;
        calculatedMultiplier = totalHours <= 24 ? 1 : 1 + ((totalHours - 24) / 24);
      }

      for (const returnItem of items) {
        const orderItem = await prisma.orderItem.findUnique({
          where: { id: returnItem.orderItemId },
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

        if (!orderItem || orderItem.orderId !== id) {
          throw new NotFoundException(`Order item with ID ${returnItem.orderItemId} not found in order ${id}`);
        }

        if (returnItem.returnQuantity > orderItem.quantity - orderItem.returned) {
          throw new BadRequestException(
            `Cannot return ${returnItem.returnQuantity} items for order item ${returnItem.orderItemId}. Only ${orderItem.quantity - orderItem.returned} items available to return.`,
          );
        }

        // Calculate return amount for this specific item
        const itemReturnAmount = orderItem.product.price * returnItem.returnQuantity * calculatedMultiplier;

        // Create return record for detailed tracking
        const returnRecord = await (prisma as any).returnRecord.create({
          data: {
            orderItemId: returnItem.orderItemId,
            returnQuantity: returnItem.returnQuantity,
            rentalDays: calculatedDays,
            rentalHours: calculatedHours,
            billingMultiplier: calculatedMultiplier,
            returnAmount: itemReturnAmount,
          },
        });
        returnRecords.push(returnRecord);

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

      let newStatus = order.status;
      if (totalReturned === totalRented) {
        newStatus = 'RETURNED' as OrderStatus;
      } else if (totalReturned > 0) {
        newStatus = 'PARTIALLY_RETURNED' as OrderStatus;
      }

      // Calculate total return amount from return records
      const totalReturnAmount = returnRecords.reduce((sum, record) => sum + record.returnAmount, 0);
      
      // Calculate advance to use (only if not already used)
      const remainingAdvance = order.advancePayment - order.advanceUsed;
      const advanceToUse = Math.min(remainingAdvance, totalReturnAmount);
      
      // Update order status, advance used, and final total
      const updateData: any = {
        status: newStatus,
        advanceUsed: Math.min(order.advancePayment, totalReturnAmount),
        total: totalReturnAmount, // Store the final calculated amount
      };
      
      // Always update these fields with calculated values when returning
      updateData.rentalDays = calculatedDays;
      updateData.rentalHours = calculatedHours;
      updateData.billingMultiplier = calculatedMultiplier;
      
      // Set returnedAt timestamp only when all items are returned
      if (newStatus === 'RETURNED') {
        updateData.returnedAt = new Date();
      }
      // For partial returns, don't set returnedAt - keep order active
      
      await prisma.order.update({
        where: { id },
        data: updateData,
      });

      return { returnResults, returnRecords };
    });

    return {
      message: 'Items returned successfully',
      returnedItems: result.returnResults,
      returnRecords: result.returnRecords,
    };
  }

  async remove(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.prisma.order.delete({
      where: { id },
    });

    return {
      message: 'Order deleted successfully',
    };
  }

  async checkClientRating(phone: string) {
    const client = await this.prisma.client.findUnique({
      where: { phone },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        rating: true,
      },
    });

    if (!client) {
      return {
        exists: false,
        message: 'Client not found',
      };
    }

    return {
      exists: true,
      client,
      warning: client.rating === 'bad' ? 'Bu mijoz yomon deb belgilangan!' : null,
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

  async getReturnRecords() {
    const returnRecords = await (this.prisma as any).returnRecord.findMany({
      include: {
        orderItem: {
          include: {
            order: {
              select: {
                id: true,
                clientId: true,
                createdAt: true,
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                size: true,
                price: true,
                weight: true,
              }
            }
          }
        }
      },
      orderBy: {
        returnedAt: 'desc'
      }
    });

    return {
      returnRecords: returnRecords.map(record => ({
        id: record.id,
        orderId: record.orderItem.order.id,
        customerId: record.orderItem.order.clientId,
        productId: record.orderItem.product.id,
        productName: record.orderItem.product.name,
        productSize: record.orderItem.product.size,
        productPrice: record.orderItem.product.price,
        productWeight: record.orderItem.product.weight || 0,
        returnQuantity: record.returnQuantity,
        rentalDays: record.rentalDays,
        rentalHours: record.rentalHours,
        billingMultiplier: record.billingMultiplier,
        returnAmount: record.returnAmount,
        returnedAt: record.returnedAt,
        orderCreatedAt: record.orderItem.order.createdAt,
      }))
    };
  }

  async updateStartTime(id: number, startDateTime: string) {
    const startDate = new Date(startDateTime);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDateTime provided');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        createdAt: startDate,
        fromDate: null, // Keep fromDate as null since we use createdAt
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
      message: 'Order start time updated successfully',
      order: updatedOrder,
    };
  }
}