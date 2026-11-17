import { ProductItem, Ingredient, ProductRecipe } from './index';

export const WARUNG_KOPI_LUHUR_BRAND = {
  name: 'Warung Kopi Luhur',
  tagline: 'Cita Rasa Luhur Warisan Nusantara',
  address: 'Jl. Kopi Luhur No. 1, Indonesia',
  phone: '0812-3456-7890',
  receiptHeader: 'WARUNG KOPI LUHUR\nCita Rasa Luhur Warisan Nusantara',
  receiptFooter: 'Terima kasih atas kunjungannya!\nKumpulkan 7 Stamp untuk 1 Minuman Gratis.\nFollow IG: @warungkopiluhur',
  theme: {
    primary: '#B82424', // Vintage Crimson Red
    primaryDark: '#8F1B1B',
    secondary: '#193153', // Deep Vintage Navy
    accent: '#D97706', // Warm Amber Gold
    creamBg: '#FDFBF7', // Retro Cream
    cardBg: '#FFFDF9',
    textMain: '#24140C', // Dark Coffee Bean
    textMuted: '#6B5E55',
    border: '#E8DBC5'
  }
};

export const INITIAL_INGREDIENTS: Ingredient[] = [
  // Biji Kopi
  { id: 'ing-beans-house', name: 'Biji Kopi House Blend Luhur', unit: 'g', currentStock: 5000, minThreshold: 1000, costPerUnit: 250, category: 'coffee_beans' },
  { id: 'ing-beans-single', name: 'Biji Kopi Single Origin Nusantara', unit: 'g', currentStock: 3000, minThreshold: 500, costPerUnit: 350, category: 'coffee_beans' },
  
  // Susu & Krim
  { id: 'ing-fresh-milk', name: 'Susu Segar (Fresh Milk)', unit: 'ml', currentStock: 15000, minThreshold: 3000, costPerUnit: 18, category: 'dairy_milk' },
  { id: 'ing-luhur-creamer', name: 'Krim Rahasia Luhur', unit: 'ml', currentStock: 5000, minThreshold: 1000, costPerUnit: 30, category: 'dairy_milk' },
  { id: 'ing-oat-milk', name: 'Susu Gandum (Oat Milk)', unit: 'ml', currentStock: 4000, minThreshold: 1000, costPerUnit: 45, category: 'dairy_milk' },
  
  // Sirup & Gula
  { id: 'ing-gula-aren', name: 'Sirup Gula Aren Asli', unit: 'ml', currentStock: 6000, minThreshold: 1200, costPerUnit: 20, category: 'syrup_flavor' },
  { id: 'ing-butterscotch', name: 'Sirup Butterscotch', unit: 'ml', currentStock: 3000, minThreshold: 500, costPerUnit: 60, category: 'syrup_flavor' },
  { id: 'ing-rum-syrup', name: 'Sirup Rum Halal', unit: 'ml', currentStock: 3000, minThreshold: 500, costPerUnit: 55, category: 'syrup_flavor' },
  { id: 'ing-simple-syrup', name: 'Simple Syrup', unit: 'ml', currentStock: 8000, minThreshold: 1500, costPerUnit: 12, category: 'syrup_flavor' },
  { id: 'ing-fruit-orange', name: 'Sari Jeruk Murni', unit: 'ml', currentStock: 4000, minThreshold: 800, costPerUnit: 40, category: 'syrup_flavor' },
  { id: 'ing-fruit-apple', name: 'Sari Apel Murni', unit: 'ml', currentStock: 4000, minThreshold: 800, costPerUnit: 40, category: 'syrup_flavor' },
  { id: 'ing-fruit-berry', name: 'Puree Mixed Berry', unit: 'ml', currentStock: 4000, minThreshold: 800, costPerUnit: 45, category: 'syrup_flavor' },
  { id: 'ing-cocoa-powder', name: 'Bubuk Kakao Premium', unit: 'g', currentStock: 3000, minThreshold: 500, costPerUnit: 120, category: 'syrup_flavor' },
  { id: 'ing-matcha-powder', name: 'Bubuk Teh Hijau Krimi', unit: 'g', currentStock: 2000, minThreshold: 400, costPerUnit: 150, category: 'syrup_flavor' },
  { id: 'ing-tea-leaves', name: 'Daun Teh Hitam Luhur', unit: 'g', currentStock: 3000, minThreshold: 600, costPerUnit: 60, category: 'syrup_flavor' },
  { id: 'ing-peach-flavor', name: 'Ekstrak Peach Alami', unit: 'ml', currentStock: 2500, minThreshold: 500, costPerUnit: 50, category: 'syrup_flavor' },
  { id: 'ing-lychee-flavor', name: 'Ekstrak Lecy Alami', unit: 'ml', currentStock: 2500, minThreshold: 500, costPerUnit: 50, category: 'syrup_flavor' },

  // Topping & Bahan Tambahan
  { id: 'ing-regal-biscuit', name: 'Biskuit Regal', unit: 'pcs', currentStock: 200, minThreshold: 50, costPerUnit: 1500, category: 'other' },
  { id: 'ing-coffee-jelly', name: 'Jeli Kopi Homemade', unit: 'g', currentStock: 3000, minThreshold: 500, costPerUnit: 35, category: 'other' },
  { id: 'ing-cincau-jelly', name: 'Jeli Cincau Alami', unit: 'g', currentStock: 3000, minThreshold: 500, costPerUnit: 25, category: 'other' },
  { id: 'ing-nata-de-coco', name: 'Nata de Coco', unit: 'g', currentStock: 4000, minThreshold: 600, costPerUnit: 25, category: 'other' },

  // Packaging
  { id: 'ing-cup-cold', name: 'Cup Dingin 14oz Luhur', unit: 'pcs', currentStock: 1000, minThreshold: 200, costPerUnit: 600, category: 'packaging' },
  { id: 'ing-cup-hot', name: 'Cup Panas 8oz Double Wall', unit: 'pcs', currentStock: 500, minThreshold: 100, costPerUnit: 750, category: 'packaging' },
  { id: 'ing-lid-flat', name: 'Lid Cup Datar', unit: 'pcs', currentStock: 1000, minThreshold: 200, costPerUnit: 200, category: 'packaging' },
  { id: 'ing-straw', name: 'Sedotan Ramah Lingkungan', unit: 'pcs', currentStock: 1000, minThreshold: 200, costPerUnit: 150, category: 'packaging' },
  { id: 'ing-filter-v60', name: 'Kertas Saring V60', unit: 'pcs', currentStock: 300, minThreshold: 50, costPerUnit: 900, category: 'packaging' }
];

