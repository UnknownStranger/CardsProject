import { Module } from '@nestjs/common';

import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Logs, LogsSchema } from './schemas/logs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logs.name, schema: LogsSchema }]),
    MongooseModule.forRoot('mongodb://localhost/fflogs', {
      useNewUrlParser: true,
    }),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
