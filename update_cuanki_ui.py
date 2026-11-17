import re

with open('warung-kopi-luhur-pos.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Template Buttons in addMenuModal
old_btn_add = """            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('matcha', false)">🍵 Teh Hijau (Matcha)</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('cuanki_luhur', false)">🍲 Cuanki Luhur Lengkap</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;" onclick="clearHppTable(false)">✕ Kosongkan Tabel</button>"""

new_btn_add = """            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('matcha', false)">🍵 Teh Hijau (Matcha)</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_tanggal_tua', false)">🍲 Cuanki Tanggal Tua</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_icip2', false)">🍲 Cuanki Icip2</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_luhur', false)">🍲 Cuanki Luhur Lengkap</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_duo', false)">🍲 Cuanki Duo (2 CTT)</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;" onclick="clearHppTable(false)">✕ Kosongkan Tabel</button>"""

assert old_btn_add in content, "old_btn_add not found"
content = content.replace(old_btn_add, new_btn_add)

# 2. Update Template Buttons in editMenuModal
old_btn_edit = """            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('latte', true)">☕ Latte</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('americano', true)">☕ Americano</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('cuanki_luhur', true)">🍲 Cuanki Luhur Lengkap</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;" onclick="clearHppTable(true)">✕ Kosongkan Tabel</button>"""

new_btn_edit = """            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('latte', true)">☕ Latte</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;" onclick="applyHppTemplate('americano', true)">☕ Americano</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_tanggal_tua', true)">🍲 Cuanki Tanggal Tua</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_icip2', true)">🍲 Cuanki Icip2</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_luhur', true)">🍲 Cuanki Luhur Lengkap</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEF3C7;color:#92400E;border-color:#F59E0B;" onclick="applyHppTemplate('cuanki_duo', true)">🍲 Cuanki Duo (2 CTT)</button>
            <button type="button" class="cat-pill" style="font-size:10.5px;padding:4px 10px;background:#FEE2E2;color:#991B1B;border-color:#FCA5A5;" onclick="clearHppTable(true)">✕ Kosongkan Tabel</button>"""

assert old_btn_edit in content, "old_btn_edit not found"
content = content.replace(old_btn_edit, new_btn_edit)

# 3. Update Packaging Checkboxes in addMenuModal
old_pkg_add = """            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-oat);padding:8px 12px;border-radius:8px;border:1px solid var(--border-hairline);cursor:pointer;">
              <input type="checkbox" id="newPkgCuanki" onchange="recalcRecipeHpp(false)" />
              <div style="font-size:11px;">
                <div style="font-weight:700;">Cup + Sendok Cuanki</div>
                <div style="color:var(--ink-muted);font-size:10px;">1 set @ Rp 2.300</div>
              </div>
            </label>"""

new_pkg_add = """            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-oat);padding:8px 12px;border-radius:8px;border:1px solid var(--border-hairline);cursor:pointer;">
              <input type="checkbox" id="newPkgCuankiCup" onchange="recalcRecipeHpp(false)" />
              <div style="font-size:11px;">
                <div style="font-weight:700;">Cup + Sendok Cuanki</div>
                <div style="color:var(--ink-muted);font-size:10px;">1 set @ Rp 1.600</div>
              </div>
            </label>
            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-oat);padding:8px 12px;border-radius:8px;border:1px solid var(--border-hairline);cursor:pointer;">
              <input type="checkbox" id="newPkgCuankiPlastik" onchange="recalcRecipeHpp(false)" />
              <div style="font-size:11px;">
                <div style="font-weight:700;">Plastik + Kresek Cuanki</div>
                <div style="color:var(--ink-muted);font-size:10px;">1 set @ Rp 700</div>
              </div>
            </label>"""

assert old_pkg_add in content, "old_pkg_add not found"
content = content.replace(old_pkg_add, new_pkg_add)

# 4. Update Packaging Checkboxes in editMenuModal
old_pkg_edit = """            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-oat);padding:8px 12px;border-radius:8px;border:1px solid var(--border-hairline);cursor:pointer;">
              <input type="checkbox" id="editPkgCuanki" onchange="recalcRecipeHpp(true)" />
              <div style="font-size:11px;">
                <div style="font-weight:700;">Cup + Sendok Cuanki</div>
                <div style="color:var(--ink-muted);font-size:10px;">1 set @ Rp 2.300</div>
              </div>
            </label>"""

new_pkg_edit = """            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-oat);padding:8px 12px;border-radius:8px;border:1px solid var(--border-hairline);cursor:pointer;">
              <input type="checkbox" id="editPkgCuankiCup" onchange="recalcRecipeHpp(true)" />
              <div style="font-size:11px;">
                <div style="font-weight:700;">Cup + Sendok Cuanki</div>
                <div style="color:var(--ink-muted);font-size:10px;">1 set @ Rp 1.600</div>
              </div>
            </label>
            <label style="display:flex;align-items:center;gap:8px;background:var(--bg-oat);padding:8px 12px;border-radius:8px;border:1px solid var(--border-hairline);cursor:pointer;">
              <input type="checkbox" id="editPkgCuankiPlastik" onchange="recalcRecipeHpp(true)" />
              <div style="font-size:11px;">
                <div style="font-weight:700;">Plastik + Kresek Cuanki</div>
                <div style="color:var(--ink-muted);font-size:10px;">1 set @ Rp 700</div>
              </div>
            </label>"""

assert old_pkg_edit in content, "old_pkg_edit not found"
content = content.replace(old_pkg_edit, new_pkg_edit)

with open('warung-kopi-luhur-pos.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Step 3 & 4 (HTML buttons and checkboxes) completed successfully!")
