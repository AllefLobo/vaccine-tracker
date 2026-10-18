import { VaccineBatch } from '../../domain/vaccine-batch.entity';
import { VaccineBatchStatus } from '../../domain/vaccine-batch-status.enum';
import type { VaccineBatchRepositoryPort } from '../ports/out/vaccine-batch.repository.port';
import { CreateBatchService } from './create-batch.service';

describe('CreateBatchService', () => {
  let service: CreateBatchService;
  let repository: jest.Mocked<VaccineBatchRepositoryPort>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    service = new CreateBatchService(repository);
  });

  it('creates a batch and persists it', async () => {
    repository.save.mockImplementation(async (batch) => batch);

    const result = await service.execute({ type: 'mRNA-1273' });

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(VaccineBatch);
    expect(result.type).toBe('mRNA-1273');
    expect(result.status).toBe(VaccineBatchStatus.SAFE);
    expect(result.id).toEqual(expect.any(String));
  });

  it('applies the initial temperatures when provided', async () => {
    repository.save.mockImplementation(async (batch) => batch);

    const result = await service.execute({
      type: 'mRNA-1273',
      initialTemperatures: [-25, -30],
    });

    expect(result.temperatures).toHaveLength(2);
    expect(result.status).toBe(VaccineBatchStatus.SAFE);
  });

  it('compromises the batch when an initial temperature exceeds the threshold', async () => {
    repository.save.mockImplementation(async (batch) => batch);

    const result = await service.execute({
      type: 'mRNA-1273',
      initialTemperatures: [-25, -10],
    });

    expect(result.status).toBe(VaccineBatchStatus.COMPROMISED);
  });
});
