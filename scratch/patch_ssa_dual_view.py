import re

print("Drafting SSA dual-view rendering for app.js...")

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# All PAC Report Functions
all_pac_report_code = '''
  // ==============================================================================
  // 4.1 SSA DEDICATED AUGUST 2026 RETAIL AUDIT CENSUS REPORT (ALL 181 SKUs)
  // ==============================================================================
  const renderSSAAllPacReport = () => {
    const prods = PAC_DATA.ssa_products_august || [];
    const bId = state.ssaBranch || 'ALL';

    // 1. Calculate August 2026 totals based on branch filter
    let totalUnits = 0;
    let totalLak = 0.0;

    prods.forEach(p => {
      if (bId === 'ALL') {
        totalUnits += p.total_qty;
        totalLak += p.total_price_lak;
      } else {
        totalUnits += (p.branch_qtys[bId] || 0);
        totalLak += (p.branch_prices_lak[bId] || 0.0);
      }
    });

    // Update KPI Cards
    const kpiUnits = document.getElementById('kpi_ssa_units');
    if (kpiUnits) kpiUnits.textContent = formatNum(totalUnits);

    const kpiUnitsDiff = document.getElementById('kpi_ssa_units_diff');
    if (kpiUnitsDiff) {
      kpiUnitsDiff.innerHTML = `<span class="badge badge-pac"><i class="fa-solid fa-clipboard-check"></i> สำรวจ ส.ค. 2026 (ครบ 181 SKU)</span>`;
    }

    const kpiVal = document.getElementById('kpi_ssa_val');
    if (kpiVal) kpiVal.textContent = formatLAK(totalLak);

    const kpiValDiff = document.getElementById('kpi_ssa_val_diff');
    if (kpiValDiff) {
      kpiValDiff.innerHTML = `<span class="badge badge-emerald"><i class="fa-solid fa-store"></i> ยอดขายจริงหน้าร้าน 6 สาขา</span>`;
    }

    const kpiTopBranch = document.getElementById('kpi_ssa_top_branch');
    const kpiTopBranchSub = document.getElementById('kpi_ssa_top_branch_sub');
    if (bId === 'ALL') {
      if (kpiTopBranch) kpiTopBranch.textContent = 'SSA 1 (สี่หอม)';
      if (kpiTopBranchSub) kpiTopBranchSub.textContent = 'ยอดขาย 25,247 ชิ้น (36.6% ของทั้งเครือ)';
    } else {
      const bNames = { SSA1: 'SSA 1 (สี่หอม)', SSA2: 'SSA 2 (T2)', SSA3: 'SSA 3 (สะพานทอง)', SSA5: 'SSA 5 (จอมมณี)', SSA6: 'SSA 6 (แสงสว่าง)', SSA7: 'SSA 7 (เก้ายอด)' };
      if (kpiTopBranch) kpiTopBranch.textContent = bNames[bId] || bId;
      const share = totalUnits > 0 ? ((totalUnits / 68902) * 100).toFixed(1) : '0.0';
      if (kpiTopBranchSub) kpiTopBranchSub.textContent = `คิดเป็น ${share}% ของยอดรวมทั้งเครือ`;
    }

    // Top Product for August
    let bestProd = null;
    let maxQ = -1;
    prods.forEach(p => {
      const q = bId === 'ALL' ? p.total_qty : (p.branch_qtys[bId] || 0);
      if (q > maxQ) {
        maxQ = q;
        bestProd = p;
      }
    });

    const kpiTopProduct = document.getElementById('kpi_ssa_top_product');
    if (kpiTopProduct && bestProd) {
      kpiTopProduct.textContent = getProductName(bestProd);
    }
    const kpiTopProductSub = document.getElementById('kpi_ssa_top_product_sub');
    if (kpiTopProductSub && bestProd) {
      kpiTopProductSub.textContent = `ยอดขาย ${formatNum(maxQ)} ชิ้น (${bestProd.classification || 'ทั่วไป'})`;
    }

    // 2. Render Charts & Tables
    renderSSAAllBranchCompareChart();
    renderSSAAllTopProductsChart();
    renderSSAAllBranchesTable();
    renderSSAAllAuditProductsTable();
  };

  const renderSSAAllBranchCompareChart = () => {
    try {
      const chartElem = document.getElementById('chart_ssa_all_branch_compare');
      if (!chartElem) return;

      const branchLabels = ['SSA 1 (สี่หอม)', 'SSA 2 (T2)', 'SSA 3 (สะพานทอง)', 'SSA 5 (จอมมณี)', 'SSA 6 (แสงสว่าง)', 'SSA 7 (เก้ายอด)'];
      const branchKeys = ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

      const qtyData = branchKeys.map(k => PAC_DATA.branch_totals_qty[k] || 0);
      const lakMillions = branchKeys.map(k => Math.round(((PAC_DATA.branch_totals_lak[k] || 0) / 1000000) * 10) / 10);

      const options = {
        series: [
          { name: 'จำนวนขาย (ชิ้น)', type: 'column', data: qtyData },
          { name: 'มูลค่ายอดขาย (ล้านกีบ LAK)', type: 'line', data: lakMillions }
        ],
        chart: {
          height: 330,
          type: 'line',
          toolbar: { show: false },
          foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
        },
        plotOptions: {
          bar: { columnWidth: '50%', borderRadius: 4 }
        },
        stroke: { width: [0, 3], curve: 'smooth' },
        colors: ['#009944', '#7e1957'],
        dataLabels: { enabled: false },
        xaxis: { categories: branchLabels },
        yaxis: [
          {
            title: { text: 'จำนวนชิ้น' },
            labels: { formatter: (val) => formatNum(val) }
          },
          {
            opposite: true,
            title: { text: 'ล้านกีบ (LAK)' },
            labels: { formatter: (val) => `${val}M ₭` }
          }
        ],
        tooltip: {
          shared: true,
          theme: state.theme,
          y: {
            formatter: (val, opt) => {
              if (opt.seriesIndex === 0) return `${formatNum(val)} ชิ้น`;
              return `${val} ล้านกีบ (${formatLAK(val * 1000000)})`;
            }
          }
        }
      };

      if (state.charts['chart_ssa_all_branch_compare']) {
        state.charts['chart_ssa_all_branch_compare'].destroy();
      }
      state.charts['chart_ssa_all_branch_compare'] = new ApexCharts(chartElem, options);
      state.charts['chart_ssa_all_branch_compare'].render();
    } catch (e) {
      console.error('Error in renderSSAAllBranchCompareChart:', e);
    }
  };

  const renderSSAAllTopProductsChart = () => {
    try {
      const chartElem = document.getElementById('chart_ssa_all_top_products');
      if (!chartElem) return;

      const prods = [...(PAC_DATA.ssa_products_august || [])];
      const bId = state.ssaBranch || 'ALL';

      prods.sort((a, b) => {
        const qa = bId === 'ALL' ? a.total_qty : (a.branch_qtys[bId] || 0);
        const qb = bId === 'ALL' ? b.total_qty : (b.branch_qtys[bId] || 0);
        return qb - qa;
      });

      const top10 = prods.slice(0, 10);
      const names = top10.map(p => getProductName(p));
      const values = top10.map(p => bId === 'ALL' ? p.total_qty : (p.branch_qtys[bId] || 0));

      const options = {
        series: [{ name: 'ยอดขายหน้าร้าน (ชิ้น)', data: values }],
        chart: {
          type: 'bar',
          height: 330,
          toolbar: { show: false },
          foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
        },
        plotOptions: {
          bar: { borderRadius: 4, horizontal: true, barHeight: '65%' }
        },
        colors: ['#009944'],
        dataLabels: {
          enabled: true,
          formatter: (val) => formatNum(val)
        },
        xaxis: {
          categories: names,
          labels: { formatter: (val) => formatNum(val) }
        },
        tooltip: {
          theme: state.theme,
          y: { formatter: (val) => `${formatNum(val)} ชิ้น` }
        }
      };

      if (state.charts['chart_ssa_all_top_products']) {
        state.charts['chart_ssa_all_top_products'].destroy();
      }
      state.charts['chart_ssa_all_top_products'] = new ApexCharts(chartElem, options);
      state.charts['chart_ssa_all_top_products'].render();
    } catch (e) {
      console.error('Error in renderSSAAllTopProductsChart:', e);
    }
  };

  const renderSSAAllBranchesTable = () => {
    const tbody = document.getElementById('tbody_ssa_all_branches');
    if (!tbody) return;

    tbody.innerHTML = '';
    const branchMeta = [
      { id: 'SSA1', name: 'SSA 1 (สี่หอม / สีหอม)' },
      { id: 'SSA2', name: 'SSA 2 (T2 / เต่สอง)' },
      { id: 'SSA3', name: 'SSA 3 (สะพานทอง)' },
      { id: 'SSA5', name: 'SSA 5 (จอมมณี)' },
      { id: 'SSA6', name: 'SSA 6 (แสงสว่าง)' },
      { id: 'SSA7', name: 'SSA 7 (เพียวัด / เก้ายอด)' }
    ];

    const totalNetworkUnits = 68902;
    const prods = PAC_DATA.ssa_products_august || [];

    branchMeta.forEach(b => {
      const q = PAC_DATA.branch_totals_qty[b.id] || 0;
      const lak = PAC_DATA.branch_totals_lak[b.id] || 0;
      const sharePct = ((q / totalNetworkUnits) * 100).toFixed(1);

      // Find top product for this branch
      let topP = null;
      let topQ = -1;
      prods.forEach(p => {
        const bq = p.branch_qtys[b.id] || 0;
        if (bq > topQ) {
          topQ = bq;
          topP = p;
        }
      });

      const tr = document.createElement('tr');
      const isCurrentActive = state.ssaBranch === b.id;
      if (isCurrentActive) tr.style.background = 'rgba(0, 153, 68, 0.08)';

      tr.innerHTML = `
        <td><code>${b.id}</code></td>
        <td style="font-weight: 600;">${b.name}</td>
        <td style="text-align: right; font-weight: 700;">${formatNum(q)}</td>
        <td style="text-align: right;">${formatLAK(lak)}</td>
        <td style="text-align: right;"><span class="badge badge-emerald">${sharePct}%</span></td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${topP ? getProductName(topP) : '-'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${topQ > 0 ? `${formatNum(topQ)} ชิ้น` : ''}</div>
        </td>
        <td style="text-align: center;">
          <button class="btn btn-outline" style="font-size: 11px; padding: 4px 10px;" onclick="window.inspectStoreBranch('${b.id}')">
            <i class="fa-solid fa-magnifying-glass"></i> เจาะลึก
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  };

  const renderSSAAllAuditProductsTable = () => {
    const tbody = document.getElementById('tbody_ssa_all_audit_products');
    if (!tbody) return;

    tbody.innerHTML = '';
    const query = (state.auditSearchQuery || '').toLowerCase().trim();
    const isBrandGroup = state.ssaGroup === 'brand';
    const isLak = state.auditMetric === 'lak';

    let prods = [...(PAC_DATA.ssa_products_august || [])];

    if (isBrandGroup) {
      const bMap = {};
      prods.forEach(p => {
        const bg = p.brand_group || getBrandGroup(p);
        if (!bMap[bg]) {
          bMap[bg] = {
            sku: p.sku,
            name: bg,
            english_name: bg,
            brand_group: bg,
            classification: p.classification,
            is_strategic: p.is_strategic,
            total_qty: 0,
            total_price_lak: 0,
            branch_qtys: { SSA1: 0, SSA2: 0, SSA3: 0, SSA5: 0, SSA6: 0, SSA7: 0 },
            branch_prices_lak: { SSA1: 0, SSA2: 0, SSA3: 0, SSA5: 0, SSA6: 0, SSA7: 0 }
          };
        }
        bMap[bg].total_qty += p.total_qty;
        bMap[bg].total_price_lak += p.total_price_lak;
        PAC_DATA.branches.forEach(b => {
          bMap[bg].branch_qtys[b] += (p.branch_qtys[b] || 0);
          bMap[bg].branch_prices_lak[b] += (p.branch_prices_lak[b] || 0);
        });
      });
      prods = Object.values(bMap);
    }

    // Filter by search
    if (query) {
      prods = prods.filter(p => {
        const nameStr = (p.english_name || p.name || '').toLowerCase();
        const skuStr = (p.sku || '').toLowerCase();
        const bgStr = (p.brand_group || '').toLowerCase();
        return nameStr.includes(query) || skuStr.includes(query) || bgStr.includes(query);
      });
    }

    // Sort descending by selected metric
    prods.sort((a, b) => isLak ? (b.total_price_lak - a.total_price_lak) : (b.total_qty - a.total_qty));

    prods.forEach((p, idx) => {
      const tr = document.createElement('tr');
      const stratBadge = p.is_strategic ? '<span class="badge badge-primary" style="font-size: 10px;">กลยุทธ์</span>' : '<span class="badge" style="font-size: 10px; background: var(--border-color); color: var(--text-muted);">ทั่วไป</span>';

      let branchCols = '';
      PAC_DATA.branches.forEach(b => {
        const val = isLak ? (p.branch_prices_lak[b] || 0) : (p.branch_qtys[b] || 0);
        const valStr = isLak ? (val > 0 ? `${formatNum(Math.round(val / 1000))}k` : '-') : (val > 0 ? formatNum(val) : '-');
        branchCols += `<td style="text-align: right; ${val > 0 ? 'font-weight: 600;' : 'color: var(--text-muted); opacity: 0.5;'}">${valStr}</td>`;
      });

      const totalDisplay = isLak ? formatLAK(p.total_price_lak) : formatNum(p.total_qty);

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>${p.sku || '-'}</code></td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${getProductName(p)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${p.english_name || ''}</div>
        </td>
        <td><span class="badge badge-emerald">${p.brand_group || '-'}</span></td>
        <td>${stratBadge}</td>
        <td style="text-align: right; font-weight: 700; color: var(--ssa-primary);">${totalDisplay}</td>
        ${branchCols}
      `;
      tbody.appendChild(tr);
    });
  };

  // Setup Audit Table Search and Metric Listeners
  const auditSearchInput = document.getElementById('auditTableSearch');
  if (auditSearchInput) {
    auditSearchInput.addEventListener('input', (e) => {
      state.auditSearchQuery = e.target.value;
      renderSSAAllAuditProductsTable();
    });
  }

  const auditMetricSelector = document.getElementById('auditMetricSelector');
  if (auditMetricSelector) {
    auditMetricSelector.querySelectorAll('.pill-option').forEach(btn => {
      btn.addEventListener('click', () => {
        auditMetricSelector.querySelectorAll('.pill-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.auditMetric = btn.getAttribute('data-audit-metric');
        renderSSAAllAuditProductsTable();
      });
    });
  }
'''

