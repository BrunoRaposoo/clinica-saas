'use client';

import { useSession } from '@/providers/session-provider';

export function useRole() {
  const { role, user, hasRole, isRole } = useSession();

  return {
    role,
    user,
    hasRole,
    isRole,
    isProfessional: isRole('professional'),
    isReceptionist: isRole('receptionist'),
    isOrgAdmin: isRole('org_admin'),
    isSuperAdmin: isRole('super_admin'),
    isSupport: isRole('support'),
    canEdit: hasRole(['org_admin', 'super_admin', 'receptionist']),
    canManageSettings: hasRole(['org_admin', 'super_admin']),
    canManageUsers: hasRole(['org_admin', 'super_admin', 'receptionist']),
    canManagePatients: hasRole(['org_admin', 'super_admin', 'receptionist']),
    canManageAppointments: hasRole(['org_admin', 'super_admin', 'receptionist', 'professional']),
    canManageDocuments: hasRole(['org_admin', 'super_admin', 'receptionist']),
  };
}