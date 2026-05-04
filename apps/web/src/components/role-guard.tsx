'use client';

import { useRole } from '@/hooks/use-role';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { hasRole, role } = useRole();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ConditionalRenderProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRender({ condition, children, fallback = null }: ConditionalRenderProps) {
  if (!condition) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}