# Update renderSSATab
new_render_ssa_tab = '''
  const renderSSATab = () => {
    const viewInc = document.getElementById('view_ssa_incentive_report');
    const viewAll = document.getElementById('view_ssa_all_pac_report');

    if (state.ssaScope === 'all') {
      if (viewInc) viewInc.style.display = 'none';
      if (viewAll) viewAll.style.display = 'block';
      renderSSAAllPacReport();
    } else {
      if (viewInc) viewInc.style.display = 'block';
      if (viewAll) viewAll.style.display = 'none';
      renderSSAIncentiveReport();
    }
  };

  const renderSSAIncentiveReport = () => {
    const d = processSSAData();

    // 1. KPI Cards
    const kpiUnits = document.getElementById('kpi_ssa_units');
    if (kpiUnits) kpiUnits.textContent = formatNum(d.totalCurrUnits);

    const kpiUnitsDiff = document.getElementById('kpi_ssa_units_diff');
    if (kpiUnitsDiff) {
      const sign = d.diffUnits >= 0 ? '+' : '';
      const cls = d.diffUnits >= 0 ? 'trend-up' : 'trend-down';
      const icon = d.diffUnits >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
      kpiUnitsDiff.innerHTML = `<span class="${cls}"><i class="fa-solid ${icon}"></i> ${sign}${formatNum(d.diffUnits)} (${sign}${d.pctUnitsGrowth.toFixed(1)}%)</span> เทียบ ${d.prevPeriodLabel}`;
    }

    const kpiVal = document.getElementById('kpi_ssa_val');
    if (kpiVal) {
      kpiVal.textContent = d.totalCurrVal > 0 ? formatTHB(d.totalCurrVal) : '0 ฿';
    }

    const kpiValDiff = document.getElementById('kpi_ssa_val_diff');
    if (kpiValDiff) {
      const sign = d.diffVal >= 0 ? '+' : '';
      const cls = d.diffVal >= 0 ? 'trend-up' : 'trend-down';
      const icon = d.diffVal >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
      kpiValDiff.innerHTML = `<span class="${cls}"><i class="fa-solid ${icon}"></i> ${sign}${d.pctValGrowth.toFixed(1)}%</span> เทียบ ${d.prevPeriodLabel}`;
    }

    const kpiTopBranch = document.getElementById('kpi_ssa_top_branch');
    if (kpiTopBranch) kpiTopBranch.textContent = d.topBranchText;

    const kpiTopBranchSub = document.getElementById('kpi_ssa_top_branch_sub');
    if (kpiTopBranchSub) kpiTopBranchSub.textContent = d.topBranchSubText;

    const kpiTopProduct = document.getElementById('kpi_ssa_top_product');
    if (kpiTopProduct) kpiTopProduct.textContent = d.topProductText;

    const kpiTopProductSub = document.getElementById('kpi_ssa_top_product_sub');
    if (kpiTopProductSub) kpiTopProductSub.textContent = d.topProductSubText;

    // 2. 6-Branch Trend Chart (17 Months)
    renderSSABranchTrendChart(d);

    // 3. Highlight Products Trend Chart + Checklist
    renderSSAHighlightTrendChart(d);
    renderHighlightChecklist(d);

    // 4. Growth & Drop Drivers
    renderSSAGrowthDropCharts(d);

    // 5. Ranked Products Table with Rank Shifts
    renderSSARankedProductsTable(d);
  };
'''

# Replace old renderSSATab
old_ssa_tab_pattern = r'const renderSSATab = \(\) => \{[\s\S]*?renderSSARankedProductsTable\(d\);\s*\};'
code = re.sub(old_ssa_tab_pattern, new_render_ssa_tab.strip() + '\n\n' + all_pac_report_code.strip(), code)
print("Updated renderSSATab and added renderSSAAllPacReport!")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Step 2 of app.js patch complete.")
