import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ArtisanProfileDocument = ArtisanProfile & Document;

@Schema({ _id: false })
export class SocialMedia {
  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  facebook: string;

  @Prop({ default: '' })
  tiktok: string;
}

@Schema({ timestamps: true })
export class ArtisanProfile {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  tradeCategory: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: [] })
  skills: string[];

  @Prop({ default: 0 })
  yearsExperience: number;

  @Prop({ default: 5 })
  serviceRadiusKm: number;

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop({ default: [] })
  portfolioPhotos: string[];

  @Prop({ default: false })
  isAvailable: boolean;

  @Prop({ default: 'unverified', enum: ['unverified', 'pending', 'verified'] })
  verificationStatus: string;

  @Prop({ default: 0 })
  ratingAvg: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ type: SocialMedia, default: () => ({}) })
  socialMedia: SocialMedia;
}

export const ArtisanProfileSchema = SchemaFactory.createForClass(ArtisanProfile);
ArtisanProfileSchema.index({ location: '2dsphere' });