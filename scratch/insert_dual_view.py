import re

with open('index.html', 'r', encoding='utf-8') as f:
    h = f.read()

s_pos = h.find('<!-- FEATURE 1: 6-Branch Trend Multi-Line Chart (17 Months) -->')
ws_pos = h.find('id="tab-whitespace"')
tab_ssa_end = h.rfind('</div>', 0, ws_pos)

inc_block = h[s_pos:tab_ssa_end].strip()

all_pac_report_html = '''
        <!-- ====================================================================
             VIEW B: DEDICATED AUGUST 2026 RETAIL AUDIT CENSUS REPORT (ALL 181 SKUs)
             ==================================================================== -->
        <div id="view_ssa_all_pac_report" style="display: none;">
          <!-- Executive Context Banner -->
          <div class="company-context-card pac-context" style="margin-bottom: 20px;">
            <div class="context-info">
              <h3><i class="fa-solid fa-clipboard-check" style="color: var(--pac-primary);"></i> รายงานสำรวจยอดขายปลีกหน้าร้านสิงหาคม 2026 (SSA Retail Audit Census - August 2026)</h3>
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

new_dual_block = f'''        <!-- ====================================================================
             VIEW A: DEDICATED 17-MONTH LONGITUDINAL INCENTIVE ANALYSIS
             ==================================================================== -->
        <div id="view_ssa_incentive_report">
          {inc_block}
        </div>
{all_pac_report_html}
      '''

new_html = h[:s_pos] + new_dual_block + h[tab_ssa_end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("SUCCESS: Dual view inserted into index.html!")
