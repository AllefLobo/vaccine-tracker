import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({
    description: 'Vaccine type of the batch',
    example: 'VACCINE_1',
  })
  @IsString()
  @IsNotEmpty()
  public type!: string;

  @ApiPropertyOptional({
    description: 'Initial temperature readings (optional)',
    type: [Number],
    example: [-18.5, -19.0],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  public initialTemperatures?: number[];
}
