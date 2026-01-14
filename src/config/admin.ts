
// Admin Roles Configuration

export const SUPER_ADMINS = [
    'admin@gatesim.mn',
    'suren@gatesim.mn',
    'nsurenoidov@gmail.com',
    'admin@gatesim.travel',
    'oidovnamnan7@gmail.com',
];

export const STAFF_EMAILS = [
    // Add staff emails here
    'staff@gatesim.mn',
];

export type AdminRole = 'super_admin' | 'staff' | null;

export function getAdminRole(email: string | null | undefined): AdminRole {
    if (!email) return null;
    if (SUPER_ADMINS.includes(email)) return 'super_admin';
    if (STAFF_EMAILS.includes(email)) return 'staff';
    return null;
}

export function canAccess(role: AdminRole, resource: 'users' | 'settings' | 'ai' | 'team'): boolean {
    if (role === 'super_admin') return true;
    if (role === 'staff') {
        // Staff cannot access these resources
        return false;
    }
    return false;
}
