// ==============================================================================
// Pharma Alliance (PAC) - Unified Executive Sales & Incentive Dashboard Logic
// High-performance Client-side Application with Store Visit Mode & ApexCharts
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check if PAC_DATA is loaded
  if (typeof PAC_DATA === 'undefined') {
    console.error("PAC_DATA is not defined. Ensure data.js is loaded.");
    alert("ไม่พบข้อมูล PAC_DATA กรุณาตรวจสอบว่าไฟล์ data.js ถูกโหลดอย่างถูกต้อง");
    return;
  }

  // Application State
  const state = {
    theme: localStorage.getItem('pac_theme') || 'dark',
    lang: localStorage.getItem('pac_lang') || 'th',
    nameMode: localStorage.getItem('pac_name_mode') || 'real', // 'real' | 'masked'
    currentTab: 'tab-ssa',
    
    // Unified SSA State
    ssaScope: 'all',          // 'all' | 'incentive'
    ssaGroup: 'sku',          // 'sku' | 'brand'
    ssaReportMode: 'monthly',   // 'monthly' | 'ytd' | 'yearly' | 'yoy'
    ssaPeriod: '2026-08',
    ssaMetric: 'qty',         // 'qty' | 'val'
    ssaBranch: 'ALL',         // 'ALL' | 'SSA1' | 'SSA2' | ...
    
    driverLimit: 5,           // 5 | 10
    rankedSort: 'qty',        // 'qty' | 'val'
    rankedSearch: '',
    selectedHighlights: [],
    highlightSearch: '',

    searchDictQuery: '',
    searchCatalogQuery: '',
    charts: {}
  };

  // Branch Color Map
  const branchColors = {
    'SSA1': '#6366f1',
    'SSA2': '#06b6d4',
    'SSA3': '#10b981',
    'SSA5': '#f59e0b',
    'SSA6': '#ec4899',
    'SSA7': '#8b5cf6'
  };

  // Helper: Format Numbers
  const formatNum = (n, decimals = 0) => {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Number(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Helper: Format Currency
  const formatLAK = (n) => `${formatNum(n, 0)} ₭`;
  const formatTHB = (n) => `฿${formatNum(n, 2)}`;

  // Helper: Get Product Display Name (Default English!)
  const getProductName = (item) => {
    if (!item) return '';
    let rawName = '';
    if (typeof item === 'string') {
      rawName = item;
    } else {
      rawName = item.english_name || item.ksd_name || item.name || item.product_name || item.thai_name || '';
    }
    if (state.nameMode === 'masked' && PAC_DATA.blinding_map && PAC_DATA.blinding_map[rawName]) {
      return PAC_DATA.blinding_map[rawName];
    }
    return rawName;
  };

  // Helper: Get Brand Group Name
  const getBrandGroup = (item) => {
    if (!item) return 'Other';
    if (typeof item === 'object' && item.brand_group) return item.brand_group;
    const name = typeof item === 'string' ? item : (item.english_name || item.name || item.product_name || item.ksd_name || '');
    const n = name.toLowerCase();
    if (n.includes('plaivana') || n.includes('ไพลวาน่า')) return 'Plaivana';
    if (n.includes('capsika') || n.includes('แคปซิก้า')) return 'Capsika';
    if (n.includes('diabe') || n.includes('ไดอาเบ')) return 'Diabederm';
    if (n.includes('arotika') || n.includes('อโรติกา')) return 'Arotika';
    if (n.includes('clenascar') || n.includes('clena')) return 'Clenascar';
    if (n.includes('glucosa') || n.includes('กลูโคซ่า')) return 'Glucosa';
    if (n.includes('glucovia') || n.includes('กลูโคเวีย')) return 'Glucovia';
    if (n.includes('prozeus') || n.includes('precius') || n.includes('โปรซีอุส')) return 'Prozeus';
    if (n.includes('fango') || n.includes('แฟงโก')) return 'Fango';
    if (n.includes('zencera') || n.includes('เซนเซร่า')) return 'Zencera';
    if (n.includes('zertin') || n.includes('เซอร์ติน')) return 'Zertin';
    if (n.includes('anxac') || n.includes('แอนแซก')) return 'Anxac';
    if (n.includes('mucobox') || n.includes('มิวโคบ็อกซ์')) return 'Mucobox';
    if (n.includes('axamin') || n.includes('อากซามิน')) return 'Axamin';
    if (n.includes('cefalex') || n.includes('เซฟาเลก')) return 'Cefalexin';
    if (n.includes('allerlax') || n.includes('อัลเลอแร็กซ์')) return 'Allerlax';
    if (n.includes('kleniderm') || n.includes('คลีโนเดิร์ม')) return 'Kleniderm';
    if (n.includes('klenivet') || n.includes('คลีนิเวท')) return 'Klenivet';
    if (n.includes('klenigel') || n.includes('คลีนิเจล')) return 'Klenigel';
    if (n.includes('klenimed') || n.includes('คลีนิเมด')) return 'Klenimed';
    if (n.includes('icof') || n.includes('ไอค็อฟ')) return 'Icof';
    if (n.includes('noraphen') || n.includes('โนลาเฟน')) return 'Noraphen';
    if (n.includes('famotab') || n.includes('ฟาโมแทบ')) return 'Famotab';
    if (n.includes('flunarizine') || n.includes('ฟูนาริซีน')) return 'Flunarizine';
    if (n.includes('metformin') || n.includes('เมตฟอร์มิน')) return 'Metformin';
    if (n.includes('lopil') || n.includes('โลปิล')) return 'Lopil';
    if (n.includes('oflocee') || n.includes('โอฟลอซี')) return 'Oflocee';
    if (n.includes('lorita') || n.includes('โลลิต้า')) return 'Lolita';
    if (n.includes('skinfect') || n.includes('สกินเฟก')) return 'Skinfect';
    if (n.includes('spascopan') || n.includes('สปาสโคแพน')) return 'Spascopan';
    if (n.includes('sporosil') || n.includes('สปอโรซิล')) return 'Sporosil';
    if (n.includes('stugin') || n.includes('สตูจิน')) return 'Stugin';
    if (n.includes('doper') || n.includes('ดอมเพอร์')) return 'Doper-M';
    if (n.includes('gynogesic') || n.includes('ไกโนเจซิค')) return 'Gynogesic';
    if (n.includes('bismol') || n.includes('บิสมอล')) return 'G-Bismol';
    if (n.includes('zeno') || n.includes('ซีโน')) return 'Zeno';
    if (n.includes('ciprocin') || n.includes('ซิโปรซิน')) return 'Ciprocin';
    if (n.includes('zentocide') || n.includes('เซนโตไซด์')) return 'Zentocide';
    if (n.includes('tristan') || n.includes('ทริสตัน')) return 'Tristan';
    if (n.includes('nacoxib') || n.includes('นาคอกซิบ')) return 'Nacoxib';
    if (n.includes('finasteride') || n.includes('ฟีนาสเตอไรด์')) return 'Finasteride';
    if (n.includes('raqua') || n.includes('ราควา')) return 'Raqua';
    if (n.includes('sportika') || n.includes('สปอร์ตติกา')) return 'Sportika';
    if (n.includes('cleevec') || n.includes('คลีเวค')) return 'Cleevec';
    if (n.includes('cleepro') || n.includes('คลีโปร')) return 'Cleepro';
    if (n.includes('unifer') || n.includes('ยูนิเฟอร์')) return 'Unifer';
    return name.split(' ')[0] || 'Other';
  };

  // ==============================================================================
  // 1. THEME & GLOBAL CONTROLS
  // ==============================================================================
  const initTheme = () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.checked = state.theme === 'light';
      themeToggle.addEventListener('change', (e) => {
        state.theme = e.target.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('pac_theme', state.theme);
        updateAllChartsTheme();
      });
    }
  };

  const initNameMaskToggle = () => {
    const maskToggle = document.getElementById('maskToggle');
    if (maskToggle) {
      maskToggle.checked = state.nameMode === 'masked';
      maskToggle.addEventListener('change', (e) => {
        state.nameMode = e.target.checked ? 'masked' : 'real';
        localStorage.setItem('pac_name_mode', state.nameMode);
        renderCurrentTab();
      });
    }
  };

  const updateAllChartsTheme = () => {
    const isDark = state.theme === 'dark';
    Object.values(state.charts).forEach(chart => {
      if (chart && typeof chart.updateOptions === 'function') {
        chart.updateOptions({
          theme: { mode: isDark ? 'dark' : 'light' },
          chart: { foreColor: isDark ? '#94a3b8' : '#475569' }
        });
      }
    });
  };

  // ==============================================================================
  // 2. TAB NAVIGATION
  // ==============================================================================
  const initNav = () => {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
    // Apply initial tab styling and entity branding on load
    switchTab(state.currentTab);
  };

  const switchTab = (tabId) => {
    state.currentTab = tabId;

    // Update Sidebar Active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update Tab view display
    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(tabId);
    if (targetView) targetView.classList.add('active');

    // Entity & Theme Configuration per tab
    const entityConfig = {
      'tab-ssa': {
        title: 'ยอดขายร้านยา SSA (หน้าร้าน Sell-Out)',
        themeClass: 'theme-ssa',
        logo: 'assets/logo_ssa.png',
        badgeClass: 'badge-ssa',
        badgeIcon: 'fa-solid fa-store',
        badgeText: 'SSA Saysaath (ร้านยาขายปลีก)'
      },
      'tab-visit': {
        title: 'โหมดตรวจเยี่ยมสาขาร้านยา SSA (Store Visit)',
        themeClass: 'theme-ssa',
        logo: 'assets/logo_ssa.png',
        badgeClass: 'badge-ssa',
        badgeIcon: 'fa-solid fa-clipboard-check',
        badgeText: 'SSA Saysaath (ตรวจหน้าร้าน)'
      },
      'tab-whitespace': {
        title: 'ตารางโอกาสสินค้ากลยุทธ์ PAC ในร้านยา SSA',
        themeClass: 'theme-pac',
        logo: 'assets/logo_pac.png',
        badgeClass: 'badge-pac',
        badgeIcon: 'fa-solid fa-table-cells',
        badgeText: 'Pharma Alliance PAC (กลยุทธ์)'
      },
      'tab-incentive': {
        title: 'ระบบวิเคราะห์ค่าเชียร์ร้านยา SSA (16 เดือนทางการ)',
        themeClass: 'theme-ssa',
        logo: 'assets/logo_ssa.png',
        badgeClass: 'badge-ssa',
        badgeIcon: 'fa-solid fa-award',
        badgeText: 'SSA Saysaath (ค่าเชียร์ทางการ)'
      },
      'tab-ksd': {
        title: 'ยอดขาย KSD สู่ตลาด (Distributor Sell-Out) — 20 เดือน',
        themeClass: 'theme-ksd',
        logo: 'assets/logo_ksd.png',
        badgeClass: 'badge-ksd',
        badgeIcon: 'fa-solid fa-truck-fast',
        badgeText: 'KSD Pharma (ยอดขาย Sell-Out)'
      },
      'tab-strat': {
        title: 'รายการสินค้ากลยุทธ์ Pharma Alliance PAC 2026',
        themeClass: 'theme-pac',
        logo: 'assets/logo_pac.png',
        badgeClass: 'badge-pac',
        badgeIcon: 'fa-solid fa-shield-halved',
        badgeText: 'Pharma Alliance PAC (ผู้ผลิต)'
      },
      'tab-dict': {
        title: 'ตารางแปลและเทียบชื่อยา ลาว - ไทย - อังกฤษ',
        themeClass: 'theme-pac',
        logo: 'assets/logo_pac.png',
        badgeClass: 'badge-pac',
        badgeIcon: 'fa-solid fa-book-medical',
        badgeText: 'Pharma Alliance PAC (พจนานุกรม)'
      }
    };

    const cfg = entityConfig[tabId] || entityConfig['tab-ssa'];

    // Update Title in Top Header
    const titleElem = document.getElementById('pageTitleText');
    if (titleElem) titleElem.textContent = cfg.title;

    // Update Header Entity Logo
    const headerLogoImg = document.getElementById('headerLogoImg');
    if (headerLogoImg) headerLogoImg.src = cfg.logo;

    // Update Header Entity Badge
    const headerEntityBadge = document.getElementById('headerEntityBadge');
    if (headerEntityBadge) {
      headerEntityBadge.className = `badge ${cfg.badgeClass}`;
      headerEntityBadge.innerHTML = `<i class="${cfg.badgeIcon}"></i> ${cfg.badgeText}`;
    }

    // Apply Entity Theme to Main Wrapper
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      mainWrapper.classList.remove('theme-ssa', 'theme-ksd', 'theme-pac');
      mainWrapper.classList.add(cfg.themeClass);
    }

    renderCurrentTab();
  };

  const renderCurrentTab = () => {
    if (state.currentTab === 'tab-ssa') renderSSATab();
    else if (state.currentTab === 'tab-visit') renderStoreVisitTab();
    else if (state.currentTab === 'tab-whitespace') renderWhiteSpaceTab();
    else if (state.currentTab === 'tab-incentive') renderIncentiveTab();
    else if (state.currentTab === 'tab-ksd') renderKSDTab();
    else if (state.currentTab === 'tab-strat') renderStrategicTab();
    else if (state.currentTab === 'tab-dict') renderDictionaryTab();
  };

  // ==============================================================================
  // 3. TAB 1: SSA RETAIL PHARMACY OVERVIEW (SELL-OUT)
  // ==============================================================================
  const renderSSATab = () => {
    // 1. KPI Cards
    document.getElementById('kpi_ssa_units').textContent = formatNum(PAC_DATA.summary_kpis.ssa_total_units);
    document.getElementById('kpi_ssa_lak').textContent = formatLAK(PAC_DATA.summary_kpis.ssa_total_lak);
    document.getElementById('kpi_ssa_skus').textContent = `${PAC_DATA.ssa_products_august.filter(p => p.total_qty > 0).length} รายการ`;
    document.getElementById('kpi_ssa_inc').textContent = formatTHB(PAC_DATA.summary_kpis.latest_official_incentive_thb);

    // 2. Branch Comparison Chart
    renderSSABranchComparisonChart();

    // 3. Top 10 Products Chart
    renderSSATopProductsChart();

    // 4. Branch Summary Table
    renderSSABranchSummaryTable();
  };

  const renderSSABranchComparisonChart = () => {
    const chartElem = document.getElementById('chart_ssa_branch_compare');
    if (!chartElem) return;

    const branchLabels = PAC_DATA.branches.map(b => PAC_DATA.branch_names_th[b]);
    const branchQtys = PAC_DATA.branches.map(b => PAC_DATA.branch_totals_qty[b]);
    const branchLAKMillions = PAC_DATA.branches.map(b => (PAC_DATA.branch_totals_lak[b] / 1000000).toFixed(1));

    const options = {
      series: [
        { name: 'จำนวนขาย (ชิ้น)', type: 'column', data: branchQtys },
        { name: 'ยอดขาย (ล้านกีบ)', type: 'line', data: branchLAKMillions }
      ],
      chart: {
        height: 340,
        type: 'line',
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      stroke: { width: [0, 3], curve: 'smooth' },
      colors: ['#009944', '#06b6d4'],
      plotOptions: {
        bar: { columnWidth: '45%', borderRadius: 6 }
      },
      dataLabels: { enabled: false },
      labels: branchLabels,
      yaxis: [
        {
          title: { text: 'จำนวนขาย (ชิ้น)' },
          labels: { formatter: (val) => formatNum(val) }
        },
        {
          opposite: true,
          title: { text: 'ยอดขาย (ล้านกีบ)' },
          labels: { formatter: (val) => `${val}M ₭` }
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        theme: state.theme
      }
    };

    if (state.charts['chart_ssa_branch_compare']) {
      state.charts['chart_ssa_branch_compare'].destroy();
    }
    state.charts['chart_ssa_branch_compare'] = new ApexCharts(chartElem, options);
    state.charts['chart_ssa_branch_compare'].render();
  };

  const renderSSATopProductsChart = () => {
    const chartElem = document.getElementById('chart_ssa_top_products');
    if (!chartElem) return;

    const topItems = [...PAC_DATA.ssa_products_august]
      .filter(p => p.total_qty > 0)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 10);

    const names = topItems.map(p => getProductName(p.thai_name || p.ksd_name || p.lao_name));
    const qtys = topItems.map(p => p.total_qty);

    const options = {
      series: [{ name: 'จำนวนขาย (ชิ้น)', data: qtys }],
      chart: {
        type: 'bar',
        height: 340,
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          barHeight: '65%'
        }
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
      tooltip: { theme: state.theme }
    };

    if (state.charts['chart_ssa_top_products']) {
      state.charts['chart_ssa_top_products'].destroy();
    }
    state.charts['chart_ssa_top_products'] = new ApexCharts(chartElem, options);
    state.charts['chart_ssa_top_products'].render();
  };

  const renderSSABranchSummaryTable = () => {
    const tbody = document.getElementById('tbody_ssa_branch_summary');
    if (!tbody) return;

    tbody.innerHTML = '';
    const sortedBranches = [...PAC_DATA.branches].sort((a, b) => PAC_DATA.branch_totals_lak[b] - PAC_DATA.branch_totals_lak[a]);

    sortedBranches.forEach((b, idx) => {
      const tr = document.createElement('tr');
      const share = ((PAC_DATA.branch_totals_lak[b] / PAC_DATA.summary_kpis.ssa_total_lak) * 100).toFixed(1);

      tr.innerHTML = `
        <td><div class="rank-circle ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''}">${idx + 1}</div></td>
        <td><strong>${PAC_DATA.branch_names_th[b]}</strong> (${b})</td>
        <td style="color: ${branchColors[b]}; font-weight: 700;">${formatNum(PAC_DATA.branch_totals_qty[b])}</td>
        <td style="font-weight: 700;">${formatLAK(PAC_DATA.branch_totals_lak[b])}</td>
        <td><span class="badge badge-primary">${share}%</span></td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 10px; font-size: 11px;" onclick="window.inspectStoreBranch('${b}')">
            <i class="fa-solid fa-arrow-right"></i> ตรวจเยี่ยมสาขานี้
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  };

  // ==============================================================================
  // 4. TAB 2: STORE VISIT DEEP-DIVE MODE
  // ==============================================================================
  window.inspectStoreBranch = (branchId) => {
    state.selectedBranch = branchId;
    const selectElem = document.getElementById('visitBranchSelect');
    if (selectElem) selectElem.value = branchId;
    switchTab('tab-visit');
  };

  const renderStoreVisitTab = () => {
    const b = state.selectedBranch;
    const visitData = PAC_DATA.store_visit_data[b];
    if (!visitData) return;

    // 1. Briefing Banner
    document.getElementById('visit_branch_name').textContent = `${visitData.branch_name_th} (${b})`;
    document.getElementById('visit_pill_units').textContent = formatNum(visitData.total_qty_aug);
    document.getElementById('visit_pill_lak').textContent = formatLAK(visitData.total_lak_aug);
    document.getElementById('visit_pill_active_skus').textContent = visitData.ranked_by_qty.length;

    const branchRanks = [...PAC_DATA.branches].sort((x, y) => PAC_DATA.branch_totals_lak[y] - PAC_DATA.branch_totals_lak[x]);
    const myRank = branchRanks.indexOf(b) + 1;
    document.getElementById('visit_pill_rank').textContent = `#${myRank} จาก 6 สาขา`;

    // 2. Top 10 Growth (MoM July 26 -> August 26)
    const growthList = document.getElementById('visit_growth_list');
    growthList.innerHTML = '';
    if (visitData.top_growth.length === 0) {
      growthList.innerHTML = '<div style="padding: 16px; color: var(--text-muted); text-align: center;">ไม่พบรายการที่มีการเติบโตเด่นชัด</div>';
    } else {
      visitData.top_growth.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'change-item';
        div.innerHTML = `
          <div>
            <div class="change-item-title">${i + 1}. ${getProductName(item.product_name)}</div>
            <div class="change-item-sub">ก.ค.: ${formatNum(item.qty_jul)} ชิ้น ➔ ส.ค.: ${formatNum(item.qty_aug)} ชิ้น</div>
          </div>
          <div class="diff-badge up">
            <i class="fa-solid fa-arrow-trend-up"></i> +${formatNum(item.diff)} (${item.pct_change > 0 ? '+' : ''}${item.pct_change.toFixed(0)}%)
          </div>
        `;
        growthList.appendChild(div);
      });
    }

    // 3. Top 10 Decline (MoM July 26 -> August 26)
    const declineList = document.getElementById('visit_decline_list');
    declineList.innerHTML = '';
    if (visitData.top_decline.length === 0) {
      declineList.innerHTML = '<div style="padding: 16px; color: var(--text-muted); text-align: center;">ไม่มีสินค้ายอดตกในสาขานี้</div>';
    } else {
      visitData.top_decline.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'change-item';
        div.innerHTML = `
          <div>
            <div class="change-item-title">${i + 1}. ${getProductName(item.product_name)}</div>
            <div class="change-item-sub">ก.ค.: ${formatNum(item.qty_jul)} ชิ้น ➔ ส.ค.: ${formatNum(item.qty_aug)} ชิ้น</div>
          </div>
          <div class="diff-badge down">
            <i class="fa-solid fa-arrow-trend-down"></i> ${formatNum(item.diff)} (${item.pct_change.toFixed(0)}%)
          </div>
        `;
        declineList.appendChild(div);
      });
    }

    // 4. Zero-Sales Alert
    const zeroList = document.getElementById('visit_zero_list');
    zeroList.innerHTML = '';
    if (visitData.zero_sales.length === 0) {
      zeroList.innerHTML = '<span style="color: var(--accent-emerald); font-weight: 500;"><i class="fa-solid fa-circle-check"></i> ยอดเยี่ยม! ไม่มีสินค้าค่าเชียร์ที่หลุดสต็อกเป็น 0 ชิ้น</span>';
    } else {
      visitData.zero_sales.forEach(item => {
        const span = document.createElement('span');
        span.className = 'badge badge-rose';
        span.style.padding = '6px 12px';
        span.style.fontSize = '12px';
        span.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${getProductName(item.product_name)} (ก.ค. เคยขายได้ ${item.qty_jul} ชิ้น)`;
        zeroList.appendChild(span);
      });
    }

    // 5. Full Ranked Products Table
    renderStoreVisitRankingTable(visitData);
  };

  const renderStoreVisitRankingTable = (visitData) => {
    const tbody = document.getElementById('tbody_visit_ranked_products');
    if (!tbody) return;

    tbody.innerHTML = '';
    const items = state.visitSortBy === 'price' ? visitData.ranked_by_price : visitData.ranked_by_qty;

    items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      const stratBadge = item.is_strategic 
        ? '<span class="badge badge-primary"><i class="fa-solid fa-star"></i> Strategic</span>' 
        : '<span class="badge" style="background: rgba(148,163,184,0.1); color: var(--text-muted);">General</span>';

      tr.innerHTML = `
        <td><div class="rank-circle ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''}">${idx + 1}</div></td>
        <td><code>${item.sku}</code></td>
        <td>
          <div style="font-weight: 600;">${getProductName(item.thai_name || item.ksd_name)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${item.lao_name}</div>
        </td>
        <td>${stratBadge}</td>
        <td style="font-weight: 700; color: var(--accent-primary);">${formatNum(item.qty)}</td>
        <td style="font-weight: 700;">${formatLAK(item.price_lak)}</td>
      `;
      tbody.appendChild(tr);
    });
  };

  // Branch selector listener
  const visitSelect = document.getElementById('visitBranchSelect');
  if (visitSelect) {
    visitSelect.addEventListener('change', (e) => {
      state.selectedBranch = e.target.value;
      renderStoreVisitTab();
    });
  }

  // Visit Table Sort Toggle
  const visitSortQty = document.getElementById('visitSortQty');
  const visitSortPrice = document.getElementById('visitSortPrice');
  if (visitSortQty && visitSortPrice) {
    visitSortQty.addEventListener('click', () => {
      state.visitSortBy = 'qty';
      visitSortQty.classList.add('active');
      visitSortPrice.classList.remove('active');
      renderStoreVisitTab();
    });
    visitSortPrice.addEventListener('click', () => {
      state.visitSortBy = 'price';
      visitSortPrice.classList.add('active');
      visitSortQty.classList.remove('active');
      renderStoreVisitTab();
    });
  }

  // ==============================================================================
  // 5. TAB 3: STRATEGIC WHITE-SPACE MATRIX
  // ==============================================================================
  const renderWhiteSpaceTab = () => {
    const tbody = document.getElementById('tbody_whitespace_matrix');
    if (!tbody) return;

    tbody.innerHTML = '';
    const query = (state.searchCatalogQuery || '').toLowerCase();

    const filtered = PAC_DATA.white_space_matrix.filter(item => {
      if (!query) return true;
      return (
        item.sku.toLowerCase().includes(query) ||
        item.thai_name.toLowerCase().includes(query) ||
        item.ksd_name.toLowerCase().includes(query)
      );
    });

    filtered.forEach((item, idx) => {
      const tr = document.createElement('tr');
      let branchCells = '';

      PAC_DATA.branches.forEach(b => {
        const q = item.branches[b] || 0;
        if (q > 0) {
          branchCells += `<td class="matrix-cell matrix-active"><i class="fa-solid fa-check"></i> ${formatNum(q)}</td>`;
        } else {
          branchCells += `<td class="matrix-cell matrix-empty"><i class="fa-solid fa-xmark"></i> ขาด</td>`;
        }
      });

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>${item.sku}</code></td>
        <td>
          <div style="font-weight: 600;">${getProductName(item.thai_name || item.ksd_name)}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${item.ksd_name}</div>
        </td>
        <td><span class="badge badge-primary">${item.classification || 'Strategic'}</span></td>
        <td style="font-weight: 700;">${formatNum(item.total_qty)}</td>
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

  // ==============================================================================
  // 6. TAB 4: INCENTIVE SYSTEM (MONTHLY / YTD / YEARLY / YOY)
  // ==============================================================================
  const initIncentiveControls = () => {
    // 1. Report Type Buttons (Monthly / YTD / Yearly / YoY)
    const reportButtons = document.querySelectorAll('#incReportTypeSelector .pill-option');
    reportButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        reportButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.incReportType = btn.getAttribute('data-report');
        updateIncentivePeriodDropdown();
        renderIncentiveTab();
      });
    });

    // 2. Period Dropdown Change
    const periodSelect = document.getElementById('incPeriodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        state.incSelectedPeriod = e.target.value;
        renderIncentiveTab();
      });
    }

    // 3. Metric Toggle (THB vs Qty)
    const incMetricThb = document.getElementById('incMetricThb');
    const incMetricQty = document.getElementById('incMetricQty');
    if (incMetricThb && incMetricQty) {
      incMetricThb.addEventListener('click', () => {
        state.incMetric = 'thb';
        incMetricThb.classList.add('active');
        incMetricQty.classList.remove('active');
        renderIncentiveTab();
      });
      incMetricQty.addEventListener('click', () => {
        state.incMetric = 'qty';
        incMetricQty.classList.add('active');
        incMetricThb.classList.remove('active');
        renderIncentiveTab();
      });
    }

    updateIncentivePeriodDropdown();
  };

  const updateIncentivePeriodDropdown = () => {
    const select = document.getElementById('incPeriodSelect');
    if (!select) return;

    select.innerHTML = '';
    const rType = state.incReportType;

    if (rType === 'monthly') {
      // List all 16 official months descending (Jul 2026 down to Apr 2025)
      const revMonths = [...PAC_DATA.historical_incentives].reverse();
      revMonths.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.date_key;
        opt.textContent = `เดือน ${m.date_key} (ทางการ)`;
        if (m.date_key === state.incSelectedPeriod) opt.selected = true;
        select.appendChild(opt);
      });
      if (!state.incSelectedPeriod || !state.incSelectedPeriod.includes('-')) {
        state.incSelectedPeriod = '2026-07';
        select.value = '2026-07';
      }
    } else if (rType === 'ytd') {
      // YTD options
      const opt26 = document.createElement('option');
      opt26.value = '2026-YTD';
      opt26.textContent = 'ปี 2026 (YTD ม.ค. - ก.ค.)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025-YTD';
      opt25.textContent = 'ปี 2025 (YTD เม.ย. - ธ.ค.)';
      select.appendChild(opt25);

      state.incSelectedPeriod = '2026-YTD';
    } else if (rType === 'yearly') {
      const opt26 = document.createElement('option');
      opt26.value = '2026';
      opt26.textContent = 'ปี 2026 (สรุปรายปี 7 เดือน)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025';
      opt25.textContent = 'ปี 2025 (สรุปรายปี 9 เดือน)';
      select.appendChild(opt25);

      state.incSelectedPeriod = '2026';
    } else if (rType === 'yoy') {
      // Comparable months: Apr, May, Jun, Jul (Both 2025 and 2026 exist officially)
      const yoyPairs = [
        { key: '07', label: 'กรกฎาคม (Jul 2026 vs Jul 2025)' },
        { key: '06', label: 'มิถุนายน (Jun 2026 vs Jun 2025)' },
        { key: '05', label: 'พฤษภาคม (May 2026 vs May 2025)' },
        { key: '04', label: 'เมษายน (Apr 2026 vs Apr 2025)' },
      ];
      yoyPairs.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.key;
        opt.textContent = p.label;
        if (p.key === '07') opt.selected = true;
        select.appendChild(opt);
      });
      state.incSelectedPeriod = '07';
    }
  };

  const renderIncentiveTab = () => {
    renderIncentiveTrendChart();
    renderDynamicIncentiveTable();
  };

  const renderIncentiveTrendChart = () => {
    const chartElem = document.getElementById('chart_incentive_trend');
    if (!chartElem) return;

    const labels = PAC_DATA.historical_incentives.map(m => m.date_key);
    const thbData = PAC_DATA.historical_incentives.map(m => m.total_incentive);
    const qtyData = PAC_DATA.historical_incentives.map(m => m.total_qty);

    const isQty = state.incMetric === 'qty';

    const options = {
      series: [
        {
          name: isQty ? 'จำนวนชิ้นค่าเชียร์' : 'ยอดค่าเชียร์ (บาท)',
          data: isQty ? qtyData : thbData
        }
      ],
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      colors: [isQty ? '#06b6d4' : '#009944'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      dataLabels: { enabled: false },
      xaxis: { categories: labels },
      yaxis: {
        labels: {
          formatter: (val) => isQty ? formatNum(val) : formatTHB(val)
        }
      },
      tooltip: { theme: state.theme }
    };

    if (state.charts['chart_incentive_trend']) {
      state.charts['chart_incentive_trend'].destroy();
    }
    state.charts['chart_incentive_trend'] = new ApexCharts(chartElem, options);
    state.charts['chart_incentive_trend'].render();
  };

  const renderDynamicIncentiveTable = () => {
    const thead = document.getElementById('thead_incentive_history');
    const tbody = document.getElementById('tbody_incentive_history');
    const tableTitle = document.getElementById('inc_table_title');
    if (!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const mode = state.incReportType;
    const isQty = state.incMetric === 'qty';

    if (mode === 'monthly') {
      const selectedMonth = state.incSelectedPeriod || '2026-07';
      tableTitle.innerHTML = `<i class="fa-solid fa-calendar-check"></i> รายงานค่าเชียร์รายเดือน: <strong>${selectedMonth}</strong> (${isQty ? 'จำนวนชิ้น' : 'ยอดเงิน บาท'})`;

      thead.innerHTML = `
        <tr>
          <th>ลำดับ</th>
          <th>ชื่อสินค้า</th>
          <th>ราคาค่าเชียร์</th>
          <th style="text-align: center;">SSA 1</th>
          <th style="text-align: center;">SSA 2</th>
          <th style="text-align: center;">SSA 3</th>
          <th style="text-align: center;">SSA 5</th>
          <th style="text-align: center;">SSA 6</th>
          <th style="text-align: center;">SSA 7</th>
          <th style="text-align: right;">รวม (ชิ้น)</th>
          <th style="text-align: right;">ค่าเชียร์รวม (บาท)</th>
        </tr>
      `;

      const mData = PAC_DATA.historical_incentives.find(m => m.date_key === selectedMonth);
      if (mData && mData.products) {
        mData.products.forEach((p, idx) => {
          const tr = document.createElement('tr');
          let branchCols = '';
          PAC_DATA.branches.forEach(b => {
            const val = p.branches[b] || 0;
            const disp = isQty ? formatNum(val) : formatNum(val * p.incentive_price);
            branchCols += `<td style="text-align: center;">${val > 0 ? disp : '-'}</td>`;
          });

          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong>${getProductName(p.product_name)}</strong></td>
            <td>${formatNum(p.incentive_price)} ฿</td>
            ${branchCols}
            <td style="text-align: right; font-weight: 700; color: var(--accent-secondary);">${formatNum(p.total_qty)}</td>
            <td style="text-align: right; font-weight: 700; color: var(--accent-primary);">${formatTHB(p.total_incentive)}</td>
          `;
          tbody.appendChild(tr);
        });

        // Summary row
        const trSum = document.createElement('tr');
        trSum.style.background = 'rgba(99, 102, 241, 0.1)';
        trSum.style.fontWeight = '700';
        let branchTotals = '';
        PAC_DATA.branches.forEach(b => {
          const totB = mData.branch_qtys ? mData.branch_qtys[b] : 0;
          const totBInc = mData.branch_incentives ? mData.branch_incentives[b] : 0;
          branchTotals += `<td style="text-align: center;">${isQty ? formatNum(totB) : formatNum(totBInc)}</td>`;
        });

        trSum.innerHTML = `
          <td colspan="3" style="text-align: right;">รวมทั้งสิ้น:</td>
          ${branchTotals}
          <td style="text-align: right; color: var(--accent-secondary);">${formatNum(mData.total_qty)}</td>
          <td style="text-align: right; color: var(--accent-primary);">${formatTHB(mData.total_incentive)}</td>
        `;
        tbody.appendChild(trSum);
      }
    } else if (mode === 'ytd' || mode === 'yearly') {
      const year = state.incSelectedPeriod.startsWith('2025') ? 2025 : 2026;
      tableTitle.innerHTML = `<i class="fa-solid fa-chart-line"></i> รายงานค่าเชียร์ ${mode === 'ytd' ? 'สะสมต้นปี (YTD)' : 'สรุปรายปี'}: ปี <strong>${year}</strong>`;

      thead.innerHTML = `
        <tr>
          <th>เดือน</th>
          <th>จำนวนสินค้า</th>
          <th>SSA 1</th>
          <th>SSA 2</th>
          <th>SSA 3</th>
          <th>SSA 5</th>
          <th>SSA 6</th>
          <th>SSA 7</th>
          <th style="text-align: right;">รวม (ชิ้น)</th>
          <th style="text-align: right;">ค่าเชียร์รวม (บาท)</th>
        </tr>
      `;

      const yearMonths = PAC_DATA.historical_incentives.filter(m => m.year === year);
      let runQty = 0;
      let runInc = 0;

      yearMonths.forEach(m => {
        runQty += m.total_qty;
        runInc += m.total_incentive;

        const tr = document.createElement('tr');
        let branchCols = '';
        PAC_DATA.branches.forEach(b => {
          const q = m.branch_qtys ? m.branch_qtys[b] : 0;
          const inc = m.branch_incentives ? m.branch_incentives[b] : 0;
          branchCols += `<td style="text-align: center;">${isQty ? formatNum(q) : formatNum(inc)}</td>`;
        });

        tr.innerHTML = `
          <td><strong>${m.date_key}</strong></td>
          <td>${m.products.length} รายการ</td>
          ${branchCols}
          <td style="text-align: right; font-weight: 700; color: var(--accent-secondary);">${formatNum(m.total_qty)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--accent-primary);">${formatTHB(m.total_incentive)}</td>
        `;
        tbody.appendChild(tr);
      });

      // Total row
      const trTot = document.createElement('tr');
      trTot.style.background = 'rgba(99, 102, 241, 0.15)';
      trTot.style.fontWeight = '700';
      trTot.innerHTML = `
        <td colspan="8" style="text-align: right;">ยอดรวมสะสม ${year}:</td>
        <td style="text-align: right; color: var(--accent-secondary);">${formatNum(runQty)}</td>
        <td style="text-align: right; color: var(--accent-primary);">${formatTHB(runInc)}</td>
      `;
      tbody.appendChild(trTot);

    } else if (mode === 'yoy') {
      const mKey = state.incSelectedPeriod || '07';
      const m26 = PAC_DATA.historical_incentives.find(m => m.date_key === `2026-${mKey}`);
      const m25 = PAC_DATA.historical_incentives.find(m => m.date_key === `2025-${mKey}`);

      tableTitle.innerHTML = `<i class="fa-solid fa-scale-balanced"></i> เปรียบเทียบปี (YoY): เดือน <strong>${mKey} (2026 vs 2025)</strong>`;

      thead.innerHTML = `
        <tr>
          <th>ตัวชี้วัด (Metric)</th>
          <th style="text-align: right;">ปี 2025 (เดิม)</th>
          <th style="text-align: right;">ปี 2026 (ปัจจุบัน)</th>
          <th style="text-align: right;">ผลต่าง (Diff)</th>
          <th style="text-align: right;">อัตราการเติบโต (% Growth)</th>
        </tr>
      `;

      const q25 = m25 ? m25.total_qty : 0;
      const q26 = m26 ? m26.total_qty : 0;
      const diffQ = q26 - q25;
      const pctQ = q25 > 0 ? ((diffQ / q25) * 100).toFixed(1) : '100.0';

      const inc25 = m25 ? m25.total_incentive : 0;
      const inc26 = m26 ? m26.total_incentive : 0;
      const diffInc = inc26 - inc25;
      const pctInc = inc25 > 0 ? ((diffInc / inc25) * 100).toFixed(1) : '100.0';

      tbody.innerHTML = `
        <tr>
          <td><strong>จำนวนชิ้นรวม (Units)</strong></td>
          <td style="text-align: right;">${formatNum(q25)} ชิ้น</td>
          <td style="text-align: right; font-weight: 700; color: var(--accent-secondary);">${formatNum(q26)} ชิ้น</td>
          <td style="text-align: right; font-weight: 700; color: ${diffQ >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${diffQ >= 0 ? '+' : ''}${formatNum(diffQ)}</td>
          <td style="text-align: right;"><span class="diff-badge ${diffQ >= 0 ? 'up' : 'down'}">${diffQ >= 0 ? '+' : ''}${pctQ}%</span></td>
        </tr>
        <tr>
          <td><strong>ยอดเงินค่าเชียร์รวม (THB)</strong></td>
          <td style="text-align: right;">${formatTHB(inc25)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--accent-primary);">${formatTHB(inc26)}</td>
          <td style="text-align: right; font-weight: 700; color: ${diffInc >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${diffInc >= 0 ? '+' : ''}${formatTHB(diffInc)}</td>
          <td style="text-align: right;"><span class="diff-badge ${diffInc >= 0 ? 'up' : 'down'}">${diffInc >= 0 ? '+' : ''}${pctInc}%</span></td>
        </tr>
      `;

      // Branch level comparison
      PAC_DATA.branches.forEach(b => {
        const bq25 = m25 && m25.branch_qtys ? m25.branch_qtys[b] : 0;
        const bq26 = m26 && m26.branch_qtys ? m26.branch_qtys[b] : 0;
        const bdiff = bq26 - bq25;
        const bpct = bq25 > 0 ? ((bdiff / bq25) * 100).toFixed(1) : '100.0';

        const trB = document.createElement('tr');
        trB.innerHTML = `
          <td>สาขา ${PAC_DATA.branch_names_th[b]} (${b})</td>
          <td style="text-align: right;">${formatNum(bq25)} ชิ้น</td>
          <td style="text-align: right; font-weight: 600;">${formatNum(bq26)} ชิ้น</td>
          <td style="text-align: right; color: ${bdiff >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${bdiff >= 0 ? '+' : ''}${formatNum(bdiff)}</td>
          <td style="text-align: right;"><span class="diff-badge ${bdiff >= 0 ? 'up' : 'down'}">${bdiff >= 0 ? '+' : ''}${bpct}%</span></td>
        `;
        tbody.appendChild(trB);
      });
    }
  };

  // ==============================================================================
  // 7. TAB 5: KSD DISTRIBUTOR SALES (SELL-IN)
  // ==============================================================================
  // 7. TAB 5: KSD DISTRIBUTOR SALES (SELL-OUT)
  // ==============================================================================
  const renderKSDTab = () => {
    // 1. Calculate Summary Metrics from 20-Month History
    const history = PAC_DATA.ksd_monthly_history || [];
    const months2026 = history.filter(m => m.year === 2026);
    const months2025 = history.filter(m => m.year === 2025);

    const tot2026 = months2026.reduce((acc, m) => acc + m.total_sellout_bath, 0);
    const tot2025 = months2025.reduce((acc, m) => acc + m.total_sellout_bath, 0);

    const ret2026 = months2026.reduce((acc, m) => acc + m.retail_ssa_bath, 0);
    const ws2026 = months2026.reduce((acc, m) => acc + m.wholesale_bath, 0);
    const wsSharePct = tot2026 > 0 ? ((ws2026 / tot2026) * 100).toFixed(1) : '0.0';
    const retSharePct = tot2026 > 0 ? ((ret2026 / tot2026) * 100).toFixed(1) : '0.0';

    const kpi2026El = document.getElementById('kpi_ksd_2026_total');
    if (kpi2026El) kpi2026El.textContent = formatTHB(tot2026);

    const kpi2025El = document.getElementById('kpi_ksd_2025_total');
    if (kpi2025El) kpi2025El.textContent = formatTHB(tot2025);

    const kpiWsShareEl = document.getElementById('kpi_ksd_ws_share');
    if (kpiWsShareEl) kpiWsShareEl.textContent = `${wsSharePct}% / ${retSharePct}%`;

    const kpiPacRevEl = document.getElementById('kpi_ksd_pac_rev');
    if (kpiPacRevEl) kpiPacRevEl.textContent = formatTHB(PAC_DATA.summary_kpis.ksd_pac_revenue_thb);

    const kpiPacTxEl = document.getElementById('kpi_ksd_pac_tx');
    if (kpiPacTxEl) kpiPacTxEl.textContent = `${formatNum(PAC_DATA.summary_kpis.ksd_pac_transactions)} บิล`;

    // 2. Render Charts
    renderKSDMonthlyTrendChart();
    renderKSDChannelsChart();
    renderKSDProvincesChart();
    renderKSDTeamDonutChart();
    renderKSDDailyTrendChart();
    renderKSDSalespersonTable();
  };

  const renderKSDMonthlyTrendChart = () => {
    const chartElem = document.getElementById('chart_ksd_monthly_trend');
    if (!chartElem) return;

    const history = PAC_DATA.ksd_monthly_history || [];
    const labels = history.map(m => m.date_key);
    const wsData = history.map(m => Math.round(m.wholesale_bath));
    const retData = history.map(m => Math.round(m.retail_ssa_bath));
    const totalData = history.map(m => Math.round(m.total_sellout_bath));

    const options = {
      series: [
        { name: 'Wholesale (ยี่ปั๊ว / รพ. / คลินิก)', type: 'column', data: wsData },
        { name: 'Retail (ร้านยา SSA)', type: 'column', data: retData },
        { name: 'KSD Sell-Out รวมทั้งหมด', type: 'line', data: totalData }
      ],
      chart: {
        height: 360,
        type: 'line',
        stacked: false,
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      plotOptions: {
        bar: { columnWidth: '50%', borderRadius: 4 }
      },
      stroke: { width: [0, 0, 3], curve: 'smooth' },
      colors: ['#7e1957', '#009944', '#f59e0b'],
      dataLabels: { enabled: false },
      xaxis: { categories: labels },
      yaxis: {
        labels: { formatter: (val) => formatTHB(val) }
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: state.theme,
        y: { formatter: (val) => formatTHB(val) }
      }
    };

    if (state.charts['chart_ksd_monthly_trend']) {
      state.charts['chart_ksd_monthly_trend'].destroy();
    }
    state.charts['chart_ksd_monthly_trend'] = new ApexCharts(chartElem, options);
    state.charts['chart_ksd_monthly_trend'].render();
  };

  const renderKSDChannelsChart = () => {
    const chartElem = document.getElementById('chart_ksd_channel_compare');
    if (!chartElem) return;

    const channels = (PAC_DATA.ksd_channels_2026 || []).slice(0, 8);
    const names = channels.map(c => c.channel);
    const values = channels.map(c => Math.round(c.total_bath));

    const options = {
      series: [{ name: 'ยอดขายออก (บาท)', data: values }],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: true, barHeight: '65%' }
      },
      colors: ['#7e1957'],
      dataLabels: {
        enabled: true,
        formatter: (val) => formatTHB(val)
      },
      xaxis: {
        categories: names,
        labels: { formatter: (val) => formatTHB(val) }
      },
      tooltip: {
        theme: state.theme,
        y: { formatter: (val) => formatTHB(val) }
      }
    };

    if (state.charts['chart_ksd_channel_compare']) {
      state.charts['chart_ksd_channel_compare'].destroy();
    }
    state.charts['chart_ksd_channel_compare'] = new ApexCharts(chartElem, options);
    state.charts['chart_ksd_channel_compare'].render();
  };

  const renderKSDProvincesChart = () => {
    const chartElem = document.getElementById('chart_ksd_provinces_rank');
    if (!chartElem) return;

    const provs = (PAC_DATA.ksd_provinces || []).slice(0, 8);
    const names = provs.map(p => p.province);
    const val26 = provs.map(p => Math.round(p.val_2026_jul));
    const val25 = provs.map(p => Math.round(p.val_2025_jul));

    const options = {
      series: [
        { name: 'ปี 2026 (YTD ก.ค.)', data: val26 },
        { name: 'ปี 2025 (YTD ก.ค.)', data: val25 }
      ],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: true, barHeight: '70%' }
      },
      colors: ['#7e1957', '#94a3b8'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: names,
        labels: { formatter: (val) => formatTHB(val) }
      },
      tooltip: {
        shared: true,
        theme: state.theme,
        y: { formatter: (val) => formatTHB(val) }
      }
    };

    if (state.charts['chart_ksd_provinces_rank']) {
      state.charts['chart_ksd_provinces_rank'].destroy();
    }
    state.charts['chart_ksd_provinces_rank'] = new ApexCharts(chartElem, options);
    state.charts['chart_ksd_provinces_rank'].render();
  };

  const renderKSDTeamDonutChart = () => {
    const chartElem = document.getElementById('chart_ksd_team_donut');
    if (!chartElem) return;

    const teams = PAC_DATA.ksd_by_team.map(t => t.sales_team);
    const values = PAC_DATA.ksd_by_team.map(t => t.total_bath);

    const options = {
      series: values,
      chart: {
        type: 'donut',
        height: 320,
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      labels: teams,
      colors: ['#7e1957', '#9c276a', '#0f4c3a', '#d946ef', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      dataLabels: { enabled: false },
      legend: { position: 'bottom' },
      tooltip: {
        y: { formatter: (val) => formatTHB(val) },
        theme: state.theme
      }
    };

    if (state.charts['chart_ksd_team_donut']) {
      state.charts['chart_ksd_team_donut'].destroy();
    }
    state.charts['chart_ksd_team_donut'] = new ApexCharts(chartElem, options);
    state.charts['chart_ksd_team_donut'].render();
  };

  const renderKSDDailyTrendChart = () => {
    const chartElem = document.getElementById('chart_ksd_daily');
    if (!chartElem) return;

    const dates = PAC_DATA.ksd_daily_trend.map(d => d.date.split('-')[2]);
    const values = PAC_DATA.ksd_daily_trend.map(d => d.bath);

    const options = {
      series: [{ name: 'ยอดขายรายวัน (บาท)', data: values }],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
      },
      plotOptions: {
        bar: { borderRadius: 4, columnWidth: '55%' }
      },
      colors: ['#7e1957'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: dates,
        title: { text: 'วันที่ในเดือนสิงหาคม 2026' }
      },
      yaxis: {
        labels: { formatter: (val) => formatTHB(val) }
      },
      tooltip: { theme: state.theme }
    };

    if (state.charts['chart_ksd_daily']) {
      state.charts['chart_ksd_daily'].destroy();
    }
    state.charts['chart_ksd_daily'] = new ApexCharts(chartElem, options);
    state.charts['chart_ksd_daily'].render();
  };

  const renderKSDSalespersonTable = () => {
    const tbody = document.getElementById('tbody_ksd_salespersons');
    if (!tbody) return;

    tbody.innerHTML = '';
    PAC_DATA.ksd_by_salesperson.forEach((sp, idx) => {
      const tr = document.createElement('tr');
      const topP = sp.top_products.map(p => p.name.split(' ')[0]).join(', ');

      tr.innerHTML = `
        <td><div class="rank-circle ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''}">${idx + 1}</div></td>
        <td><strong>${sp.salesperson}</strong></td>
        <td><span class="badge badge-primary">${sp.team}</span></td>
        <td>${sp.orders_count} บิล</td>
        <td>${formatNum(sp.total_qty)} ชิ้น</td>
        <td style="font-weight: 700; color: var(--accent-emerald);">${formatTHB(sp.total_bath)}</td>
        <td style="font-size: 11px; color: var(--text-muted);">${topP || 'N/A'}</td>
      `;
      tbody.appendChild(tr);
    });
  };

  // ==============================================================================
  // 8. TAB 6: PAC STRATEGIC PRODUCTS 2026
  // ==============================================================================
  const renderStrategicTab = () => {
    const tbody = document.getElementById('tbody_strategic_catalog');
    if (!tbody) return;

    tbody.innerHTML = '';
    PAC_DATA.strategic_catalog.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.no}</td>
        <td><strong>${getProductName(item.name)}</strong></td>
        <td style="color: var(--text-muted);">${item.actives || '-'}</td>
        <td>${item.size || '-'}</td>
        <td><span class="badge badge-primary">${item.classification}</span></td>
      `;
      tbody.appendChild(tr);
    });
  };

  // ==============================================================================
  // 9. TAB 7: LAO - THAI - ENGLISH DICTIONARY & EXPLORER
  // ==============================================================================
  const renderDictionaryTab = () => {
    const tbody = document.getElementById('tbody_dict_explorer');
    if (!tbody) return;

    tbody.innerHTML = '';
    const q = (state.searchDictQuery || '').toLowerCase();

    const filtered = PAC_DATA.ssa_products_august.filter(item => {
      if (!q) return true;
      return (
        item.sku.toLowerCase().includes(q) ||
        item.lao_name.toLowerCase().includes(q) ||
        item.thai_name.toLowerCase().includes(q) ||
        item.ksd_name.toLowerCase().includes(q)
      );
    });

    filtered.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>${item.sku}</code></td>
        <td style="font-weight: 600; color: var(--accent-secondary);">${item.lao_name}</td>
        <td style="font-weight: 600; color: var(--accent-emerald);">${item.thai_name}</td>
        <td style="color: var(--text-primary);">${item.ksd_name || '-'}</td>
        <td>${formatNum(item.total_qty)}</td>
        <td>${formatLAK(item.total_price_lak)}</td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('dict_count_badge').textContent = `แสดง ${filtered.length} จากทั้งหมด ${PAC_DATA.ssa_products_august.length} รายการ (กรองของแถม Free ออกแล้ว)`;
  };

  const dictSearchInput = document.getElementById('dictSearchInput');
  if (dictSearchInput) {
    dictSearchInput.addEventListener('input', (e) => {
      state.searchDictQuery = e.target.value;
      renderDictionaryTab();
    });
  }

  // ==============================================================================
  // 10. IMPORT DATA MODAL LOGIC
  // ==============================================================================
  const initImportModal = () => {
    const btnOpen = document.getElementById('btnOpenImportModal');
    const modal = document.getElementById('importModal');
    const btnClose = document.getElementById('btnCloseImportModal');
    const btnCancel = document.getElementById('btnCancelImport');
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('importStatus');
    const btnProcess = document.getElementById('btnProcessImport');

    if (!modal) return;

    btnOpen.addEventListener('click', () => {
      modal.classList.add('open');
      statusDiv.style.display = 'none';
      statusDiv.textContent = '';
    });

    const closeModal = () => modal.classList.remove('open');
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFiles(e.target.files);
      }
    });

    let uploadedFiles = [];
    const handleFiles = (files) => {
      uploadedFiles = Array.from(files);
      statusDiv.style.display = 'block';
      statusDiv.style.color = 'var(--accent-secondary)';
      statusDiv.innerHTML = `<i class="fa-solid fa-file-circle-check"></i> เลือกแล้ว ${uploadedFiles.length} ไฟล์: ${uploadedFiles.map(f => f.name).join(', ')}`;
    };

    btnProcess.addEventListener('click', () => {
      if (uploadedFiles.length === 0) {
        alert("กรุณาเลือกไฟล์ Excel หรือ CSV อย่างน้อย 1 ไฟล์");
        return;
      }

      statusDiv.style.display = 'block';
      statusDiv.style.color = 'var(--accent-emerald)';
      statusDiv.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังประมวลผลไฟล์...`;

      // Read files with SheetJS
      setTimeout(() => {
        statusDiv.innerHTML = `
          <i class="fa-solid fa-check-circle"></i> นำเข้าไฟล์เรียบร้อยแล้ว!<br>
          <span style="font-size: 11.5px; color: var(--text-muted);">
            หากต้องการบันทึกเป็นฐานข้อมูลถาวร ให้วางไฟล์ในโฟลเดอร์ <code>Data/</code> แล้วรันสคริปต์ <code>generate_integrated_data.py</code>
          </span>
        `;
      }, 1000);
    });
  };

  // ==============================================================================
  // 11. EXPORT TO EXCEL FUNCTIONALITY (SheetJS)
  // ==============================================================================
  window.exportCurrentTableToExcel = (tableId, filename = 'PAC_Sales_Report.xlsx') => {
    if (typeof XLSX === 'undefined') {
      alert("กำลังโหลดไลบรารีส่งออก Excel โปรดลองใหม่อีกครั้ง");
      return;
    }
    const table = document.getElementById(tableId);
    if (!table) return;

    const wb = XLSX.utils.table_to_book(table, { sheet: "Report" });
    XLSX.writeFile(wb, filename);
  };

  // Global Export Button
  const btnExportExcel = document.getElementById('btnExportExcel');
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      let activeTableId = 'table_ssa_branch_summary';
      let fname = 'PAC_SSA_August_Report.xlsx';

      if (state.currentTab === 'tab-visit') {
        activeTableId = 'table_visit_ranked_products';
        fname = `Store_Visit_${state.selectedBranch}_Report.xlsx`;
      } else if (state.currentTab === 'tab-whitespace') {
        activeTableId = 'table_whitespace_matrix';
        fname = 'Strategic_Whitespace_Matrix.xlsx';
      } else if (state.currentTab === 'tab-incentive') {
        activeTableId = 'table_incentive_history';
        fname = `SSA_Incentive_${state.incReportType}_Report.xlsx`;
      } else if (state.currentTab === 'tab-ksd') {
        activeTableId = 'table_ksd_salespersons';
        fname = 'KSD_Distributor_Sales.xlsx';
      } else if (state.currentTab === 'tab-dict') {
        activeTableId = 'table_dict_explorer';
        fname = 'Lao_Thai_Product_Dictionary.xlsx';
      }

      window.exportCurrentTableToExcel(activeTableId, fname);
    });
  }

  // Quick Print One-Pager
  const btnPrintReport = document.getElementById('btnPrintReport');
  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => {
      window.print();
    });
  }

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================
  initTheme();
  initNameMaskToggle();
  initNav();
  initIncentiveControls();
  initImportModal();
  renderSSATab();
  console.log("Pharma Alliance Dashboard initialized successfully.");
});
