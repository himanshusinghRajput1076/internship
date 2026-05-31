import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JwtStrategy validates incoming Bearer tokens.
 * The payload we signed in AuthService.login() is decoded here
 * and attached to request.user for use in controllers.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    // This becomes req.user in every authenticated route
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
