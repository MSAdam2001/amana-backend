import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('artisan')
  createArtisanProfile(@Request() req, @Body() dto: CreateArtisanProfileDto) {
    return this.profilesService.createArtisanProfile(req.user.userId, dto);
  }
}