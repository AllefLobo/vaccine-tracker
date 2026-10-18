import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBatchDto } from './create-batch.dto';

describe('CreateBatchDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateBatchDto, {
      type: 'VACCINE_1',
      initialTemperatures: [-18.5, -19.0],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a payload without initial temperatures', async () => {
    const dto = plainToInstance(CreateBatchDto, { type: 'VACCINE_1' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty type', async () => {
    const dto = plainToInstance(CreateBatchDto, { type: '' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('type');
  });

  it('rejects a non-string type', async () => {
    const dto = plainToInstance(CreateBatchDto, { type: 123 });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('rejects initial temperatures that are not numbers', async () => {
    const dto = plainToInstance(CreateBatchDto, {
      type: 'VACCINE_1',
      initialTemperatures: ['abc'],
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'initialTemperatures')).toBe(true);
  });
});
