import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

export interface AdminUserRecord {
  id?: number;
  username: string;
  passwordHash: string;
  salt: string;
  updatedAt?: string;
}

export interface AdminSessionRecord {
  token: string;
  username: string;
  loginTime: number;
  expiresAt: number;
}

export interface CustomerRequestRecord {
  id: string;
  productName: string;
  description: string;
  referenceImages: string[];
  contactType: string;
  contactHandle: string;
  targetBudget: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AnalyticsRecord {
  pageViews: number;
  daily: Record<string, any>;
  products: Record<string, any>;
  agents: Record<string, any>;
  visitors?: Record<string, any>;
}

export interface IDatabaseService {
  isPostgres(): boolean;
  init(): Promise<void>;
  getAdminUser(username: string): Promise<AdminUserRecord | null>;
  saveAdminUser(username: string, passwordHash: string, salt: string): Promise<void>;
  createSession(session: AdminSessionRecord): Promise<void>;
  getSession(token: string): Promise<AdminSessionRecord | null>;
  deleteSession(token: string): Promise<void>;
  invalidateAllSessions(): Promise<void>;
  listCustomerRequests(): Promise<CustomerRequestRecord[]>;
  getCustomerRequest(id: string): Promise<CustomerRequestRecord | null>;
  createCustomerRequest(req: CustomerRequestRecord): Promise<void>;
  updateCustomerRequest(id: string, updates: { status?: string; adminNotes?: string }): Promise<CustomerRequestRecord | null>;
  deleteCustomerRequest(id: string): Promise<boolean>;
  getAnalytics(): Promise<AnalyticsRecord>;
  saveAnalytics(analytics: AnalyticsRecord): Promise<void>;
}

export class PostgresDatabaseService implements IDatabaseService {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
  }

  isPostgres(): boolean {
    return true;
  }

  async init(): Promise<void> {
    const client = await this.pool.connect();
    try {
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
      console.log('✓ PostgreSQL connected and tables verified.');
    } finally {
      client.release();
    }
  }

  async getAdminUser(username: string): Promise<AdminUserRecord | null> {
    const res = await this.pool.query(
      'SELECT username, password_hash AS "passwordHash", salt, updated_at AS "updatedAt" FROM admin_users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  async saveAdminUser(username: string, passwordHash: string, salt: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO admin_users (username, password_hash, salt, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           salt = EXCLUDED.salt,
           updated_at = CURRENT_TIMESTAMP`,
      [username, passwordHash, salt]
    );
  }

  async createSession(session: AdminSessionRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO admin_sessions (token, username, login_time, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (token) DO UPDATE
       SET login_time = EXCLUDED.login_time,
           expires_at = EXCLUDED.expires_at`,
      [session.token, session.username, session.loginTime, session.expiresAt]
    );
  }

  async getSession(token: string): Promise<AdminSessionRecord | null> {
    const res = await this.pool.query(
      'SELECT token, username, login_time AS "loginTime", expires_at AS "expiresAt" FROM admin_sessions WHERE token = $1',
      [token]
    );
    if (res.rows.length === 0) return null;
    const session = res.rows[0];
    if (Date.now() > Number(session.expiresAt)) {
      await this.deleteSession(token);
      return null;
    }
    return {
      token: session.token,
      username: session.username,
      loginTime: Number(session.loginTime),
      expiresAt: Number(session.expiresAt)
    };
  }

  async deleteSession(token: string): Promise<void> {
    await this.pool.query('DELETE FROM admin_sessions WHERE token = $1', [token]);
  }

  async invalidateAllSessions(): Promise<void> {
    await this.pool.query('DELETE FROM admin_sessions');
  }

