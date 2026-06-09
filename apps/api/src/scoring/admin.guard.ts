import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const apiKey = this.config.get<string>('admin.apiKey');
    if (!apiKey) {
      throw new UnauthorizedException('ADMIN_API_KEY no configurada');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.headers['x-admin-key'];

    if (typeof provided !== 'string' || provided !== apiKey) {
      throw new UnauthorizedException('Clave de admin inválida');
    }

    return true;
  }
}
