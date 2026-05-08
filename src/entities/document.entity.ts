import { randomUUID } from 'crypto';
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { RestaurantEntity } from './restaurant.entity';

export enum DocumentType {
  FSSAI = 'FSSAI',
  GST = 'GST',
  BANK = 'BANK',
}

@Entity({ name: 'Document' })
export class DocumentEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @BeforeInsert()
  beforeInsert() {
    if (!this.id) this.id = randomUUID();
    if (!this.uploadedAt) this.uploadedAt = new Date();
  }

  @ManyToOne(() => RestaurantEntity, { nullable: false })
  restaurant: RestaurantEntity;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column()
  filename: string;

  @Column({ default: 'uploaded' })
  status: string;

  @Column({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;
}
