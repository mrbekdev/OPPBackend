import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnItemsDto } from './order.dto';

export class PartialReturnDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemsDto)
  items: ReturnItemsDto[];
}

export class PartialReturnResponseDto {
  id: number;
  originalOrderId: number;
  returnedItems: any[];
  returnAmount: number;
  rentalDays: number;
  rentalHours: number;
  billingMultiplier: number;
  returnedAt: Date;
}
