import re

print("Drafting app.js enhancement script...")

with open('app.js', 'r', encoding='utf-8') as f:
    app_code = f.read()

# 1. Extend state
old_state_marker = "searchCatalogQuery: '',\n    charts: {}"
new_state = """searchCatalogQuery: '',
    ksdPeriod: '2026-08',
    ksdScope: 'all',          // 'all' | 'strat'
    auditMetric: 'qty',       // 'qty' | 'lak'
    auditSearchQuery: '',
    charts: {}"""

if 'ksdPeriod:' not in app_code:
    app_code = app_code.replace(old_state_marker, new_state)
    print("Added ksdPeriod and audit state!")

# 2. Add White-Space Matrix Implementation & Helpers
ws_render_code = '''
  // ==============================================================================
  // 5. TAB 2: STRATEGIC WHITE-SPACE MATRIX
  // ==============================================================================
  const renderWhiteSpaceTab = () => {
    const tbody = document.getElementById('tbody_whitespace_matrix');
    if (!tbody) return;

    tbody.innerHTML = '';
    const query = (state.searchCatalogQuery || '').toLowerCase().trim();

    const matrix = PAC_DATA.white_space_matrix || [];
    
    // Calculate White-Space KPIs
    let fullCount = 0;
    let gapCount = 0;
    let totalQty = 0;

    matrix.forEach(item => {
      totalQty += (item.total_qty || 0);
      let missingInBranch = false;
      PAC_DATA.branches.forEach(b => {
        if (!item.branches[b] || item.branches[b] <= 0) {
          missingInBranch = true;
        }
      });
      if (missingInBranch) gapCount++;
      else fullCount++;
    });

    const kpiFullEl = document.getElementById('kpi_ws_full_coverage');
    if (kpiFullEl) kpiFullEl.textContent = `${fullCount} รายการ`;

    const kpiGapsEl = document.getElementById('kpi_ws_gaps');
    if (kpiGapsEl) kpiGapsEl.textContent = `${gapCount} รายการ`;

    const kpiQtyEl = document.getElementById('kpi_ws_total_qty');
    if (kpiQtyEl) kpiQtyEl.textContent = `${formatNum(totalQty)} ชิ้น`;

    const filtered = matrix.filter(item => {
      if (!query) return true;
      return (
        item.sku.toLowerCase().includes(query) ||
        (item.thai_name && item.thai_name.toLowerCase().includes(query)) ||
        (item.ksd_name && item.ksd_name.toLowerCase().includes(query))
      );
    });

    filtered.forEach((item, idx) => {
      const tr = document.createElement('tr');
      let branchCells = '';

      PAC_DATA.branches.forEach(b => {
        const q = item.branches[b] || 0;
        if (q > 0) {
          branchCells += `<td class="matrix-cell matrix-active" style="text-align: center; color: var(--accent-emerald); font-weight: 600;"><i class="fa-solid fa-check"></i> ${formatNum(q)}</td>`;
        } else {
          branchCells += `<td class="matrix-cell matrix-empty" style="text-align: center; color: var(--accent-rose); opacity: 0.7;"><i class="fa-solid fa-xmark"></i> ขาด</td>`;
        }
      });

      const pName = getProductName(item.thai_name || item.ksd_name);
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>${item.sku}</code></td>
        <td>
          <div style="font-weight: 600; font-size: 13px;">${pName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${item.ksd_name || ''}</div>
        </td>
        <td><span class="badge badge-primary">${item.classification || 'Strategic'}</span></td>
        <td style="text-align: right; font-weight: 700;">${formatNum(item.total_qty)}</td>
        ${branchCells}
      `;
      tbody.appendChild(tr);
    });
  };

  const wsSearchInput = document.getElementById('wsSearchInput');
  if (wsSearchInput) {
    wsSearchInput.addEventListener('input', (e) => {
      state.searchCatalogQuery = e.target.value;
      renderWhiteSpaceTab();
    });
  }
'''

# Replace the existing renderWhiteSpaceTab block with the enhanced one
old_ws_pattern = r'// ==============================================================================\s*// 5\. TAB 3: STRATEGIC WHITE-SPACE MATRIX[\s\S]*?renderWhiteSpaceTab\(\);\s*\}\s*\}'
app_code = re.sub(old_ws_pattern, ws_render_code.strip(), app_code)
print("Updated renderWhiteSpaceTab!")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_code)

print("Step 1 of app.js patch complete.")
