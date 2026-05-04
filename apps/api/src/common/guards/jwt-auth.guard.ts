import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  organizationId?: string;
  roleId: string;
  roleName: string;
  jti: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      console.log('[Auth] Token não fornecido');
      throw new UnauthorizedException('Token não fornecido.');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      console.log('[Auth] Formato de token inválido');
      throw new UnauthorizedException('Formato de token inválido.');
    }

    try {
      const jwtSecret = this.configService.get('JWT_SECRET') || 'dev-secret-change-in-production-minimum-32-chars';
      
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;

      console.log('[Auth] Token válido para usuário:', payload.email);

      request.user = payload;
      request.userId = payload.sub;
      request.organizationId = payload.organizationId;
      request.roleId = payload.roleId;
      request.roleName = payload.roleName;

      return true;
    } catch (error) {
      console.log('[Auth] Token inválido ou expirado:', error.name);
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}