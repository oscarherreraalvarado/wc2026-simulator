import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Estado del servicio' })
  root() {
    return {
      service: 'WC2026 Simulator API',
      status: 'ok',
      docs: '/docs',
      groups: '/groups',
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok' };
  }
}
