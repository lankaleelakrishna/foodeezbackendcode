import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

const jwtExtractor = (req: any): string | null => {
  if (!req) return null;

  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header === 'string') {
    if (header.startsWith('Bearer ')) {
      return header.slice(7).trim();
    }
    return header.trim();
  }

  if (req.query?.token) return String(req.query.token);
  if (req.body?.token) return String(req.body.token);
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        jwtExtractor,
        ExtractJwt.fromUrlQueryParameter('token'),
        ExtractJwt.fromBodyField('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: { sub: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { restaurant: true },
    });

    return {
      id: user?.id ?? payload.sub,
      role: payload.role,
      restaurant: user?.restaurant ? { id: user.restaurant.id } : null,
    };
  }
}