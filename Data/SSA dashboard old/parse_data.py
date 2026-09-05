import os
import csv
import json
import glob
import re

# Workspace directory containing the CSVs (defaults to the script's directory)
workspace_dir = os.path.dirname(os.path.abspath(__file__))
csv_files = glob.glob(os.path.join(workspace_dir, "คำนวณค่าเชียร์ SSA - *.csv"))

# Map of month abbreviations to numbers
months_map = {
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
    "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
}

def parse_filename(filename):
    basename = os.path.basename(filename)
    match = re.search(r"คำนวณค่าเชียร์ SSA - ([A-Za-z]+)\s+(\d+)\.csv", basename)
    if match:
        month_str, year_str = match.groups()
        month = months_map.get(month_str)
        year = int("20" + year_str)
        return month_str, month, year
    return None

data = []

# Try different encodings
encodings = ['utf-8-sig', 'utf-8', 'tis-620', 'cp874', 'latin-1']

for file_path in csv_files:
    meta = parse_filename(file_path)
    if not meta:
        print(f"Skipping file: {file_path}")
        continue
    
    month_str, month_num, year = meta
    
    content = None
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc) as f:
                content = f.read()
            if "ชื่อสินค้า" in content or "ราคาค่าเชียร์" in content:
                break
        except Exception:
            continue
            
    if not content:
        print(f"Could not read {file_path} with any encoding.")
        continue
        
    lines = content.strip().split('\n')
    reader = csv.reader(lines)
    rows = list(reader)
    
    if not rows:
        continue
        
    header_row_idx = -1
    for i, row in enumerate(rows):
        if row and any("ชื่อสินค้า" in col for col in row):
            header_row_idx = i
            break
            
    if header_row_idx == -1:
        print(f"Error: Could not find header row in {os.path.basename(file_path)}")
        continue
        
    header = [col.strip() for col in rows[header_row_idx]]
    
    branches = ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7']
    branch_indices = {}
    for b in branches:
        idx = -1
        for j, col in enumerate(header):
            if col == b or col.startswith(b):
                idx = j
                break
        if idx != -1:
            branch_indices[b] = idx
            
    product_idx = -1
    for j, col in enumerate(header):
        if "ชื่อสินค้า" in col:
            product_idx = j
            break
            
    price_idx = -1
    for j, col in enumerate(header):
        if "ราคาค่าเชียร์" in col or "ราคา" in col:
            price_idx = j
            break
            
    total_idx = -1
    for j, col in enumerate(header):
        if "รวม" in col or col == "รวม":
            total_idx = j
            break
            
    if product_idx == -1:
        product_idx = 0
    if price_idx == -1:
        price_idx = 1
        
    file_products = []
    
    for row in rows[header_row_idx + 1:]:
        if not row or len(row) <= product_idx:
            continue
        p_name = row[product_idx].strip()
        if not p_name or p_name == "รวม" or p_name.startswith("รวม") or p_name.startswith("ยอดรวม"):
            continue
            
        try:
            incentive_price = float(row[price_idx].replace(",", "")) if price_idx < len(row) and row[price_idx] else 0.0
        except ValueError:
            incentive_price = 0.0
            
        branch_qty = {}
        total_qty = 0
        
        for b, idx in branch_indices.items():
            if idx < len(row):
                val = row[idx].strip().replace(",", "")
                try:
                    qty = int(float(val)) if val else 0
                except ValueError:
                    qty = 0
                branch_qty[b] = qty
                total_qty += qty
            else:
                branch_qty[b] = 0
                
        if total_idx != -1 and total_idx < len(row):
            try:
                row_total = int(float(row[total_idx].strip().replace(",", ""))) if row[total_idx].strip() else 0
            except ValueError:
                row_total = total_qty
        else:
            row_total = total_qty
            
        total_incentive = row_total * incentive_price
        
        file_products.append({
            "product_name": p_name,
            "incentive_price": incentive_price,
            "branches": branch_qty,
            "total_qty": row_total,
            "total_incentive": total_incentive
        })
        
    data.append({
        "month_str": month_str,
        "month_num": month_num,
        "year": year,
        "date_key": f"{year}-{month_num:02d}",
        "products": file_products
    })

# Sort chronologically
data.sort(key=lambda x: (x["year"], x["month_num"]))

# Save consolidated JSON
output_json_path = os.path.join(workspace_dir, "consolidated_sales_data.json")
with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Save consolidated JS
output_js_path = os.path.join(workspace_dir, "data.js")
with open(output_js_path, 'w', encoding='utf-8') as f:
    f.write("// Consolidated sales data generated from monthly CSV files\n")
    f.write("const salesData = ")
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"\nSuccessfully processed {len(data)} CSV files.")
print(f"Generated: {output_json_path}")
print(f"Generated: {output_js_path}")

# Automatically regenerate AI insights
insights_script = os.path.join(workspace_dir, "generate_insights.py")
if os.path.exists(insights_script):
    print("\nRunning generate_insights.py to update AI summaries and product analysis...")
    try:
        import subprocess
        result = subprocess.run(["python", insights_script], capture_output=True, text=True, check=True)
        print(result.stdout)
    except Exception as e:
        print(f"Error running generate_insights.py: {e}")
