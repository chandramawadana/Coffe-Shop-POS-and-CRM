import { Order, ProductItem, Ingredient, StaffUser, WsMessage } from '@coffee-pos/shared-types';

const API_BASE = '/api';

export async function fetchBrandInfo() {
  const res = await fetch(`${API_BASE}/brand`);
  return res.json();
}

export async function loginWithPin(pin: string): Promise<StaffUser> {
  const res = await fetch(`${API_BASE}/auth/pin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login gagal');
  }
  const data = await res.json();
  return data.user;
}

export async function fetchProducts(): Promise<ProductItem[]> {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  const res = await fetch(`${API_BASE}/ingredients`);
  return res.json();
}

export async function createOrder(orderPayload: Partial<Order>): Promise<{ order: Order; lowStockAlerts: string[] }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  return res.json();
}

export async function fetchKdsOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders/kds`);
  return res.json();
}

export async function fetchOpenTabs(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders/open-tabs`);
  return res.json();
}

export async function updateKdsItemStatus(orderId: string, itemId: string, kdsStatus: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/items/${itemId}/kds-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kdsStatus })
  });
  return res.json();
}

export async function payOrder(orderId: string, payments: any[]) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payments })
  });
  return res.json();
}

export async function lookupOrCreateCustomer(phone: string, name?: string) {
  const res = await fetch(`${API_BASE}/customers/lookup-or-create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name })
  });
  return res.json();
}

export async function fetchActiveCashDrawer() {
  const res = await fetch(`${API_BASE}/cash-drawer/active`);
  return res.json();
}

export async function openCashDrawerSession(cashierId: string, cashierName: string, openingFloat: number) {
  const res = await fetch(`${API_BASE}/cash-drawer/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cashierId, cashierName, openingFloat })
  });
  return res.json();
}

export async function closeCashDrawerSession(sessionId: string, actualCountedCash: number, notes?: string) {
  const res = await fetch(`${API_BASE}/cash-drawer/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, actualCountedCash, notes })
  });
  return res.json();
}

export async function submitPettyCash(sessionId: string, type: 'IN' | 'OUT', amount: number, reason: string, approvedBy: string) {
  const res = await fetch(`${API_BASE}/cash-drawer/petty-cash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, type, amount, reason, approvedBy })
  });
  return res.json();
}

export async function submitStockOpname(sessionId: string, entries: { ingredientId: string; physicalStock: number; notes?: string }[]) {
  const res = await fetch(`${API_BASE}/stock-opname`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, entries })
  });
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  return res.json();
}

export async function fetchWhatsAppStatus() {
  const res = await fetch(`${API_BASE}/whatsapp/status`);
  return res.json();
}

export async function pairWhatsAppSession(phoneNumber: string) {
  const res = await fetch(`${API_BASE}/whatsapp/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });
  return res.json();
}

export async function disconnectWhatsAppSession() {
  const res = await fetch(`${API_BASE}/whatsapp/disconnect`, {
    method: 'POST'
  });
  return res.json();
}

export async function triggerReEngagement() {
  const res = await fetch(`${API_BASE}/whatsapp/trigger-reengagement`, {
    method: 'POST'
  });
  return res.json();
}

// ========================
// REAL-TIME WEBSOCKET (LAN)
// ========================

type WsCallback = (msg: WsMessage) => void;

class LanWebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<WsCallback> = new Set();
  private reconnectTimer: any = null;

  constructor() {
    this.connect();
  }

  public connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LAN WebSocket] Connected to Warung Kopi Luhur Hub');
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          for (const listener of this.listeners) {
            listener(parsed);
          }
        } catch (err) {
          // ignore
        }
      };

      this.ws.onclose = () => {
        console.warn('[LAN WebSocket] Disconnected. Reconnecting in 3s...');
        this.reconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (err) {
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  public subscribe(cb: WsCallback) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public send(event: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    }
  }
}

export const lanWsClient = new LanWebSocketClient();

