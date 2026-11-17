import { Order } from '@coffee-pos/shared-types';
import { buildReceiptReceipt, EscPosBuilder } from '@coffee-pos/escpos-builder';

class ThermalPrinterService {
  private bluetoothDevice: any = null;
  private characteristic: any = null;

  public async connectBluetooth(): Promise<boolean> {
    if (!('bluetooth' in navigator)) {
      alert('Browser ini belum mendukung Web Bluetooth API. Gunakan Google Chrome pada Android / PC.');
      return false;
    }

    try {
      this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await this.bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      this.characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      return true;
    } catch (err) {
      console.warn('Bluetooth connection cancelled or failed:', err);
      return false;
    }
  }

  public async printReceipt(order: Order): Promise<boolean> {
    const rawBytes = buildReceiptReceipt(order, 32);

    if (this.characteristic) {
      try {
        // Send chunks of 20 bytes for Bluetooth LE MTU compatibility
        for (let i = 0; i < rawBytes.length; i += 20) {
          const chunk = rawBytes.slice(i, i + 20);
          await this.characteristic.writeValue(chunk);
        }
        return true;
      } catch (err) {
        console.error('Failed to write via Bluetooth:', err);
      }
    }

    // Fallback: Trigger browser print dialog formatted for 58mm / 80mm thermal receipt
    this.printViaBrowserFallback(order);
    return true;
  }

  public async kickCashDrawer(): Promise<void> {
    const builder = new EscPosBuilder();
    builder.kickDrawer();
    const bytes = builder.getBytes();

    if (this.characteristic) {
      try {
        await this.characteristic.writeValue(bytes);
      } catch (err) {
        console.warn('Cash drawer kick failed:', err);
      }
    }
  }

  private printViaBrowserFallback(order: Order): void {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    let itemsHtml = '';
    for (const it of order.items) {
      const mods = Object.values(it.modifiers || {}).filter(Boolean).join(', ');
      itemsHtml += `
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <div>
            <b>${it.productName}</b> x${it.quantity}<br/>
            ${mods ? `<small style="color:#555;">${mods}</small>` : ''}
          </div>
          <div>Rp ${it.subtotal.toLocaleString('id-ID')}</div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk #${order.orderNumber}</title>
          <style>
            body { font-family: monospace; width: 58mm; padding: 4px; margin: 0 auto; color: #000; font-size: 12px; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="center">
            <h3 style="margin: 4px 0;">WARUNG KOPI LUHUR</h3>
            <p style="margin: 2px 0;">Cita Rasa Luhur Nusantara</p>
            <small>Telp: 0812-3456-7890</small>
          </div>
          <div class="divider"></div>
          <div class="row"><span>No: #${order.orderNumber}</span> <span>${order.type}</span></div>
          <div class="row"><span>Waktu: ${new Date(order.createdAt).toLocaleTimeString('id-ID')}</span> <span>Kasir: ${order.cashierName}</span></div>
          ${order.tableName ? `<div class="row"><span>Meja:</span> <span>${order.tableName}</span></div>` : ''}
          ${order.customerName ? `<div class="row"><span>Pelanggan:</span> <span>${order.customerName}</span></div>` : ''}
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span> <span>Rp ${order.subtotal.toLocaleString('id-ID')}</span></div>
          ${order.discountAmount > 0 ? `<div class="row"><span>Diskon:</span> <span>-Rp ${order.discountAmount.toLocaleString('id-ID')}</span></div>` : ''}
          <div class="row" style="font-size: 14px; font-weight: bold;"><span>TOTAL:</span> <span>Rp ${order.totalAmount.toLocaleString('id-ID')}</span></div>
          <div class="divider"></div>
          ${order.payments.map(p => `
            <div class="row"><span>Bayar (${p.method}):</span> <span>Rp ${p.amount.toLocaleString('id-ID')}</span></div>
            ${p.cashReceived ? `<div class="row"><span>Diterima:</span> <span>Rp ${p.cashReceived.toLocaleString('id-ID')}</span></div>` : ''}
            ${p.cashChange ? `<div class="row"><span>Kembali:</span> <span>Rp ${p.cashChange.toLocaleString('id-ID')}</span></div>` : ''}
          `).join('')}
          <div class="divider"></div>
          <div class="center" style="margin-top: 10px;">
            <p>Terima Kasih Atas Kunjungannya!<br/>Kumpulkan 7 Stamp: 1 Kopi Gratis</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}

export const thermalPrinterService = new ThermalPrinterService();

