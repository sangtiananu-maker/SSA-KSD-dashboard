import os
import sys
import json
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

print("=== Starting Power BI Star Schema Data Model Export ===")

workspace_dir = r"d:\Antigravity\SSA ยอดขาย"
output_dir = os.path.join(workspace_dir, "PowerBI_DataModel")
os.makedirs(output_dir, exist_ok=True)

# 1. Load data.js
data_js_path = os.path.join(workspace_dir, "data.js")
print(f"Reading data from: {data_js_path}")

with open(data_js_path, "r", encoding="utf-8") as f:
    raw_content = f.read()

# Extract JSON from `const PAC_DATA = {...};`
json_start = raw_content.find('{')
json_end = raw_content.rfind('}') + 1
pac_data = json.loads(raw_content[json_start:json_end])

print("Loaded PAC_DATA successfully.")

# ==============================================================================
# A. DIM_PRODUCT (Master Product Dimension)
# ==============================================================================
print("Generating Dim_Product...")
products_dict = {}

# From SSA products
for p in pac_data.get("ssa_products_august", []):
    sku = str(p.get("sku", "")).strip() or p.get("lao_name", "").strip()
    if sku and sku not in products_dict:
        products_dict[sku] = {
            "Product_SKU": sku,
            "Product_Name_Lao": p.get("lao_name", ""),
            "Product_Name_Thai": p.get("thai_name", ""),
            "Product_Name_PAC": p.get("english_name", "") or p.get("ksd_name", ""),
            "Brand_Group": p.get("brand_group", "Other"),
            "Is_Strategic": "Yes" if p.get("is_strategic") else "No",
            "Is_Incentive": "Yes" if p.get("is_incentive") else "No",
            "Classification": p.get("classification", "Standard"),
            "Unit": p.get("unit", "")
        }

# From KSD Products by Period
for period, prod_list in pac_data.get("ksd_products_by_period", {}).items():
    for p in prod_list:
        sku = str(p.get("sku", "")).strip() or p.get("name", "").strip()
        if sku and sku not in products_dict:
            products_dict[sku] = {
                "Product_SKU": sku,
                "Product_Name_Lao": p.get("name", ""),
                "Product_Name_Thai": p.get("name", ""),
                "Product_Name_PAC": p.get("name", ""),
                "Brand_Group": p.get("brand_group", "Other"),
                "Is_Strategic": "Yes" if p.get("is_strategic") else "No",
                "Is_Incentive": "No",
                "Classification": p.get("classification", "General"),
                "Unit": "Unit"
            }

# From Catalog
for cat_prod in pac_data.get("strategic_catalog", []):
    sku = str(cat_prod.get("sku", "")).strip()
    name = cat_prod.get("product_name", "")
    if sku and sku in products_dict:
        products_dict[sku]["Is_Strategic"] = "Yes"
        products_dict[sku]["Brand_Group"] = cat_prod.get("brand_group", products_dict[sku]["Brand_Group"])
    elif sku:
        products_dict[sku] = {
            "Product_SKU": sku,
            "Product_Name_Lao": name,
            "Product_Name_Thai": name,
            "Product_Name_PAC": name,
            "Brand_Group": cat_prod.get("brand_group", "Other"),
            "Is_Strategic": "Yes",
            "Is_Incentive": "Yes",
            "Classification": "Strategic",
            "Unit": "Unit"
        }

dim_product_df = pd.DataFrame(list(products_dict.values()))
dim_product_path = os.path.join(output_dir, "Dim_Product.csv")
dim_product_df.to_csv(dim_product_path, index=False, encoding="utf-8-sig")
print(f"-> Created {dim_product_path} ({len(dim_product_df)} rows)")

# ==============================================================================
# B. DIM_STORE (Branch Dimension)
# ==============================================================================
print("Generating Dim_Store...")
branches = pac_data.get("branches", ["SSA1", "SSA2", "SSA3", "SSA5", "SSA6", "SSA7"])
branch_names_th = pac_data.get("branch_names_th", {})

