import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";

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
}