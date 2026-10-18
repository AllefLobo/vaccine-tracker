import { Column, Entity, PrimaryColumn } from 'typeorm';
import { VaccineBatchStatus } from '../../../../core/domain/vaccine-batch-status.enum';

/** Serialized format of a temperature reading in the database (JSONB). */
export interface TemperatureRecordData {
  value: number;
  recordedAt: string;
}

/**
 * PERSISTENCE entity (TypeORM).
 *
 * Unlike the domain entity, here the use of decorators is allowed and
 * expected: it exists only to map the table in PostgreSQL.
 */
@Entity('vaccine_batches')
export class VaccineBatchOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  public id!: string;

  @Column({ type: 'varchar', length: 100 })
  public type!: string;

  @Column({
    type: 'enum',
    enum: VaccineBatchStatus,
    default: VaccineBatchStatus.SAFE,
  })
  public status!: VaccineBatchStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  public temperatures!: TemperatureRecordData[];
}