store_records = []
for b in branches:
    store_records.append({
        "Store_ID": b,
        "Store_Name": branch_names_th.get(b, b),
        "Short_Code": b,
        "City": "Vientiane Capital",
        "Country": "Laos",
        "Channel": "Pharmacy Chain"
    })

dim_store_df = pd.DataFrame(store_records)
dim_store_path = os.path.join(output_dir, "Dim_Store.csv")
dim_store_df.to_csv(dim_store_path, index=False, encoding="utf-8-sig")
print(f"-> Created {dim_store_path} ({len(dim_store_df)} rows)")

# ==============================================================================
# C. DIM_DATE (Calendar Dimension)
# ==============================================================================
print("Generating Dim_Date...")
date_range = pd.date_range(start="2025-01-01", end="2026-12-31", freq="D")
dim_date_df = pd.DataFrame({
    "Date": date_range,
    "Date_Key": date_range.strftime("%Y%m%d").astype(int),
    "Year": date_range.year,
    "Quarter": "Q" + date_range.quarter.astype(str),
    "Month_Number": date_range.month,
    "Month_Name_EN": date_range.strftime("%B"),
    "Month_Short_EN": date_range.strftime("%b"),
    "Year_Month": date_range.strftime("%Y-%m"),
    "Year_Month_Order": date_range.year * 100 + date_range.month,
    "Day_Of_Week": date_range.strftime("%A"),
    "Is_Weekend": np.where(date_range.weekday >= 5, "Yes", "No")
})

dim_date_path = os.path.join(output_dir, "Dim_Date.csv")
dim_date_df.to_csv(dim_date_path, index=False, encoding="utf-8-sig")
print(f"-> Created {dim_date_path} ({len(dim_date_df)} rows)")

# ==============================================================================
# D. FACT_SSA_SALES (Branch Sell-Out Sales)
# ==============================================================================
print("Generating Fact_SSA_Sales...")
fact_ssa_records = []
for p in pac_data.get("ssa_products_august", []):
    sku = str(p.get("sku", "")).strip() or p.get("lao_name", "").strip()
    branch_qtys = p.get("branch_qtys", {})
    branch_prices = p.get("branch_prices_lak", {})
    
    for b in branches:
        qty = branch_qtys.get(b, 0)
        amount_lak = branch_prices.get(b, 0.0)
        
        if qty > 0 or amount_lak > 0:
            fact_ssa_records.append({
                "Date": "2026-08-31",
                "Year_Month": "2026-08",
                "Store_ID": b,
                "Product_SKU": sku,
                "Quantity": qty,
                "Amount_LAK": amount_lak,
                "Amount_THB_Est": round(amount_lak / 650.0, 2)  # Approx FX rate
            })

fact_ssa_df = pd.DataFrame(fact_ssa_records)
fact_ssa_path = os.path.join(output_dir, "Fact_SSA_Sales.csv")
fact_ssa_df.to_csv(fact_ssa_path, index=False, encoding="utf-8-sig")
print(f"-> Created {fact_ssa_path} ({len(fact_ssa_df)} rows)")

# ==============================================================================
# E. FACT_INCENTIVE (17-Month Historical Incentive)
# ==============================================================================
print("Generating Fact_Incentive...")
fact_inc_records = []
historical_incentives = pac_data.get("historical_incentives", [])

for period_obj in historical_incentives:
    date_key = period_obj.get("date_key", "")
    if not date_key:
        continue
    
    year = period_obj.get("year", 2026)
    month = period_obj.get("month_num", 1)
    status = period_obj.get("status", "Official")
    
    for prod in period_obj.get("products", []):
        name = prod.get("product_name", "")
        rate = float(prod.get("incentive_price", 0.0) or 0.0)
        
        branch_map = prod.get("branches", {})
        if branch_map and any(v > 0 for v in branch_map.values()):
            for b_id, b_qty in branch_map.items():
                if b_qty > 0:
                    fact_inc_records.append({
                        "Period": date_key,
                        "Year": int(year),
                        "Month": int(month),
                        "Date": f"{date_key}-28",
                        "Store_ID": b_id,
                        "Product_Name": name,
                        "Incentive_Rate_THB": rate,
                        "Quantity": int(b_qty),
                        "Incentive_Amount_THB": round(float(b_qty * rate), 2),
                        "Status": status
                    })
        else:
            tot_qty = prod.get("total_qty", 0)
            tot_inc = prod.get("total_incentive", 0.0)
            if tot_qty > 0 or tot_inc > 0:
                fact_inc_records.append({
                    "Period": date_key,
                    "Year": int(year),
                    "Month": int(month),
                    "Date": f"{date_key}-28",
                    "Store_ID": "ALL",
                    "Product_Name": name,
                    "Incentive_Rate_THB": rate,
                    "Quantity": int(tot_qty),
                    "Incentive_Amount_THB": round(float(tot_inc), 2),
                    "Status": status
                })

