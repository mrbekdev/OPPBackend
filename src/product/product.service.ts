import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    return {
      message: 'Product created successfully',
      product,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      products,
      total: products.length,
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return { product };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  async remove(id: number) {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      message: 'Product deleted successfully',
    };
  }
}
