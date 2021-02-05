import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy} from 'passport-oauth2';

@Injectable()
export class FFLogsStrategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor() {
    super({
      authorizationURL: 'https://www.fflogs.com/oauth/authorize',
      tokenURL: 'https://www.fflogs.com/oauth/token',
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    });
  }

  async validate(accessToken: string){
    return accessToken;
  }
}
