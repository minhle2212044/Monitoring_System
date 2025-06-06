import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Headers,
  Post,
  Patch,
  Req,
  Query,
  ForbiddenException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto, RefreshTokenDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signin(dto);
    }

    @Post('signin')
    async signout(@Body('userId') userId: number) {
        return this.authService.signout(userId);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh-token')
    async refreshToken(@Body() dto: RefreshTokenDto) {
      return await this.authService.refreshToken(dto.id, dto.email)
    }

    @Post('resign-access-token')
    async reSignAccessToken(@Query('refresh_token') refresh_token: string) {
      return await this.authService.reSignAccessToken(refresh_token)
    }

    @HttpCode(HttpStatus.OK)
    @Post('verify-token')
    verifyTokenFromHeader(@Headers('authorization') authHeader: string) {
        const token = authHeader?.split(' ')[1];
        if (!token) {
        throw new ForbiddenException('No token provided');
        }

        return this.authService.verifyToken(token);
    }

}
