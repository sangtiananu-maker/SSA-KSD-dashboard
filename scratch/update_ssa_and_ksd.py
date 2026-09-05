import re

print("Updating index.html with dual SSA reports and KSD Top 10 sections...")

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update SSA Tab: Wrap incentive report and add All PAC Retail Audit Report
start_inc_marker = '<!-- FEATURE 1: 6-Branch Trend Multi-Line Chart (17 Months) -->'
end_inc_marker = '''            <div class="table-responsive">
            <table class="data-table" id="table_ssa_ranked_products">
              <thead>
                <tr>
                  <th style="width: 70px;">อันดับ</th>
                  <th style="width: 130px; text-align: center;">เปลี่ยนลำดับ (Shift)</th>
                  <th>ชื่อสินค้า (Product Name - English)</th>
                  <th>กลุ่มแบรนด์ (Brand)</th>
                  <th style="text-align: right;">ยอดขายงวดนี้</th>
                  <th style="text-align: right;">ผลต่าง (Diff)</th>
                  <th style="text-align: right;">อัตราเติบโต (% Growth)</th>
                  <th style="text-align: right;">มูลค่ารวม</th>
                </tr>
              </thead>
              <tbody id="tbody_ssa_ranked_products">
                <!-- Populated dynamically via JS -->
              </tbody>
            </table>
          </div>
        </div>'''

all_pac_report_html = '''
        <!-- ====================================================================
             VIEW B: DEDICATED AUGUST 2026 RETAIL AUDIT CENSUS REPORT (ALL 181 SKUs)
             ==================================================================== -->
        <div id="view_ssa_all_pac_report" style="display: none;">
          <!-- Executive Context Banner -->
          <div class="company-context-card pac-context" style="margin-bottom: 20px;">
            <div class="context-info">
              <h3><i class="fa-solid fa-clipboard-check" style="color: var(--pac-primary);"></i> รายงานสำรวจยอดขายปลีกยา PAC ครบทุกรายการ (SSA Retail Audit Census - August 2026)</h3>
              <p>รายงานฉบับสมบูรณ์จากการสำรวจหน้าร้านจริงของยา PAC ครบทั้ง 181 รายการ ใน 6 สาขาเครือร้านยาใสสะอาด ยอดรวม <strong>68,902 ชิ้น / 963,168,531.43 กีบ</strong> (รายงานเฉพาะกิจฉบับสำรวจหน้าร้าน ไม่นำไปเปรียบเทียบในกราฟเส้นย้อนหลังกับเดือนที่มีเฉพาะรายการค่าเชียร์ เพื่อความถูกต้องของข้อมูล)</p>
            </div>
            <img src="assets/logo_pac.png" alt="Pharma Alliance Logo" class="context-logo">
          </div>

          <!-- Charts Grid: 6 Branches Compare + Top 10 Best Sellers -->
          <div class="dashboard-grid" style="margin-bottom: 20px;">
            <div class="chart-card col-7">
              <div class="chart-header">
                <div>
                  <div class="chart-title"><i class="fa-solid fa-chart-column" style="color: var(--ssa-primary);"></i> ยอดขายยา PAC แยกตามสาขาร้านยา SSA ทั้ง 6 สาขา (ส.ค. 2026)</div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">เปรียบเทียบจำนวนขาย (ชิ้น) และมูลค่ายอดขาย (ล้านกีบ LAK) ของแต่ละสาขา</div>
                </div>
              </div>
              <div id="chart_ssa_all_branch_compare"></div>
            </div>
            
            <div class="chart-card col-5">
              <div class="chart-header">
                <div>
                  <div class="chart-title"><i class="fa-solid fa-fire" style="color: var(--accent-amber);"></i> Top 10 ยา PAC ขายดีสูงสุดในร้านยา SSA</div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">จัดอันดับยาที่มีจำนวนขายปลีกหน้าร้านสูงสุด (ส.ค. 2026)</div>
                </div>
              </div>
              <div id="chart_ssa_all_top_products"></div>
            </div>
          </div>

          <!-- Table 1: 6 Branches Summary Breakdown -->
          <div class="chart-card col-12" style="margin-bottom: 20px;">
            <div class="chart-header">
              <div class="chart-title"><i class="fa-solid fa-store" style="color: var(--ssa-primary);"></i> สรุปผลงานยอดขายยา PAC ทั้ง 6 สาขา (SSA Branches Summary Breakdown)</div>
            </div>
            <div class="table-responsive">
              <table class="data-table" id="table_ssa_all_branches">
                <thead>
                  <tr>
                    <th style="width: 80px;">รหัสสาขา</th>
                    <th>ชื่อสาขาร้านยาใสสะอาด</th>
                    <th style="text-align: right;">จำนวนที่ขายได้ (ชิ้น)</th>
                    <th style="text-align: right;">ยอดขายรวม (กีบ LAK)</th>
                    <th style="text-align: right;">สัดส่วนยอดขาย (% Share)</th>
                    <th>ยา PAC ที่ขายดีอันดับ 1 ของสาขา</th>
                    <th style="text-align: center;">เจาะลึกสาขา</th>
                  </tr>
                </thead>
                <tbody id="tbody_ssa_all_branches">
                  <!-- Populated via JS -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- Table 2: 181 SKU Complete Retail Audit Table -->
          <div class="chart-card col-12">
            <div class="chart-header">
              <div>
                <div class="chart-title"><i class="fa-solid fa-list-check" style="color: var(--ssa-primary);"></i> ตารางตรวจสอบยอดขายปลีกยา PAC ครบทุกรายการ (181 SKU Complete Audit Table)</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">แสดงยอดขายหน้าร้านจริงครบทุกรายการ พร้อมยอดจำหน่ายแยกรายสาขา</div>
              </div>
              <div class="chart-actions">
                <div class="search-wrapper">
                  <i class="fa-solid fa-magnifying-glass search-icon"></i>
                  <input type="text" id="auditTableSearch" class="search-input" placeholder="ค้นหาชื่อยา, SKU, แบรนด์...">
                </div>
                <div class="pill-selector" id="auditMetricSelector">
                  <div class="pill-option active" data-audit-metric="qty"><i class="fa-solid fa-box"></i> จำนวน (ชิ้น)</div>
                  <div class="pill-option" data-audit-metric="lak"><i class="fa-solid fa-coins"></i> มูลค่า (กีบ LAK)</div>
                </div>
              </div>
            </div>
            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
              <table class="data-table" id="table_ssa_all_audit_products">
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th style="width: 80px;">SKU</th>
                    <th>ชื่อสินค้า (Product Name)</th>
                    <th>กลุ่มแบรนด์</th>
                    <th>ประเภท</th>
                    <th style="text-align: right;">รวม 6 สาขา</th>
                    <th style="text-align: right;">SSA 1</th>
                    <th style="text-align: right;">SSA 2</th>
                    <th style="text-align: right;">SSA 3</th>
                    <th style="text-align: right;">SSA 5</th>
                    <th style="text-align: right;">SSA 6</th>
                    <th style="text-align: right;">SSA 7</th>
                  </tr>
                </thead>
                <tbody id="tbody_ssa_all_audit_products">
                  <!-- Populated via JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
'''

