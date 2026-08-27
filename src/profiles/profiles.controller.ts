import { Controller, Post, Patch, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateArtisanProfileDto } from './dto/update-artisan-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('artisan')
  createArtisanProfile(@Request() req, @Body() dto: CreateArtisanProfileDto) {
    return this.profilesService.createArtisanProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('customer')
  createCustomerProfile(@Request() req, @Body() dto: CreateCustomerProfileDto) {
    return this.profilesService.createCustomerProfile(req.user.userId, dto);
  }

  @Get('artisan/:id')
  getArtisanProfileById(@Param('id') id: string) {
    return this.profilesService.getArtisanProfileById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('artisan/me')
  updateMyArtisanProfile(@Request() req, @Body() dto: UpdateArtisanProfileDto) {
    return this.profilesService.updateMyArtisanProfile(req.user.userId, dto);
  }
}