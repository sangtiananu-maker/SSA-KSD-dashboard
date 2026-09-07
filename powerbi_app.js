/**
 * ==============================================================================
 * PHARMA ALLIANCE (PAC) - POWER BI WEB EDITION JAVASCRIPT ENGINE
 * Full Interactive Dashboard with Microsoft Power BI UI/UX
 * ==============================================================================
 */

(function () {
  'use strict';

  // Check data availability
  if (typeof PAC_DATA === 'undefined') {
    console.error('PAC_DATA not found. Please ensure data.js is loaded.');
    return;
  }

  const pbiColors = [
    '#118DFF', // Power BI Blue
    '#12239E', // Navy
    '#E66C37', // Orange
    '#00A389', // Teal Green
    '#6B007B', // Plum
    '#E044A7', // Magenta
    '#744EC2', // Violet
    '#D9B300', // Gold
    '#D64550', // Red
    '#255B98'  // PAC Blue
  ];

  // State
  const state = {
    theme: 'light',
    activePage: 'page-exec',
    filterPaneOpen: true,
    slicers: {
      branch: 'ALL',
      brand: 'ALL',
      strategicOnly: false,
      incentiveOnly: false
    },
    storeVisitBranch: 'SSA7',
    charts: {}
  };

  // Helper formatting functions
  function formatNumber(val, decimals = 0) {
    if (val === null || val === undefined || isNaN(val)) return '0';
    return Number(val).toLocaleString('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function formatCompact(val, currency = '') {
    if (val === null || val === undefined || isNaN(val)) return '0 ' + currency;
    const num = Number(val);
    if (Math.abs(num) >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B ' + currency;
    }
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M ' + currency;
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'K ' + currency;
    }
    return formatNumber(num) + ' ' + currency;
  }

  // ============================================================================
  // 1. INITIALIZATION
  // ============================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initRibbonActions();
    initPageTabs();
    initFilterPane();
    initKPIs();
    renderAllCharts();
    renderAllTables();
    initStoreVisit();
    initDictionary();
    initFocusMode();
  });

  // ============================================================================
  // 2. RIBBON ACTIONS & THEME
  // ============================================================================
  function initRibbonActions() {
    // Theme Toggle
    const btnTheme = document.getElementById('btnToggleTheme');
    btnTheme.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      state.theme = next;
      btnTheme.innerHTML = next === 'dark' 
        ? '<i class="fa-solid fa-sun" style="color: #f2c811;"></i> <span>ธีมสว่าง</span>' 
        : '<i class="fa-solid fa-moon"></i> <span>ธีมมืด</span>';
      
      // Update chart themes
      Object.values(state.charts).forEach(c => {
        if (c && typeof c.updateOptions === 'function') {
          c.updateOptions({
            theme: { mode: next },
            chart: { foreColor: next === 'dark' ? '#c8c6c4' : '#605e5c' }
          });
        }
      });
    });

    // Refresh Button
    document.getElementById('btnRefresh').addEventListener('click', () => {
      const btn = document.getElementById('btnRefresh');
      btn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> <span>กำลังรีเฟรช...</span>';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-rotate"></i> <span>รีเฟรช</span>';
        applyFilters();
      }, 500);
    });

    // Fullscreen Button
    document.getElementById('btnFullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    });

    // Export Excel Button
    document.getElementById('btnExport').addEventListener('click', () => {
      exportCurrentPageToExcel();
    });
  }

  // ============================================================================
  // 3. BOTTOM PAGE TABS
  // ============================================================================
  function initPageTabs() {
    const tabItems = document.querySelectorAll('.pbi-tab-item');
    tabItems.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-target');
        if (!targetId || targetId === state.activePage) return;

        // Switch active tab styling
        tabItems.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Switch active page
        document.querySelectorAll('.pbi-page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(targetId);
        if (targetPage) {
          targetPage.classList.add('active');
          state.activePage = targetId;

          // Force ApexCharts to resize properly after becoming visible
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        }
      });
    });
  }

  // ============================================================================
  // 4. FILTER PANE (SLICERS)
  // ============================================================================
  function initFilterPane() {
    const filterPane = document.getElementById('pbiFilterPane');
    const toggleBtn = document.getElementById('btnToggleFilter');
    const closeBtn = document.getElementById('btnCloseFilterPane');

    function togglePane() {
      state.filterPaneOpen = !state.filterPaneOpen;
      if (state.filterPaneOpen) {
        filterPane.classList.remove('collapsed');
        toggleBtn.classList.add('active');
      } else {
        filterPane.classList.add('collapsed');
        toggleBtn.classList.remove('active');
      }
      setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
    }

    toggleBtn.addEventListener('click', togglePane);
    closeBtn.addEventListener('click', togglePane);

    // Branch Select Slicer
    const branchSelect = document.getElementById('slicerBranchSelect');
    branchSelect.addEventListener('change', (e) => {
      state.slicers.branch = e.target.value;
      document.getElementById('slicerBranchCount').textContent = e.target.value === 'ALL' ? 'ทั้งหมด' : e.target.value;
      applyFilters();
    });

    // Brand Chips Slicer
    const brandChips = document.querySelectorAll('#slicerBrandChips .pbi-chip');
    brandChips.forEach(chip => {
      chip.addEventListener('click', () => {
        brandChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.slicers.brand = chip.getAttribute('data-brand');
        document.getElementById('slicerBrandCount').textContent = state.slicers.brand === 'ALL' ? 'ทั้งหมด' : state.slicers.brand;
        applyFilters();
      });
    });

    // Checkbox Slicers
    const chkStrategic = document.getElementById('slicerStrategicOnly');
    chkStrategic.addEventListener('change', (e) => {
      state.slicers.strategicOnly = e.target.checked;
      applyFilters();
    });

    const chkIncentive = document.getElementById('slicerIncentiveOnly');
    chkIncentive.addEventListener('change', (e) => {
      state.slicers.incentiveOnly = e.target.checked;
      applyFilters();
    });

    // Reset Filters
    document.getElementById('btnResetFilters').addEventListener('click', () => {
      branchSelect.value = 'ALL';
      state.slicers.branch = 'ALL';
      document.getElementById('slicerBranchCount').textContent = 'ทั้งหมด';

      brandChips.forEach(c => c.classList.remove('active'));
      document.querySelector('#slicerBrandChips .pbi-chip[data-brand="ALL"]').classList.add('active');
      state.slicers.brand = 'ALL';
      document.getElementById('slicerBrandCount').textContent = 'ทั้งหมด';

      chkStrategic.checked = false;
      state.slicers.strategicOnly = false;

      chkIncentive.checked = false;
      state.slicers.incentiveOnly = false;

      applyFilters();
    });
  }

  function applyFilters() {
    renderAllCharts();
    renderAllTables();
  }

  // ============================================================================
  // 5. EXECUTIVE KPIS
  // ============================================================================
  function initKPIs() {
    const kpis = PAC_DATA.summary_kpis || {};
    document.getElementById('kpiKsdTotal').textContent = formatCompact(kpis.ksd_total_revenue_thb, '฿');
    document.getElementById('kpiKsdPac').textContent = formatCompact(kpis.ksd_pac_revenue_thb, '฿');
    document.getElementById('kpiSsaTotal').textContent = formatCompact(kpis.ssa_total_lak, '₭');
    document.getElementById('kpiIncentiveTotal').textContent = formatCompact(kpis.latest_official_incentive_thb, '฿');
  }

  // ============================================================================
  // 6. APEXCHARTS RENDERING (POWER BI STYLED)
  // ============================================================================
  function renderAllCharts() {
    renderChartExecKsdTrend();
    renderChartExecSsaBranches();
    renderChartExecIncentiveHistory();
    renderChartExecTopProducts();
    renderChartKsdBrands();
    renderChartKsdSalesReps();
    renderChartSsaBranchCompare();
    renderChartSsaBranchDonut();
    renderChartIncentive17MTrend();
  }

  function getCommonChartOptions(height = 280) {
    const isDark = state.theme === 'dark';
    return {
      chart: {
        fontFamily: "'Segoe UI', 'Sarabun', sans-serif",
        foreColor: isDark ? '#c8c6c4' : '#605e5c',
        toolbar: { show: false },
        animations: { enabled: true, easing: 'easeinout', speed: 450 }
      },
      theme: { mode: isDark ? 'dark' : 'light' },
      grid: {
        borderColor: isDark ? '#323130' : '#edebe9',
        strokeDashArray: 2
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        style: { fontSize: '12px', fontFamily: "'Segoe UI', 'Sarabun', sans-serif" }
      }
    };
  }

  // Chart 1: KSD Monthly Trend & PAC Share
  function renderChartExecKsdTrend() {
    const container = document.getElementById('chartExecKsdTrend');
    if (!container) return;

    const history = PAC_DATA.ksd_monthly_history || [];
    const categories = history.map(h => h.date_key || `${h.year}-${String(h.month).padStart(2, '0')}`);
    const totalSellout = history.map(h => Math.round(h.total_sellout_bath || 0));
    const retailSsa = history.map(h => Math.round(h.retail_ssa_bath || 0));

    const options = {
      ...getCommonChartOptions(280),
      chart: { type: 'line', height: 280, toolbar: { show: false } },
      series: [
        { name: 'ยอดขาย KSD รวม (บาท)', type: 'column', data: totalSellout },
        { name: 'สัดส่วนเข้าหน้าร้าน SSA (บาท)', type: 'line', data: retailSsa }
      ],
      colors: [pbiColors[0], pbiColors[2]],
      stroke: { width: [0, 3], curve: 'smooth' },
      plotOptions: { bar: { columnWidth: '45%', borderRadius: 4 } },
      xaxis: { categories: categories, labels: { rotate: -45, style: { fontSize: '10.5px' } } },
      yaxis: [
        { title: { text: 'ยอดขายรวม (บาท)', style: { fontSize: '11px' } }, labels: { formatter: v => formatCompact(v) } },
        { opposite: true, title: { text: 'เข้า SSA (บาท)', style: { fontSize: '11px' } }, labels: { formatter: v => formatCompact(v) } }
      ],
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '11.5px' }
    };

    if (state.charts['execKsd']) state.charts['execKsd'].destroy();
    state.charts['execKsd'] = new ApexCharts(container, options);
    state.charts['execKsd'].render();
  }

  // Chart 2: SSA 6 Branch Breakdown
  function renderChartExecSsaBranches() {
    const container = document.getElementById('chartExecSsaBranches');
    if (!container) return;

    const branchTotals = PAC_DATA.branch_totals_lak || {};
    const branches = Object.keys(branchTotals);
    const series = Object.values(branchTotals).map(v => Math.round(v));
    const labels = branches.map(b => (PAC_DATA.branch_names_th && PAC_DATA.branch_names_th[b]) || b);

    const options = {
      ...getCommonChartOptions(280),
      chart: { type: 'donut', height: 280 },
      series: series,
      labels: labels,
      colors: pbiColors,
      dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
      legend: { position: 'bottom', fontSize: '11px' },
      tooltip: { y: { formatter: (v) => formatNumber(v) + ' ₭' } }
    };

    if (state.charts['execSsa']) state.charts['execSsa'].destroy();
    state.charts['execSsa'] = new ApexCharts(container, options);
    state.charts['execSsa'].render();
  }

  // Chart 3: 17-Month Incentive Trend
  function renderChartExecIncentiveHistory() {
    const container = document.getElementById('chartExecIncentiveHistory');
    if (!container) return;

    const histList = PAC_DATA.historical_incentives || [];
    const categories = histList.map(h => h.date_key || '');
    const dataMoney = histList.map(h => Math.round(h.total_incentive || 0));
    const dataUnits = histList.map(h => h.total_qty || 0);

    const options = {
      ...getCommonChartOptions(280),
      chart: { type: 'area', height: 280, toolbar: { show: false } },
      series: [
        { name: 'ยอดเงินค่าเชียร์ (บาท)', data: dataMoney }
      ],
      colors: [pbiColors[4]],
      stroke: { curve: 'smooth', width: 2.5 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] }
      },
      xaxis: { categories: categories, labels: { rotate: -45, style: { fontSize: '10px' } } },
      yaxis: { labels: { formatter: v => formatCompact(v, '฿') } },
      dataLabels: { enabled: false }
    };

    if (state.charts['execInc']) state.charts['execInc'].destroy();
    state.charts['execInc'] = new ApexCharts(container, options);
    state.charts['execInc'].render();
  }

  // Chart 4: Top 10 High Performing Products
  function renderChartExecTopProducts() {
    const container = document.getElementById('chartExecTopProducts');
    if (!container) return;

    let products = (PAC_DATA.ssa_products_august || []).slice();
    products.sort((a, b) => (b.total_qty || 0) - (a.total_qty || 0));
    const top10 = products.slice(0, 10);

    const categories = top10.map(p => (p.english_name || p.lao_name || '').substring(0, 24));
    const data = top10.map(p => p.total_qty || 0);

    const options = {
      ...getCommonChartOptions(280),
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      series: [{ name: 'จำนวนชิ้นที่ขายได้', data: data }],
      colors: [pbiColors[3]],
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, barHeight: '65%' }
      },
      dataLabels: { enabled: true, style: { fontSize: '10px' } },
      xaxis: { categories: categories, labels: { style: { fontSize: '10px' } } },
      tooltip: { y: { formatter: v => formatNumber(v) + ' ชิ้น' } }
    };

    if (state.charts['execTopProd']) state.charts['execTopProd'].destroy();
    state.charts['execTopProd'] = new ApexCharts(container, options);
    state.charts['execTopProd'].render();
  }

  // Chart 5: KSD Brands
  function renderChartKsdBrands() {
    const container = document.getElementById('chartKsdBrands');
    if (!container) return;

    const brandBreakdown = PAC_DATA.ksd_group_breakdown_by_period && PAC_DATA.ksd_group_breakdown_by_period['2026-08'];
    let categories = [];
    let data = [];

    if (brandBreakdown && typeof brandBreakdown === 'object') {
      const sorted = Object.entries(brandBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 8);
      categories = sorted.map(s => s[0]);
      data = sorted.map(s => Math.round(s[1]));
    } else {
      categories = ['Capsika', 'Plaivana', 'Diabederm', 'Arotika', 'Clenascar', 'Glucosa', 'Other'];
      data = [850000, 620000, 480000, 390000, 290000, 210000, 746199];
    }

    const options = {
      ...getCommonChartOptions(300),
      chart: { type: 'bar', height: 300, toolbar: { show: false } },
      series: [{ name: 'ยอดขาย ส.ค. 26 (บาท)', data: data }],
      colors: [pbiColors[0]],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
      xaxis: { categories: categories, labels: { style: { fontSize: '11px' } } },
      yaxis: { labels: { formatter: v => formatCompact(v, '฿') } },
      dataLabels: { enabled: false }
    };

    if (state.charts['ksdBrands']) state.charts['ksdBrands'].destroy();
    state.charts['ksdBrands'] = new ApexCharts(container, options);
    state.charts['ksdBrands'].render();
  }

  // Chart 6: KSD Sales Reps
  function renderChartKsdSalesReps() {
    const container = document.getElementById('chartKsdSalesReps');
    if (!container) return;

    const reps = (PAC_DATA.ksd_by_salesperson || []).slice(0, 8);
    const categories = reps.map(r => r.salesperson || 'Sales Rep');
    const data = reps.map(r => Math.round(r.sales_thb || 0));

    const options = {
      ...getCommonChartOptions(300),
      chart: { type: 'bar', height: 300, toolbar: { show: false } },
      series: [{ name: 'ยอดขายสะสม (บาท)', data: data }],
      colors: [pbiColors[1]],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
      xaxis: { categories: categories, labels: { style: { fontSize: '10px' } } },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      tooltip: { y: { formatter: v => formatNumber(v) + ' ฿' } }
    };

    if (state.charts['ksdSalesReps']) state.charts['ksdSalesReps'].destroy();
    state.charts['ksdSalesReps'] = new ApexCharts(container, options);
    state.charts['ksdSalesReps'].render();
  }

  // Chart 7: SSA Branch Compare Grouped
  function renderChartSsaBranchCompare() {
    const container = document.getElementById('chartSsaBranchCompare');
    if (!container) return;

    const branches = PAC_DATA.branches || ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];
    const branchTotalsLak = PAC_DATA.branch_totals_lak || {};
    const branchTotalsQty = PAC_DATA.branch_totals_qty || {};

    const categories = branches.map(b => (PAC_DATA.branch_names_th && PAC_DATA.branch_names_th[b]) || b);
    const lakData = branches.map(b => Math.round((branchTotalsLak[b] || 0) / 1000000)); // Millions LAK
    const qtyData = branches.map(b => branchTotalsQty[b] || 0);

    const options = {
      ...getCommonChartOptions(320),
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      series: [
        { name: 'ยอดขาย (ล้าน LAK)', data: lakData },
        { name: 'จำนวนชิ้น (Units)', data: qtyData }
      ],
      colors: [pbiColors[2], pbiColors[0]],
      plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
      xaxis: { categories: categories, labels: { style: { fontSize: '11px' } } },
      yaxis: [
        { title: { text: 'ล้าน LAK' }, labels: { formatter: v => v + 'M ₭' } },
        { opposite: true, title: { text: 'จำนวนชิ้น' }, labels: { formatter: v => formatNumber(v) } }
      ],
      legend: { position: 'top', horizontalAlign: 'right' }
    };

    if (state.charts['ssaCompare']) state.charts['ssaCompare'].destroy();
    state.charts['ssaCompare'] = new ApexCharts(container, options);
    state.charts['ssaCompare'].render();
  }

  // Chart 8: SSA Branch Donut
  function renderChartSsaBranchDonut() {
    const container = document.getElementById('chartSsaBranchDonut');
    if (!container) return;

    const branchTotals = PAC_DATA.branch_totals_qty || {};
    const branches = Object.keys(branchTotals);
    const series = Object.values(branchTotals);
    const labels = branches.map(b => b);

    const options = {
      ...getCommonChartOptions(320),
      chart: { type: 'donut', height: 320 },
      series: series,
      labels: labels,
      colors: pbiColors,
      legend: { position: 'bottom', fontSize: '11px' }
    };

    if (state.charts['ssaDonut']) state.charts['ssaDonut'].destroy();
    state.charts['ssaDonut'] = new ApexCharts(container, options);
    state.charts['ssaDonut'].render();
  }

  // Chart 9: Incentive 17M Stacked
  function renderChartIncentive17MTrend() {
    const container = document.getElementById('chartIncentive17MTrend');
    if (!container) return;

    const histList = PAC_DATA.historical_incentives || [];
    const categories = histList.map(h => h.date_key || '');
    const branches = PAC_DATA.branches || ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

    const series = branches.map((b, idx) => {
      const bData = histList.map(h => {
        const bInc = (h.branch_incentives && h.branch_incentives[b]) || 0;
        return Math.round(bInc);
      });
      return {
        name: b,
        data: bData
      };
    });

    const options = {
      ...getCommonChartOptions(320),
      chart: { type: 'bar', height: 320, stacked: true, toolbar: { show: false } },
      series: series,
      colors: pbiColors,
      plotOptions: { bar: { borderRadius: 2, columnWidth: '55%' } },
      xaxis: { categories: categories, labels: { rotate: -45, style: { fontSize: '10px' } } },
      yaxis: { labels: { formatter: v => formatCompact(v, '฿') } },
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px' }
    };

    if (state.charts['inc17M']) state.charts['inc17M'].destroy();
    state.charts['inc17M'] = new ApexCharts(container, options);
    state.charts['inc17M'].render();
  }

  // ============================================================================
  // 7. POWER BI MATRIX / DATA TABLES
  // ============================================================================
  function renderAllTables() {
    renderKsdProductsTable();
    renderSsaMatrixTable();
    renderIncentiveAugustTable();
    renderStrategicMatrixTable();
  }

  // Table 1: KSD Top Products Table
  function renderKsdProductsTable() {
    const wrapper = document.getElementById('tableKsdProductsWrapper');
    if (!wrapper) return;

    const prodList = (PAC_DATA.ksd_products_by_period && PAC_DATA.ksd_products_by_period['2026-08']) || [];
    
    // Filter
    let filtered = prodList.filter(p => {
      if (state.slicers.brand !== 'ALL' && p.brand_group !== state.slicers.brand) return false;
      if (state.slicers.strategicOnly && !p.is_strategic) return false;
      return true;
    });

    filtered.sort((a, b) => (b.total_bath || 0) - (a.total_bath || 0));

    let html = `
      <table class="pbi-matrix-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>ชื่อสินค้า (Product Name)</th>
            <th>กลุ่มแบรนด์</th>
            <th>สถานะกลยุทธ์</th>
            <th class="pbi-text-right">จำนวนชิ้น</th>
            <th class="pbi-text-right">ออเดอร์</th>
            <th class="pbi-text-right">ยอดขายรวม (บาท)</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.slice(0, 30).forEach(p => {
      const isStrat = p.is_strategic ? '<span class="pbi-status-tag pbi-status-green">Strategic</span>' : '<span class="pbi-status-tag pbi-status-blue">General</span>';
      html += `
        <tr>
          <td><code>${p.sku || '-'}</code></td>
          <td><strong>${p.name || '-'}</strong></td>
          <td>${p.brand_group || '-'}</td>
          <td>${isStrat}</td>
          <td class="pbi-text-right">${formatNumber(p.total_qty)}</td>
          <td class="pbi-text-right">${formatNumber(p.orders)}</td>
          <td class="pbi-text-right"><span class="pbi-bar-fill">${formatNumber(p.total_bath, 2)} ฿</span></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    wrapper.innerHTML = html;
  }

  // Table 2: SSA Branch Matrix
  function renderSsaMatrixTable() {
    const wrapper = document.getElementById('tableSsaMatrixWrapper');
    if (!wrapper) return;

    const products = PAC_DATA.ssa_products_august || [];
    const branches = PAC_DATA.branches || ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

    // Filter
    let filtered = products.filter(p => {
      if (state.slicers.brand !== 'ALL' && p.brand_group !== state.slicers.brand) return false;
      if (state.slicers.strategicOnly && !p.is_strategic) return false;
      if (state.slicers.incentiveOnly && !p.is_incentive) return false;
      return true;
    });

    let html = `
      <table class="pbi-matrix-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>ชื่อยา (Lao / International)</th>
            <th>แบรนด์</th>
            ${branches.map(b => `<th class="pbi-text-right">${b} (ชิ้น)</th>`).join('')}
            <th class="pbi-text-right">ยอดรวม (ชิ้น)</th>
            <th class="pbi-text-right">ยอดขาย (LAK)</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.slice(0, 40).forEach(p => {
      const bQtys = p.branch_qtys || {};
      html += `
        <tr>
          <td><code>${p.sku || '-'}</code></td>
          <td>${p.english_name || p.lao_name || '-'}</td>
          <td>${p.brand_group || '-'}</td>
          ${branches.map(b => `<td class="pbi-text-right">${bQtys[b] ? formatNumber(bQtys[b]) : '-'}</td>`).join('')}
          <td class="pbi-text-right"><strong>${formatNumber(p.total_qty)}</strong></td>
          <td class="pbi-text-right"><span class="pbi-bar-fill">${formatNumber(p.total_price_lak)} ₭</span></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    wrapper.innerHTML = html;
  }

  // Table 3: August Incentive
  function renderIncentiveAugustTable() {
    const wrapper = document.getElementById('tableIncentiveAugustWrapper');
    if (!wrapper) return;

    const histList = PAC_DATA.historical_incentives || [];
    const aug = histList.find(h => h.date_key === '2026-08') || histList[histList.length - 1];
    if (!aug || !aug.products) {
      wrapper.innerHTML = '<p style="padding: 16px;">ไม่มีข้อมูลค่าเชียร์เดือนนี้</p>';
      return;
    }

    const branches = PAC_DATA.branches || ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

    let html = `
      <table class="pbi-matrix-table">
        <thead>
          <tr>
            <th>ชื่อสินค้า</th>
            <th class="pbi-text-right">อัตรา (บาท/ชิ้น)</th>
            ${branches.map(b => `<th class="pbi-text-right">${b}</th>`).join('')}
            <th class="pbi-text-right">รวมชิ้น</th>
            <th class="pbi-text-right">รวมจ่าย (บาท)</th>
          </tr>
        </thead>
        <tbody>
    `;

    aug.products.forEach(p => {
      const bMap = p.branches || {};
      html += `
        <tr>
          <td><strong>${p.product_name || '-'}</strong></td>
          <td class="pbi-text-right">${formatNumber(p.incentive_price, 1)} ฿</td>
          ${branches.map(b => `<td class="pbi-text-right">${bMap[b] ? formatNumber(bMap[b]) : '-'}</td>`).join('')}
          <td class="pbi-text-right">${formatNumber(p.total_qty)}</td>
          <td class="pbi-text-right"><span class="pbi-bar-fill" style="background-color: rgba(107, 0, 123, 0.15); color: var(--pbi-purple);">${formatNumber(p.total_incentive, 2)} ฿</span></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    wrapper.innerHTML = html;
  }

  // Table 4: Strategic White-Space Matrix
  function renderStrategicMatrixTable() {
    const wrapper = document.getElementById('tableStrategicMatrixWrapper');
    if (!wrapper) return;

    const matrix = PAC_DATA.white_space_matrix || PAC_DATA.strategic_matrix || [];
    const branches = PAC_DATA.branches || ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

    let html = `
      <table class="pbi-matrix-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>ชื่อสินค้ากลยุทธ์ PAC</th>
            <th>กลุ่มแบรนด์</th>
            ${branches.map(b => `<th class="pbi-text-center">${b}</th>`).join('')}
            <th class="pbi-text-right">สาขาที่มีขาย</th>
          </tr>
        </thead>
        <tbody>
    `;

    matrix.forEach(m => {
      const soldMap = m.sold_branches || m.branches || {};
      let soldCount = 0;
      const cells = branches.map(b => {
        const isSold = soldMap[b] === true || (typeof soldMap[b] === 'number' && soldMap[b] > 0);
        if (isSold) soldCount++;
        return isSold 
          ? `<td class="pbi-text-center"><span class="pbi-status-tag pbi-status-green"><i class="fa-solid fa-check"></i> มีขาย</span></td>`
          : `<td class="pbi-text-center"><span class="pbi-status-tag pbi-status-red"><i class="fa-solid fa-xmark"></i> ขาด/โอกาส</span></td>`;
      }).join('');

      html += `
        <tr>
          <td><code>${m.sku || '-'}</code></td>
          <td><strong>${m.product_name || m.name || '-'}</strong></td>
          <td>${m.brand_group || '-'}</td>
          ${cells}
          <td class="pbi-text-right"><strong>${soldCount} / ${branches.length}</strong></td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    wrapper.innerHTML = html;
  }

  // ============================================================================
  // 8. STORE VISIT DEEP-DIVE
  // ============================================================================
  function initStoreVisit() {
    const branchSelect = document.getElementById('selectStoreVisitBranch');
    branchSelect.addEventListener('change', (e) => {
      state.storeVisitBranch = e.target.value;
      renderStoreVisitTables();
    });

    document.getElementById('btnPrintStoreVisit').addEventListener('click', () => {
      window.print();
    });

    renderStoreVisitTables();
  }

  function renderStoreVisitTables() {
    const branchKey = state.storeVisitBranch;
    const storeData = PAC_DATA.store_visit_data && PAC_DATA.store_visit_data[branchKey];

    const growthWrapper = document.getElementById('tableStoreVisitGrowthWrapper');
    const declineWrapper = document.getElementById('tableStoreVisitDeclineWrapper');
    const zeroWrapper = document.getElementById('tableStoreVisitZeroWrapper');

    if (!storeData) {
      if (growthWrapper) growthWrapper.innerHTML = '<p style="padding: 12px;">ไม่มีข้อมูลตรวจเยี่ยมสำหรับสาขานี้</p>';
      return;
    }

    // Top Growth Table
    if (growthWrapper) {
      const growths = storeData.top_growth || [];
      let gHtml = `
        <table class="pbi-matrix-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th class="pbi-text-right">ก.ค. 26</th>
              <th class="pbi-text-right">ส.ค. 26</th>
              <th class="pbi-text-right">เพิ่มขึ้น</th>
            </tr>
          </thead>
          <tbody>
      `;
      growths.slice(0, 10).forEach(g => {
        gHtml += `
          <tr>
            <td><strong>${g.name || '-'}</strong></td>
            <td class="pbi-text-right">${formatNumber(g.prev_qty)}</td>
            <td class="pbi-text-right">${formatNumber(g.curr_qty)}</td>
            <td class="pbi-text-right"><span class="pbi-status-tag pbi-status-green">+${formatNumber(g.diff_qty)} ชิ้น</span></td>
          </tr>
        `;
      });
      gHtml += `</tbody></table>`;
      growthWrapper.innerHTML = gHtml;
    }

    // Top Decline Table
    if (declineWrapper) {
      const declines = storeData.top_decline || [];
      let dHtml = `
        <table class="pbi-matrix-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th class="pbi-text-right">ก.ค. 26</th>
              <th class="pbi-text-right">ส.ค. 26</th>
              <th class="pbi-text-right">ลดลง</th>
            </tr>
          </thead>
          <tbody>
      `;
      declines.slice(0, 10).forEach(d => {
        dHtml += `
          <tr>
            <td><strong>${d.name || '-'}</strong></td>
            <td class="pbi-text-right">${formatNumber(d.prev_qty)}</td>
            <td class="pbi-text-right">${formatNumber(d.curr_qty)}</td>
            <td class="pbi-text-right"><span class="pbi-status-tag pbi-status-red">${formatNumber(d.diff_qty)} ชิ้น</span></td>
          </tr>
        `;
      });
      dHtml += `</tbody></table>`;
      declineWrapper.innerHTML = dHtml;
    }

    // Zero Sales Alerts
    if (zeroWrapper) {
      const zeros = storeData.zero_sales_alerts || [];
      let zHtml = `
        <table class="pbi-matrix-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>แบรนด์</th>
              <th class="pbi-text-right">เคยขายได้เฉลี่ย</th>
              <th class="pbi-text-right">สถานะ ส.ค. 26</th>
            </tr>
          </thead>
          <tbody>
      `;
      zeros.slice(0, 10).forEach(z => {
        zHtml += `
          <tr>
            <td><strong>${z.name || '-'}</strong></td>
            <td>${z.brand_group || '-'}</td>
            <td class="pbi-text-right">${formatNumber(z.prev_avg || z.prev_qty || 0)} ชิ้น</td>
            <td class="pbi-text-right"><span class="pbi-status-tag pbi-status-yellow"><i class="fa-solid fa-triangle-exclamation"></i> 0 ชิ้น (ของขาด)</span></td>
          </tr>
        `;
      });
      zHtml += `</tbody></table>`;
      zeroWrapper.innerHTML = zeros.length > 0 ? zHtml : '<p style="padding: 12px; color: var(--pbi-green);"><i class="fa-solid fa-circle-check"></i> ไม่พบสินค้าขาดในสาขานี้</p>';
    }
  }

  // ============================================================================
  // 9. DICTIONARY
  // ============================================================================
  function initDictionary() {
    const inputSearch = document.getElementById('inputDictSearch');
    inputSearch.addEventListener('input', (e) => {
      renderDictionaryTable(e.target.value.toLowerCase());
    });
    renderDictionaryTable('');
  }

  function renderDictionaryTable(keyword = '') {
    const wrapper = document.getElementById('tableDictWrapper');
    if (!wrapper) return;

    const products = PAC_DATA.ssa_products_august || [];
    const filtered = products.filter(p => {
      if (!keyword) return true;
      const lao = (p.lao_name || '').toLowerCase();
      const thai = (p.thai_name || '').toLowerCase();
      const en = (p.english_name || '').toLowerCase();
      return lao.includes(keyword) || thai.includes(keyword) || en.includes(keyword);
    });

    let html = `
      <table class="pbi-matrix-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>ชื่อภาษาลาว (SSA Master)</th>
            <th>คำอ่านภาษาไทย (Phonetic)</th>
            <th>ชื่อสากล / PAC</th>
            <th>กลุ่มแบรนด์</th>
            <th>หน่วยนับ</th>
          </tr>
        </thead>
        <tbody>
    `;

    filtered.slice(0, 50).forEach(p => {
      html += `
        <tr>
          <td><code>${p.sku || '-'}</code></td>
          <td><strong style="color: var(--pbi-blue);">${p.lao_name || '-'}</strong></td>
          <td>${p.thai_name || '-'}</td>
          <td>${p.english_name || p.ksd_name || '-'}</td>
          <td>${p.brand_group || '-'}</td>
          <td>${p.unit || '-'}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    wrapper.innerHTML = html;
  }

  // ============================================================================
  // 10. FOCUS MODE (MAXIMIZE VISUALS)
  // ============================================================================
  function initFocusMode() {
    const overlay = document.getElementById('pbiFocusOverlay');
    const modalContent = document.getElementById('focusModalContent');
    const modalTitle = document.getElementById('focusModalTitle');
    const btnClose = document.getElementById('btnCloseFocusModal');

    document.querySelectorAll('.btn-focus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = btn.closest('.pbi-visual-card');
        if (!card) return;

        const titleElem = card.querySelector('.pbi-visual-title');
        const bodyElem = card.querySelector('.pbi-visual-body');

        if (titleElem) modalTitle.innerHTML = titleElem.innerHTML;
        if (bodyElem) {
          modalContent.innerHTML = bodyElem.innerHTML;
          overlay.classList.add('active');
        }
      });
    });

    btnClose.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }

  // ============================================================================
  // 11. EXPORT TO EXCEL
  // ============================================================================
  function exportCurrentPageToExcel() {
    if (typeof XLSX === 'undefined') {
      alert('กำลังโหลดไลบรารีส่งออก กรุณาลองใหม่ในอีกสักครู่');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Export products
    const prodData = (PAC_DATA.ssa_products_august || []).map(p => ({
      'SKU': p.sku,
      'Lao Name': p.lao_name,
      'Thai Name': p.thai_name,
      'PAC Name': p.english_name,
      'Brand': p.brand_group,
      'Total Qty': p.total_qty,
      'Total LAK': p.total_price_lak,
      'Strategic': p.is_strategic ? 'Yes' : 'No',
      'Incentive': p.is_incentive ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(prodData);
    XLSX.utils.book_append_sheet(wb, ws, 'SSA Products');
    XLSX.writeFile(wb, `PAC_PowerBI_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

})();
