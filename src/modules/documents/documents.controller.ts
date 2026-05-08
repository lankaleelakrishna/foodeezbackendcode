import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants/:restaurantId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles(UserRole.RestaurantAdmin, UserRole.SalesOperator, UserRole.SuperAdmin)
  async upload(@Param('restaurantId') restaurantId: string, @Body() payload: UploadDocumentDto) {
    return this.documentsService.upload(restaurantId, payload);
  }

  @Get()
  @Roles(UserRole.RestaurantAdmin, UserRole.SalesOperator, UserRole.SuperAdmin)
  async list(@Param('restaurantId') restaurantId: string) {
    return this.documentsService.findByRestaurant(restaurantId);
  }
}
