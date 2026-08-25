import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { ArtisanProfile, ArtisanProfileDocument } from '../profiles/schemas/artisan-profile.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.REQUESTED]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
  [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(ArtisanProfile.name) private artisanProfileModel: Model<ArtisanProfileDocument>,
  ) {}

  async createBooking(customerId: string, dto: CreateBookingDto) {
    const artisanProfile = await this.artisanProfileModel.findById(dto.artisanProfileId);
    if (!artisanProfile) {
      throw new NotFoundException('Artisan profile not found');
    }

    const newBooking = new this.bookingModel({
      customerId: new Types.ObjectId(customerId),
      artisanProfileId: new Types.ObjectId(dto.artisanProfileId),
      description: dto.description,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      status: BookingStatus.REQUESTED,
    });

    return newBooking.save();
  }

  async updateStatus(bookingId: string, requestingUserId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const artisanProfile = await this.artisanProfileModel.findById(booking.artisanProfileId);
    const isCustomer = booking.customerId.toString() === requestingUserId;
    const isArtisan = artisanProfile?.userId.toString() === requestingUserId;

    if (!isCustomer && !isArtisan) {
      throw new ForbiddenException('You are not part of this booking');
    }

    const allowedNextStates = ALLOWED_TRANSITIONS[booking.status];
    if (!allowedNextStates.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition booking from '${booking.status}' to '${dto.status}'`,
      );
    }

    booking.status = dto.status;

    if (dto.status === BookingStatus.COMPLETED) {
      booking.completedAt = new Date();
    }
    if (dto.status === BookingStatus.CANCELLED) {
      booking.cancelledAt = new Date();
      booking.cancellationReason = dto.cancellationReason;
    }

    return booking.save();
  }

  async getBookingsForUser(userId: string, role: 'customer' | 'artisan') {
    if (role === 'customer') {
      return this.bookingModel
        .find({ customerId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 });
    }

    const artisanProfile = await this.artisanProfileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!artisanProfile) {
      return [];
    }

    return this.bookingModel
      .find({ artisanProfileId: artisanProfile._id })
      .sort({ createdAt: -1 });
  }
}