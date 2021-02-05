
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventsDocument = Events & Document;

@Schema()
export class Events{
  @Prop()
  sourceID: number;
  @Prop()
  targetID: number; 
  @Prop()
  abilityID: number;
}

export const EventsSchema = SchemaFactory.createForClass(Events);