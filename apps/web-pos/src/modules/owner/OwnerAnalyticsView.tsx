import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Lock, 
  PlusCircle, 
  MinusCircle, 
  CheckCircle2, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { StaffUser } from '@coffee-pos/shared-types';
import { 
  fetchAnalytics, 
  fetchActiveCashDrawer, 
  openCashDrawerSession, 
  closeCashDrawerSession, 
  submitPettyCash 
} from '../../services/api';

interface OwnerAnalyticsViewProps {
  currentUser: StaffUser | null;
  onOpenPinModal: () => void;
}

export const OwnerAnalyticsView: React.FC<OwnerAnalyticsViewProps> = ({ currentUser, onOpenPinModal }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [cashSession, setCashSession] = useState<any>(null);
  
  // Modals / Inputs
  const [openingFloatInput, setOpeningFloatInput] = useState<number>(200000);
  const [actualClosingCash, setActualClosingCash] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [pettyAmount, setPettyAmount] = useState<number>(50000);
  const [pettyReason, setPettyReason] = useState<string>('Beli es batu tambahan');
  const [pettyType, setPettyType] = useState<'IN' | 'OUT'>('OUT');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsData, drawerData] = await Promise.all([
        fetchAnalytics(),
        fetchActiveCashDrawer()
      ]);
      setAnalytics(analyticsData);
      setCashSession(drawerData.session);
      if (drawerData.session?.systemExpectedCash) {
        setActualClosingCash(drawerData.session.systemExpectedCash);
      }
    } catch (err) {
      console.error('Gagal memuat analitik:', err);
    }
  };

  const handleOpenDrawer = async () => {
    try {
      await openCashDrawerSession(
        currentUser?.id || 'usr-cashier',
        currentUser?.name || 'Kasir Utama',
        openingFloatInput
      );
      loadData();
    } catch (err) {
      console.error('Gagal membuka sesi kas:', err);
    }
  };

  const handleCloseDrawer = async () => {
    if (!cashSession) return;
    try {
      await closeCashDrawerSession(cashSession.id, actualClosingCash, closingNotes);
      alert('Sesi kasir berhasil ditutup dan direkonsiliasi.');
      loadData();
    } catch (err) {
      console.error('Gagal menutup kas:', err);
    }
  };

  const handleAddPettyCash = async () => {
    if (!cashSession) return;
    try {
      await submitPettyCash(
        cashSession.id,
        pettyType,
        pettyAmount,
        pettyReason,
        currentUser?.name || 'Supervisor'
      );
      setPettyReason('');
      loadData();
    } catch (err) {
      console.error('Gagal mencatat petty cash:', err);
    }
  };

  // Restrict access for non-managers/owners if needed
  const isAuthorized = currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER';

  return (
    <div className="flex-1 bg-[#EAE2D3] flex flex-col h-[calc(100vh-62px)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#E0D6C5] text-[#241C16] px-6 py-4 border-b border-[#D5CBB8] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#241C16] rounded-full text-[#8ABFF8]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#241C16]">
              Owner Hub: <span className="italic font-normal">Analitik Penjualan, HPP &amp; Rekonsiliasi Kas</span>
            </h2>
            <p className="text-xs text-[#6E6258]">
              Warung Kopi Luhur • Peak Hours, Margin Kontribusi Menu &amp; Cash Drawer Float Balancing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isAuthorized && (
            <button
              onClick={onOpenPinModal}
              className="px-4 py-2 bg-[#8ABFF8] hover:bg-[#6CAEF5] text-[#241C16] text-xs font-bold rounded-full shadow flex items-center space-x-1.5 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Buka Akses Owner/Manager (PIN 9999)</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border-2 border-luhur-border shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500">Total Omzet Penjualan</span>
            <div className="font-serif font-black text-2xl text-luhur-coffee mt-1">
              Rp {(analytics?.overview?.revenue || 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-green-700 font-bold block mt-1">
              {analytics?.overview?.ordersCount || 0} Transaksi Selesai
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-luhur-border shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500">Total HPP Aktual (BOM)</span>
            <div className="font-serif font-black text-2xl text-luhur-red mt-1">
              Rp {(analytics?.overview?.cogs || 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-gray-500 block mt-1">
              Kalkulasi gramatur riil terpotong
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-luhur-border shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500">Laba Kotor (Gross Profit)</span>
            <div className="font-serif font-black text-2xl text-emerald-700 mt-1">
              Rp {(analytics?.overview?.grossProfit || 0).toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold block mt-1">
              Margin Rata-rata: {analytics?.overview?.revenue ? Math.round((analytics.overview.grossProfit / analytics.overview.revenue) * 100) : 0}%
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-luhur-border shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500">Efisiensi Biaya SaaS POS</span>
            <div className="font-serif font-black text-2xl text-blue-700 mt-1">
              100% Hemat
            </div>
            <span className="text-[11px] text-blue-600 font-bold block mt-1">
              Bebas biaya langganan bulanan
            </span>
          </div>
        </div>

        {/* Section 1: FR-SO-13 Cash Drawer Float Balancing & Rekonsiliasi Kas */}
        <div className="bg-white p-6 rounded-2xl border-2 border-luhur-border shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-luhur-red" />
              <h3 className="font-serif font-bold text-lg text-luhur-coffee">
                Rekonsiliasi Kas Kasir (Cash Drawer Float Balancing - FR-SO-13)
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              cashSession?.status === 'OPEN'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {cashSession?.status === 'OPEN' ? 'Sesi Kasir: Terbuka' : 'Sesi Kasir: Belum Dibuka'}
            </span>
          </div>

          {!cashSession || cashSession.status === 'CLOSED' ? (
            <div className="bg-luhur-cream p-4 rounded-xl border border-luhur-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-luhur-coffee">Buka Sesi Kasir Baru (Shift Awal)</h4>
                <p className="text-xs text-gray-600">Masukkan modal kas awal untuk uang kembalian.</p>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <input
                  type="number"
                  value={openingFloatInput}
                  onChange={(e) => setOpeningFloatInput(Number(e.target.value))}
                  className="px-3 py-1.5 border rounded-lg text-sm font-bold w-36 text-center"
                />
                <button
                  onClick={handleOpenDrawer}
                  className="px-4 py-2 bg-luhur-red text-white text-xs font-bold rounded-lg hover:bg-luhur-redDark transition shadow"
                >
                  Buka Kasir
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kolom Status Kas */}
              <div className="bg-luhur-cream p-4 rounded-xl border border-luhur-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kasir Bertugas:</span>
                  <span className="font-bold">{cashSession.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kas Modal Awal:</span>
                  <span className="font-bold">Rp {cashSession.openingFloat?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Penjualan Tunai Sistem:</span>
                  <span className="font-bold">Rp {cashSession.systemCashSales?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-sm text-luhur-coffee">
                  <span>Kas Sistem Seharusnya:</span>
                  <span className="text-luhur-red">Rp {cashSession.systemExpectedCash?.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Input Petty Cash */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-700 block">Pencatatan Kas Kecil (Petty Cash):</span>
                <div className="flex space-x-2">
                  <select
                    value={pettyType}
                    onChange={(e) => setPettyType(e.target.value as any)}
                    className="p-1.5 border rounded bg-white font-bold"
                  >
                    <option value="OUT">Keluar (-)</option>
                    <option value="IN">Masuk (+)</option>
                  </select>
                  <input
                    type="number"
                    value={pettyAmount}
                    onChange={(e) => setPettyAmount(Number(e.target.value))}
                    className="flex-1 p-1.5 border rounded font-bold"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Alasan (contoh: beli galon, es batu)"
                  value={pettyReason}
                  onChange={(e) => setPettyReason(e.target.value)}
                  className="w-full p-1.5 border rounded"
                />
                <button
                  onClick={handleAddPettyCash}
                  className="w-full py-1.5 bg-gray-700 hover:bg-black text-white text-xs font-bold rounded transition"
                >
                  Catat Kas Bon / Petty Cash
                </button>
              </div>

              {/* Form Tutup Kasir / Closing Balancing */}
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-2 text-xs">
                <span className="font-bold text-red-900 block">Validasi Penutupan Shift Kas:</span>
                <div>
                  <label className="text-[11px] text-gray-600">Hasil Hitung Fisik Laci (Rp):</label>
                  <input
                    type="number"
                    value={actualClosingCash}
                    onChange={(e) => setActualClosingCash(Number(e.target.value))}
                    className="w-full p-1.5 border rounded font-black text-base text-luhur-coffee bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Catatan penutupan (opsional)"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full p-1.5 border rounded text-xs bg-white"
                />
                <button
                  onClick={handleCloseDrawer}
                  className="w-full py-2 bg-luhur-red hover:bg-luhur-redDark text-white font-serif font-black text-xs rounded transition shadow"
                >
                  Tutup Sesi & Rekonsiliasi Laci Kasir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Margin Kontribusi Menu & Jam Ramai (FR-SO-14) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Menu Contribution Margin */}
          <div className="bg-white p-6 rounded-2xl border-2 border-luhur-border shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif font-bold text-base text-luhur-coffee">
                Margin Kontribusi Menu Warung Kopi Luhur
              </h3>
            </div>

            <div className="space-y-3">
              {(analytics?.menuMargin || []).length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada transaksi hari ini untuk menghitung margin.</p>
              ) : (
                analytics.menuMargin.map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-luhur-cream rounded-xl border border-luhur-border flex items-center justify-between text-xs">
                    <div>
                      <span className="font-serif font-bold text-sm text-luhur-coffee block">{item.product_name}</span>
                      <span className="text-gray-500 font-mono text-[11px]">Terjual: {item.total_qty} cup</span>
                    </div>

                    <div className="text-right">
                      <span className="font-serif font-black text-sm text-emerald-700 block">
                        +Rp {item.gross_margin?.toLocaleString('id-ID')}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        Margin {item.margin_percent}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Peak Hours Distribution */}
          <div className="bg-white p-6 rounded-2xl border-2 border-luhur-border shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-serif font-bold text-base text-luhur-coffee">
                Persebaran Jam Ramai Transaksi (Peak Hours)
              </h3>
            </div>

            <div className="space-y-2">
              {(analytics?.peakHours || []).length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada data persebaran jam transaksi hari ini.</p>
              ) : (
                analytics.peakHours.map((hourData: any, i: number) => (
                  <div key={i} className="flex items-center space-x-3 text-xs">
                    <span className="w-16 font-mono font-bold text-gray-600">{hourData.hour}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-luhur-red h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, hourData.count * 15)}%` }}
                      />
                    </div>
                    <span className="font-bold text-luhur-coffee w-12 text-right">{hourData.count} order</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

