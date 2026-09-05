with open('index.html', 'r', encoding='utf-8') as f:
    h = f.read()

ws_pos = h.find('id="tab-whitespace"')
tab_ssa_end = h.rfind('</div>', 0, ws_pos)
print('tab_ssa_end position:', tab_ssa_end)
print("Snippet:\n", h[tab_ssa_end-150:tab_ssa_end+20])
