import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RecordTelemetryDto {
  @ApiProperty({
    description: 'Recorded temperature in degrees Celsius',
    example: -18.5,
  })
  @IsNumber()
  public temperature!: number;
}
