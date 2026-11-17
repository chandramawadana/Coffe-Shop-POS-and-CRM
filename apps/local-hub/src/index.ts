import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { nanoid } from 'nanoid';
import { db, initDatabase } from './db';
import { calculateItemCogs, deductInventoryForOrder, recordStockOpname } from './services/inventory';
import { whatsAppService } from './services/whatsapp';
import { createEncryptedBackup, startDailyBackupScheduler } from './services/backup';
import {
  Order,
  OrderLineItem,
  WARUNG_KOPI_LUHUR_BRAND,
  WsMessage,
  WARUNG_KOPI_LUHUR_ADDONS
} from '@coffee-pos/shared-types';

initDatabase();

const app = Fastify({ logger: false });

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});

app.register(websocket);

// Active WebSocket connections
const connectedSockets = new Set<any>();

function broadcastWs(msg: WsMessage) {
  const jsonStr = JSON.stringify(msg);
  for (const client of connectedSockets) {
    if (client.readyState === 1) { // OPEN
      client.send(jsonStr);
    }
  }
}

app.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (connection) => {
    connectedSockets.add(connection);

    connection.on('message', (message: any) => {
      try {
        const parsed = JSON.parse(message.toString());
        // Handle client-to-all broadcast if needed
        if (parsed.event === 'PING') {
          connection.send(JSON.stringify({ event: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // ignore
      }
    });

    connection.on('close', () => {
      connectedSockets.delete(connection);
    });

    // Send welcome greeting
    connection.send(JSON.stringify({
      event: 'WS_CONNECTED',
      payload: { message: 'Connected to Warung Kopi Luhur Master Node' },
      timestamp: new Date().toISOString()
    }));
  });
});

// ========================
// REST API ROUTES
// ========================

// 1. Health & Brand
app.get('/api/health', async () => {
  return { status: 'OK', role: 'MASTER_NODE', time: new Date().toISOString() };
});

app.get('/api/brand', async () => {
  return {
    brand: WARUNG_KOPI_LUHUR_BRAND,
    addons: WARUNG_KOPI_LUHUR_ADDONS
  };
});

// 2. Auth by PIN
app.post('/api/auth/pin-login', async (req, reply) => {
  const { pin } = req.body as { pin: string };
  const user = db.prepare('SELECT id, name, role, is_active FROM staff_users WHERE pin = ? AND is_active = 1').get(pin);
  if (!user) {
    return reply.status(401).send({ error: 'PIN tidak valid atau tidak terdaftar' });
  }
  return { user };
});

// 3. Products
app.get('/api/products', async () => {
  const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all() as any[];
  return products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    basePrice: p.base_price,
    targetStation: p.target_station,
    imageUrl: p.image_url,
    description: p.description,
    isAvailable: Boolean(p.is_available),
    supportedModifiers: JSON.parse(p.supported_modifiers || '{}')
  }));
});

// 4. Ingredients & Inventory
app.get('/api/ingredients', async () => {
  const ingredients = db.prepare('SELECT * FROM ingredients ORDER BY category, name ASC').all() as any[];
  return ingredients.map(i => ({
    id: i.id,
    name: i.name,
    unit: i.unit,
    currentStock: i.current_stock,
    minThreshold: i.min_threshold,
    costPerUnit: i.cost_per_unit,
    category: i.category,
    isLowStock: i.current_stock <= i.min_threshold
  }));
});

// 5. Orders & Transactions
app.get('/api/orders/kds', async () => {
  // Ambil semua order aktif yang belum selesai di KDS
  const orders = db.prepare(`
    SELECT * FROM orders
    WHERE status IN ('PAID', 'OPEN_TAB')
    ORDER BY created_at ASC
  `).all() as any[];

  const results: Order[] = [];
  const getItemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

  for (const o of orders) {
    const rawItems = getItemsStmt.all(o.id) as any[];
    const items: OrderLineItem[] = rawItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
      modifiers: JSON.parse(item.modifiers || '{}'),
      targetStation: item.target_station,
      kdsStatus: item.kds_status,
      calculatedCogs: item.calculated_cogs
    }));

    // Filter jika masih ada item yang belum 'SERVED'
    const activeItems = items.filter(it => it.kdsStatus !== 'SERVED');
    if (activeItems.length > 0) {
      results.push({
        id: o.id,
        orderNumber: o.order_number,
        dailySequence: o.daily_sequence,
        type: o.type,
        tableName: o.table_name,
        customerName: o.customer_name,
        customerId: o.customer_id,
        cashierUserId: o.cashier_user_id,
        cashierName: o.cashier_name,
        items,
        subtotal: o.subtotal,
        discountAmount: o.discount_amount,
        taxAmount: o.tax_amount,
        totalAmount: o.total_amount,
        totalCogs: o.total_cogs,
        margin: o.margin,
        status: o.status,
        payments: JSON.parse(o.payments || '[]'),
        createdAt: o.created_at,
        paidAt: o.paid_at,
        notes: o.notes,
        syncedToCloud: Boolean(o.synced_to_cloud)
      });
    }
  }

  return results;
});

