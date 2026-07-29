import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { ArtisanProfile, ArtisanProfileDocument } from '../profiles/schemas/artisan-profile.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(ArtisanProfile.name) private artisanProfileModel: Model<ArtisanProfileDocument>,
  ) {}

  async createReview(customerId: string, dto: CreateReviewDto) {
    const booking = await this.bookingModel.findById(dto.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customerId.toString() !== customerId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review a completed booking');
    }

    const existingReview = await this.reviewModel.findOne({ bookingId: booking._id });
    if (existingReview) {
      throw new ConflictException('This booking has already been reviewed');
    }

    const newReview = new this.reviewModel({
      bookingId: booking._id,
      artisanProfileId: booking.artisanProfileId,
      customerId: booking.customerId,
      rating: dto.rating,
      comment: dto.comment,
    });

    const savedReview = await newReview.save();

    await this.updateArtisanRatingAggregate(booking.artisanProfileId.toString());

    return savedReview;
  }

  private async updateArtisanRatingAggregate(artisanProfileId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { artisanProfileId: (await this.artisanProfileModel.findById(artisanProfileId))?._id } },
      {
        $group: {
          _id: '$artisanProfileId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await this.artisanProfileModel.findByIdAndUpdate(artisanProfileId, {
        ratingAvg: Math.round(stats[0].avgRating * 10) / 10,
        ratingCount: stats[0].count,
      });
    }
  }
}