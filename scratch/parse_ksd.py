import pandas as pd
import openpyxl, os, sys, json

print('Testing KSD Multi-period generation script...')
f26 = 'Data/KSD_M1-M7.xlsx'
df_sku = pd.read_excel(f26, sheet_name='All sales by SKU', header=None)

col_map_thb = {
    '2026-01': 11,
    '2026-02': 13,
    '2026-03': 15,
    '2026-04': 17,
    '2026-05': 19,
    '2026-06': 21,
    '2026-07': 23,
    '2026-YTD7': 4,
    '2025-Full': 35,
    '2025-YTD7': 5
}
col_map_qty = {
    '2026-01': 49,
    '2026-02': 51,
    '2026-03': 53,
    '2026-04': 55,
    '2026-05': 57,
    '2026-06': 59,
    '2026-07': 61,
    '2026-YTD7': 48,
    '2025-Full': 73,
    '2025-YTD7': 73
}

products_by_period = {}
for per in col_map_thb:
    products_by_period[per] = []

for r in range(9, len(df_sku)):
    sku = str(df_sku.iloc[r, 0]).strip()
    name = str(df_sku.iloc[r, 1]).strip()
    cat = str(df_sku.iloc[r, 3]).strip() if pd.notna(df_sku.iloc[r, 3]) else ''
    if not sku or sku == 'nan' or sku == 'None':
        continue
    
    for per, c_thb in col_map_thb.items():
        c_qty = col_map_qty.get(per, c_thb)
        val_thb = pd.to_numeric(df_sku.iloc[r, c_thb], errors='coerce')
        val_qty = pd.to_numeric(df_sku.iloc[r, c_qty], errors='coerce')
        thb = float(val_thb) if pd.notna(val_thb) else 0.0
        qty = int(val_qty) if pd.notna(val_qty) else 0
        if thb > 0 or qty > 0:
            products_by_period[per].append({
                'sku': sku,
                'name': name,
                'category': cat,
                'total_bath': round(thb, 2),
                'total_qty': qty
            })

for per, prods in products_by_period.items():
    total_val = sum(p['total_bath'] for p in prods)
    print(f"{per}: {len(prods)} products, Total THB: {total_val:,.2f}")