app.get('/api/orders/open-tabs', async () => {
  const tabs = db.prepare(`SELECT * FROM orders WHERE status = 'OPEN_TAB' ORDER BY created_at DESC`).all() as any[];
  const getItemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

  return tabs.map(o => ({
    id: o.id,
    orderNumber: o.order_number,
    dailySequence: o.daily_sequence,
    type: o.type,
    tableName: o.table_name,
    customerName: o.customer_name,
    customerId: o.customer_id,
    cashierUserId: o.cashier_user_id,
    cashierName: o.cashier_name,
    items: getItemsStmt.all(o.id).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
      modifiers: JSON.parse(item.modifiers || '{}'),
      targetStation: item.target_station,
      kdsStatus: item.kds_status,
      calculatedCogs: item.calculated_cogs
    })),
    subtotal: o.subtotal,
    discountAmount: o.discount_amount,
    taxAmount: o.tax_amount,
    totalAmount: o.total_amount,
    totalCogs: o.total_cogs,
    margin: o.margin,
    status: o.status,
    payments: JSON.parse(o.payments || '[]'),
    createdAt: o.created_at,
    notes: o.notes
  }));
});

// Create Order (Cashier)
app.post('/api/orders', async (req) => {
  const payload = req.body as Partial<Order>;
  const orderId = payload.id || nanoid();

  // Daily sequence counter
  const today = new Date().toISOString().slice(0, 10);
  const countToday = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE created_at LIKE ?`).get(`${today}%`) as { count: number };
  const dailySeq = countToday.count + 1;
  const orderNumber = String(dailySeq).padStart(3, '0');

  let totalCogs = 0;
  const itemsWithCogs: OrderLineItem[] = (payload.items || []).map(item => {
    const cogs = calculateItemCogs(item.productId, item.quantity, item.modifiers);
    totalCogs += cogs;
    return {
      ...item,
      id: item.id || nanoid(),
      calculatedCogs: cogs,
      kdsStatus: item.kdsStatus || 'QUEUED'
    };
  });

  const totalAmount = payload.totalAmount || 0;
  const margin = totalAmount - totalCogs;
  const status = payload.status || 'PAID';
  const now = new Date().toISOString();

  const insertOrderStmt = db.prepare(`
    INSERT INTO orders (
      id, order_number, daily_sequence, type, table_name, customer_name, customer_id,
      cashier_user_id, cashier_name, subtotal, discount_amount, tax_amount, total_amount,
      total_cogs, margin, status, payments, created_at, paid_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItemStmt = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name, quantity, unit_price, subtotal,
      modifiers, target_station, kds_status, calculated_cogs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createTx = db.transaction(() => {
    insertOrderStmt.run(
      orderId,
      orderNumber,
      dailySeq,
      payload.type || 'TAKEAWAY',
      payload.tableName || null,
      payload.customerName || null,
      payload.customerId || null,
      payload.cashierUserId || 'usr-cashier',
      payload.cashierName || 'Kasir',
      payload.subtotal || totalAmount,
      payload.discountAmount || 0,
      payload.taxAmount || 0,
      totalAmount,
      totalCogs,
      margin,
      status,
      JSON.stringify(payload.payments || []),
      now,
      status === 'PAID' ? now : null,
      payload.notes || null
    );

    for (const item of itemsWithCogs) {
      insertItemStmt.run(
        item.id,
        orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.subtotal,
        JSON.stringify(item.modifiers || {}),
        item.targetStation,
        item.kdsStatus,
        item.calculatedCogs
      );
    }
  });

  createTx();

  // Deduct Inventory Real-time (FR-SO-08)
  const { lowStockAlerts } = deductInventoryForOrder(itemsWithCogs);

  // Jika pelanggan punya customerId/phone, update loyalty stamp / visit
  if (payload.customerId && status === 'PAID') {
    handleCustomerLoyalty(payload.customerId, orderId, itemsWithCogs, totalAmount);
  }

  const createdOrder: Order = {
    id: orderId,
    orderNumber,
    dailySequence: dailySeq,
    type: payload.type || 'TAKEAWAY',
    tableName: payload.tableName,
    customerName: payload.customerName,
    customerId: payload.customerId,
    cashierUserId: payload.cashierUserId || 'usr-cashier',
    cashierName: payload.cashierName || 'Kasir',
    items: itemsWithCogs,
    subtotal: payload.subtotal || totalAmount,
    discountAmount: payload.discountAmount || 0,
    taxAmount: payload.taxAmount || 0,
    totalAmount,
    totalCogs,
    margin,
    status,
    payments: payload.payments || [],
    createdAt: now,
    paidAt: status === 'PAID' ? now : undefined,
    notes: payload.notes,
    syncedToCloud: false
  };

  // Broadcast WebSocket ke seluruh KDS & POS
  broadcastWs({
    event: 'ORDER_CREATED',
    payload: createdOrder,
    timestamp: now
  });

  // Kirim WhatsApp digital receipt jika ada nomor pelanggan
  if (payload.customerId) {
    const cust = db.prepare('SELECT phone_number FROM customers WHERE id = ?').get(payload.customerId) as { phone_number: string } | undefined;
    if (cust && cust.phone_number) {
      whatsAppService.sendOrderReceipt(createdOrder, cust.phone_number).catch(console.error);
    }
  }

  return { order: createdOrder, lowStockAlerts };
});

function handleCustomerLoyalty(customerId: string, orderId: string, items: OrderLineItem[], totalAmount: number) {
  const cust = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId) as any;
  if (!cust) return;

  // Hitung jumlah cup kopi
  const coffeeCups = items.reduce((sum, it) => sum + it.quantity, 0);
  let newStamps = cust.stamp_balance + coffeeCups;
  let redeemedCount = cust.total_rewards_redeemed;

  if (newStamps >= 7) {
    redeemedCount += Math.floor(newStamps / 7);
    newStamps = newStamps % 7;
    // Trigger WhatsApp reward notification
    whatsAppService.sendRewardNotification(cust.phone_number, cust.name).catch(console.error);
  }

  db.prepare(`
    UPDATE customers
    SET stamp_balance = ?, total_rewards_redeemed = ?, total_visits = total_visits + 1,
        total_spent = total_spent + ?, last_visit_at = ?
    WHERE id = ?
  `).run(newStamps, redeemedCount, totalAmount, new Date().toISOString(), customerId);

  // Record ledger
  db.prepare(`
    INSERT INTO stamp_ledger (id, customer_id, order_id, change_amount, new_balance, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(nanoid(), customerId, orderId, coffeeCups, newStamps, `Kunjungan Order #${orderId.slice(-4)}`, new Date().toISOString());
}

// Update KDS Status (Queued -> Brewing -> Ready -> Served)
app.patch('/api/orders/:orderId/items/:itemId/kds-status', async (req) => {
  const { orderId, itemId } = req.params as { orderId: string; itemId: string };
  const { kdsStatus } = req.body as { kdsStatus: string };

  db.prepare(`
    UPDATE order_items
    SET kds_status = ?
    WHERE id = ? AND order_id = ?
  `).run(kdsStatus, itemId, orderId);

  broadcastWs({
    event: 'KDS_STATUS_CHANGED',
    payload: { orderId, itemId, kdsStatus },
    timestamp: new Date().toISOString()
  });

  return { success: true };
});

// Pay Open Tab
app.post('/api/orders/:orderId/pay', async (req) => {
  const { orderId } = req.params as { orderId: string };
  const { payments } = req.body as { payments: any[] };
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE orders
    SET status = 'PAID', paid_at = ?, payments = ?
    WHERE id = ?
  `).run(now, JSON.stringify(payments), orderId);

  broadcastWs({
    event: 'ORDER_UPDATED',
    payload: { orderId, status: 'PAID' },
    timestamp: now
  });

  return { success: true };
});

// 6. CRM & Customer Management
app.post('/api/customers/lookup-or-create', async (req) => {
  const { phone, name } = req.body as { phone: string; name?: string };
  const cleanPhone = phone.replace(/\D/g, '');
  const standardPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  let customer = db.prepare('SELECT * FROM customers WHERE phone_number = ?').get(standardPhone) as any;
  if (!customer) {
    const id = nanoid();
    const now = new Date().toISOString();
    const custName = name?.trim() || `Pelanggan ${standardPhone.slice(-4)}`;
    db.prepare(`
      INSERT INTO customers (id, phone_number, name, stamp_balance, total_rewards_redeemed, coffee_pass_balance, total_visits, total_spent, first_visit_at, last_visit_at)
      VALUES (?, ?, ?, 0, 0, 0, 1, 0, ?, ?)
    `).run(id, standardPhone, custName, now, now);

    customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  }

  return {
    id: customer.id,
    phoneNumber: customer.phone_number,
    name: customer.name,
    stampBalance: customer.stamp_balance,
    totalRewardsRedeemed: customer.total_rewards_redeemed,
    coffeePassBalance: customer.coffee_pass_balance,
    totalVisits: customer.total_visits,
    totalSpent: customer.total_spent,
    lastVisitAt: customer.last_visit_at
  };
});

// 7. Cash Drawer Session (FR-SO-13)
app.get('/api/cash-drawer/active', async () => {
  const activeSession = db.prepare(`SELECT * FROM cash_drawer_sessions WHERE status = 'OPEN' ORDER BY opened_at DESC LIMIT 1`).get() as any;
  if (!activeSession) return { session: null };

  // Calculate current cash sales from orders during this session
  const cashSales = db.prepare(`
    SELECT SUM(total_amount) as total
    FROM orders
    WHERE status = 'PAID' AND created_at >= ?
  `).get(activeSession.opened_at) as { total: number };

  const pettyCashTotal = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'IN' THEN amount ELSE 0 END) as totalIn,
      SUM(CASE WHEN type = 'OUT' THEN amount ELSE 0 END) as totalOut
    FROM petty_cash_mutations
    WHERE session_id = ?
  `).get(activeSession.id) as { totalIn: number; totalOut: number };

  const salesAmount = cashSales?.total || 0;
  const inAmount = pettyCashTotal?.totalIn || 0;
  const outAmount = pettyCashTotal?.totalOut || 0;
  const expectedCash = activeSession.opening_float + salesAmount + inAmount - outAmount;

  return {
    session: {
      id: activeSession.id,
      cashierUserId: activeSession.cashier_user_id,
      cashierName: activeSession.cashier_name,
      openedAt: activeSession.opened_at,
      openingFloat: activeSession.opening_float,
      systemCashSales: salesAmount,
      systemExpectedCash: expectedCash,
      status: activeSession.status
    }
  };
});

