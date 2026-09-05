import pandas as pd
import openpyxl, os, sys, json, re

print('Testing KSD Full Integration...')
# Load strategic items
df_strat = pd.read_excel('Data/รายการสินค้ากลยุทธ์ 2026.xlsx', sheet_name=0)
strat_names = set(df_strat.iloc[:, 0].dropna().astype(str).str.lower().str.strip())
print(f'Loaded {len(strat_names)} strategic items')

f26 = 'Data/KSD_M1-M7.xlsx'
df_sku = pd.read_excel(f26, sheet_name='All sales by SKU', header=None)

def is_strategic_prod(sku, name):
    target = f"{sku} {name}".lower()
    for s in strat_names:
        if s in target or target in s:
            return True
    keywords = ['capsika', 'plaivana', 'clena', 'calza', 'axamin', 'bismol', 'prozeus', 'zenzera', 'tristan', 'diabederm', 'arotika', 'glucosa', 'nacoxib', 'finasteride', 'raqua', 'zentocide', 'clinovir', 'zertine', 'stugin', 'domper-m', 'cephalexyl', 'noraphen', 'spascopan']
    for k in keywords:
        if k in target:
            return True
    return False

sample_matches = []
for r in range(9, len(df_sku)):
    sku = str(df_sku.iloc[r, 0]).strip()
    name = str(df_sku.iloc[r, 1]).strip()
    if sku and sku != 'nan':
        strat = is_strategic_prod(sku, name)
        sample_matches.append((sku, name, strat))

print(f"Total SKUs: {len(sample_matches)}, Strategic count: {sum(1 for s in sample_matches if s[2])}")
for s in sample_matches[:8]:
    print(f"[{'STRAT' if s[2] else 'OTHER'}] {s[0]}: {s[1]}")
