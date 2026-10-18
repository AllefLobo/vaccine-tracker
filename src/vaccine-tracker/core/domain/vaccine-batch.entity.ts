import { TemperatureRecord } from './temperature-record.value-object';
import { VaccineBatchStatus } from './vaccine-batch-status.enum';

/**
 * Pure domain entity (Vaccine Batch).
 *
 * IMPORTANT: no NestJS or TypeORM decorators are allowed here.
 * All the cold-chain business rules live in this aggregate, ensuring the
 * domain is 100% independent of frameworks and infrastructure.
 */
export class VaccineBatch {
  /**
   * Golden rule of the cold chain: any reading above this threshold
   * immediately compromises the batch.
   */
  public static readonly MAX_SAFE_TEMPERATURE_CELSIUS = -15;

  private readonly _id: string;
  private readonly _type: string;
  private _status: VaccineBatchStatus;
  private _temperatures: TemperatureRecord[];

  public constructor(
    id: string,
    type: string,
    status: VaccineBatchStatus = VaccineBatchStatus.SAFE,
    temperatures: TemperatureRecord[] = [],
  ) {
    this._id = id;
    this._type = type;
    this._status = status;
    this._temperatures = [...temperatures];
  }

  public get id(): string {
    return this._id;
  }

  public get type(): string {
    return this._type;
  }

  public get status(): VaccineBatchStatus {
    return this._status;
  }

  /** Exposes the readings immutably (read-only). */
  public get temperatures(): readonly TemperatureRecord[] {
    return this._temperatures;
  }

  /**
   * Records a new temperature reading on the batch.
   *
   * Golden rule: if the recorded temperature is above -15°C,
   * the batch status immediately changes to 'COMPROMISED'.
   */
  public recordTemperature(temp: number): void {
    this._temperatures.push(new TemperatureRecord(temp, new Date()));

    if (temp > VaccineBatch.MAX_SAFE_TEMPERATURE_CELSIUS) {
      this._status = VaccineBatchStatus.COMPROMISED;
    }
  }
}