if 'id="view_ssa_incentive_report"' not in html:
    s_pos = html.find(start_inc_marker)
    e_pos = html.find(end_inc_marker)
    if s_pos != -1 and e_pos != -1:
        e_full = e_pos + len(end_inc_marker)
        inc_inner = html[s_pos:e_full]
        wrapped = f'        <!-- ====================================================================\n             VIEW A: DEDICATED 17-MONTH LONGITUDINAL INCENTIVE ANALYSIS\n             ==================================================================== -->\n        <div id="view_ssa_incentive_report">\n{inc_inner}\n        </div>\n{all_pac_report_html}'
        html = html[:s_pos] + wrapped + html[e_full:]
        print("Wrapped incentive view and added all_pac_report view!")

# 2. Add KSD Control Bar into #tab-ksd
ksd_control_bar = '''
        <!-- KSD Control Toolbar -->
        <div class="chart-card col-12" style="margin-bottom: 20px;">
          <div class="chart-header" style="flex-direction: column; align-items: stretch; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div class="chart-title">
                <i class="fa-solid fa-sliders" style="color: var(--ksd-primary);"></i> แผงควบคุมตัวกรองยอดขาย KSD (KSD Sell-Out Control Bar)
              </div>
              <!-- Period Dropdown -->
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--text-secondary);"><i class="fa-regular fa-calendar-check"></i> เลือกระยะเวลา:</span>
                <div style="min-width: 240px;">
                  <select id="ksdPeriodSelect" class="select-custom">
                    <option value="2026-08" selected>สิงหาคม 2026 (เดือนล่าสุด / ละเอียด)</option>
                    <option value="2026-YTD">มกราคม - สิงหาคม 2026 (สะสม 8 เดือน)</option>
                    <option value="2026-07">กรกฎาคม 2026</option>
                    <option value="2026-06">มิถุนายน 2026</option>
                    <option value="2026-05">พฤษภาคม 2026</option>
                    <option value="2026-04">เมษายน 2026</option>
                    <option value="2026-03">มีนาคม 2026</option>
                    <option value="2026-02">กุมภาพันธ์ 2026</option>
                    <option value="2026-01">มกราคม 2026</option>
                    <option value="2025-Full">ทั้งปี 2025 (เต็มปี 12 เดือน)</option>
                    <option value="2025-YTD">มกราคม - กรกฎาคม 2025 (เทียบเท่า)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <!-- KSD Scope Selector -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--text-secondary);"><i class="fa-solid fa-filter"></i> ขอบเขตสินค้า:</span>
                <div class="pill-selector" id="ksdScopeSelector">
                  <div class="pill-option active" data-ksd-scope="all"><i class="fa-solid fa-boxes-stacked"></i> สินค้า PAC ทั้งหมด</div>
                  <div class="pill-option" data-ksd-scope="strat"><i class="fa-solid fa-bullseye"></i> เฉพาะสินค้ากลยุทธ์ (Strategic)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
'''

