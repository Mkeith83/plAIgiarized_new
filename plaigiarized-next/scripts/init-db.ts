import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting database initialization...')

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const hashedPassword = await hash(adminPassword, 12)
    
    await prisma.user.upsert({
        where: { email: 'admin@plaigiarized.com' },
        update: {},
        create: {
            email: 'admin@plaigiarized.com',
            name: 'Admin',
            hashedPassword: hashedPassword,
            role: Role.ADMIN
        }
    })

    // Create default settings
    await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            detectionThreshold: 0.8,
            maxFileSize: 10485760, // 10MB
            allowedFileTypes: ['pdf', 'doc', 'docx', 'txt']
        }
    })

    console.log('Database initialization completed!')
}

main()
    .catch((e) => {
        console.error('Error during initialization:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 