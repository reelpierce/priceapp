import pool from './src/db/index.js';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📌 Connection string:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('⏰ Server time:', result.rows[0].now);
    
    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify database "priceapp" exists');
    console.log('3. Update password in server/.env file');
    console.log('4. Current DATABASE_URL format should be:');
    console.log('   postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/priceapp');
    process.exit(1);
  }
}

testConnection();
