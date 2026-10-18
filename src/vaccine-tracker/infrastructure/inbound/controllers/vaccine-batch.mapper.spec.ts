import { TemperatureRecord } from '../../../core/domain/temperature-record.value-object';
import { VaccineBatch } from '../../../core/domain/vaccine-batch.entity';
import { VaccineBatchStatus } from '../../../core/domain/vaccine-batch-status.enum';
import { toVaccineBatchResponse } from './vaccine-batch.mapper';

describe('toVaccineBatchResponse', () => {
  it('maps the domain entity to the API response shape', () => {
    const recordedAt = new Date('2026-01-01T00:00:00.000Z');
    const batch = new VaccineBatch(
      'id-1',
      'VACCINE_1',
      VaccineBatchStatus.COMPROMISED,
      [new TemperatureRecord(-10, recordedAt)],
    );

    const result = toVaccineBatchResponse(batch);

    expect(result).toEqual({
      id: 'id-1',
      type: 'VACCINE_1',
      status: VaccineBatchStatus.COMPROMISED,
      temperatures: [
        {
          value: -10,
          recordedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('serializes the recordedAt timestamp as an ISO string', () => {
    const batch = new VaccineBatch('id-1', 'VACCINE_1');
    batch.recordTemperature(-20);

    const result = toVaccineBatchResponse(batch);

    expect(result.temperatures[0].recordedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });
});
