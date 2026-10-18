import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { VaccineBatch } from '../../domain/vaccine-batch.entity';
import type { RecordTelemetryCommand } from '../ports/in/record-telemetry.use-case';
import type { RecordTelemetryUseCase } from '../ports/in/record-telemetry.use-case';
import type { DocumentStoragePort } from '../ports/out/document-storage.port';
import type { VaccineBatchRepositoryPort } from '../ports/out/vaccine-batch.repository.port';
import { DOCUMENT_STORAGE, VACCINE_BATCH_REPOSITORY } from '../tokens';

/**
 * Implementation of the record-telemetry use case.
 *
 * Demonstrates dependency inversion: the service orchestrates the domain
 * entity, the repository (output port) and the document storage (output port),
 * without knowing any concrete implementation.
 */
@Injectable()
export class RecordTelemetryService implements RecordTelemetryUseCase {
  public constructor(
    @Inject(VACCINE_BATCH_REPOSITORY)
    private readonly repository: VaccineBatchRepositoryPort,
    @Inject(DOCUMENT_STORAGE)
    private readonly documentStorage: DocumentStoragePort,
  ) {}

  public async execute(command: RecordTelemetryCommand): Promise<VaccineBatch> {
    const batch = await this.repository.findById(command.batchId);

    if (!batch) {
      throw new NotFoundException(
        `Vaccine batch '${command.batchId}' not found`,
      );
    }

    // Golden rule applied inside the aggregate: the entity decides the status.
    batch.recordTemperature(command.temperature);

    const persisted = await this.repository.save(batch);

    // Persists the reading as a document (mock AWS S3) for auditing.
    await this.documentStorage.upload(
      `batches/${persisted.id}/telemetry.json`,
      Buffer.from(
        JSON.stringify({
          batchId: persisted.id,
          temperature: command.temperature,
          status: persisted.status,
        }),
      ),
    );

    return persisted;
  }
}
