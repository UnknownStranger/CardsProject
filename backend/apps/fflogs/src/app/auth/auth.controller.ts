import { Controller, Get, UseGuards, Res, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  players = [
    "Carter Wy'verian",
    'Spooky Smile',
    'Izaya Yukimura',
    "Pyne A'malus",
    "Mikan A'malus",
    'Unknown Stranger',
    "Syn Wy'verian",
    'Akuma Rayne',
  ];

  @Get('fflogs')
  @UseGuards(AuthGuard('oauth2'))
  login(): void {
    //starts fflogs authentication
  }

  @Get('fflogs/cb')
  @UseGuards(AuthGuard('oauth2'))
  fflogsLoginCallback(@Req() req, @Res() res) {
    this.authService.token = req.user;
    res.redirect('/auth/getlogs');
  }

  @Get('getlogs')
  generateLog() {
    return this.authService.generateLog();
  }
}
