import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { ArtisanProfile, ArtisanProfileSchema } from './schemas/artisan-profile.schema';
import { CustomerProfile, CustomerProfileSchema } from './schemas/customer-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ArtisanProfile.name, schema: ArtisanProfileSchema },
      { name: CustomerProfile.name, schema: CustomerProfileSchema },
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}