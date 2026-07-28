import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerProfileDocument = CustomerProfile & Document;

@Schema({ timestamps: true })
export class CustomerProfile {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  userId: Types.ObjectId;

  @Prop({ default: [] })
  savedAddresses: string[];
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);