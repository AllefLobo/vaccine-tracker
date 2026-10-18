import { S3StorageAdapter } from './s3-storage.adapter';

describe('S3StorageAdapter', () => {
  it('resolves without error (mock implementation)', async () => {
    const adapter = new S3StorageAdapter();

    await expect(
      adapter.upload('batches/id-1/telemetry.json', Buffer.from('{}')),
    ).resolves.toBeUndefined();
  });
});
