import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService, type AppInfo } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API metadata' })
  @ApiOkResponse({
    description: 'Returns the API name, version and docs URL',
  })
  public getInfo(): AppInfo {
    return this.appService.getInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'Service is up and running' })
  public getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
