// dto/order.dto.ts (Agar mavjud bo'lmasa, qo'shing)
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsArray, IsObject, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  clientId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsDateString()
  startDateTime: string;

  @IsNumber()
  taxPercent: number;

  @IsOptional()
  @IsNumber()
  advancePayment?: number;
}

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class CreateOrderWithCustomerDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer: CreateCustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsDateString()
  startDateTime: string;

  @IsNumber()
  taxPercent: number;

  @IsOptional()
  @IsNumber()
  advancePayment?: number;
}

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class ReturnItemDto {
  @IsNotEmpty()
  @IsNumber()
  orderItemId: number;

  @IsNotEmpty()
  @IsNumber()
  returnQuantity: number;
}

export class ReturnItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsOptional()
  @IsNumber()
  rentalDays?: number;

  @IsOptional()
  @IsNumber()
  rentalHours?: number;

  @IsOptional()
  @IsNumber()
  billingMultiplier?: number;
}