fact_inc_df = pd.DataFrame(fact_inc_records)
fact_inc_path = os.path.join(output_dir, "Fact_Incentive.csv")
fact_inc_df.to_csv(fact_inc_path, index=False, encoding="utf-8-sig")
print(f"-> Created {fact_inc_path} ({len(fact_inc_df)} rows)")

# ==============================================================================
# F. FACT_KSD_SALES & FACT_KSD_MONTHLY
# ==============================================================================
print("Generating Fact_KSD_Monthly_Sales & Fact_KSD_Product_Sales...")

# 1. Monthly Sell-out Summary
ksd_records = []
for row in pac_data.get("ksd_monthly_history", []):
    period = row.get("date_key", "")
    if not period and "year" in row and "month" in row:
        period = f"{row['year']}-{row['month']:02d}"
    if not period:
        continue
    
    y = row.get("year", 2026)
    m = row.get("month", 1)
    
    ksd_records.append({
        "Period": period,
        "Year": int(y),
        "Month": int(m),
        "Date": f"{period}-28",
        "Retail_SSA_Sales_THB": round(float(row.get("retail_ssa_bath", 0.0)), 2),
        "Wholesale_Sales_THB": round(float(row.get("wholesale_bath", 0.0)), 2),
        "Total_Sellout_THB": round(float(row.get("total_sellout_bath", 0.0)), 2),
        "Active_Customers": int(row.get("active_customers", 0))
    })

fact_ksd_df = pd.DataFrame(ksd_records)
fact_ksd_path = os.path.join(output_dir, "Fact_KSD_Monthly_Sales.csv")
fact_ksd_df.to_csv(fact_ksd_path, index=False, encoding="utf-8-sig")
print(f"-> Created {fact_ksd_path} ({len(fact_ksd_df)} rows)")

# 2. Product-level monthly sales
ksd_prod_records = []
for period, prod_list in pac_data.get("ksd_products_by_period", {}).items():
    if "-" in str(period):
        parts = str(period).split("-")
        y_str, m_str = parts[0], parts[1]
    else:
        y_str, m_str = "2026", "08"
        
    try:
        y = int(y_str)
    except ValueError:
        y = 2026
        
    try:
        m = int(m_str)
    except ValueError:
        m = 12 if "full" in m_str.lower() else 1
        
    date_str = f"{y:04d}-{m:02d}-28"
    period_str = f"{y:04d}-{m:02d}" if str(period) == f"{y}-{m_str}" and m_str.isdigit() else str(period)
        
    for p in prod_list:
        sku = str(p.get("sku", "")).strip() or p.get("name", "").strip()
        ksd_prod_records.append({
            "Period": period_str,
            "Year": y,
            "Month": m,
            "Date": date_str,
            "Product_SKU": sku,
            "Product_Name": p.get("name", ""),
            "Brand_Group": p.get("brand_group", "Other"),
            "Category": p.get("category", "General"),
            "Is_Strategic": "Yes" if p.get("is_strategic") else "No",
            "Orders_Count": int(p.get("orders", 0)),
            "Quantity": int(p.get("total_qty", 0)),
            "Amount_THB": round(float(p.get("total_bath", 0.0)), 2)
        })

