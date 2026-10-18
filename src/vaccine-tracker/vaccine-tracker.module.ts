import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateBatchService } from './core/application/services/create-batch.service';
import { RecordTelemetryService } from './core/application/services/record-telemetry.service';
import {
  CREATE_BATCH_USE_CASE,
  DOCUMENT_STORAGE,
  RECORD_TELEMETRY_USE_CASE,
  VACCINE_BATCH_REPOSITORY,
} from './core/application/tokens';
import { VaccineBatchController } from './infrastructure/inbound/controllers/vaccine-batch.controller';
import { S3StorageAdapter } from './infrastructure/outbound/aws/s3-storage.adapter';
import { VaccineBatchTypeOrmAdapter } from './infrastructure/outbound/persistence/typeorm/vaccine-batch.adapter';
import { VaccineBatchOrmEntity } from './infrastructure/outbound/persistence/typeorm/vaccine-batch.orm-entity';

/**
 * Module that wires the ports and adapters of the "Vaccine Cold Chain
 * Monitoring" domain.
 *
 * This is the only place where concrete implementations are chosen: swapping
 * the database or the storage means only changing the binding below, without
 * touching any domain or use case code.
 */
@Module({
  imports: [TypeOrmModule.forFeature([VaccineBatchOrmEntity])],
  controllers: [VaccineBatchController],
  providers: [
    // Output ports (driven)
    { provide: VACCINE_BATCH_REPOSITORY, useClass: VaccineBatchTypeOrmAdapter },
    { provide: DOCUMENT_STORAGE, useClass: S3StorageAdapter },
    // Input ports (driving)
    { provide: CREATE_BATCH_USE_CASE, useClass: CreateBatchService },
    { provide: RECORD_TELEMETRY_USE_CASE, useClass: RecordTelemetryService },
  ],
  exports: [VACCINE_BATCH_REPOSITORY, DOCUMENT_STORAGE],
})
export class VaccineTrackerModule {}
