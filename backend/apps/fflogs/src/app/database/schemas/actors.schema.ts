
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActorsDocument = Actors & Document;

@Schema()
export class Actors{
  @Prop()
  name: string;
  @Prop()
  id: number[];
}

export const ActorsSchema = SchemaFactory.createForClass(Actors);