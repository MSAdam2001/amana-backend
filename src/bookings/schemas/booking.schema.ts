import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'ArtisanProfile' })
  artisanProfileId: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: BookingStatus,
    default: BookingStatus.REQUESTED,
  })
  status: BookingStatus;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);