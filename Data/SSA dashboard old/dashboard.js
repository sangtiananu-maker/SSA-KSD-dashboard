// SSA Pharmacy Incentive Sales Dashboard Logic (v3 - Bilingual & Sidebar & Metric Toggle)

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. STATE & GLOBAL CONFIGURATION
    // -------------------------------------------------------------
    const state = {
        theme: localStorage.getItem('theme') || 'dark',
        lang: localStorage.getItem('lang') || 'th',
        nameMode: localStorage.getItem('nameMode') || 'real',
        reportType: 'monthly',
        selectedTime: '',
        selectedBranch: 'SSA1',
        metricType: 'qty',           // 'qty' | 'incentive'
        highlightProducts: [],
        charts: {}
    };

    const branches = ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7'];

    const colors = {
        branches: {
            SSA1: '#6366f1',
            SSA2: '#06b6d4',
            SSA3: '#10b981',
            SSA5: '#f59e0b',
            SSA6: '#ec4899',
            SSA7: '#8b5cf6'
        },
        chartPalette: ['#6366f1','#06b6d4','#10b981','#f59e0b','#ec4899','#8b5cf6','#ef4444','#14b8a6','#f97316','#a855f7'],
        success: '#10b981',
        danger:  '#f43f5e'
    };

    // -------------------------------------------------------------
    // 1.5 BILINGUAL DICTIONARY
    // -------------------------------------------------------------
    const i18n = {
        th: {
            lang_label: "ภาษา / Language",
            report_type_label: "รูปแบบรายงาน",
            report_monthly: "รายเดือน",
            report_ytd: "Year to Date (YTD)",
            report_yearly: "รายปี",
            report_yoy: "เปรียบเทียบปี (YoY)",
            select_month: "เลือกเดือน",
            display_by: "แสดงผลตาม",
            metric_qty: "จำนวนยูนิต",
            metric_incentive: "มูลค่าค่าเชียร์",
            display_mode: "โหมดการแสดงผล",
            light_mode: "โหมดสว่าง",
            dark_mode: "โหมดมืด",
            kpi_total_qty: "ยอดขายสะสม (ยูนิต)",
            kpi_total_incentive: "ค่าเชียร์รวม (บาท)",
            kpi_top_branch: "สาขาที่ยอดขายสูงสุด",
            kpi_top_product: "สินค้าขายดีที่สุด",
            chart_branch_trend_title: "แนวโน้มผลงานรายสาขา",
            chart_branch_trend_sub: "ยอดขายรายเดือนในแต่ละสาขา",
            chart_branch_share_title: "สัดส่วนยอดขายรายสาขา",
            chart_branch_share_sub: "สัดส่วนจำนวนยูนิตที่ขายได้ในแต่ละสาขา",
            chart_highlight_title: "แนวโน้มยอดขายสินค้าไฮไลท์",
            chart_highlight_sub: "เลือกสินค้าที่ต้องการดูแนวโน้มการเติบโตย้อนหลัง 14 เดือน",
            chart_products_title: "อันดับสินค้าทั้งหมด",
            chart_products_sub: "เรียงลำดับสินค้าทั้งหมดจากยอดขายมากไปน้อย",
            chart_drivers_title: "ตัวขับเคลื่อนยอดขาย (Growth & Drop Drivers)",
            chart_drivers_sub: "เปรียบเทียบยอดขายกับช่วงก่อนหน้าเพื่อหาตัวเร่งและตัวดึงยอดขายรายสาขา",
            growth_title: "Top 5 ขยายตัวสูงสุด (Growth)",
            drop_title: "Top 5 หดตัวสูงสุด (Drop)",
            
            // Dynamic ones
            qty_label: "จำนวน (ยูนิต)",
            incentive_label: "ค่าเชียร์ (บาท)",
            qty_suffix: " ยูนิต",
            incentive_suffix: " ฿",
            comp_yoy: "เทียบปี 2025",
            comp_prior: "เทียบช่วงก่อนหน้า",
            monthly_subtitle: "ภาพรวมยอดขายสินค้าค่าเชียร์ รายเดือน",
            ytd_subtitle: "ภาพรวม Year to Date (YTD)",
            yearly_subtitle: "ภาพรวมรายปี",
            yoy_subtitle: "เปรียบเทียบยอดขาย Year-over-Year (YoY)",
            drivers_qty_sub: "เปรียบเทียบจำนวนยูนิตกับช่วงก่อนหน้า",
            drivers_inc_sub: "เปรียบเทียบมูลค่าค่าเชียร์กับช่วงก่อนหน้า",
            
            time_select_month: "เลือกเดือน",
            time_select_ytd: "ถึงเดือน (YTD)",
            time_select_year: "เลือกปี",
            time_select_yoy: "เลือกเดือนเปรียบเทียบ",
            
            branch_trend_yoy_title: "ยอดขายรายสาขา เปรียบเทียบ YoY",
            branch_trend_yoy_sub: "ปี 2025 vs 2026",
            branch_share_yoy_title: "ค่าเชียร์รายสาขา เปรียบเทียบ YoY",
            branch_share_yoy_sub: "แยกตามสาขาและปี",
            branch_trend_std_title: "แนวโน้มผลงานรายสาขา",
            branch_trend_std_sub: "รายเดือน (ทุกสาขา)",
            branch_share_std_title: "สัดส่วนยอดขายรายสาขา",
            branch_share_std_sub: "ในแต่ละสาขา",
            
            products_yoy_title: "อันดับสินค้าเปรียบเทียบ YoY",
            products_yoy_sub: "อันดับสินค้าทั้งหมด เรียงจากมากไปน้อยตาม ปี 2025 vs 2026",
            products_std_title: "อันดับสินค้าทั้งหมด",
            products_std_sub: "เรียงลำดับสินค้าทั้งหมดจากยอดขายมากไปน้อยตาม",
            
            empty_comparison: "ไม่มีข้อมูลเปรียบเทียบในช่วงเวลานี้",
            empty_growth: "ไม่มีสินค้าที่มีการขยายตัว",
            empty_drop: "ไม่มีสินค้าที่มีการหดตัว",
            
            alert_max_highlight: "เลือกได้สูงสุด 8 รายการ",
            year_prefix: "ปี ",
            year_2025: "ปี 2025",
            year_2026: "ปี 2026",
            growth_legend: "เติบโต",
            drop_legend: "หดตัว",
            growth_legend_qty: "เติบโต (+ยูนิต)",
            growth_legend_inc: "เติบโต (+บาท)",
            drop_legend_qty: "หดตัว (-ยูนิต)",
            drop_legend_inc: "หดตัว (-บาท)",
            name_mode_label: "โหมดแสดงชื่อสินค้า",
            name_mode_real: "ชื่อจริง (Real)",
            name_mode_blinded: "ปกปิด (Blinded)",
            ai_summary_title: "✨ AI Insights Summary",
            ai_summary_subtitle: "บทวิเคราะห์และข้อเสนอแนะเชิงกลยุทธ์เชิงลึกจาก AI",
            ai_product_title: "🧠 AI Product Analysis",
            ai_product_subtitle: "บทวิเคราะห์รายผลิตภัณฑ์เชิงลึกประจำงวด"
        },
        en: {
            lang_label: "Language / ภาษา",
            report_type_label: "Report Type",
            report_monthly: "Monthly",
            report_ytd: "Year to Date (YTD)",
            report_yearly: "Yearly",
            report_yoy: "Year-over-Year (YoY)",
            select_month: "Select Month",
            display_by: "Display By",
            metric_qty: "Quantity Units",
            metric_incentive: "Incentive Value",
            display_mode: "Display Mode",
            light_mode: "Light Mode",
            dark_mode: "Dark Mode",
            kpi_total_qty: "Cumulative Sales (Units)",
            kpi_total_incentive: "Total Incentive (Baht)",
            kpi_top_branch: "Top Sales Branch",
            kpi_top_product: "Best Selling Product",
            chart_branch_trend_title: "Performance Trend by Branch",
            chart_branch_trend_sub: "Monthly sales in each branch",
            chart_branch_share_title: "Sales Share by Branch",
            chart_branch_share_sub: "Share of units sold in each branch",
            chart_highlight_title: "Highlight Products Sales Trend",
            chart_highlight_sub: "Select products to view growth trend for the past 14 months",
            chart_products_title: "All Products Ranking",
            chart_products_sub: "Rank all products from most to least sales",
            chart_drivers_title: "Sales Drivers (Growth & Drop Drivers)",
            chart_drivers_sub: "Compare sales with prior period to find growth and drop drivers per branch",
            growth_title: "Top 5 Growth Drivers",
            drop_title: "Top 5 Drop Drivers",
            
            // Dynamic ones
            qty_label: "Quantity (Units)",
            incentive_label: "Incentive (Baht)",
            qty_suffix: " Units",
            incentive_suffix: " ฿",
            comp_yoy: "vs 2025",
            comp_prior: "vs prior period",
            monthly_subtitle: "Monthly Incentive Sales Overview",
            ytd_subtitle: "Year to Date (YTD) Overview",
            yearly_subtitle: "Yearly Overview",
            yoy_subtitle: "Year-over-Year (YoY) Sales Comparison",
            drivers_qty_sub: "Compare unit quantities with prior period",
            drivers_inc_sub: "Compare incentive values with prior period",
            
            time_select_month: "Select Month",
            time_select_ytd: "Up to Month (YTD)",
            time_select_year: "Select Year",
            time_select_yoy: "Select Compare Month",
            
            branch_trend_yoy_title: "Branch Sales Comparison (YoY)",
            branch_trend_yoy_sub: "2025 vs 2026",
            branch_share_yoy_title: "Branch Incentives Comparison (YoY)",
            branch_share_yoy_sub: "by Branch and Year",
            branch_trend_std_title: "Performance Trend by Branch",
            branch_trend_std_sub: "Monthly (All Branches)",
            branch_share_std_title: "Sales Share by Branch",
            branch_share_std_sub: "for each branch",
            
            products_yoy_title: "Product Rankings Comparison (YoY)",
            products_yoy_sub: "All products ranked from most to least by 2025 vs 2026",
            products_std_title: "All Products Ranked",
            products_std_sub: "Rank all products from most to least by",
            
            empty_comparison: "No comparison data available for this period",
            empty_growth: "No products with growth",
            empty_drop: "No products with drop",
            
            alert_max_highlight: "Maximum of 8 items can be selected",
            year_prefix: "Year ",
            year_2025: "Year 2025",
            year_2026: "Year 2026",
            growth_legend: "Growth",
            drop_legend: "Drop",
            growth_legend_qty: "Growth (+units)",
            growth_legend_inc: "Growth (+Baht)",
            drop_legend_qty: "Drop (-units)",
            drop_legend_inc: "Drop (-Baht)",
            name_mode_label: "Product Name Mode",
            name_mode_real: "Real Name",
            name_mode_blinded: "Blinded",
            ai_summary_title: "✨ AI Insights Summary",
            ai_summary_subtitle: "In-depth analysis and strategic recommendations from AI",
            ai_product_title: "🧠 AI Product Analysis",
            ai_product_subtitle: "Deep dive analysis per product for the selected period"
        }
    };

    const t = key => {
        if (i18n[state.lang] && i18n[state.lang][key] !== undefined) {
            return i18n[state.lang][key];
        }
        return key;
    };

    const updateLanguageUI = () => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[state.lang] && i18n[state.lang][key]) {
                el.textContent = i18n[state.lang][key];
            }
        });
    };

    // -------------------------------------------------------------
    // 2. FORMATTING HELPERS
    // -------------------------------------------------------------
    salesData.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month_num - b.month_num);

    const fmtNum   = v => Math.round(v).toLocaleString('th-TH');
    const fmtBaht  = v => '฿' + Math.round(v).toLocaleString('th-TH');

    const fmtMetric = v => state.metricType === 'qty' ? fmtNum(v) : fmtBaht(v);
    const metricLabel = () => state.metricType === 'qty' ? t('qty_label') : t('incentive_label');
    const metricSuffix = () => state.metricType === 'qty' ? t('qty_suffix') : t('incentive_suffix');

    const getEnMonthLabel = dk => {
        const [y, m] = dk.split('-');
        return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1] + ' ' + y;
    };
    const getThaiMonthLabel = dk => {
        const [y, m] = dk.split('-');
        const th = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
        return `${th[+m-1]} ${+y + 543}`;
    };

    // Get metric value from a product record for a specific branch or total
    const getProductMetric = (product, branch) => {
        if (state.metricType === 'qty') {
            return branch ? (product.branches[branch] || 0) : product.total_qty;
        } else {
            const qty = branch ? (product.branches[branch] || 0) : product.total_qty;
            return qty * product.incentive_price;
        }
    };

    // -------------------------------------------------------------
    // 3. COMPUTE ALL UNIQUE PRODUCTS & DEFAULT HIGHLIGHTS
    // -------------------------------------------------------------
    const allUniqueProducts = [...new Set(salesData.flatMap(m => m.products.map(p => p.product_name)))];

    const productMapping = {};
    [...allUniqueProducts].sort().forEach((name, idx) => {
        productMapping[name] = `Product ${(idx + 1).toString().padStart(2, '0')}`;
    });

    const getProductName = (name) => {
        if (state.nameMode === 'blinded') {
            return productMapping[name] || name;
        }
        return name;
    };

    const computeTop5 = () => {
        const totals = {};
        salesData.forEach(m => m.products.forEach(p => {
            totals[p.product_name] = (totals[p.product_name] || 0) + getProductMetric(p, null);
        }));
        return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
    };

    state.highlightProducts = computeTop5();

    // -------------------------------------------------------------
    // 4. THEME
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon      = document.getElementById('themeIcon');
    const themeText      = document.getElementById('themeText');

    const applyTheme = theme => {
        document.documentElement.setAttribute('data-theme', theme);
        state.theme = theme;
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
            themeText.setAttribute('data-i18n', 'light_mode');
            themeText.textContent = t('light_mode');
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            themeText.setAttribute('data-i18n', 'dark_mode');
            themeText.textContent = t('dark_mode');
        }
        Object.values(state.charts).forEach(c => {
            if (c && typeof c.updateOptions === 'function') {
                c.updateOptions({ theme: { mode: theme } }, false, false);
            }
        });
    };

    applyTheme(state.theme);
    themeToggleBtn.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));

    // -------------------------------------------------------------
    // 5. POPULATE TIME DROPDOWN
    // -------------------------------------------------------------
    const timeSelect      = document.getElementById('timeSelect');
    const timeFilterLabel = document.getElementById('timeFilterLabel');

    const populateTimeDropdown = () => {
        timeSelect.innerHTML = '';
        const enMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

        if (state.reportType === 'monthly' || state.reportType === 'ytd') {
            timeFilterLabel.innerHTML = '<i class="fa-regular fa-calendar"></i> ' + t(state.reportType === 'ytd' ? 'time_select_ytd' : 'time_select_month');
            [...salesData].reverse().forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.date_key;
                opt.textContent = state.lang === 'th' ? getThaiMonthLabel(m.date_key) : getEnMonthLabel(m.date_key);
                timeSelect.appendChild(opt);
            });
            state.selectedTime = salesData[salesData.length - 1].date_key;
        } else if (state.reportType === 'yearly') {
            timeFilterLabel.innerHTML = '<i class="fa-regular fa-calendar"></i> ' + t('time_select_year');
            const years = [...new Set(salesData.map(m => m.year))].sort().reverse();
            years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y.toString();
                opt.textContent = state.lang === 'th' ? `ปี ${y + 543}` : `${t('year_prefix')}${y}`;
                timeSelect.appendChild(opt);
            });
            state.selectedTime = years[0].toString();
        } else if (state.reportType === 'yoy') {
            timeFilterLabel.innerHTML = '<i class="fa-regular fa-calendar"></i> ' + t('time_select_yoy');
            const m25 = new Set(salesData.filter(m => m.year === 2025).map(m => m.month_num));
            const m26 = new Set(salesData.filter(m => m.year === 2026).map(m => m.month_num));
            const overlap = [...m25].filter(m => m26.has(m)).sort();
            overlap.forEach(mn => {
                const opt = document.createElement('option');
                opt.value = mn.toString();
                opt.textContent = state.lang === 'th' ? 
                    ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'][mn - 1] : 
                    enMonths[mn - 1];
                timeSelect.appendChild(opt);
            });
            state.selectedTime = overlap.length ? overlap[overlap.length - 1].toString() : '';
        }

        if (timeSelect.options.length > 0) timeSelect.value = state.selectedTime || timeSelect.options[0].value;
        state.selectedTime = timeSelect.value;
    };

    // -------------------------------------------------------------
    // 6. DATA PROCESSING ENGINE
    // -------------------------------------------------------------
    const processData = () => {
        let currentData = [], priorData = [];
        let hasComparison = false;

        if (state.reportType === 'monthly') {
            const idx = salesData.findIndex(m => m.date_key === state.selectedTime);
            if (idx !== -1) {
                currentData = [salesData[idx]];
                if (idx > 0) { priorData = [salesData[idx - 1]]; hasComparison = true; }
            }
        } else if (state.reportType === 'ytd') {
            const [sy, sm] = state.selectedTime.split('-').map(Number);
            currentData = salesData.filter(m => m.year === sy && m.month_num <= sm);
            priorData   = salesData.filter(m => m.year === sy - 1 && m.month_num <= sm);
            hasComparison = priorData.length > 0;
        } else if (state.reportType === 'yearly') {
            const sy = parseInt(state.selectedTime);
            currentData = salesData.filter(m => m.year === sy);
            priorData   = salesData.filter(m => m.year === sy - 1);
            hasComparison = priorData.length > 0;
        } else if (state.reportType === 'yoy') {
            const mn = parseInt(state.selectedTime);
            priorData   = salesData.filter(m => m.year === 2025 && m.month_num === mn);
            currentData = salesData.filter(m => m.year === 2026 && m.month_num === mn);
            hasComparison = priorData.length > 0 && currentData.length > 0;
        }

        // Aggregate by branch and product for CURRENT period
        const branchTotals  = {};
        const productTotals = {};
        branches.forEach(b => { branchTotals[b] = { qty: 0, incentive: 0 }; });

        currentData.forEach(m => {
            m.products.forEach(p => {
                if (!productTotals[p.product_name]) productTotals[p.product_name] = { qty: 0, incentive: 0 };
                productTotals[p.product_name].qty       += p.total_qty;
                productTotals[p.product_name].incentive += p.total_incentive;
                branches.forEach(b => {
                    branchTotals[b].qty       += p.branches[b] || 0;
                    branchTotals[b].incentive += (p.branches[b] || 0) * p.incentive_price;
                });
            });
        });

        // KPIs
        const totalQty       = Object.values(branchTotals).reduce((s, b) => s + b.qty,       0);
        const totalIncentive = Object.values(branchTotals).reduce((s, b) => s + b.incentive, 0);

        // Primary metric total (switches by toggle)
        const metricTotals   = {};
        branches.forEach(b => { metricTotals[b] = state.metricType === 'qty' ? branchTotals[b].qty : branchTotals[b].incentive; });

        // Find top branch by current metric
        const topBranchEntry = Object.entries(metricTotals).sort((a, b) => b[1] - a[1])[0];
        const topBranchName  = topBranchEntry ? topBranchEntry[0] : '-';
        const topBranchVal   = topBranchEntry ? topBranchEntry[1] : 0;

        // Find top product by current metric
        const sortedProducts = Object.entries(productTotals)
            .map(([name, v]) => ({ name, qty: v.qty, incentive: v.incentive, metricVal: state.metricType === 'qty' ? v.qty : v.incentive }))
            .sort((a, b) => b.metricVal - a.metricVal);
        const topProduct = sortedProducts.length ? sortedProducts[0] : null;

        // % change vs prior period
        let qtyDiffPct = null, incDiffPct = null;
        if (hasComparison) {
            const priorBranch = {};
            branches.forEach(b => { priorBranch[b] = { qty: 0, incentive: 0 }; });
            priorData.forEach(m => {
                m.products.forEach(p => {
                    branches.forEach(b => {
                        priorBranch[b].qty       += p.branches[b] || 0;
                        priorBranch[b].incentive += (p.branches[b] || 0) * p.incentive_price;
                    });
                });
            });
            const pQty = Object.values(priorBranch).reduce((s, b) => s + b.qty,       0);
            const pInc = Object.values(priorBranch).reduce((s, b) => s + b.incentive, 0);
            if (pQty  > 0) qtyDiffPct = ((totalQty       - pQty) / pQty)  * 100;
            if (pInc  > 0) incDiffPct = ((totalIncentive - pInc) / pInc)  * 100;
        }

        // Growth / Drop Drivers per branch (using active metric)
        const growthDropData = {};
        if (hasComparison) {
            const priorBP = {};
            const currBP  = {};
            branches.forEach(b => { priorBP[b] = {}; currBP[b] = {}; });

            priorData.forEach(m => m.products.forEach(p => branches.forEach(b => {
                priorBP[b][p.product_name] = (priorBP[b][p.product_name] || 0) + (state.metricType === 'qty' ? (p.branches[b] || 0) : (p.branches[b] || 0) * p.incentive_price);
            })));
            currentData.forEach(m => m.products.forEach(p => branches.forEach(b => {
                currBP[b][p.product_name] = (currBP[b][p.product_name] || 0) + (state.metricType === 'qty' ? (p.branches[b] || 0) : (p.branches[b] || 0) * p.incentive_price);
            })));

            branches.forEach(b => {
                const all = new Set([...Object.keys(currBP[b]), ...Object.keys(priorBP[b])]);
                const changes = [...all].map(pn => ({
                    product_name: pn,
                    diff: (currBP[b][pn] || 0) - (priorBP[b][pn] || 0),
                    currentVal: currBP[b][pn]  || 0,
                    priorVal:   priorBP[b][pn] || 0
                }));
                growthDropData[b] = {
                    growth: changes.filter(c => c.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 5),
                    drop:   changes.filter(c => c.diff < 0).sort((a, b) => a.diff - b.diff).slice(0, 5)
                };
            });
        } else {
            branches.forEach(b => { growthDropData[b] = { growth: [], drop: [] }; });
        }

        return {
            totalQty, totalIncentive,
            branchTotals, metricTotals,
            productTotals: sortedProducts,
            topBranchName, topBranchVal,
            topProduct,
            qtyDiffPct, incDiffPct,
            growthDropData, hasComparison,
            currentData, priorData
        };
    };

    // -------------------------------------------------------------
    // 7. APEX CHART BASE OPTIONS
    // -------------------------------------------------------------
    const baseChart = (overrides = {}) => ({
        theme:  { mode: state.theme },
        chart:  {
            background:  'transparent',
            foreColor:   'var(--text-secondary)',
            fontFamily:  'var(--font-primary)',
            toolbar:     { show: false },
            animations:  { enabled: true, speed: 400 },
            ...overrides
        }
    });

    const yAxisFmt = () => ({
        labels: {
            formatter: v => state.metricType === 'qty' ? fmtNum(v) : fmtBaht(v)
        },
        title: { text: metricLabel() }
    });

    const tooltipFmt = () => ({
        y: { formatter: v => fmtMetric(v) }
    });

    // -------------------------------------------------------------
    // 8. INIT CHARTS
    // -------------------------------------------------------------
    const initCharts = () => {
        // Branch Trend (Line)
        state.charts.branchTrend = new ApexCharts(document.querySelector('#branchTrendChart'), {
            ...baseChart({ type: 'line', height: 350, zoom: { enabled: false } }),
            stroke:  { width: 3, curve: 'smooth' },
            colors:  Object.values(colors.branches),
            series:  [],
            xaxis:   { categories: [] },
            yaxis:   yAxisFmt(),
            tooltip: { shared: true, intersect: false, ...tooltipFmt() },
            legend:  { position: 'bottom' }
        });
        state.charts.branchTrend.render();

        // Branch Share (Donut)
        state.charts.branchShare = new ApexCharts(document.querySelector('#branchShareChart'), {
            ...baseChart({ type: 'donut', height: 350 }),
            colors:  Object.values(colors.branches),
            labels:  [],
            series:  [],
            legend:  { position: 'bottom' },
            tooltip: { y: { formatter: (v, { seriesIndex, w }) => fmtMetric(v) } }
        });
        state.charts.branchShare.render();

        // Highlight Products Trend
        state.charts.highlightTrend = new ApexCharts(document.querySelector('#highlightTrendChart'), {
            ...baseChart({ type: 'line', height: 350, zoom: { enabled: false } }),
            stroke:  { width: 3, curve: 'smooth' },
            colors:  colors.chartPalette,
            series:  [],
            xaxis:   { categories: [] },
            yaxis:   yAxisFmt(),
            tooltip: { shared: true, intersect: false, ...tooltipFmt() }
        });
        state.charts.highlightTrend.render();

        // Top Products (Horizontal Bar)
        state.charts.topProducts = new ApexCharts(document.querySelector('#topProductsChart'), {
            ...baseChart({ type: 'bar', height: 400 }),
            plotOptions: { bar: { horizontal: true, borderRadius: 4, distributed: true, barHeight: '70%' } },
            colors:  colors.chartPalette,
            series:  [{ data: [] }],
            xaxis:   { categories: [] },
            tooltip: tooltipFmt(),
            legend:  { show: false }
        });
        state.charts.topProducts.render();

        // Branch Growth (Horizontal Bar)
        state.charts.branchGrowth = new ApexCharts(document.querySelector('#branchGrowthChart'), {
            ...baseChart({ type: 'bar', height: 250 }),
            plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
            colors:  [colors.success],
            series:  [{ name: t('growth_legend'), data: [] }],
            xaxis:   { categories: [] },
            tooltip: tooltipFmt()
        });
        state.charts.branchGrowth.render();

        // Branch Drop (Horizontal Bar)
        state.charts.branchDrop = new ApexCharts(document.querySelector('#branchDropChart'), {
            ...baseChart({ type: 'bar', height: 250 }),
            plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
            colors:  [colors.danger],
            series:  [{ name: t('drop_legend'), data: [] }],
            xaxis:   { categories: [] },
            tooltip: tooltipFmt()
        });
        state.charts.branchDrop.render();
    };

    // -------------------------------------------------------------
    // 9. RENDER / UPDATE DASHBOARD
    // -------------------------------------------------------------
    const renderDiffBadge = (el, pct, compLabel) => {
        el.className = 'kpi-diff';
        el.innerHTML = '';
        if (pct === null) return;
        const sign = pct >= 0 ? '+' : '';
        el.className = `kpi-diff ${pct >= 0 ? 'positive' : 'negative'}`;
        el.innerHTML = `<i class="fa-solid fa-${pct >= 0 ? 'arrow-up' : 'arrow-down'}"></i>${sign}${pct.toFixed(1)}% <span style="color:var(--text-muted);font-weight:normal;margin-left:4px;">(${compLabel})</span>`;
    };

    const compLabel = () => state.reportType === 'yoy' ? t('comp_yoy') : t('comp_prior');

    const truncate = (str, n) => str.length > n ? str.substring(0, n) + '…' : str;

    const updateDashboard = () => {
        const d = processData();

        // ---- KPI CARDS ----
        document.getElementById('kpiTotalQty').textContent       = fmtNum(d.totalQty);
        document.getElementById('kpiTotalIncentive').textContent  = fmtBaht(d.totalIncentive);
        document.getElementById('kpiTopBranch').textContent       = d.topBranchName !== '-'
            ? `${d.topBranchName} (${fmtMetric(d.topBranchVal)})`
            : '-';
        const topProdEl = document.getElementById('kpiTopProduct');
        topProdEl.textContent = d.topProduct
            ? `${truncate(getProductName(d.topProduct.name), 30)} (${fmtMetric(d.topProduct.metricVal)})`
            : '-';

        // diff badges
        renderDiffBadge(document.getElementById('kpiTotalQtyDiff'),       d.qtyDiffPct, compLabel());
        renderDiffBadge(document.getElementById('kpiTotalIncentiveDiff'),  d.incDiffPct, compLabel());

        // Page subtitle
        const subTitles = { 
            monthly: t('monthly_subtitle'), 
            ytd: t('ytd_subtitle'), 
            yearly: t('yearly_subtitle'), 
            yoy: t('yoy_subtitle') 
        };
        document.getElementById('pageSubTitle').textContent = subTitles[state.reportType] || '';

        // Drivers subtitle
        document.getElementById('driversCardSubtitle').textContent = state.metricType === 'qty'
            ? t('drivers_qty_sub')
            : t('drivers_inc_sub');

        // ---- BRANCH TREND ----
        if (state.reportType === 'yoy') {
            const mn = parseInt(state.selectedTime);
            const getVal = (year, b) => {
                let total = 0;
                salesData.filter(m => m.year === year && m.month_num === mn).forEach(m =>
                    m.products.forEach(p => { total += state.metricType === 'qty' ? (p.branches[b] || 0) : (p.branches[b] || 0) * p.incentive_price; })
                );
                return total;
            };
            document.getElementById('branchTrendTitle').innerHTML = `<i class="fa-solid fa-chart-bar"></i> ${t('branch_trend_yoy_title')}`;
            document.getElementById('branchTrendSubtitle').textContent = `${metricLabel()} ${t('branch_trend_yoy_sub')}`;
            state.charts.branchTrend.updateOptions({ chart: { type: 'bar' }, stroke: { width: 0 }, xaxis: { categories: branches }, yaxis: yAxisFmt(), tooltip: { shared: true, intersect: false, ...tooltipFmt() }, colors: ['#06b6d4', '#6366f1'] });
            state.charts.branchTrend.updateSeries([
                { name: '2025', data: branches.map(b => getVal(2025, b)) },
                { name: '2026', data: branches.map(b => getVal(2026, b)) }
            ]);

            document.getElementById('branchShareTitle').innerHTML = `<i class="fa-solid fa-hand-holding-dollar"></i> ${t('branch_share_yoy_title')}`;
            document.getElementById('branchShareSubtitle').textContent = `${metricLabel()} ${t('branch_share_yoy_sub')}`;
            state.charts.branchShare.updateOptions({ chart: { type: 'bar' }, xaxis: { categories: branches }, yaxis: yAxisFmt(), tooltip: { shared: true, intersect: false, ...tooltipFmt() }, colors: ['#10b981', '#8b5cf6'], labels: [], legend: { show: true, position: 'bottom' }, plotOptions: { bar: { horizontal: false, columnWidth: '55%' } } });
            state.charts.branchShare.updateSeries([
                { name: '2025', data: branches.map(b => { let t = 0; salesData.filter(m => m.year === 2025 && m.month_num === mn).forEach(m => m.products.forEach(p => { t += state.metricType === 'qty' ? (p.branches[b] || 0) : (p.branches[b] || 0) * p.incentive_price; })); return t; }) },
                { name: '2026', data: branches.map(b => { let t = 0; salesData.filter(m => m.year === 2026 && m.month_num === mn).forEach(m => m.products.forEach(p => { t += state.metricType === 'qty' ? (p.branches[b] || 0) : (p.branches[b] || 0) * p.incentive_price; })); return t; }) }
            ]);
        } else {
            document.getElementById('branchTrendTitle').innerHTML = `<i class="fa-solid fa-chart-area"></i> ${t('branch_trend_std_title')}`;
            document.getElementById('branchTrendSubtitle').textContent = `${metricLabel()} ${t('branch_trend_std_sub')}`;
            state.charts.branchTrend.updateOptions({ chart: { type: 'line' }, stroke: { width: 3, curve: 'smooth' }, xaxis: { categories: salesData.map(m => state.lang === 'th' ? getThaiMonthLabel(m.date_key) : getEnMonthLabel(m.date_key)) }, yaxis: yAxisFmt(), tooltip: { shared: true, intersect: false, ...tooltipFmt() }, colors: Object.values(colors.branches) });
            state.charts.branchTrend.updateSeries(branches.map(b => ({
                name: b,
                data: salesData.map(m => {
                    let total = 0;
                    m.products.forEach(p => { total += state.metricType === 'qty' ? (p.branches[b] || 0) : (p.branches[b] || 0) * p.incentive_price; });
                    return total;
                })
            })));

            document.getElementById('branchShareTitle').innerHTML = `<i class="fa-solid fa-chart-pie"></i> ${t('branch_share_std_title')}`;
            document.getElementById('branchShareSubtitle').textContent = `${t('branch_share_std_sub')} ${metricLabel()}`;
            state.charts.branchShare.updateOptions({ chart: { type: 'donut' }, labels: branches, colors: Object.values(colors.branches), legend: { show: true, position: 'bottom' }, tooltip: { y: { formatter: v => fmtMetric(v) } } });
            state.charts.branchShare.updateSeries(branches.map(b => d.metricTotals[b]));
        }

        // ---- ALL PRODUCTS (RANKED MOST TO LEAST) ----
        const chartProducts = d.productTotals;
        const chartHeight = Math.max(350, chartProducts.length * 30);

        // Calculate ranking indicators compared to prior period
        const indicators = {};
        const priorProductTotals = {};
        if (d.hasComparison) {
            d.priorData.forEach(m => {
                m.products.forEach(p => {
                    const name = p.product_name;
                    priorProductTotals[name] = (priorProductTotals[name] || 0) + getProductMetric(p, null);
                });
            });
            const sortedPrior = Object.entries(priorProductTotals)
                .map(([name, val]) => ({ name, val }))
                .sort((a, b) => b.val - a.val);
            const priorRanks = {};
            sortedPrior.forEach((p, idx) => { priorRanks[p.name] = idx; });

            chartProducts.forEach((p, currIdx) => {
                const priorIdx = priorRanks[p.name];
                if (priorIdx === undefined) {
                    indicators[p.name] = '🟢 ▲'; // New product
                } else if (priorIdx > currIdx) {
                    indicators[p.name] = '🟢 ▲'; // Rank improved
                } else if (priorIdx < currIdx) {
                    indicators[p.name] = '🔴 ▼'; // Rank worsened
                } else {
                    indicators[p.name] = '🔵 ▬'; // Unchanged
                }
            });
        } else {
            chartProducts.forEach(p => {
                indicators[p.name] = ''; // No indicator if comparison not available
            });
        }

        const buildLabel = p => {
            const ind = indicators[p.name];
            return (ind ? ind + ' ' : '') + truncate(getProductName(p.name), 35);
        };

        if (state.reportType === 'yoy') {
            const mn = parseInt(state.selectedTime);
            document.getElementById('topProductsTitle').innerHTML = `<i class="fa-solid fa-ranking-star"></i> ${t('products_yoy_title')}`;
            document.getElementById('topProductsSubtitle').textContent = `${t('products_yoy_sub').replace('${metricLabel()}', metricLabel())}`;
            const getProductVal = (year, pName) => { let t = 0; salesData.filter(m => m.year === year && m.month_num === mn).forEach(m => { const found = m.products.find(p => p.product_name === pName); if (found) t += state.metricType === 'qty' ? found.total_qty : found.total_incentive; }); return t; };
            state.charts.topProducts.updateOptions({ 
                chart: { height: chartHeight },
                plotOptions: { bar: { horizontal: true, distributed: false, borderRadius: 4 } }, 
                colors: ['#06b6d4', '#6366f1'], 
                xaxis: { 
                    type: 'category',
                    categories: chartProducts.map(buildLabel),
                    labels: { formatter: v => fmtMetric(v) }
                }, 
                yaxis: { 
                    labels: { formatter: v => v }
                }, 
                tooltip: { shared: true, intersect: false, y: { formatter: v => fmtMetric(v) } }, 
                legend: { show: true, position: 'bottom' } 
            });
            state.charts.topProducts.updateSeries([
                { name: t('year_2025'), data: chartProducts.map(p => getProductVal(2025, p.name)) },
                { name: t('year_2026'), data: chartProducts.map(p => getProductVal(2026, p.name)) }
            ]);
        } else {
            document.getElementById('topProductsTitle').innerHTML = `<i class="fa-solid fa-ranking-star"></i> ${t('products_std_title')}`;
            document.getElementById('topProductsSubtitle').textContent = `${t('products_std_sub')} ${metricLabel()}`;
            state.charts.topProducts.updateOptions({ 
                chart: { height: chartHeight },
                plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '70%' } }, 
                colors: colors.chartPalette, 
                xaxis: { 
                    type: 'category',
                    categories: chartProducts.map(buildLabel),
                    labels: { formatter: v => fmtMetric(v) }
                }, 
                yaxis: { 
                    labels: { formatter: v => v }
                }, 
                tooltip: { y: { formatter: v => fmtMetric(v) } }, 
                legend: { show: false } 
            });
            state.charts.topProducts.updateSeries([{ name: metricLabel(), data: chartProducts.map(p => p.metricVal) }]);
        }

        // ---- GROWTH / DROP ----
        if (!d.hasComparison) {
            ['branchGrowthChart', 'branchDropChart'].forEach(id => {
                document.getElementById(id).innerHTML = `<div class="empty-data-message"><p>${t('empty_comparison')}</p></div>`;
            });
        } else {
            renderBranchDrivers(d.growthDropData[state.selectedBranch]);
        }

        // ---- AI INSIGHTS ----
        updateAiSummary();
        updateAiProductAnalysis();
    };

    // ---- GROWTH/DROP CHARTS ----
    const renderBranchDrivers = (data) => {
        if (!data) return;
        const { growth, drop } = data;

        // Growth
        if (!growth.length) {
            document.getElementById('branchGrowthChart').innerHTML = `<div class="empty-data-message"><p>${t('empty_growth')}</p></div>`;
        } else {
            state.charts.branchGrowth.updateOptions({ 
                xaxis: { 
                    type: 'category', 
                    categories: growth.map(g => truncate(getProductName(g.product_name), 16)),
                    labels: { formatter: v => fmtMetric(v) }
                }, 
                yaxis: {
                    labels: { formatter: v => v }
                },
                tooltip: { y: { formatter: v => fmtMetric(v) } } 
            });
            const growthName = state.metricType === 'qty' ? t('growth_legend_qty') : t('growth_legend_inc');
            state.charts.branchGrowth.updateSeries([{ name: growthName, data: growth.map(g => g.diff) }]);
        }

        // Drop
        if (!drop.length) {
            document.getElementById('branchDropChart').innerHTML = `<div class="empty-data-message"><p>${t('empty_drop')}</p></div>`;
        } else {
            state.charts.branchDrop.updateOptions({ 
                xaxis: { 
                    type: 'category', 
                    categories: drop.map(d => truncate(getProductName(d.product_name), 16)),
                    labels: { formatter: v => fmtMetric(v) }
                }, 
                yaxis: {
                    labels: { formatter: v => v }
                },
                tooltip: { y: { formatter: v => fmtMetric(v) } } 
            });
            const dropName = state.metricType === 'qty' ? t('drop_legend_qty') : t('drop_legend_inc');
            state.charts.branchDrop.updateSeries([{ name: dropName, data: drop.map(d => d.diff) }]);
        }
    };

    // ---- HIGHLIGHT TREND (all 14 months, switches metric) ----
    const updateHighlightTrend = () => {
        document.getElementById('highlightTrendTitle').innerHTML = `<i class="fa-solid fa-star"></i> ${t('chart_highlight_title')}`;
        state.charts.highlightTrend.updateOptions({ 
            xaxis: { categories: salesData.map(m => state.lang === 'th' ? getThaiMonthLabel(m.date_key) : getEnMonthLabel(m.date_key)) }, 
            yaxis: yAxisFmt(), 
            tooltip: { shared: true, intersect: false, ...tooltipFmt() } 
        });
        state.charts.highlightTrend.updateSeries(state.highlightProducts.map(pName => ({
            name: getProductName(pName),
            data: salesData.map(m => {
                const found = m.products.find(p => p.product_name === pName);
                if (!found) return 0;
                return state.metricType === 'qty' ? found.total_qty : found.total_incentive;
            })
        })));
    };

    // ---- HIGHLIGHT CHECKLIST ----
    const buildHighlightChecklist = () => {
        const container = document.getElementById('highlightChecklist');
        container.innerHTML = '';
        const sortedProds = [...allUniqueProducts].sort((a, b) => 
            getProductName(a).localeCompare(getProductName(b))
        );
        sortedProds.forEach(p => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = p;
            cb.checked = state.highlightProducts.includes(p);
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    if (state.highlightProducts.length >= 8) { 
                        alert(t('alert_max_highlight')); 
                        cb.checked = false; 
                        return; 
                    }
                    state.highlightProducts.push(p);
                } else {
                    state.highlightProducts = state.highlightProducts.filter(x => x !== p);
                }
                updateHighlightTrend();
            });
            label.appendChild(cb);
            label.appendChild(document.createTextNode(getProductName(p)));
            container.appendChild(label);
        });
    };

    // ---- AI INSIGHTS RENDERING ----
    const updateAiSummary = () => {
        const contentContainer = document.getElementById('aiSummaryContent');
        if (!contentContainer) return;
        
        let insightsObj = null;
        if (typeof aiInsights !== 'undefined' && aiInsights[state.reportType]) {
            insightsObj = aiInsights[state.reportType][state.selectedTime];
        }
        
        if (!insightsObj) {
            contentContainer.innerHTML = `<p>${state.lang === 'th' ? 'ไม่มีข้อมูลบทวิเคราะห์สำหรับช่วงเวลานี้' : 'No AI summary analysis available for this period.'}</p>`;
            return;
        }
        
        let html = insightsObj[state.lang] || '';
        
        if (state.nameMode === 'blinded') {
            Object.keys(productMapping).forEach(realName => {
                html = html.replaceAll(realName, productMapping[realName]);
            });
        }
        
        contentContainer.innerHTML = html;
    };

    const populateAiProductDropdown = () => {
        const select = document.getElementById('aiProductSelect');
        if (!select) return;
        
        const currentSelected = select.value || '';
        select.innerHTML = '';
        
        const sortedProds = [...allUniqueProducts].sort((a, b) => 
            getProductName(a).localeCompare(getProductName(b))
        );
        
        sortedProds.forEach(pname => {
            const opt = document.createElement('option');
            opt.value = pname;
            opt.textContent = getProductName(pname);
            select.appendChild(opt);
        });
        
        if (currentSelected && allUniqueProducts.includes(currentSelected)) {
            select.value = currentSelected;
        } else if (select.options.length > 0) {
            select.value = select.options[0].value;
        }
    };

    const updateAiProductAnalysis = () => {
        const select = document.getElementById('aiProductSelect');
        const statsContainer = document.getElementById('aiProductStats');
        const contentContainer = document.getElementById('aiProductContent');
        if (!select || !statsContainer || !contentContainer) return;
        
        const pname = select.value;
        if (!pname) {
            statsContainer.innerHTML = '';
            contentContainer.innerHTML = `<p>${state.lang === 'th' ? 'กรุณาเลือกสินค้า...' : 'Please select a product...'}</p>`;
            return;
        }
        
        let prodInsights = null;
        if (typeof aiInsights !== 'undefined' && aiInsights.products && aiInsights.products[pname]) {
            const prodType = aiInsights.products[pname][state.reportType];
            if (prodType) {
                prodInsights = prodType[state.selectedTime];
            }
        }
        
        if (!prodInsights) {
            statsContainer.innerHTML = '';
            contentContainer.innerHTML = `<p>${state.lang === 'th' ? 'ไม่มีข้อมูลบทวิเคราะห์สำหรับสินค้านี้ในช่วงเวลานี้' : 'No analysis available for this product during the selected period.'}</p>`;
            return;
        }
        
        const stats = prodInsights.stats || { qty: 0, incentive: 0, rank: '-', growth: '-' };
        const labels = {
            th: { qty: "จำนวนยูนิต", incentive: "มูลค่าค่าเชียร์", rank: "อันดับสินค้า", growth: "เติบโต" },
            en: { qty: "Units Sold", incentive: "Total Incentive", rank: "Product Rank", growth: "Growth Rate" }
        };
        const langLabels = labels[state.lang] || labels.en;
        const incentiveFormatted = '฿' + Math.round(stats.incentive).toLocaleString('th-TH');
        
        statsContainer.innerHTML = `
            <div class="ai-stat-badge">
                <span class="ai-stat-name">${langLabels.qty}</span>
                <span class="ai-stat-val">${stats.qty.toLocaleString('th-TH')}</span>
            </div>
            <div class="ai-stat-badge">
                <span class="ai-stat-name">${langLabels.incentive}</span>
                <span class="ai-stat-val">${incentiveFormatted}</span>
            </div>
            <div class="ai-stat-badge">
                <span class="ai-stat-name">${langLabels.rank}</span>
                <span class="ai-stat-val">${stats.rank}</span>
            </div>
            <div class="ai-stat-badge">
                <span class="ai-stat-name">${langLabels.growth}</span>
                <span class="ai-stat-val" style="color: ${stats.growth.startsWith('-') ? 'var(--danger)' : stats.growth.startsWith('+') ? 'var(--success)' : 'var(--ai-badge-text)'}">${stats.growth}</span>
            </div>
        `;
        
        let html = prodInsights[state.lang] || '';
        if (state.nameMode === 'blinded') {
            Object.keys(productMapping).forEach(realName => {
                html = html.replaceAll(realName, productMapping[realName]);
            });
        }
        
        contentContainer.innerHTML = html;
    };

    // -------------------------------------------------------------
    // 10. EVENT LISTENERS
    // -------------------------------------------------------------
    // Report type
    document.getElementById('reportTypeGroup').addEventListener('click', e => {
        if (!e.target.classList.contains('sidebar-tab-btn-control')) return;
        document.querySelectorAll('.sidebar-tab-btn-control').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.reportType = e.target.dataset.type;
        populateTimeDropdown();
        updateDashboard();
    });

    // Time select
    timeSelect.addEventListener('change', () => {
        state.selectedTime = timeSelect.value;
        updateDashboard();
    });

    // Metric toggle
    document.getElementById('metricTypeGroup').addEventListener('click', e => {
        const btn = e.target.closest('.metric-toggle-btn');
        if (!btn) return;
        document.querySelectorAll('.metric-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.metricType = btn.dataset.metric;
        state.highlightProducts = computeTop5();   // recalc top 5 by new metric
        buildHighlightChecklist();
        updateDashboard();
        updateHighlightTrend();
    });

    // Branch tabs
    document.getElementById('branchTabs').addEventListener('click', e => {
        if (!e.target.classList.contains('branch-tab-btn')) return;
        document.querySelectorAll('.branch-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.selectedBranch = e.target.dataset.branch;
        const d = processData();
        renderBranchDrivers(d.growthDropData[state.selectedBranch]);
    });

    // Language selector dropdown change
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = state.lang;
        langSelect.addEventListener('change', e => {
            state.lang = e.target.value;
            localStorage.setItem('lang', state.lang);
            updateLanguageUI();
            
            // Recompute / repopulate components
            populateTimeDropdown();
            updateDashboard();
            updateHighlightTrend();
        });
    }

    // Product Name Mode selector
    const nameModeGroup = document.getElementById('nameModeGroup');
    if (nameModeGroup) {
        nameModeGroup.addEventListener('click', e => {
            const btn = e.target.closest('.metric-toggle-btn');
            if (!btn) return;
            document.querySelectorAll('#nameModeGroup .metric-toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.nameMode = btn.dataset.mode;
            localStorage.setItem('nameMode', state.nameMode);
            
            // Re-populate dropdown and checklist with correct names
            populateAiProductDropdown();
            buildHighlightChecklist();
            
            // Re-render dashboard
            updateDashboard();
            updateHighlightTrend();
        });
    }

    // AI Product Select change
    const aiProductSelect = document.getElementById('aiProductSelect');
    if (aiProductSelect) {
        aiProductSelect.addEventListener('change', () => {
            updateAiProductAnalysis();
        });
    }

    // -------------------------------------------------------------
    // 11. BOOTSTRAP
    // -------------------------------------------------------------
    // Initialize Name Mode Active State
    const activeNameModeBtn = document.querySelector(`#nameModeGroup .metric-toggle-btn[data-mode="${state.nameMode}"]`);
    if (activeNameModeBtn) {
        document.querySelectorAll('#nameModeGroup .metric-toggle-btn').forEach(b => b.classList.remove('active'));
        activeNameModeBtn.classList.add('active');
    }

    updateLanguageUI();
    populateAiProductDropdown();
    buildHighlightChecklist();
    populateTimeDropdown();
    initCharts();
    updateDashboard();
    updateHighlightTrend();
});
