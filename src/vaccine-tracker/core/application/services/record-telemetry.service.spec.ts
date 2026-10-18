import { NotFoundException } from '@nestjs/common';
import { VaccineBatch } from '../../domain/vaccine-batch.entity';
import { VaccineBatchStatus } from '../../domain/vaccine-batch-status.enum';
import type { DocumentStoragePort } from '../ports/out/document-storage.port';
import type { VaccineBatchRepositoryPort } from '../ports/out/vaccine-batch.repository.port';
import { RecordTelemetryService } from './record-telemetry.service';

describe('RecordTelemetryService', () => {
  let service: RecordTelemetryService;
  let repository: jest.Mocked<VaccineBatchRepositoryPort>;
  let documentStorage: jest.Mocked<DocumentStoragePort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    documentStorage = {
      upload: jest.fn(),
    };
    service = new RecordTelemetryService(repository, documentStorage);
  });

  it('throws NotFoundException when the batch does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ batchId: 'missing', temperature: -20 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('records a safe temperature and persists the batch', async () => {
    const batch = new VaccineBatch('batch-1', 'mRNA-1273');
    repository.findById.mockResolvedValue(batch);
    repository.save.mockImplementation(async (b) => b);

    const result = await service.execute({
      batchId: 'batch-1',
      temperature: -20,
    });

    expect(repository.save).toHaveBeenCalledWith(batch);
    expect(result.status).toBe(VaccineBatchStatus.SAFE);
  });

  it('compromises the batch and uploads the telemetry document', async () => {
    const batch = new VaccineBatch('batch-1', 'mRNA-1273');
    repository.findById.mockResolvedValue(batch);
    repository.save.mockImplementation(async (b) => b);
    documentStorage.upload.mockResolvedValue(undefined);

    const result = await service.execute({
      batchId: 'batch-1',
      temperature: -10,
    });

    expect(result.status).toBe(VaccineBatchStatus.COMPROMISED);
    expect(documentStorage.upload).toHaveBeenCalledTimes(1);
    expect(documentStorage.upload).toHaveBeenCalledWith(
      'batches/batch-1/telemetry.json',
      expect.any(Buffer),
    );
  });
});
