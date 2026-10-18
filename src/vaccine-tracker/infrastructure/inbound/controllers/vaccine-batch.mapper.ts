import type { VaccineBatch } from '../../../core/domain/vaccine-batch.entity';
import {
  TemperatureRecordResponseDto,
  VaccineBatchResponseDto,
} from './dto/vaccine-batch.response.dto';

/**
 * Maps the domain entity to the API response DTO, keeping the domain layer
 * free of presentation concerns (the domain entity exposes getters instead of
 * a JSON-friendly shape).
 */
export function toVaccineBatchResponse(
  batch: VaccineBatch,
): VaccineBatchResponseDto {
  const temperatures: TemperatureRecordResponseDto[] = batch.temperatures.map(
    (record) => ({
      value: record.value,
      recordedAt: record.recordedAt.toISOString(),
    }),
  );

  return {
    id: batch.id,
    type: batch.type,
    status: batch.status,
    temperatures,
  };
}
