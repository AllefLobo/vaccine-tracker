import type { CreateBatchUseCase } from '../../../core/application/ports/in/create-batch.use-case';
import type { RecordTelemetryUseCase } from '../../../core/application/ports/in/record-telemetry.use-case';
import { VaccineBatch } from '../../../core/domain/vaccine-batch.entity';
import { VaccineBatchStatus } from '../../../core/domain/vaccine-batch-status.enum';
import { VaccineBatchController } from './vaccine-batch.controller';

describe('VaccineBatchController', () => {
  let controller: VaccineBatchController;
  let createBatchUseCase: jest.Mocked<CreateBatchUseCase>;
  let recordTelemetryUseCase: jest.Mocked<RecordTelemetryUseCase>;

  beforeEach(() => {
    createBatchUseCase = { execute: jest.fn() };
    recordTelemetryUseCase = { execute: jest.fn() };
    controller = new VaccineBatchController(
      createBatchUseCase,
      recordTelemetryUseCase,
    );
  });

  it('creates a batch and returns the mapped response', async () => {
    const batch = new VaccineBatch('id-1', 'VACCINE_1');
    createBatchUseCase.execute.mockResolvedValue(batch);

    const result = await controller.create({
      type: 'VACCINE_1',
      initialTemperatures: [-18.5],
    });

    expect(createBatchUseCase.execute).toHaveBeenCalledWith({
      type: 'VACCINE_1',
      initialTemperatures: [-18.5],
    });
    expect(result).toEqual({
      id: 'id-1',
      type: 'VACCINE_1',
      status: VaccineBatchStatus.SAFE,
      temperatures: [],
    });
  });

  it('records telemetry and returns the mapped response', async () => {
    const batch = new VaccineBatch('id-1', 'VACCINE_1');
    batch.recordTemperature(-10);
    recordTelemetryUseCase.execute.mockResolvedValue(batch);

    const result = await controller.recordTelemetry('id-1', {
      temperature: -10,
    });

    expect(recordTelemetryUseCase.execute).toHaveBeenCalledWith({
      batchId: 'id-1',
      temperature: -10,
    });
    expect(result).toMatchObject({
      id: 'id-1',
      type: 'VACCINE_1',
      status: VaccineBatchStatus.COMPROMISED,
    });
    expect(result.temperatures).toHaveLength(1);
    expect(result.temperatures[0].value).toBe(-10);
  });
});
