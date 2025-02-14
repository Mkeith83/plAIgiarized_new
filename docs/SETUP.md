# Setup Guide

## Database Configuration (Supabase)

1. Create a Supabase project at https://supabase.com

2. Get your database connection details from Supabase:
   - Go to Project Settings > Database
   - Find your connection string under "Connection string" 
   - Copy the connection string with password

3. Configure your .env file:
```env
# Replace with your Supabase connection string
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.rzbnnxahwnclpiduwodh.supabase.co:6543/postgres?pgbouncer=true"

# For direct connection (migrations/studio)
DIRECT_URL="postgres://postgres:[YOUR-PASSWORD]@db.rzbnnxahwnclpiduwodh.supabase.co:5432/postgres"
```

4. Update schema.prisma:
```prisma
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Used for migrations
}
```

5. Initialize database:
```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# If you need to reset the database
npx prisma migrate reset
```

## Troubleshooting Database Connection

1. DNS Resolution Issues:
   ```bash
   # Test DNS resolution
   nslookup db.rzbnnxahwnclpiduwodh.supabase.co
   
   # If it fails, try using IP directly
   # Get IP from Supabase dashboard
   DATABASE_URL="postgres://postgres:[PASSWORD]@[IP-ADDRESS]:6543/postgres?pgbouncer=true"
   ```

2. Test Connections:
   ```bash
   # Run connection test script
   npx ts-node scripts/test-connections.ts
   ```

3. Check Environment Variables:
   ```bash
   # Required variables
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   DATABASE_URL=postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
   DIRECT_URL=postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. Network Issues:
   - Check if you're behind a corporate firewall
   - Try using a different network
   - Verify ports 5432 and 6543 are not blocked
   - Try using a VPN

5. Supabase Configuration:
   - Verify project is active
   - Check Database Settings > Network Access
   - Add your IP to the allow list
   - Enable "Ignore VPN IPs" if needed

Common Errors:
- ENOTFOUND: DNS resolution failed
  - Check hostname spelling
  - Try using IP address
  - Verify DNS settings
- P1001: Can't reach database
  - Check connection strings
  - Verify network access
  - Check Supabase status 