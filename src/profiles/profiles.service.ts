import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ArtisanProfile, ArtisanProfileDocument } from './schemas/artisan-profile.schema';
import { CustomerProfile, CustomerProfileDocument } from './schemas/customer-profile.schema';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateArtisanProfileDto } from './dto/update-artisan-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(ArtisanProfile.name)
    private artisanProfileModel: Model<ArtisanProfileDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async createArtisanProfile(userId: string, dto: CreateArtisanProfileDto) {
    const existingProfile = await this.artisanProfileModel.findOne({ userId: new Types.ObjectId(userId) });
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

  async createCustomerProfile(userId: string, dto: CreateCustomerProfileDto) {
    const existingProfile = await this.customerProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (existingProfile) {
      throw new ConflictException('A customer profile already exists for this user');
    }

    const newProfile = new this.customerProfileModel({
      userId: new Types.ObjectId(userId),
      savedAddresses: dto.savedAddresses ?? [],
    });

    return newProfile.save();
  }

  async getArtisanProfileById(id: string) {
    const profile = await this.artisanProfileModel.findById(id);
    if (!profile) {
      throw new NotFoundException('Artisan profile not found');
    }
    return profile;
  }

  async getMyArtisanProfile(userId: string) {
    const profile = await this.artisanProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!profile) {
      throw new NotFoundException('Artisan profile not found for this user');
    }
    return profile;
  }

  async updateMyArtisanProfile(userId: string, dto: UpdateArtisanProfileDto) {
    const profile = await this.artisanProfileModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!profile) {
      throw new NotFoundException('Artisan profile not found for this user');
    }

    if (dto.skills !== undefined) profile.skills = dto.skills;
    if (dto.yearsExperience !== undefined) profile.yearsExperience = dto.yearsExperience;
    if (dto.portfolioPhotos !== undefined) profile.portfolioPhotos = dto.portfolioPhotos;
    if (dto.bio !== undefined) profile.bio = dto.bio;

    return profile.save();
  }
}