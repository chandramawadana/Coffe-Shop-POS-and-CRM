import React, { useState, useEffect } from 'react';
import { StaffUser } from '@coffee-pos/shared-types';
import { Header } from './components/Header';
import { PinLoginModal } from './components/PinLoginModal';
import { CashierView } from './modules/cashier/CashierView';
import { KdsView } from './modules/kds/KdsView';
import { CustomerDisplayView } from './modules/customer/CustomerDisplayView';
import { StockOpnameView } from './modules/inventory/StockOpnameView';
import { WhatsAppCrmView } from './modules/crm/WhatsAppCrmView';
import { OwnerAnalyticsView } from './modules/owner/OwnerAnalyticsView';
import { localDb } from './storage/db';
import { createOrder } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('cashier');
  const [currentUser, setCurrentUser] = useState<StaffUser | null>({
    id: 'usr-cashier',
    name: 'Kasir Utama',
    role: 'CASHIER',
    pin: '1234',
    isActive: true
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const syncOfflineOrders = async () => {
      try {
        const pending = await localDb.offlineOrders.filter(rec => !rec.synced).toArray();
        for (const rec of pending) {
          await createOrder(rec.order);
          await localDb.offlineOrders.update(rec.id, { synced: true });
        }
      } catch (err) {
        // Retry on next cycle
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOrders();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const syncInterval = setInterval(() => {
      if (navigator.onLine) syncOfflineOrders();
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-luhur-cream flex flex-col font-sans select-none">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        isOnline={isOnline}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'cashier' && (
          <CashierView
            currentUser={currentUser}
            onOpenPinModal={() => setIsPinModalOpen(true)}
          />
        )}

        {activeTab === 'kds-barista' && (
          <KdsView station="BARISTA" />
        )}

        {activeTab === 'kds-kitchen' && (
          <KdsView station="KITCHEN" />
        )}

        {activeTab === 'customer-display' && (
          <CustomerDisplayView />
        )}

        {activeTab === 'inventory' && (
          <StockOpnameView />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppCrmView />
        )}

        {activeTab === 'owner' && (
          <OwnerAnalyticsView
            currentUser={currentUser}
            onOpenPinModal={() => setIsPinModalOpen(true)}
          />
        )}
      </main>

      {/* Footer Attribution */}
      <footer className="h-6 bg-[#FDFBF7] border-t border-[#D5CBB8] px-4 flex items-center justify-between text-xs text-[#574B42] select-none">
        <span>☕ Warung Kopi Luhur — POS &amp; CRM</span>
        <span className="font-semibold">powered by <strong className="text-[#241C16] font-bold">Amperix Technology</strong></span>
      </footer>

      <PinLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
};

export default App;

