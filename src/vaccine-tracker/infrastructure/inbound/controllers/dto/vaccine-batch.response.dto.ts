import { ApiProperty } from '@nestjs/swagger';
import { VaccineBatchStatus } from '../../../../core/domain/vaccine-batch-status.enum';

/** Represents a temperature reading returned by the API. */
export class TemperatureRecordResponseDto {
  @ApiProperty({
    description: 'Recorded temperature in degrees Celsius',
    example: -18.5,
  })
  public value!: number;

  @ApiProperty({
    description: 'Date/time of the reading in ISO 8601',
    example: '2026-10-18T00:00:00.000Z',
  })
  public recordedAt!: string;
}

/** Response format of a vaccine batch. */
export class VaccineBatchResponseDto {
  @ApiProperty({
    description: 'Unique identifier (UUID) of the batch',
    example: '5f2c1c8b-9a3a-4b1e-8c3d-1a2b3c4d5e6f',
  })
  public id!: string;

  @ApiProperty({ description: 'Vaccine type', example: 'VACCINE_1' })
  public type!: string;

  @ApiProperty({
    enum: VaccineBatchStatus,
    description: 'Cold-chain status of the batch',
  })
  public status!: VaccineBatchStatus;

  @ApiProperty({
    type: [TemperatureRecordResponseDto],
    description: 'History of temperature readings',
  })
  public temperatures!: TemperatureRecordResponseDto[];
}
