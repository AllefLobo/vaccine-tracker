import type { VaccineBatch } from '../../../domain/vaccine-batch.entity';

export interface RecordTelemetryCommand {
  batchId: string;
  temperature: number;
}

/**
 * Input (driving) port — use case for recording telemetry (temperature)
 * on an existing batch.
 */
export interface RecordTelemetryUseCase {
  execute(command: RecordTelemetryCommand): Promise<VaccineBatch>;
}
