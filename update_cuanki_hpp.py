import re

with open('warung-kopi-luhur-pos.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update MASTER_RAW_MATERIALS to ensure Sambal Cuanki, Jeruk Limau, Cup+Sendok, Plastik+Kresek exist
old_mat = """      // 7. BAHAN DAPUR CUANKI
      { name: 'Bakso Sapi Luhur', unit: 'butir', packQty: 1, packPrice: 1200, unitCost: 1200 },
      { name: 'Tahu Isi Cuanki', unit: 'pcs', packQty: 1, packPrice: 1100, unitCost: 1100 },
      { name: 'Tahu Putih', unit: 'pcs', packQty: 1, packPrice: 800, unitCost: 800 },
      { name: 'Siomay Cuanki', unit: 'pcs', packQty: 1, packPrice: 800, unitCost: 800 },
      { name: 'Batagor Lidah', unit: 'pcs', packQty: 1, packPrice: 900, unitCost: 900 },
      { name: 'Pilus Cikur', unit: 'porsi', packQty: 1, packPrice: 700, unitCost: 700 },
      { name: 'Ceker Presto', unit: 'pcs', packQty: 1, packPrice: 1200, unitCost: 1200 },
      { name: 'Tetelan Sapi', unit: 'porsi', packQty: 1, packPrice: 1200, unitCost: 1200 },
      { name: 'Kuah Kaldu ORI', unit: 'porsi', packQty: 1, packPrice: 1000, unitCost: 1000 },
      { name: 'Mie Kuning Basah', unit: 'porsi', packQty: 1, packPrice: 2000, unitCost: 2000 },
      { name: 'Kuah Laksa', unit: 'porsi', packQty: 1, packPrice: 3800, unitCost: 3800 },
      { name: 'Kuah Tomyam', unit: 'porsi', packQty: 1, packPrice: 4000, unitCost: 4000 },
      { name: 'Cabai Rawit', unit: 'porsi', packQty: 1, packPrice: 1000, unitCost: 1000 },
      { name: 'Sambal + Jeruk', unit: 'porsi', packQty: 1, packPrice: 1200, unitCost: 1200 }"""

new_mat = """      // 7. BAHAN DAPUR CUANKI (SESUAI SPREADSHEET RESMI)
      { name: 'Bakso Sapi Luhur', unit: 'butir', packQty: 1, packPrice: 1200, unitCost: 1200 },
      { name: 'Tahu Isi Cuanki', unit: 'pcs', packQty: 1, packPrice: 1100, unitCost: 1100 },
      { name: 'Tahu Putih', unit: 'pcs', packQty: 1, packPrice: 800, unitCost: 800 },
      { name: 'Siomay Cuanki', unit: 'pcs', packQty: 1, packPrice: 800, unitCost: 800 },
      { name: 'Batagor Lidah', unit: 'pcs', packQty: 1, packPrice: 900, unitCost: 900 },
      { name: 'Pilus Cikur', unit: 'porsi', packQty: 1, packPrice: 700, unitCost: 700 },
      { name: 'Ceker Presto', unit: 'pcs', packQty: 1, packPrice: 1200, unitCost: 1200 },
      { name: 'Tetelan Sapi', unit: 'porsi', packQty: 1, packPrice: 1200, unitCost: 1200 },
      { name: 'Kuah Kaldu ORI', unit: 'porsi', packQty: 1, packPrice: 1000, unitCost: 1000 },
      { name: 'Mie Kuning Basah', unit: 'porsi', packQty: 1, packPrice: 2000, unitCost: 2000 },
      { name: 'Kuah Laksa', unit: 'porsi', packQty: 1, packPrice: 3800, unitCost: 3800 },
      { name: 'Kuah Tomyam', unit: 'porsi', packQty: 1, packPrice: 4000, unitCost: 4000 },
      { name: 'Cabai Rawit', unit: 'porsi', packQty: 1, packPrice: 1000, unitCost: 1000 },
      { name: 'Sambal Cuanki', unit: 'porsi', packQty: 1, packPrice: 700, unitCost: 700 },
      { name: 'Jeruk Limau', unit: 'pcs', packQty: 1, packPrice: 500, unitCost: 500 },
      { name: 'Cup + Sendok Cuanki', unit: 'pcs', packQty: 1, packPrice: 1600, unitCost: 1600 },
      { name: 'Plastik + Kresek Cuanki', unit: 'pcs', packQty: 1, packPrice: 700, unitCost: 700 }"""

assert old_mat in content, "old_mat not found"
content = content.replace(old_mat, new_mat)

# 2. Update HPP_RECIPE_TEMPLATES to include all 4 Cuanki templates
old_cuanki_tmpl = """      cuanki_luhur: {
        name: 'Cuanki Luhur (Lengkap)',
        cat: 'cuanki',
        station: 'KITCHEN',
        price: 22000,
        cogs: 14400,
        pkg: { plastik: false, sealer: false, straw: false, cup: false, cuanki: true },
        ingredients: [
          { name: 'Bakso Sapi Luhur', qty: 1, unit: 'butir', unitCost: 1200 },
          { name: 'Tahu Isi Cuanki', qty: 1, unit: 'pcs', unitCost: 1100 },
          { name: 'Tahu Putih', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Siomay Cuanki', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Batagor Lidah', qty: 1, unit: 'pcs', unitCost: 900 },
          { name: 'Pilus Cikur', qty: 1, unit: 'porsi', unitCost: 700 },
          { name: 'Ceker Presto', qty: 1, unit: 'pcs', unitCost: 1200 },
          { name: 'Tetelan Sapi', qty: 1, unit: 'porsi', unitCost: 1200 },
          { name: 'Kuah Kaldu ORI', qty: 1, unit: 'porsi', unitCost: 1000 },
          { name: 'Mie Kuning Basah', qty: 1, unit: 'porsi', unitCost: 2000 },
          { name: 'Sambal + Jeruk', qty: 1, unit: 'porsi', unitCost: 1200 }
        ]
      }"""

new_cuanki_tmpl = """      cuanki_tanggal_tua: {
        name: 'Cuanki Tanggal Tua',
        cat: 'cuanki',
        station: 'KITCHEN',
        price: 14500,
        cogs: 10400,
        pkg: { plastik: false, sealer: false, straw: false, cup: false, cuankiCup: true, cuankiPlastik: true },
        ingredients: [
          { name: 'Bakso Sapi Luhur', qty: 1, unit: 'butir', unitCost: 1200 },
          { name: 'Tahu Isi Cuanki', qty: 1, unit: 'pcs', unitCost: 1100 },
          { name: 'Tahu Putih', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Siomay Cuanki', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Sambal Cuanki', qty: 1, unit: 'porsi', unitCost: 700 },
          { name: 'Jeruk Limau', qty: 1, unit: 'pcs', unitCost: 500 },
          { name: 'Kuah Kaldu ORI', qty: 1, unit: 'porsi', unitCost: 1000 },
          { name: 'Mie Kuning Basah', qty: 1, unit: 'porsi', unitCost: 2000 }
        ]
      },
      cuanki_icip2: {
        name: 'Cuanki Icip2 (Special)',
        cat: 'cuanki',
        station: 'KITCHEN',
        price: 20000,
        cogs: 13200,
        pkg: { plastik: false, sealer: false, straw: false, cup: false, cuankiCup: true, cuankiPlastik: true },
        ingredients: [
          { name: 'Bakso Sapi Luhur', qty: 1, unit: 'butir', unitCost: 1200 },
          { name: 'Tahu Isi Cuanki', qty: 1, unit: 'pcs', unitCost: 1100 },
          { name: 'Tahu Putih', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Siomay Cuanki', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Batagor Lidah', qty: 1, unit: 'pcs', unitCost: 900 },
          { name: 'Pilus Cikur', qty: 1, unit: 'porsi', unitCost: 700 },
          { name: 'Tetelan Sapi', qty: 1, unit: 'porsi', unitCost: 1200 },
          { name: 'Sambal Cuanki', qty: 1, unit: 'porsi', unitCost: 700 },
          { name: 'Jeruk Limau', qty: 1, unit: 'pcs', unitCost: 500 },
          { name: 'Kuah Kaldu ORI', qty: 1, unit: 'porsi', unitCost: 1000 },
          { name: 'Mie Kuning Basah', qty: 1, unit: 'porsi', unitCost: 2000 }
        ]
      },
      cuanki_luhur: {
        name: 'Cuanki Luhur (Lengkap) 👍',
        cat: 'cuanki',
        station: 'KITCHEN',
        price: 22000,
        cogs: 14400,
        pkg: { plastik: false, sealer: false, straw: false, cup: false, cuankiCup: true, cuankiPlastik: true },
        ingredients: [
          { name: 'Bakso Sapi Luhur', qty: 1, unit: 'butir', unitCost: 1200 },
          { name: 'Tahu Isi Cuanki', qty: 1, unit: 'pcs', unitCost: 1100 },
          { name: 'Tahu Putih', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Siomay Cuanki', qty: 1, unit: 'pcs', unitCost: 800 },
          { name: 'Batagor Lidah', qty: 1, unit: 'pcs', unitCost: 900 },
          { name: 'Pilus Cikur', qty: 1, unit: 'porsi', unitCost: 700 },
          { name: 'Ceker Presto', qty: 1, unit: 'pcs', unitCost: 1200 },
          { name: 'Tetelan Sapi', qty: 1, unit: 'porsi', unitCost: 1200 },
          { name: 'Sambal Cuanki', qty: 1, unit: 'porsi', unitCost: 700 },
          { name: 'Jeruk Limau', qty: 1, unit: 'pcs', unitCost: 500 },
          { name: 'Kuah Kaldu ORI', qty: 1, unit: 'porsi', unitCost: 1000 },
          { name: 'Mie Kuning Basah', qty: 1, unit: 'porsi', unitCost: 2000 }
        ]
      },
      cuanki_duo: {
        name: 'Cuanki Duo (Dua Porsi CTT)',
        cat: 'cuanki',
        station: 'KITCHEN',
        price: 28000,
        cogs: 20800,
        pkg: { plastik: false, sealer: false, straw: false, cup: false, cuankiCup: 2, cuankiPlastik: 2 },
        ingredients: [
          { name: 'Bakso Sapi Luhur', qty: 2, unit: 'butir', unitCost: 1200 },
          { name: 'Tahu Isi Cuanki', qty: 2, unit: 'pcs', unitCost: 1100 },
          { name: 'Tahu Putih', qty: 2, unit: 'pcs', unitCost: 800 },
          { name: 'Siomay Cuanki', qty: 2, unit: 'pcs', unitCost: 800 },
          { name: 'Sambal Cuanki', qty: 2, unit: 'porsi', unitCost: 700 },
          { name: 'Jeruk Limau', qty: 2, unit: 'pcs', unitCost: 500 },
          { name: 'Kuah Kaldu ORI', qty: 2, unit: 'porsi', unitCost: 1000 },
          { name: 'Mie Kuning Basah', qty: 2, unit: 'porsi', unitCost: 2000 }
        ]
      }"""

assert old_cuanki_tmpl in content, "old_cuanki_tmpl not found"
content = content.replace(old_cuanki_tmpl, new_cuanki_tmpl)

with open('warung-kopi-luhur-pos.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Step 1 & 2 completed successfully!")
