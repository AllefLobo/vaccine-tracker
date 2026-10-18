/**
 * Dependency injection tokens.
 *
 * Since TypeScript interfaces are erased at runtime, we use `Symbol` to bind
 * ports (abstractions) to their concrete adapters in the NestJS module.
 */
export const VACCINE_BATCH_REPOSITORY = Symbol('VACCINE_BATCH_REPOSITORY');
export const DOCUMENT_STORAGE = Symbol('DOCUMENT_STORAGE');
export const CREATE_BATCH_USE_CASE = Symbol('CREATE_BATCH_USE_CASE');
export const RECORD_TELEMETRY_USE_CASE = Symbol('RECORD_TELEMETRY_USE_CASE');
