import re

print("Updating updateSSAPeriodDropdown in app.js...")

with open('app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Update scope selector click listener in initSSAControls to also call updateSSAPeriodDropdown
old_scope_click = '''      btn.addEventListener('click', () => {
        scopeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaScope = btn.getAttribute('data-scope');
        renderSSATab();
      });'''

new_scope_click = '''      btn.addEventListener('click', () => {
        scopeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ssaScope = btn.getAttribute('data-scope');
        updateSSAPeriodDropdown();
        renderSSATab();
      });'''

if old_scope_click in code:
    code = code.replace(old_scope_click, new_scope_click)
    print("Updated scope button click listener!")

# Replace updateSSAPeriodDropdown implementation
start_marker = 'const updateSSAPeriodDropdown = () => {'
end_marker = 'const initSSAControls = () => {'

s_pos = code.find(start_marker)
e_pos = code.find(end_marker)

new_dropdown_code = '''const updateSSAPeriodDropdown = () => {
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
      opt26.value = '2026-FULL';
      opt26.textContent = 'รวมทั้งปี 2026 (8 เดือนแรก)';
      opt26.selected = true;
      select.appendChild(opt26);

      const opt25 = document.createElement('option');
      opt25.value = '2025-FULL';
      opt25.textContent = 'รวมทั้งปี 2025 (9 เดือน เม.ย.-ธ.ค.)';
      select.appendChild(opt25);

      state.ssaPeriod = '2026-FULL';
    } else if (rMode === 'yoy') {
      const yoyPairs = [
        { label: 'เทียบ ส.ค. (2026-08 vs 2025-08)', val: 'YOY-08' },
        { label: 'เทียบ ก.ค. (2026-07 vs 2025-07)', val: 'YOY-07' },
        { label: 'เทียบ มิ.ย. (2026-06 vs 2025-06)', val: 'YOY-06' },
        { label: 'เทียบ พ.ค. (2026-05 vs 2025-05)', val: 'YOY-05' },
        { label: 'เทียบ เม.ย. (2026-04 vs 2025-04)', val: 'YOY-04' },
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
  };'''

if s_pos != -1 and e_pos != -1:
    code = code[:s_pos] + new_dropdown_code + '\n\n  ' + code[e_pos:]
    print("Replaced updateSSAPeriodDropdown cleanly!")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: app.js controls updated!")
