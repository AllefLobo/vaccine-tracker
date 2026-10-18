import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API info', () => {
      expect(appController.getInfo()).toEqual({
        name: 'Vaccine Tracker API',
        version: '1.0',
        docs: '/api',
      });
    });

    it('should return the health status', () => {
      expect(appController.getHealth()).toEqual({ status: 'ok' });
    });
  });
});
