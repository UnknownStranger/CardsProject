import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private token: string;

  getData(): { message: string } {
    return { message: "Welcome to Carter's Cards" };
  }

  setToken(t: string) {
    this.token = t;
  }

  getToken() {
    return this.token;
  }
}
