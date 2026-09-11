// ==============================================================================
// Pharma Alliance (PAC) - Executive Insights & Medical Intelligence Engine
// Pre-built High-Capacity Intelligence (Instant Zero-Latency, Zero Download)
// ==============================================================================

(function(window) {
  'use strict';

  // 1. MEDICAL THESAURUS & SYMPTOM TAXONOMY (TH / LO / EN)
  const MEDICAL_SYMPTOM_MAP = [
    {
      category: 'แก้ปวด เมื่อยกล้ามเนื้อ ข้ออักเสบ (Pain & Musculoskeletal)',
      keywords: [
        'แก้ปวด', 'ปวดกล้ามเนื้อ', 'ปวดข้อ', 'แก้เมื่อย', 'กล้ามเนื้ออักเสบ', 'เจ็บหลัง', 'ปวดขา',
        'ເຈັບປວດ', 'ປວດກ້າມຊີ້ນ', 'ປວດຂໍ້', 'pain', 'muscle pain', 'joint pain', 'arthritis'
      ],
      brands: ['Plaivana', 'Capsika', 'Arotika', 'Myola', 'Nacoxib', 'Tristan', 'Tradolgesic', 'Spasium']
    },
    {
      category: 'โรคกระเพาะอาหาร กรดไหลย้อน แน่นท้อง (Gastrointestinal & Antacid)',
      keywords: [
        'ยาลดกรด', 'แก้ปวดท้อง', 'โรคกระเพาะ', 'กรดไหลย้อน', 'จุกเสียด', 'แน่นท้อง', 'เคลือบกระเพาะ',
        'ຢາຫຼຸດກົດ', 'ເຈັບທ້ອງ', 'ພະຍາດກະເພາະ', 'antacid', 'gastric', 'gerd', 'stomach'
      ],
      brands: ['Gastro-Bismol', 'Gastrosec', 'Famotab', 'Clinimet', 'Klenimed', 'Spascopan', 'Domper-M', 'Lopil']
    },
    {
      category: 'ยาแก้แพ้ ลดน้ำมูก ลมพิษ ผื่นคัน (Antihistamine & Allergy)',
      keywords: [
        'แก้แพ้', 'ลดน้ำมูก', 'คัน', 'ลมพิษ', 'แพ้อากาศ', 'จาม', 'ผื่นแพ้',
        'ຢາແພ້', 'ຫຼຸດນ້ຳມູກ', 'ຄັນ', 'allergy', 'antihistamine', 'rhinitis', 'itch'
      ],
      brands: ['Zertin', 'Lorita', 'Allerlax', 'Fexotine', 'Feenoze', 'Clinicold']
    },
    {
      category: 'ยาแก้ไอ ขับเสมหะ ละลายเสมหะ (Cough & Respiratory)',
      keywords: [
        'แก้ไอ', 'ละลายเสมหะ', 'ขับเสมหะ', 'เจ็บคอ', 'ไอแห้ง', 'คัดจมูก', 'ล้างจมูก',
        'ຢາໄອ', 'ຂັບຂີ້ກະເທີ່', 'ເຈັບຄໍ', 'cough', 'expectorant', 'mucus', 'sore throat'
      ],
      brands: ['Mucobox', 'Icof', 'Fartussin', 'Dextromethorphan', 'Cleanoze']
    },
    {
      category: 'ยาฆ่าเชื้อ ยาปฏิชีวนะ (Antibiotics & Antimicrobials)',
      keywords: [
        'ยาฆ่าเชื้อ', 'ยาแก้อักเสบ', 'ปฏิชีวนะ', 'ติดเชื้อ', 'แผลอักเสบ', 'หนอง',
        'ຢາຂ້າເຊື້ອ', 'ຢາຕ້ານເຊື້ອ', 'antibiotic', 'antimicrobial', 'infection'
      ],
      brands: ['Cefalexin', 'Pharmacef', 'Cefuroxime', 'Ciprocin', 'Doxycycline', 'Clindamycin', 'Roxithromycin', 'Norfloxin', 'Cotricin', 'Clinovir', 'Gynovir', 'Hepivir']
    },
    {
      category: 'ยาทาผิวหนัง บำรุงผิว ลดรอยแผลเป็น (Dermatology & Skin Care)',
      keywords: [
        'ผิวแห้ง', 'เบาหวาน', 'ผิวหนังอักเสบ', 'เชื้อรา', 'กลากเกลื้อน', 'รอยแผลเป็น', 'สิว', 'บำรุงผิว',
        'ຜິວແຫ້ງ', 'ເຊື້ອລາ', 'ຮອຍແປວ', 'ສິວ', 'skin', 'dermatology', 'eczema', 'fungal', 'scar'
      ],
      brands: ['Diabederm', 'Fango', 'Skinfect', 'Sporosil', 'Zyno', 'Klenivet', 'Kleniderm', 'Klenipred', 'Klenigel', 'Clenascar', 'Raqua']
    },
    {
      category: 'บำรุงข้อต่อ กระดูก และวิตามิน (Joint, Bone & Supplements)',
      keywords: [
        'บำรุงข้อ', 'ข้อเสื่อม', 'กระดูก', 'แคลเซียม', 'วิตามิน', 'บำรุงร่างกาย', 'สมุนไพรกระชายดำ',
        'ບຳລຸງຂໍ້', 'ກະດູກ', 'ວິຕາມິນ', 'joint', 'calcium', 'glucosamine', 'vitamin'
      ],
      brands: ['Glucosa', 'Glucovia', 'Calza', 'Prozeus', 'B-Themin', 'Kachana', 'Kachaa']
    },
    {
      category: 'โรคเรื้อรัง เบาหวาน ความดัน ไขมัน (Chronic Care)',
      keywords: [
        'เบาหวาน', 'ลดน้ำตาล', 'ลดความดัน', 'ลดไขมัน', 'ขับปัสสาวะ',
        'ເບົາຫວານ', 'ຄວາມດັນ', 'diabetes', 'metformin', 'hypertension'
      ],
      brands: ['Metformin', 'Glucocron', 'Glucodab', 'Binduretic', 'Bestatin']
    },
    {
      category: 'วิงเวียนศีรษะ เมารถ บ้านหมุน ไมเกรน (Vertigo & Migraine)',
      keywords: [
        'เวียนหัว', 'บ้านหมุน', 'เมารถ', 'ไมเกรน', 'มึนหัว',
        'ວິນຫົວ', 'ເມົາລົດ', 'vertigo', 'dizziness', 'migraine'
      ],
      brands: ['Stugin', 'Flunarizine', 'Betahist']
    },
    {
      category: 'ยาถ่ายพยาธิ (Anthelmintic)',
      keywords: [
        'ถ่ายพยาธิ', 'ยาถ่ายพยาธิ', 'พยาธิใบไม้', 'พยาธิเส้นด้าย',
        'ຢາຂ້າແມ່ທ້ອງ', 'worm', 'parasite'
      ],
      brands: ['Zencera', 'Zentocide']
    }
  ];

  // 2. COMMON TYPO & NICKNAME RESOLVER
  const TYPO_MAP = {
    'plivana': 'Plaivana',
    'plevana': 'Plaivana',
    'ไพลวาน่า': 'Plaivana',
    'ไพลวานา': 'Plaivana',
    'ໄພລວານາ': 'Plaivana',
    'แคปซิก้า': 'Capsika',
    'แคบสิก้า': 'Capsika',
    'ແຄບຊິກາ': 'Capsika',
    'ไดอาเบเดิร์ม': 'Diabederm',
    'ไดอาเบ': 'Diabederm',
    'ไดอะเบ': 'Diabederm',
    'คลีนาสการ์': 'Clenascar',
    'คลีนา': 'Clenascar',
    'กลูโคซ่า': 'Glucosa',
    'กลูโคซา': 'Glucosa',
    'บิสมอล': 'Gastro-Bismol',
    'กาสโตร': 'Gastro-Bismol',
    'สปาสโคแพน': 'Spascopan',
    'เซนเซร่า': 'Zencera',
    'เซอร์ติน': 'Zertin',
    'มิวโคบ็อกซ์': 'Mucobox',
    'ไอค็อฟ': 'Icof',
    'ฟูมาริซีน': 'Flunarizine',
    'ฟูนาริซีน': 'Flunarizine',
    'เมตฟอร์มิน': 'Metformin',
    'นาคอกซิบ': 'Nacoxib',
    'ทริสตัน': 'Tristan',
    'สตูจิน': 'Stugin',
    'อโรติกา': 'Arotika',
    'กระชายดำ': 'Kachana',
    'คชาณะ': 'Kachana'
  };

  // 3. SMART MEDICAL SEARCH (Search by symptom, multi-lingual, or typo)
  function smartSearchProducts(query, products) {
    if (!query || !query.trim() || !products) return products;
    const q = query.trim().toLowerCase();

    // 1. Direct typo/nickname replacement
    let targetBrand = TYPO_MAP[q] || null;

    // 2. Find matching symptom categories
    const matchedCategories = [];
    MEDICAL_SYMPTOM_MAP.forEach(item => {
      if (item.keywords.some(k => q.includes(k.toLowerCase()) || k.toLowerCase().includes(q))) {
        matchedCategories.push(item);
      }
    });

    return products.filter(p => {
      const name = (p.english_name || p.name || '').toLowerCase();
      const thai = (p.thai_name || '').toLowerCase();
      const lao = (p.lao_name || '').toLowerCase();
      const ksd = (p.ksd_name || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const brand = (p.brand_group || '').toLowerCase();

      // Check standard text match
      if (name.includes(q) || thai.includes(q) || lao.includes(q) || ksd.includes(q) || sku.includes(q) || brand.includes(q)) {
        return true;
      }

      // Check typo target brand
      if (targetBrand && (brand.includes(targetBrand.toLowerCase()) || name.includes(targetBrand.toLowerCase()))) {
        return true;
      }

      // Check symptom category match
      for (const cat of matchedCategories) {
        if (cat.brands.some(b => brand.includes(b.toLowerCase()) || name.includes(b.toLowerCase()))) {
          return true;
        }
      }

      return false;
    });
  }

  // 4. EXECUTIVE MONTHLY BRIEFING GENERATOR (Live Data Driven)
  function generateExecutiveBriefing(pacData) {
    if (!pacData) return 'ไม่พบข้อมูลสำหรับวิเคราะห์';
    const kpi = pacData.summary_kpis || {};
    const branches = pacData.branches || [];
    const bNames = pacData.branch_names_th || {};
    const bLak = pacData.branch_totals_lak || {};
    const bQty = pacData.branch_totals_qty || {};
    const items = pacData.ssa_products_august || [];

    // Sort branches by revenue
    const sortedBranches = branches.map(b => ({
      code: b,
      name: bNames[b] || b,
      lak: bLak[b] || 0,
      qty: bQty[b] || 0
    })).sort((a, b) => b.lak - a.lak);

    // Top 5 Products
    const sortedProducts = [...items].sort((a, b) => (b.total_lak || 0) - (a.total_lak || 0));
    const top5 = sortedProducts.slice(0, 5);

    // Strategic Products summary
    const stratItems = items.filter(p => p.is_strategic || p.is_pac_star || (p.incentive_rate && p.incentive_rate > 0));
    const stratTotalLak = stratItems.reduce((acc, p) => acc + (p.total_lak || 0), 0);
    const stratTotalQty = stratItems.reduce((acc, p) => acc + (p.total_qty || 0), 0);
    const stratRevenueShare = kpi.ssa_total_lak > 0 ? ((stratTotalLak / kpi.ssa_total_lak) * 100).toFixed(1) : '0';

    let html = `
<div class="insight-section">
  <div class="insight-header-pill">
    <i class="fa-solid fa-chart-line"></i> สรุปภาพรวมผู้บริหารประจำเดือน สิงหาคม 2026
  </div>
  <p class="insight-lead">
    ในเดือนสิงหาคม 2026 ร้านยาเครือ SSA ทั้ง 6 สาขาสามารถทำยอดขายรวมได้ 
    <strong>${Math.round(kpi.ssa_total_lak || 0).toLocaleString()} กีบ</strong> 
    คิดเป็นปริมาณสินค้ารวม <strong>${(kpi.ssa_total_units || 0).toLocaleString()} ชิ้น</strong>
    โดยสินค้ากลุ่มกลยุทธ์และมีค่าเชียร์สามารถสร้างสัดส่วนรายได้ถึง <strong>${stratRevenueShare}%</strong> ของยอดขายรวม
  </p>
</div>

<div class="insight-section">
  <div class="insight-subheading"><i class="fa-solid fa-trophy" style="color: #f59e0b;"></i> อันดับผลงานยอดขายรายสาขา (Branch Performance Ranking)</div>
  <div class="branch-rank-cards">
`;

    sortedBranches.forEach((b, idx) => {
      const share = kpi.ssa_total_lak > 0 ? ((b.lak / kpi.ssa_total_lak) * 100).toFixed(1) : '0';
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
      html += `
    <div class="rank-card ${idx === 0 ? 'top-branch' : ''}">
      <div class="rank-badge">${medal}</div>
      <div class="rank-info">
        <div class="rank-title">${b.name} (${b.code})</div>
        <div class="rank-stats">
          <span>ยอดขาย: <strong>${Math.round(b.lak).toLocaleString()} ₭</strong></span>
          <span class="rank-share">สัดส่วน: ${share}% (${b.qty.toLocaleString()} ชิ้น)</span>
        </div>
      </div>
    </div>`;
    });

    html += `
  </div>
</div>

<div class="insight-section">
  <div class="insight-subheading"><i class="fa-solid fa-star" style="color: #06b6d4;"></i> Top 5 แบรนด์และยาทำเงินสูงสุดประจำเดือน (Top Revenue Drivers)</div>
  <table class="insight-mini-table">
    <thead>
      <tr>
        <th>อันดับ</th>
        <th>ชื่อตัวยา / แบรนด์</th>
        <th style="text-align: right;">ยอดขาย (ชิ้น)</th>
        <th style="text-align: right;">มูลค่ารวม (กีบ)</th>
      </tr>
    </thead>
    <tbody>`;

    top5.forEach((p, idx) => {
      html += `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td><span style="font-weight: 600; color: var(--accent-secondary);">${p.english_name || p.name}</span></td>
        <td style="text-align: right;">${(p.total_qty || 0).toLocaleString()}</td>
        <td style="text-align: right; font-weight: 600; color: var(--accent-emerald);">${Math.round(p.total_lak || 0).toLocaleString()} ₭</td>
      </tr>`;
    });

    html += `
    </tbody>
  </table>
</div>

<div class="insight-section">
  <div class="insight-subheading"><i class="fa-solid fa-lightbulb" style="color: #a855f7;"></i> ข้อเสนอแนะเชิงกลยุทธ์สำหรับผู้บริหาร (Executive Recommendations)</div>
  <ul class="insight-bullets">
    <li><strong>ขยายช่องว่างความสำเร็จ:</strong> สาขา <strong>${sortedBranches[0].name}</strong> ครองส่วนแบ่งยอดขายสูงสุด แนะนำให้ถอดบทเรียนโมเดลการจัดเรียงยาและการให้คำปรึกษาหน้าร้านไปปรับใช้กับสาขา <strong>${sortedBranches[sortedBranches.length - 1].name}</strong></li>
    <li><strong>กระตุ้นสินค้ากลยุทธ์ที่ยังขาดตลาดหน้าร้าน (White Space):</strong> จากการตรวจสอบพบว่า มีรายการยาที่มีค่าเชียร์และกำไรสูงบางรายการยังไม่มียอดขายใน 1-2 สาขา ควรเร่งกระจายสินค้าเข้าไปเติมให้ครบทุกตู้ยา</li>
    <li><strong>เพิ่มความถี่การเบิกเติมกลุ่มยาแก้ปวด/ผิวหนัง:</strong> แบรนด์ Arotika, Diabederm และ Clenascar มีอัตราการหมุนเวียนสินค้าสูงมาก ควรป้องกันภาวะสินค้าขาดสต็อก (Stock-out Risk) ในช่วงสัปดาห์สิ้นเดือน</li>
  </ul>
</div>`;

    return html;
  }

  // 5. STORE VISIT BRIEFING GENERATOR (Tailored for each branch)
  function generateStoreVisitBriefing(pacData, branchCode) {
    if (!pacData) return 'ไม่พบข้อมูล';
    const bName = (pacData.branch_names_th && pacData.branch_names_th[branchCode]) || branchCode;
    const bLak = Math.round((pacData.branch_totals_lak && pacData.branch_totals_lak[branchCode]) || 0);
    const bQty = ((pacData.branch_totals_qty && pacData.branch_totals_qty[branchCode]) || 0);
    const items = pacData.ssa_products_august || [];

    // Find branch items with sales
    const branchSales = items.map(p => ({
      name: p.english_name || p.name,
      thai: p.thai_name,
      qty: (p.branch_qtys && p.branch_qtys[branchCode]) || 0,
      lak: (p.branch_totals_lak && p.branch_totals_lak[branchCode]) || 0,
      isStrat: p.is_strategic || p.is_pac_star || (p.incentive_rate && p.incentive_rate > 0),
      rate: p.incentive_rate || 0
    })).filter(p => p.qty > 0).sort((a, b) => b.qty - a.qty);

    // Find Zero-sales Strategic Items (White Space Opportunity)
    const whiteSpaceItems = items.map(p => ({
      name: p.english_name || p.name,
      thai: p.thai_name,
      qty: (p.branch_qtys && p.branch_qtys[branchCode]) || 0,
      isStrat: p.is_strategic || p.is_pac_star || (p.incentive_rate && p.incentive_rate > 0),
      rate: p.incentive_rate || 0
    })).filter(p => p.isStrat && p.qty === 0);

    const topHero = branchSales.slice(0, 5);

    let html = `
<div class="insight-section">
  <div class="insight-header-pill store-pill">
    <i class="fa-solid fa-store"></i> ข้อมูลสรุปตรวจเยี่ยมสาขา: ${bName} (${branchCode})
  </div>
  <div class="store-kpi-row">
    <div class="store-kpi-item">
      <div class="kpi-lbl">ยอดขายเดือน ส.ค. 2026</div>
      <div class="kpi-val">${bLak.toLocaleString()} ₭</div>
    </div>
    <div class="store-kpi-item">
      <div class="kpi-lbl">ปริมาณขายรวม</div>
      <div class="kpi-val">${bQty.toLocaleString()} ชิ้น</div>
    </div>
    <div class="store-kpi-item">
      <div class="kpi-lbl">จำนวน SKU ที่มียอด</div>
      <div class="kpi-val">${branchSales.length} รายการ</div>
    </div>
  </div>
</div>

<div class="insight-section">
  <div class="insight-subheading"><i class="fa-solid fa-medal" style="color: #06b6d4;"></i> 5 สินค้าฮีโร่ขายดีประจำสาขานี้ (Hero Products)</div>
  <table class="insight-mini-table">
    <thead>
      <tr>
        <th>สินค้า</th>
        <th style="text-align: right;">จำนวน (ชิ้น)</th>
        <th style="text-align: right;">มูลค่า (กีบ)</th>
      </tr>
    </thead>
    <tbody>`;

    topHero.forEach(p => {
      html += `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td style="text-align: right; font-weight: 600; color: var(--accent-secondary);">${p.qty.toLocaleString()}</td>
        <td style="text-align: right; font-weight: 600; color: var(--accent-emerald);">${Math.round(p.lak).toLocaleString()} ₭</td>
      </tr>`;
    });

    html += `
    </tbody>
  </table>
</div>

<div class="insight-section">
  <div class="insight-subheading"><i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> โอกาสขยายยอดหน้าร้าน: สินค้ากลยุทธ์ที่ยังไม่มียอดขาย (${whiteSpaceItems.length} รายการ)</div>
  <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 8px;">
    สินค้ากลุ่มนี้เป็นสินค้า PAC Star และมีค่าเชียร์สูง แต่สาขานี้ยังไม่เคยมียอดขายในเดือนนี้เลย แนะนำให้ตรวจสอบจุดวางและการแนะนำของพนักงาน:
  </p>
  <div class="whitespace-tag-cloud">`;

    whiteSpaceItems.slice(0, 8).forEach(p => {
      html += `<span class="ws-tag"><i class="fa-solid fa-circle-plus"></i> ${p.name} ${p.rate > 0 ? `(เชียร์ +฿${p.rate})` : ''}</span>`;
    });

    html += `
  </div>
</div>

<div class="insight-section">
  <div class="insight-subheading"><i class="fa-solid fa-clipboard-check" style="color: #10b981;"></i> ประเด็นพูดคุยกับผู้จัดการสาขา (Store Coaching Checklist)</div>
  <ol class="insight-checklist">
    <li><strong>ทบทวนสต็อกสินค้าขายดี:</strong> เช็คระดับ Safety Stock ของกลุ่มสินค้าฮีโร่ด้านบน ให้มั่นใจว่ามีของพร้อมจ่ายตลอด 7 วันข้างหน้า</li>
    <li><strong>เปิดตู้ยากลุ่ม White Space:</strong> ตรวจสอบว่าสินค้ากลยุทธ์ที่ยังไม่มียอดขาย มีของจริงอยู่ในร้านหรือไม่ หากมีของให้ย้ายมาวางในระดับสายตา (Eye-level shelf)</li>
    <li><strong>กระตุ้นค่าเชียร์พนักงานหน้าร้าน:</strong> สื่อสารอัตราค่าเชียร์รายตัวให้ทีมเภสัชกรและพนักงานประจำสาขาทราบอย่างชัดเจน เพื่อเพิ่มแรงจูงใจในการเชียร์ยาคุณภาพของ PAC</li>
  </ol>
</div>`;

    return html;
  }

  // 6. STRATEGIC EXPANSION INSIGHTS
  function generateStrategicOpportunities(pacData) {
    if (!pacData) return '';
    const items = pacData.ssa_products_august || [];
    const branches = pacData.branches || [];
    const branchNames = pacData.branch_names_th || {};

    // Find items that have high sales in some branches but 0 in other branches
    const gaps = [];
    items.forEach(p => {
      const isStrat = p.is_strategic || p.is_pac_star || (p.incentive_rate && p.incentive_rate > 0);
      if (!isStrat) return;

      const qtys = p.branch_qtys || {};
      const activeBranches = branches.filter(b => (qtys[b] || 0) > 0);
      const missingBranches = branches.filter(b => (qtys[b] || 0) === 0);

      if (activeBranches.length > 0 && missingBranches.length > 0) {
        gaps.push({
          name: p.english_name || p.name,
          activeCount: activeBranches.length,
          missingBranches: missingBranches.map(b => branchNames[b] || b),
          rate: p.incentive_rate || 0,
          totalQty: p.total_qty || 0
        });
      }
    });

    gaps.sort((a, b) => b.totalQty - a.totalQty);

    let html = `
<div class="insight-section">
  <div class="insight-header-pill" style="background: linear-gradient(135deg, #f59e0b, #ec4899);">
    <i class="fa-solid fa-chess-knight"></i> โอกาสขยายการกระจายสินค้ากลยุทธ์ (Strategic Cross-Store Gaps)
  </div>
  <p class="insight-lead">
    พบสินค้ากลุ่มยุทธศาสตร์และมีค่าเชียร์ที่มีศักยภาพสูง จำนวน <strong>${gaps.length} รายการ</strong> 
    ที่ขายดีมากในบางสาขา แต่ยังไม่มีวางจำหน่ายในบางสาขา ซึ่งเป็นโอกาสเพิ่มรายได้ทันทีโดยไม่ต้องเปิด SKU ใหม่:
  </p>
</div>

<div class="insight-section">
  <table class="insight-mini-table">
    <thead>
      <tr>
        <th>ชื่อยาเชิงกลยุทธ์</th>
        <th>สาขาที่ยังมีช่องว่าง (ยังไม่เคยมียอด)</th>
        <th style="text-align: right;">ค่าเชียร์</th>
      </tr>
    </thead>
    <tbody>`;

    gaps.slice(0, 10).forEach(g => {
      html += `
      <tr>
        <td><strong>${g.name}</strong><br><span style="font-size: 11px; color: var(--text-muted);">ขายดีแล้วใน ${g.activeCount} สาขา</span></td>
        <td><span style="color: var(--accent-rose); font-size: 12px;">${g.missingBranches.slice(0, 2).join(', ')}${g.missingBranches.length > 2 ? ` และอีก ${g.missingBranches.length - 2} สาขา` : ''}</span></td>
        <td style="text-align: right; font-weight: 600; color: var(--accent-emerald);">${g.rate > 0 ? `+฿${g.rate}` : '-'}</td>
      </tr>`;
    });

    html += `
    </tbody>
  </table>
</div>`;

    return html;
  }

  // Export to window
  window.ExecutiveInsights = {
    generateExecutiveBriefing,
    generateStoreVisitBriefing,
    generateStrategicOpportunities,
    smartSearchProducts,
    MEDICAL_SYMPTOM_MAP
  };

})(window);
