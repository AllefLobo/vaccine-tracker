import { Repository } from 'typeorm';
import { TemperatureRecord } from '../../../../core/domain/temperature-record.value-object';
import { VaccineBatch } from '../../../../core/domain/vaccine-batch.entity';
import { VaccineBatchStatus } from '../../../../core/domain/vaccine-batch-status.enum';
import { VaccineBatchTypeOrmAdapter } from './vaccine-batch.adapter';
import { VaccineBatchOrmEntity } from './vaccine-batch.orm-entity';

describe('VaccineBatchTypeOrmAdapter', () => {
  let adapter: VaccineBatchTypeOrmAdapter;
  const repository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new VaccineBatchTypeOrmAdapter(
      repository as unknown as Repository<VaccineBatchOrmEntity>,
    );
  });

  it('maps the domain entity to ORM, persists it, and maps it back', async () => {
    const domain = new VaccineBatch(
      'id-1',
      'VACCINE_1',
      VaccineBatchStatus.SAFE,
      [new TemperatureRecord(-18.5, new Date('2026-01-01T00:00:00.000Z'))],
    );
    const orm = new VaccineBatchOrmEntity();
    orm.id = 'id-1';
    orm.type = 'VACCINE_1';
    orm.status = VaccineBatchStatus.SAFE;
    orm.temperatures = [{ value: -18.5, recordedAt: '2026-01-01T00:00:00.000Z' }];
    repository.save.mockResolvedValue(orm);

    const result = await adapter.save(domain);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(VaccineBatch);
    expect(result.id).toBe('id-1');
    expect(result.type).toBe('VACCINE_1');
    expect(result.status).toBe(VaccineBatchStatus.SAFE);
    expect(result.temperatures).toHaveLength(1);
    expect(result.temperatures[0].value).toBe(-18.5);
  });

  it('returns null when the batch is not found', async () => {
    repository.findOne.mockResolvedValue(null);

    const result = await adapter.findById('missing');

    expect(result).toBeNull();
  });

  it('maps the ORM entity back to the domain when found', async () => {
    const orm = new VaccineBatchOrmEntity();
    orm.id = 'id-1';
    orm.type = 'VACCINE_1';
    orm.status = VaccineBatchStatus.COMPROMISED;
    orm.temperatures = [{ value: -10, recordedAt: '2026-01-01T00:00:00.000Z' }];
    repository.findOne.mockResolvedValue(orm);

    const result = await adapter.findById('id-1');

    expect(result).toBeInstanceOf(VaccineBatch);
    expect(result?.id).toBe('id-1');
    expect(result?.status).toBe(VaccineBatchStatus.COMPROMISED);
    expect(result?.temperatures[0].recordedAt.toISOString()).toBe(
      '2026-01-01T00:00:00.000Z',
    );
  });
});
