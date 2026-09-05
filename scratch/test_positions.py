import os, re

with open('app.js', 'r', encoding='utf-8') as f:
    orig = f.read()

# Verify section 1: start of renderCurrentTab to start of renderWhiteSpaceTab
start_marker_1 = '  const renderCurrentTab = () => {
    if (state.currentTab === \'tab-ssa\')'
end_marker_1 = '  // ==============================================================================
  // 5. TAB 3: STRATEGIC WHITE-SPACE MATRIX'

p1_start = orig.find(start_marker_1)
p1_end = orig.find(end_marker_1)
print('p1_start:', p1_start, 'p1_end:', p1_end)

# Verify section 2: start of initIncentiveControls to start of renderKSDTab
start_marker_2 = '  // ==============================================================================
  // 6. TAB 4: INCENTIVE SYSTEM'
end_marker_2 = '  // ==============================================================================
  // 7. TAB 5: KSD DISTRIBUTOR SALES'

p2_start = orig.find(start_marker_2)
p2_end = orig.find(end_marker_2)
print('p2_start:', p2_start, 'p2_end:', p2_end)

# Verify section 3: start of initImportModal to end of file
start_marker_3 = '  // ==============================================================================
  // 10. IMPORT DATA MODAL LOGIC'
p3_start = orig.find(start_marker_3)
print('p3_start:', p3_start)
