import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RecordTelemetryDto } from './record-telemetry.dto';

describe('RecordTelemetryDto', () => {
  it('accepts a numeric temperature', async () => {
    const dto = plainToInstance(RecordTelemetryDto, { temperature: -18.5 });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects a non-numeric temperature', async () => {
    const dto = plainToInstance(RecordTelemetryDto, { temperature: 'abc' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'temperature')).toBe(true);
  });
});
