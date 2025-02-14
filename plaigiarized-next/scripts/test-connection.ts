import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rzbnnxahwnclpiduwodh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6Ym5ueGFod25jbHBpZHV3b2RoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTMyODY2NSwiZXhwIjoyMDU0OTA0NjY1fQ.8ENmedFrgxxL6JeLeJ3CfM9UEnusUCn4mr9gowfFaBo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1)
        if (error) throw error
        console.log('Connection successful:', data)
    } catch (error) {
        console.error('Connection failed:', error)
    }
}

testConnection() 