import pandas as pd
import openpyxl, os, sys, json, re

print('Building and testing Enhanced KSD Data Structure...')

# Load strategic catalog
f_strat = 'Data/รายการสินค้ากลยุทธ์ 2026.xlsx'
df_strat = pd.read_excel(f_strat, sheet_name=0)
pac_catalog = []
for _, r in df_strat.iterrows():
    if pd.notna(r.iloc[0]):
        pac_catalog.append({
            'sku': str(r.iloc[1]).strip() if len(r) > 1 and pd.notna(r.iloc[1]) else '',
            'name': str(r.iloc[0]).strip(),
            'classification': str(r.iloc[2]).strip() if len(r) > 2 and pd.notna(r.iloc[2]) else 'Drug'
        })

def get_brand_group(name):
    name_clean = str(name).strip()
    match = re.match(r'^([A-Za-z0-9\-]+)', name_clean)
    if match:
        b = match.group(1).capitalize()
        if b.lower() in ['capsika', 'plaivana', 'clena', 'clenascar', 'calza', 'axamin', 'prozeus', 'zenzera', 'tristan', 'diabederm', 'arotika', 'glucosa', 'nacoxib', 'finasteride', 'raqua', 'zentocide', 'clinovir', 'zertine', 'stugin', 'domper-m', 'cephalexyl', 'noraphen', 'spascopan', 'g-bismol', 'gastro']:
            return b
    return name_clean.split(' ')[0] if ' ' in name_clean else name_clean

def check_is_strategic_prod(sku, name):
    target = f"{sku} {name}".lower()
    for sc in pac_catalog:
        sc_name = sc['name'].lower()
        if sc_name in target or target in sc_name or (sc.get('sku') and sc['sku'] in target):
            return True, sc['classification'], get_brand_group(sc['name'])
    keywords = ['capsika', 'plaivana', 'clena', 'calza', 'axamin', 'bismol', 'prozeus', 'zenzera', 'tristan', 'diabederm', 'arotika', 'glucosa', 'nacoxib', 'finasteride', 'raqua', 'zentocide', 'clinovir', 'zertine', 'stugin', 'domper-m', 'cephalexyl', 'noraphen', 'spascopan']
    for k in keywords:
        if k in target:
            return True, 'Strategic', k.title()
    return False, 'General', get_brand_group(name)

# 1. Read KSD M8
df_ksd_all = pd.read_excel('Data/KSD_M8.xlsx', sheet_name='Sheet1')
df_ksd_all = df_ksd_all[~df_ksd_all['Invoice lines/Product/Name'].astype(str).str.lower().str.contains(r'\(free\)', regex=True)]
df_ksd_pha = df_ksd_all[df_ksd_all['Invoice lines/Product/Vendor Reference'] == 'PHA00001'].copy()
df_ksd_pha['SKU_clean'] = df_ksd_pha['Invoice lines/Product/Internal Reference'].astype(str).str.replace('.0', '', regex=False).str.strip().str.zfill(5)

# 2. Build 2026-08 Products & Customers
m8_prods = []
for (sku, name), grp in df_ksd_pha.groupby(['SKU_clean', 'Invoice lines/Product/Name']):
    is_strat, cat, bg = check_is_strategic_prod(sku, name)
    m8_prods.append({
        'sku': sku,
        'name': name,
        'brand_group': bg,
        'classification': cat,
        'is_strategic': is_strat,
        'total_bath': round(float(grp['Bath'].sum()), 2),
        'total_qty': int(grp['Invoice lines/Quantity'].sum()),
        'orders': int(len(grp))
    })
m8_prods.sort(key=lambda x: x['total_bath'], reverse=True)

# 3. Read KSD_M1-M7
f26 = 'Data/KSD_M1-M7.xlsx'
df_sku26 = pd.read_excel(f26, sheet_name='All sales by SKU', header=None)
df_cust26 = pd.read_excel(f26, sheet_name='Sales by customer', header=None)

col_map_thb = {
    '2026-01': 11, '2026-02': 13, '2026-03': 15, '2026-04': 17,
    '2026-05': 19, '2026-06': 21, '2026-07': 23, '2026-YTD7': 4,
    '2025-Full': 35, '2025-YTD7': 5
}
col_map_qty = {
    '2026-01': 49, '2026-02': 51, '2026-03': 53, '2026-04': 55,
    '2026-05': 57, '2026-06': 59, '2026-07': 61, '2026-YTD7': 48,
    '2025-Full': 73, '2025-YTD7': 73
}

ksd_products_by_period = { '2026-08': m8_prods }
for per in ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2025-Full', '2025-YTD']:
    p_key = '2025-YTD7' if per == '2025-YTD' else per
    c_thb = col_map_thb[p_key]
    c_qty = col_map_qty[p_key]
    prods = []
    for r in range(9, len(df_sku26)):
        sku = str(df_sku26.iloc[r, 0]).strip()
        name = str(df_sku26.iloc[r, 1]).strip()
        if not sku or sku == 'nan': continue
        val_thb = pd.to_numeric(df_sku26.iloc[r, c_thb], errors='coerce')
        val_qty = pd.to_numeric(df_sku26.iloc[r, c_qty], errors='coerce')
        thb = float(val_thb) if pd.notna(val_thb) else 0.0
        qty = int(val_qty) if pd.notna(val_qty) else 0
        if thb > 0 or qty > 0:
            is_strat, cat, bg = check_is_strategic_prod(sku, name)
            prods.append({
                'sku': sku,
                'name': name,
                'brand_group': bg,
                'classification': cat,
                'is_strategic': is_strat,
                'total_bath': round(thb, 2),
                'total_qty': qty,
                'orders': 0
            })
    prods.sort(key=lambda x: x['total_bath'], reverse=True)
    ksd_products_by_period[per] = prods

# Compute 2026-YTD (M1-M7 + M8)
ytd_dict = {}
for p in ksd_products_by_period.get('2026-07', []): # initialize with historical SKUs
    pass

for r in range(9, len(df_sku26)):
    sku = str(df_sku26.iloc[r, 0]).strip()
    name = str(df_sku26.iloc[r, 1]).strip()
    if not sku or sku == 'nan': continue
    val_thb = pd.to_numeric(df_sku26.iloc[r, 4], errors='coerce') # YTD Jul
    val_qty = pd.to_numeric(df_sku26.iloc[r, 48], errors='coerce')
    thb = float(val_thb) if pd.notna(val_thb) else 0.0
    qty = int(val_qty) if pd.notna(val_qty) else 0
    is_strat, cat, bg = check_is_strategic_prod(sku, name)
    ytd_dict[sku] = {
        'sku': sku,
        'name': name,
        'brand_group': bg,
        'classification': cat,
        'is_strategic': is_strat,
        'total_bath': thb,
        'total_qty': qty,
        'orders': 0
    }

for p in m8_prods:
    sku = p['sku']
    if sku in ytd_dict:
        ytd_dict[sku]['total_bath'] += p['total_bath']
        ytd_dict[sku]['total_qty'] += p['total_qty']
        ytd_dict[sku]['orders'] += p['orders']
    else:
        ytd_dict[sku] = dict(p)

ytd_list = list(ytd_dict.values())
for y in ytd_list:
    y['total_bath'] = round(y['total_bath'], 2)
ytd_list.sort(key=lambda x: x['total_bath'], reverse=True)
ksd_products_by_period['2026-YTD'] = ytd_list

print('KSD Products by Period counts:')
for k, v in ksd_products_by_period.items():
    print(f"  {k}: {len(v)} products, total THB: {sum(x['total_bath'] for x in v):,.2f}")
