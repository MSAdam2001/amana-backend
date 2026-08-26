import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './schemas/booking.schema';
import { ArtisanProfile } from '../profiles/schemas/artisan-profile.schema';

describe('BookingsService', () => {
  let service: BookingsService;
  let mockBookingModel: any;
  let mockArtisanProfileModel: any;

  const customerId = '6a68724cce7a3efdfed681c7';
  const artisanUserId = '6a8d7db9a5152474967d6c42';
  const artisanProfileId = '6a8def39a5152474967d6c43';
  const bookingId = '6a6a57e08cc1d9d0663bb084';

  beforeEach(async () => {
    mockBookingModel = {
      findById: jest.fn(),
    };
    mockArtisanProfileModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getModelToken(Booking.name), useValue: mockBookingModel },
        { provide: getModelToken(ArtisanProfile.name), useValue: mockArtisanProfileModel },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStatus', () => {
    function buildMockBooking(status: BookingStatus) {
      return {
        _id: bookingId,
        customerId: { toString: () => customerId },
        artisanProfileId,
        status,
        save: jest.fn().mockResolvedValue(true),
      };
    }

    it('allows a valid transition: requested -> accepted (by the artisan)', async () => {
      const booking = buildMockBooking(BookingStatus.REQUESTED);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      await service.updateStatus(bookingId, artisanUserId, { status: BookingStatus.ACCEPTED } as any);

      expect(booking.status).toBe(BookingStatus.ACCEPTED);
      expect(booking.save).toHaveBeenCalled();
    });

    it('rejects an invalid transition: requested -> completed (skipping steps)', async () => {
      const booking = buildMockBooking(BookingStatus.REQUESTED);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      await expect(
        service.updateStatus(bookingId, artisanUserId, { status: BookingStatus.COMPLETED } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a backward transition: completed -> requested', async () => {
      const booking = buildMockBooking(BookingStatus.COMPLETED);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      await expect(
        service.updateStatus(bookingId, artisanUserId, { status: BookingStatus.REQUESTED } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects the update if the requester is neither the customer nor the artisan', async () => {
      const booking = buildMockBooking(BookingStatus.REQUESTED);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      const randomStrangerId = '000000000000000000000000';

      await expect(
        service.updateStatus(bookingId, randomStrangerId, { status: BookingStatus.ACCEPTED } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if the booking does not exist', async () => {
      mockBookingModel.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(bookingId, artisanUserId, { status: BookingStatus.ACCEPTED } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('sets completedAt when a booking is marked completed', async () => {
      const booking: any = buildMockBooking(BookingStatus.IN_PROGRESS);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      await service.updateStatus(bookingId, artisanUserId, { status: BookingStatus.COMPLETED } as any);

      expect(booking.status).toBe(BookingStatus.COMPLETED);
      expect(booking.completedAt).toBeInstanceOf(Date);
    });

    it('sets cancelledAt and cancellationReason when a booking is cancelled', async () => {
      const booking: any = buildMockBooking(BookingStatus.REQUESTED);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      await service.updateStatus(bookingId, artisanUserId, {
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Customer unavailable',
      } as any);

      expect(booking.status).toBe(BookingStatus.CANCELLED);
      expect(booking.cancelledAt).toBeInstanceOf(Date);
      expect(booking.cancellationReason).toBe('Customer unavailable');
    });

    it('allows the customer (not just the artisan) to cancel a requested booking', async () => {
      const booking = buildMockBooking(BookingStatus.REQUESTED);
      mockBookingModel.findById.mockResolvedValue(booking);
      mockArtisanProfileModel.findById.mockResolvedValue({
        userId: { toString: () => artisanUserId },
      });

      await service.updateStatus(bookingId, customerId, { status: BookingStatus.CANCELLED } as any);

      expect(booking.status).toBe(BookingStatus.CANCELLED);
    });
  });
});