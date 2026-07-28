import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ArtisanProfile, ArtisanProfileSchema } from '../profiles/schemas/artisan-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ArtisanProfile.name, schema: ArtisanProfileSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}