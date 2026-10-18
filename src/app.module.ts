import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VaccineTrackerModule } from './vaccine-tracker/vaccine-tracker.module';

/** Builds the TypeORM connection options from environment variables. */
export function buildTypeOrmConfig(
  config: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
    username: config.get<string>('DB_USERNAME', 'postgres'),
    password: config.get<string>('DB_PASSWORD', 'postgres'),
    database: config.get<string>('DB_DATABASE', 'vaccine_tracker'),
    autoLoadEntities: true,
    // In production, use false + migrations (never synchronize).
    synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmConfig,
    }),
    VaccineTrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
