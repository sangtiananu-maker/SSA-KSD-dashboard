import re

print("Updating index.html...")

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add #tab-whitespace right before #tab-ksd
whitespace_html = '''
      <!-- ====================================================================
           TAB 2: STRATEGIC WHITE-SPACE MATRIX (6 SSA BRANCHES COVERAGE)
           ==================================================================== -->
      <div class="tab-view" id="tab-whitespace">
        <!-- Company Context Banner -->
        <div class="company-context-card pac-context">
          <div class="context-info">
            <h3><i class="fa-solid fa-table-cells" style="color: var(--pac-primary);"></i> โอกาสสินค้ากลยุทธ์ PAC ในร้านยาเครือใสสะอาด (Strategic White-Space Matrix)</h3>
            <p>ตารางตรวจสอบการกระจายตัวและความครอบคลุมของสินค้ากลยุทธ์ PAC Catalog 2026 ในร้านยา SSA ทั้ง 6 สาขา เพื่อค้นหาโอกาสในการกระจายสินค้า (White-Space Gap) และตรวจเช็กสต็อกหน้าร้าน</p>
          </div>
          <img src="assets/logo_pac.png" alt="Pharma Alliance Logo" class="context-logo">
        </div>

        <!-- White-Space KPI Summary Grid -->
        <div class="kpi-grid">
          <div class="kpi-card" style="border-left: 4px solid var(--pac-primary);">
            <div class="kpi-header">
              <span class="kpi-title">สินค้ากลยุทธ์ในแคตตาล็อก</span>
              <div class="kpi-icon" style="background: var(--pac-light); color: var(--pac-primary);"><i class="fa-solid fa-bullseye"></i></div>
            </div>
            <div class="kpi-value">77 รายการ</div>
            <div class="kpi-subtext">เป้าหมายการเจาะตลาดปี 2026</div>
          </div>

          <div class="kpi-card emerald">
            <div class="kpi-header">
              <span class="kpi-title">จำหน่ายครบ 6 สาขา (100% Coverage)</span>
              <div class="kpi-icon"><i class="fa-solid fa-circle-check"></i></div>
            </div>
            <div class="kpi-value" id="kpi_ws_full_coverage">14 รายการ</div>
            <div class="kpi-subtext">มีจำหน่ายกระจายครบทุกหน้าร้าน</div>
          </div>

          <div class="kpi-card amber">
            <div class="kpi-header">
              <span class="kpi-title">มีช่องว่างขาดจำหน่ายบางสาขา (Gap)</span>
              <div class="kpi-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div class="kpi-value" id="kpi_ws_gaps">63 รายการ</div>
            <div class="kpi-subtext">โอกาสในการขยายการวางจำหน่ายเพิ่ม</div>
          </div>

          <div class="kpi-card cyan">
            <div class="kpi-header">
              <span class="kpi-title">ยอดขายรวมสินค้ากลยุทธ์หน้าร้าน</span>
              <div class="kpi-icon"><i class="fa-solid fa-boxes-packing"></i></div>
            </div>
            <div class="kpi-value" id="kpi_ws_total_qty">4,876 ชิ้น</div>
            <div class="kpi-subtext">ยอดขายหน้าร้านเครือ SSA รวมทุกสาขา</div>
          </div>
        </div>

        <!-- Matrix Control & Search Toolbar -->
        <div class="chart-card col-12" style="margin-top: 20px;">
          <div class="chart-header">
            <div>
              <div class="chart-title"><i class="fa-solid fa-border-all" style="color: var(--pac-primary);"></i> ตารางตรวจสอบความครอบคลุมสินค้ากลยุทธ์รายสาขา (6 Branches White-Space Matrix)</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                สัญลักษณ์ <span style="color: var(--accent-emerald); font-weight: 700;"><i class="fa-solid fa-check"></i> ตัวเลข</span> = มีวางจำหน่ายและยอดขาย (ชิ้น), <span style="color: var(--accent-rose); font-weight: 700;"><i class="fa-solid fa-xmark"></i> ขาด</span> = สินค้ายังไม่มีวางจำหน่ายในสาขานั้น
              </div>
            </div>
            <div class="chart-actions">
              <div class="search-wrapper">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="wsSearchInput" class="search-input" placeholder="ค้นหาชื่อยา หรือ SKU...">
              </div>
            </div>
          </div>
          <div class="table-responsive">
            <table class="data-table" id="table_whitespace_matrix">
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th style="width: 90px;">SKU</th>
                  <th>ชื่อสินค้า (Product Name)</th>
                  <th>หมวดหมู่</th>
                  <th style="text-align: right;">รวม (ชิ้น)</th>
                  <th style="text-align: center;">SSA 1 (สี่หอม)</th>
                  <th style="text-align: center;">SSA 2 (T2)</th>
                  <th style="text-align: center;">SSA 3 (สะพานทอง)</th>
                  <th style="text-align: center;">SSA 5 (จอมมณี)</th>
                  <th style="text-align: center;">SSA 6 (แสงสว่าง)</th>
                  <th style="text-align: center;">SSA 7 (เก้ายอด)</th>
                </tr>
              </thead>
              <tbody id="tbody_whitespace_matrix">
                <!-- Populated via JS -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
'''

if 'id="tab-whitespace"' not in html:
    html = html.replace('<div class="tab-view" id="tab-ksd">', whitespace_html + '\n      <div class="tab-view" id="tab-ksd">')
    print("Added #tab-whitespace!")
else:
    print("#tab-whitespace already present!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Step 1 done: White-Space tab restored in index.html.")