fact_ksd_prod_df = pd.DataFrame(ksd_prod_records)
fact_ksd_prod_path = os.path.join(output_dir, "Fact_KSD_Product_Sales.csv")
fact_ksd_prod_df.to_csv(fact_ksd_prod_path, index=False, encoding="utf-8-sig")
print(f"-> Created {fact_ksd_prod_path} ({len(fact_ksd_prod_df)} rows)")

# 3. Dim_SalesRep
sales_reps = []
for idx, sp in enumerate(pac_data.get("ksd_by_salesperson", [])):
    sales_reps.append({
        "SalesRep_ID": f"REP_{idx+1:03d}",
        "SalesRep_Name": sp.get("salesperson", f"Sales {idx+1}"),
        "Team": sp.get("team", "KSD Distribution Team"),
        "Total_Sales_THB": round(float(sp.get("sales_thb", 0.0)), 2),
        "Total_Units": int(sp.get("units", 0))
    })

dim_rep_df = pd.DataFrame(sales_reps)
dim_rep_path = os.path.join(output_dir, "Dim_SalesRep.csv")
dim_rep_df.to_csv(dim_rep_path, index=False, encoding="utf-8-sig")
print(f"-> Created {dim_rep_path} ({len(dim_rep_df)} rows)")

# ==============================================================================
# G. GENERATE POWERBI_DAX_MEASURES.DAX
# ==============================================================================
print("Generating PowerBI_DAX_Measures.dax...")
dax_content = """// ==============================================================================
// PHARMA ALLIANCE (PAC) - EXECUTIVE POWER BI DAX MEASURES
// Star Schema Model DAX Calculation Formulas
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. KSD SALES & DISTRIBUTION MEASURES
// ------------------------------------------------------------------------------

[Total KSD Revenue THB] = 
SUM('Fact_KSD_Product_Sales'[Amount_THB])

[Total KSD Units] = 
SUM('Fact_KSD_Product_Sales'[Quantity])

[Total Orders Count] = 
SUM('Fact_KSD_Product_Sales'[Orders_Count])

[Strategic KSD Revenue THB] = 
CALCULATE(
    [Total KSD Revenue THB],
    'Fact_KSD_Product_Sales'[Is_Strategic] = "Yes"
)

[Strategic Revenue Share %] = 
DIVIDE([Strategic KSD Revenue THB], [Total KSD Revenue THB], 0)

[KSD Revenue YoY Growth %] = 
VAR CurrentSales = [Total KSD Revenue THB]
VAR PreviousYearSales = 
    CALCULATE(
        [Total KSD Revenue THB],
        SAMEPERIODLASTYEAR('Dim_Date'[Date])
    )
RETURN
    DIVIDE(CurrentSales - PreviousYearSales, PreviousYearSales, 0)

[KSD Revenue YTD THB] = 
TOTALYTD([Total KSD Revenue THB], 'Dim_Date'[Date])


// ------------------------------------------------------------------------------
// 2. SSA PHARMACY RETAIL MEASURES (6 BRANCHES)
// ------------------------------------------------------------------------------

[Total SSA Revenue LAK] = 
SUM('Fact_SSA_Sales'[Amount_LAK])

[Total SSA Units] = 
SUM('Fact_SSA_Sales'[Quantity])

[SSA Revenue Est THB] = 
SUM('Fact_SSA_Sales'[Amount_THB_Est])

[Average Units per Branch] = 
AVERAGEX(
    VALUES('Dim_Store'[Store_ID]),
    [Total SSA Units]
)

[Active Product Count (SSA)] = 
CALCULATE(
    DISTINCTCOUNT('Fact_SSA_Sales'[Product_SKU]),
    'Fact_SSA_Sales'[Quantity] > 0
)

[Strategic SSA Revenue LAK] = 
CALCULATE(
    [Total SSA Revenue LAK],
    'Dim_Product'[Is_Strategic] = "Yes"
)

[Strategic Retail Share %] = 
DIVIDE([Strategic SSA Revenue LAK], [Total SSA Revenue LAK], 0)


// ------------------------------------------------------------------------------
// 3. INCENTIVE ANALYTICS MEASURES (17 OFFICIAL MONTHS)
// ------------------------------------------------------------------------------

[Total Incentive Paid THB] = 
SUM('Fact_Incentive'[Incentive_Amount_THB])

[Total Incentive Units] = 
SUM('Fact_Incentive'[Quantity])

[Average Incentive Per Unit THB] = 
DIVIDE([Total Incentive Paid THB], [Total Incentive Units], 0)

[Official Incentive THB] = 
CALCULATE(
    [Total Incentive Paid THB],
    'Fact_Incentive'[Status] = "Official"
)

[Incentive YoY Growth %] = 
VAR CurrentInc = [Total Incentive Paid THB]
VAR PriorYearInc = 
    CALCULATE(
        [Total Incentive Paid THB],
        SAMEPERIODLASTYEAR('Dim_Date'[Date])
    )
RETURN
    DIVIDE(CurrentInc - PriorYearInc, PriorYearInc, 0)

[Incentive YTD THB] = 
TOTALYTD([Total Incentive Paid THB], 'Dim_Date'[Date])


// ------------------------------------------------------------------------------
// 4. STRATEGIC PENETRATION & PERFORMANCE
// ------------------------------------------------------------------------------

[Total Strategic SKUs] = 
CALCULATE(
    DISTINCTCOUNT('Dim_Product'[Product_SKU]),
    'Dim_Product'[Is_Strategic] = "Yes"
)

[Sold Strategic SKUs] = 
CALCULATE(
    DISTINCTCOUNT('Fact_SSA_Sales'[Product_SKU]),
    'Dim_Product'[Is_Strategic] = "Yes",
    'Fact_SSA_Sales'[Quantity] > 0
)

[Strategic SKU Penetration Rate %] = 
DIVIDE([Sold Strategic SKUs], [Total Strategic SKUs], 0)

[Active Selling Stores Count] = 
CALCULATE(
    DISTINCTCOUNT('Fact_SSA_Sales'[Store_ID]),
    'Fact_SSA_Sales'[Quantity] > 0
)
"""

