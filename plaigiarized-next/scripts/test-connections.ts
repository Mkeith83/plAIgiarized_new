import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

// Supabase setup
const supabaseUrl = 'https://rzbnnxahwnclpiduwodh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Ym5ueGFod25jbHBpZHV3b2RoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTMyODY2NSwiZXhwIjoyMDU0OTA0NjY1fQ.8ENmedFrgxxL6JeLeJ3CfM9UEnusUCn4mr9gowfFaBo'
const supabase = createClient(supabaseUrl, supabaseKey)

// Common connection options
const connectionOptions = {
  user: 'postgres',
  password: 'UAj2AHu7h8mF*i8',
  host: 'db.rzbnnxahwnclpiduwodh.supabase.co',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: true
  },
  family: 4  // Force IPv4
}

// Pooled connection (port 6543)
const pooledPool = new Pool({
  ...connectionOptions,
  port: 6543
})

// Direct connection (port 5432)
const directPool = new Pool({
  ...connectionOptions,
  port: 5432
})

async function testConnections() {
  console.log('1. Testing Supabase API connection...')
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) throw error
    console.log('✅ Supabase API works:', data)
  } catch (error) {
    console.error('❌ Supabase API failed:', error)
  }

  console.log('\n2. Testing pooled connection (6543)...')
  try {
    const client = await pooledPool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('✅ Pooled connection works:', result.rows[0])
    client.release()
  } catch (error) {
    console.error('❌ Pooled connection failed:', error)
  }

  console.log('\n3. Testing direct connection (5432)...')
  try {
    const client = await directPool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('✅ Direct connection works:', result.rows[0])
    client.release()
  } catch (error) {
    console.error('❌ Direct connection failed:', error)
  }

  await pooledPool.end()
  await directPool.end()
}

testConnections()