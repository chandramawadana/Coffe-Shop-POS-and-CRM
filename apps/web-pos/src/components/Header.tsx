import React from 'react';
import { 
  Coffee, 
  ChefHat, 
  Monitor, 
  Package, 
  MessageSquare, 
  BarChart3, 
  Printer, 
  Lock, 
  Wifi, 
  Layers
} from 'lucide-react';
import { StaffUser } from '@coffee-pos/shared-types';
import { thermalPrinterService } from '../hardware/printer';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: StaffUser | null;
  onOpenPinModal: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenPinModal,
  isOnline
}) => {
  const [printerConnected, setPrinterConnected] = React.useState(false);

  const handleConnectPrinter = async () => {
    const success = await thermalPrinterService.connectBluetooth();
    setPrinterConnected(success);
  };

  return (
    <header className="bg-[#241C16] text-[#EAE2D3] border-b border-[#3A2E25] shadow-sm px-4 py-2 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('cashier')}>
        <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
          <img 
            src="/assets/logo-wkluhur.png" 
            alt="Warung Kopi Luhur" 
            className="w-full h-full object-contain drop-shadow"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }} 
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-lg tracking-wide text-[#F7F3EB]">
              Warung Kopi <span className="italic font-normal">Luhur</span>
            </span>
            <span className="bg-[#8ABFF8] text-[#241C16] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Master Node
            </span>
          </div>
          <p className="text-[11px] text-[#C8BEB0] font-serif italic">Cita Rasa Luhur Warisan Nusantara</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center space-x-1 overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab('cashier')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'cashier'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Kasir POS</span>
        </button>

        <button
          onClick={() => setActiveTab('kds-barista')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'kds-barista'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Barista KDS</span>
        </button>

        <button
          onClick={() => setActiveTab('kds-kitchen')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'kds-kitchen'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Kitchen KDS</span>
        </button>

        <button
          onClick={() => setActiveTab('customer-display')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'customer-display'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Layar QRIS</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'inventory'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Stok & BOM</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'whatsapp'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp CRM</span>
        </button>

        <button
          onClick={() => setActiveTab('owner')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            activeTab === 'owner'
              ? 'bg-[#8ABFF8] text-[#241C16] shadow-sm font-bold'
              : 'text-[#EAE2D3] hover:bg-[#3A2E25]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Owner Hub</span>
        </button>
      </nav>

      {/* Hardware & User Actions */}
      <div className="flex items-center space-x-2">
        {/* LAN Indicator */}
        <div className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-[#3A2E25] rounded-full border border-[#524337]">
          <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-[#8ABFF8]' : 'text-red-400'}`} />
          <span className="text-[11px] font-mono text-[#EAE2D3]">
            {isOnline ? 'LAN Ready' : 'Offline'}
          </span>
        </div>

        {/* Printer Bluetooth Connect */}
        <button
          onClick={handleConnectPrinter}
          title="Hubungkan Printer Bluetooth ESC/POS"
          className={`px-2.5 py-1 rounded-full border text-xs flex items-center space-x-1 transition ${
            printerConnected 
              ? 'bg-[#8ABFF8] border-[#8ABFF8] text-[#241C16] font-bold' 
              : 'bg-[#3A2E25] border-[#524337] text-[#EAE2D3] hover:text-white'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{printerConnected ? 'BT Aktif' : 'Printer'}</span>
        </button>

        {/* Active Staff / PIN Login */}
        <button
          onClick={onOpenPinModal}
          className="flex items-center space-x-2 bg-[#8ABFF8] hover:bg-[#6CAEF5] px-3 py-1.5 rounded-full text-xs font-bold text-[#241C16] shadow transition"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{currentUser ? currentUser.name : 'Masuk PIN'}</span>
          <span className="bg-[#241C16] text-[#8ABFF8] font-bold px-1.5 py-0.2 rounded-full text-[10px]">
            {currentUser ? currentUser.role : 'GUEST'}
          </span>
        </button>
      </div>
    </header>
  );
};