dax_path = os.path.join(output_dir, "PowerBI_DAX_Measures.dax")
with open(dax_path, "w", encoding="utf-8") as f:
    f.write(dax_content)
print(f"-> Created {dax_path}")

# ==============================================================================
# H. GENERATE PAC_POWERBI_THEME.JSON
# ==============================================================================
print("Generating PAC_PowerBI_Theme.json...")
theme_json = {
    "name": "Pharma Alliance (PAC) Corporate PowerBI Theme",
    "dataColors": [
        "#118DFF",  # Power BI Blue
        "#12239E",  # Dark Navy
        "#E66C37",  # Vibrant Orange
        "#00A389",  # PAC Teal Green
        "#6B007B",  # Royal Plum
        "#E044A7",  # Magenta
        "#744EC2",  # Violet
        "#D9B300",  # Amber Gold
        "#D64550",  # Coral Red
        "#255B98"   # PAC Primary Blue
    ],
    "background": "#FFFFFF",
    "foreground": "#252423",
    "tableAccent": "#118DFF",
    "visualStyles": {
        "*": {
            "*": {
                "background": [{"show": True, "color": {"solid": {"color": "#FFFFFF"}}}],
                "visualHeader": [{"show": True}],
                "border": [{"show": True, "color": {"solid": {"color": "#E1DFDD"}}, "radius": 8}],
                "dropShadow": [{"show": True, "color": {"solid": {"color": "#000000"}}, "position": "Outer", "preset": "BottomRight"}]
            }
        },
        "card": {
            "*": {
                "labels": [{"fontSize": 24, "fontFamily": "Segoe UI", "bold": True}],
                "categoryLabels": [{"fontSize": 10, "fontFamily": "Segoe UI", "color": {"solid": {"color": "#605E5C"}}}]
            }
        }
    }
}

theme_path = os.path.join(output_dir, "PAC_PowerBI_Theme.json")
with open(theme_path, "w", encoding="utf-8") as f:
    json.dump(theme_json, f, ensure_ascii=False, indent=2)
print(f"-> Created {theme_path}")

print("=== Power BI Data Model Export Completed Successfully! ===")
