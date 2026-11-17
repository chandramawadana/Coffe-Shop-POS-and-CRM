import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  WARUNG_KOPI_LUHUR_PRODUCTS,
  INITIAL_INGREDIENTS,
  WARUNG_KOPI_LUHUR_RECIPES,
  StaffUser
} from '@coffee-pos/shared-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pos_master.db');
export const db: DatabaseType = new Database(dbPath);


// Enable WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      current_stock REAL NOT NULL,
      min_threshold REAL NOT NULL,
      cost_per_unit REAL NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      base_price REAL NOT NULL,
      target_station TEXT NOT NULL,
      image_url TEXT,
      description TEXT,
      is_available INTEGER NOT NULL DEFAULT 1,
      supported_modifiers TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_recipes (
      product_id TEXT NOT NULL,
      ingredient_id TEXT NOT NULL,
      amount REAL NOT NULL,
      unit TEXT NOT NULL,
      condition_rule TEXT DEFAULT 'DEFAULT',
      PRIMARY KEY (product_id, ingredient_id),
      FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      phone_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      stamp_balance INTEGER NOT NULL DEFAULT 0,
      total_rewards_redeemed INTEGER NOT NULL DEFAULT 0,
      coffee_pass_balance INTEGER NOT NULL DEFAULT 0,
      total_visits INTEGER NOT NULL DEFAULT 1,
      total_spent REAL NOT NULL DEFAULT 0,
      first_visit_at TEXT NOT NULL,
      last_visit_at TEXT NOT NULL,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS stamp_ledger (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      order_id TEXT,
      change_amount INTEGER NOT NULL,
      new_balance INTEGER NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coffee_pass_ledger (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      order_id TEXT,
      change_amount INTEGER NOT NULL,
      new_balance INTEGER NOT NULL,
      otp_code TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      daily_sequence INTEGER NOT NULL,
      type TEXT NOT NULL,
      table_name TEXT,
      customer_name TEXT,
      customer_id TEXT,
      cashier_user_id TEXT NOT NULL,
      cashier_name TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      total_cogs REAL NOT NULL DEFAULT 0,
      margin REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      payments TEXT NOT NULL, -- JSON array of payments
      created_at TEXT NOT NULL,
      paid_at TEXT,
      notes TEXT,
      synced_to_cloud INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      modifiers TEXT NOT NULL, -- JSON
      target_station TEXT NOT NULL,
      kds_status TEXT NOT NULL,
      calculated_cogs REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cash_drawer_sessions (
      id TEXT PRIMARY KEY,
      cashier_user_id TEXT NOT NULL,
      cashier_name TEXT NOT NULL,
      opened_at TEXT NOT NULL,
      closed_at TEXT,
      opening_float REAL NOT NULL,
      system_cash_sales REAL NOT NULL DEFAULT 0,
      system_expected_cash REAL NOT NULL DEFAULT 0,
      actual_counted_cash REAL,
      variance REAL,
      status TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS petty_cash_mutations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      type TEXT NOT NULL, -- IN or OUT
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      approved_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES cash_drawer_sessions (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS stock_opname_entries (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      ingredient_id TEXT NOT NULL,
      system_stock REAL NOT NULL,
      physical_stock REAL NOT NULL,
      variance REAL NOT NULL,
      variance_percentage REAL NOT NULL,
      notes TEXT,
      recorded_at TEXT NOT NULL,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // 1. Staff Users
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM staff_users').get() as { cnt: number };
  if (userCount.cnt === 0) {
    const defaultUsers: StaffUser[] = [
      { id: 'usr-cashier', name: 'Kasir Utama', role: 'CASHIER', pin: '1234', isActive: true },
      { id: 'usr-barista', name: 'Barista Luhur', role: 'CASHIER', pin: '2345', isActive: true },
      { id: 'usr-manager', name: 'Supervisor Kafe', role: 'MANAGER', pin: '8888', isActive: true },
      { id: 'usr-owner', name: 'Pemilik Toko (Owner)', role: 'OWNER', pin: '9999', isActive: true }
    ];

    const insertUser = db.prepare(
      'INSERT INTO staff_users (id, name, role, pin, is_active) VALUES (?, ?, ?, ?, ?)'
    );
    for (const u of defaultUsers) {
      insertUser.run(u.id, u.name, u.role, u.pin, u.isActive ? 1 : 0);
    }
  }

  // 2. Ingredients
  const ingCount = db.prepare('SELECT COUNT(*) as cnt FROM ingredients').get() as { cnt: number };
  if (ingCount.cnt === 0) {
    const insertIng = db.prepare(
      'INSERT INTO ingredients (id, name, unit, current_stock, min_threshold, cost_per_unit, category) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const ing of INITIAL_INGREDIENTS) {
      insertIng.run(ing.id, ing.name, ing.unit, ing.currentStock, ing.minThreshold, ing.costPerUnit, ing.category);
    }
  }

  // 3. Products
  const prodCount = db.prepare('SELECT COUNT(*) as cnt FROM products').get() as { cnt: number };
  if (prodCount.cnt === 0) {
    const insertProd = db.prepare(
      'INSERT INTO products (id, name, category, base_price, target_station, description, is_available, supported_modifiers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const p of WARUNG_KOPI_LUHUR_PRODUCTS) {
      insertProd.run(
        p.id,
        p.name,
        p.category,
        p.basePrice,
        p.targetStation,
        p.description || '',
        p.isAvailable ? 1 : 0,
        JSON.stringify(p.supportedModifiers)
      );
    }
  }

  // 4. Recipes
  const recipeCount = db.prepare('SELECT COUNT(*) as cnt FROM product_recipes').get() as { cnt: number };
  if (recipeCount.cnt === 0) {
    const insertRecipe = db.prepare(
      'INSERT INTO product_recipes (product_id, ingredient_id, amount, unit, condition_rule) VALUES (?, ?, ?, ?, ?)'
    );
    for (const r of WARUNG_KOPI_LUHUR_RECIPES) {
      for (const item of r.ingredients) {
        insertRecipe.run(r.productId, item.ingredientId, item.amount, item.unit, item.conditionRule || 'DEFAULT');
      }
    }
  }

  // 5. System Settings (WhatsApp Gateway initial state)
  const waConfig = db.prepare('SELECT value FROM system_settings WHERE key = ?').get('wa_gateway_config');
  if (!waConfig) {
    const initialConfig = {
      provider: 'qr_multidevice', // 'qr_multidevice' | 'fonnte' | 'wablas'
      fonnteToken: '',
      wablasToken: '',
      wablasServer: 'https://jakarta.wablas.com',
      isConnected: false,
      sessionPhone: '',
      autoSendReceipt: true,
      autoSendStampReward: true,
      autoSendReEngagement: true
    };
    db.prepare('INSERT INTO system_settings (key, value) VALUES (?, ?)').run(
      'wa_gateway_config',
      JSON.stringify(initialConfig)
    );
  }
}
