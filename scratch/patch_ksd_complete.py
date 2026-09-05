import re

print("Drafting complete KSD Tab patch for app.js...")

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

new_ksd_code = '''
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
      renderKSDDailyTrendChart();
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
      if (!chartElem) return;

      const provs = (PAC_DATA.ksd_provinces || []).slice(0, 10);
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
          bar: { borderRadius: 4, horizontal: false, columnWidth: '55%' }
        },
        colors: ['#7e1957', '#94a3b8'],
        dataLabels: { enabled: false },
        xaxis: {
          categories: names,
          labels: {
            rotate: -25,
            style: { fontSize: '11px' }
          }
        },
        yaxis: {
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

  const renderKSDDailyTrendChart = () => {
    try {
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
    } catch (e) {
      console.error('Error in renderKSDDailyTrendChart:', e);
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
  };
'''

# Find start of renderKSDTab to end of renderKSDSalespersonTable
start_ksd_marker = 'const renderKSDTab = () => {'
end_ksd_marker = 'renderStrategicTab = () => {'

s_pos = code.find(start_ksd_marker)
e_pos = code.find(end_ksd_marker)

if s_pos != -1 and e_pos != -1:
    # Find the end of renderKSDSalespersonTable right before renderStrategicTab
    cut_end = code.rfind('// ==============================================================================', 0, e_pos)
    code = code[:s_pos] + new_ksd_code.strip() + '\n\n  ' + code[cut_end:]
    
    # Also add initKSDControls() in initialization
    if 'initKSDControls();' not in code:
        code = code.replace('initSSAControls();', 'initSSAControls();\n  initKSDControls();')
    
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("SUCCESS: KSD Tab overhauled and patched in app.js!")
else:
    print(f"FAILED: KSD markers not found: s_pos={s_pos}, e_pos={e_pos}")
