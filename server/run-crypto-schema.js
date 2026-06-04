import { readFileSync } from 'fs';
import pool from './src/db/index.js';

async function runCryptoSchema() {
  try {
    console.log('📦 Running crypto schema updates...');
    
    const sql = readFileSync('./src/db/crypto_schema.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Crypto schema updated successfully!');
    console.log('   - Created crypto_addresses table');
    console.log('   - Created crypto_deposits table');
    console.log('   - Created crypto_withdrawals table');
    console.log('   - Updated wallets table for higher precision');
    console.log('   - Updated transactions table for higher precision');
    console.log('   - Added BTC, ETH, USDT wallets for existing users');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running crypto schema:', error.message);
    process.exit(1);
  }
}

runCryptoSchema();
