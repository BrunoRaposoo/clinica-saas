import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FinanceService } from './finance.service';
import {
  CreateChargeDto,
  UpdateChargeDto,
  ChargePaymentDto,
  ListChargesQueryDto,
} from './dto/charge.dto';
import { Charge, ChargeListResponse, FinanceDashboard } from '@clinica-saas/contracts';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Finance')
@Controller('finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard financeiro' })
  async getDashboard(
    @Query('periodFrom') periodFrom?: string,
    @Query('periodTo') periodTo?: string,
    @CurrentUser() user?: any,
  ): Promise<FinanceDashboard> {
    return this.financeService.getDashboard(
      user.organizationId!, 
      periodFrom ? new Date(periodFrom) : undefined,
      periodTo ? new Date(periodTo) : undefined
    );
  }

  @Get('charges')
  @ApiOperation({ summary: 'Listar cobranças' })
  async findAll(
    @Query() query: ListChargesQueryDto,
    @CurrentUser() user: any,
  ): Promise<ChargeListResponse> {
    return this.financeService.findAll(query, user.organizationId!);
  }

  @Get('charges/:id')
  @ApiOperation({ summary: 'Detalhar cobrança' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Charge> {
    return this.financeService.findById(id, user.organizationId!);
  }

  @Post('charges')
  @ApiOperation({ summary: 'Criar cobrança' })
  async create(
    @Body() dto: CreateChargeDto,
    @CurrentUser() user: any,
  ): Promise<Charge> {
    return this.financeService.create(dto, user.organizationId!, user.id);
  }

  @Patch('charges/:id')
  @ApiOperation({ summary: 'Editar cobrança' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChargeDto,
    @CurrentUser() user: any,
  ): Promise<Charge> {
    return this.financeService.update(id, dto, user.organizationId!, user.id);
  }

  @Post('charges/:id/pay')
  @ApiOperation({ summary: 'Registrar pagamento' })
  async payment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChargePaymentDto,
    @CurrentUser() user: any,
  ): Promise<Charge> {
    return this.financeService.processPayment(id, dto, user.organizationId!, user.id);
  }

  @Delete('charges/:id')
  @ApiOperation({ summary: 'Cancelar cobrança' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.financeService.cancel(id, user.organizationId!, user.id);
  }

  @Post('charges/update-overdue')
  @ApiOperation({ summary: 'Atualizar cobranças vencidas (admin)' })
  async updateOverdue(
    @CurrentUser() user: any,
  ): Promise<{ updated: number }> {
    const count = await this.financeService.updateOverdueCharges();
    return { updated: count };
  }
}