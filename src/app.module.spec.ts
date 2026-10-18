import { ConfigService } from '@nestjs/config';
import { buildTypeOrmConfig } from './app.module';

describe('buildTypeOrmConfig', () => {
  it('maps environment variables to the database config', () => {
    const config = new ConfigService({
      DB_HOST: 'db.example.com',
      DB_PORT: '5433',
      DB_USERNAME: 'dbuser',
      DB_PASSWORD: 'secret',
      DB_DATABASE: 'mydb',
      DB_SYNCHRONIZE: 'true',
    });

    const result = buildTypeOrmConfig(config);

    expect(result).toMatchObject({
      type: 'postgres',
      host: 'db.example.com',
      port: 5433,
      username: 'dbuser',
      password: 'secret',
      database: 'mydb',
      autoLoadEntities: true,
      synchronize: true,
    });
  });

  it('falls back to defaults and keeps synchronize disabled', () => {
    const config = new ConfigService({});
    config.skipProcessEnv = true;

    const result = buildTypeOrmConfig(config);

    expect(result.host).toBe('localhost');
    expect(result.port).toBe(5432);
    expect(result.username).toBe('postgres');
    expect(result.database).toBe('vaccine_tracker');
    expect(result.synchronize).toBe(false);
  });

  it('enables synchronize only when the flag is exactly "true"', () => {
    const enabled = new ConfigService({ DB_SYNCHRONIZE: 'true' });
    const disabled = new ConfigService({ DB_SYNCHRONIZE: 'false' });

    expect(buildTypeOrmConfig(enabled).synchronize).toBe(true);
    expect(buildTypeOrmConfig(disabled).synchronize).toBe(false);
  });
});
