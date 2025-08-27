import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: createClientDto,
    });

    return {
      message: 'Client created successfully',
      client,
    };
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      clients,
      total: clients.length,
    };
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return { client };
  }

  async findOrdersByClient(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const orders = await this.prisma.order.findMany({
      where: { clientId: id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      orders: orders.map((order) => ({
        id: order.id,
        clientId: order.clientId,
        items: order.items.map((item) => ({
          orderItemId: item.id,
          productId: item.productId,
          quantity: item.quantity,
          returned: item.returned || 0,
          product: {
            name: item.product.name,
            size: item.product.size,
            price: item.product.price,
          },
        })),
        fromDate: order.fromDate,
        toDate: order.toDate,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        createdAt: order.createdAt,
        returnedAt: order.updatedAt,
        status: order.status,
      })),
      total: orders.length,
    };
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const client = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });

    return {
      message: 'Client updated successfully',
      client,
    };
  }

  async remove(id: number) {
    const existingClient = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    await this.prisma.client.delete({
      where: { id },
    });

    return {
      message: 'Client deleted successfully',
    };
  }
}