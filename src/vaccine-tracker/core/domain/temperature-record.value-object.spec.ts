import { TemperatureRecord } from './temperature-record.value-object';

describe('TemperatureRecord', () => {
  it('exposes its value and recordedAt', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const record = new TemperatureRecord(-20, date);

    expect(record.value).toBe(-20);
    expect(record.recordedAt).toBe(date);
  });

  it('considers two records equal when value and timestamp match', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const a = new TemperatureRecord(-20, date);
    const b = new TemperatureRecord(-20, new Date(date.getTime()));

    expect(a.equals(b)).toBe(true);
  });

  it('considers two records different when the value differs', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const a = new TemperatureRecord(-20, date);
    const b = new TemperatureRecord(-25, date);

    expect(a.equals(b)).toBe(false);
  });

  it('considers two records different when the timestamp differs', () => {
    const a = new TemperatureRecord(-20, new Date('2026-01-01T00:00:00Z'));
    const b = new TemperatureRecord(-20, new Date('2026-01-02T00:00:00Z'));

    expect(a.equals(b)).toBe(false);
  });
});
