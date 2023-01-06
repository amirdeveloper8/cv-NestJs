import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.intercept';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ApproveChangeDto } from './dtos/approve-change.dto';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { ReportDto } from './dtos/report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  approveChange(@Param('id') id: string, @Body() body: ApproveChangeDto) {
    return this.reportsService.changeApproval(parseInt(id), body.approved);
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const report = await this.reportsService.findOne(parseInt(id));
    if (!report) {
      throw new NotFoundException('report not found!');
    }

    return report;
  }

  @Get()
  getEstimates(@Query() query: GetEstimateDto) {
    return this.reportsService.getEstimates(query);
  }
}