export const WARUNG_KOPI_LUHUR_PRODUCTS: ProductItem[] = [
  // 1. RACIKAN MASTER
  {
    id: 'wkl-rm-01',
    name: 'Kopi Susu Mula',
    category: 'espresso_based',
    basePrice: 15000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Espresso mantap dipadu susu segar dan sentuhan manis klasik mula-mula.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-rm-02',
    name: 'Kopi Susu Luhur',
    category: 'espresso_based',
    basePrice: 18000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Menu primadona racikan khas luhur dengan paduan krim gurih lembut.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-rm-03',
    name: 'Butterscotch Coffee',
    category: 'espresso_based',
    basePrice: 23000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Paduan espresso dan aroma wangi karamel mentega butterscotch yang kaya.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-rm-04',
    name: 'Dirty Latte',
    category: 'espresso_based',
    basePrice: 25000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Susu dingin kental berlapis double shot espresso panas tanpa es batu.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-rm-05',
    name: 'Coffee Ice Cubes',
    category: 'espresso_based',
    basePrice: 25000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Es batu kopi beku pekat yang disiram susu segar gurih dingin.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: false, milkType: true }
  },
  {
    id: 'wkl-rm-06',
    name: 'Rum Regal Kopsus',
    category: 'espresso_based',
    basePrice: 23000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Kopi susu beraroma rum harum berpadu remah biskuit Marie Regal renyah.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-rm-07',
    name: 'Kopi Warisan Leluhur',
    category: 'espresso_based',
    basePrice: 25000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Racikan resep rahasia keluarga luhur dengan aroma rempah manis eksotis.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },

  // 2. KLASIK KOPI
  {
    id: 'wkl-kk-01',
    name: 'Latte',
    category: 'espresso_based',
    basePrice: 23000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Espresso dengan susu steamed lembut berselimut busa tipis.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-kk-02',
    name: 'Americano / Long Black',
    category: 'espresso_based',
    basePrice: 15000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Ekstraksi espresso murni di atas air panas atau es segar.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: false }
  },
  {
    id: 'wkl-kk-03',
    name: 'Cappuccino',
    category: 'espresso_based',
    basePrice: 25000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Keseimbangan seimbang espresso, susu hangat, dan busa susu tebal.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-kk-04',
    name: 'Mochacino',
    category: 'espresso_based',
    basePrice: 25000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Perpaduan mesra antara espresso pekat dan cokelat premium.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },
  {
    id: 'wkl-kk-05',
    name: 'Spanish Latte',
    category: 'espresso_based',
    basePrice: 20000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Latte gaya Spanyol dengan rasa manis legit yang memikat.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: true, milkType: true }
  },

  // 3. KOPI BUAH
  {
    id: 'wkl-kb-01',
    name: 'Es Kopi Jeruk',
    category: 'espresso_based',
    basePrice: 18000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Kesegaran bulir sari jeruk dipadukan dengan espresso dingin.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: true, milkType: false }
  },
  {
    id: 'wkl-kb-02',
    name: 'Es Kopi Apel',
    category: 'espresso_based',
    basePrice: 18000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Manis renyah aroma apel fuji berpadu seimbang dengan kopi dingin.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: true, milkType: false }
  },
  {
    id: 'wkl-kb-03',
    name: 'Es Kopi Berry',
    category: 'espresso_based',
    basePrice: 18000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Asam manis puree buah beri liar bercampur sensasi espresso dingin.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: true, milkType: false }
  },
  {
    id: 'wkl-kb-04',
    name: 'Wine Citrus Coffee',
    category: 'espresso_based',
    basePrice: 20000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Karakter fermentasi kopi aroma wine non-alkohol berpadu kesegaran citrus.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: true, milkType: false }
  },

  // 4. RACIKAN MANUAL
  {
    id: 'wkl-rmn-01',
    name: 'Tetes Luhur (V60)',
    category: 'manual_brew',
    basePrice: 24000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Seduhan manual pour over V60 menonjolkan aroma bunga dan rasa buah alami.',
    supportedModifiers: { temperature: true, sweetness: false, espressoRatio: false, milkType: false }
  },
  {
    id: 'wkl-rmn-02',
    name: 'Kopi Negeri Matahari',
    category: 'manual_brew',
    basePrice: 25000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Kopi pilihan dari tanah pegunungan timur dengan proses pasca-panen khas.',
    supportedModifiers: { temperature: true, sweetness: false, espressoRatio: false, milkType: false }
  },

  // 5. BUKAN KOPI
  {
    id: 'wkl-bk-01',
    name: 'Air Pegunungan',
    category: 'tea_mocktail',
    basePrice: 5000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Air mineral murni dingin atau suhu ruang penawar dahaga.',
    supportedModifiers: { temperature: true, sweetness: false, espressoRatio: false, milkType: false }
  },
  {
    id: 'wkl-bk-02',
    name: 'Teh Luhur',
    category: 'tea_mocktail',
    basePrice: 8000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Seduhan daun teh hitam pilihan dengan wangi melati dan sepat yang pas.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: false, milkType: false }
  },
  {
    id: 'wkl-bk-03',
    name: 'Peach Tea',
    category: 'tea_mocktail',
    basePrice: 15000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Teh melati dingin dengan keharuman buah persik menyegarkan.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: false, milkType: false }
  },
  {
    id: 'wkl-bk-04',
    name: 'Lecy Tea',
    category: 'tea_mocktail',
    basePrice: 15000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Teh leci dingin manis wangi dengan sensasi buah tropis.',
    supportedModifiers: { temperature: false, sweetness: true, espressoRatio: false, milkType: false }
  },
  {
    id: 'wkl-bk-05',
    name: 'Kakao',
    category: 'milk_based',
    basePrice: 18000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Minuman cokelat kakao kental dan lembut kesukaan semua kalangan.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: false, milkType: true }
  },
  {
    id: 'wkl-bk-06',
    name: 'Teh Hijau Krimi',
    category: 'milk_based',
    basePrice: 23000,
    targetStation: 'BARISTA',
    isAvailable: true,
    description: 'Paduan teh hijau murni dan susu krimi gurih yang menenangkan.',
    supportedModifiers: { temperature: true, sweetness: true, espressoRatio: false, milkType: true }
  }
];

