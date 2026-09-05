import pandas as pd
import openpyxl, os, sys, json

print('Testing KSD Customer Multi-period generation script...')
f26 = 'Data/KSD_M1-M7.xlsx'
df_cust = pd.read_excel(f26, sheet_name='Sales by customer', header=None)

cust_map_thb = {
    '2026-01': 16,
    '2026-02': 17,
    '2026-03': 18,
    '2026-04': 19,
    '2026-05': 20,
    '2026-06': 21,
    '2026-07': 22,
    '2026-YTD7': 28,
    '2025-Full': 14,
    '2025-YTD7': 29
}

customers_by_period = {}
for per in cust_map_thb:
    customers_by_period[per] = []

for r in range(9, len(df_cust)):
    cno = str(df_cust.iloc[r, 0]).strip()
    cname = str(df_cust.iloc[r, 1]).strip()
    ctype = str(df_cust.iloc[r, 2]).strip() if pd.notna(df_cust.iloc[r, 2]) else 'Customer'
    cprov = str(df_cust.iloc[r, 4]).strip() if pd.notna(df_cust.iloc[r, 4]) else ''
    
    if (not cno or cno == 'nan') and (not cname or cname == 'nan'):
        continue
    
    for per, c_thb in cust_map_thb.items():
        val_thb = pd.to_numeric(df_cust.iloc[r, c_thb], errors='coerce')
        thb = float(val_thb) if pd.notna(val_thb) else 0.0
        if thb > 0:
            customers_by_period[per].append({
                'cus_no': cno,
                'name': cname,
                'type': ctype,
                'province': cprov,
                'total_bath': round(thb, 2)
            })

for per, custs in customers_by_period.items():
    total_val = sum(c['total_bath'] for c in custs)
    print(f"{per}: {len(custs)} customers, Total THB: {total_val:,.2f}")
