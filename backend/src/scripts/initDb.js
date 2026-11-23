const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3307', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const databaseName = process.env.DB_NAME || 'ecommerce_db';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // 1. Initial connection without database to create it if needed
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log('✓ Successfully connected to MySQL server.');

    // 2. Read schema.sql
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database schema from schema.sql...');
    await connection.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // 3. Read seeds.sql
    const seedsPath = path.join(__dirname, '../../../database/seeds.sql');
    if (fs.existsSync(seedsPath)) {
      const seedsSql = fs.readFileSync(seedsPath, 'utf8');
      console.log('Applying seed data from seeds.sql...');
      await connection.query(seedsSql);
      console.log('✓ Seeds applied successfully.');
    }

    // 4. Verify data
    await connection.changeUser({ database: databaseName });
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [products] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [wilayas] = await connection.query('SELECT COUNT(*) as count FROM wilayas');
    const [admins] = await connection.query('SELECT id, username, email FROM admins');

    console.log('\n--- DATABASE INITIALIZATION SUMMARY ---');
    console.log(`Wilayas seeded: ${wilayas[0].count} wilayas`);
    console.log(`Categories seeded: ${categories[0].count}`);
    console.log(`Products seeded: ${products[0].count}`);
    console.log(`Default Admin: ${admins[0].email} / admin123`);
    console.log('----------------------------------------\n');

  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
