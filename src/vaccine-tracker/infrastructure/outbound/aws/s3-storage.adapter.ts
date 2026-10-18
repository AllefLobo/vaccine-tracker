import { Injectable, Logger } from '@nestjs/common';
import type { DocumentStoragePort } from '../../../core/application/ports/out/document-storage.port';

/**
 * Output (driven) adapter for AWS S3.
 *
 * MOCKED implementation: it only logs the operation, demonstrating the
 * readiness for AWS integration. In production, it would call the AWS SDK v3:
 *
 *   const command = new PutObjectCommand({
 *     Bucket: process.env.AWS_S3_BUCKET,
 *     Key: key,
 *     Body: body,
 *   });
 *   await this.s3Client.send(command);
 */
@Injectable()
export class S3StorageAdapter implements DocumentStoragePort {
  private readonly logger = new Logger(S3StorageAdapter.name);

  public async upload(key: string, body: Buffer): Promise<void> {
    this.logger.log(`[mock] S3 upload -> key=${key}, bytes=${body.length}`);
  }
}
