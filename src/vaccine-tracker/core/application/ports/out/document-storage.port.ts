/**
 * Output (driven) port for document storage (e.g. AWS S3).
 *
 * Keeps the use case decoupled from any concrete storage provider.
 */
export interface DocumentStoragePort {
  upload(key: string, body: Buffer): Promise<void>;
}
