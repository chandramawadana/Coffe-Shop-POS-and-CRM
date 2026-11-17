import re

with open('warung-kopi-luhur-pos.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update recalcRecipeHpp
old_recalc_pkg = """      // Calculate Packaging
      let pkgCost = 0;
      if (document.getElementById(prefix + 'PkgPlastik')?.checked) pkgCost += 100;
      if (document.getElementById(prefix + 'PkgSealer')?.checked) pkgCost += 50;
      if (document.getElementById(prefix + 'PkgStraw')?.checked) pkgCost += 100;
      if (document.getElementById(prefix + 'PkgCup')?.checked) pkgCost += 740;
      if (document.getElementById(prefix + 'PkgCuanki')?.checked) pkgCost += 2300;"""

new_recalc_pkg = """      // Calculate Packaging
      let pkgCost = 0;
      if (document.getElementById(prefix + 'PkgPlastik')?.checked) pkgCost += 100;
      if (document.getElementById(prefix + 'PkgSealer')?.checked) pkgCost += 50;
      if (document.getElementById(prefix + 'PkgStraw')?.checked) pkgCost += 100;
      if (document.getElementById(prefix + 'PkgCup')?.checked) pkgCost += 740;
      if (document.getElementById(prefix + 'PkgCuankiCup')?.checked) pkgCost += 1600;
      if (document.getElementById(prefix + 'PkgCuankiPlastik')?.checked) pkgCost += 700;"""

assert old_recalc_pkg in content, "old_recalc_pkg not found"
content = content.replace(old_recalc_pkg, new_recalc_pkg)

# 2. Update applyHppTemplate
old_apply_pkg = """      // Packaging checkboxes
      if (tmpl.pkg) {
        if (document.getElementById(prefix + 'PkgPlastik')) document.getElementById(prefix + 'PkgPlastik').checked = tmpl.pkg.plastik;
        if (document.getElementById(prefix + 'PkgSealer')) document.getElementById(prefix + 'PkgSealer').checked = tmpl.pkg.sealer;
        if (document.getElementById(prefix + 'PkgStraw')) document.getElementById(prefix + 'PkgStraw').checked = tmpl.pkg.straw;
        if (document.getElementById(prefix + 'PkgCup')) document.getElementById(prefix + 'PkgCup').checked = tmpl.pkg.cup;
        if (document.getElementById(prefix + 'PkgCuanki')) document.getElementById(prefix + 'PkgCuanki').checked = tmpl.pkg.cuanki;
      }"""

new_apply_pkg = """      // Packaging checkboxes
      if (tmpl.pkg) {
        if (document.getElementById(prefix + 'PkgPlastik')) document.getElementById(prefix + 'PkgPlastik').checked = !!tmpl.pkg.plastik;
        if (document.getElementById(prefix + 'PkgSealer')) document.getElementById(prefix + 'PkgSealer').checked = !!tmpl.pkg.sealer;
        if (document.getElementById(prefix + 'PkgStraw')) document.getElementById(prefix + 'PkgStraw').checked = !!tmpl.pkg.straw;
        if (document.getElementById(prefix + 'PkgCup')) document.getElementById(prefix + 'PkgCup').checked = !!tmpl.pkg.cup;
        if (document.getElementById(prefix + 'PkgCuankiCup')) document.getElementById(prefix + 'PkgCuankiCup').checked = !!tmpl.pkg.cuankiCup;
        if (document.getElementById(prefix + 'PkgCuankiPlastik')) document.getElementById(prefix + 'PkgCuankiPlastik').checked = !!tmpl.pkg.cuankiPlastik;
      }"""

assert old_apply_pkg in content, "old_apply_pkg not found"
content = content.replace(old_apply_pkg, new_apply_pkg)

# 3. Update collectRecipeData
old_collect_pkg = """      const packaging = [];
      if (document.getElementById(prefix + 'PkgPlastik')?.checked) packaging.push({ name: 'Plastik Take away', qty: 1, unitCost: 100, cost: 100 });
      if (document.getElementById(prefix + 'PkgSealer')?.checked) packaging.push({ name: 'Sealer Cup', qty: 1, unitCost: 50, cost: 50 });
      if (document.getElementById(prefix + 'PkgStraw')?.checked) packaging.push({ name: 'Sedotan Steril', qty: 1, unitCost: 100, cost: 100 });
      if (document.getElementById(prefix + 'PkgCup')?.checked) packaging.push({ name: 'Cup Luhur', qty: 1, unitCost: 740, cost: 740 });
      if (document.getElementById(prefix + 'PkgCuanki')?.checked) packaging.push({ name: 'Cup + Sendok Cuanki', qty: 1, unitCost: 2300, cost: 2300 });"""

new_collect_pkg = """      const packaging = [];
      if (document.getElementById(prefix + 'PkgPlastik')?.checked) packaging.push({ name: 'Plastik Take away', qty: 1, unitCost: 100, cost: 100 });
      if (document.getElementById(prefix + 'PkgSealer')?.checked) packaging.push({ name: 'Sealer Cup', qty: 1, unitCost: 50, cost: 50 });
      if (document.getElementById(prefix + 'PkgStraw')?.checked) packaging.push({ name: 'Sedotan Steril', qty: 1, unitCost: 100, cost: 100 });
      if (document.getElementById(prefix + 'PkgCup')?.checked) packaging.push({ name: 'Cup Luhur', qty: 1, unitCost: 740, cost: 740 });
      if (document.getElementById(prefix + 'PkgCuankiCup')?.checked) packaging.push({ name: 'Cup + Sendok Cuanki', qty: 1, unitCost: 1600, cost: 1600 });
      if (document.getElementById(prefix + 'PkgCuankiPlastik')?.checked) packaging.push({ name: 'Plastik + Kresek Cuanki', qty: 1, unitCost: 700, cost: 700 });"""

assert old_collect_pkg in content, "old_collect_pkg not found"
content = content.replace(old_collect_pkg, new_collect_pkg)

# 4. Update syncNewMenuTypeStation
old_sync_station = """      if (cat === 'cuanki' || cat === 'penyempurna_cuanki') {
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
      }"""

new_sync_station = """      if (cat === 'cuanki' || cat === 'penyempurna_cuanki') {
        stationSel.value = 'KITCHEN';
        if (document.getElementById('newPkgCuankiCup')) document.getElementById('newPkgCuankiCup').checked = true;
        if (document.getElementById('newPkgCuankiPlastik')) document.getElementById('newPkgCuankiPlastik').checked = true;
        if (document.getElementById('newPkgPlastik')) document.getElementById('newPkgPlastik').checked = false;
        if (document.getElementById('newPkgSealer')) document.getElementById('newPkgSealer').checked = false;
        if (document.getElementById('newPkgStraw')) document.getElementById('newPkgStraw').checked = false;
        if (document.getElementById('newPkgCup')) document.getElementById('newPkgCup').checked = false;
      } else {
        stationSel.value = 'BARISTA';
        if (document.getElementById('newPkgCuankiCup')) document.getElementById('newPkgCuankiCup').checked = false;
        if (document.getElementById('newPkgCuankiPlastik')) document.getElementById('newPkgCuankiPlastik').checked = false;
        if (document.getElementById('newPkgPlastik')) document.getElementById('newPkgPlastik').checked = true;
        if (document.getElementById('newPkgSealer')) document.getElementById('newPkgSealer').checked = true;
        if (document.getElementById('newPkgStraw')) document.getElementById('newPkgStraw').checked = true;
        if (document.getElementById('newPkgCup')) document.getElementById('newPkgCup').checked = true;
      }"""

assert old_sync_station in content, "old_sync_station not found"
content = content.replace(old_sync_station, new_sync_station)

# 5. Update openEditMenuModal
old_edit_modal = """      // Packaging checkboxes
      const isCuanki = p.cat === 'cuanki' || p.type === 'food';
      document.getElementById('editPkgPlastik').checked = !isCuanki;
      document.getElementById('editPkgSealer').checked = !isCuanki;
      document.getElementById('editPkgStraw').checked = !isCuanki;
      document.getElementById('editPkgCup').checked = !isCuanki;
      document.getElementById('editPkgCuanki').checked = isCuanki;"""

new_edit_modal = """      // Packaging checkboxes
      const isCuanki = p.cat === 'cuanki' || p.type === 'food';
      document.getElementById('editPkgPlastik').checked = !isCuanki;
      document.getElementById('editPkgSealer').checked = !isCuanki;
      document.getElementById('editPkgStraw').checked = !isCuanki;
      document.getElementById('editPkgCup').checked = !isCuanki;
      document.getElementById('editPkgCuankiCup').checked = isCuanki;
      document.getElementById('editPkgCuankiPlastik').checked = isCuanki;"""

assert old_edit_modal in content, "old_edit_modal not found"
content = content.replace(old_edit_modal, new_edit_modal)

# 6. Update openRecipeDetailModal matching & packaging
old_detail_body = """      // Resolve ingredients
      let ingList = p.recipe && p.recipe.length > 0 ? p.recipe : null;
      if (!ingList) {
        let matchedKey = null;
        if (p.name.includes('Luhur') && p.cat === 'racikan_master') matchedKey = 'kopi_susu_luhur';
        else if (p.name.includes('Mula')) matchedKey = 'kopi_susu_mula';
        else if (p.name.includes('Butterscotch')) matchedKey = 'butterscotch';
        else if (p.name.includes('Latte')) matchedKey = 'latte';
        else if (p.name.includes('Americano')) matchedKey = 'americano';
        else if (p.name.includes('Cuanki')) matchedKey = 'cuanki_luhur';
        else if (p.name.includes('Apel')) matchedKey = 'kopi_apel';
        else if (p.name.includes('Hijau') || p.name.includes('Matcha')) matchedKey = 'matcha';

        if (matchedKey && HPP_RECIPE_TEMPLATES[matchedKey]) {
          ingList = HPP_RECIPE_TEMPLATES[matchedKey].ingredients;
        } else {
          ingList = [
            { name: 'Bahan Baku Resep Utama', qty: 1, unit: 'porsi', unitCost: p.cogs - 990, cost: p.cogs - 990 }
          ];
        }
      }

      let subtotalIng = ingList.reduce((acc, x) => acc + (x.cost || (x.qty * x.unitCost)), 0);
      let isCuanki = p.cat === 'cuanki' || p.type === 'food';
      let pkgList = p.packaging && p.packaging.length > 0 ? p.packaging : (
        isCuanki ? [{ name: 'Cup + Sendok Cuanki', qty: 1, unitCost: 2300, cost: 2300 }] : [
          { name: 'Plastik Take away', qty: 1, unitCost: 100, cost: 100 },
          { name: 'Sealer Cup', qty: 1, unitCost: 50, cost: 50 },
          { name: 'Sedotan Steril', qty: 1, unitCost: 100, cost: 100 },
          { name: 'Cup Luhur', qty: 1, unitCost: 740, cost: 740 }
        ]
      );"""

new_detail_body = """      // Resolve ingredients
      let ingList = p.recipe && p.recipe.length > 0 ? p.recipe : null;
      if (!ingList) {
        let matchedKey = null;
        if (p.name.includes('Tanggal Tua')) matchedKey = 'cuanki_tanggal_tua';
        else if (p.name.includes('Icip2')) matchedKey = 'cuanki_icip2';
        else if (p.name.includes('Duo')) matchedKey = 'cuanki_duo';
        else if (p.cat === 'cuanki' || (p.name.includes('Cuanki') && p.station === 'KITCHEN')) matchedKey = 'cuanki_luhur';
        else if (p.name.includes('Luhur') && p.cat === 'racikan_master') matchedKey = 'kopi_susu_luhur';
        else if (p.name.includes('Mula')) matchedKey = 'kopi_susu_mula';
        else if (p.name.includes('Butterscotch')) matchedKey = 'butterscotch';
        else if (p.name.includes('Latte')) matchedKey = 'latte';
        else if (p.name.includes('Americano')) matchedKey = 'americano';
        else if (p.name.includes('Apel')) matchedKey = 'kopi_apel';
        else if (p.name.includes('Hijau') || p.name.includes('Matcha')) matchedKey = 'matcha';

        if (matchedKey && HPP_RECIPE_TEMPLATES[matchedKey]) {
          ingList = HPP_RECIPE_TEMPLATES[matchedKey].ingredients;
        } else if (p.cat === 'penyempurna_cuanki' || p.cat === 'penyempurna') {
          ingList = [
            { name: p.name.replace('Topping ', '').replace('Ekstra ', ''), qty: 1, unit: 'porsi', unitCost: p.cogs, cost: p.cogs }
          ];
        } else {
          ingList = [
            { name: 'Bahan Baku Resep Utama', qty: 1, unit: 'porsi', unitCost: p.cogs - 990, cost: p.cogs - 990 }
          ];
        }
      }

      let subtotalIng = ingList.reduce((acc, x) => acc + (x.cost || (x.qty * x.unitCost)), 0);
      let isCuanki = p.cat === 'cuanki' || (p.type === 'food' && p.station === 'KITCHEN');
      let isCuankiDuo = p.id === 'wkl-ck-04' || p.name.includes('Duo');
      let isAddon = p.type === 'addon' || p.type === 'addon_food' || p.cat === 'penyempurna' || p.cat === 'penyempurna_cuanki';

      let pkgList = p.packaging && p.packaging.length > 0 ? p.packaging : (
        isAddon ? [] : (
          isCuankiDuo ? [
            { name: 'Cup + Sendok Cuanki', qty: 2, unitCost: 1600, cost: 3200 },
            { name: 'Plastik + Kresek Cuanki', qty: 2, unitCost: 700, cost: 1400 }
          ] : (
            isCuanki ? [
              { name: 'Cup + Sendok Cuanki', qty: 1, unitCost: 1600, cost: 1600 },
              { name: 'Plastik + Kresek Cuanki', qty: 1, unitCost: 700, cost: 700 }
            ] : [
              { name: 'Plastik Take away', qty: 1, unitCost: 100, cost: 100 },
              { name: 'Sealer Cup', qty: 1, unitCost: 50, cost: 50 },
              { name: 'Sedotan Steril', qty: 1, unitCost: 100, cost: 100 },
              { name: 'Cup Luhur', qty: 1, unitCost: 740, cost: 740 }
            ]
          )
        )
      );"""

assert old_detail_body in content, "old_detail_body not found"
content = content.replace(old_detail_body, new_detail_body)

with open('warung-kopi-luhur-pos.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("patch_js_cuanki.py successfully updated all JS functions!")
