import React, { useState } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, DollarSign, CreditCard, QrCode, Split, Receipt, ShieldCheck } from 'lucide-react';
import { Order, PaymentMethod, PaymentRecord } from '@coffee-pos/shared-types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  totalAmount: number;
  customerPhone: string;
  customerName: string;
  tableName: string;
  onConfirmPayment: (payments: PaymentRecord[], orderType: 'DINE_IN' | 'TAKEAWAY', isDraftTab: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  customerPhone,
  customerName,
  tableName,
  onConfirmPayment
}) => {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('CASH');
  const [cashGiven, setCashGiven] = useState<number>(totalAmount);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [qrisQrDataUrl, setQrisQrDataUrl] = useState<string | null>(null);

  // Split bill state
  const [splitCash, setSplitCash] = useState<number>(Math.floor(totalAmount / 2));
  const [splitNonCash, setSplitNonCash] = useState<number>(totalAmount - Math.floor(totalAmount / 2));

  React.useEffect(() => {
    setCashGiven(totalAmount);
    // Generate dynamic QRIS payload string
    const qrisPayload = `00020101021226600016ID.CO.WARUNGKOPILUHUR.WWW0118936009990000000001520458125303360540${totalAmount}5802ID5917WARUNG KOPI LUHUR6007BANDUNG6304`;
    QRCode.toDataURL(qrisPayload, {
      margin: 1,
      scale: 5,
      color: { dark: '#193153', light: '#FFFFFF' }
    }).then(setQrisQrDataUrl);
  }, [totalAmount, isOpen]);

  if (!isOpen) return null;

  const cashChange = Math.max(0, cashGiven - totalAmount);

  const handleCashShortcut = (amount: number) => {
    setCashGiven(amount);
  };

  const handlePayComplete = (isDraftTab = false) => {
    let payments: PaymentRecord[] = [];

    if (isDraftTab) {
      onConfirmPayment([], orderType, true);
      return;
    }

    if (activeMethod === 'CASH') {
      payments = [{
        method: 'CASH',
        amount: totalAmount,
        cashReceived: cashGiven,
        cashChange: cashChange
      }];
    } else if (activeMethod === 'SPLIT') {
      payments = [
        { method: 'CASH', amount: splitCash, cashReceived: splitCash, cashChange: 0 },
        { method: 'EDC_DEBIT', amount: splitNonCash, referenceNumber: 'SPLIT-CARD' }
      ];
    } else {
      payments = [{
        method: activeMethod,
        amount: totalAmount,
        referenceNumber: activeMethod === 'QRIS_DYNAMIC' ? 'QRIS-' + Date.now().toString().slice(-6) : 'EDC-AUTH'
      }];
    }

    onConfirmPayment(payments, orderType, false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-luhur-cream border-2 border-luhur-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#241C16] text-[#F7F3EB] px-6 py-4 flex items-center justify-between border-b border-[#3A2E25]">
          <div>
            <span className="font-serif font-bold text-xl text-[#F7F3EB]">Penyelesaian <span className="italic font-normal">Pembayaran</span></span>
            <p className="text-xs text-[#C8BEB0]">Warung Kopi Luhur • Terminal Kasir Utama</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3A2E25] text-[#C8BEB0]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sisi Kiri: Ringkasan Tagihan & Pilihan Metode */}
          <div className="space-y-4">
            {/* Total Display */}
            <div className="bg-[#F7F3EB] p-4 rounded-2xl border border-[#D5CBB8] shadow-sm text-center">
              <span className="text-xs uppercase font-bold text-[#6E6258]">Total Yang Harus Dibayar</span>
              <div className="font-sans font-black text-3xl text-[#241C16] mt-1">
                Rp {totalAmount.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  onClick={() => setOrderType('DINE_IN')}
                  className={`px-3.5 py-1 text-xs rounded-full font-bold border transition ${
                    orderType === 'DINE_IN'
                      ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5]'
                      : 'bg-[#EAE2D3] text-[#6E6258] border-[#D5CBB8]'
                  }`}
                >
                  Dine In {tableName ? `(${tableName})` : ''}
                </button>
                <button
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`px-3.5 py-1 text-xs rounded-full font-bold border transition ${
                    orderType === 'TAKEAWAY'
                      ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5]'
                      : 'bg-[#EAE2D3] text-[#6E6258] border-[#D5CBB8]'
                  }`}
                >
                  Takeaway
                </button>
              </div>
            </div>

            {/* Metode Pembayaran Tabs */}
            <div>
              <span className="text-xs font-bold text-[#241C16] uppercase tracking-wider block mb-2">
                Pilih Metode Pembayaran:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveMethod('CASH')}
                  className={`p-3 rounded-2xl border flex items-center space-x-2 text-sm font-bold transition ${
                    activeMethod === 'CASH'
                      ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5] shadow-sm'
                      : 'bg-[#F7F3EB] text-[#241C16] border-[#D5CBB8] hover:bg-[#E0D6C5]'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  onClick={() => setActiveMethod('QRIS_DYNAMIC')}
                  className={`p-3 rounded-2xl border flex items-center space-x-2 text-sm font-bold transition ${
                    activeMethod === 'QRIS_DYNAMIC'
                      ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5] shadow-sm'
                      : 'bg-[#F7F3EB] text-[#241C16] border-[#D5CBB8] hover:bg-[#E0D6C5]'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>QRIS Dinamis</span>
                </button>

                <button
                  onClick={() => setActiveMethod('EDC_DEBIT')}
                  className={`p-3 rounded-2xl border flex items-center space-x-2 text-sm font-bold transition ${
                    activeMethod === 'EDC_DEBIT'
                      ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5] shadow-sm'
                      : 'bg-[#F7F3EB] text-[#241C16] border-[#D5CBB8] hover:bg-[#E0D6C5]'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Debit / Kartu EDC</span>
                </button>

                <button
                  onClick={() => setActiveMethod('SPLIT')}
                  className={`p-3 rounded-2xl border flex items-center space-x-2 text-sm font-bold transition ${
                    activeMethod === 'SPLIT'
                      ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5] shadow-sm'
                      : 'bg-[#F7F3EB] text-[#241C16] border-[#D5CBB8] hover:bg-[#E0D6C5]'
                  }`}
                >
                  <Split className="w-5 h-5" />
                  <span>Split Bill</span>
                </button>
              </div>
            </div>

            {/* Info Pelanggan & WhatsApp Receipt Check */}
            <div className="bg-[#E0D6C5] p-3 rounded-2xl border border-[#D5CBB8] text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-[#241C16] mb-1">
                <ShieldCheck className="w-4 h-4 text-[#241C16]" />
                <span>Pelanggan &amp; Struk WhatsApp</span>
              </div>
              <p className="text-[#6E6258]">
                {customerPhone 
                  ? `Struk otomatis dikirim ke WA ${customerPhone} (${customerName || 'Tamu'}).`
                  : 'Nomor WhatsApp belum dimasukkan. Pelanggan tetap bisa scan QR di struk cetak.'}
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Detail Input Berdasarkan Metode */}
          <div className="bg-[#F7F3EB] p-4 rounded-2xl border border-[#D5CBB8] shadow-sm flex flex-col justify-between">
            {activeMethod === 'CASH' && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-gray-500 uppercase">Input Uang Diterima</span>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-gray-400">Rp</span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 text-2xl font-black text-luhur-coffee border-2 border-luhur-border rounded-xl focus:border-luhur-red focus:outline-none"
                  />
                </div>

                {/* Tombol Shortcut Uang Pas & Pecahan */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCashShortcut(totalAmount)}
                    className="py-2 px-3 bg-luhur-creamDark border border-luhur-border rounded-lg text-xs font-bold text-luhur-coffee hover:bg-luhur-border"
                  >
                    Uang Pas
                  </button>
                  <button
                    onClick={() => handleCashShortcut(20000)}
                    className="py-2 px-3 bg-luhur-creamDark border border-luhur-border rounded-lg text-xs font-bold text-luhur-coffee hover:bg-luhur-border"
                  >
                    Rp 20.000
                  </button>
                  <button
                    onClick={() => handleCashShortcut(50000)}
                    className="py-2 px-3 bg-luhur-creamDark border border-luhur-border rounded-lg text-xs font-bold text-luhur-coffee hover:bg-luhur-border"
                  >
                    Rp 50.000
                  </button>
                  <button
                    onClick={() => handleCashShortcut(100000)}
                    className="py-2 px-3 bg-luhur-creamDark border border-luhur-border rounded-lg text-xs font-bold text-luhur-coffee hover:bg-luhur-border"
                  >
                    Rp 100.000
                  </button>
                </div>

                {/* Kembalian */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                  <span className="text-xs font-bold text-green-700 uppercase">Uang Kembalian</span>
                  <div className="text-2xl font-black text-green-800">
                    Rp {cashChange.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            )}

            {activeMethod === 'QRIS_DYNAMIC' && (
              <div className="text-center space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Scan QRIS Dinamis</span>
                <div className="w-48 h-48 mx-auto border-2 border-luhur-navy rounded-xl p-2 bg-white shadow-inner flex items-center justify-center">
                  {qrisQrDataUrl ? (
                    <img src={qrisQrDataUrl} alt="QRIS Warung Kopi Luhur" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400">Menghasilkan QRIS...</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-600">
                  Nominal presisi <b className="text-luhur-red">Rp {totalAmount.toLocaleString('id-ID')}</b> otomatis terkunci.
                </p>
              </div>
            )}

            {activeMethod === 'EDC_DEBIT' && (
              <div className="space-y-4 text-center py-6">
                <CreditCard className="w-16 h-16 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-lg text-luhur-coffee">Pembayaran Mesin EDC</h4>
                <p className="text-xs text-gray-600">
                  Silakan gesek / insert kartu debit atau kredit pada mesin EDC kasir sebesar:
                </p>
                <div className="text-2xl font-black text-luhur-red">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </div>
              </div>
            )}

            {activeMethod === 'SPLIT' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase">Konfigurasi Split Bill</span>
                <div>
                  <label className="text-xs font-bold text-gray-600">Porsi Tunai (Cash):</label>
                  <input
                    type="number"
                    value={splitCash}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSplitCash(val);
                      setSplitNonCash(Math.max(0, totalAmount - val));
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Porsi Non-Tunai (Debit/QRIS):</label>
                  <input
                    type="number"
                    value={splitNonCash}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSplitNonCash(val);
                      setSplitCash(Math.max(0, totalAmount - val));
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg font-bold"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-[#D5CBB8]">
              <button
                onClick={() => handlePayComplete(false)}
                className="w-full py-3.5 bg-[#8ABFF8] hover:bg-[#6CAEF5] active:scale-[0.99] transition text-[#241C16] font-sans font-extrabold text-base rounded-full shadow flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5 text-[#241C16]" />
                <span>Konfirmasi Lunas (Bayar)</span>
              </button>

              {/* Fasilitas Open Tab FR-SO-04 */}
              <button
                onClick={() => handlePayComplete(true)}
                className="w-full py-2.5 bg-[#241C16] hover:bg-[#3A2E25] text-[#F7F3EB] text-xs font-bold rounded-full flex items-center justify-center space-x-1.5 transition"
              >
                <Receipt className="w-4 h-4 text-[#8ABFF8]" />
                <span>Simpan Sebagai Open Tab (Bayar di Akhir)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

