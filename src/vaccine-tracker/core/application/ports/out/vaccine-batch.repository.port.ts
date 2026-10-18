import type { VaccineBatch } from '../../../domain/vaccine-batch.entity';

/**
 * Output (driven) port for batch persistence.
 *
 * The infrastructure (TypeORM, Mongo, etc.) is what implements this interface.
 * The domain and the use cases depend ONLY on this abstraction, never on the
 * concrete implementation — this is the dependency inversion of the hexagonal
 * architecture.
 */
export interface VaccineBatchRepositoryPort {
  save(batch: VaccineBatch): Promise<VaccineBatch>;
  findById(id: string): Promise<VaccineBatch | null>;
}
