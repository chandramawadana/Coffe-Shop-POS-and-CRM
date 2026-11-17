import { Order, WARUNG_KOPI_LUHUR_BRAND } from '@coffee-pos/shared-types';

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init(): this {
    this.buffer.push(0x1B, 0x40); // ESC @ Initialize
    return this;
  }

  alignCenter(): this {
    this.buffer.push(0x1B, 0x61, 0x01); // ESC a 1
    return this;
  }

  alignLeft(): this {
    this.buffer.push(0x1B, 0x61, 0x00); // ESC a 0
    return this;
  }

  alignRight(): this {
    this.buffer.push(0x1B, 0x61, 0x02); // ESC a 2
    return this;
  }

  bold(enable: boolean): this {
    this.buffer.push(0x1B, 0x45, enable ? 0x01 : 0x00); // ESC E
    return this;
  }

  doubleSize(enable: boolean): this {
    this.buffer.push(0x1D, 0x21, enable ? 0x11 : 0x00); // GS !
    return this;
  }

  feed(lines = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  text(str: string): this {
    const bytes = new TextEncoder().encode(str);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  line(str: string): this {
    this.text(str);
    this.feed(1);
    return this;
  }

  separator(char = '-', width = 32): this {
    this.line(char.repeat(width));
    return this;
  }

  twoColumn(left: string, right: string, width = 32): this {
    const spaceCount = Math.max(1, width - left.length - right.length);
    this.line(left + ' '.repeat(spaceCount) + right);
    return this;
  }

  cut(): this {
    this.feed(3);
    this.buffer.push(0x1D, 0x56, 0x41, 0x00); // GS V A 0 Full Cut
    return this;
  }

  kickDrawer(): this {
    // ESC p m t1 t2 (Kick drawer RJ11 connected to pin 2)
    this.buffer.push(0x1B, 0x70, 0x00, 0x19, 0xFA);
    return this;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export function buildReceiptReceipt(order: Order, width = 32): Uint8Array {
  const p = new EscPosBuilder();

  // Header
  p.alignCenter().bold(true).doubleSize(true);
  p.line('WARUNG KOPI LUHUR');
  p.doubleSize(false).bold(false);
  p.line('Cita Rasa Luhur Warisan Nusantara');
  p.line('Jl. Kopi Luhur No. 1');
  p.line('Telp: 0812-3456-7890');
  p.separator('=', width);

  // Order Details
  p.alignLeft();
  p.twoColumn(`Order: ${order.orderNumber}`, `${order.type}`, width);
  p.twoColumn(`Waktu: ${new Date(order.createdAt).toLocaleTimeString('id-ID')}`, `Kasir: ${order.cashierName}`, width);
  if (order.tableName) {
    p.twoColumn('Meja:', order.tableName, width);
  }
  if (order.customerName) {
    p.twoColumn('Pelanggan:', order.customerName, width);
  }
  p.separator('-', width);

  // Items
  for (const item of order.items) {
    p.bold(true).line(item.productName);
    p.bold(false);

    // Modifiers note
    const mods: string[] = [];
    if (item.modifiers.temperature) mods.push(item.modifiers.temperature);
    if (item.modifiers.sweetness) mods.push(`Manis ${item.modifiers.sweetness}`);
    if (item.modifiers.milkType && item.modifiers.milkType !== 'FRESH_MILK' && item.modifiers.milkType !== 'NONE') {
      mods.push(item.modifiers.milkType.replace('_', ' '));
    }
    if (mods.length > 0) {
      p.line(`  * ${mods.join(', ')}`);
    }

    const priceText = `${item.quantity} x Rp ${item.unitPrice.toLocaleString('id-ID')}`;
    const subtotalText = `Rp ${item.subtotal.toLocaleString('id-ID')}`;
    p.twoColumn(`  ${priceText}`, subtotalText, width);
  }

  p.separator('-', width);

  // Summary
  p.twoColumn('Subtotal:', `Rp ${order.subtotal.toLocaleString('id-ID')}`, width);
  if (order.discountAmount > 0) {
    p.twoColumn('Diskon:', `-Rp ${order.discountAmount.toLocaleString('id-ID')}`, width);
  }
  p.bold(true);
  p.twoColumn('TOTAL:', `Rp ${order.totalAmount.toLocaleString('id-ID')}`, width);
  p.bold(false);

  // Payment Breakdown
  p.separator('-', width);
  for (const pay of order.payments) {
    p.twoColumn(`Bayar (${pay.method}):`, `Rp ${pay.amount.toLocaleString('id-ID')}`, width);
    if (pay.cashReceived && pay.cashReceived > 0) {
      p.twoColumn('Diterima:', `Rp ${pay.cashReceived.toLocaleString('id-ID')}`, width);
      p.twoColumn('Kembali:', `Rp ${(pay.cashChange || 0).toLocaleString('id-ID')}`, width);
    }
  }

  // Footer & Loyalty
  p.separator('=', width);
  p.alignCenter();
  p.line('Terima Kasih Atas Kunungan Anda!');
  p.line('Kumpulkan 7 Stamp: 1 Kopi Gratis');
  p.line('Follow IG: @warungkopiluhur');
  p.feed(1);

  p.kickDrawer();
  p.cut();

  return p.getBytes();
}

