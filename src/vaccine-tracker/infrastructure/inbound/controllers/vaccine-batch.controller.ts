import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { CreateBatchUseCase } from '../../../core/application/ports/in/create-batch.use-case';
import type { RecordTelemetryUseCase } from '../../../core/application/ports/in/record-telemetry.use-case';
import {
  CREATE_BATCH_USE_CASE,
  RECORD_TELEMETRY_USE_CASE,
} from '../../../core/application/tokens';
import { CreateBatchDto } from './dto/create-batch.dto';
import { RecordTelemetryDto } from './dto/record-telemetry.dto';
import { VaccineBatchResponseDto } from './dto/vaccine-batch.response.dto';

/**
 * Input (driving) adapter — exposes the use cases over HTTP/REST.
 */
@ApiTags('batches')
@Controller('batches')
export class VaccineBatchController {
  public constructor(
    @Inject(CREATE_BATCH_USE_CASE)
    private readonly createBatchUseCase: CreateBatchUseCase,
    @Inject(RECORD_TELEMETRY_USE_CASE)
    private readonly recordTelemetryUseCase: RecordTelemetryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creates a new vaccine batch' })
  @ApiCreatedResponse({
    description: 'Batch created successfully',
    type: VaccineBatchResponseDto,
  })
  public create(@Body() dto: CreateBatchDto) {
    return this.createBatchUseCase.execute({
      type: dto.type,
      initialTemperatures: dto.initialTemperatures,
    });
  }

  @Post(':id/telemetry')
  @ApiOperation({
    summary: 'Records a temperature reading on an existing batch',
  })
  @ApiParam({ name: 'id', description: 'Batch UUID', example: '5f2c1c8b-9a3a-4b1e-8c3d-1a2b3c4d5e6f' })
  @ApiOkResponse({
    description: 'Telemetry recorded successfully',
    type: VaccineBatchResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Batch not found' })
  public recordTelemetry(
    @Param('id') id: string,
    @Body() dto: RecordTelemetryDto,
  ) {
    return this.recordTelemetryUseCase.execute({
      batchId: id,
      temperature: dto.temperature,
    });
  }
}
