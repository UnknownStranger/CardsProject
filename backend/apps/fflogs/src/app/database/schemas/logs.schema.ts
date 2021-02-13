
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {Actors} from './actors.schema';
import {Events} from './events.schema';

export type LogsDocument = Logs & Document;

@Schema()
export class Logs {
  @Prop()
  user: number;

  @Prop()
  date: Date;

  @Prop()
  logID: string;

  @Prop()
  actors: [Actors];

  @Prop()
  events: [Events];
}

export const LogsSchema = SchemaFactory.createForClass(Logs);