app.post('/api/cash-drawer/open', async (req) => {
  const { cashierId, cashierName, openingFloat } = req.body as { cashierId: string; cashierName: string; openingFloat: number };
  const id = nanoid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO cash_drawer_sessions (id, cashier_user_id, cashier_name, opened_at, opening_float, system_cash_sales, system_expected_cash, status)
    VALUES (?, ?, ?, ?, ?, 0, ?, 'OPEN')
  `).run(id, cashierId, cashierName, now, openingFloat, openingFloat);

  return { success: true, sessionId: id };
});

app.post('/api/cash-drawer/close', async (req) => {
  const { sessionId, actualCountedCash, notes } = req.body as { sessionId: string; actualCountedCash: number; notes?: string };
  const session = db.prepare('SELECT * FROM cash_drawer_sessions WHERE id = ?').get(sessionId) as any;
  if (!session) return { error: 'Session tidak ditemukan' };

  const cashSales = db.prepare(`SELECT SUM(total_amount) as total FROM orders WHERE status = 'PAID' AND created_at >= ?`).get(session.opened_at) as { total: number };
  const expected = session.opening_float + (cashSales?.total || 0);
  const variance = actualCountedCash - expected;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE cash_drawer_sessions
    SET closed_at = ?, system_cash_sales = ?, system_expected_cash = ?, actual_counted_cash = ?, variance = ?, status = 'CLOSED', notes = ?
    WHERE id = ?
  `).run(now, cashSales?.total || 0, expected, actualCountedCash, variance, notes || '', sessionId);

  return { success: true, variance };
});

