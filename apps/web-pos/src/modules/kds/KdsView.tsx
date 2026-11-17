import React, { useState, useEffect } from 'react';
import { Coffee, ChefHat, CheckCircle, Clock, Flame, AlertCircle } from 'lucide-react';
import { Order, StationType, KdsItemStatus } from '@coffee-pos/shared-types';
import { fetchKdsOrders, updateKdsItemStatus, lanWsClient } from '../../services/api';

interface KdsViewProps {
  station: StationType; // 'BARISTA' or 'KITCHEN'
}

export const KdsView: React.FC<KdsViewProps> = ({ station }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();

    // Listen to LAN WebSocket real-time updates
    const unsubscribe = lanWsClient.subscribe((msg) => {
      if (msg.event === 'ORDER_CREATED' || msg.event === 'ORDER_UPDATED' || msg.event === 'KDS_STATUS_CHANGED') {
        loadOrders();
      }
    });

    // Refresh every 30s as safety
    const timer = setInterval(loadOrders, 30000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [station]);

  const loadOrders = async () => {
    try {
      const data = await fetchKdsOrders();
      setOrders(data);
    } catch (err) {
      console.error('Gagal mengambil antrean KDS:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStatus = async (orderId: string, itemId: string, currentStatus: KdsItemStatus) => {
    let nextStatus: KdsItemStatus = 'BREWING';
    if (currentStatus === 'QUEUED') nextStatus = 'BREWING';
    else if (currentStatus === 'BREWING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'SERVED';

    try {
      await updateKdsItemStatus(orderId, itemId, nextStatus);
      // Optimistic update
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: o.items.map(it => it.id === itemId ? { ...it, kdsStatus: nextStatus } : it)
        };
      }));
    } catch (err) {
      console.error('Gagal update status KDS:', err);
    }
  };

  // Filter orders containing items for this station
  const stationOrders = orders.filter(o => 
    o.items.some(it => it.targetStation === station && it.kdsStatus !== 'SERVED')
  );

  return (
    <div className="flex-1 bg-[#EAE2D3] flex flex-col h-[calc(100vh-62px)] overflow-hidden">
      {/* KDS Header Bar */}
      <div className="bg-[#E0D6C5] text-[#241C16] px-6 py-3 border-b border-[#D5CBB8] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#241C16] rounded-full text-[#8ABFF8]">
            {station === 'BARISTA' ? (
              <Coffee className="w-5 h-5" />
            ) : (
              <ChefHat className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#241C16]">
              Layar KDS <span className="italic font-normal">{station === 'BARISTA' ? 'Barista & Minuman' : 'Kitchen & Dapur'}</span>
            </h2>
            <p className="text-xs text-[#6E6258]">
              Warung Kopi Luhur • Pemisahan Tiket Otomatis (FR-SO-05)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-[#241C16] px-3.5 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8ABFF8] animate-pulse"></span>
            <span className="font-bold text-[#F7F3EB]">
              Antrean Aktif: {stationOrders.length} Pesanan
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="flex-1 overflow-x-auto p-4 flex space-x-4">
        {stationOrders.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6258] space-y-2">
            <CheckCircle className="w-16 h-16 text-[#241C16]/30" />
            <h3 className="font-serif font-bold text-lg text-[#241C16]">Semua Pesanan Tuntas!</h3>
            <p className="text-xs text-[#6E6258]">Menunggu antrean tiket baru dari kasir...</p>
          </div>
        ) : (
          stationOrders.map(order => {
            const stationItems = order.items.filter(
              it => it.targetStation === station && it.kdsStatus !== 'SERVED'
            );
            if (stationItems.length === 0) return null;

            const timePassedMinutes = Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / 60000
            );

            return (
              <div
                key={order.id}
                className="w-80 flex-shrink-0 bg-[#F7F3EB] rounded-2xl shadow-md border border-[#D5CBB8] flex flex-col overflow-hidden max-h-full"
              >
                {/* Ticket Top Header */}
                <div className={`p-3.5 text-[#F7F3EB] flex items-center justify-between ${
                  timePassedMinutes > 10 ? 'bg-red-800' : 'bg-[#241C16]'
                }`}>
                  <div>
                    <span className="font-serif font-bold text-xl">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs block text-[#C8BEB0]">
                      {order.type} {order.tableName ? `• Meja ${order.tableName}` : ''}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs font-mono bg-[#3A2E25] px-2.5 py-0.5 rounded-full text-[#8ABFF8]">
                      <Clock className="w-3 h-3" />
                      <span>{timePassedMinutes}m lalu</span>
                    </div>
                    {order.customerName && (
                      <span className="text-[11px] text-[#C8BEB0] block truncate max-w-[120px] mt-0.5">
                        {order.customerName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in ticket */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stationItems.map(item => {
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[#D5CBB8] bg-[#EAE2D3]/60 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-serif font-bold text-base text-[#241C16]">
                              {item.quantity}x {item.productName}
                            </span>
                            {/* Modifier details */}
                            <div className="text-xs text-[#6E6258] mt-1 space-y-0.5 font-medium">
                              {item.modifiers.temperature && (
                                <span className="inline-block mr-1 font-bold text-[#241C16]">
                                  [{item.modifiers.temperature}]
                                </span>
                              )}
                              {item.modifiers.sweetness && (
                                <span className="inline-block mr-1">
                                  Manis: {item.modifiers.sweetness}
                                </span>
                              )}
                              {item.modifiers.espressoRatio && (
                                <span className="inline-block mr-1">
                                  • {item.modifiers.espressoRatio}
                                </span>
                              )}
                              {item.modifiers.milkType && item.modifiers.milkType !== 'NONE' && (
                                <span className="inline-block mr-1 font-semibold text-[#241C16]">
                                  • {item.modifiers.milkType.replace('_', ' ')}
                                </span>
                              )}
                              {item.modifiers.extraNotes && (
                                <p className="text-[11px] text-[#241C16] font-bold bg-[#8ABFF8]/30 p-1.5 rounded mt-1">
                                  Catatan: {item.modifiers.extraNotes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* FR-SO-06: 1-Touch Button for status change */}
                        <button
                          onClick={() => handleNextStatus(order.id, item.id, item.kdsStatus)}
                          className={`w-full py-2.5 px-3 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 ${
                            item.kdsStatus === 'QUEUED'
                              ? 'bg-[#8ABFF8] hover:bg-[#6CAEF5] text-[#241C16]'
                              : item.kdsStatus === 'BREWING'
                              ? 'bg-[#241C16] hover:bg-[#3A2E25] text-[#8ABFF8]'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {item.kdsStatus === 'QUEUED' && (
                            <>
                              <Flame className="w-4 h-4" />
                              <span>Mulai Racik (Brewing)</span>
                            </>
                          )}
                          {item.kdsStatus === 'BREWING' && (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Tandai Selesai (Ready)</span>
                            </>
                          )}
                          {item.kdsStatus === 'READY' && (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Telah Diantar (Served)</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

