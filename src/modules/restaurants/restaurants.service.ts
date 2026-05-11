import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LeadStatus, RestaurantEntity } from '../../entities/restaurant.entity';
import { UserEntity, UserRole } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRestaurantUserDto } from './dto/create-restaurant-user.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async create(payload: CreateRestaurantDto) {
    const duplicate = await this.restaurantRepository.findOne({
      where: [
        { email: payload.email },
        { phone: payload.phone },
        { name: payload.name, address: payload.address },
      ],
    });

    if (duplicate) {
      throw new BadRequestException(
        'A restaurant with the same contact or address already exists.',
      );
    }

    const suspicious = this.detectPotentialFraud(payload);

    const restaurant = this.restaurantRepository.create({
      name: payload.name,
      ownerName: payload.ownerName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zipCode: payload.zipCode,
      latitude: payload.latitude,
      longitude: payload.longitude,
      gstNumber: payload.gstNumber,
      fssaiNumber: payload.fssaiNumber,
      bankName: payload.bankName,
      bankAccountNumber: payload.bankAccountNumber,
      ifscCode: payload.ifscCode,
      leadStatus: suspicious ? LeadStatus.Review : LeadStatus.Registered,
      leadSource: payload.leadSource,
      riskScore: this.calculateRiskScore(payload, suspicious),
      agreementSigned: false,
      agreementMethod: undefined,
      storePhotos: payload.storePhotos,
      brandDescription: payload.brandDescription,
      cuisineTags: payload.cuisineTags,
      serviceRadiusKm: payload.serviceRadiusKm,
      deliveryZones: payload.deliveryZones
        ? JSON.parse(JSON.stringify(payload.deliveryZones))
        : undefined,
      temporaryClosure: payload.temporaryClosure ?? false,
      holidayMode: payload.holidayMode ?? false,
      gstExpiryDate: payload.gstExpiryDate,
      fssaiExpiryDate: payload.fssaiExpiryDate,
      status: suspicious ? 'review' : payload.status || 'pending',
      onboardingStep: 2,
    });

    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    // generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    // create restaurant admin user
    const user = this.userRepository.create({
      displayName: payload.ownerName,
      email: payload.email,
      passwordHash,
      role: UserRole.RestaurantAdmin,
      restaurant: savedRestaurant,
      mustChangePassword: true,
    });

    await this.userRepository.save(user);

    // send credentials email
    await this.notificationsService.sendRestaurantCredentials({
      email: payload.email,
      phone: payload.phone || '',
      password: temporaryPassword,
      restaurantName: payload.name,
    });

    return savedRestaurant;
  }

  private detectPotentialFraud(payload: CreateRestaurantDto) {
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];

    const emailDomain = payload.email.split('@').pop()?.toLowerCase() ?? '';

    const highRisk = freeDomains.includes(emailDomain);

    const missingGeo = !payload.latitude || !payload.longitude;

    return highRisk || missingGeo;
  }

  async createRestaurantUser(
    restaurantId: string,
    payload: CreateRestaurantUserDto,
  ) {
    const restaurant = await this.findOne(restaurantId);

    const existingUser = await this.userRepository.findOne({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    const temporaryPassword =
      payload.password || this.generateTemporaryPassword();

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const user = this.userRepository.create({
      displayName: payload.displayName,
      email: payload.email,
      passwordHash,
      role: payload.role,
      restaurant,
      mustChangePassword: true,
    });

    const savedUser = await this.userRepository.save(user);

    // send credentials email
    await this.notificationsService.sendRestaurantCredentials({
      email: savedUser.email,
      phone: restaurant.phone || '',
      password: temporaryPassword,
      restaurantName: restaurant.name,
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
      displayName: savedUser.displayName,
      restaurantId: restaurant.id,
    };
  }

  async findUsersByRestaurant(restaurantId: string) {
    const restaurant = await this.findOne(restaurantId);

    return this.userRepository.find({
      where: { restaurant: { id: restaurant.id } },
      select: [
        'id',
        'email',
        'role',
        'displayName',
        'isActive',
        'createdAt',
      ],
    });
  }

  async findAll() {
    return this.restaurantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async update(id: string, payload: UpdateRestaurantDto) {
    const restaurant = await this.findOne(id);

    Object.assign(restaurant, payload);

    return this.restaurantRepository.save(restaurant);
  }

  async getOnboardingStatus(id: string) {
    const restaurant = await this.findOne(id);

    return {
      id: restaurant.id,
      status: restaurant.status,
      onboardingStep: restaurant.onboardingStep,
      name: restaurant.name,
      email: restaurant.email,
      phone: restaurant.phone,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      zipCode: restaurant.zipCode,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    };
  }

  async advanceOnboardingStep(id: string, step: number) {
    const restaurant = await this.findOne(id);

    restaurant.onboardingStep = Math.max(restaurant.onboardingStep, step);

    if (restaurant.onboardingStep >= 5) {
      restaurant.status = 'active';
    }

    return this.restaurantRepository.save(restaurant);
  }

  private calculateRiskScore(
    payload: CreateRestaurantDto,
    suspicious: boolean,
  ) {
    let score = 0;

    if (suspicious) score += 0.5;

    if (!payload.latitude || !payload.longitude) score += 0.2;

    if (
      payload.email?.includes('gmail.com') ||
      payload.email?.includes('yahoo.com')
    )
      score += 0.2;

    if (!payload.gstNumber || !payload.fssaiNumber) score += 0.1;

    return Math.min(score, 1);
  }

  private generateTemporaryPassword() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#';

    let password = '';

    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }
}