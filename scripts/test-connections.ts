import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testConnections() {
  // 1. Test Supabase API
  console.log('1. Testing Supabase API connection...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Supabase API works:', data);
  } catch (error) {
    console.log('❌ Supabase API failed:', error);
  }

  // 2. Test pooled connection
  console.log('\n2. Testing pooled connection (6543)...');
  const pooledPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pooledPool.connect();
    console.log('✅ Pooled connection works');
    await client.release();
  } catch (error) {
    console.log('❌ Pooled connection failed:', error);
  }

  // 3. Test direct connection
  console.log('\n3. Testing direct connection (5432)...');
  const directPool = new Pool({
    connectionString: process.env.DIRECT_URL
  });

  try {
    const client = await directPool.connect();
    console.log('✅ Direct connection works');
    await client.release();
  } catch (error) {
    console.log('❌ Direct connection failed:', error);
  }
}

testConnections(); 