import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data_store');
const AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'custom_requests.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is required to run migration.');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL database for migration...');
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    console.log('1. Ensuring tables exist in target PostgreSQL database...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_sessions (
        token VARCHAR(128) PRIMARY KEY,
        username VARCHAR(64) NOT NULL REFERENCES admin_users(username) ON UPDATE CASCADE ON DELETE CASCADE,
        login_time BIGINT NOT NULL,
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customer_requests (
        id VARCHAR(64) PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        description TEXT,
        reference_images JSONB DEFAULT '[]'::jsonb,
        contact_type VARCHAR(32) NOT NULL DEFAULT 'discord',
        contact_handle VARCHAR(128) NOT NULL,
        target_budget VARCHAR(64),
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_analytics (
        id VARCHAR(64) PRIMARY KEY,
        page_views BIGINT DEFAULT 0,
        daily_data JSONB DEFAULT '{}'::jsonb,
        products_data JSONB DEFAULT '{}'::jsonb,
        agents_data JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    if (fs.existsSync(AUTH_FILE)) {
      console.log('2. Migrating Admin Credentials from data_store/admin_auth.json...');
      const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
      if (auth.passwordHash && auth.salt) {
        await client.query(
          `INSERT INTO admin_users (username, password_hash, salt, updated_at)
           VALUES ('admin', $1, $2, $3)
           ON CONFLICT (username) DO NOTHING`,
          [auth.passwordHash, auth.salt, auth.updatedAt || new Date().toISOString()]
        );
        console.log('✓ Admin credential safely imported into admin_users table without resetting password.');
      }
    }

    if (fs.existsSync(REQUESTS_FILE)) {
      console.log('3. Migrating Customer Requests from data_store/custom_requests.json...');
      const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
      let importedCount = 0;
      let skippedCount = 0;

      for (const req of requests) {
        const res = await client.query(
          `INSERT INTO customer_requests 
            (id, product_name, description, reference_images, contact_type, contact_handle, target_budget, status, admin_notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
           ON CONFLICT (id) DO NOTHING`,
          [
            req.id,
            req.productName || 'Unnamed Request',
            req.description || '',
            JSON.stringify(req.referenceImages || []),
            req.contactType || 'discord',
            req.contactHandle || 'unknown',
            req.targetBudget || '',
            req.status || 'pending',
            req.adminNotes || '',
            req.createdAt || new Date().toISOString()
          ]
        );
        if ((res.rowCount ?? 0) > 0) {
          importedCount++;
        } else {
          skippedCount++;
        }
      }
      console.log(`✓ Requests Migration Complete: ${importedCount} imported, ${skippedCount} already existed (skipped).`);
    }

    if (fs.existsSync(ANALYTICS_FILE)) {
      console.log('4. Migrating Analytics from data_store/analytics.json...');
      const analytics = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
      await client.query(
        `INSERT INTO site_analytics (id, page_views, daily_data, products_data, agents_data, updated_at)
         VALUES ('global', $1, $2::jsonb, $3::jsonb, $4::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE
         SET page_views = GREATEST(site_analytics.page_views, EXCLUDED.page_views),
             daily_data = EXCLUDED.daily_data,
             products_data = EXCLUDED.products_data,
             agents_data = EXCLUDED.agents_data,
             updated_at = CURRENT_TIMESTAMP`,
        [
          analytics.pageViews || 0,
          JSON.stringify(analytics.daily || {}),
          JSON.stringify(analytics.products || {}),
          JSON.stringify(analytics.agents || {})
        ]
      );
      console.log('✓ Site Analytics migrated to PostgreSQL.');
    }

    const countRes = await client.query('SELECT COUNT(*) FROM customer_requests');
    const userRes = await client.query('SELECT COUNT(*) FROM admin_users');
    console.log('========================================================');
    console.log(`MIGRATION SUMMARY:`);
    console.log(`Admin accounts in PostgreSQL: ${userRes.rows[0].count}`);
    console.log(`Customer requests in PostgreSQL: ${countRes.rows[0].count}`);
    console.log('Original JSON files in data_store/ remain UNTOUCHED as permanent backups.');
    console.log('========================================================');

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
