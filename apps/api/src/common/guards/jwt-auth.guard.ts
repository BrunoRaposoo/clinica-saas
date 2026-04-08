import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido.');
    }

    try {
      const configService = new ConfigService();
      const payload = jwt.verify(token, configService.get('JWT_SECRET') || 'dev-secret-change-in-production') as JwtPayload;
      
      request.user = payload;
      request.userId = payload.sub;
      request.organizationId = payload.organizationId;
      request.roleId = payload.roleId;
      request.roleName = payload.roleName;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}