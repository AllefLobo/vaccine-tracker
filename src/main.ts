import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Logger configured to emit structured JSON (one log line = one JSON
  // document with `level`, `message`, `context`, `timestamp`, etc.).
  // This simplifies ingestion and querying in AWS CloudWatch Logs, allowing
  // filters/Insights by structured fields instead of plain text.
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ json: true }),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // OpenAPI documentation (Swagger). Available at /api and /api-json.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vaccine Tracker API')
    .setDescription(
      'Tracking of vaccine batches and cold-chain temperature telemetry.',
    )
    .setVersion('1.0')
    .addTag('batches', 'Operations on vaccine batches')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Vaccine Tracker API',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  new Logger('Bootstrap').log(
    `Application running at: http://localhost:${port} (docs: http://localhost:${port}/api)`,
  );
}
void bootstrap();
