import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity, DocumentType } from '../../entities/document.entity';
import { RestaurantEntity } from '../../entities/restaurant.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  async upload(restaurantId: string, payload: UploadDocumentDto) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    const document = this.documentRepository.create({
      restaurant,
      type: payload.type,
      s3Key: payload.s3Key,
      filename: payload.filename,
      status: 'uploaded',
    });
    return this.documentRepository.save(document);
  }

  async findByRestaurant(restaurantId: string) {
    return this.documentRepository.find({ where: { restaurant: { id: restaurantId } } });
  }
}
