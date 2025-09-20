import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto, ReturnItemsDto, CreateOrderWithCustomerDto } from '../dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Post('with-customer')
  createWithCustomer(@Body() createOrderWithCustomerDto: CreateOrderWithCustomerDto) {
    return this.orderService.createWithCustomer(createOrderWithCustomerDto);
  }

  @Get('check-client/:phone')
  checkClientRating(@Param('phone') phone: string) {
    return this.orderService.checkClientRating(phone);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('client/:clientId')
  getClientOrders(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.orderService.getClientOrders(clientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }

  @Post(':id/return')
  returnItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnItemsDto: ReturnItemsDto,
  ) {
    return this.orderService.returnItems(id, returnItemsDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}