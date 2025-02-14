import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL:', process.env.POSTGRES_PRISMA_URL)
    console.log('DIRECT_URL:', process.env.POSTGRES_URL_NON_POOLING)
    
    const result = await prisma.$connect()
    console.log('Connection successful!')
    
    // Try a simple query
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 