app.post('/api/cash-drawer/petty-cash', async (req) => {
  const { sessionId, type, amount, reason, approvedBy } = req.body as { sessionId: string; type: 'IN' | 'OUT'; amount: number; reason: string; approvedBy: string };
  const id = nanoid();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO petty_cash_mutations (id, session_id, type, amount, reason, approved_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, sessionId, type, amount, reason, approvedBy, now);

  return { success: true, mutationId: id };
});

// 8. Stock Opname (FR-SO-09)
app.post('/api/stock-opname', async (req) => {
  const { sessionId, entries } = req.body as { sessionId: string; entries: { ingredientId: string; physicalStock: number; notes?: string }[] };
  const records = recordStockOpname(sessionId, entries);
  return { success: true, records };
});

// 9. Analytics Summary (FR-SO-14)
app.get('/api/analytics/summary', async () => {
  const totalSales = db.prepare(`SELECT SUM(total_amount) as totalRev, SUM(total_cogs) as totalCogs, COUNT(*) as totalOrders FROM orders WHERE status = 'PAID'`).get() as any;
  
  // Peak Hours Distribution
  const peakHours = db.prepare(`
    SELECT strftime('%H:00', created_at) as hour, COUNT(*) as count, SUM(total_amount) as revenue
    FROM orders
    WHERE status = 'PAID'
    GROUP BY hour
    ORDER BY hour ASC
  `).all();

  // Menu Contribution Margin
  const menuMargin = db.prepare(`
    SELECT 
      oi.product_name,
      SUM(oi.quantity) as total_qty,
      SUM(oi.subtotal) as total_revenue,
      SUM(oi.calculated_cogs) as total_cogs,
      (SUM(oi.subtotal) - SUM(oi.calculated_cogs)) as gross_margin,
      ROUND(((SUM(oi.subtotal) - SUM(oi.calculated_cogs)) / SUM(oi.subtotal)) * 100, 1) as margin_percent
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'PAID'
    GROUP BY oi.product_name
    ORDER BY total_qty DESC
    LIMIT 10
  `).all();

  return {
    overview: {
      revenue: totalSales?.totalRev || 0,
      cogs: totalSales?.totalCogs || 0,
      grossProfit: (totalSales?.totalRev || 0) - (totalSales?.totalCogs || 0),
      ordersCount: totalSales?.totalOrders || 0
    },
    peakHours,
    menuMargin
  };
});

