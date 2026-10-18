import type { VaccineBatch } from '../../../domain/vaccine-batch.entity';

export interface CreateBatchCommand {
  type: string;
  initialTemperatures?: number[];
}

/**
 * Input (driving) port — use case for creating a vaccine batch.
 */
export interface CreateBatchUseCase {
  execute(command: CreateBatchCommand): Promise<VaccineBatch>;
}
