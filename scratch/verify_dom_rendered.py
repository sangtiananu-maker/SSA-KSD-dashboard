import sys, io, re
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/edge_dom_after.html', 'r', encoding='utf-8') as f:
    html = f.read()

kpi_units = re.search(r'id="kpi_ssa_units"[^>]*>([^<]+)<', html)
kpi_val = re.search(r'id="kpi_ssa_val"[^>]*>([^<]+)<', html)
kpi_top_branch = re.search(r'id="kpi_ssa_top_branch"[^>]*>([^<]+)<', html)
kpi_top_prod = re.search(r'id="kpi_ssa_top_product"[^>]*>([^<]+)<', html)

print('KPI Units:', kpi_units.group(1) if kpi_units else 'NOT FOUND')
print('KPI Val:', kpi_val.group(1) if kpi_val else 'NOT FOUND')
print('KPI Top Branch:', kpi_top_branch.group(1) if kpi_top_branch else 'NOT FOUND')
print('KPI Top Product:', kpi_top_prod.group(1) if kpi_top_prod else 'NOT FOUND')

rows = re.findall(r'id="tbody_ssa_all_branches"[^>]*>(.*?)</tbody>', html, re.DOTALL)
if rows:
    tr_count = len(re.findall(r'<tr', rows[0]))
    print(f'tbody_ssa_all_branches has {tr_count} rows rendered!')

audit_rows = re.findall(r'id="tbody_ssa_all_audit_products"[^>]*>(.*?)</tbody>', html, re.DOTALL)
if audit_rows:
    tr_count = len(re.findall(r'<tr', audit_rows[0]))
    print(f'tbody_ssa_all_audit_products has {tr_count} rows rendered!')
