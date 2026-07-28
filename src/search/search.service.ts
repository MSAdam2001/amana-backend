import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArtisanProfile, ArtisanProfileDocument } from '../profiles/schemas/artisan-profile.schema';
import { SearchArtisansDto } from './dto/search-artisans.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(ArtisanProfile.name)
    private artisanProfileModel: Model<ArtisanProfileDocument>,
  ) {}

  async searchArtisans(dto: SearchArtisansDto) {
    const radiusMeters = (dto.radiusKm ?? 10) * 1000;

    const matchStage: Record<string, any> = {};
    if (dto.category) {
      matchStage.tradeCategory = dto.category;
    }

    const results = await this.artisanProfileModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [dto.longitude, dto.latitude],
          },
          distanceField: 'distanceMeters',
          maxDistance: radiusMeters,
          spherical: true,
          query: matchStage,
        },
      },
      {
        $addFields: {
          rankingScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$ratingAvg', 0] }, 10] },
              { $multiply: [{ $divide: [1, { $add: ['$distanceMeters', 1] }] }, 1000] },
            ],
          },
        },
      },
      { $sort: { rankingScore: -1 } },
      { $limit: 20 },
    ]);

    return results;
  }
}