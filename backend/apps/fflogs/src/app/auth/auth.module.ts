import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth/auth.service';
import { FFLogsStrategy } from './fflogs.strategy';
import { DatabaseModule } from '../database/database.module';
import { DatabaseService } from '../database/database.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Logs, LogsSchema } from '../database/schemas/logs.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Logs.name, schema: LogsSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, FFLogsStrategy, DatabaseService],
})
export class AuthModule {}
