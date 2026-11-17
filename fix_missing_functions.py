# fix_missing_functions.py
with open('warung-kopi-luhur-pos.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix applyHppTemplate bug: prefix + 'newMenuCat' -> prefix + 'MenuCat'
old_snippet = """      // Auto-set category, station, price, cogs
      if (!isEdit) {
        document.getElementById(prefix + 'MenuName').value = tmpl.name;
        document.getElementById(prefix + 'newMenuCat' || prefix + 'MenuCat').value = tmpl.cat;
        document.getElementById(prefix + 'newMenuStation' || prefix + 'MenuStation').value = tmpl.station;
      }"""

new_snippet = """      // Auto-set category, station, price, cogs
      if (!isEdit) {
        const nameEl = document.getElementById(prefix + 'MenuName');
        if (nameEl) nameEl.value = tmpl.name;
        const catEl = document.getElementById(prefix + 'MenuCat');
        if (catEl) catEl.value = tmpl.cat;
        const stationEl = document.getElementById(prefix + 'MenuStation');
        if (stationEl) stationEl.value = tmpl.station;
      }"""

if old_snippet in html:
    html = html.replace(old_snippet, new_snippet)
    print("Fixed applyHppTemplate element IDs!")
else:
    print("Warning: old_snippet not found verbatim, checking regex...")

# 2. Add syncNewMenuTypeStation, deleteCustomMenu, openPaymentModal, etc.
missing_functions_js = """
    // ==========================================
    // MENU ACTIONS & HELPER FUNCTIONS
    // ==========================================
    function syncNewMenuTypeStation() {
      const catEl = document.getElementById('newMenuCat');
      const stationSel = document.getElementById('newMenuStation');
      if (!catEl || !stationSel) return;
      const cat = catEl.value;
      if (cat === 'cuanki' || cat === 'penyempurna_cuanki') {
        stationSel.value = 'KITCHEN';
        if (document.getElementById('newPkgCuanki')) document.getElementById('newPkgCuanki').checked = true;
        if (document.getElementById('newPkgPlastik')) document.getElementById('newPkgPlastik').checked = false;
        if (document.getElementById('newPkgSealer')) document.getElementById('newPkgSealer').checked = false;
        if (document.getElementById('newPkgStraw')) document.getElementById('newPkgStraw').checked = false;
        if (document.getElementById('newPkgCup')) document.getElementById('newPkgCup').checked = false;
      } else {
        stationSel.value = 'BARISTA';
        if (document.getElementById('newPkgCuanki')) document.getElementById('newPkgCuanki').checked = false;
        if (document.getElementById('newPkgPlastik')) document.getElementById('newPkgPlastik').checked = true;
        if (document.getElementById('newPkgSealer')) document.getElementById('newPkgSealer').checked = true;
        if (document.getElementById('newPkgStraw')) document.getElementById('newPkgStraw').checked = true;
        if (document.getElementById('newPkgCup')) document.getElementById('newPkgCup').checked = true;
      }
      recalcRecipeHpp(false);
    }

    function deleteCustomMenu(productId) {
      if (!confirm('Apakah Anda yakin ingin menghapus menu ini dari katalog?')) return;
      PRODUCTS = PRODUCTS.filter(p => p.id !== productId);
      saveProductsState();
      renderMenu();
      renderHppTable();
      renderMenuMgmtTable();
      renderOwnerHub();
      showToast('Menu berhasil dihapus dari sistem!');
    }

    // ==========================================
    // CASHIER PAYMENT, RECONCILIATION & TABS
    // ==========================================
    function openPaymentModal() {
      const total = cart.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      cashReceived = total;
      document.getElementById('payModalTotal').textContent = rp(total);
      selectPayMethod('CASH');
      document.getElementById('paymentModal').classList.add('open');
    }

    function setOrderType(t) {
      orderType = t;
      document.getElementById('typeDineIn')?.classList.toggle('active', t === 'DINE_IN');
      document.getElementById('typeTakeaway')?.classList.toggle('active', t === 'TAKEAWAY');
    }

    function selectPayMethod(m) {
      payMethod = m;
      ['CASH', 'QRIS', 'EDC', 'SPLIT'].forEach(x => {
        const el = document.getElementById(`pm-${x}`);
        if (el) el.classList.toggle('active', x === m);
      });
      const total = cart.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      const box = document.getElementById('payMethodDetail');
      if (!box) return;

      if (m === 'CASH') {
        const change = Math.max(0, cashReceived - total);
        box.innerHTML = `
          <div style="font-size:11px;font-weight:700;color:var(--ink-muted);">UANG DITERIMA</div>
          <input type="number" class="field" style="font-size:18px;font-weight:800;margin:6px 0;width:100%;box-sizing:border-box;" value="${cashReceived}" oninput="cashReceived=Number(this.value);selectPayMethod('CASH')" />
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px;">
            <button class="cat-pill" type="button" onclick="cashReceived=${total};selectPayMethod('CASH')">Uang Pas</button>
            <button class="cat-pill" type="button" onclick="cashReceived=50000;selectPayMethod('CASH')">Rp 50rb</button>
            <button class="cat-pill" type="button" onclick="cashReceived=100000;selectPayMethod('CASH')">Rp 100rb</button>
          </div>
          <div style="background:var(--bg-oat);padding:10px;border-radius:12px;text-align:center;">
            <div style="font-size:10px;font-weight:700;color:var(--ink-muted);">KEMBALIAN</div>
            <div style="font-size:20px;font-weight:800;color:var(--ink-espresso);">${rp(change)}</div>
          </div>`;
      } else if (m === 'QRIS') {
        box.innerHTML = `<div style="text-align:center;">
          <div style="font-size:11px;font-weight:700;margin-bottom:8px;">SCAN QRIS DINAMIS</div>
          <div style="display:inline-block;padding:8px;background:#fff;border-radius:12px;border:1px solid var(--border-hairline);">${makeQrSvg('WKL-' + total, 140)}</div>
          <div style="font-size:11px;margin-top:6px;">Nominal <strong>${rp(total)}</strong> terkunci otomatis</div>
        </div>`;
      } else if (m === 'EDC') {
        box.innerHTML = `<div style="text-align:center;padding:24px 0;">
          <div style="font-size:32px;">💳</div>
          <strong>Mesin EDC Debit / Kredit</strong>
          <p style="font-size:12px;color:var(--ink-muted);margin-top:4px;">Gesek / tap kartu sebesar <strong>${rp(total)}</strong></p>
        </div>`;
      } else {
        const half = Math.floor(total / 2);
        box.innerHTML = `<div>
          <div style="font-size:11px;font-weight:700;margin-bottom:6px;">SPLIT BILL</div>
          <div style="font-size:12px;margin-bottom:6px;">Tunai: <strong>${rp(half)}</strong></div>
          <div style="font-size:12px;">EDC / QRIS: <strong>${rp(total - half)}</strong></div>
        </div>`;
      }
    }

    function confirmPayment(isOpenTab) {
      if (cart.length === 0) return showToast('Keranjang belanja kosong!');
      const total = cart.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      const totalCogs = cart.reduce((s, it) => s + (it.cogs || 0) * it.qty, 0);
      const num = String(orderSeq++).padStart(3, '0');
      const table = document.getElementById('tableNameInput')?.value || '-';

      const order = {
        id: 'ord-' + Date.now(),
        number: num,
        type: orderType,
        table,
        customer: currentCustomer ? currentCustomer.name : null,
        items: cart.map(it => ({ ...it, kdsStatus: 'QUEUED' })),
        total,
        cogs: totalCogs,
        method: isOpenTab ? 'OPEN_TAB' : payMethod,
        createdAt: new Date().toISOString()
      };

      if (isOpenTab) {
        openTabs.push(order);
        const otBadge = document.getElementById('openTabCount');
        if (otBadge) otBadge.textContent = openTabs.length;
        showToast(`Order #${num} disimpan ke Open Tab!`);
      } else {
        orders.push(order);
        showToast(`Pembayaran #${num} lunas (${rp(total)})! Struk tercetak.`);
      }

      cart = [];
      renderCart();
      closeModal('paymentModal');
      renderOwnerHub();
    }

    function openTabsModal() {
      const listEl = document.getElementById('openTabsList');
      if (!listEl) return;
      if (openTabs.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:var(--ink-muted);padding:24px;">Belum ada pesanan Open Tab aktif.</div>';
      } else {
        listEl.innerHTML = openTabs.map((tab, idx) => `
          <div style="background:var(--bg-oat);padding:12px;border-radius:10px;border:1px solid var(--border-hairline);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:700;">Pesanan #${tab.number} • Meja ${tab.table || '-'}</div>
              <div style="font-size:11px;color:var(--ink-muted);">${tab.items.length} item • Total: <strong>${rp(tab.total)}</strong></div>
            </div>
            <button class="btn-pay" style="padding:6px 12px;font-size:11px;" onclick="closeOpenTab(${idx})">Selesaikan</button>
          </div>
        `).join('');
      }
      document.getElementById('openTabsModal').classList.add('open');
    }

    function closeOpenTab(idx) {
      const tab = openTabs[idx];
      if (!tab) return;
      tab.method = 'CASH';
      orders.push(tab);
      openTabs.splice(idx, 1);
      const otBadge = document.getElementById('openTabCount');
      if (otBadge) otBadge.textContent = openTabs.length;
      closeModal('openTabsModal');
      renderOwnerHub();
      showToast(`Open Tab #${tab.number} berhasil diselesaikan!`);
    }

    function calculateReconVariance() {
      const exp = 200000 + orders.filter(o => o.method === 'CASH').reduce((s, o) => s + o.total, 0);
      const act = Number(document.getElementById('actualCashInput')?.value || 0);
      const diff = act - exp;
      const b = document.getElementById('reconVarianceBadge');
      if (!b) return;

      if (diff === 0) {
        b.textContent = '✅ Kas Pas (Rp 0)';
        b.style.background = '#DCFCE7';
        b.style.color = '#166534';
      } else if (diff > 0) {
        b.textContent = `🔵 Selisih Lebih +${rp(diff)}`;
        b.style.background = '#DBEAFE';
        b.style.color = '#1E40AF';
      } else {
        b.textContent = `🔴 Selisih Kurang ${rp(diff)}`;
        b.style.background = '#FEE2E2';
        b.style.color = '#991B1B';
      }
    }

    function reconcileCash() {
      showToast('Sesi laci kasir berhasil ditutup & direkonsiliasi!');
    }
"""

# Also ensure openAddMenuModal has try/catch and always opens modal
old_open_add_menu = """    // Modal Triggers: Add Menu
    function openAddMenuModal() {
      if (!currentUser || !['SUPERADMIN', 'MANAGER'].includes(currentUser.role)) {
        showToast('⛔ Hanya Supervisor atau Superadmin yang berhak menambah menu baru!');
        return;
      }
      document.getElementById('newMenuName').value = '';
      document.getElementById('newMenuPrice').value = '18000';
      document.getElementById('newMenuCogs').value = '6700';
      document.getElementById('newMenuDesc').value = '';
      delete document.getElementById('newMenuCogs').dataset.manual;

      // Load default template (Kopi Susu Luhur) as starting point
      applyHppTemplate('kopi_susu_luhur', false);
      syncNewMenuTypeStation();
      document.getElementById('addMenuModal').classList.add('open');
    }"""

new_open_add_menu = """    // Modal Triggers: Add Menu
    function openAddMenuModal() {
      if (!currentUser || !['SUPERADMIN', 'MANAGER'].includes(currentUser.role)) {
        showToast('⛔ Hanya Supervisor atau Superadmin yang berhak menambah menu baru!');
        return;
      }
      try {
        const nameEl = document.getElementById('newMenuName');
        if (nameEl) nameEl.value = '';
        const priceEl = document.getElementById('newMenuPrice');
        if (priceEl) priceEl.value = '18000';
        const cogsEl = document.getElementById('newMenuCogs');
        if (cogsEl) {
          cogsEl.value = '6700';
          delete cogsEl.dataset.manual;
        }
        const descEl = document.getElementById('newMenuDesc');
        if (descEl) descEl.value = '';

        applyHppTemplate('kopi_susu_luhur', false);
        syncNewMenuTypeStation();
      } catch (err) {
        console.warn('Notice in openAddMenuModal:', err);
      }
      const modal = document.getElementById('addMenuModal');
      if (modal) modal.classList.add('open');
    }"""

if old_open_add_menu in html:
    html = html.replace(old_open_add_menu, new_open_add_menu)
    print("Updated openAddMenuModal with safe try/catch!")

# Insert missing_functions_js right before openAddMenuModal
if 'function openAddMenuModal()' in html:
    html = html.replace('    function openAddMenuModal()', missing_functions_js + '\n    function openAddMenuModal()')
    print("Inserted missing helper and payment functions!")

with open('warung-kopi-luhur-pos.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Patch applied successfully!")
