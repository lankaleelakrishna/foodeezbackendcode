import { IsArray, IsEmail, IsLatitude, IsLongitude, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  fssaiNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  onboardingStep?: number;

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  @IsString()
  brandDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineTags?: string[];

  @IsOptional()
  serviceRadiusKm?: number;

  @IsOptional()
  @IsArray()
  deliveryZones?: any[];

  @IsOptional()
  @IsArray()
  storePhotos?: string[];

  @IsOptional()
  temporaryClosure?: boolean;

  @IsOptional()
  holidayMode?: boolean;

  @IsOptional()
  gstExpiryDate?: Date;

  @IsOptional()
  fssaiExpiryDate?: Date;

  @IsOptional()
  @IsString()
  leadStatus?: string;
}
