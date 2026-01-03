
// Use relative path to avoid alias issues with tsx unless tsconfig-paths is set up
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Seeding database with default admin...');

    const password = await bcrypt.hash('admin123', 10);

    try {
        const user = await prisma.user.upsert({
            where: { email: 'admin@gatesim.mn' },
            update: { password },
            create: {
                email: 'admin@gatesim.mn',
                name: 'Admin User',
                password,
            },
        });

        console.log('✅ Admin user created/updated successfully!');
        console.log('---------------------------------------------------');
        console.log('📧 Email:    admin@gatesim.mn');
        console.log('🔑 Password: admin123');
        console.log('---------------------------------------------------');
    } catch (e) {
        console.error('❌ Error seeding admin user:', e);
        throw e;
    }
}

main()
    .then(async () => {
        // prisma disconnect is handled in the lib file typically, usually we don't need manual disconnect on script end unless keeping connection open
        // but better safe
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
