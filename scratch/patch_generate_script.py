import sys, os

print("Creating patch for generate_integrated_data.py...")

patch_code = '''
# ------------------------------------------------------------------------------
# 2.2 KSD CUSTOMER CLEANING & STRATEGIC PRODUCT HELPERS
# ------------------------------------------------------------------------------
CUST_TRANSLATIONS = {
    'ໃສສະອາດ ສາຂາໜອງດ້ວງ (ສາຂາ 1)': 'ร้านยาใสสะอาด สาขา 1 (หนองด้วง/สีหอม)',
    'ໃສສະອາດ ສາຂາຈອມມະນີ (ສາຂາ 5)': 'ร้านยาใสสะอาด สาขา 5 (จอมมณี)',
    'ໃສສະອາດ ສາຂາສະພານທອງ (ສາຂາ 3)': 'ร้านยาใสสะอาด สาขา 3 (สะพานทอง)',
    'ໃສສະອາດ ສາຂາເພຍວັດ (ສາຂາ 7)': 'ร้านยาใสสะอาด สาขา 7 (เพียวัด/เก้ายอด)',
    'ໃສສະອາດ ສາຂາແສງສະຫວ່າງ (ສາຂາ 6)': 'ร้านยาใสสะอาด สาขา 6 (แสงสว่าง)',
    'ໃສສະອາດ ສາຂາ 2': 'ร้านยาใสสะอาด สาขา 2 (T2)',
    'ໂຮງໝໍ ມິດຕະພາບ (ສູນກາງ)': 'โรงพยาบาลมิตรภาพ (150 เตียง ศูนย์กลาง)',
    'ໂຮງໝໍ ມະໂຫສົດ': 'โรงพยาบาลมโหสถ (ศูนย์กลาง)',
    'ໂຮງໝໍ ເສດຖາທິຣາດ': 'โรงพยาบาลเศรษฐาธิราช (ศูนย์กลาง)',
    'ໂຮງໝໍ 103': 'โรงพยาบาล 103 กองทัพ',
    'ໂຮງໝໍ ມາເຣຍເຕເຣຊາ แขวง ວຽງຈັນ': 'โรงพยาบาลมาเรียเตเรซา (แขวงเวียงจันทน์)',
    'ໂຮງໝໍ ມາເຣຍເຕເຣຊາ ແຂວງ ວຽງຈັນ': 'โรงพยาบาลมาเรียเตเรซา (แขวงเวียงจันทน์)',
    'ພະແນກສາທາແຂວງ ສາລະວັນ': 'แผนกสาธารณสุข แขวงสาละวัน',
    'ພະແນກສາທາແຂວງ ເຊກອງ,(ໂຮງໝໍແຂວງ ເຊກອງ)': 'โรงพยาบาลแขวงเซกอง',
    'ພະແນກອອກບູ້ດ (Booth Event)': 'แผนกออกบูธ (Booth Event)',
    'ບໍລິສັດ ຊໍการช่างลาว จໍາກັດ': 'บริษัท ช.การช่างลาว จำกัด',
    'ບໍລິສັດ ຊໍการช่างลาว ຈໍາກັດ': 'บริษัท ช.การช่างลาว จำกัด',
    'ຮ້ານຂາຍຢາ ມິ່ງເມືອງ (ນາງ ເລ)': 'ร้านขายยามิ่งเมือง (นางเล)',
    'ຮ້ານຂายຢາ ໄຊຈະເລີນ (ທ່ານ ດຣ ວິໄລວອນ)': 'ร้านขายยา ไชยเจริญ (ดร. วิไลวอน)',
    'ຮ້ານຂายຢາ ແສງດາວ (ນ້ອຍ)': 'ร้านขายยา แสงดาว (น้อย)',
    'ຮ້ານຂายຢາ ທ່ານນາງ ບົວວອນ ໜອງຄຳ': 'ร้านขายยา นางบัววอน หนองคำ',
    'ຮ້ານຂายຢາ ເສລີພາບ': 'ร้านขายยาเสรีภาพ',
    'ຮ້ານຂายຢາ ດອກຈຳປາ': 'ร้านขายยาดอกจำปา',
    'ຮ້ານຂายຢາ ໂຊກໄຊ': 'ร้านขายยาโชคชัย',
    'ຮ້ານຂายຢາ ດວງດີ': 'ร้านขายยาดวงดี'
}

def get_clean_cust(name, ctype=''):
    if not name or pd.isna(name): return 'ไม่ระบุชื่อลูกค้า'
    s = str(name).strip()
    if s in CUST_TRANSLATIONS: return CUST_TRANSLATIONS[s]
    clean = s
    clean = re.sub(r'^ໃສສະອາດ', 'ร้านยาใสสะอาด', clean)
    clean = re.sub(r'^ໂຮງໝໍ', 'โรงพยาบาล', clean)
    clean = re.sub(r'^ຮ້ານຂາຍຢາ', 'ร้านขายยา', clean)
    clean = re.sub(r'^ຮ້ານ', 'ร้าน', clean)
    clean = re.sub(r'^ພະແນກສາທາແຂວງ', 'แผนกสาธารณสุขแขวง', clean)
    clean = re.sub(r'^ພະແນກອອກບູ້ດ', 'แผนกออกบูธ', clean)
    clean = re.sub(r'^ບໍລິສັດ', 'บริษัท', clean)
    clean = re.sub(r'^ຄລີນິກ|^ຄຣີນິກ', 'คลินิก', clean)
    if re.search(r'[»û¾­¡½§¸¤]', clean):
        if 'SSA' in clean.upper() or 'ใสสะอาด' in clean or 'Saysaath' in clean:
            return 'ร้านยาใสสะอาด (Saysaath Pharmacy)'
        if 'Wholesaler' in str(ctype):
            return f'ร้านยี่ปั๊ว/ขายส่ง ({clean[:12]}...)'
        return f'ลูกค้าทั่วไป ({clean[:12]}...)'
    return clean

def check_is_strategic_prod(sku, name):
    target = f"{sku} {name}".lower()
    for sc in pac_catalog:
        sc_name = sc['name'].lower()
        if sc_name in target or target in sc_name or (sc.get('sku') and sc['sku'] in target):
            return True, sc['classification'], get_brand_group(sc['name'])
    for si in strategic_items:
        si_name = si['name'].lower()
        if si_name in target or target in si_name:
            return True, 'Strategic', get_brand_group(si['name'])
    keywords = ['capsika', 'plaivana', 'clena', 'calza', 'axamin', 'bismol', 'prozeus', 'zenzera', 'tristan', 'diabederm', 'arotika', 'glucosa', 'nacoxib', 'finasteride', 'raqua', 'zentocide', 'clinovir', 'zertine', 'stugin', 'domper-m', 'cephalexyl', 'noraphen', 'spascopan']
    for k in keywords:
        if k in target:
            return True, 'Strategic', k.title()
    return False, 'General', get_brand_group(name)

# 2.3 BUILD AUGUST 2026 KSD PRODUCTS & CUSTOMERS
ksd_top_customers = []
for partner, group in df_ksd_pha.groupby('Invoice lines/Partner'):
    team = str(group['Sales Team'].iloc[0]) if pd.notna(group['Sales Team'].iloc[0]) else ''
    cust_type = 'Hospital' if 'hosp' in team.lower() else ('SSA Pharmacy' if 'ssa' in str(partner).lower() or 'ໃສສະອາດ' in str(partner) else ('Wholesale' if 'whole' in team.lower() else 'Pharmacy/General'))
    prov = 'Vientiane Cap' if 'vientiane' in str(partner).lower() or 'สี่หอม' in str(partner) else ('North' if 'north' in team.lower() else ('South' if 'south' in team.lower() else 'Vientiane Cap'))
    ksd_top_customers.append({
        'partner': str(partner).strip(),
        'clean_name': get_clean_cust(partner, cust_type),
        'type': cust_type,
        'province': prov,
        'orders': int(len(group)),
        'total_bath': round(float(group['Bath'].sum()), 2),
        'total_qty': int(group['Invoice lines/Quantity'].sum()),
        'team': team
    })
ksd_top_customers.sort(key=lambda x: x['total_bath'], reverse=True)

ksd_top_products = []
for (sku, name), group in df_ksd_pha.groupby(['SKU_clean', 'Invoice lines/Product/Name']):
    is_strat, cat, bg = check_is_strategic_prod(sku, name)
    ksd_top_products.append({
        'sku': sku,
        'name': name,
        'brand_group': bg,
        'classification': cat,
        'is_strategic': is_strat,
        'total_bath': round(float(group['Bath'].sum()), 2),
        'total_qty': int(group['Invoice lines/Quantity'].sum()),
        'orders': int(len(group))
    })
ksd_top_products.sort(key=lambda x: x['total_bath'], reverse=True)

# ------------------------------------------------------------------------------
# 3.1 READ KSD_M1-M12-2025.xlsx & KSD_M1-M7.xlsx (KSD HISTORICAL SELL-OUT DATA)
# ------------------------------------------------------------------------------
print("2.1 Reading KSD Historical Sell-out (2025 - 2026)...")
f25_ksd = 'Data/KSD_M1-M12-2025.xlsx'
f26_ksd = 'Data/KSD_M1-M7.xlsx'

df25_rep = pd.read_excel(f25_ksd, sheet_name='Sales report', header=None)
df26_rep = pd.read_excel(f26_ksd, sheet_name='Sales report', header=None)
df_sku26 = pd.read_excel(f26_ksd, sheet_name='All sales by SKU', header=None)
df_cust26 = pd.read_excel(f26_ksd, sheet_name='Sales by customer', header=None)

# Build Multi-Period Products & Customers Map
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

ksd_products_by_period = { '2026-08': ksd_top_products }
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

# Compute 2026-YTD Products (M1-M7 + M8)
ytd_dict = {}
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
        'sku': sku, 'name': name, 'brand_group': bg, 'classification': cat,
        'is_strategic': is_strat, 'total_bath': thb, 'total_qty': qty, 'orders': 0
    }
for p in ksd_top_products:
    sku = p['sku']
    if sku in ytd_dict:
        ytd_dict[sku]['total_bath'] += p['total_bath']
        ytd_dict[sku]['total_qty'] += p['total_qty']
        ytd_dict[sku]['orders'] += p['orders']
    else:
        ytd_dict[sku] = dict(p)
ytd_list = list(ytd_dict.values())
for y in ytd_list: y['total_bath'] = round(y['total_bath'], 2)
ytd_list.sort(key=lambda x: x['total_bath'], reverse=True)
ksd_products_by_period['2026-YTD'] = ytd_list

# Build Multi-Period Customers Map
cust_map_thb = {
    '2026-01': 16, '2026-02': 17, '2026-03': 18, '2026-04': 19,
    '2026-05': 20, '2026-06': 21, '2026-07': 22, '2026-YTD7': 28,
    '2025-Full': 14, '2025-YTD7': 29
}
ksd_customers_by_period = { '2026-08': ksd_top_customers }
for per in ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2025-Full', '2025-YTD']:
    p_key = '2025-YTD7' if per == '2025-YTD' else per
    c_col = cust_map_thb[p_key]
    custs = []
    for r in range(9, len(df_cust26)):
        cno = str(df_cust26.iloc[r, 0]).strip()
        cname = str(df_cust26.iloc[r, 1]).strip()
        ctype = str(df_cust26.iloc[r, 2]).strip() if pd.notna(df_cust26.iloc[r, 2]) else 'Customer'
        cprov = str(df_cust26.iloc[r, 4]).strip() if pd.notna(df_cust26.iloc[r, 4]) else ''
        if (not cno or cno == 'nan') and (not cname or cname == 'nan'): continue
        val_thb = pd.to_numeric(df_cust26.iloc[r, c_col], errors='coerce')
        thb = float(val_thb) if pd.notna(val_thb) else 0.0
        if thb > 0:
            name_disp = cname if cname and cname != 'nan' else cno
            custs.append({
                'partner': name_disp,
                'clean_name': get_clean_cust(name_disp, ctype),
                'type': ctype,
                'province': cprov,
                'total_bath': round(thb, 2),
                'orders': 0
            })
    custs.sort(key=lambda x: x['total_bath'], reverse=True)
    ksd_customers_by_period[per] = custs

# Compute 2026-YTD Customers (M1-M7 + M8)
cust_ytd_dict = {}
for r in range(9, len(df_cust26)):
    cno = str(df_cust26.iloc[r, 0]).strip()
    cname = str(df_cust26.iloc[r, 1]).strip()
    ctype = str(df_cust26.iloc[r, 2]).strip() if pd.notna(df_cust26.iloc[r, 2]) else 'Customer'
    cprov = str(df_cust26.iloc[r, 4]).strip() if pd.notna(df_cust26.iloc[r, 4]) else ''
    if (not cno or cno == 'nan') and (not cname or cname == 'nan'): continue
    val_thb = pd.to_numeric(df_cust26.iloc[r, 28], errors='coerce')
    thb = float(val_thb) if pd.notna(val_thb) else 0.0
    if thb > 0:
        name_disp = cname if cname and cname != 'nan' else cno
        key = name_disp.lower()
        cust_ytd_dict[key] = {
            'partner': name_disp,
            'clean_name': get_clean_cust(name_disp, ctype),
            'type': ctype,
            'province': cprov,
            'total_bath': thb,
            'orders': 0
        }
for c in ksd_top_customers:
    key = c['partner'].lower()
    if key in cust_ytd_dict:
        cust_ytd_dict[key]['total_bath'] += c['total_bath']
        cust_ytd_dict[key]['orders'] += c['orders']
    else:
        cust_ytd_dict[key] = dict(c)
cust_ytd_list = list(cust_ytd_dict.values())
for y in cust_ytd_list: y['total_bath'] = round(y['total_bath'], 2)
cust_ytd_list.sort(key=lambda x: x['total_bath'], reverse=True)
ksd_customers_by_period['2026-YTD'] = cust_ytd_list
'''

with open('generate_integrated_data.py', 'r', encoding='utf-8') as f:
    orig = f.read()

# Find target block
start_marker = 'ksd_top_customers = []'
end_marker = 'ksd_monthly_history = []'

s_idx = orig.find(start_marker)
e_idx = orig.find(end_marker)

if s_idx != -1 and e_idx != -1:
    new_code = orig[:s_idx] + patch_code.strip() + "\n\nksd_monthly_history = []" + orig[e_idx + len(end_marker):]
    
    # Also ensure final_data includes ksd_products_by_period and ksd_customers_by_period
    if "'ksd_products_by_period'" not in new_code:
        insert_marker = "'ksd_top_pac_products': ksd_top_products,"
        new_code = new_code.replace(
            insert_marker,
            insert_marker + "\n    'ksd_products_by_period': ksd_products_by_period,\n    'ksd_customers_by_period': ksd_customers_by_period,"
        )
    
    with open('generate_integrated_data.py', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("SUCCESS: generate_integrated_data.py patched successfully!")
else:
    print(f"FAILED: Markers not found: s_idx={s_idx}, e_idx={e_idx}")
