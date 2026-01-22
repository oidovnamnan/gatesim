
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
    const normalizedEmail = email.toLowerCase().trim();

    // Check Super Admins
    if (SUPER_ADMINS.some(admin => admin.toLowerCase() === normalizedEmail)) {
        return 'super_admin';
    }

    // Check Staff
    if (STAFF_EMAILS.some(staff => staff.toLowerCase() === normalizedEmail)) {
        return 'staff';
    }

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

/**
 * Quick check if email belongs to any admin role
 */
export function isAdmin(email: string | null | undefined): boolean {
    return getAdminRole(email) !== null;
}

