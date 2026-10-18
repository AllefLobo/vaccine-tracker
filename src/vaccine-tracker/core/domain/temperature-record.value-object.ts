/**
 * Immutable value object representing a temperature reading recorded at a
 * specific instant.
 *
 * As a value object, it has no identity of its own: two readings with the
 * same value and timestamp are considered equal.
 */
export class TemperatureRecord {
  public constructor(
    public readonly value: number,
    public readonly recordedAt: Date,
  ) {}

  public equals(other: TemperatureRecord): boolean {
    return (
      this.value === other.value &&
      this.recordedAt.getTime() === other.recordedAt.getTime()
    );
  }
}
