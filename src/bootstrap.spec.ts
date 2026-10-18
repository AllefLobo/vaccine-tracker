import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { bootstrap } from './bootstrap';

jest.mock('@nestjs/core', () => {
  const actual = jest.requireActual('@nestjs/core');
  return {
    ...actual,
    NestFactory: {
      ...actual.NestFactory,
      create: jest.fn(),
    },
  };
});

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');
  return {
    ...actual,
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addTag: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    })),
    SwaggerModule: {
      ...actual.SwaggerModule,
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  };
});

describe('bootstrap', () => {
  it('creates the app, applies validation, sets up Swagger and listens', async () => {
    delete process.env.PORT; // ensure the default port is used

    const listen = jest.fn().mockResolvedValue(undefined);
    const useGlobalPipes = jest.fn();
    const app = { useGlobalPipes, listen };
    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(useGlobalPipes).toHaveBeenCalledTimes(1);
    expect(SwaggerModule.createDocument).toHaveBeenCalledTimes(1);
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      app,
      expect.anything(),
      expect.anything(),
    );
    expect(listen).toHaveBeenCalledWith(3000);
  });
});