// 6. PENYEMPURNA (Add-ons / Modifiers)
export const WARUNG_KOPI_LUHUR_ADDONS = [
  { id: 'addon-espresso', name: 'Ekstra Espresso', price: 4000, targetStation: 'BARISTA' as const, ingredientId: 'ing-beans-house', amount: 9, unit: 'g' as const },
  { id: 'addon-syrup', name: 'Ekstra Sirup', price: 3000, targetStation: 'BARISTA' as const, ingredientId: 'ing-simple-syrup', amount: 20, unit: 'ml' as const },
  { id: 'addon-jeli-kopi', name: 'Jeli Kopi', price: 3000, targetStation: 'BARISTA' as const, ingredientId: 'ing-coffee-jelly', amount: 40, unit: 'g' as const },
  { id: 'addon-jeli-cincau', name: 'Jeli Cincau', price: 3000, targetStation: 'BARISTA' as const, ingredientId: 'ing-cincau-jelly', amount: 40, unit: 'g' as const },
  { id: 'addon-nata', name: 'Nata de Coco', price: 3000, targetStation: 'BARISTA' as const, ingredientId: 'ing-nata-de-coco', amount: 40, unit: 'g' as const }
];

// Bill of Materials (BOM) Resep Presisi Warung Kopi Luhur
export const WARUNG_KOPI_LUHUR_RECIPES: ProductRecipe[] = [
  {
    productId: 'wkl-rm-01', // Kopi Susu Mula
    ingredients: [
      { ingredientId: 'ing-beans-house', amount: 18, unit: 'g' },
      { ingredientId: 'ing-fresh-milk', amount: 120, unit: 'ml' },
      { ingredientId: 'ing-gula-aren', amount: 25, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-lid-flat', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-straw', amount: 1, unit: 'pcs' }
    ]
  },
  {
    productId: 'wkl-rm-02', // Kopi Susu Luhur
    ingredients: [
      { ingredientId: 'ing-beans-house', amount: 18, unit: 'g' },
      { ingredientId: 'ing-fresh-milk', amount: 100, unit: 'ml' },
      { ingredientId: 'ing-luhur-creamer', amount: 25, unit: 'ml' },
      { ingredientId: 'ing-gula-aren', amount: 20, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-lid-flat', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-straw', amount: 1, unit: 'pcs' }
    ]
  },
  {
    productId: 'wkl-rm-03', // Butterscotch Coffee
    ingredients: [
      { ingredientId: 'ing-beans-house', amount: 18, unit: 'g' },
      { ingredientId: 'ing-fresh-milk', amount: 120, unit: 'ml' },
      { ingredientId: 'ing-butterscotch', amount: 25, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-lid-flat', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-straw', amount: 1, unit: 'pcs' }
    ]
  },
  {
    productId: 'wkl-kk-02', // Americano
    ingredients: [
      { ingredientId: 'ing-beans-house', amount: 18, unit: 'g' },
      { ingredientId: 'ing-cup-cold', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-lid-flat', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-straw', amount: 1, unit: 'pcs' }
    ]
  },
  {
    productId: 'wkl-rmn-01', // V60
    ingredients: [
      { ingredientId: 'ing-beans-single', amount: 15, unit: 'g' },
      { ingredientId: 'ing-filter-v60', amount: 1, unit: 'pcs' },
      { ingredientId: 'ing-cup-hot', amount: 1, unit: 'pcs' }
    ]
  }
];

