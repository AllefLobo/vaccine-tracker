import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { VaccineBatch } from '../../domain/vaccine-batch.entity';
import type { CreateBatchCommand } from '../ports/in/create-batch.use-case';
import type { CreateBatchUseCase } from '../ports/in/create-batch.use-case';
import type { VaccineBatchRepositoryPort } from '../ports/out/vaccine-batch.repository.port';
import { VACCINE_BATCH_REPOSITORY } from '../tokens';

/**
 * Implementation of the create-batch use case.
 *
 * Note: it depends only on the `VaccineBatchRepositoryPort`, never on the
 * concrete adapter — the implementation is injected by NestJS in the module.
 */
@Injectable()
export class CreateBatchService implements CreateBatchUseCase {
  public constructor(
    @Inject(VACCINE_BATCH_REPOSITORY)
    private readonly repository: VaccineBatchRepositoryPort,
  ) {}

  public async execute(command: CreateBatchCommand): Promise<VaccineBatch> {
    const batch = new VaccineBatch(randomUUID(), command.type);

    for (const temperature of command.initialTemperatures ?? []) {
      batch.recordTemperature(temperature);
    }

    return this.repository.save(batch);
  }
}
