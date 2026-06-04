import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function setupDatabase() {
  // First, connect to postgres database to create priceapp database
  const adminClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || 'Cusdom15',
    port: 5432,
  });

  try {
    console.log('🔍 Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if priceapp database exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'priceapp'"
    );

    if (dbCheckResult.rows.length === 0) {
      console.log('📦 Creating priceapp database...');
      await adminClient.query('CREATE DATABASE priceapp');
      console.log('✅ Database "priceapp" created successfully!');
    } else {
      console.log('✅ Database "priceapp" already exists');
    }

    await adminClient.end();

    // Now test connection to priceapp database
    const appClient = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'priceapp',
      password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || 'Cusdom15',
      port: 5432,
    });

    console.log('\n🔍 Testing connection to priceapp database...');
    await appClient.connect();
    console.log('✅ Connected to priceapp database successfully!');

    // Check tables
    const tablesResult = await appClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('\n⚠️  No tables found. You need to run the schema setup.');
      console.log('Run this command:');
      console.log('  psql -U postgres -d priceapp -f src/db/schema.sql');
    } else {
      console.log('\n📊 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
    }

    await appClient.end();
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed!');
    console.error('Error:', error.message);
    console.log('\n💡 The password "Cusdom15" is incorrect.');
    console.log('Please update server/.env with your correct PostgreSQL password.');
    process.exit(1);
  }
}

setupDatabase();