// 10. WhatsApp Gateway Status & Config
app.get('/api/whatsapp/status', async () => {
  return whatsAppService.getStatus();
});

app.post('/api/whatsapp/pair', async (req) => {
  const { phoneNumber } = req.body as { phoneNumber: string };
  await whatsAppService.pairSession(phoneNumber);
  return { success: true };
});

app.post('/api/whatsapp/disconnect', async () => {
  whatsAppService.disconnectSession();
  return { success: true };
});

app.post('/api/whatsapp/trigger-reengagement', async () => {
  const result = await whatsAppService.triggerReEngagementRun();
  return result;
});

// 11. System Encrypted Backup (NFR)
app.post('/api/system/backup', async () => {
  return createEncryptedBackup();
});

// 12. Prepaid Coffee Pass Top-up & OTP Verification (FR-SO-11)
app.post('/api/customers/:id/coffee-pass/topup', async (req) => {
  const { id } = req.params as { id: string };
  const { cups } = req.body as { cups: number };
  db.prepare('UPDATE customers SET coffee_pass_balance = coffee_pass_balance + ? WHERE id = ?').run(cups, id);
  const cust = db.prepare('SELECT coffee_pass_balance FROM customers WHERE id = ?').get(id) as { coffee_pass_balance: number };
  db.prepare(`
    INSERT INTO coffee_pass_ledger (id, customer_id, change_amount, new_balance, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(nanoid(), id, cups, cust.coffee_pass_balance, new Date().toISOString());
  return { success: true, newBalance: cust.coffee_pass_balance };
});

app.post('/api/customers/:id/coffee-pass/request-otp', async (req) => {
  const { id } = req.params as { id: string };
  const cust = db.prepare('SELECT phone_number, name FROM customers WHERE id = ?').get(id) as { phone_number: string; name: string } | undefined;
  if (!cust) return { error: 'Pelanggan tidak ditemukan' };
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)').run(`otp_${id}`, otp);
  await whatsAppService.sendMessage(cust.phone_number, `🔐 Kode OTP Prepaid Coffee Pass Warung Kopi Luhur Anda: *${otp}*. Jangan bagikan kode ini kepada siapapun.`);
  return { success: true, otpSentTo: cust.phone_number };
});

// Start Daily Backup Scheduler
startDailyBackupScheduler();

// Start Server on 0.0.0.0 (Accessible across Local Wi-Fi router)
const PORT = 3001;
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`☕ [Warung Kopi Luhur] Master Node Local Hub running on ${address}`);
  console.log(`📡 WebSocket server ready at ws://0.0.0.0:${PORT}/ws`);
});

