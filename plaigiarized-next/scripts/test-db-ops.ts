import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testOperations() {
  try {
    console.log('1. Testing connection...')
    await prisma.$connect()
    console.log('✅ Connected to database')

    console.log('\n2. Counting users...')
    const userCount = await prisma.user.count()
    console.log('✅ User count:', userCount)

    console.log('\n3. Creating test user...')
    const newUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        full_name: 'Test User',
        user_type: 'STUDENT'
      }
    })
    console.log('✅ Created user:', newUser)

    console.log('\n4. Reading test user...')
    const foundUser = await prisma.user.findUnique({
      where: { id: newUser.id }
    })
    console.log('✅ Found user:', foundUser)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOperations() 