import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para definir roles permitidas em um controller ou endpoint.
 * Uso: @Roles('org_admin', 'receptionist')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roleName) {
      throw new ForbiddenException('Usuário não autenticado.');
    }

    if (requiredRoles.includes(user.roleName)) {
      return true;
    }

    throw new ForbiddenException(
      `Acesso não autorizado. Roles permitidas: ${requiredRoles.join(', ')}. Sua role: ${user.roleName}`
    );
  }
}