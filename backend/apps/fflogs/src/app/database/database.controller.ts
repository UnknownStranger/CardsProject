import { Controller, Get, Param } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('/db')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('/getall')
  async returnLogs(){
    return this.databaseService.getAll();
  }
  @Get('/id/:id')
  async returnIDs(@Param() params){
    return this.databaseService.getIDs(params.id);
  }

  @Get('/checkid/:id')
  async checkID(@Param() params){
    console.log(this.databaseService.checkID(params.id));
    return this.databaseService.checkID(params.id);
  }
}