if 'id="ksdPeriodSelect"' not in html:
    html = html.replace('<!-- KSD KPI Cards Grid -->', ksd_control_bar + '\n        <!-- KSD KPI Cards Grid -->')
    print("Added KSD Control Bar!")

# 3. Add Top 10 Products and Customers in #tab-ksd
ksd_top_sections = '''
        <!-- KSD Top 10 Products & Top 10 Customers Section -->
        <div class="dashboard-grid" style="margin-top: 20px; margin-bottom: 20px;">
          <!-- Top 10 Products -->
          <div class="chart-card col-6">
            <div class="chart-header">
              <div>
                <div class="chart-title" id="ksd_top_products_title"><i class="fa-solid fa-ranking-star" style="color: var(--ksd-primary);"></i> Top 10 สินค้าขายดี KSD (Top Products)</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;" id="ksd_top_products_sub">ประจำงวดที่เลือก แยกตามยอดขายบาท</div>
              </div>
            </div>
            <div id="chart_ksd_top_products"></div>
            <div class="table-responsive" style="margin-top: 12px; max-height: 280px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 45px;">#</th>
                    <th>ชื่อสินค้า (Product)</th>
                    <th>กลุ่ม</th>
                    <th style="text-align: right;">จำนวน</th>
                    <th style="text-align: right;">ยอดขาย (บาท)</th>
                  </tr>
                </thead>
                <tbody id="tbody_ksd_top_products"></tbody>
              </table>
            </div>
          </div>

          <!-- Top 10 Customers -->
          <div class="chart-card col-6">
            <div class="chart-header">
              <div>
                <div class="chart-title" id="ksd_top_customers_title"><i class="fa-solid fa-hospital-user" style="color: var(--ksd-secondary);"></i> Top 10 ลูกค้ายอดซื้อสูงสุด (Top Customers)</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;" id="ksd_top_customers_sub">โรงพยาบาล, ร้านยา, ยี่ปั๊ว และคลินิก</div>
              </div>
            </div>
            <div id="chart_ksd_top_customers"></div>
            <div class="table-responsive" style="margin-top: 12px; max-height: 280px; overflow-y: auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 45px;">#</th>
                    <th>ชื่อลูกค้า (Customer / Partner)</th>
                    <th>ประเภท</th>
                    <th>แขวง</th>
                    <th style="text-align: right;">ยอดซื้อ (บาท)</th>
                  </tr>
                </thead>
                <tbody id="tbody_ksd_top_customers"></tbody>
              </table>
            </div>
          </div>
        </div>
'''

if 'id="chart_ksd_top_products"' not in html:
    # Insert right after #chart_ksd_monthly_trend card
    trend_card_end = '          <div id="chart_ksd_monthly_trend"></div>\n        </div>'
    if trend_card_end in html:
        html = html.replace(trend_card_end, trend_card_end + '\n' + ksd_top_sections)
        print("Added KSD Top 10 sections!")
    else:
        # Fallback
        html = html.replace('<!-- KSD Channels and Provinces Breakdown Grid -->', ksd_top_sections + '\n        <!-- KSD Channels and Provinces Breakdown Grid -->')
        print("Added KSD Top 10 sections via fallback!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Step 2 done: index.html fully updated!")
