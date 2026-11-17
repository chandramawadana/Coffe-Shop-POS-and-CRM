import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Scale, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { Ingredient, WARUNG_KOPI_LUHUR_PRODUCTS, WARUNG_KOPI_LUHUR_RECIPES } from '@coffee-pos/shared-types';
import { fetchIngredients, submitStockOpname } from '../../services/api';

export const StockOpnameView: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [physicalCounts, setPhysicalCounts] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await fetchIngredients();
      setIngredients(data);
      // Initialize physical counts with current system stock
      const initial: { [id: string]: number } = {};
      data.forEach(item => {
        initial[item.id] = item.currentStock;
      });
      setPhysicalCounts(initial);
    } catch (err) {
      console.error('Gagal mengambil bahan baku:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhysicalChange = (id: string, value: number) => {
    setPhysicalCounts(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmitOpname = async () => {
    const entries = ingredients.map(ing => ({
      ingredientId: ing.id,
      physicalStock: physicalCounts[ing.id] ?? ing.currentStock,
      notes: notes[ing.id] || ''
    }));

    try {
      await submitStockOpname('closing-' + Date.now(), entries);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
      loadIngredients();
    } catch (err) {
      console.error('Gagal submit opname:', err);
      alert('Gagal menyimpan hasil stok opname.');
    }
  };

  return (
    <div className="flex-1 bg-[#EAE2D3] flex flex-col h-[calc(100vh-62px)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#E0D6C5] text-[#241C16] px-6 py-4 border-b border-[#D5CBB8] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#241C16] rounded-full text-[#8ABFF8]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#241C16]">
              Manajemen Stok Gramatur (BOM) &amp; <span className="italic font-normal">Stok Opname Harian</span>
            </h2>
            <p className="text-xs text-[#6E6258]">
              Warung Kopi Luhur • Presisi Gram/ml &amp; Target Variansi Deviasi &lt; 2% (FR-SO-07 &amp; FR-SO-09)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadIngredients}
            className="px-3 py-2 bg-[#F7F3EB] hover:bg-[#D5CBB8] text-[#241C16] border border-[#D5CBB8] rounded-full text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleSubmitOpname}
            className="px-4 py-2 bg-[#8ABFF8] hover:bg-[#6CAEF5] text-[#241C16] font-sans font-extrabold text-xs rounded-full shadow flex items-center space-x-2 transition"
          >
            <Save className="w-4 h-4 text-[#241C16]" />
            <span>Simpan Rekonsiliasi Opname</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="bg-green-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Stok opname penutupan harian berhasil disimpan! Stok sistem telah disesuaikan.</span>
          </div>
        </div>
      )}

      {/* Main Content Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl shadow border-2 border-luhur-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-luhur-creamDark text-luhur-coffee font-serif font-bold text-xs uppercase tracking-wider border-b border-luhur-border">
                <th className="py-3 px-4">Nama Bahan Mentah</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Stok Sistem</th>
                <th className="py-3 px-4 text-center">Batas Kritis</th>
                <th className="py-3 px-4 text-center">Hasil Timbang Fisik (Opname)</th>
                <th className="py-3 px-4 text-right">Selisih (Variance)</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {ingredients.map(ing => {
                const physical = physicalCounts[ing.id] ?? ing.currentStock;
                const variance = physical - ing.currentStock;
                const variancePct = ing.currentStock !== 0 ? (Math.abs(variance) / ing.currentStock) * 100 : 0;
                const isLow = ing.currentStock <= ing.minThreshold;
                const isHighVariance = variancePct > 2.0;

                return (
                  <tr key={ing.id} className="hover:bg-luhur-cream/40 transition">
                    <td className="py-3 px-4 font-bold text-luhur-coffee">
                      <div className="flex items-center space-x-2">
                        {isLow && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                        <span>{ing.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold uppercase">
                        {ing.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-luhur-coffee">
                      {ing.currentStock.toFixed(1)} {ing.unit}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-gray-500">
                      {ing.minThreshold} {ing.unit}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <Scale className="w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="number"
                          step="any"
                          value={physical}
                          onChange={(e) => handlePhysicalChange(ing.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-center font-bold px-2 py-1 border-2 border-luhur-border rounded-lg focus:border-luhur-red focus:outline-none"
                        />
                        <span className="text-[11px] font-mono text-gray-500">{ing.unit}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={`px-2 py-1 rounded ${
                        variance === 0
                          ? 'bg-green-50 text-green-700'
                          : isHighVariance
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {variance > 0 ? `+${variance.toFixed(1)}` : variance.toFixed(1)} ({variancePct.toFixed(1)}%)
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Contoh: Kalibrasi grinder"
                        value={notes[ing.id] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [ing.id]: e.target.value }))}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tabel Harga Pokok Penjualan (HPP / COGS) per Menu */}
        <div className="mt-6 bg-[#F7F3EB] rounded-2xl shadow border border-[#D5CBB8] overflow-hidden">
          <div className="px-4 py-3 bg-[#E0D6C5] border-b border-[#D5CBB8] flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-[#241C16]">
                Kalkulasi Harga Pokok Penjualan (HPP / COGS) per Menu
              </h3>
              <p className="text-[11px] text-[#6E6258]">
                Estimasi HPP berbasis gramatur resep bahan baku vs harga jual Warung Kopi Luhur
              </p>
            </div>
            <span className="bg-[#8ABFF8] text-[#241C16] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Gram-Level COGS
            </span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EAE2D3] text-[#241C16] font-serif font-bold text-xs uppercase tracking-wider border-b border-[#D5CBB8]">
                <th className="py-3 px-4">Nama Menu</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">HPP (COGS)</th>
                <th className="py-3 px-4 text-right">Laba Kotor</th>
                <th className="py-3 px-4 text-center">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5CBB8]/60 text-xs">
              {WARUNG_KOPI_LUHUR_PRODUCTS.map(prod => {
                const recipe = WARUNG_KOPI_LUHUR_RECIPES.find(r => r.productId === prod.id);
                let cogs = 0;
                if (recipe) {
                  for (const item of recipe.ingredients) {
                    const ing = ingredients.find(i => i.id === item.ingredientId);
                    cogs += item.amount * (ing?.costPerUnit || 0);
                  }
                } else {
                  cogs = Math.round(prod.basePrice * 0.32);
                }
                const margin = prod.basePrice - cogs;
                const marginPct = Math.round((margin / prod.basePrice) * 100);

                return (
                  <tr key={prod.id} className="hover:bg-[#EAE2D3]/40 transition">
                    <td className="py-2.5 px-4 font-bold text-[#241C16]">{prod.name}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#EAE2D3] text-[#241C16] text-[10px] font-semibold uppercase">
                        {prod.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#241C16]">
                      Rp {prod.basePrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-red-700">
                      Rp {cogs.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                      +Rp {margin.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-[#8ABFF8] text-[#241C16] font-bold px-2 py-0.5 rounded-full text-[11px]">
                        {marginPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

