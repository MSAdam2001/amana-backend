import { Controller, Post, Patch, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateArtisanProfileDto } from './dto/update-artisan-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @UseGuards(JwtAuthGuard)
  @Get('artisan/me')
  getMyArtisanProfile(@Request() req) {
    return this.profilesService.getMyArtisanProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('artisan/pending')
  getPendingArtisanProfiles() {
    return this.profilesService.getPendingArtisanProfiles();
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('artisan/:id/verify')
  setArtisanVerificationStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.profilesService.setArtisanVerificationStatus(id, status);
  }
}