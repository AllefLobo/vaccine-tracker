import { Injectable } from '@nestjs/common';

/** Metadata exposed at the root route (`/`). */
export interface AppInfo {
  name: string;
  version: string;
  docs: string;
}

@Injectable()
export class AppService {
  public getInfo(): AppInfo {
    return {
      name: 'Vaccine Tracker API',
      version: '1.0',
      docs: '/api',
    };
  }

  public getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
