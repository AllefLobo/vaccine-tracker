import { TemperatureRecord } from './temperature-record.value-object';
import { VaccineBatch } from './vaccine-batch.entity';
import { VaccineBatchStatus } from './vaccine-batch-status.enum';

describe('VaccineBatch', () => {
  describe('construction', () => {
    it('creates a batch with SAFE status and no readings by default', () => {
      const batch = new VaccineBatch('id-1', 'mRNA-1273');

      expect(batch.id).toBe('id-1');
      expect(batch.type).toBe('mRNA-1273');
      expect(batch.status).toBe(VaccineBatchStatus.SAFE);
      expect(batch.temperatures).toEqual([]);
    });

    it('accepts an explicit status and initial readings', () => {
      const reading = new TemperatureRecord(
        -20,
        new Date('2026-01-01T00:00:00Z'),
      );
      const batch = new VaccineBatch(
        'id-1',
        'mRNA-1273',
        VaccineBatchStatus.COMPROMISED,
        [reading],
      );

      expect(batch.status).toBe(VaccineBatchStatus.COMPROMISED);
      expect(batch.temperatures).toHaveLength(1);
    });
  });

  describe('recordTemperature', () => {
    it('keeps the batch SAFE while the temperature is within the safe range', () => {
      const batch = new VaccineBatch('id-1', 'mRNA-1273');

      batch.recordTemperature(-25);
      batch.recordTemperature(-20);

      expect(batch.status).toBe(VaccineBatchStatus.SAFE);
      expect(batch.temperatures).toHaveLength(2);
    });

    it('compromises the batch when the temperature is above -15°C', () => {
      const batch = new VaccineBatch('id-1', 'mRNA-1273');

      batch.recordTemperature(-14);

      expect(batch.status).toBe(VaccineBatchStatus.COMPROMISED);
    });

    it('treats exactly -15°C as still safe (threshold boundary)', () => {
      const batch = new VaccineBatch('id-1', 'mRNA-1273');

      batch.recordTemperature(-15);

      expect(batch.status).toBe(VaccineBatchStatus.SAFE);
    });

    it('never reverts a COMPROMISED batch back to SAFE', () => {
      const batch = new VaccineBatch('id-1', 'mRNA-1273');

      batch.recordTemperature(-10); // compromises the batch
      batch.recordTemperature(-30); // a later safe reading must not revert it

      expect(batch.status).toBe(VaccineBatchStatus.COMPROMISED);
    });

    it('appends each reading to the temperature history in order', () => {
      const batch = new VaccineBatch('id-1', 'mRNA-1273');

      batch.recordTemperature(-30);
      batch.recordTemperature(-25);

      expect(batch.temperatures.map((t) => t.value)).toEqual([-30, -25]);
    });
  });
});
