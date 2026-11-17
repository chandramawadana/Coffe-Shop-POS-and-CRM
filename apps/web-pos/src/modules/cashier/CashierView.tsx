import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Flame, 
  Snowflake, 
  Sparkles, 
  UserPlus, 
  Gift, 
  CreditCard,
  Receipt,
  Users
} from 'lucide-react';
import { 
  ProductItem, 
  OrderLineItem, 
  SelectedModifiers, 
  StaffUser, 
  PaymentRecord,
  WARUNG_KOPI_LUHUR_ADDONS,
  WARUNG_KOPI_LUHUR_BRAND
} from '@coffee-pos/shared-types';
import { fetchProducts, createOrder, lookupOrCreateCustomer, fetchOpenTabs, payOrder } from '../../services/api';
import { PaymentModal } from './PaymentModal';
import { thermalPrinterService } from '../../hardware/printer';
import { localDb } from '../../storage/db';

interface CashierViewProps {
  currentUser: StaffUser | null;
  onOpenPinModal: () => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ currentUser, onOpenPinModal }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Order State
  const [cart, setCart] = useState<OrderLineItem[]>([]);
  const [selectedCartIndex, setSelectedCartIndex] = useState<number | null>(null);
  const [tableName, setTableName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  
  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState<string[]>([]);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any>(null);
  const [openTabsList, setOpenTabsList] = useState<any[]>([]);
  const [showOpenTabsDrawer, setShowOpenTabsDrawer] = useState(false);

  useEffect(() => {
    loadProducts();
    loadOpenTabs();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    }
  };

  const loadOpenTabs = async () => {
    try {
      const data = await fetchOpenTabs();
      setOpenTabsList(data);
    } catch (err) {
      console.error('Gagal memuat open tabs:', err);
    }
  };

  const handleCustomerLookup = async () => {
    if (!customerPhone || customerPhone.length < 8) return;
    try {
      const cust = await lookupOrCreateCustomer(customerPhone);
      setCustomerProfile(cust);
    } catch (err) {
      console.error('Gagal lookup customer:', err);
    }
  };

  const handleAddToCart = (product: ProductItem) => {
    // Default fast-touch modifiers
    const defaultModifiers: SelectedModifiers = {
      temperature: product.supportedModifiers.temperature ? 'ICE' : undefined,
      sweetness: product.supportedModifiers.sweetness ? '100%' : undefined,
      espressoRatio: product.supportedModifiers.espressoRatio ? 'DOUBLE' : undefined,
      milkType: product.supportedModifiers.milkType ? 'FRESH_MILK' : undefined
    };

    const newItem: OrderLineItem = {
      id: Math.random().toString(36).substring(2, 9),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.basePrice,
      subtotal: product.basePrice,
      modifiers: defaultModifiers,
      targetStation: product.targetStation,
      kdsStatus: 'QUEUED',
      calculatedCogs: 0
    };

    setCart(prev => [...prev, newItem]);
    setSelectedCartIndex(cart.length); // auto-select for quick modifier tweaking
  };

  const handleAddonDirect = (addon: typeof WARUNG_KOPI_LUHUR_ADDONS[0]) => {
    // Jika ada item yang dipilih, tambahkan catatan modifier ke item tersebut
    if (selectedCartIndex !== null && cart[selectedCartIndex]) {
      const current = cart[selectedCartIndex];
      const existingNotes = current.modifiers.extraNotes || '';
      const updatedNotes = existingNotes ? `${existingNotes}, +${addon.name}` : `+${addon.name}`;
      
      const updated = [...cart];
      updated[selectedCartIndex] = {
        ...current,
        unitPrice: current.unitPrice + addon.price,
        subtotal: (current.unitPrice + addon.price) * current.quantity,
        modifiers: {
          ...current.modifiers,
          extraNotes: updatedNotes
        }
      };
      setCart(updated);
    } else {
      // Jika tidak ada item terpilih, masukkan add-on sebagai line item terpisah
      const newItem: OrderLineItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: addon.id,
        productName: `Penyempurna: ${addon.name}`,
        quantity: 1,
        unitPrice: addon.price,
        subtotal: addon.price,
        modifiers: {},
        targetStation: addon.targetStation,
        kdsStatus: 'QUEUED',
        calculatedCogs: 0
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  // Modifier Quick-Touch updates (< 2 Taps FR-SO-01)
  const updateActiveModifier = (field: keyof SelectedModifiers, value: any) => {
    if (selectedCartIndex === null || !cart[selectedCartIndex]) return;

    const current = cart[selectedCartIndex];
    const newModifiers = { ...current.modifiers, [field]: value };

    // Surcharge calculation for oat milk
    let extraPrice = 0;
    if (newModifiers.milkType === 'OAT_MILK') extraPrice += 5000;
    if (newModifiers.milkType === 'ALMOND_MILK') extraPrice += 6000;

    const baseProduct = products.find(p => p.id === current.productId);
    const basePrice = baseProduct ? baseProduct.basePrice : current.unitPrice;
    const finalUnitPrice = basePrice + extraPrice;

    const updated = [...cart];
    updated[selectedCartIndex] = {
      ...current,
      unitPrice: finalUnitPrice,
      subtotal: finalUnitPrice * current.quantity,
      modifiers: newModifiers
    };
    setCart(updated);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      updated.splice(index, 1);
      setSelectedCartIndex(null);
    } else {
      updated[index] = {
        ...item,
        quantity: newQty,
        subtotal: item.unitPrice * newQty
      };
    }
    setCart(updated);
  };

  const subtotal = cart.reduce((sum, it) => sum + it.subtotal, 0);
  const totalAmount = subtotal;

  const handleCheckoutSubmit = async (payments: PaymentRecord[], orderType: 'DINE_IN' | 'TAKEAWAY', isDraftTab: boolean) => {
    const orderPayload: any = {
      id: `ord-${Date.now()}`,
      type: orderType,
      tableName: tableName || undefined,
      customerName: customerProfile?.name || (customerPhone ? `Pelanggan ${customerPhone.slice(-4)}` : undefined),
      customerId: customerProfile?.id || undefined,
      cashierUserId: currentUser?.id || 'usr-cashier',
      cashierName: currentUser?.name || 'Kasir',
      items: cart,
      subtotal,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount,
      status: isDraftTab ? ('OPEN_TAB' as const) : ('PAID' as const),
      payments: payments,
      createdAt: new Date().toISOString()
    };

    try {
      const result = await createOrder(orderPayload);
      if (result.lowStockAlerts && result.lowStockAlerts.length > 0) {
        setLowStockAlerts(result.lowStockAlerts);
      }

      setLastCompletedOrder(result.order);

      // Auto print thermal & kick cash drawer
      if (!isDraftTab) {
        thermalPrinterService.printReceipt(result.order);
        thermalPrinterService.kickCashDrawer();
      }
    } catch (err) {
      // Offline-First IndexedDB Fallback (FR-SO-02)
      console.warn('Koneksi ke Local Hub terputus, menyimpan transaksi ke IndexedDB lokal...', err);
      await localDb.offlineOrders.put({
        id: orderPayload.id,
        order: orderPayload,
        synced: false,
        createdAt: orderPayload.createdAt
      });
      if (!isDraftTab) {
        thermalPrinterService.printReceipt(orderPayload);
        thermalPrinterService.kickCashDrawer();
      }
      alert('Mode Offline Aktif: Transaksi tersimpan aman di IndexedDB lokal dan akan sinkron otomatis.');
    } finally {
      // Reset
      setCart([]);
      setSelectedCartIndex(null);
      setTableName('');
      setCustomerPhone('');
      setCustomerProfile(null);
      setIsPaymentModalOpen(false);
      loadOpenTabs();
    }
  };

  const handleSettleOpenTab = async (tab: any) => {
    try {
      await payOrder(tab.id, [{ method: 'CASH', amount: tab.totalAmount, cashReceived: tab.totalAmount, cashChange: 0 }]);
      thermalPrinterService.printReceipt(tab);
      thermalPrinterService.kickCashDrawer();
      loadOpenTabs();
      setShowOpenTabsDrawer(false);
    } catch (err) {
      alert('Gagal menyelesaikan Open Tab');
    }
  };

  const activeCartItem = selectedCartIndex !== null ? cart[selectedCartIndex] : null;

  // Filter Categories
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-62px)] overflow-hidden bg-luhur-cream">
      {/* ======================================================== */}
      {/* SISI KIRI / TENGAH: KATALOG MENU & TOUCH MODIFIER BAR */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col border-r border-luhur-border overflow-hidden">
        {/* Banner Warung Kopi Luhur & Top Navigation */}
        <div className="bg-[#E0D6C5] text-[#241C16] px-4 py-2.5 flex items-center justify-between border-b border-luhur-border">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold tracking-wide text-base text-[#241C16]">
              Katalog <span className="italic font-normal">Racikan Luhur</span>
            </span>
            <span className="text-[11px] bg-[#241C16] text-[#8ABFF8] px-2.5 py-0.5 rounded-full font-semibold">
              In-House POS
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Open Tabs Quick Badge */}
            <button
              onClick={() => setShowOpenTabsDrawer(!showOpenTabsDrawer)}
              className="bg-[#241C16] hover:bg-[#3A2E25] text-[#8ABFF8] px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Open Tab ({openTabsList.length})</span>
            </button>

            {/* Quick Search */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-[#6E6258]" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F3EB] text-[#241C16] pl-8 pr-3 py-1 text-xs rounded-full border border-luhur-border focus:border-[#8ABFF8] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs (Sesuai Menu Warung Kopi Luhur) */}
        <div className="bg-[#EAE2D3] px-4 py-2.5 border-b border-luhur-border flex items-center space-x-2 overflow-x-auto select-none">
          {[
            { id: 'all', label: 'Semua Menu' },
            { id: 'espresso_based', label: 'Racikan Master & Klasik' },
            { id: 'manual_brew', label: 'Racikan Manual (V60)' },
            { id: 'tea_mocktail', label: 'Kopi Buah & Teh' },
            { id: 'milk_based', label: 'Bukan Kopi (Susu/Kakao)' },
            { id: 'addons', label: 'Penyempurna' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                selectedCategory === cat.id
                  ? 'bg-[#8ABFF8] text-[#241C16] border-[#6CAEF5] shadow-sm'
                  : 'bg-[#F7F3EB] text-[#241C16] border-luhur-border hover:bg-[#E0D6C5]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FR-SO-01: FAST-TOUCH MODIFIER BAR (Hadir langsung jika item dipilih, tanpa modal pop-up!) */}
        <div className="bg-[#F7F3EB] border-b border-luhur-border p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#241C16]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#241C16]">
                Fast Modifier (&lt; 2 Sentuhan):
              </span>
              <span className="text-xs font-bold text-[#241C16] bg-[#8ABFF8]/40 px-2 py-0.5 rounded-full">
                {activeCartItem ? activeCartItem.productName : 'Pilih menu di bawah atau di keranjang'}
              </span>
            </div>
            {activeCartItem && (
              <span className="text-xs text-[#6E6258] font-mono font-bold">
                Rp {activeCartItem.unitPrice.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {/* Suhu: Hot / Ice */}
            <div className="flex items-center bg-[#EAE2D3] rounded-full p-1 border border-luhur-border">
              <button
                onClick={() => updateActiveModifier('temperature', 'HOT')}
                disabled={!activeCartItem}
                className={`flex-1 py-1 rounded-full flex items-center justify-center space-x-1 font-bold transition ${
                  activeCartItem?.modifiers.temperature === 'HOT'
                    ? 'bg-[#241C16] text-[#F7F3EB] shadow-sm'
                    : 'text-[#6E6258] hover:text-[#241C16]'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Panas</span>
              </button>
              <button
                onClick={() => updateActiveModifier('temperature', 'ICE')}
                disabled={!activeCartItem}
                className={`flex-1 py-1 rounded-full flex items-center justify-center space-x-1 font-bold transition ${
                  activeCartItem?.modifiers.temperature === 'ICE'
                    ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm'
                    : 'text-[#6E6258] hover:text-[#241C16]'
                }`}
              >
                <Snowflake className="w-3 h-3" />
                <span>Dingin</span>
              </button>
            </div>

            {/* Manis: 0% / 50% / 100% */}
            <div className="flex items-center bg-[#EAE2D3] rounded-full p-1 border border-luhur-border">
              {(['0%', '50%', '100%'] as const).map(sweet => (
                <button
                  key={sweet}
                  onClick={() => updateActiveModifier('sweetness', sweet)}
                  disabled={!activeCartItem}
                  className={`flex-1 py-1 rounded-full font-bold text-[11px] transition ${
                    activeCartItem?.modifiers.sweetness === sweet
                      ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm'
                      : 'text-[#6E6258] hover:text-[#241C16]'
                  }`}
                >
                  {sweet === '0%' ? 'Nol' : sweet === '50%' ? '50%' : 'Normal'}
                </button>
              ))}
            </div>

            {/* Espresso Ratio: Single / Double */}
            <div className="flex items-center bg-[#EAE2D3] rounded-full p-1 border border-luhur-border">
              <button
                onClick={() => updateActiveModifier('espressoRatio', 'SINGLE')}
                disabled={!activeCartItem}
                className={`flex-1 py-1 rounded-full font-bold text-[11px] transition ${
                  activeCartItem?.modifiers.espressoRatio === 'SINGLE'
                    ? 'bg-[#241C16] text-[#F7F3EB] shadow-sm'
                    : 'text-[#6E6258] hover:text-[#241C16]'
                }`}
              >
                Single Shot
              </button>
              <button
                onClick={() => updateActiveModifier('espressoRatio', 'DOUBLE')}
                disabled={!activeCartItem}
                className={`flex-1 py-1 rounded-full font-bold text-[11px] transition ${
                  activeCartItem?.modifiers.espressoRatio === 'DOUBLE'
                    ? 'bg-[#241C16] text-[#F7F3EB] shadow-sm'
                    : 'text-[#6E6258] hover:text-[#241C16]'
                }`}
              >
                Double Shot
              </button>
            </div>

            {/* Susu: Fresh Milk vs Oat Milk */}
            <div className="flex items-center bg-[#EAE2D3] rounded-full p-1 border border-luhur-border">
              <button
                onClick={() => updateActiveModifier('milkType', 'FRESH_MILK')}
                disabled={!activeCartItem}
                className={`flex-1 py-1 rounded-full font-bold text-[11px] transition ${
                  activeCartItem?.modifiers.milkType === 'FRESH_MILK'
                    ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm'
                    : 'text-[#6E6258] hover:text-[#241C16]'
                }`}
              >
                Susu Sapi
              </button>
              <button
                onClick={() => updateActiveModifier('milkType', 'OAT_MILK')}
                disabled={!activeCartItem}
                className={`flex-1 py-1 rounded-full font-bold text-[11px] transition ${
                  activeCartItem?.modifiers.milkType === 'OAT_MILK'
                    ? 'bg-[#241C16] text-[#8ABFF8] shadow-sm'
                    : 'text-[#6E6258] hover:text-[#241C16]'
                }`}
              >
                Oat (+5k)
              </button>
            </div>
          </div>
        </div>

        {/* Menu Grid / Addons Selector */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCategory === 'addons' ? (
            <div>
              <h3 className="font-serif font-bold text-lg text-[#241C16] mb-3">
                Penyempurna Racikan <span className="italic font-normal">(Topping &amp; Extra Shot)</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {WARUNG_KOPI_LUHUR_ADDONS.map(addon => (
                  <button
                    key={addon.id}
                    onClick={() => handleAddonDirect(addon)}
                    className="p-4 bg-[#F7F3EB] border border-luhur-border hover:border-[#8ABFF8] hover:shadow-md rounded-2xl shadow-sm text-left hover:scale-[1.01] active:scale-[0.98] transition flex flex-col justify-between h-28"
                  >
                    <div>
                      <span className="font-serif font-bold text-sm text-[#241C16] block">
                        {addon.name}
                      </span>
                      <span className="text-[11px] text-[#6E6258]">Add-on Kopi Luhur</span>
                    </div>
                    <div className="font-bold text-sm text-[#241C16]">
                      +Rp {addon.price.toLocaleString('id-ID')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className="bg-[#F7F3EB] border border-luhur-border hover:border-[#8ABFF8] hover:shadow-md rounded-2xl p-3.5 shadow-sm text-left flex flex-col justify-between hover:scale-[1.01] active:scale-[0.98] transition group h-36 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#241C16] transition leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#6E6258] line-clamp-2 mt-1">
                        {product.description || 'Racikan khas Warung Kopi Luhur'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-2 pt-2 border-t border-luhur-border/60">
                    <span className="font-sans font-extrabold text-sm text-[#241C16]">
                      Rp {product.basePrice.toLocaleString('id-ID')}
                    </span>
                    <span className="p-1.5 rounded-full bg-[#EAE2D3] group-hover:bg-[#8ABFF8] text-[#241C16] transition">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SISI KANAN: ORDER CART & CHECKOUT TERMINAL */}
      {/* ======================================================== */}
      <div className="w-full lg:w-96 bg-[#F7F3EB] flex flex-col border-l border-luhur-border shadow-sm">
        {/* Customer WhatsApp Loyalty Bar (FR-SO-10 & FR-SO-11) */}
        <div className="bg-luhur-creamDark p-3 border-b border-luhur-border">
          <div className="flex items-center space-x-2">
            <input
              type="tel"
              placeholder="No. WhatsApp Pelanggan (08...)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onBlur={handleCustomerLookup}
              className="flex-1 bg-white border border-luhur-border px-3 py-1.5 rounded-lg text-xs font-bold text-luhur-coffee focus:border-luhur-red focus:outline-none"
            />
            <button
              onClick={handleCustomerLookup}
              className="px-2.5 py-1.5 bg-luhur-navy text-white text-xs font-bold rounded-lg hover:bg-luhur-navyLight"
            >
              Cek
            </button>
          </div>

          {customerProfile && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-luhur-coffee">{customerProfile.name}</span>
                <span className="text-[10px] text-gray-500 block">Kunjungan: {customerProfile.totalVisits}x</span>
              </div>
              <div className="flex items-center space-x-1 bg-amber-200 px-2 py-0.5 rounded font-black text-amber-900">
                <Gift className="w-3.5 h-3.5" />
                <span>{customerProfile.stampBalance}/7 Stamp</span>
              </div>
            </div>
          )}

          {/* Table / Dine In specifier */}
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              placeholder="No. Meja (Khusus Dine In / Open Tab)"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full bg-white border border-luhur-border px-3 py-1 rounded-lg text-xs text-luhur-coffee focus:outline-none"
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <Coffee className="w-12 h-12 stroke-[1.2]" />
              <p className="text-xs font-medium">Keranjang transaksi masih kosong</p>
              <p className="text-[11px] text-gray-400 text-center max-w-xs">
                Sentuh menu pada daftar di samping untuk menambahkan ke pesanan.
              </p>
            </div>
          ) : (
            cart.map((item, index) => {
              const isSelected = selectedCartIndex === index;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCartIndex(index)}
                  className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                    isSelected
                      ? 'border-luhur-red bg-red-50/50 shadow-sm'
                      : 'border-luhur-border bg-[#FFFDF9] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-serif font-bold text-sm text-luhur-coffee">
                        {item.productName}
                      </span>
                      {/* Modifiers tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.modifiers.temperature && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-gray-200 text-gray-800 rounded font-bold">
                            {item.modifiers.temperature}
                          </span>
                        )}
                        {item.modifiers.sweetness && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-gray-200 text-gray-800 rounded">
                            {item.modifiers.sweetness}
                          </span>
                        )}
                        {item.modifiers.milkType && item.modifiers.milkType !== 'NONE' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                            {item.modifiers.milkType.replace('_', ' ')}
                          </span>
                        )}
                        {item.modifiers.extraNotes && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold">
                            {item.modifiers.extraNotes}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-serif font-bold text-sm text-luhur-coffee">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-mono">
                      @ Rp {item.unitPrice.toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(index, -1);
                        }}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-sm w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(index, 1);
                        }}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = [...cart];
                          updated.splice(index, 1);
                          setCart(updated);
                          setSelectedCartIndex(null);
                        }}
                        className="p-1 rounded-lg hover:bg-red-100 text-red-600 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-4 bg-[#E0D6C5] border-t border-luhur-border space-y-3">
          <div className="flex justify-between items-center text-xs text-[#6E6258]">
            <span>Jumlah Item:</span>
            <span className="font-bold text-[#241C16]">{cart.reduce((s, it) => s + it.quantity, 0)} item</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-serif font-bold text-base text-[#241C16]">Total Tagihan:</span>
            <span className="font-sans font-black text-2xl text-[#241C16]">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-full font-sans font-extrabold text-sm tracking-wide shadow flex items-center justify-center space-x-2 transition ${
              cart.length > 0
                ? 'bg-[#8ABFF8] hover:bg-[#6CAEF5] text-[#241C16] active:scale-[0.99]'
                : 'bg-[#D5CBB8] text-[#6E6258] cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-5 h-5 text-[#241C16]" />
            <span>BAYAR SEKARANG (F12)</span>
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subtotal={subtotal}
        discount={0}
        totalAmount={totalAmount}
        customerPhone={customerPhone}
        customerName={customerProfile?.name || ''}
        tableName={tableName}
        onConfirmPayment={handleCheckoutSubmit}
      />

      {/* Open Tabs Drawer Modal (FR-SO-04) */}
      {showOpenTabsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-luhur-cream border-2 border-luhur-navy rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-luhur-navy text-white px-5 py-3 flex items-center justify-between border-b-2 border-luhur-red">
              <span className="font-serif font-black text-lg">Daftar Open Tab (Dine-In)</span>
              <button onClick={() => setShowOpenTabsDrawer(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-3">
              {openTabsList.length === 0 ? (
                <p className="text-center text-xs text-gray-500 py-8">Belum ada Open Tab aktif saat ini.</p>
              ) : (
                openTabsList.map(tab => (
                  <div key={tab.id} className="bg-[#FFF9ED] p-3 rounded-xl border border-luhur-border flex items-center justify-between">
                    <div>
                      <span className="font-serif font-bold text-sm text-luhur-coffee block">
                        #{tab.orderNumber} {tab.tableName ? `• ${tab.tableName}` : ''}
                      </span>
                      <span className="text-xs text-gray-500">{tab.customerName || 'Tamu Dine-In'} • {tab.items?.length || 0} item</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-serif font-black text-sm text-luhur-red">
                        Rp {tab.totalAmount?.toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleSettleOpenTab(tab)}
                        className="px-3 py-1.5 bg-luhur-red hover:bg-luhur-redDark text-white text-xs font-bold rounded-lg shadow"
                      >
                        Bayar Lunas
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alerts Notification */}
      {lowStockAlerts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-amber-500 text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs uppercase">Peringatan Stok Rendah (FR-SO-08)</span>
            <button onClick={() => setLowStockAlerts([])} className="text-white hover:text-black">✕</button>
          </div>
          {lowStockAlerts.map((alert, i) => (
            <p key={i} className="text-xs">{alert}</p>
          ))}
        </div>
      )}
    </div>
  );
};
