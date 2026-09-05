import pandas as pd
import openpyxl, os, sys, json, re

print('Building and testing Enhanced KSD Customer Structure...')

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
    'ບໍລິສັດ ຊໍการช่างลาว จໍາกັດ': 'บริษัท ช.การช่างลาว จำกัด',
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

# 1. Read KSD M8
df_ksd_all = pd.read_excel('Data/KSD_M8.xlsx', sheet_name='Sheet1')
df_ksd_pha = df_ksd_all[df_ksd_all['Invoice lines/Product/Vendor Reference'] == 'PHA00001'].copy()

m8_custs = []
for partner, grp in df_ksd_pha.groupby('Invoice lines/Partner'):
    team = str(grp['Sales Team'].iloc[0]) if pd.notna(grp['Sales Team'].iloc[0]) else ''
    cust_type = 'Hospital' if 'hosp' in team.lower() else ('SSA Pharmacy' if 'ssa' in str(partner).lower() or 'ໃສສະອາດ' in str(partner) else ('Wholesale' if 'whole' in team.lower() else 'Pharmacy/General'))
    prov = 'Vientiane Cap' if 'vientiane' in str(partner).lower() or 'สี่หอม' in str(partner) else ('North' if 'north' in team.lower() else ('South' if 'south' in team.lower() else 'Vientiane Cap'))
    m8_custs.append({
        'partner': str(partner).strip(),
        'clean_name': get_clean_cust(partner, cust_type),
        'type': cust_type,
        'province': prov,
        'total_bath': round(float(grp['Bath'].sum()), 2),
        'orders': int(len(grp)),
        'total_qty': int(grp['Invoice lines/Quantity'].sum())
    })
m8_custs.sort(key=lambda x: x['total_bath'], reverse=True)

# 2. Read KSD M1-M7
f26 = 'Data/KSD_M1-M7.xlsx'
df_cust26 = pd.read_excel(f26, sheet_name='Sales by customer', header=None)

cust_map_thb = {
    '2026-01': 16, '2026-02': 17, '2026-03': 18, '2026-04': 19,
    '2026-05': 20, '2026-06': 21, '2026-07': 22, '2026-YTD7': 28,
    '2025-Full': 14, '2025-YTD7': 29
}

ksd_customers_by_period = { '2026-08': m8_custs }
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

# Compute 2026-YTD (M1-M7 + M8)
cust_ytd_dict = {}
for r in range(9, len(df_cust26)):
    cno = str(df_cust26.iloc[r, 0]).strip()
    cname = str(df_cust26.iloc[r, 1]).strip()
    ctype = str(df_cust26.iloc[r, 2]).strip() if pd.notna(df_cust26.iloc[r, 2]) else 'Customer'
    cprov = str(df_cust26.iloc[r, 4]).strip() if pd.notna(df_cust26.iloc[r, 4]) else ''
    if (not cno or cno == 'nan') and (not cname or cname == 'nan'): continue
    
    val_thb = pd.to_numeric(df_cust26.iloc[r, 28], errors='coerce') # YTD Jul
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

for c in m8_custs:
    key = c['partner'].lower()
    if key in cust_ytd_dict:
        cust_ytd_dict[key]['total_bath'] += c['total_bath']
        cust_ytd_dict[key]['orders'] += c['orders']
    else:
        cust_ytd_dict[key] = dict(c)

cust_ytd_list = list(cust_ytd_dict.values())
for y in cust_ytd_list:
    y['total_bath'] = round(y['total_bath'], 2)
cust_ytd_list.sort(key=lambda x: x['total_bath'], reverse=True)
ksd_customers_by_period['2026-YTD'] = cust_ytd_list

print('KSD Customers by Period counts:')
for k, v in ksd_customers_by_period.items():
    print(f"  {k}: {len(v)} customers, total THB: {sum(x['total_bath'] for x in v):,.2f}")
    print(f"    Top 1: {v[0]['clean_name']} -> ฿{v[0]['total_bath']:,.2f}")