  async listCustomerRequests(): Promise<CustomerRequestRecord[]> {
    const res = await this.pool.query(
      `SELECT id, product_name AS "productName", description, 
              reference_images AS "referenceImages", contact_type AS "contactType",
              contact_handle AS "contactHandle", target_budget AS "targetBudget",
              status, admin_notes AS "adminNotes", created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM customer_requests
       ORDER BY created_at DESC`
    );
    return res.rows.map(r => ({
      ...r,
      referenceImages: Array.isArray(r.referenceImages) ? r.referenceImages : [],
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)
    }));
  }

  async getCustomerRequest(id: string): Promise<CustomerRequestRecord | null> {
    const res = await this.pool.query(
      `SELECT id, product_name AS "productName", description, 
              reference_images AS "referenceImages", contact_type AS "contactType",
              contact_handle AS "contactHandle", target_budget AS "targetBudget",
              status, admin_notes AS "adminNotes", created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM customer_requests
       WHERE id = $1`,
      [id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      ...r,
      referenceImages: Array.isArray(r.referenceImages) ? r.referenceImages : [],
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)
    };
  }

  async createCustomerRequest(req: CustomerRequestRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO customer_requests 
        (id, product_name, description, reference_images, contact_type, contact_handle, target_budget, status, admin_notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [
        req.id,
        req.productName,
        req.description || '',
        JSON.stringify(req.referenceImages || []),
        req.contactType || 'discord',
        req.contactHandle,
        req.targetBudget || '',
        req.status || 'pending',
        req.adminNotes || '',
        req.createdAt || new Date().toISOString()
      ]
    );
  }

  async updateCustomerRequest(id: string, updates: { status?: string; adminNotes?: string }): Promise<CustomerRequestRecord | null> {
    const existing = await this.getCustomerRequest(id);
    if (!existing) return null;

    const newStatus = updates.status !== undefined ? updates.status : existing.status;
    const newNotes = updates.adminNotes !== undefined ? updates.adminNotes : existing.adminNotes;

    await this.pool.query(
      `UPDATE customer_requests
       SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newStatus, newNotes, id]
    );

    return this.getCustomerRequest(id);
  }

  async deleteCustomerRequest(id: string): Promise<boolean> {
    const res = await this.pool.query('DELETE FROM customer_requests WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getAnalytics(): Promise<AnalyticsRecord> {
    const res = await this.pool.query('SELECT page_views, daily_data, products_data, agents_data FROM site_analytics WHERE id = $1', ['global']);
    if (res.rows.length === 0) {
      return { pageViews: 0, daily: {}, products: {}, agents: {}, visitors: {} };
    }
    const row = res.rows[0];
    return {
      pageViews: Number(row.page_views || 0),
      daily: row.daily_data || {},
      products: row.products_data || {},
      agents: row.agents_data || {},
      visitors: {}
    };
  }

  async saveAnalytics(analytics: AnalyticsRecord): Promise<void> {
    await this.pool.query(
      `INSERT INTO site_analytics (id, page_views, daily_data, products_data, agents_data, updated_at)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET page_views = EXCLUDED.page_views,
           daily_data = EXCLUDED.daily_data,
           products_data = EXCLUDED.products_data,
           agents_data = EXCLUDED.agents_data,
           updated_at = CURRENT_TIMESTAMP`,
      ['global', analytics.pageViews, JSON.stringify(analytics.daily || {}), JSON.stringify(analytics.products || {}), JSON.stringify(analytics.agents || {})]
    );
  }
}

export class JsonFileDatabaseService implements IDatabaseService {
  private dataDir: string;
  private authFile: string;
  private sessionsFile: string;
  private requestsFile: string;
  private analyticsFile: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.authFile = path.join(dataDir, 'admin_auth.json');
    this.sessionsFile = path.join(dataDir, 'admin_sessions.json');
    this.requestsFile = path.join(dataDir, 'custom_requests.json');
    this.analyticsFile = path.join(dataDir, 'analytics.json');
  }

  isPostgres(): boolean {
    return false;
  }

  async init(): Promise<void> {
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    if (!fs.existsSync(this.sessionsFile)) fs.writeFileSync(this.sessionsFile, JSON.stringify({}, null, 2));
    if (!fs.existsSync(this.requestsFile)) fs.writeFileSync(this.requestsFile, JSON.stringify([], null, 2));
    if (!fs.existsSync(this.analyticsFile)) fs.writeFileSync(this.analyticsFile, JSON.stringify({ pageViews: 0, daily: {}, products: {}, agents: {}, visitors: {} }, null, 2));
  }

  private readJson<T>(filePath: string, fallback: T): T {
    try {
      if (!fs.existsSync(filePath)) return fallback;
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      return fallback;
    }
  }

  private writeJson(filePath: string, data: any): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  async getAdminUser(username: string): Promise<AdminUserRecord | null> {
    const auth = this.readJson<any>(this.authFile, null);
    if (!auth || !auth.passwordHash || !auth.salt) return null;
    return {
      username: 'admin',
      passwordHash: auth.passwordHash,
      salt: auth.salt,
      updatedAt: auth.updatedAt
    };
  }

  async saveAdminUser(username: string, passwordHash: string, salt: string): Promise<void> {
    this.writeJson(this.authFile, {
      passwordHash,
      salt,
      updatedAt: new Date().toISOString()
    });
  }

  async createSession(session: AdminSessionRecord): Promise<void> {
    const sessions = this.readJson<Record<string, AdminSessionRecord>>(this.sessionsFile, {});
    sessions[session.token] = session;
    this.writeJson(this.sessionsFile, sessions);
  }

  async getSession(token: string): Promise<AdminSessionRecord | null> {
    const sessions = this.readJson<Record<string, AdminSessionRecord>>(this.sessionsFile, {});
    const session = sessions[token];
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      delete sessions[token];
      this.writeJson(this.sessionsFile, sessions);
      return null;
    }
    return session;
  }

  async deleteSession(token: string): Promise<void> {
    const sessions = this.readJson<Record<string, AdminSessionRecord>>(this.sessionsFile, {});
    delete sessions[token];
    this.writeJson(this.sessionsFile, sessions);
  }

  async invalidateAllSessions(): Promise<void> {
    this.writeJson(this.sessionsFile, {});
  }

  async listCustomerRequests(): Promise<CustomerRequestRecord[]> {
    return this.readJson<CustomerRequestRecord[]>(this.requestsFile, []);
  }

  async getCustomerRequest(id: string): Promise<CustomerRequestRecord | null> {
    const all = await this.listCustomerRequests();
    return all.find(r => r.id === id) || null;
  }

  async createCustomerRequest(req: CustomerRequestRecord): Promise<void> {
    const all = await this.listCustomerRequests();
    if (!all.some(r => r.id === req.id)) {
      all.unshift(req);
      this.writeJson(this.requestsFile, all);
    }
  }

  async updateCustomerRequest(id: string, updates: { status?: string; adminNotes?: string }): Promise<CustomerRequestRecord | null> {
    const all = await this.listCustomerRequests();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return null;

    if (updates.status !== undefined) all[idx].status = updates.status;
    if (updates.adminNotes !== undefined) all[idx].adminNotes = updates.adminNotes;
    all[idx].updatedAt = new Date().toISOString();
    this.writeJson(this.requestsFile, all);
    return all[idx];
  }

  async deleteCustomerRequest(id: string): Promise<boolean> {
    let all = await this.listCustomerRequests();
    const before = all.length;
    all = all.filter(r => r.id !== id);
    this.writeJson(this.requestsFile, all);
    return all.length < before;
  }

  async getAnalytics(): Promise<AnalyticsRecord> {
    return this.readJson<AnalyticsRecord>(this.analyticsFile, {
      pageViews: 0,
      daily: {},
      products: {},
      agents: {},
      visitors: {}
    });
  }

  async saveAnalytics(analytics: AnalyticsRecord): Promise<void> {
    this.writeJson(this.analyticsFile, analytics);
  }
}

let dbInstance: IDatabaseService | null = null;

export async function getDatabaseService(): Promise<IDatabaseService> {
  if (dbInstance) return dbInstance;

  const dbUrl = process.env.DATABASE_URL;

  // In production (Vercel or hosted), DATABASE_URL is strictly required. No fake fallback in production!
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (!dbUrl || !dbUrl.startsWith('postgres')) {
      throw new Error('FATAL SERVER CONFIGURATION: DATABASE_URL is missing or invalid in production environment. Persistent database is required.');
    }
    const pgService = new PostgresDatabaseService(dbUrl);
    await pgService.init();
    dbInstance = pgService;
    return dbInstance;
  }

  // Development only: connect to Postgres if supplied, otherwise fallback to local JSON for offline testing
  if (dbUrl && dbUrl.startsWith('postgres')) {
    try {
      const pgService = new PostgresDatabaseService(dbUrl);
      await pgService.init();
      dbInstance = pgService;
      return dbInstance;
    } catch (err) {
      console.warn('Dev Postgres connection failed, using local dev data_store:', err);
    }
  }

  const fallbackService = new JsonFileDatabaseService(path.join(__dirname, '..', 'data_store'));
  await fallbackService.init();
  dbInstance = fallbackService;
  return dbInstance;
}
