import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { GroupLetter } from '@wc2026/shared-types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { SaveGroupResultsDto, SimulateGroupDto } from './dto/save-results.dto';
import { GroupsService } from './groups.service';

const GROUP_PARAM = 'A|B|C|D|E|F|G|H|I|J|K|L';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar grupos con fixtures de referencia' })
  getAll() {
    return this.groupsService.getAllGroups();
  }

  @Post('results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar resultados de un grupo en una predicción' })
  saveResults(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveGroupResultsDto,
  ) {
    return this.groupsService.saveResults(user.userId, dto);
  }

  @Post('simulate-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simular todos los grupos' })
  simulateAll(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SimulateGroupDto,
  ) {
    return this.groupsService.simulateAllGroups(user.userId, dto.predictionId);
  }

  @Post(':letter/simulate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simular un grupo' })
  simulateOne(
    @Param('letter') letter: GroupLetter,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SimulateGroupDto,
  ) {
    return this.groupsService.simulateOne(letter, user.userId, dto.predictionId);
  }
}
