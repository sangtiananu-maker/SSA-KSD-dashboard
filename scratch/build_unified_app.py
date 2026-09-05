# Build script for unified app.js
import os

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

m1_start = "  const renderCurrentTab = () => {\n    if (state.currentTab === 'tab-ssa')"
m1_end = "  // ==============================================================================\n  // 5. TAB 3: STRATEGIC WHITE-SPACE MATRIX"

m2_start = "  // ==============================================================================\n  // 6. TAB 4: INCENTIVE SYSTEM"
m2_end = "  // ==============================================================================\n  // 7. TAB 5: KSD DISTRIBUTOR SALES"

m3_start = "  // ==============================================================================\n  // 10. IMPORT DATA MODAL LOGIC"

p1_s = content.find(m1_start)
p1_e = content.find(m1_end)
p2_s = content.find(m2_start)
p2_e = content.find(m2_end)
p3_s = content.find(m3_start)
assert all(p != -1 for p in [p1_s, p1_e, p2_s, p2_e, p3_s]), "Markers not found!"
print("Markers found successfully:", p1_s, p1_e, p2_s, p2_e, p3_s)

new_ssa_block = """  const renderCurrentTab = () => {
    if (state.currentTab === 'tab-ssa') renderSSATab();
    else if (state.currentTab === 'tab-whitespace') renderWhiteSpaceTab();
    else if (state.currentTab === 'tab-ksd') renderKSDTab();
    else if (state.currentTab === 'tab-strat') renderStrategicTab();
    else if (state.currentTab === 'tab-dict') renderDictionaryTab();
  };

  window.inspectStoreBranch = (branchId) => {
    state.ssaBranch = branchId;
    document.querySelectorAll('#ssaBranchTabs .branch-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-branch') === branchId);
    });
    switchTab('tab-ssa');
  };

  // ==============================================================================
  // 3. UNIFIED SSA RETAIL & INCENTIVE ANALYSIS (17-MONTH CONTINUOUS ENGINE)
  // ==============================================================================
  const initSSAControls = () => {
    // 1. Product Scope Toggle (All PAC vs Incentive Only)
    const scopeButtons = document.querySelectorAll('#ssaScopeSelector .pill-option');
    scopeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        scopeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaScope = btn.getAttribute('data-scope');
        renderSSATab();
      });
    });

    // 2. Group by Brand Toggle (SKU vs Brand)
    const groupButtons = document.querySelectorAll('#ssaGroupSelector .pill-option');
    groupButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        groupButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaGroup = btn.getAttribute('data-group');
        renderSSATab();
      });
    });

    // 3. Report Mode Toggle (Monthly / YTD / Yearly / YoY)
    const reportButtons = document.querySelectorAll('#ssaReportModeSelector .pill-option');
    reportButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        reportButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaReportMode = btn.getAttribute('data-report');
        updateSSAPeriodDropdown();
        renderSSATab();
      });
    });

    // 4. Period Dropdown Change
    const periodSelect = document.getElementById('ssaPeriodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        state.ssaPeriod = e.target.value;
        renderSSATab();
      });
    }

    // 5. Metric Selector (Qty vs Val)
    const metricButtons = document.querySelectorAll('#ssaMetricSelector .pill-option');
    metricButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        metricButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaMetric = btn.getAttribute('data-metric');
        renderSSATab();
      });
    });

    // 6. Branch Tabs (ALL, SSA1, SSA2, SSA3, SSA5, SSA6, SSA7)
    const branchTabs = document.querySelectorAll('#ssaBranchTabs .branch-tab-btn');
    branchTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        branchTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaBranch = btn.getAttribute('data-branch');
        renderSSATab();
      });
    });

    // 7. Growth & Drop Limits (5 vs 10)
    const setupLimitToggle = (selectorId) => {
      const btns = document.querySelectorAll(`#${selectorId} .pill-option`);
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          state.driverLimit = parseInt(btn.getAttribute('data-limit'), 10) || 5;
          document.querySelectorAll('#growthLimitSelector .pill-option, #dropLimitSelector .pill-option').forEach(b => {
            b.classList.toggle('active', parseInt(b.getAttribute('data-limit'), 10) === state.driverLimit);
          });
          const processed = processSSAData();
          renderSSAGrowthDropCharts(processed);
        });
      });
    };
    setupLimitToggle('growthLimitSelector');
    setupLimitToggle('dropLimitSelector');

    // 8. Ranked Table Search & Sort
    const rankedSearch = document.getElementById('rankedTableSearch');
    if (rankedSearch) {
      rankedSearch.addEventListener('input', (e) => {
        state.rankedSearch = e.target.value.toLowerCase().trim();
        const processed = processSSAData();
        renderSSARankedProductsTable(processed);
      });
    }

    const rankSortQty = document.getElementById('rankSortQty');
    const rankSortVal = document.getElementById('rankSortVal');
    if (rankSortQty && rankSortVal) {
      rankSortQty.addEventListener('click', () => {
        state.rankedSort = 'qty';
        rankSortQty.classList.add('active');
        rankSortVal.classList.remove('active');
        const processed = processSSAData();
        renderSSARankedProductsTable(processed);
      });
      rankSortVal.addEventListener('click', () => {
        state.rankedSort = 'val';
        rankSortVal.classList.add('active');
        rankSortQty.classList.remove('active');
        const processed = processSSAData();
        renderSSARankedProductsTable(processed);
      });
    }

    // 9. Highlight Search & Reset Button
    const highlightSearch = document.getElementById('highlightSearchInput');
    if (highlightSearch) {
      highlightSearch.addEventListener('input', (e) => {
        state.highlightSearch = e.target.value.toLowerCase().trim();
        const processed = processSSAData();
        renderHighlightChecklist(processed);
      });
    }

    const btnResetHighlights = document.getElementById('btnResetHighlights');
    if (btnResetHighlights) {
      btnResetHighlights.addEventListener('click', () => {
        state.selectedHighlights = [];
        state.highlightSearch = '';
        if (highlightSearch) highlightSearch.value = '';
        const processed = processSSAData();
        renderSSAHighlightTrendChart(processed);
        renderHighlightChecklist(processed);
      });
    }

    updateSSAPeriodDropdown();
  };

  const updateSSAPeriodDropdown = () => {
    const select = document.getElementById('ssaPeriodSelect');
    if (!select) return;

    select.innerHTML = '';
    const rMode = state.ssaReportMode;
    const history = PAC_DATA.ssa_monthly_history || [];

    if (rMode === 'monthly') {
      const revMonths = [...history].reverse();
      revMonths.forEach((m, idx) => {
        const opt = document.createElement('option');
        opt.value = m.date_key;
        const tag = m.date_key === '2026-08' ? '(ล่าสุด ส.ค. 26)' : '(ทางการ)';
        opt.textContent = `เดือน ${m.date_key} ${tag}`;
        if (m.date_key === state.ssaPeriod || (!state.ssaPeriod.includes('-') && idx === 0)) {
          opt.selected = true;
          state.ssaPeriod = m.date_key;
        }
        select.appendChild(opt);
      });
      if (!state.ssaPeriod || !state.ssaPeriod.includes('-')) {
        state.ssaPeriod = '2026-08';
        select.value = '2026-08';
      }
    } else if (rMode === 'ytd') {
      const opt26 = document.createElement('option');
      opt26.value = '2026-YTD';
      opt26.textContent = 'ปี 2026 (สะสม ม.ค. - ส.ค. 8 เดือน)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025-YTD';
      opt25.textContent = 'ปี 2025 (สะสม เม.ย. - ธ.ค. 9 เดือน)';
      select.appendChild(opt25);

      state.ssaPeriod = '2026-YTD';
    } else if (rMode === 'yearly') {
      const opt26 = document.createElement('option');
      opt26.value = '2026';
      opt26.textContent = 'ปี 2026 (สรุปทั้งปี 8 เดือน)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025';
      opt25.textContent = 'ปี 2025 (สรุปทั้งปี 9 เดือน)';
      select.appendChild(opt25);

      state.ssaPeriod = '2026';
    } else if (rMode === 'yoy') {
      const yoyPairs = [
        { key: '08', label: 'สิงหาคม (Aug 2026 vs Aug 2025)' },
        { key: '07', label: 'กรกฎาคม (Jul 2026 vs Jul 2025)' },
        { key: '06', label: 'มิถุนายน (Jun 2026 vs Jun 2025)' },
        { key: '05', label: 'พฤษภาคม (May 2026 vs May 2025)' },
        { key: '04', label: 'เมษายน (Apr 2026 vs Apr 2025)' },
      ];
      yoyPairs.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = p.key;
        opt.textContent = p.label;
        if (idx === 0) {
          opt.selected = true;
          state.ssaPeriod = p.key;
        }
        select.appendChild(opt);
      });
      state.ssaPeriod = '08';
    }
  };

  const processSSAData = () => {
    const history = PAC_DATA.ssa_monthly_history || [];
    const isBrandGroup = state.ssaGroup === 'brand';
    const isIncScope = state.ssaScope === 'incentive';
    const targetBranch = state.ssaBranch;

    const getMonthProducts = (monthObj) => {
      if (!monthObj || !monthObj.products) return [];
      const prods = monthObj.products.filter(p => !isIncScope || p.is_incentive);

      if (isBrandGroup) {
        const bMap = {};
        prods.forEach(p => {
          const bName = p.brand_group || getBrandGroup(p);
          if (!bMap[bName]) {
            bMap[bName] = {
              name: bName,
              english_name: bName,
              brand_group: bName,
              is_incentive: !!p.is_incentive,
              branches: { SSA1: 0, SSA2: 0, SSA3: 0, SSA5: 0, SSA6: 0, SSA7: 0 },
              total_qty: 0,
              total_price_lak: 0,
              total_incentive: 0
            };
          }
          const item = bMap[bName];
          if (p.is_incentive) item.is_incentive = true;
          PAC_DATA.branches.forEach(b => {
            item.branches[b] += (p.branches && p.branches[b]) ? p.branches[b] : 0;
          });
          item.total_qty += (p.total_qty || 0);
          item.total_price_lak += (p.total_price_lak || 0);
          item.total_incentive += (p.total_incentive || 0);
        });
        return Object.values(bMap);
      } else {
        return prods.map(p => ({
          name: getProductName(p),
          english_name: p.english_name || p.ksd_name || p.product_name,
          brand_group: p.brand_group || getBrandGroup(p),
          is_incentive: !!p.is_incentive,
          branches: p.branches || {},
          total_qty: p.total_qty || 0,
          total_price_lak: p.total_price_lak || 0,
          total_incentive: p.total_incentive || 0
        }));
      }
    };

    const aggregateProductLists = (monthsList) => {
      const aggMap = {};
      monthsList.forEach(m => {
        const prods = getMonthProducts(m);
        prods.forEach(p => {
          const key = p.name;
          if (!aggMap[key]) {
            aggMap[key] = {
              name: p.name,
              english_name: p.english_name,
              brand_group: p.brand_group,
              is_incentive: p.is_incentive,
              branches: { SSA1: 0, SSA2: 0, SSA3: 0, SSA5: 0, SSA6: 0, SSA7: 0 },
              total_qty: 0,
              total_price_lak: 0,
              total_incentive: 0
            };
          }
          const entry = aggMap[key];
          PAC_DATA.branches.forEach(b => {
            entry.branches[b] += (p.branches && p.branches[b]) ? p.branches[b] : 0;
          });
          entry.total_qty += (p.total_qty || 0);
          entry.total_price_lak += (p.total_price_lak || 0);
          entry.total_incentive += (p.total_incentive || 0);
        });
      });
      return Object.values(aggMap);
    };

    let currProds = [];
    let prevProds = [];
    let currPeriodLabel = '';
    let prevPeriodLabel = '';

    const mode = state.ssaReportMode;
    if (mode === 'monthly') {
      const currMonth = history.find(m => m.date_key === state.ssaPeriod) || history[history.length - 1];
      const currIdx = history.indexOf(currMonth);
      currProds = getMonthProducts(currMonth);
      const prevMonth = currIdx > 0 ? history[currIdx - 1] : null;
      prevProds = prevMonth ? getMonthProducts(prevMonth) : [];
      currPeriodLabel = currMonth ? currMonth.date_key : 'N/A';
      prevPeriodLabel = prevMonth ? prevMonth.date_key : 'N/A';
    } else if (mode === 'ytd') {
      const is2026 = (state.ssaPeriod || '2026-YTD').startsWith('2026');
      const m2026 = history.filter(m => m.year === 2026);
      const m2025 = history.filter(m => m.year === 2025);
      currProds = is2026 ? aggregateProductLists(m2026) : aggregateProductLists(m2025);
      prevProds = is2026 ? aggregateProductLists(m2025) : aggregateProductLists(m2026);
      currPeriodLabel = is2026 ? '2026 (YTD ม.ค. - ส.ค.)' : '2025 (YTD เม.ย. - ธ.ค.)';
      prevPeriodLabel = is2026 ? '2025 (YTD)' : '2026 (YTD)';
    } else if (mode === 'yearly') {
      const is2026 = (state.ssaPeriod || '2026') === '2026';
      const m2026 = history.filter(m => m.year === 2026);
      const m2025 = history.filter(m => m.year === 2025);
      currProds = is2026 ? aggregateProductLists(m2026) : aggregateProductLists(m2025);
      prevProds = is2026 ? aggregateProductLists(m2025) : aggregateProductLists(m2026);
      currPeriodLabel = is2026 ? 'สรุปทั้งปี 2026' : 'สรุปทั้งปี 2025';
      prevPeriodLabel = is2026 ? 'ปี 2025' : 'ปี 2026';
    } else if (mode === 'yoy') {
      const mKey = state.ssaPeriod || '08';
      const mCurr = history.find(m => m.date_key === `2026-${mKey}`);
      const mPrev = history.find(m => m.date_key === `2025-${mKey}`);
      currProds = mCurr ? getMonthProducts(mCurr) : [];
      prevProds = mPrev ? getMonthProducts(mPrev) : [];
      currPeriodLabel = `ส.ค. 2026 (ด.${mKey})`;
      prevPeriodLabel = `ส.ค. 2025 (ด.${mKey})`;
    }

    const getQty = (item) => {
      if (!item) return 0;
      if (targetBranch === 'ALL') return item.total_qty || 0;
      return (item.branches && item.branches[targetBranch]) ? item.branches[targetBranch] : 0;
    };

    const getVal = (item) => {
      if (!item) return 0;
      const lak = item.total_price_lak || 0;
      const inc = item.total_incentive || 0;
      const val = lak > 0 ? lak : inc;
      if (targetBranch === 'ALL') return val;
      const totQ = item.total_qty || 0;
      const bQ = (item.branches && item.branches[targetBranch]) ? item.branches[targetBranch] : 0;
      return totQ > 0 ? (val * bQ / totQ) : 0;
    };

    const prevMap = {};
    prevProds.forEach(p => {
      prevMap[p.name] = getQty(p);
    });

    const prevRanked = [...prevProds].filter(p => getQty(p) > 0).sort((a, b) => getQty(b) - getQty(a));
    const prevRankMap = {};
    prevRanked.forEach((p, idx) => {
      prevRankMap[p.name] = idx + 1;
    });

    const currRanked = [...currProds].sort((a, b) => getQty(b) - getQty(a));

    const rankedList = currRanked.map((p, idx) => {
      const currQty = getQty(p);
      const prevQty = prevMap[p.name] || 0;
      const diff = currQty - prevQty;
      const pctGrowth = prevQty > 0 ? ((diff / prevQty) * 100) : (currQty > 0 ? 100 : 0);
      const currRank = idx + 1;
      const prevRank = prevRankMap[p.name];
      let rankShift = 'NEW';
      if (prevRank !== undefined) {
        rankShift = prevRank - currRank;
      }

      const val = getVal(p);
      const lak = p.total_price_lak || 0;
      let valFormatted = '-';
      if (lak > 0) valFormatted = formatLAK(val);
      else if (p.total_incentive > 0) valFormatted = formatTHB(val);

      return {
        rank: currRank,
        prevRank: prevRank || '-',
        rankShift,
        name: p.name,
        english_name: p.english_name || p.name,
        brand_group: p.brand_group || 'Other',
        currQty,
        prevQty,
        diff,
        pctGrowth,
        val,
        valFormatted,
        is_incentive: p.is_incentive
      };
    });

    const totalCurrUnits = rankedList.reduce((sum, p) => sum + p.currQty, 0);
    const totalPrevUnits = prevProds.reduce((sum, p) => sum + getQty(p), 0);
    const diffUnits = totalCurrUnits - totalPrevUnits;
    const pctUnitsGrowth = totalPrevUnits > 0 ? ((diffUnits / totalPrevUnits) * 100) : 0;

    const totalCurrVal = rankedList.reduce((sum, p) => sum + p.val, 0);
    const totalPrevVal = prevProds.reduce((sum, p) => sum + getVal(p), 0);
    const diffVal = totalCurrVal - totalPrevVal;
    const pctValGrowth = totalPrevVal > 0 ? ((diffVal / totalPrevVal) * 100) : 0;

    const branchTotalsInPeriod = {};
    PAC_DATA.branches.forEach(b => {
      branchTotalsInPeriod[b] = currProds.reduce((sum, p) => sum + ((p.branches && p.branches[b]) ? p.branches[b] : 0), 0);
    });
    const sortedBranchKeys = [...PAC_DATA.branches].sort((x, y) => branchTotalsInPeriod[y] - branchTotalsInPeriod[x]);
    const topBranchKey = sortedBranchKeys[0];
    const topBranchUnits = branchTotalsInPeriod[topBranchKey] || 0;
    const topBranchShare = totalCurrUnits > 0 ? ((topBranchUnits / totalCurrUnits) * 100).toFixed(1) : '0.0';

    let topBranchText = '';
    let topBranchSubText = '';
    if (targetBranch === 'ALL') {
      topBranchText = `${topBranchKey} (${topBranchShare}%)`;
      topBranchSubText = `${PAC_DATA.branch_names_th[topBranchKey]} • ${formatNum(topBranchUnits)} ชิ้น`;
    } else {
      const myRank = sortedBranchKeys.indexOf(targetBranch) + 1;
      const myUnits = branchTotalsInPeriod[targetBranch] || 0;
      const myShare = totalCurrUnits > 0 ? ((myUnits / totalCurrUnits) * 100).toFixed(1) : '0.0';
      topBranchText = `#${myRank} จาก 6 สาขา`;
      topBranchSubText = `${PAC_DATA.branch_names_th[targetBranch]} • ${formatNum(myUnits)} ชิ้น (${myShare}%)`;
    }

    const topProductItem = rankedList[0];
    const topProductText = topProductItem ? topProductItem.name : '-';
    const topProductSubText = topProductItem ? `ยอดขาย ${formatNum(topProductItem.currQty)} ชิ้น` : '-';

    const growthDrivers = [...rankedList]
      .filter(p => p.diff > 0 && p.currQty > 0)
      .sort((a, b) => b.diff - a.diff);

    const dropDrivers = [...rankedList]
      .filter(p => p.diff < 0)
      .sort((a, b) => a.diff - b.diff);

    const monthCategories = history.map(m => m.date_key);
    const branchSeries = PAC_DATA.branches.map(b => {
      const data = history.map(m => {
        const prods = getMonthProducts(m);
        return prods.reduce((sum, p) => sum + ((p.branches && p.branches[b]) ? p.branches[b] : 0), 0);
      });
      return {
        name: `${PAC_DATA.branch_names_th[b]} (${b})`,
        branchKey: b,
        data
      };
    });

    let highlightItems = [];
    if (state.selectedHighlights && state.selectedHighlights.length > 0) {
      highlightItems = state.selectedHighlights;
    } else {
      highlightItems = rankedList.filter(p => p.currQty > 0).slice(0, 10).map(p => p.name);
    }

    const highlightSeries = highlightItems.map(pName => {
      const data = history.map(m => {
        const prods = getMonthProducts(m);
        const item = prods.find(p => p.name === pName);
        if (!item) return 0;
        return getQty(item);
      });
      return { name: pName, data };
    });

    return {
      currPeriodLabel,
      prevPeriodLabel,
      totalCurrUnits,
      diffUnits,
      pctUnitsGrowth,
      totalCurrVal,
      diffVal,
      pctValGrowth,
      topBranchText,
      topBranchSubText,
      topProductText,
      topProductSubText,
      growthDrivers,
      dropDrivers,
      rankedList,
      monthCategories,
      branchSeries,
      highlightSeries,
      highlightItems,
      allAvailableProducts: rankedList
    };
  };

  const renderSSATab = () => {
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
      kpiVal.textContent = d.totalCurrVal > 0 ? (state.ssaPeriod === '2026-08' ? formatLAK(d.totalCurrVal) : formatTHB(d.totalCurrVal)) : '0 ₭';
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

  const renderSSABranchTrendChart = (d) => {
    const chartElem = document.getElementById('chart_ssa_branch_trend');
    if (!chartElem) return;

    const isDark = state.theme === 'dark';
    const series = d.branchSeries.map(s => ({
      name: s.name,
      data: s.data
    }));

    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    const options = {
      series: series,
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
        foreColor: isDark ? '#94a3b8' : '#475569'
      },
      colors: colors,
      stroke: {
        width: 3,
        curve: 'smooth'
      },
      markers: {
        size: 3,
        hover: { size: 6 }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: d.monthCategories,
        title: { text: 'เส้นเวลาต่อเนื่อง 17 เดือน (เม.ย. 2025 – ส.ค. 2026)' }
      },
      yaxis: {
        title: { text: 'จำนวนขาย (ชิ้น)' },
        labels: { formatter: (val) => formatNum(val) }
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: state.theme,
        y: { formatter: (val) => `${formatNum(val)} ชิ้น` }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      }
    };

    if (state.charts['chart_ssa_branch_trend']) {
      state.charts['chart_ssa_branch_trend'].destroy();
    }
    state.charts['chart_ssa_branch_trend'] = new ApexCharts(chartElem, options);
    state.charts['chart_ssa_branch_trend'].render();
  };

  const renderSSAHighlightTrendChart = (d) => {
    const chartElem = document.getElementById('chart_ssa_highlight_trend');
    if (!chartElem) return;

    const badge = document.getElementById('highlightSelectedBadge');
    if (badge) {
      badge.textContent = `แสดง ${d.highlightSeries.length} รายการ`;
    }

    if (d.highlightSeries.length === 0) {
      chartElem.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);">ไม่มีรายการสินค้าที่เลือก กรุณาติ๊กเลือกสินค้าจากรายการด้านล่าง</div>';
      return;
    }

    const isDark = state.theme === 'dark';
    const options = {
      series: d.highlightSeries,
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
        foreColor: isDark ? '#94a3b8' : '#475569'
      },
      stroke: {
        width: 2.5,
        curve: 'smooth'
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: d.monthCategories,
        title: { text: 'เส้นเวลา 17 เดือน (เม.ย. 2025 – ส.ค. 2026)' }
      },
      yaxis: {
        title: { text: `จำนวนขาย ${state.ssaBranch === 'ALL' ? 'รวมทุกสาขา' : state.ssaBranch} (ชิ้น)` },
        labels: { formatter: (val) => formatNum(val) }
      },
      tooltip: {
        shared: true,
        theme: state.theme,
        y: { formatter: (val) => `${formatNum(val)} ชิ้น` }
      },
      legend: {
        position: 'bottom'
      }
    };

    if (state.charts['chart_ssa_highlight_trend']) {
      state.charts['chart_ssa_highlight_trend'].destroy();
    }
    state.charts['chart_ssa_highlight_trend'] = new ApexCharts(chartElem, options);
    state.charts['chart_ssa_highlight_trend'].render();
  };

  const renderHighlightChecklist = (d) => {
    const container = document.getElementById('ssa_highlight_checklist');
    if (!container) return;

    container.innerHTML = '';
    const q = (state.highlightSearch || '').toLowerCase();
    const activeHighlights = new Set(d.highlightItems);

    const candidates = d.allAvailableProducts.filter(p => {
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.brand_group.toLowerCase().includes(q);
    });

    candidates.slice(0, 40).forEach(p => {
      const label = document.createElement('label');
      label.className = 'highlight-check-label';
      const isChecked = activeHighlights.has(p.name);
      label.innerHTML = `
        <input type="checkbox" value="${p.name}" ${isChecked ? 'checked' : ''}>
        <span>${p.name}</span>
        <span style="font-size: 11px; color: var(--text-muted);">(${formatNum(p.currQty)})</span>
      `;

      label.querySelector('input').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!activeHighlights.has(p.name)) {
            state.selectedHighlights = [...activeHighlights, p.name];
          }
        } else {
          state.selectedHighlights = [...activeHighlights].filter(x => x !== p.name);
        }
        const updated = processSSAData();
        renderSSAHighlightTrendChart(updated);
      });

      container.appendChild(label);
    });
  };

  const renderSSAGrowthDropCharts = (d) => {
    const growthElem = document.getElementById('chart_ssa_growth_drivers');
    const dropElem = document.getElementById('chart_ssa_drop_drivers');
    const limit = state.driverLimit || 5;
    const isDark = state.theme === 'dark';

    if (growthElem) {
      const topG = d.growthDrivers.slice(0, limit);
      if (topG.length === 0) {
        growthElem.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-circle-info"></i> ไม่พบรายการที่เติบโตขึ้นในงวดนี้</div>';
      } else {
        const names = topG.map(p => p.name);
        const values = topG.map(p => p.diff);

        const options = {
          series: [{ name: 'ยอดขายเพิ่มขึ้น (ชิ้น)', data: values }],
          chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false },
            foreColor: isDark ? '#94a3b8' : '#475569'
          },
          plotOptions: {
            bar: { borderRadius: 4, horizontal: true, barHeight: '65%' }
          },
          colors: ['#009944'],
          dataLabels: {
            enabled: true,
            formatter: (val) => `+${formatNum(val)}`
          },
          xaxis: {
            categories: names,
            labels: { formatter: (val) => `+${formatNum(val)}` }
          },
          tooltip: {
            theme: state.theme,
            y: { formatter: (val) => `+${formatNum(val)} ชิ้น` }
          }
        };

        if (state.charts['chart_ssa_growth_drivers']) {
          state.charts['chart_ssa_growth_drivers'].destroy();
        }
        state.charts['chart_ssa_growth_drivers'] = new ApexCharts(growthElem, options);
        state.charts['chart_ssa_growth_drivers'].render();
      }
    }

    if (dropElem) {
      const topD = d.dropDrivers.slice(0, limit);
      if (topD.length === 0) {
        dropElem.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--accent-emerald);"><i class="fa-solid fa-circle-check"></i> ยอดเยี่ยม! ไม่พบสินค้าที่ยอดขายหดตัวในงวดนี้</div>';
      } else {
        const names = topD.map(p => p.name);
        const values = topD.map(p => p.diff);

        const options = {
          series: [{ name: 'ยอดขายลดลง (ชิ้น)', data: values }],
          chart: {
            type: 'bar',
            height: 280,
            toolbar: { show: false },
            foreColor: isDark ? '#94a3b8' : '#475569'
          },
          plotOptions: {
            bar: { borderRadius: 4, horizontal: true, barHeight: '65%' }
          },
          colors: ['#e11d48'],
          dataLabels: {
            enabled: true,
            formatter: (val) => `${formatNum(val)}`
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

        if (state.charts['chart_ssa_drop_drivers']) {
          state.charts['chart_ssa_drop_drivers'].destroy();
        }
        state.charts['chart_ssa_drop_drivers'] = new ApexCharts(dropElem, options);
        state.charts['chart_ssa_drop_drivers'].render();
      }
    }
  };

  const renderSSARankedProductsTable = (d) => {
    const tbody = document.getElementById('tbody_ssa_ranked_products');
    if (!tbody) return;

    tbody.innerHTML = '';
    const q = (state.rankedSearch || '').toLowerCase();

    let items = [...d.rankedList];
    if (q) {
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.brand_group.toLowerCase().includes(q));
    }

    if (state.rankedSort === 'val') {
      items.sort((a, b) => b.val - a.val);
    } else {
      items.sort((a, b) => b.currQty - a.currQty);
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">ไม่พบข้อมูลตามเงื่อนไขการค้นหา</td></tr>`;
      return;
    }

    items.forEach(item => {
      const tr = document.createElement('tr');

      let shiftHtml = '';
      if (item.rankShift === 'NEW') {
        shiftHtml = `<span class="rank-shift-badge new"><i class="fa-solid fa-star"></i> NEW</span>`;
      } else if (item.rankShift > 0) {
        shiftHtml = `<span class="rank-shift-badge up"><i class="fa-solid fa-arrow-up"></i> +${item.rankShift}</span>`;
      } else if (item.rankShift < 0) {
        shiftHtml = `<span class="rank-shift-badge down"><i class="fa-solid fa-arrow-down"></i> ${item.rankShift}</span>`;
      } else {
        shiftHtml = `<span class="rank-shift-badge same"><i class="fa-solid fa-minus"></i> 0</span>`;
      }

      const diffColor = item.diff >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';
      const diffSign = item.diff >= 0 ? '+' : '';
      const pctSign = item.pctGrowth >= 0 ? '+' : '';

      tr.innerHTML = `
        <td><div class="rank-circle ${item.rank === 1 ? 'rank-1' : item.rank === 2 ? 'rank-2' : item.rank === 3 ? 'rank-3' : ''}">${item.rank}</div></td>
        <td style="text-align: center;">${shiftHtml}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
        </td>
        <td><span class="badge badge-primary">${item.brand_group}</span></td>
        <td style="text-align: right; font-weight: 700; color: var(--ssa-primary);">${formatNum(item.currQty)}</td>
        <td style="text-align: right; font-weight: 600; color: ${diffColor};">${diffSign}${formatNum(item.diff)}</td>
        <td style="text-align: right; font-weight: 600; color: ${diffColor};">${pctSign}${item.pctGrowth.toFixed(1)}%</td>
        <td style="text-align: right; font-weight: 700;">${item.valFormatted}</td>
      `;

      tbody.appendChild(tr);
    });
  };
"""

new_bottom_block = """  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================
  initTheme();
  initNameMaskToggle();
  initNav();
  initSSAControls();
  renderSSATab();
  console.log("Pharma Alliance Dashboard initialized successfully.");
});
"""

final_js = (
    content[:p1_s] +
    new_ssa_block + "\n" +
    content[p1_e:p2_s] +
    content[p2_e:p3_s] +
    new_bottom_block
)

# Backup app.js
with open('scratch/app.backup.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Overwrite app.js
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(final_js)

print("SUCCESS: app.js updated successfully! Length:", len(final_js))

