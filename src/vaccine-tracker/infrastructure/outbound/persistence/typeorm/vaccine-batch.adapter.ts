import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaccineBatch } from '../../../../core/domain/vaccine-batch.entity';
import { TemperatureRecord } from '../../../../core/domain/temperature-record.value-object';
import type { VaccineBatchRepositoryPort } from '../../../../core/application/ports/out/vaccine-batch.repository.port';
import {
  VaccineBatchOrmEntity,
  type TemperatureRecordData,
} from './vaccine-batch.orm-entity';

/**
 * Output (driven) adapter — implements `VaccineBatchRepositoryPort` using
 * TypeORM/PostgreSQL and is responsible for the bidirectional Domain <-> ORM
 * mapping, keeping the domain pure.
 */
@Injectable()
export class VaccineBatchTypeOrmAdapter implements VaccineBatchRepositoryPort {
  public constructor(
    @InjectRepository(VaccineBatchOrmEntity)
    private readonly repository: Repository<VaccineBatchOrmEntity>,
  ) {}

  public async save(batch: VaccineBatch): Promise<VaccineBatch> {
    const saved = await this.repository.save(this.toOrm(batch));
    return this.toDomain(saved);
  }

  public async findById(id: string): Promise<VaccineBatch | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  /** Domain -> ORM */
  private toOrm(batch: VaccineBatch): VaccineBatchOrmEntity {
    const entity = new VaccineBatchOrmEntity();
    entity.id = batch.id;
    entity.type = batch.type;
    entity.status = batch.status;
    entity.temperatures = batch.temperatures.map((record) => ({
      value: record.value,
      recordedAt: record.recordedAt.toISOString(),
    }));
    return entity;
  }

  /** ORM -> Domain */
  private toDomain(entity: VaccineBatchOrmEntity): VaccineBatch {
    const temperatures = entity.temperatures.map(
      (data: TemperatureRecordData) =>
        new TemperatureRecord(data.value, new Date(data.recordedAt)),
    );
    return new VaccineBatch(
      entity.id,
      entity.type,
      entity.status,
      temperatures,
    );
  }
}
