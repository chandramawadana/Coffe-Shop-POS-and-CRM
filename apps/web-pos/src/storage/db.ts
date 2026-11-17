import Dexie, { Table } from 'dexie';
import { Order, ProductItem, Ingredient, StaffUser } from '@coffee-pos/shared-types';

export interface OfflineOrderRecord {
  id: string;
  order: Order;
  synced: boolean;
  createdAt: string;
}

export class PosLocalDatabase extends Dexie {
  products!: Table<ProductItem, string>;
  ingredients!: Table<Ingredient, string>;
  offlineOrders!: Table<OfflineOrderRecord, string>;
  cachedStaff!: Table<StaffUser, string>;

  constructor() {
    super('WarungKopiLuhurLocalDB');
    this.version(1).stores({
      products: 'id, name, category, targetStation',
      ingredients: 'id, name, category',
      offlineOrders: 'id, synced, createdAt',
      cachedStaff: 'id, role, pin'
    });
  }
}

export const localDb = new PosLocalDatabase();

