import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Coffee, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { lanWsClient } from '../../services/api';

export const CustomerDisplayView: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [qrisQrDataUrl, setQrisQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = lanWsClient.subscribe((msg) => {
      const payload = msg.payload as any;
      if (msg.event === 'ORDER_CREATED') {
        setActiveOrder(payload);
        generateQris(payload.totalAmount);
      } else if (msg.event === 'CUSTOMER_DISPLAY_UPDATE') {
        setActiveOrder(payload);
        if (payload?.totalAmount) {
          generateQris(payload.totalAmount);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const generateQris = async (amount: number) => {
    const qrisPayload = `00020101021226600016ID.CO.WARUNGKOPILUHUR.WWW0118936009990000000001520458125303360540${amount}5802ID5917WARUNG KOPI LUHUR6007BANDUNG6304`;
    const url = await QRCode.toDataURL(qrisPayload, {
      margin: 1,
      scale: 7,
      color: { dark: '#193153', light: '#FFFFFF' }
    });
    setQrisQrDataUrl(url);
  };

  return (
    <div className="flex-1 bg-[#EAE2D3] flex flex-col md:flex-row h-[calc(100vh-62px)] overflow-hidden">
      {/* Kolom Kiri: Visual Banner & QRIS Dinamis */}
      <div className="flex-1 bg-[#241C16] p-8 text-[#F7F3EB] flex flex-col justify-between items-center text-center">
        {/* Header */}
        <div>
          <div className="inline-block bg-[#8ABFF8] text-[#241C16] px-4 py-1 rounded-full text-xs font-sans font-bold tracking-widest uppercase mb-3 shadow">
            Warung Kopi Luhur
          </div>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#F7F3EB]">
            Cita Rasa Luhur <span className="italic font-normal">Warisan Nusantara</span>
          </h1>
          <p className="text-sm text-[#C8BEB0] mt-2 font-serif italic">
            Silakan periksa pesanan Anda &amp; scan QRIS untuk pembayaran cepat
          </p>
        </div>

        {/* Dynamic QRIS Card */}
        <div className="bg-[#F7F3EB] p-6 rounded-3xl shadow-2xl border border-[#D5CBB8] text-[#241C16] max-w-sm w-full my-4">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <QrCode className="w-6 h-6 text-[#241C16]" />
            <span className="font-serif font-bold text-lg text-[#241C16]">QRIS Dinamis</span>
          </div>

          <div className="w-56 h-56 mx-auto bg-white border border-[#D5CBB8] rounded-2xl flex items-center justify-center p-2">
            {qrisQrDataUrl && activeOrder ? (
              <img src={qrisQrDataUrl} alt="QRIS Warung Kopi Luhur" className="w-full h-full object-contain" />
            ) : (
              <div className="text-[#6E6258] text-xs text-center p-4">
                <Coffee className="w-10 h-10 mx-auto text-[#D5CBB8] mb-2 animate-bounce" />
                <span>Menunggu kasir menyelesaikan input menu...</span>
              </div>
            )}
          </div>

          {activeOrder && (
            <div className="mt-4 pt-3 border-t border-[#D5CBB8]">
              <span className="text-xs uppercase font-bold text-[#6E6258] block">Total Pembayaran</span>
              <span className="font-sans font-black text-3xl text-[#241C16]">
                Rp {activeOrder.totalAmount?.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>

        {/* Footer Retention Banner */}
        <div className="bg-[#3A2E25] border border-[#524337] rounded-2xl p-4 max-w-lg w-full flex items-center space-x-3 text-left">
          <Sparkles className="w-8 h-8 text-[#8ABFF8] flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#8ABFF8] block">Program Loyalitas Digital Kopi Luhur:</span>
            <span className="text-[#EAE2D3]">
              Sebutkan nomor WhatsApp Anda ke kasir! Kumpulkan 7 Stamp untuk klaim 1 Kopi Gratis.
            </span>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Rincian Pesanan Terkini */}
      <div className="w-full md:w-96 bg-[#F7F3EB] border-l border-[#D5CBB8] flex flex-col p-6">
        <h3 className="font-serif font-bold text-xl text-[#241C16] border-b border-[#D5CBB8] pb-3 mb-4 flex items-center justify-between">
          <span>Rincian Pesanan</span>
          {activeOrder && (
            <span className="text-xs font-mono font-bold bg-[#8ABFF8] text-[#241C16] px-2.5 py-0.5 rounded-full">
              #{activeOrder.orderNumber}
            </span>
          )}
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3">
          {!activeOrder || !activeOrder.items || activeOrder.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#6E6258] space-y-2 text-center">
              <Coffee className="w-12 h-12 text-[#D5CBB8]" />
              <p className="text-xs font-medium">Belum ada item pesanan yang dipilih</p>
            </div>
          ) : (
            activeOrder.items.map((item: any) => (
              <div key={item.id} className="p-3 bg-[#EAE2D3]/70 rounded-xl border border-[#D5CBB8]">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-serif font-bold text-sm text-[#241C16]">
                      {item.productName}
                    </h5>
                    <span className="text-xs text-[#6E6258]">
                      {item.quantity} x Rp {item.unitPrice.toLocaleString('id-ID')}
                    </span>
                    {/* Modifiers */}
                    <div className="text-[11px] text-[#241C16] font-medium mt-0.5">
                      {Object.values(item.modifiers || {}).filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <span className="font-sans font-bold text-sm text-[#241C16]">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {activeOrder && (
          <div className="pt-4 border-t border-[#D5CBB8] space-y-2">
            <div className="flex justify-between text-xs text-[#6E6258]">
              <span>Subtotal:</span>
              <span className="font-bold text-[#241C16]">Rp {activeOrder.subtotal?.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-sans font-black text-[#241C16]">
              <span>Total:</span>
              <span>Rp {activeOrder.totalAmount?.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
