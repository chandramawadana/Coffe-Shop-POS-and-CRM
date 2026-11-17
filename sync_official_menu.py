import re

def main():
    with open('warung-kopi-luhur-pos.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update INGREDIENTS to only beverage & packaging ingredients
    old_ing_start = html.find('const INGREDIENTS = [')
    old_ing_end = html.find('];', old_ing_start) + 2
    assert old_ing_start != -1 and old_ing_end != -1, "INGREDIENTS not found"

    new_ingredients = '''const INGREDIENTS = [
      { id: 'beans', name: 'Biji Kopi House Blend Luhur', cat: 'Biji Kopi & Minuman', stock: 4946, min: 1000, unit: 'g' },
      { id: 'single', name: 'Biji Kopi Single Origin Nusantara', cat: 'Biji Kopi & Minuman', stock: 3000, min: 500, unit: 'g' },
      { id: 'milk', name: 'Susu Segar (Fresh Milk)', cat: 'Biji Kopi & Minuman', stock: 14670, min: 3000, unit: 'ml' },
      { id: 'oat', name: 'Susu Gandum (Oat Milk)', cat: 'Biji Kopi & Minuman', stock: 4000, min: 1000, unit: 'ml' },
      { id: 'aren', name: 'Sirup Gula Aren Asli', cat: 'Biji Kopi & Minuman', stock: 5940, min: 1200, unit: 'ml' },
      { id: 'butterscotch', name: 'Sirup Butterscotch & Rum', cat: 'Biji Kopi & Minuman', stock: 3000, min: 600, unit: 'ml' },
      { id: 'syrup_buah', name: 'Sari Buah (Jeruk, Apel, Berry & Citrus)', cat: 'Biji Kopi & Minuman', stock: 4500, min: 1000, unit: 'ml' },
      { id: 'teh', name: 'Daun Teh Hitam Melati Luhur', cat: 'Biji Kopi & Minuman', stock: 2500, min: 500, unit: 'g' },
      { id: 'matcha', name: 'Bubuk Teh Hijau Krimi', cat: 'Biji Kopi & Minuman', stock: 1800, min: 400, unit: 'g' },
      { id: 'kakao', name: 'Bubuk Kakao Cokelat Premium', cat: 'Biji Kopi & Minuman', stock: 3200, min: 600, unit: 'g' },
      { id: 'regal', name: 'Biskuit Marie Regal & Cookies', cat: 'Bahan Tambahan', stock: 80, min: 20, unit: 'pcs' },
      { id: 'topping', name: 'Topping (Jeli Kopi, Cincau & Nata)', cat: 'Bahan Tambahan', stock: 5000, min: 1000, unit: 'g' },
      { id: 'cup', name: 'Cup Dingin 14oz + Lid + Straw', cat: 'Packaging', stock: 997, min: 200, unit: 'pcs' },
      { id: 'cup_hot', name: 'Cup Panas 8oz + Lid Paper', cat: 'Packaging', stock: 450, min: 100, unit: 'pcs' }
    ];'''
    html = html[:old_ing_start] + new_ingredients + html[old_ing_end:]

    # 2. Update PRODUCTS to exact 27 drinks + 5 add-ons from the uploaded image
    old_prod_start = html.find('const PRODUCTS = [')
    old_prod_end = html.find('];', old_prod_start) + 2
    assert old_prod_start != -1 and old_prod_end != -1, "PRODUCTS not found"

    new_products = '''const PRODUCTS = [
      // 1. RACIKAN MASTER (8)
      { id: 'wkl-rm-01', name: 'Kopi Susu Mula', cat: 'racikan_master', type: 'drink', price: 15000, station: 'BARISTA', cogs: 5200, desc: 'Espresso mantap dipadu susu segar dan sentuhan manis klasik mula-mula.' },
      { id: 'wkl-rm-02', name: 'Kopi Susu Luhur', cat: 'racikan_master', type: 'drink', price: 18000, station: 'BARISTA', cogs: 6800, desc: 'Menu primadona racikan khas luhur dengan paduan krim gurih lembut.' },
      { id: 'wkl-rm-03', name: 'Butterscotch Coffee', cat: 'racikan_master', type: 'drink', price: 23000, station: 'BARISTA', cogs: 7900, desc: 'Paduan espresso dan aroma wangi karamel mentega butterscotch.' },
      { id: 'wkl-rm-04', name: 'Dirty Latte', cat: 'racikan_master', type: 'drink', price: 25000, station: 'BARISTA', cogs: 8500, desc: 'Susu dingin kental berlapis double shot espresso panas tanpa es.' },
      { id: 'wkl-rm-05', name: 'Coffee Ice Cubes', cat: 'racikan_master', type: 'drink', price: 25000, station: 'BARISTA', cogs: 8200, desc: 'Es batu kopi beku pekat disiram susu segar gurih dingin.' },
      { id: 'wkl-rm-06', name: 'Hitam Aren Luhur', cat: 'racikan_master', type: 'drink', price: 25000, station: 'BARISTA', cogs: 7500, desc: 'Espresso hitam pekat dengan manis legit gula aren murni pilihan.' },
      { id: 'wkl-rm-07', name: 'Kopi Susu Rum Regal', cat: 'racikan_master', type: 'drink', price: 25000, station: 'BARISTA', cogs: 8900, desc: 'Kopi susu beraroma rum harum berpadu taburan remah biskuit Marie Regal.' },
      { id: 'wkl-rm-08', name: 'Kopi Warisan Leluhur', cat: 'racikan_master', type: 'drink', price: 25000, station: 'BARISTA', cogs: 8600, desc: 'Racikan resep rahasia keluarga luhur dengan aroma rempah eksotis nusantara.' },

      // 2. KLASIK KOPI (6)
      { id: 'wkl-kk-01', name: 'Latte', cat: 'klasik_kopi', type: 'drink', price: 23000, station: 'BARISTA', cogs: 7600, desc: 'Espresso dengan susu steamed lembut berselimut microfoam tipis.' },
      { id: 'wkl-kk-02', name: 'Americano / Long Black', cat: 'klasik_kopi', type: 'drink', price: 15000, station: 'BARISTA', cogs: 4200, desc: 'Ekstraksi espresso murni ganda di atas air panas atau es segar.' },
      { id: 'wkl-kk-03', name: 'Cappucino', cat: 'klasik_kopi', type: 'drink', price: 25000, station: 'BARISTA', cogs: 8000, desc: 'Keseimbangan seimbang espresso pekat, susu hangat, dan busa tebal.' },
      { id: 'wkl-kk-04', name: 'Mochacino', cat: 'klasik_kopi', type: 'drink', price: 25000, station: 'BARISTA', cogs: 8800, desc: 'Perpaduan mesra antara espresso pekat dan cokelat kakao premium.' },
      { id: 'wkl-kk-05', name: 'Kopi Coklat', cat: 'klasik_kopi', type: 'drink', price: 20000, station: 'BARISTA', cogs: 6900, desc: 'Kombinasi klasik kopi mantap dan manis gurih cokelat nusantara.' },
      { id: 'wkl-kk-06', name: 'Spanish Latte', cat: 'klasik_kopi', type: 'drink', price: 20000, station: 'BARISTA', cogs: 6800, desc: 'Latte gaya Spanyol dengan rasa manis legit lembut yang memikat.' },

      // 3. KOPI BUAH (4)
      { id: 'wkl-kb-01', name: 'Es Kopi Jeruk', cat: 'kopi_buah', type: 'drink', price: 18000, station: 'BARISTA', cogs: 6100, desc: 'Kesegaran sari jeruk citrus segar dipadukan dengan espresso dingin.' },
      { id: 'wkl-kb-02', name: 'Es Kopi Apel', cat: 'kopi_buah', type: 'drink', price: 18000, station: 'BARISTA', cogs: 6100, desc: 'Manis renyah aroma apel fuji berpadu seimbang dengan kopi segar.' },
      { id: 'wkl-kb-03', name: 'Es Kopi Berry', cat: 'kopi_buah', type: 'drink', price: 18000, station: 'BARISTA', cogs: 6200, desc: 'Asam manis puree buah beri liar bercampur espresso dingin menyegarkan.' },
      { id: 'wkl-kb-04', name: 'Wine Citrus Coffee', cat: 'kopi_buah', type: 'drink', price: 20000, station: 'BARISTA', cogs: 6800, desc: 'Karakter fermentasi kopi aroma wine non-alkohol & sentuhan jeruk citrus.' },

      // 4. RACIKAN MANUAL (2)
      { id: 'wkl-rmn-01', name: 'Tetes Luhur (V60)', cat: 'racikan_manual', type: 'drink', price: 24000, station: 'BARISTA', cogs: 7500, desc: 'Seduhan manual pour over V60 biji kopi single origin nusantara berkarakter bersih.' },
      { id: 'wkl-rmn-02', name: 'Kopi Negeri Matahari', cat: 'racikan_manual', type: 'drink', price: 25000, station: 'BARISTA', cogs: 7900, desc: 'Kopi pilihan pegunungan timur dengan proses pasca-panen khas aromatik.' },

      // 5. BUKAN KOPI (7)
      { id: 'wkl-bk-01', name: 'Air Pegunungan', cat: 'bukan_kopi', type: 'drink', price: 5000, station: 'BARISTA', cogs: 1500, desc: 'Air mineral murni sumber pegunungan dingin atau suhu ruang.' },
      { id: 'wkl-bk-02', name: 'Teh Luhur', cat: 'bukan_kopi', type: 'drink', price: 8000, station: 'BARISTA', cogs: 2200, desc: 'Seduhan daun teh hitam pilihan dengan keharuman bunga melati asli.' },
      { id: 'wkl-bk-03', name: 'Lychee Tea Mutiara', cat: 'bukan_kopi', type: 'drink', price: 15000, station: 'BARISTA', cogs: 4800, desc: 'Teh buah leci manis wangi disajikan dingin dengan topping mutiara kenyal.' },
      { id: 'wkl-bk-04', name: 'Peach Tea De Coco', cat: 'bukan_kopi', type: 'drink', price: 15000, station: 'BARISTA', cogs: 4800, desc: 'Teh persik segar manis wangi dengan tekstur nata de coco renyah.' },
      { id: 'wkl-bk-05', name: 'Kakao', cat: 'bukan_kopi', type: 'drink', price: 18000, station: 'BARISTA', cogs: 6200, desc: 'Minuman cokelat kakao premium kental, gurih, dan lembut di lidah.' },
      { id: 'wkl-bk-06', name: 'Cookies & Cream', cat: 'bukan_kopi', type: 'drink', price: 23000, station: 'BARISTA', cogs: 7800, desc: 'Krim vanilla manis gurih berpadu taburan remah cookies cokelat lezat.' },
      { id: 'wkl-bk-07', name: 'Teh Hijau Krimi', cat: 'bukan_kopi', type: 'drink', price: 23000, station: 'BARISTA', cogs: 7200, desc: 'Paduan teh hijau matcha murni dan susu segar yang lembut gurih.' },

      // 6. PENYEMPURNA (5 Add-ons)
      { id: 'addon-syrup', name: 'Ekstra Sirup', cat: 'penyempurna', type: 'addon', price: 3000, station: 'BARISTA', cogs: 900, desc: 'Tambahan 20ml sirup rasa pilihan (Aren / Hazelnut / Vanilla / Caramel).' },
      { id: 'addon-jeli-kopi', name: 'Jeli Kopi', cat: 'penyempurna', type: 'addon', price: 3000, station: 'BARISTA', cogs: 900, desc: 'Topping jeli rasa kopi kenyal buatan kedai.' },
      { id: 'addon-jeli-cincau', name: 'Jeli Cincau', cat: 'penyempurna', type: 'addon', price: 3000, station: 'BARISTA', cogs: 900, desc: 'Topping cincau hitam alami penyegar dahaga.' },
      { id: 'addon-nata', name: 'Nata de Coco', cat: 'penyempurna', type: 'addon', price: 3000, station: 'BARISTA', cogs: 900, desc: 'Topping nata de coco kelapa kenyal renyah segar.' },
      { id: 'addon-espresso', name: 'Ekstra Espresso', cat: 'penyempurna', type: 'addon', price: 4000, station: 'BARISTA', cogs: 1200, desc: 'Tambahan 1 shot ekstraksi espresso pekat house blend.' }
    ];'''
    html = html[:old_prod_start] + new_products + html[old_prod_end:]

    # 3. Update catBar in HTML: remove all food buttons
    old_catbar = '''            <div class="cat-bar" id="catBar">
              <button class="cat-pill active" onclick="selectCategory('all', this)">Semua Menu</button>
              <button class="cat-pill" onclick="selectCategory('racikan_master', this)">Racikan Master</button>
              <button class="cat-pill" onclick="selectCategory('klasik_kopi', this)">Klasik Kopi</button>
              <button class="cat-pill" onclick="selectCategory('kopi_buah', this)">Kopi Buah</button>
              <button class="cat-pill" onclick="selectCategory('racikan_manual', this)">Racikan Manual</button>
              <button class="cat-pill" onclick="selectCategory('bukan_kopi', this)">Bukan Kopi</button>
              <button class="cat-pill" onclick="selectCategory('makanan', this)">🍽️ Semua Makanan (12)</button>
              <button class="cat-pill" onclick="selectCategory('makanan_utama', this)">🍛 Makanan Utama (4)</button>
              <button class="cat-pill" onclick="selectCategory('snack', this)">🍟 Snack &amp; Toast (8)</button>
              <button class="cat-pill" onclick="selectCategory('penyempurna', this)">Penyempurna</button>
            </div>'''

    new_catbar = '''            <div class="cat-bar" id="catBar">
              <button class="cat-pill active" onclick="selectCategory('all', this)">Semua Menu (27)</button>
              <button class="cat-pill" onclick="selectCategory('racikan_master', this)">Racikan Master (8)</button>
              <button class="cat-pill" onclick="selectCategory('klasik_kopi', this)">Klasik Kopi (6)</button>
              <button class="cat-pill" onclick="selectCategory('kopi_buah', this)">Kopi Buah (4)</button>
              <button class="cat-pill" onclick="selectCategory('racikan_manual', this)">Racikan Manual (2)</button>
              <button class="cat-pill" onclick="selectCategory('bukan_kopi', this)">Bukan Kopi (7)</button>
              <button class="cat-pill" onclick="selectCategory('penyempurna', this)">✨ Penyempurna (5)</button>
            </div>'''
    assert old_catbar in html, "old_catbar not found"
    html = html.replace(old_catbar, new_catbar, 1)

    # 4. Update renderMenu() to cleanly filter
    old_render_menu_start = html.find('function renderMenu() {')
    old_render_menu_end = html.find('grid.innerHTML = filtered.map(p => `', old_render_menu_start)
    assert old_render_menu_start != -1 and old_render_menu_end != -1, "renderMenu not found"

    new_render_menu_head = '''function renderMenu() {
      const grid = document.getElementById('menuGrid');
      const q = (document.getElementById('menuSearch')?.value || '').toLowerCase();
      const filtered = PRODUCTS.filter(p => {
        const matchCat = (activeCategory === 'all' || p.cat === activeCategory);
        const matchSearch = p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
        return matchCat && matchSearch;
      });

      '''
    html = html[:old_render_menu_start] + new_render_menu_head + html[old_render_menu_end:]

    # 5. Update renderCart() badge
    old_cart_badge = '''                  ${it.station === 'KITCHEN' 
                    ? '<span style="font-size:9.5px;background:#FEF3C7;color:#92400E;padding:1px 6px;border-radius:4px;font-weight:800;border:1px solid #FDE68A;">🍳 Dapur Kitchen</span>' 
                    : '<span style="font-size:9.5px;background:#E0F2FE;color:#0369A1;padding:1px 6px;border-radius:4px;font-weight:800;border:1px solid #BAE6FD;">☕ Bar Seduh</span>'}'''

    new_cart_badge = '''                  <span style="font-size:9.5px;background:#E0F2FE;color:#0369A1;padding:1px 6px;border-radius:4px;font-weight:800;border:1px solid #BAE6FD;">☕ Bar Seduh</span>'''
    if old_cart_badge in html:
        html = html.replace(old_cart_badge, new_cart_badge, 1)

    # 6. Update HPP Filters HTML
    old_hpp_pills = '''                  <button class="cat-pill active" id="hppFilterAll" onclick="filterHpp('all')">Semua Menu (36)</button>
                  <button class="cat-pill" id="hppFilterDrinks" onclick="filterHpp('drinks')">☕ Minuman (24)</button>
                  <button class="cat-pill" id="hppFilterFoods" onclick="filterHpp('foods')">🍽️ Makanan &amp; Snack (12)</button>'''

    new_hpp_pills = '''                  <button class="cat-pill active" id="hppFilterAll" onclick="filterHpp('all')">Semua Menu (27)</button>
                  <button class="cat-pill" id="hppFilterDrinks" onclick="filterHpp('coffee')">☕ Minuman Kopi (20)</button>
                  <button class="cat-pill" id="hppFilterNonCoffee" onclick="filterHpp('non_coffee')">🍵 Bukan Kopi (7)</button>
                  <button class="cat-pill" id="hppFilterAddons" onclick="filterHpp('addons')">✨ Penyempurna (5)</button>'''
    assert old_hpp_pills in html, "old_hpp_pills not found"
    html = html.replace(old_hpp_pills, new_hpp_pills, 1)

    # 7. Update filterHpp and renderHppTable functions
    old_hpp_func_start = html.find('function filterHpp(cat) {')
    old_hpp_func_end = html.find('// ==========================================\n    // KDS BOARD RENDERING', old_hpp_func_start)
    assert old_hpp_func_start != -1 and old_hpp_func_end != -1, "filterHpp not found"

    new_hpp_funcs = '''function filterHpp(cat) {
      activeHppFilter = cat;
      document.getElementById('hppFilterAll').classList.toggle('active', cat === 'all');
      document.getElementById('hppFilterDrinks').classList.toggle('active', cat === 'coffee');
      document.getElementById('hppFilterNonCoffee').classList.toggle('active', cat === 'non_coffee');
      document.getElementById('hppFilterAddons').classList.toggle('active', cat === 'addons');
      renderHppTable();
    }

    function renderHppTable() {
      const hppBody = document.getElementById('hppTableBody');
      if (!hppBody) return;

      const filtered = PRODUCTS.filter(p => {
        if (activeHppFilter === 'coffee') return ['racikan_master', 'klasik_kopi', 'kopi_buah', 'racikan_manual'].includes(p.cat);
        if (activeHppFilter === 'non_coffee') return p.cat === 'bukan_kopi';
        if (activeHppFilter === 'addons') return p.cat === 'penyempurna';
        return true;
      });

      hppBody.innerHTML = filtered.map(p => {
        const margin = p.price - p.cogs;
        const marginPct = Math.round((margin / p.price) * 100);
        let tag = '<span class="badge-sky" style="background:#DCFCE7;color:#166534;font-size:9.5px;padding:2px 6px;">Kopi Luhur</span>';
        if (p.cat === 'bukan_kopi') tag = '<span class="badge-sky" style="background:#E0F2FE;color:#0284C7;font-size:9.5px;padding:2px 6px;">Bukan Kopi</span>';
        if (p.cat === 'penyempurna') tag = '<span class="badge-sky" style="background:#FEF3C7;color:#B45309;font-size:9.5px;padding:2px 6px;">Penyempurna</span>';

        return `
          <tr>
            <td>
              <div style="font-weight:700;">${p.name}</div>
              <div style="font-size:10.5px;color:var(--ink-muted);">${p.desc}</div>
            </td>
            <td>${tag}</td>
            <td style="font-weight:700;">${rp(p.price)}</td>
            <td style="color:#B91C1C;font-weight:700;">${rp(p.cogs)}</td>
            <td style="color:#15803D;font-weight:700;">${rp(margin)}</td>
            <td>
              <span style="background:${marginPct >= 65 ? '#DCFCE7' : '#FEF3C7'};color:${marginPct >= 65 ? '#166534' : '#B45309'};padding:2px 8px;border-radius:999px;font-weight:800;font-size:10.5px;">
                ${marginPct}%
              </span>
            </td>
          </tr>
        `;
      }).join('');
    }

    '''
    html = html[:old_hpp_func_start] + new_hpp_funcs + html[old_hpp_func_end:]

    # 8. Update demo orders to only use official drink menu items
    old_orders_start = html.find('let orders = [')
    old_orders_end = html.find('];\n\n    let dailyExpenses = [', old_orders_start) + 2
    assert old_orders_start != -1 and old_orders_end != -1, "orders array not found"

    new_orders = '''let orders = [
      {
        id: 'ord-demo-1',
        number: '001',
        type: 'DINE_IN',
        table: 'Meja 03',
        customer: 'Budi Santoso',
        items: [
          { id: 'wkl-rm-02', name: 'Kopi Susu Luhur', cat: 'racikan_master', type: 'drink', station: 'BARISTA', unitPrice: 18000, qty: 2, cogs: 6800, mods: { temp: 'ICE', sweet: '100%', shot: 'SINGLE', milk: 'FRESH' }, kdsStatus: 'COOKING' },
          { id: 'wkl-rm-03', name: 'Butterscotch Coffee', cat: 'racikan_master', type: 'drink', station: 'BARISTA', unitPrice: 23000, qty: 1, cogs: 7900, mods: { temp: 'ICE', sweet: '50%' }, kdsStatus: 'QUEUED' }
        ],
        total: 59000,
        cogs: 21500,
        revMinuman: 59000,
        revMakanan: 0,
        cogsMinuman: 21500,
        cogsMakanan: 0,
        discount: 0,
        method: 'CASH',
        shift: 'PAGI',
        createdAt: new Date(Date.now() - 4 * 60000).toISOString()
      },
      {
        id: 'ord-demo-2',
        number: '002',
        type: 'DINE_IN',
        table: 'Meja 05',
        customer: 'Siti Rahma',
        items: [
          { id: 'wkl-kk-06', name: 'Spanish Latte', cat: 'klasik_kopi', type: 'drink', station: 'BARISTA', unitPrice: 20000, qty: 1, cogs: 6800, mods: { temp: 'HOT', sweet: 'Normal' }, kdsStatus: 'COOKING' },
          { id: 'wkl-bk-03', name: 'Lychee Tea Mutiara', cat: 'bukan_kopi', type: 'drink', station: 'BARISTA', unitPrice: 15000, qty: 2, cogs: 4800, mods: { temp: 'ICE' }, kdsStatus: 'QUEUED' }
        ],
        total: 50000,
        cogs: 16400,
        revMinuman: 50000,
        revMakanan: 0,
        cogsMinuman: 16400,
        cogsMakanan: 0,
        discount: 0,
        method: 'QRIS',
        shift: 'PAGI',
        createdAt: new Date(Date.now() - 2 * 60000).toISOString()
      },
      {
        id: 'ord-demo-3',
        number: '003',
        type: 'TAKEAWAY',
        table: '',
        customer: 'Ahmad Fauzi',
        items: [
          { id: 'wkl-rm-04', name: 'Dirty Latte', cat: 'racikan_master', type: 'drink', station: 'BARISTA', unitPrice: 25000, qty: 1, cogs: 8500, mods: { temp: 'ICE', shot: 'DOUBLE' }, kdsStatus: 'QUEUED' },
          { id: 'wkl-rmn-01', name: 'Tetes Luhur (V60)', cat: 'racikan_manual', type: 'drink', station: 'BARISTA', unitPrice: 24000, qty: 1, cogs: 7500, mods: { beans: 'Gayo Wine' }, kdsStatus: 'QUEUED' }
        ],
        total: 49000,
        cogs: 16000,
        revMinuman: 49000,
        revMakanan: 0,
        cogsMinuman: 16000,
        cogsMakanan: 0,
        discount: 0,
        method: 'EDC',
        shift: 'PAGI',
        createdAt: new Date(Date.now() - 1 * 60000).toISOString()
      }
    ];'''
    html = html[:old_orders_start] + new_orders + html[old_orders_end:]

    # 9. Update view-kds-kitchen view content
    old_kds_kitchen_start = html.find('<section class="view-panel" id="view-kds-kitchen">')
    old_kds_kitchen_end = html.find('<!-- 4. CUSTOMER DISPLAY (QRIS & LOYALTY CARD) -->')
    assert old_kds_kitchen_start != -1 and old_kds_kitchen_end != -1, "view-kds-kitchen not found"

    new_kds_kitchen_section = '''<section class="view-panel" id="view-kds-kitchen">
        <div class="page-container">
          <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <h2 class="serif" style="font-size:20px;color:var(--ink-espresso);">🍳 Stasiun Dapur &amp; Kitchen</h2>
                <span class="badge" style="background:#E0F2FE;color:#0284C7;font-size:10px;padding:3px 8px;border-radius:999px;">● Papan Menu Resmi Aktif</span>
              </div>
              <p style="font-size:11.5px;color:var(--ink-muted);margin-top:2px;">Buku menu resmi Warung Kopi Luhur berfokus penuh pada 27 varian racikan minuman &amp; kopi spesial.</p>
            </div>
            <button class="btn-dark" style="padding:7px 16px;font-size:11.5px;background:var(--accent-sky);color:var(--ink-espresso);border:none;border-radius:999px;cursor:pointer;font-weight:700;" onclick="switchView('kds-barista')">
              👉 Buka Layar Barista KDS (Bar Seduh)
            </button>
          </div>
          <div style="background:var(--surface-card);border:1px dashed var(--border-hairline);border-radius:20px;padding:48px 32px;text-align:center;max-width:540px;margin:40px auto;box-shadow:0 4px 14px rgba(36,28,22,0.04);">
            <div style="font-size:48px;margin-bottom:12px;">☕</div>
            <h3 class="serif" style="font-size:18px;color:var(--ink-espresso);margin-bottom:6px;">Seluruh Pesanan Diteruskan ke Barista KDS</h3>
            <p style="font-size:12.5px;color:var(--ink-muted);line-height:1.5;">Seluruh 27 varian menu (Racikan Master, Klasik Kopi, Kopi Buah, Racikan Manual, Bukan Kopi) diseduh dan disajikan langsung di stasiun bar barista.</p>
            <button class="btn-pay" style="margin-top:16px;padding:10px 24px;border-radius:999px;font-size:12px;" onclick="switchView('kds-barista')">
              ☕ Tampilkan Antrean Barista KDS
            </button>
          </div>
        </div>
      </section>

      '''
    html = html[:old_kds_kitchen_start] + new_kds_kitchen_section + html[old_kds_kitchen_end:]

    # 10. Update simulateKitchenOrder to simulate a coffee order to Barista KDS
    old_sim = '''    function simulateKitchenOrder() {
      const num = String(orderSeq++).padStart(3, '0');
      const table = 'Meja 0' + (Math.floor(Math.random() * 8) + 1);
      const simulatedOrder = {
        id: 'ord-' + Date.now(),
        number: num,
        type: 'DINE_IN',
        table: table,
        customer: 'Pelanggan ' + table,
        items: [
          { id: 'wkl-fd-05', name: 'Nasi Goreng Kampung Luhur', cat: 'makanan_utama', type: 'food', station: 'KITCHEN', unitPrice: 28000, qty: 1, cogs: 10500, mods: { pedas: 'Pedas', telur: 'Ceplok' }, kdsStatus: 'QUEUED' },
          { id: 'wkl-fd-09', name: 'Toast Telur Keju Melt', cat: 'snack', type: 'food', station: 'KITCHEN', unitPrice: 22000, qty: 1, cogs: 7800, mods: { keju: 'Ekstra Melt' }, kdsStatus: 'QUEUED' },
          { id: 'wkl-rm-02', name: 'Kopi Susu Luhur', cat: 'racikan_master', type: 'drink', station: 'BARISTA', unitPrice: 18000, qty: 1, cogs: 6800, mods: { temp: 'ICE', sweet: '100%' }, kdsStatus: 'QUEUED' }
        ],
        total: 68000,
        cogs: 25100,
        revMinuman: 18000,
        revMakanan: 50000,
        cogsMinuman: 6800,
        cogsMakanan: 18300,
        discount: 0,
        method: 'CASH',
        shift: currentShift,
        createdAt: new Date().toISOString()
      };

      orders.push(simulatedOrder);
      renderKds('KITCHEN');
      renderKds('BARISTA');
      renderOwnerHub();
      showToast(`🚀 Simulasi Sukses: Order #${num} (${table}) otomatis diteruskan ke Kitchen KDS!`);
    }'''

    new_sim = '''    function simulateKitchenOrder() {
      const num = String(orderSeq++).padStart(3, '0');
      const table = 'Meja 0' + (Math.floor(Math.random() * 8) + 1);
      const simulatedOrder = {
        id: 'ord-' + Date.now(),
        number: num,
        type: 'DINE_IN',
        table: table,
        customer: 'Pelanggan ' + table,
        items: [
          { id: 'wkl-rm-02', name: 'Kopi Susu Luhur', cat: 'racikan_master', type: 'drink', station: 'BARISTA', unitPrice: 18000, qty: 2, cogs: 6800, mods: { temp: 'ICE', sweet: '100%', shot: 'SINGLE' }, kdsStatus: 'QUEUED' },
          { id: 'wkl-rm-06', name: 'Hitam Aren Luhur', cat: 'racikan_master', type: 'drink', station: 'BARISTA', unitPrice: 25000, qty: 1, cogs: 7500, mods: { temp: 'ICE', aren: 'Manis' }, kdsStatus: 'QUEUED' }
        ],
        total: 61000,
        cogs: 21100,
        revMinuman: 61000,
        revMakanan: 0,
        cogsMinuman: 21100,
        cogsMakanan: 0,
        discount: 0,
        method: 'CASH',
        shift: currentShift,
        createdAt: new Date().toISOString()
      };

      orders.push(simulatedOrder);
      renderKds('BARISTA');
      renderOwnerHub();
      showToast(`🚀 Pesanan #${num} (${table}) terkirim langsung ke Barista KDS!`);
    }'''
    if old_sim in html:
        html = html.replace(old_sim, new_sim, 1)

    with open('warung-kopi-luhur-pos.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("warung-kopi-luhur-pos.html synced with official menu image!")

if __name__ == '__main__':
    main()
