import { db } from '../db';
import { OrderLineItem, StockOpnameEntry } from '@coffee-pos/shared-types';
import { nanoid } from 'nanoid';

export function calculateItemCogs(productId: string, quantity: number, modifiers?: any): number {
  const recipes = db.prepare(`
    SELECT r.ingredient_id, r.amount, r.unit, r.condition_rule, i.cost_per_unit
    FROM product_recipes r
    JOIN ingredients i ON r.ingredient_id = i.id
    WHERE r.product_id = ?
  `).all(productId) as { ingredient_id: string; amount: number; unit: string; condition_rule: string; cost_per_unit: number }[];

  let baseCogsPerUnit = 0;
  for (const item of recipes) {
    baseCogsPerUnit += (item.amount * item.cost_per_unit);
  }

  // Tambahan COGS jika ada modifier/add-ons tertentu
  if (modifiers) {
    if (modifiers.milkType === 'OAT_MILK') {
      baseCogsPerUnit += (120 * 45) - (120 * 18); // selisih oat milk vs fresh milk
    }
    if (modifiers.extraEspressoShot && modifiers.extraEspressoShot > 0) {
      baseCogsPerUnit += (modifiers.extraEspressoShot * 9 * 250); // 9g beans per extra shot
    }
    if (modifiers.extraSyrupPump && modifiers.extraSyrupPump > 0) {
      baseCogsPerUnit += (modifiers.extraSyrupPump * 20 * 12);
    }
  }

  // Jika produk belum punya BOM detail, gunakan default estimasi 30% dari harga
  if (baseCogsPerUnit === 0) {
    const prod = db.prepare('SELECT base_price FROM products WHERE id = ?').get(productId) as { base_price: number } | undefined;
    baseCogsPerUnit = prod ? prod.base_price * 0.32 : 3000;
  }

  return Math.round(baseCogsPerUnit * quantity);
}

export function deductInventoryForOrder(items: OrderLineItem[]): { lowStockAlerts: string[] } {
  const lowStockAlerts: string[] = [];

  const updateStockStmt = db.prepare(`
    UPDATE ingredients
    SET current_stock = current_stock - ?
    WHERE id = ?
  `);

  const checkThresholdStmt = db.prepare(`
    SELECT id, name, current_stock, min_threshold, unit
    FROM ingredients
    WHERE id = ?
  `);

  const deduct = db.transaction(() => {
    for (const item of items) {
      const recipes = db.prepare(`
        SELECT ingredient_id, amount
        FROM product_recipes
        WHERE product_id = ?
      `).all(item.productId) as { ingredient_id: string; amount: number }[];

      for (const recipe of recipes) {
        const totalDeduction = recipe.amount * item.quantity;
        updateStockStmt.run(totalDeduction, recipe.ingredient_id);

        const current = checkThresholdStmt.get(recipe.ingredient_id) as { id: string; name: string; current_stock: number; min_threshold: number; unit: string };
        if (current && current.current_stock <= current.min_threshold) {
          lowStockAlerts.push(`⚠️ Stok ${current.name} menipis! Sisa: ${current.current_stock.toFixed(1)} ${current.unit} (Batas minimum: ${current.min_threshold} ${current.unit})`);
        }
      }
    }
  });

  deduct();
  return { lowStockAlerts };
}

export function recordStockOpname(
  sessionId: string,
  entries: { ingredientId: string; physicalStock: number; notes?: string }[]
): StockOpnameEntry[] {
  const now = new Date().toISOString();
  const results: StockOpnameEntry[] = [];

  const getSystemStock = db.prepare('SELECT current_stock, name, unit FROM ingredients WHERE id = ?');
  const insertOpname = db.prepare(`
    INSERT INTO stock_opname_entries (id, session_id, ingredient_id, system_stock, physical_stock, variance, variance_percentage, notes, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateIngredientStock = db.prepare('UPDATE ingredients SET current_stock = ? WHERE id = ?');

  const execute = db.transaction(() => {
    for (const entry of entries) {
      const ing = getSystemStock.get(entry.ingredientId) as { current_stock: number; name: string; unit: string } | undefined;
      if (!ing) continue;

      const systemStock = ing.current_stock;
      const physicalStock = entry.physicalStock;
      const variance = physicalStock - systemStock;
      const variancePercentage = systemStock !== 0 ? (Math.abs(variance) / systemStock) * 100 : 0;

      const id = nanoid();
      insertOpname.run(
        id,
        sessionId,
        entry.ingredientId,
        systemStock,
        physicalStock,
        variance,
        variancePercentage,
        entry.notes || '',
        now
      );

      // Sesuaikan stok di database dengan stok fisik hasil penimbangan opname
      updateIngredientStock.run(physicalStock, entry.ingredientId);

      results.push({
        id,
        sessionId,
        ingredientId: entry.ingredientId,
        systemStock,
        physicalStock,
        variance,
        variancePercentage,
        notes: entry.notes,
        recordedAt: now
      });
    }
  });

  execute();
  return results;
}

