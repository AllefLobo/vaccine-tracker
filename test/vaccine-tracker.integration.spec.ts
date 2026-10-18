import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { VaccineBatchStatus } from '../src/vaccine-tracker/core/domain/vaccine-batch-status.enum';
import { VaccineBatchOrmEntity } from '../src/vaccine-tracker/infrastructure/outbound/persistence/typeorm/vaccine-batch.orm-entity';

describe('Vaccine Tracker (integration)', () => {
  let app: INestApplication;

  const repository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const dataSource = {
    entityMetadatas: [{ target: VaccineBatchOrmEntity }],
    options: { type: 'postgres' },
    getRepository: () => repository,
    destroy: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue(dataSource)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns the API metadata', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ name: 'Vaccine Tracker API', version: '1.0', docs: '/api' });
  });

  it('GET /health returns ok', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('POST /batches creates a batch', async () => {
    repository.save.mockImplementation(async (entity) => entity);

    const res = await request(app.getHttpServer())
      .post('/batches')
      .send({ type: 'VACCINE_1', initialTemperatures: [-18.5] })
      .expect(201);

    expect(res.body).toMatchObject({
      type: 'VACCINE_1',
      status: VaccineBatchStatus.SAFE,
    });
    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.temperatures).toHaveLength(1);
    expect(res.body.temperatures[0].value).toBe(-18.5);
  });

  it('POST /batches rejects an invalid body', async () => {
    await request(app.getHttpServer())
      .post('/batches')
      .send({ type: '' })
      .expect(400);
  });

  it('POST /batches/:id/telemetry records telemetry', async () => {
    const orm = new VaccineBatchOrmEntity();
    orm.id = 'batch-1';
    orm.type = 'VACCINE_1';
    orm.status = VaccineBatchStatus.SAFE;
    orm.temperatures = [];
    repository.findOne.mockResolvedValue(orm);
    repository.save.mockImplementation(async (entity) => entity);

    const res = await request(app.getHttpServer())
      .post('/batches/batch-1/telemetry')
      .send({ temperature: -10 })
      .expect(201);

    expect(res.body).toMatchObject({
      id: 'batch-1',
      type: 'VACCINE_1',
      status: VaccineBatchStatus.COMPROMISED,
    });
    expect(res.body.temperatures).toHaveLength(1);
    expect(res.body.temperatures[0].value).toBe(-10);
  });
});
