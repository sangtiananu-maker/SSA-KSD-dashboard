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
    currentTab: 'tab-ksd',
    
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
    ksdReportMode: 'monthly', // 'monthly' | 'ytd' | 'yearly' | 'yoy'
    ksdPeriod: '2026-08',
    ksdScope: 'all',          // 'all' | 'strat'
    ksdGroupType: 'brand',
    auditMetric: 'qty',       // 'qty' | 'lak'
    auditSearchQuery: '',
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

  // Helper: Get Brand Group Name (Complete 76-Brand Normalized Taxonomy, 0 'Other')
  const getBrandGroup = (item) => {
    if (!item) return 'Other';
    if (typeof item === 'object' && item.brand_group) return item.brand_group;
    const name = typeof item === 'string' ? item : (item.english_name || item.name || item.product_name || item.ksd_name || '');
    const n = name.toLowerCase();

    // Standardized Brand Rules
    if (n.includes('arotika') || n.includes('อโรติกา')) return 'Arotika';
    if (n.includes('cleanoze')) return 'Cleanoze';
    if (n.includes('clenascar') || n.includes('clena')) return 'Clenascar';
    if (n.includes('clindamycin')) return 'Clindamycin';
    if (n.includes('clinicold')) return 'Clinicold';
    if (n.includes('clinovir')) return 'Clinovir';
    if (n.includes('diabe') || n.includes('ไดอาเบ')) return 'Diabederm';
    if (n.includes('fango') || n.includes('แฟงโก')) return 'Fango';
    if (n.includes('feenoze')) return 'Feenoze';
    if (n.includes('finasteride') || n.includes('ฟีนาสเตอไรด์')) return 'Finasteride';
    if (n.includes('bismol') || n.includes('บิสมอล')) return 'Gastro-Bismol';
    if (n.includes('gastrosec')) return 'Gastrosec';
    if (n.includes('hepivir')) return 'Hepivir';
    if (n.includes('kachana') || n.includes('kachaa')) return 'Kachana';
    if (n.includes('nacoxib') || n.includes('นาคอกซิบ')) return 'Nacoxib';
    if (n.includes('precius') || n.includes('prozeus') || n.includes('โปรซีอุส')) return 'Prozeus';
    if (n.includes('raqua') || n.includes('ราควา')) return 'Raqua';
    if (n.includes('spasium')) return 'Spasium';
    if (n.includes('tristan') || n.includes('ทริสตัน')) return 'Tristan';
    if (n.includes('gynogesic') || n.includes('ไกโนเจซิค')) return 'Gynogesic';
    if (n.includes('gynovir')) return 'Gynovir';
    if (n.includes('guticin')) return 'Guticin';
    if (n.includes('glucocron')) return 'Glucocron';
    if (n.includes('glucodab')) return 'Glucodab';
    if (n.includes('glucosa') || n.includes('กลูโคซ่า')) return 'Glucosa';
    if (n.includes('glucovia') || n.includes('กลูโคเวีย')) return 'Glucovia';
    if (n.includes('klenivet') || n.includes('clinivate') || n.includes('คลีนิเวท')) return 'Klenivet';
    if (n.includes('klenigel') || n.includes('clinigel') || n.includes('คลีนิเจล')) return 'Klenigel';
    if (n.includes('klenipred')) return 'Klenipred';
    if (n.includes('kleniderm') || n.includes('clinoderm') || n.includes('คลีโนเดิร์ม')) return 'Kleniderm';
    if (n.includes('klenimed') || n.includes('clinimet') || n.includes('คลีนิเมด')) return 'Klenimed';
    if (n.includes('spascopan') || n.includes('สปาสโคแพน')) return 'Spascopan';
    if (n.includes('skinfect') || n.includes('สกินเฟก')) return 'Skinfect';
    if (n.includes('stugin') || n.includes('สตูจิน')) return 'Stugin';
    if (n.includes('sporaxyl') || n.includes('sporosil') || n.includes('sporoxyl') || n.includes('สปอโรซิล')) return 'Sporosil';
    if (n.includes('zyno') || n.includes('zeno') || n.includes('ซีโน')) return 'Zyno';
    if (n.includes('ciproxyl') || n.includes('ciprocin') || n.includes('ซิโปรซิน')) return 'Ciprocin';
    if (n.includes('domper') || n.includes('doper') || n.includes('ดอมเพอร์')) return 'Domper-M';
    if (n.includes('doxy')) return 'Doxycycline';
    if (n.includes('tradolgesic')) return 'Tradolgesic';
    if (n.includes('norfloxin')) return 'Norfloxin';
    if (n.includes('binduretic')) return 'Binduretic';
    if (n.includes('b-themin')) return 'B-Themin';
    if (n.includes('fartussin')) return 'Fartussin';
    if (n.includes('pharmacon')) return 'Pharmacon';
    if (n.includes('pharmacef')) return 'Pharmacef';
    if (n.includes('famotab') || n.includes('ฟาโมแทบ')) return 'Famotab';
    if (n.includes('flunarizine') || n.includes('ฟูนาริซีน')) return 'Flunarizine';
    if (n.includes('mycosin')) return 'Mycosin';
    if (n.includes('myola')) return 'Myola';
    if (n.includes('mucobox') || n.includes('มิวโคบ็อกซ์')) return 'Mucobox';
    if (n.includes('roxithromycin')) return 'Roxithromycin';
    if (n.includes('axamin') || n.includes('อากซามิน')) return 'Axamin';
    if (n.includes('allerax') || n.includes('allerlax') || n.includes('อัลเลอแร็กซ์')) return 'Allerlax';
    if (n.includes('cefalex') || n.includes('cephalexyl') || n.includes('เซฟาเลก')) return 'Cefalexin';
    if (n.includes('cefuroxime')) return 'Cefuroxime';
    if (n.includes('zertin') || n.includes('zertine') || n.includes('เซอร์ติน')) return 'Zertin';
    if (n.includes('zencera') || n.includes('zenzera') || n.includes('เซนเซร่า')) return 'Zencera';
    if (n.includes('zentozide') || n.includes('zentocide') || n.includes('เซนโตไซด์')) return 'Zentocide';
    if (n.includes('dextromethorphan')) return 'Dextromethorphan';
    if (n.includes('nepthai')) return 'Nepthai';
    if (n.includes('bestatin')) return 'Bestatin';
    if (n.includes('betahist')) return 'Betahist';
    if (n.includes('predcap')) return 'Predcap';
    if (n.includes('fexotine')) return 'Fexotine';
    if (n.includes('metformin') || n.includes('เมตฟอร์มิน')) return 'Metformin';
    if (n.includes('capsika') || n.includes('แคปซิก้า')) return 'Capsika';
    if (n.includes('calza')) return 'Calza';
    if (n.includes('anxac') || n.includes('anzac') || n.includes('แอนแซก')) return 'Anxac';
    if (n.includes('cotricin')) return 'Cotricin';
    if (n.includes('noraphen') || n.includes('โนลาเฟน')) return 'Noraphen';
    if (n.includes('lopil') || n.includes('โลปิล')) return 'Lopil';
    if (n.includes('lorita') || n.includes('โลลิต้า')) return 'Lorita';
    if (n.includes('oflocee') || n.includes('โอฟลอซี')) return 'Oflocee';
    if (n.includes('glynin')) return 'Glynin';
    if (n.includes('plaivana') || n.includes('ไพลวาน่า')) return 'Plaivana';
    if (n.includes('icof') || n.includes('ไอค็อฟ')) return 'Icof';
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

  // ==============================================================================
  // PIN CODE SECURITY SYSTEM (Requires PIN on every reload, no persistence)
  // Master PIN: 874 | Backup PIN: 5243
  // Security Question: "บริษัทของเราตั้งอยู่ที่ไหนเอ่ย?"
  // ==============================================================================
  const VALID_PINS = ['874', '5243'];

  const initPinLockSecurity = () => {
    const overlay = document.getElementById('pinLockOverlay');
    const form = document.getElementById('pinForm');
    const input = document.getElementById('pinInput');
    const errorMsg = document.getElementById('pinErrorMsg');
    const visBtn = document.getElementById('pinToggleVis');

    if (!overlay || !form || !input) return;

    // Focus on PIN input
    setTimeout(() => {
      input.focus();
    }, 150);

    // Toggle visibility
    if (visBtn) {
      visBtn.addEventListener('click', () => {
        const isPw = input.type === 'password';
        input.type = isPw ? 'text' : 'password';
        visBtn.innerHTML = isPw ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
      });
    }

    // Submit handler
    const verifyPin = () => {
      const entered = (input.value || '').trim();
      if (VALID_PINS.includes(entered)) {
        // Unlock
        overlay.classList.add('unlocked');
        if (errorMsg) errorMsg.style.display = 'none';
        input.classList.remove('is-invalid');
        // Trigger resize so ApexCharts renders with full dimensions
        window.dispatchEvent(new Event('resize'));
      } else {
        // Invalid
        if (errorMsg) errorMsg.style.display = 'block';
        input.classList.add('is-invalid');
        input.value = '';
        input.focus();
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      verifyPin();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verifyPin();
      }
    });

    input.addEventListener('input', () => {
      if (errorMsg) errorMsg.style.display = 'none';
      input.classList.remove('is-invalid');
      // Auto submit when exact pin is typed
      const val = (input.value || '').trim();
      if (VALID_PINS.includes(val)) {
        verifyPin();
      }
    });
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
    // Mobile Hamburger Menu & Overlay Controls
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebar = document.querySelector('.sidebar');

    const openSidebar = () => {
      if (sidebar) sidebar.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.classList.add('active');
    };

    const closeSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    };

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar && sidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSidebar();
      });
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        switchTab(targetTab);
        closeSidebar();
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
        title: 'ยอดขายร้านยา SSA & วิเคราะห์ค่าเชียร์ (หน้าร้าน Sell-Out & 17 เดือน)',
        themeClass: 'theme-ssa',
        logo: 'assets/logo_ssa.png',
        badgeClass: 'badge-ssa',
        badgeIcon: 'fa-solid fa-store',
        badgeText: 'SSA Saysaath (ยอดขาย & ค่าเชียร์)'
      },
      'tab-whitespace': {
        title: 'ตารางโอกาสสินค้ากลยุทธ์ PAC ในร้านยา SSA',
        themeClass: 'theme-pac',
        logo: 'assets/logo_pac.png',
        badgeClass: 'badge-pac',
        badgeIcon: 'fa-solid fa-table-cells',
        badgeText: 'Pharma Alliance PAC (กลยุทธ์)'
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
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 60);
  };

  const renderCurrentTab = () => {
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

    // Update banner
    const banner = document.getElementById('ssa_branch_focus_banner');
    const bannerText = document.getElementById('ssa_branch_focus_text');
    const bName = (PAC_DATA.branch_names_th && PAC_DATA.branch_names_th[branchId]) || branchId;
    if (banner && bannerText) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `กำลังเจาะลึกข้อมูล: <strong>${bName} (${branchId})</strong>`;
    }

    if (state.currentTab !== 'tab-ssa') {
      switchTab('tab-ssa');
    } else {
      renderSSATab();
    }

    // Smooth scroll down to products table
    setTimeout(() => {
      const tableElem = document.getElementById('sec_ssa_all_products') || document.getElementById('table_ssa_all_audit_products');
      if (tableElem) tableElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  window.clearStoreBranchFocus = () => {
    state.ssaBranch = 'ALL';
    document.querySelectorAll('#ssaBranchTabs .branch-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-branch') === 'ALL');
    });
    const banner = document.getElementById('ssa_branch_focus_banner');
    if (banner) banner.style.display = 'none';
    renderSSATab();
  };

  // Helper: Synchronize SSA Metric (Units vs Monetary Value) across Top Selector & Audit Table Selector
  const updateSSAMetric = (metricType) => {
    const isVal = (metricType === 'val' || metricType === 'lak');
    state.ssaMetric = isVal ? 'val' : 'qty';
    state.auditMetric = isVal ? 'lak' : 'qty';

    // 1. Sync Top Dashboard Selector (#ssaMetricSelector)
    const topBtns = document.querySelectorAll('#ssaMetricSelector .pill-option');
    topBtns.forEach(btn => {
      const m = btn.getAttribute('data-metric');
      btn.classList.toggle('active', isVal ? (m === 'val') : (m === 'qty'));
    });

    // 2. Sync Bottom Audit Table Selector (#auditMetricSelector)
    const auditBtns = document.querySelectorAll('#auditMetricSelector .pill-option');
    auditBtns.forEach(btn => {
      const am = btn.getAttribute('data-audit-metric');
      btn.classList.toggle('active', isVal ? (am === 'lak') : (am === 'qty'));
    });

    // 3. Re-render SSA Tab (KPI, Charts, and Tables)
    renderSSATab();
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
        updateSSAPeriodDropdown();
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

    // 5. Metric Selector (Qty vs Val) - Linked with Audit Table Selector
    const metricButtons = document.querySelectorAll('#ssaMetricSelector .pill-option');
    metricButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        updateSSAMetric(btn.getAttribute('data-metric'));
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
    const modeSelector = document.getElementById('ssaReportModeSelector');
    if (!select) return;

    select.innerHTML = '';

    if (state.ssaScope === 'all') {
      if (modeSelector) {
        modeSelector.style.opacity = '0.4';
        modeSelector.style.pointerEvents = 'none';
      }
      const opt = document.createElement('option');
      opt.value = '2026-08';
      opt.textContent = 'สิงหาคม 2026 (สำรวจครบ 181 SKU)';
      opt.selected = true;
      select.appendChild(opt);
      select.disabled = true;
      state.ssaPeriod = '2026-08';
      return;
    }

    // Incentive scope: Enable selector and mode
    if (modeSelector) {
      modeSelector.style.opacity = '1';
      modeSelector.style.pointerEvents = 'auto';
    }
    select.disabled = false;

    const rMode = state.ssaReportMode;
    // In incentive scope, all 17 official months (2025-04 to 2026-08) are fully available
    const history = PAC_DATA.ssa_monthly_history || [];

    if (rMode === 'monthly') {
      const revMonths = [...history].reverse();
      revMonths.forEach((m, idx) => {
        const opt = document.createElement('option');
        opt.value = m.date_key;
        opt.textContent = `เดือน ${m.date_key} (ทางการ)`;
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
      opt26.textContent = 'ปี 2026 (สะสม ม.ค. - ส.ค. 8 เดือน - ทางการ)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025-YTD';
      opt25.textContent = 'ปี 2025 (สะสม เม.ย. - ธ.ค. 9 เดือน - ทางการ)';
      select.appendChild(opt25);

      state.ssaPeriod = '2026-YTD';
    } else if (rMode === 'yearly') {
      const opt26 = document.createElement('option');
      opt26.value = '2026-FULL';
      opt26.textContent = 'รวมทั้งปี 2026 (8 เดือนแรก ม.ค.-ส.ค. - ทางการ)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025-FULL';
      opt25.textContent = 'รวมทั้งปี 2025 (9 เดือน เม.ย.-ธ.ค. - ทางการ)';
      select.appendChild(opt25);

      state.ssaPeriod = '2026-FULL';
    } else if (rMode === 'yoy') {
      const yoyPairs = [
        { label: 'เทียบ ส.ค. (2026-08 vs 2025-08 - ทางการ)', val: 'YOY-08' },
        { label: 'เทียบ ก.ค. (2026-07 vs 2025-07 - ทางการ)', val: 'YOY-07' },
        { label: 'เทียบ มิ.ย. (2026-06 vs 2025-06 - ทางการ)', val: 'YOY-06' },
        { label: 'เทียบ พ.ค. (2026-05 vs 2025-05 - ทางการ)', val: 'YOY-05' },
        { label: 'เทียบ เม.ย. (2026-04 vs 2025-04 - ทางการ)', val: 'YOY-04' },
      ];
      yoyPairs.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = p.val;
        opt.textContent = p.label;
        if (idx === 0) opt.selected = true;
        select.appendChild(opt);
      });
      state.ssaPeriod = 'YOY-08';
    }
  };

  const processSSAData = () => {
    const rawHistory = PAC_DATA.ssa_monthly_history || [];
    const isBrandGroup = state.ssaGroup === 'brand';
    const isIncScope = state.ssaScope === 'incentive';
    const targetBranch = state.ssaBranch;
    const history = rawHistory;

    const getMonthProducts = (monthObj) => {
      if (!monthObj) return [];
      let prods = [];
      if (isIncScope && monthObj.incentive_products) {
        prods = monthObj.incentive_products;
      } else if (monthObj.products) {
        prods = monthObj.products.filter(p => !isIncScope || p.is_incentive);
      }

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
      currPeriodLabel = is2026 ? '2026 (YTD ม.ค. - ส.ค. 8 เดือน)' : '2025 (YTD เม.ย. - ธ.ค. 9 เดือน)';
      prevPeriodLabel = is2026 ? '2025 (YTD)' : '2026 (YTD)';
    } else if (mode === 'yearly') {
      const is2026 = (state.ssaPeriod || '2026').includes('2026');
      const m2026 = history.filter(m => m.year === 2026);
      const m2025 = history.filter(m => m.year === 2025);
      currProds = is2026 ? aggregateProductLists(m2026) : aggregateProductLists(m2025);
      prevProds = is2026 ? aggregateProductLists(m2025) : aggregateProductLists(m2026);
      currPeriodLabel = is2026 ? 'สรุปทั้งปี 2026' : 'สรุปทั้งปี 2025';
      prevPeriodLabel = is2026 ? 'ปี 2025' : 'ปี 2026';
    } else if (mode === 'yoy') {
      let mKey = (state.ssaPeriod || 'YOY-08').replace('YOY-', '');
      const mCurr = history.find(m => m.date_key === `2026-${mKey}`);
      const mPrev = history.find(m => m.date_key === `2025-${mKey}`);
      currProds = mCurr ? getMonthProducts(mCurr) : [];
      prevProds = mPrev ? getMonthProducts(mPrev) : [];
      currPeriodLabel = `เดือน ${mKey}/2026`;
      prevPeriodLabel = `เดือน ${mKey}/2025`;
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

    const isValMetric = (state.rankedSort === 'val' || state.ssaMetric === 'val');

    const prevMap = {};
    const prevValMap = {};
    prevProds.forEach(p => {
      prevMap[p.name] = getQty(p);
      prevValMap[p.name] = getVal(p);
    });

    const prevRanked = [...prevProds].filter(p => (isValMetric ? getVal(p) : getQty(p)) > 0)
      .sort((a, b) => isValMetric ? (getVal(b) - getVal(a)) : (getQty(b) - getQty(a)));
    const prevRankMap = {};
    prevRanked.forEach((p, idx) => {
      prevRankMap[p.name] = idx + 1;
    });

    const currRanked = [...currProds].sort((a, b) => isValMetric ? (getVal(b) - getVal(a)) : (getQty(b) - getQty(a)));

    const rankedList = currRanked.map((p, idx) => {
      const currQty = getQty(p);
      const prevQty = prevMap[p.name] || 0;
      const val = getVal(p);
      const prevVal = prevValMap[p.name] || 0;

      const diff = isValMetric ? (val - prevVal) : (currQty - prevQty);
      const basePrev = isValMetric ? prevVal : prevQty;
      const baseCurr = isValMetric ? val : currQty;
      const pctGrowth = basePrev > 0 ? ((diff / basePrev) * 100) : (baseCurr > 0 ? 100 : 0);

      const currRank = idx + 1;
      const prevRank = prevRankMap[p.name];
      let rankShift = 'NEW';
      if (prevRank !== undefined) {
        rankShift = prevRank - currRank;
      }

      const lak = p.total_price_lak || 0;
      let valFormatted = '-';
      if (lak > 0) valFormatted = formatLAK(val);
      else if (p.total_incentive > 0 || val > 0) valFormatted = formatTHB(val);

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
    const topProductSubText = topProductItem ? (state.ssaMetric === 'val' ? `ยอดขาย ${topProductItem.valFormatted}` : `ยอดขาย ${formatNum(topProductItem.currQty)} ชิ้น`) : '-';

    const growthDrivers = [...rankedList]
      .filter(p => p.diff > 0 && (state.ssaMetric === 'val' ? p.val > 0 : p.currQty > 0))
      .sort((a, b) => b.diff - a.diff);

    const dropDrivers = [...rankedList]
      .filter(p => p.diff < 0)
      .sort((a, b) => a.diff - b.diff);

    const monthCategories = history.map(m => m.date_key);
    const branchSeries = PAC_DATA.branches.map(b => {
      const data = history.map(m => {
        const prods = getMonthProducts(m);
        return prods.reduce((sum, p) => {
          if (state.ssaMetric === 'val') {
            const totQ = p.total_qty || 0;
            const bQ = (p.branches && p.branches[b]) ? p.branches[b] : 0;
            const inc = p.total_incentive || 0;
            const lak = p.total_price_lak || 0;
            const v = inc > 0 ? inc : lak;
            return sum + (totQ > 0 ? (v * bQ / totQ) : 0);
          }
          return sum + ((p.branches && p.branches[b]) ? p.branches[b] : 0);
        }, 0);
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
      highlightItems = rankedList.filter(p => (state.ssaMetric === 'val' ? p.val > 0 : p.currQty > 0)).slice(0, 10).map(p => p.name);
    }

    const highlightSeries = highlightItems.map(pName => {
      const data = history.map(m => {
        const prods = getMonthProducts(m);
        const item = prods.find(p => p.name === pName);
        if (!item) return 0;
        return state.ssaMetric === 'val' ? getVal(item) : getQty(item);
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
    const viewInc = document.getElementById('view_ssa_incentive_report');
    const viewAll = document.getElementById('view_ssa_all_pac_report');
    const kpiValTitle = document.getElementById('kpi_ssa_title_val');

    if (state.ssaScope === 'all') {
      if (viewInc) viewInc.style.display = 'none';
      if (viewAll) viewAll.style.display = 'block';
      if (kpiValTitle) kpiValTitle.textContent = 'ยอดขายรวม (มูลค่า)';
      renderSSAAllPacReport();
    } else {
      if (viewInc) viewInc.style.display = 'block';
      if (viewAll) viewAll.style.display = 'none';
      if (kpiValTitle) kpiValTitle.textContent = 'ค่าเชียร์รวม (มูลค่า)';
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

// ==============================================================================
  // 4.1 SSA DEDICATED AUGUST 2026 RETAIL AUDIT CENSUS REPORT (ALL 181 SKUs)
  // ==============================================================================
  const renderSSAAllPacReport = () => {
    const prods = PAC_DATA.ssa_products_august || [];
    const bId = state.ssaBranch || 'ALL';
    const isVal = state.ssaMetric === 'val';

    // 1. Calculate August 2026 totals based on branch filter
    let totalUnits = 0;
    let totalLak = 0.0;

    prods.forEach(p => {
      if (bId === 'ALL') {
        totalUnits += (p.total_qty || 0);
        totalLak += (p.total_price_lak || 0.0);
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
      if (kpiTopBranch) kpiTopBranch.textContent = 'SSA 1 (หนองด้วง/สีหอม)';
      if (kpiTopBranchSub) {
        kpiTopBranchSub.textContent = isVal
          ? `ยอดขาย ${formatLAK(305434971)} (31.7% ของทั้งเครือ)`
          : `ยอดขาย 25,247 ชิ้น (36.6% ของทั้งเครือ)`;
      }
    } else {
      const bNames = { SSA1: 'SSA 1 (หนองด้วง/สีหอม)', SSA2: 'SSA 2 (IMDC)', SSA3: 'SSA 3 (สะพานทอง)', SSA5: 'SSA 5 (จอมมณี)', SSA6: 'SSA 6 (แสงสว่าง)', SSA7: 'SSA 7 (เก้ายอด)' };
      if (kpiTopBranch) kpiTopBranch.textContent = bNames[bId] || bId;
      const share = isVal
        ? (totalLak > 0 ? ((totalLak / 963168446.43) * 100).toFixed(1) : '0.0')
        : (totalUnits > 0 ? ((totalUnits / 68902) * 100).toFixed(1) : '0.0');
      if (kpiTopBranchSub) kpiTopBranchSub.textContent = `คิดเป็น ${share}% ของยอดรวมทั้งเครือ`;
    }

    // Top Product for August based on active metric (Units vs Value)
    let bestProd = null;
    let maxMetric = -1;
    prods.forEach(p => {
      const v = isVal
        ? (bId === 'ALL' ? (p.total_price_lak || 0) : (p.branch_prices_lak[bId] || 0))
        : (bId === 'ALL' ? (p.total_qty || 0) : (p.branch_qtys[bId] || 0));
      if (v > maxMetric) {
        maxMetric = v;
        bestProd = p;
      }
    });

    const kpiTopProduct = document.getElementById('kpi_ssa_top_product');
    if (kpiTopProduct && bestProd) {
      kpiTopProduct.textContent = getProductName(bestProd);
    }
    const kpiTopProductSub = document.getElementById('kpi_ssa_top_product_sub');
    if (kpiTopProductSub && bestProd) {
      kpiTopProductSub.textContent = isVal
        ? `ยอดขาย ${formatLAK(maxMetric)} (${bestProd.classification || 'ทั่วไป'})`
        : `ยอดขาย ${formatNum(maxMetric)} ชิ้น (${bestProd.classification || 'ทั่วไป'})`;
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

      const isVal = state.ssaMetric === 'val';
      const branchLabels = ['SSA 1 (หนองด้วง/สีหอม)', 'SSA 2 (IMDC)', 'SSA 3 (สะพานทอง)', 'SSA 5 (จอมมณี)', 'SSA 6 (แสงสว่าง)', 'SSA 7 (เก้ายอด)'];
      const branchKeys = ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

      const subElem = document.getElementById('ssa_all_branch_compare_sub');
      if (subElem) {
        subElem.textContent = isVal ? 'เปรียบเทียบมูลค่ายอดขาย (กีบ LAK) ของแต่ละสาขา' : 'เปรียบเทียบจำนวนขาย (ชิ้น) ของแต่ละสาขา';
      }

      const chartData = branchKeys.map(k => isVal ? (PAC_DATA.branch_totals_lak[k] || 0) : (PAC_DATA.branch_totals_qty[k] || 0));

      const options = {
        series: [
          { name: isVal ? 'มูลค่ายอดขาย (กีบ LAK)' : 'จำนวนขาย (ชิ้น)', data: chartData }
        ],
        chart: {
          height: 330,
          type: 'bar',
          toolbar: { show: false },
          foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            borderRadius: 6,
            dataLabels: { position: 'top' }
          }
        },
        colors: [isVal ? '#06b6d4' : '#009944'],
        dataLabels: {
          enabled: true,
          formatter: (val) => isVal ? (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M ₭` : `${formatNum(Math.round(val / 1000))}k ₭`) : `${formatNum(val)}`,
          offsetY: -20,
          style: {
            fontSize: '11px',
            colors: [state.theme === 'dark' ? '#f1f5f9' : '#0f172a']
          }
        },
        xaxis: {
          categories: branchLabels,
          labels: {
            style: { fontSize: '11.5px', fontWeight: 600 }
          }
        },
        yaxis: {
          title: { text: isVal ? 'มูลค่ายอดขาย (ล้านกีบ LAK)' : 'จำนวนชิ้น (Units)' },
          labels: { formatter: (val) => isVal ? `${(val / 1000000).toFixed(0)}M ₭` : formatNum(val) }
        },
        tooltip: {
          theme: state.theme,
          y: {
            formatter: (val) => isVal ? formatLAK(val) : `${formatNum(val)} ชิ้น`
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

      const isVal = state.ssaMetric === 'val';
      const prods = [...(PAC_DATA.ssa_products_august || [])];
      const bId = state.ssaBranch || 'ALL';

      const subElem = document.getElementById('ssa_all_top_products_sub');
      if (subElem) {
        subElem.textContent = isVal ? 'จัดอันดับยาที่มีมูลค่ายอดขายปลีกหน้าร้านสูงสุด (ส.ค. 2026)' : 'จัดอันดับยาที่มีจำนวนขายปลีกหน้าร้านสูงสุด (ส.ค. 2026)';
      }

      prods.sort((a, b) => {
        const valA = isVal
          ? (bId === 'ALL' ? (a.total_price_lak || 0) : (a.branch_prices_lak[bId] || 0))
          : (bId === 'ALL' ? (a.total_qty || 0) : (a.branch_qtys[bId] || 0));
        const valB = isVal
          ? (bId === 'ALL' ? (b.total_price_lak || 0) : (b.branch_prices_lak[bId] || 0))
          : (bId === 'ALL' ? (b.total_qty || 0) : (b.branch_qtys[bId] || 0));
        return valB - valA;
      });

      const top10 = prods.slice(0, 10);
      const names = top10.map(p => getProductName(p));
      const values = top10.map(p => {
        if (isVal) {
          return bId === 'ALL' ? (p.total_price_lak || 0) : (p.branch_prices_lak[bId] || 0);
        }
        return bId === 'ALL' ? (p.total_qty || 0) : (p.branch_qtys[bId] || 0);
      });

      const options = {
        series: [{ name: isVal ? 'ยอดขายหน้าร้าน (กีบ LAK)' : 'ยอดขายหน้าร้าน (ชิ้น)', data: values }],
        chart: {
          type: 'bar',
          height: 330,
          toolbar: { show: false },
          foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
        },
        plotOptions: {
          bar: { borderRadius: 4, horizontal: true, barHeight: '65%' }
        },
        colors: [isVal ? '#06b6d4' : '#009944'],
        dataLabels: {
          enabled: true,
          formatter: (val) => isVal ? (val >= 1000000 ? `${(val / 1000000).toFixed(1)}M ₭` : `${formatNum(Math.round(val / 1000))}k ₭`) : formatNum(val)
        },
        xaxis: {
          categories: names,
          labels: { formatter: (val) => isVal ? `${(val / 1000000).toFixed(0)}M ₭` : formatNum(val) }
        },
        tooltip: {
          theme: state.theme,
          y: { formatter: (val) => isVal ? formatLAK(val) : `${formatNum(val)} ชิ้น` }
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
      { id: 'SSA1', name: 'SSA 1 (หนองด้วง/สีหอม)' },
      { id: 'SSA2', name: 'SSA 2 (IMDC)' },
      { id: 'SSA3', name: 'SSA 3 (สะพานทอง)' },
      { id: 'SSA5', name: 'SSA 5 (จอมมณี)' },
      { id: 'SSA6', name: 'SSA 6 (แสงสว่าง)' },
      { id: 'SSA7', name: 'SSA 7 (เพียวัด / เก้ายอด)' }
    ];

    const isVal = state.ssaMetric === 'val';
    const totalNetworkUnits = 68902;
    const totalNetworkLak = 963168446.43;
    const prods = PAC_DATA.ssa_products_august || [];

    branchMeta.forEach(b => {
      const q = PAC_DATA.branch_totals_qty[b.id] || 0;
      const lak = PAC_DATA.branch_totals_lak[b.id] || 0;
      const sharePct = isVal
        ? ((lak / totalNetworkLak) * 100).toFixed(1)
        : ((q / totalNetworkUnits) * 100).toFixed(1);

      // Find top product for this branch based on active metric
      let topP = null;
      let topVal = -1;
      prods.forEach(p => {
        const val = isVal ? (p.branch_prices_lak[b.id] || 0) : (p.branch_qtys[b.id] || 0);
        if (val > topVal) {
          topVal = val;
          topP = p;
        }
      });

      const tr = document.createElement('tr');
      const isCurrentActive = state.ssaBranch === b.id;
      if (isCurrentActive) tr.style.background = 'rgba(0, 153, 68, 0.08)';

      const qtyStyle = !isVal ? 'font-weight: 700; color: var(--ssa-primary);' : '';
      const lakStyle = isVal ? 'font-weight: 700; color: var(--ssa-primary);' : '';
      const topPValStr = isVal
        ? (topVal > 0 ? formatLAK(topVal) : '')
        : (topVal > 0 ? `${formatNum(topVal)} ชิ้น` : '');

      tr.innerHTML = `
        <td><code>${b.id}</code></td>
        <td style="font-weight: 600;">${b.name}</td>
        <td style="text-align: right; ${qtyStyle}">${formatNum(q)}</td>
        <td style="text-align: right; ${lakStyle}">${formatLAK(lak)}</td>
        <td style="text-align: right;"><span class="badge badge-emerald">${sharePct}%</span></td>
        <td>
          <div style="font-weight: 600; font-size: 12.5px;">${topP ? getProductName(topP) : '-'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${topPValStr}</div>
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
    const isLak = (state.auditMetric === 'lak' || state.ssaMetric === 'val');

    // Update column header to indicate units vs currency
    const thTotal = document.getElementById('th_ssa_audit_total');
    if (thTotal) {
      thTotal.textContent = isLak ? 'รวม 6 สาขา (กีบ LAK)' : 'รวม 6 สาขา (ชิ้น)';
    }

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

    // Sort descending: If a specific branch is selected, sort by that branch's sales!
    if (state.ssaBranch && state.ssaBranch !== 'ALL') {
      const bKey = state.ssaBranch;
      prods.sort((a, b) => {
        const valB = isLak ? (b.branch_prices_lak[bKey] || 0) : (b.branch_qtys[bKey] || 0);
        const valA = isLak ? (a.branch_prices_lak[bKey] || 0) : (a.branch_qtys[bKey] || 0);
        return valB - valA;
      });
    } else {
      prods.sort((a, b) => isLak ? (b.total_price_lak - a.total_price_lak) : (b.total_qty - a.total_qty));
    }

    // Highlight table header if a branch is focused
    const ths = document.querySelectorAll('#table_ssa_all_audit_products th');
    ths.forEach(th => {
      const txt = th.textContent.trim();
      const isTarget = state.ssaBranch !== 'ALL' && (txt.includes(state.ssaBranch) || txt === state.ssaBranch);
      th.style.background = isTarget ? 'rgba(0, 153, 68, 0.18)' : '';
      th.style.color = isTarget ? 'var(--ssa-primary)' : '';
    });

    prods.forEach((p, idx) => {
      const tr = document.createElement('tr');
      const stratBadge = p.is_strategic ? '<span class="badge badge-primary" style="font-size: 10px;">กลยุทธ์</span>' : '<span class="badge" style="font-size: 10px; background: var(--border-color); color: var(--text-muted);">ทั่วไป</span>';

      let branchCols = '';
      PAC_DATA.branches.forEach(b => {
        const isTarget = state.ssaBranch === b;
        const val = isLak ? (p.branch_prices_lak[b] || 0) : (p.branch_qtys[b] || 0);
        const valStr = isLak ? (val > 0 ? `${formatNum(Math.round(val / 1000))}k` : '-') : (val > 0 ? formatNum(val) : '-');
        const bgStyle = isTarget ? 'background: rgba(0, 153, 68, 0.12); font-weight: 700;' : '';
        branchCols += `<td style="text-align: right; ${bgStyle} ${val > 0 ? 'font-weight: 600;' : 'color: var(--text-muted); opacity: 0.5;'}">${valStr}</td>`;
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

  // Setup Audit Table Search and Metric Listeners (Linked with Master Dashboard Metric Selector)
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
        updateSSAMetric(btn.getAttribute('data-audit-metric'));
      });
    });
  }

  const renderSSABranchTrendChart = (d) => {
    const chartElem = document.getElementById('chart_ssa_branch_trend');
    if (!chartElem) return;

    const isIncScope = state.ssaScope === 'incentive';
    const isVal = state.ssaMetric === 'val';
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
        title: { text: isIncScope ? 'เส้นเวลาทางการ 17 เดือน (เม.ย. 2025 – ส.ค. 2026)' : 'เส้นเวลาต่อเนื่อง (เม.ย. 2025 – ส.ค. 2026)' }
      },
      yaxis: {
        title: { text: isVal ? 'มูลค่าค่าเชียร์ (บาท THB)' : 'จำนวนขาย (ชิ้น)' },
        labels: { formatter: (val) => isVal ? formatTHB(val) : formatNum(val) }
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: state.theme,
        y: { formatter: (val) => isVal ? formatTHB(val) : `${formatNum(val)} ชิ้น` }
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

    const isIncScope = state.ssaScope === 'incentive';
    const isVal = state.ssaMetric === 'val';
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
        title: { text: isIncScope ? 'เส้นเวลาทางการ 17 เดือน (เม.ย. 2025 – ส.ค. 2026)' : 'เส้นเวลาต่อเนื่อง (เม.ย. 2025 – ส.ค. 2026)' }
      },
      yaxis: {
        title: { text: isVal ? `มูลค่าขาย ${state.ssaBranch === 'ALL' ? 'รวมทุกสาขา' : state.ssaBranch} (บาท)` : `จำนวนขาย ${state.ssaBranch === 'ALL' ? 'รวมทุกสาขา' : state.ssaBranch} (ชิ้น)` },
        labels: { formatter: (val) => isVal ? formatTHB(val) : formatNum(val) }
      },
      tooltip: {
        shared: true,
        theme: state.theme,
        y: { formatter: (val) => isVal ? formatTHB(val) : `${formatNum(val)} ชิ้น` }
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
    const isVal = state.ssaMetric === 'val';

    if (growthElem) {
      const topG = d.growthDrivers.slice(0, limit);
      if (topG.length === 0) {
        growthElem.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-circle-info"></i> ไม่พบรายการที่เติบโตขึ้นในงวดนี้</div>';
      } else {
        const names = topG.map(p => p.name);
        const values = topG.map(p => p.diff);

        const options = {
          series: [{ name: isVal ? 'มูลค่าเพิ่มขึ้น (บาท)' : 'ยอดขายเพิ่มขึ้น (ชิ้น)', data: values }],
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
            formatter: (val) => isVal ? `+${formatTHB(val)}` : `+${formatNum(val)}`
          },
          xaxis: {
            categories: names,
            labels: { formatter: (val) => isVal ? `+${formatTHB(val)}` : `+${formatNum(val)}` }
          },
          tooltip: {
            theme: state.theme,
            y: { formatter: (val) => isVal ? `+${formatTHB(val)}` : `+${formatNum(val)} ชิ้น` }
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
          series: [{ name: isVal ? 'มูลค่าลดลง (บาท)' : 'ยอดขายลดลง (ชิ้น)', data: values }],
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
            formatter: (val) => isVal ? formatTHB(val) : `${formatNum(val)}`
          },
          xaxis: {
            categories: names,
            labels: { formatter: (val) => isVal ? formatTHB(val) : formatNum(val) }
          },
          tooltip: {
            theme: state.theme,
            y: { formatter: (val) => isVal ? formatTHB(val) : `${formatNum(val)} ชิ้น` }
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

    if (state.rankedSort === 'val' || state.ssaMetric === 'val') {
      items.sort((a, b) => b.val - a.val);
    } else {
      items.sort((a, b) => b.currQty - a.currQty);
    }

    // Re-number ranks in display
    items.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--text-muted);">ไม่พบข้อมูลตามเงื่อนไขการค้นหา</td></tr>`;
      return;
    }

    const isValMetric = (state.rankedSort === 'val' || state.ssaMetric === 'val');

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
      const diffDisplay = isValMetric ? (item.diff >= 0 ? `+${formatTHB(item.diff)}` : formatTHB(item.diff)) : `${diffSign}${formatNum(item.diff)}`;

      tr.innerHTML = `
        <td><div class="rank-circle ${item.rank === 1 ? 'rank-1' : item.rank === 2 ? 'rank-2' : item.rank === 3 ? 'rank-3' : ''}">${item.rank}</div></td>
        <td style="text-align: center;">${shiftHtml}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
        </td>
        <td><span class="badge badge-primary">${item.brand_group}</span></td>
        <td style="text-align: right; font-weight: 700; color: var(--ssa-primary);">${formatNum(item.currQty)}</td>
        <td style="text-align: right; font-weight: 600; color: ${diffColor};">${diffDisplay}</td>
        <td style="text-align: right; font-weight: 600; color: ${diffColor};">${pctSign}${item.pctGrowth.toFixed(1)}%</td>
        <td style="text-align: right; font-weight: 700;">${item.valFormatted}</td>
      `;

      tbody.appendChild(tr);
    });
  };

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
        <td style="text-align: center; color: var(--text-muted); font-size: 11px;">${idx + 1}</td>
        <td><code style="font-size: 11px;">${item.sku}</code></td>
        <td style="max-width: 240px; word-break: break-word;">
          <div style="font-weight: 600; font-size: 12px; line-height: 1.3;">${getProductName(item.thai_name || item.ksd_name)}</div>
          <div style="font-size: 10.5px; color: var(--text-muted); line-height: 1.2;">${item.ksd_name}</div>
        </td>
        <td style="text-align: center;"><span class="badge badge-primary" style="font-size: 10px;">${item.classification || 'Strategic'}</span></td>
        <td style="font-weight: 700; text-align: right; font-size: 12.5px;">${formatNum(item.total_qty)}</td>
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
  // 7. TAB 5: KSD DISTRIBUTOR SALES (SELL-IN)
  // ==============================================================================
  // 7. TAB 5: KSD DISTRIBUTOR SALES (SELL-OUT)
  // ==============================================================================
  // ==============================================================================
  // 7. TAB 5: KSD DISTRIBUTOR SALES (SELL-OUT)
  // ==============================================================================
  const renderKSDTab = () => {
    try {
      const period = state.ksdPeriod || '2026-08';
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

      // Dynamic KPI for selected period
      let currentPeriodSales = 0;
      let currentPeriodTx = 0;
      const prodsForPeriod = (PAC_DATA.ksd_products_by_period && PAC_DATA.ksd_products_by_period[period]) || [];
      const custsForPeriod = (PAC_DATA.ksd_customers_by_period && PAC_DATA.ksd_customers_by_period[period]) || [];

      if (prodsForPeriod.length > 0) {
        currentPeriodSales = prodsForPeriod.reduce((acc, p) => acc + p.total_bath, 0);
      } else {
        const histM = history.find(m => m.date_key === period);
        if (histM) currentPeriodSales = histM.total_sellout_bath;
      }

      const kpiPacRevEl = document.getElementById('kpi_ksd_pac_rev');
      if (kpiPacRevEl) kpiPacRevEl.textContent = formatTHB(currentPeriodSales);

      const kpiPacTxEl = document.getElementById('kpi_ksd_pac_tx');
      if (kpiPacTxEl) {
        if (period === '2026-08') {
          kpiPacTxEl.innerHTML = `<span>1,962 บิล</span> (55,068 ชิ้น / 578 ลูกค้า)`;
        } else {
          kpiPacTxEl.innerHTML = `<span>${custsForPeriod.length} ลูกค้า</span> (${formatNum(prodsForPeriod.reduce((acc, p) => acc + p.total_qty, 0))} ชิ้น)`;
        }
      }

      // 2. Render Charts & Sections
      renderKSDMonthlyTrendChart();
      renderKSDTopProducts();
      renderKSDTopCustomers();
      renderKSDChannelsChart();
      renderKSDProvincesChart();
      renderKSDTeamDonutChart();
      renderKSDProductGroupsBreakdown();
      renderKSDSalespersonTable();
    } catch (e) {
      console.error('Error in renderKSDTab:', e);
    }
  };

  const renderKSDMonthlyTrendChart = () => {
    try {
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
    } catch (e) {
      console.error('Error in renderKSDMonthlyTrendChart:', e);
    }
  };

  const renderKSDTopProducts = () => {
    try {
      const chartElem = document.getElementById('chart_ksd_top_products');
      const tbody = document.getElementById('tbody_ksd_top_products');
      if (!chartElem || !tbody) return;

      const period = state.ksdPeriod || '2026-08';
      let prods = (PAC_DATA.ksd_products_by_period && PAC_DATA.ksd_products_by_period[period]) || PAC_DATA.ksd_top_pac_products || [];
      
      if (state.ksdScope === 'strat') {
        prods = prods.filter(p => p.is_strategic);
      }

      const top10 = prods.slice(0, 10);
      const names = top10.map(p => getProductName(p.name));
      const values = top10.map(p => Math.round(p.total_bath));

      const options = {
        series: [{ name: 'ยอดขาย (บาท)', data: values }],
        chart: {
          type: 'bar',
          height: 280,
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

      if (state.charts['chart_ksd_top_products']) {
        state.charts['chart_ksd_top_products'].destroy();
      }
      state.charts['chart_ksd_top_products'] = new ApexCharts(chartElem, options);
      state.charts['chart_ksd_top_products'].render();

      // Render table
      tbody.innerHTML = '';
      top10.forEach((p, idx) => {
        const tr = document.createElement('tr');
        const stratBadge = p.is_strategic ? '<span class="badge badge-primary" style="font-size: 10px;">กลยุทธ์</span>' : '<span class="badge" style="font-size: 10px; background: var(--border-color); color: var(--text-muted);">ทั่วไป</span>';
        tr.innerHTML = `
          <td><strong>${idx + 1}</strong></td>
          <td>
            <div style="font-weight: 600; font-size: 12.5px;">${getProductName(p.name)}</div>
            <div style="font-size: 10.5px; color: var(--text-muted);">SKU: ${p.sku} ${stratBadge}</div>
          </td>
          <td><span class="badge badge-emerald" style="font-size: 10px;">${p.brand_group || '-'}</span></td>
          <td style="text-align: right;">${formatNum(p.total_qty)}</td>
          <td style="text-align: right; font-weight: 700; color: var(--ksd-primary);">${formatTHB(p.total_bath)}</td>
        `;
        tbody.appendChild(tr);
      });

      // Update Subtitle
      const subEl = document.getElementById('ksd_top_products_sub');
      if (subEl) {
        subEl.textContent = `งวด ${period} (${state.ksdScope === 'strat' ? 'เฉพาะสินค้ากลยุทธ์' : 'สินค้า PAC ทั้งหมด'}) รวม ${prods.length} รายการ`;
      }
    } catch (e) {
      console.error('Error rendering KSD top products:', e);
    }
  };

  const renderKSDTopCustomers = () => {
    try {
      const chartElem = document.getElementById('chart_ksd_top_customers');
      const tbody = document.getElementById('tbody_ksd_top_customers');
      if (!chartElem || !tbody) return;

      const period = state.ksdPeriod || '2026-08';
      const custs = (PAC_DATA.ksd_customers_by_period && PAC_DATA.ksd_customers_by_period[period]) || PAC_DATA.ksd_top_customers || [];
      const top10 = custs.slice(0, 10);

      const names = top10.map(c => c.clean_name || c.partner);
      const values = top10.map(c => Math.round(c.total_bath));

      const options = {
        series: [{ name: 'ยอดซื้อ (บาท)', data: values }],
        chart: {
          type: 'bar',
          height: 280,
          toolbar: { show: false },
          foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
        },
        plotOptions: {
          bar: { borderRadius: 4, horizontal: true, barHeight: '65%' }
        },
        colors: ['#0f4c3a'],
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

      if (state.charts['chart_ksd_top_customers']) {
        state.charts['chart_ksd_top_customers'].destroy();
      }
      state.charts['chart_ksd_top_customers'] = new ApexCharts(chartElem, options);
      state.charts['chart_ksd_top_customers'].render();

      // Render table
      tbody.innerHTML = '';
      top10.forEach((c, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${idx + 1}</strong></td>
          <td>
            <div style="font-weight: 600; font-size: 12.5px;">${c.clean_name || c.partner}</div>
            <div style="font-size: 10px; color: var(--text-muted);">${c.partner}</div>
          </td>
          <td><span class="badge badge-primary" style="font-size: 10px;">${c.type || 'Customer'}</span></td>
          <td><span style="font-size: 11px;">${c.province || '-'}</span></td>
          <td style="text-align: right; font-weight: 700; color: var(--ksd-secondary);">${formatTHB(c.total_bath)}</td>
        `;
        tbody.appendChild(tr);
      });

      const subEl = document.getElementById('ksd_top_customers_sub');
      if (subEl) {
        subEl.textContent = `งวด ${period} (รวม ${custs.length} ลูกค้าที่มียอดสั่งซื้อ)`;
      }
    } catch (e) {
      console.error('Error rendering KSD top customers:', e);
    }
  };

  const renderKSDChannelsChart = () => {
    try {
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
    } catch (e) {
      console.error('Error in renderKSDChannelsChart:', e);
    }
  };

  const renderKSDProvincesChart = () => {
    try {
      const chartElem = document.getElementById('chart_ksd_provinces_rank');
      const tbody = document.getElementById('tbody_ksd_provinces_rank');

      const provs = (PAC_DATA.ksd_provinces || []).slice(0, 10);
      const names = provs.map(p => p.province);
      const val26 = provs.map(p => Math.round(p.val_2026_jul || 0));
      const val25 = provs.map(p => Math.round(p.val_2025_jul || 0));

      if (chartElem) {
        const options = {
          series: [
            { name: 'ปี 2026 (YTD ก.ค.)', data: val26 },
            { name: 'ปี 2025 (YTD ก.ค.)', data: val25 }
          ],
          chart: {
            type: 'bar',
            height: 380,
            toolbar: { show: false },
            foreColor: state.theme === 'dark' ? '#94a3b8' : '#475569'
          },
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 4,
              barHeight: '70%',
              dataLabels: { position: 'top' }
            }
          },
          colors: ['#7e1957', '#94a3b8'],
          dataLabels: { enabled: false },
          stroke: { show: true, width: 1, colors: ['transparent'] },
          xaxis: {
            categories: names,
            labels: {
              formatter: (val) => {
                if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M ฿';
                if (val >= 1000) return Math.round(val / 1000) + 'k ฿';
                return (val || 0) + ' ฿';
              }
            }
          },
          yaxis: {
            labels: {
              style: { fontSize: '11.5px', fontWeight: 600 }
            }
          },
          tooltip: {
            shared: true,
            intersect: false,
            theme: state.theme,
            y: { formatter: (val) => formatTHB(val) }
          },
          legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: {
              colors: state.theme === 'dark' ? '#cbd5e1' : '#334155'
            }
          }
        };

        if (state.charts['chart_ksd_provinces_rank']) {
          state.charts['chart_ksd_provinces_rank'].destroy();
        }
        state.charts['chart_ksd_provinces_rank'] = new ApexCharts(chartElem, options);
        state.charts['chart_ksd_provinces_rank'].render();
      }

      // Populate Provinces Data Table
      if (tbody) {
        tbody.innerHTML = '';
        provs.forEach((p, idx) => {
          const tr = document.createElement('tr');
          const sharePct = p.share ? (p.share * 100).toFixed(1) + '%' : '-';
          const growth = p.pct_growth !== undefined && p.pct_growth !== null ? Number(p.pct_growth) : null;
          let growthBadge = '-';
          if (growth !== null) {
            const isPos = growth >= 0;
            const sign = isPos ? '+' : '';
            const colorClass = isPos ? 'badge-emerald' : 'badge-rose';
            growthBadge = `<span class="badge ${colorClass}" style="font-size: 10px;">${sign}${growth.toFixed(1)}%</span>`;
          }
          tr.innerHTML = `
            <td style="text-align: center; color: var(--text-muted); font-size: 11px;">${idx + 1}</td>
            <td style="font-weight: 600; font-size: 12px;">${p.province}</td>
            <td style="text-align: right; font-weight: 700; color: var(--ksd-primary); font-size: 12px;">${formatTHB(p.val_2026_jul)}</td>
            <td style="text-align: right; color: var(--text-muted); font-size: 11.5px;">${formatTHB(p.val_2025_jul)}</td>
            <td style="text-align: right; font-weight: 600; font-size: 11.5px;">${sharePct}</td>
            <td style="text-align: right;">${growthBadge}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.error('Error in renderKSDProvincesChart:', e);
    }
  };

  const renderKSDTeamDonutChart = () => {
    try {
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
    } catch (e) {
      console.error('Error in renderKSDTeamDonutChart:', e);
    }
  };

  const renderKSDProductGroupsBreakdown = () => {
    try {
      const chartElem = document.getElementById('chart_ksd_group_breakdown');
      const tbody = document.getElementById('tbody_ksd_group_breakdown');
      if (!chartElem && !tbody) return;

      const period = state.ksdPeriod || '2026-08';
      const groupType = state.ksdGroupType || 'brand'; // 'brand' or 'category'

      const breakdownData = PAC_DATA.ksd_group_breakdown_by_period && PAC_DATA.ksd_group_breakdown_by_period[period];
      let items = [];
      if (breakdownData) {
        items = groupType === 'brand' ? (breakdownData.by_brand || []) : (breakdownData.by_category || []);
      }

      if (!items || items.length === 0) {
        let prods = (PAC_DATA.ksd_products_by_period && PAC_DATA.ksd_products_by_period[period]) || PAC_DATA.ksd_top_pac_products || [];
        const tot = prods.reduce((acc, p) => acc + p.total_bath, 0) || 1.0;
        const gMap = {};
        prods.forEach(p => {
          const key = groupType === 'brand' ? (p.brand_group || 'Other') : (p.category || 'Other');
          if (!gMap[key]) {
            gMap[key] = {
              name: key,
              total_bath: 0,
              total_qty: 0,
              is_strategic: p.is_strategic,
              category: p.category
            };
          }
          gMap[key].total_bath += p.total_bath;
          gMap[key].total_qty += p.total_qty;
        });
        items = Object.values(gMap).map(g => ({
          ...g,
          share_pct: Number(((g.total_bath / tot) * 100).toFixed(1))
        }));
        items.sort((a, b) => b.total_bath - a.total_bath);
      }

      // Update subtitle
      const subElem = document.getElementById('ksd_group_breakdown_sub');
      if (subElem) {
        subElem.textContent = `งวด ${period} • รวมทั้งสิ้น ${items.length} ${groupType === 'brand' ? 'กลุ่มแบรนด์' : 'กลุ่มการรักษา'}`;
      }

      // Render Horizontal Bar Chart
      if (chartElem) {
        const top10 = items.slice(0, 10);
        const categories = top10.map(it => it.name.length > 28 ? it.name.substring(0, 25) + '...' : it.name);
        const values = top10.map(it => Math.round(it.total_bath));

        const options = {
          series: [{ name: 'ยอดขาย (บาท)', data: values }],
          chart: {
            type: 'bar',
            height: 380,
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
          colors: [groupType === 'brand' ? '#eb6b22' : '#009944'],
          dataLabels: {
            enabled: true,
            formatter: (val) => formatTHB(val)
          },
          xaxis: {
            categories: categories,
            labels: { formatter: (val) => formatTHB(val) }
          },
          tooltip: {
            theme: state.theme,
            y: {
              formatter: (val, opt) => {
                const itm = top10[opt.dataPointIndex];
                return `${formatTHB(val)} (${itm ? itm.share_pct : 0}%)`;
              }
            }
          }
        };

        if (state.charts['chart_ksd_group_breakdown']) {
          state.charts['chart_ksd_group_breakdown'].destroy();
        }
        state.charts['chart_ksd_group_breakdown'] = new ApexCharts(chartElem, options);
        state.charts['chart_ksd_group_breakdown'].render();
      }

      // Render Table
      if (tbody) {
        tbody.innerHTML = '';
        items.forEach((it, idx) => {
          const tr = document.createElement('tr');
          let typeBadge = '';
          if (groupType === 'brand') {
            typeBadge = it.is_strategic 
              ? '<span class="badge badge-primary" style="font-size: 10px;">กลยุทธ์</span>' 
              : '<span class="badge" style="font-size: 10px; background: var(--border-color); color: var(--text-muted);">ทั่วไป</span>';
          } else {
            typeBadge = `<span class="badge" style="font-size: 10px; background: rgba(0, 153, 68, 0.1); color: var(--ssa-primary);">${it.sku_count || 1} SKUs</span>`;
          }

          tr.innerHTML = `
            <td>
              <div style="font-weight: 600; font-size: 12.5px;">${it.name}</div>
              ${it.category && groupType === 'brand' ? `<div style="font-size: 10.5px; color: var(--text-muted);">${it.category}</div>` : ''}
            </td>
            <td style="text-align: right;">${formatNum(it.total_qty)}</td>
            <td style="text-align: right; font-weight: 700; color: var(--ksd-primary);">${formatTHB(it.total_bath)}</td>
            <td style="text-align: right;"><span class="badge badge-emerald" style="font-size: 11px;">${it.share_pct}%</span></td>
            <td style="text-align: center;">${typeBadge}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.error('Error in renderKSDProductGroupsBreakdown:', e);
    }
  };

  const renderKSDSalespersonTable = () => {
    try {
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
    } catch (e) {
      console.error('Error in renderKSDSalespersonTable:', e);
    }
  };

  const updateKSDPeriodDropdown = () => {
    const select = document.getElementById('ksdPeriodSelect');
    if (!select) return;

    select.innerHTML = '';
    const rMode = state.ksdReportMode || 'monthly';
    const history = PAC_DATA.ksd_monthly_history || [];

    if (rMode === 'monthly') {
      history.slice().reverse().forEach((m, idx) => {
        const opt = document.createElement('option');
        opt.value = m.date_key;
        opt.textContent = `${m.date_key === '2026-08' ? 'สิงหาคม 2026 (เดือนล่าสุด / ละเอียด)' : `เดือน ${m.date_key}`}`;
        if (m.date_key === state.ksdPeriod || (!state.ksdPeriod.includes('-') && idx === 0)) {
          opt.selected = true;
          state.ksdPeriod = m.date_key;
        }
        select.appendChild(opt);
      });
      if (!state.ksdPeriod || state.ksdPeriod.includes('YTD') || state.ksdPeriod.includes('FULL') || state.ksdPeriod.includes('YOY')) {
        state.ksdPeriod = '2026-08';
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
      opt25.textContent = 'ปี 2025 (สะสม ม.ค. - ส.ค. 8 เดือน เทียบเท่า)';
      select.appendChild(opt25);

      state.ksdPeriod = '2026-YTD';
    } else if (rMode === 'yearly') {
      const opt26 = document.createElement('option');
      opt26.value = '2026-FULL';
      opt26.textContent = 'รวมทั้งปี 2026 (8 เดือนแรก ม.ค. - ส.ค.)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025-FULL';
      opt25.textContent = 'รวมทั้งปี 2025 (เต็มปี 12 เดือน)';
      select.appendChild(opt25);

      state.ksdPeriod = '2026-FULL';
    } else if (rMode === 'yoy') {
      const yoyPairs = [
        { label: 'เทียบ ส.ค. (2026-08 vs 2025-08)', val: '2026-08' },
        { label: 'เทียบ ก.ค. (2026-07 vs 2025-07)', val: '2026-07' },
        { label: 'เทียบ มิ.ย. (2026-06 vs 2025-06)', val: '2026-06' },
        { label: 'เทียบ พ.ค. (2026-05 vs 2025-05)', val: '2026-05' },
        { label: 'เทียบ เม.ย. (2026-04 vs 2025-04)', val: '2026-04' },
        { label: 'เทียบ มี.ค. (2026-03 vs 2025-03)', val: '2026-03' },
        { label: 'เทียบ ก.พ. (2026-02 vs 2025-02)', val: '2026-02' },
        { label: 'เทียบ ม.ค. (2026-01 vs 2025-01)', val: '2026-01' },
      ];
      yoyPairs.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = p.val;
        opt.textContent = p.label;
        if (idx === 0) opt.selected = true;
        select.appendChild(opt);
      });
      state.ksdPeriod = '2026-08';
    }
  };

  // KSD Control Listeners Setup
  const initKSDControls = () => {
    const periodSelect = document.getElementById('ksdPeriodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        state.ksdPeriod = e.target.value;
        renderKSDTab();
      });
    }

    const scopeSelector = document.getElementById('ksdScopeSelector');
    if (scopeSelector) {
      scopeSelector.querySelectorAll('.pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
          scopeSelector.querySelectorAll('.pill-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.ksdScope = btn.getAttribute('data-ksd-scope');
          renderKSDTopProducts();
        });
      });
    }

    const reportModeSelector = document.getElementById('ksdReportModeSelector');
    if (reportModeSelector) {
      reportModeSelector.querySelectorAll('.pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
          reportModeSelector.querySelectorAll('.pill-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.ksdReportMode = btn.getAttribute('data-ksd-report');
          updateKSDPeriodDropdown();
          renderKSDTab();
        });
      });
    }

    const ksdGroupSelector = document.getElementById('ksdGroupSelector');
    if (ksdGroupSelector) {
      ksdGroupSelector.querySelectorAll('.pill-option').forEach(btn => {
        btn.addEventListener('click', () => {
          ksdGroupSelector.querySelectorAll('.pill-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.ksdGroupType = btn.getAttribute('data-ksdgroup');
          renderKSDProductGroupsBreakdown();
        });
      });
    }

    updateKSDPeriodDropdown();
  };

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
  // AI EXECUTIVE INSIGHTS & STORE VISIT BRIEFING (Pre-built Instant Intelligence)
  // ==============================================================================
  const initExecutiveInsightsUI = () => {
    const triggerBtn = document.getElementById('gemmaTriggerBtn');
    const drawer = document.getElementById('gemmaDrawer');
    const drawerOverlay = document.getElementById('gemmaDrawerOverlay');
    const drawerCloseBtn = document.getElementById('gemmaDrawerCloseBtn');
    const container = document.getElementById('gemmaChatMessages');
    const branchSelect = document.getElementById('insightBranchSelect');
    const searchInput = document.getElementById('insightSearchInput');
    const btnMonthly = document.getElementById('btnInsightMonthly');
    const btnStore = document.getElementById('btnInsightStore');
    const btnStrategic = document.getElementById('btnInsightStrategic');

    if (!triggerBtn || !drawer || !container) return;

    let currentMode = 'monthly'; // 'monthly' | 'store' | 'strategic'

    const renderSearchResults = (query) => {
      const results = window.ExecutiveInsights.smartSearchProducts(query, PAC_DATA.ssa_products_august);
      
      const q = query.toLowerCase();
      const matchedCats = (window.ExecutiveInsights.MEDICAL_SYMPTOM_MAP || []).filter(c => 
        c.keywords.some(k => q.includes(k.toLowerCase()) || k.toLowerCase().includes(q))
      );

      let html = `
        <div class="insight-section" style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 14px; color: #06b6d4;">
              <i class="fa-solid fa-magnifying-glass"></i> ผลการค้นหาอัจฉริยะ (Smart Search)
            </div>
            <span class="rank-badge" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4;">${results.length} รายการ</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">
            ค้นหาคำว่า: <strong style="color: var(--text-primary);">"${query}"</strong> (รองรับกลุ่มอาการ, ภาษาลาว, ไทย, อังกฤษ และคำสะกดผิด)
          </div>
      `;

      if (matchedCats.length > 0) {
        html += `
          <div style="margin-bottom: 12px; padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; border-radius: 6px;">
            <div style="font-size: 11.5px; font-weight: 700; color: #10b981; margin-bottom: 4px;">
              <i class="fa-solid fa-stethoscope"></i> ตรวจพบกลุ่มอาการที่ตรงกัน:
            </div>
            ${matchedCats.map(c => `<span class="ws-tag" style="background: rgba(16, 185, 129, 0.2); color: #10b981; margin: 2px 4px 2px 0;">${c.category}</span>`).join('')}
          </div>
        `;
      }

      if (results.length === 0) {
        html += `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
            <i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            ไม่พบสินค้าที่ตรงกับคำค้นหานี้ กรุณาลองค้นหาด้วยชื่อแบรนด์ ย่อ หรือกลุ่มอาการ
          </div>
        </div>`;
      } else {
        html += `
          <div class="table-responsive" style="max-height: 520px; overflow-y: auto;">
            <table class="insight-mini-table">
              <thead>
                <tr>
                  <th>สินค้า / แบรนด์</th>
                  <th style="text-align: right;">ยอดขายรวม</th>
                  <th style="text-align: right;">สาขาที่ขายได้</th>
                </tr>
              </thead>
              <tbody>
        `;

        results.slice(0, 30).forEach(p => {
          const activeBranches = PAC_DATA.branches.filter(b => (p.branch_qtys && p.branch_qtys[b]) > 0);
          html += `
            <tr>
              <td>
                <div style="font-weight: 600; color: var(--text-primary); font-size: 12.5px;">${p.english_name || p.lao_name}</div>
                <div style="font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                  <span class="ws-tag" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4; font-size: 10px; padding: 1px 6px;">${p.brand_group}</span>
                  <span>SKU: ${p.sku}</span>
                </div>
              </td>
              <td style="text-align: right; white-space: nowrap;">
                <div style="font-weight: 700; color: var(--accent-emerald); font-size: 12.5px;">${p.total_qty.toLocaleString()} ${p.unit || 'ชิ้น'}</div>
                <div style="font-size: 10.5px; color: var(--text-muted);">${(p.total_price_lak / 1e6).toFixed(2)}M LAK</div>
              </td>
              <td style="text-align: right; font-size: 11px;">
                ${activeBranches.length > 0 
                  ? `<span style="color: #10b981; font-weight: 600;">${activeBranches.length}/6 สาขา</span><div style="font-size: 9.5px; color: var(--text-muted);">${activeBranches.join(', ')}</div>` 
                  : `<span style="color: var(--accent-rose);">ไม่มีจำหน่าย</span>`}
              </td>
            </tr>
          `;
        });

        html += `
              </tbody>
            </table>
          </div>
        </div>`;
      }

      container.innerHTML = html;
      container.scrollTop = 0;
    };

    const renderCurrentMode = () => {
      if (!window.ExecutiveInsights) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดโมดูลวิเคราะห์...</div>';
        return;
      }

      const query = searchInput ? searchInput.value.trim() : '';
      if (query) {
        renderSearchResults(query);
        return;
      }

      if (currentMode === 'monthly') {
        container.innerHTML = window.ExecutiveInsights.generateExecutiveBriefing(PAC_DATA);
      } else if (currentMode === 'store') {
        const branch = (branchSelect ? branchSelect.value : '') || (state.ssaBranch !== 'ALL' ? state.ssaBranch : 'SSA1');
        container.innerHTML = window.ExecutiveInsights.generateStoreVisitBriefing(PAC_DATA, branch);
      } else if (currentMode === 'strategic') {
        container.innerHTML = window.ExecutiveInsights.generateStrategicOpportunities(PAC_DATA);
      }
      container.scrollTop = 0;
    };

    const openDrawer = () => {
      drawer.classList.add('active');
      drawerOverlay.classList.add('active');
      renderCurrentMode();
    };

    const closeDrawer = () => {
      drawer.classList.remove('active');
      drawerOverlay.classList.remove('active');
    };

    triggerBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    const setActiveBtn = (activeBtn) => {
      [btnMonthly, btnStore, btnStrategic].forEach(b => {
        if (b) b.classList.remove('active');
      });
      if (activeBtn) activeBtn.classList.add('active');
    };

    if (btnMonthly) {
      btnMonthly.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentMode = 'monthly';
        setActiveBtn(btnMonthly);
        renderCurrentMode();
      });
    }

    if (btnStore) {
      btnStore.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentMode = 'store';
        setActiveBtn(btnStore);
        renderCurrentMode();
      });
    }

    if (btnStrategic) {
      btnStrategic.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        currentMode = 'strategic';
        setActiveBtn(btnStrategic);
        renderCurrentMode();
      });
    }

    if (branchSelect) {
      branchSelect.addEventListener('change', () => {
        if (searchInput) searchInput.value = '';
        currentMode = 'store';
        setActiveBtn(btnStore);
        renderCurrentMode();
      });
    }

    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          renderCurrentMode();
        }, 120);
      });
    }
  };

  // ==============================================================================
  // INITIALIZATION
  // ==============================================================================
  initTheme();
  initPinLockSecurity();
  initNav();
  initSSAControls();
  initKSDControls();
  initExecutiveInsightsUI();
  renderCurrentTab();
  console.log("Pharma Alliance Dashboard initialized successfully.");
});


