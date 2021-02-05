import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Logs, LogsDocument } from './schemas/logs.schema';
import { CreateLogsDTO } from './dto/create-logs.dto';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(Logs.name) private readonly logsModel: Model<LogsDocument>
  ) {}

  async create(createLogDTO: CreateLogsDTO): Promise<Logs> {
    const newLog = new this.logsModel(createLogDTO);
    return newLog.save();
  }

  async getAll() {
    return this.logsModel.find();
  }

  async getIDs(id) {
    return this.logsModel.find({ logID: id });
  }

  async checkID(id) {
    return this.logsModel.exists({ logID: `${id}`});
  }

  async clearAll() {
    return this.logsModel.remove({});
  }
}
