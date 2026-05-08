import { Body, Controller, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { CreateRestaurantUserDto } from './dto/create-restaurant-user.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @Roles(UserRole.SalesOperator, UserRole.SuperAdmin)
  create(@Body() payload: CreateRestaurantDto) {
    return this.restaurantsService.create(payload);
  }

  @Get()
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @Get(':id/onboarding')
  getOnboardingStatus(@Param('id') id: string) {
    return this.restaurantsService.getOnboardingStatus(id);
  }

  @Get(':id/users')
  @Roles(UserRole.RestaurantAdmin, UserRole.SalesOperator, UserRole.SuperAdmin)
  getUsers(@Param('id') id: string) {
    return this.restaurantsService.findUsersByRestaurant(id);
  }

  @Patch(':id/onboarding-step')
  @Roles(UserRole.RestaurantAdmin, UserRole.SuperAdmin)
  advanceOnboardingStep(@Param('id') id: string, @Body('step') step: number) {
    return this.restaurantsService.advanceOnboardingStep(id, step);
  }

  @Post(':id/users')
  @Roles(UserRole.RestaurantAdmin, UserRole.SalesOperator, UserRole.SuperAdmin)
  createUser(@Param('id') restaurantId: string, @Body() payload: CreateRestaurantUserDto) {
    return this.restaurantsService.createRestaurantUser(restaurantId, payload);
  }

  @Patch(':id')
  @Roles(UserRole.RestaurantAdmin, UserRole.SuperAdmin)
  update(@Param('id') id: string, @Body() payload: UpdateRestaurantDto) {
    return this.restaurantsService.update(id, payload);
  }
}
