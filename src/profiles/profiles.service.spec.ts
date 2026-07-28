import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ArtisanProfile, ArtisanProfileDocument } from './schemas/artisan-profile.schema';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(ArtisanProfile.name)
    private artisanProfileModel: Model<ArtisanProfileDocument>,
  ) {}

  async createArtisanProfile(userId: string, dto: CreateArtisanProfileDto) {
    const existingProfile = await this.artisanProfileModel.findOne({ userId });
    if (existingProfile) {
      throw new ConflictException('An artisan profile already exists for this user');
    }

    const newProfile = new this.artisanProfileModel({
      userId: new Types.ObjectId(userId),
      tradeCategory: dto.tradeCategory,
      skills: dto.skills ?? [],
      yearsExperience: dto.yearsExperience ?? 0,
      serviceRadiusKm: dto.serviceRadiusKm ?? 5,
      location: {
        type: 'Point',
        coordinates: [dto.longitude, dto.latitude],
      },
    });

    return newProfile.save();
  }
}