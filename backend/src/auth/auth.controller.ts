import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const tokens = await this.authService.register(
      dto.email,
      dto.password,
      dto.displayName,
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.json({
      statusCode: 201,
      message: 'Registration successful',
      data: { accessToken: tokens.accessToken },
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.login(req.user as any);
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.json({
      statusCode: 200,
      message: 'Login successful',
      data: { accessToken: tokens.accessToken },
    });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const tokens = await this.authService.refresh(
      user.id,
      user.email,
      user.refreshToken,
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.json({
      statusCode: 200,
      message: 'Token refreshed',
      data: { accessToken: tokens.accessToken },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token');
    return res.json({
      statusCode: 200,
      message: 'Logged out',
      data: null,
    });
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // Initiates Google OAuth flow
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.googleLogin(req.user as any);
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.redirect(
      `http://localhost:3000/app?token=${tokens.accessToken}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    const user = req.user as any;
    const profile = await this.authService.getMe(user.id);
    return {
      statusCode: 200,
      message: 'Success',
      data: profile,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
