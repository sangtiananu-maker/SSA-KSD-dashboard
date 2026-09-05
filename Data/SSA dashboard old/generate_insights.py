import os
import json
import csv

# Paths (defaults to the script's directory)
workspace_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(workspace_dir, "consolidated_sales_data.json")

# Load consolidated sales data
with open(json_path, 'r', encoding='utf-8') as f:
    sales_data = json.load(f)

# Sort data chronologically
sales_data.sort(key=lambda x: (x["year"], x["month_num"]))

# Get unique products
all_products = sorted(list(set(p["product_name"] for m in sales_data for p in m["products"])))
branches = ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7']

months_en = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
months_th = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
months_th_short = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

def get_thai_month_label(date_key):
    y, m = map(int, date_key.split('-'))
    return f"{months_th_short[m-1]} {y+543}"

def get_en_month_label(date_key):
    y, m = map(int, date_key.split('-'))
    return f"{months_en[m-1]} {y}"

# Pre-compute data structures for helper queries
monthly_data_map = {m["date_key"]: m for m in sales_data}

# Helper to aggregate list of months into a single data object
def aggregate_periods(period_list):
    if not period_list:
        return None
    aggregated = {
        "products": {}
    }
    for p_data in period_list:
        for p in p_data["products"]:
            pname = p["product_name"]
            if pname not in aggregated["products"]:
                aggregated["products"][pname] = {
                    "product_name": pname,
                    "incentive_price": p["incentive_price"],
                    "branches": {b: 0 for b in branches},
                    "total_qty": 0,
                    "total_incentive": 0.0
                }
            ap = aggregated["products"][pname]
            ap["total_qty"] += p["total_qty"]
            ap["total_incentive"] += p["total_incentive"]
            for b in branches:
                ap["branches"][b] += p["branches"].get(b, 0)
    
    # Convert back to array
    aggregated["products"] = list(aggregated["products"].values())
    return aggregated

# Structures for insights output
insights = {
    "monthly": {},
    "ytd": {},
    "yearly": {},
    "yoy": {},
    "products": {p: {"monthly": {}, "ytd": {}, "yearly": {}, "yoy": {}} for p in all_products}
}

# --- METRIC COMPUTATIONS & INSIGHT GENERATOR FUNCTIONS ---

def generate_overall_text(current, prior, period_label_th, period_label_en, is_yoy=False):
    # Current totals
    c_qty = sum(p["total_qty"] for p in current["products"])
    c_inc = sum(p["total_incentive"] for p in current["products"])
    
    # Calculate branch performance
    b_totals = {b: 0 for b in branches}
    b_inc_totals = {b: 0 for b in branches}
    for p in current["products"]:
        for b in branches:
            b_totals[b] += p["branches"].get(b, 0)
            b_inc_totals[b] += p["branches"].get(b, 0) * p["incentive_price"]
            
    top_branch_qty = max(b_totals, key=b_totals.get)
    top_branch_qty_val = b_totals[top_branch_qty]
    top_branch_inc = max(b_inc_totals, key=b_inc_totals.get)
    top_branch_inc_val = b_inc_totals[top_branch_inc]
    
    # Top product
    sorted_prods_qty = sorted(current["products"], key=lambda x: x["total_qty"], reverse=True)
    sorted_prods_inc = sorted(current["products"], key=lambda x: x["total_incentive"], reverse=True)
    
    top_prod_qty = sorted_prods_qty[0] if sorted_prods_qty else None
    top_prod_inc = sorted_prods_inc[0] if sorted_prods_inc else None
    
    # Prior comparison
    p_qty, p_inc = 0, 0
    qty_diff_pct, inc_diff_pct = 0.0, 0.0
    has_prior = False
    
    if prior:
        p_qty = sum(p["total_qty"] for p in prior["products"])
        p_inc = sum(p["total_incentive"] for p in prior["products"])
        if p_qty > 0:
            qty_diff_pct = ((c_qty - p_qty) / p_qty) * 100
        if p_inc > 0:
            inc_diff_pct = ((c_inc - p_inc) / p_inc) * 100
        has_prior = True

    # 1. English Summary
    en_overview = f"In {period_label_en}, total sales reached <strong>{c_qty:,} units</strong> with a total incentive value of <strong>฿{c_inc:,.0f}</strong>. "
    if has_prior:
        dir_qty = "growth" if qty_diff_pct >= 0 else "decline"
        dir_inc = "increase" if inc_diff_pct >= 0 else "decrease"
        en_overview += f"This represents a <strong>{dir_qty} of {abs(qty_diff_pct):.1f}%</strong> in quantity and an incentive <strong>{dir_inc} of {abs(inc_diff_pct):.1f}%</strong> compared to the {('previous year' if is_yoy else 'prior period')}."
    else:
        en_overview += "This is the initial tracking period; baseline is now established for future comparison."
        
    en_details = f"<strong>{top_branch_qty}</strong> emerged as the top branch by sales volume with <strong>{top_branch_qty_val:,} units</strong> (representing {top_branch_qty_val/c_qty*100:.1f}% of total). "
    if top_prod_qty:
        en_details += f"The leading product by volume was <strong>{top_prod_qty['product_name']}</strong>, selling <strong>{top_prod_qty['total_qty']:,} units</strong>. "
    if top_prod_inc and top_prod_inc['product_name'] != (top_prod_qty['product_name'] if top_prod_qty else ''):
        en_details += f"However, <strong>{top_prod_inc['product_name']}</strong> generated the highest financial return, contributing <strong>฿{top_prod_inc['total_incentive']:,.0f}</strong> in total incentives."

    # Recommendations
    if has_prior and inc_diff_pct < -5:
        en_rec = f"Performance is down by {abs(inc_diff_pct):.1f}%. It is highly recommended to audit low-performing products in branches with significant drop rates (especially checking the growth/drop drivers chart below) and organize a sales coaching session for store staff to revive incentives."
    elif has_prior and inc_diff_pct > 5:
        en_rec = f"Strong performance showing a {inc_diff_pct:.1f}% growth! Capture this momentum by ensuring high-incentive drivers like {top_prod_inc['product_name'] if top_prod_inc else 'top products'} are well-stocked in active branches like {top_branch_inc}."
    else:
        en_rec = f"Sales levels are holding steady. To drive further growth, consider launching a targeted campaign focusing on top-margin products in mid-tier branches to boost branch performance."

    # 2. Thai Summary
    th_overview = f"ในงวด {period_label_th} ยอดขายสินค้าค่าเชียร์สะสมรวมทั้งหมด <strong>{c_qty:,} ยูนิต</strong> คิดเป็นมูลค่าค่าเชียร์รวมทั้งสิ้น <strong>{c_inc:,.0f} บาท</strong> "
    if has_prior:
        dir_qty = "เติบโตขึ้น" if qty_diff_pct >= 0 else "ลดลง"
        dir_inc = "เพิ่มขึ้น" if inc_diff_pct >= 0 else "ลดลง"
        th_overview += f"คิดเป็นการ<strong>{dir_qty} {abs(qty_diff_pct):.1f}%</strong> ในเชิงปริมาณ และมีมูลค่าค่าเชียร์<strong>{dir_inc} {abs(inc_diff_pct):.1f}%</strong> เมื่อเทียบกับ {('ปี 2025' if is_yoy else 'ช่วงก่อนหน้า')}"
    else:
        th_overview += "เป็นงวดแรกของการบันทึกข้อมูลและใช้เป็นฐานสำหรับการเปรียบเทียบในอนาคต"

    th_details = f"สาขา <strong>{top_branch_qty}</strong> เป็นผู้ทำยอดขายสูงสุดด้วยจำนวน <strong>{b_totals[top_branch_qty]:,} ยูนิต</strong> (คิดเป็น {b_totals[top_branch_qty]/c_qty*100:.1f}% ของยอดรวม) "
    if top_prod_qty:
        th_details += f"โดยสินค้าที่มียอดขายสูงสุดในเชิงปริมาณคือ <strong>{top_prod_qty['product_name']}</strong> จำนวน <strong>{top_prod_qty['total_qty']:,} ยูนิต</strong> "
    if top_prod_inc and top_prod_inc['product_name'] != (top_prod_qty['product_name'] if top_prod_qty else ''):
        th_details += f"ขณะที่ <strong>{top_prod_inc['product_name']}</strong> ทำส่วนแบ่งมูลค่าค่าเชียร์ได้สูงสุดที่ <strong>{top_prod_inc['total_incentive']:,.0f} บาท</strong>"

    # Recommendations Thai
    if has_prior and inc_diff_pct < -5:
        th_rec = f"ผลงานโดยรวมหดตัวลง {abs(inc_diff_pct):.1f}% แนะนำให้ผู้บริหารตรวจสอบหาสาเหตุในสาขาที่มีการลดลงสูงสุด และเร่งกระตุ้นยอดขายสินค้ากลุ่มหลักเพื่อดึงยอดค่าเชียร์กลับคืนมา"
    elif has_prior and inc_diff_pct > 5:
        th_rec = f"ผลงานเติบโตอย่างมีนัยสำคัญ (+{inc_diff_pct:.1f}%) แนะนำให้รักษาความต่อเนื่องโดยการเติมสินค้าที่เป็นตัวหลัก เช่น {top_prod_inc['product_name'] if top_prod_inc else 'สินค้าแนะนำ'} ให้เต็มชั้นวางในสาขาขายดีอย่าง {top_branch_inc}"
    else:
        th_rec = "ผลงานอยู่ในระดับทรงตัว แนะนำให้กระตุ้นยอดขายเพิ่มเติมในกลุ่มสินค้าที่มีค่าเชียร์สูงเป็นพิเศษเพื่อสร้างอัตราการเติบโตในไตรมาสถัดไป"

    return {
        "en": f"<p>{en_overview}</p><p>{en_details}</p><p>💡 <strong>Strategy:</strong> {en_rec}</p>",
        "th": f"<p>{th_overview}</p><p>{th_details}</p><p>💡 <strong>กลยุทธ์แนะนำ:</strong> {th_rec}</p>"
    }


def generate_product_text(pname, current, prior, period_label_th, period_label_en, is_yoy=False):
    # Get current product record
    c_prod = next((p for p in current["products"] if p["product_name"] == pname), None)
    
    if not c_prod or c_prod["total_qty"] == 0:
        return {
            "en": f"<p>Product <strong>{pname}</strong> recorded <strong>no sales</strong> during {period_label_en}. Consider evaluating its distribution or staff awareness of this item.</p>",
            "th": f"<p>สินค้า <strong>{pname}</strong> <strong>ไม่มีบันทึกยอดขาย</strong> ในงวด {period_label_th} ควรตรวจสอบการจัดเรียงสินค้าบนชั้นวางและความตระหนักรู้ของพนักงานต่อสินค้านี้</p>"
        }

    c_qty = c_prod["total_qty"]
    c_inc = c_prod["total_incentive"]
    
    # Calculate product rank
    all_prods_sorted = sorted(current["products"], key=lambda x: x["total_qty"], reverse=True)
    rank = next((idx for idx, p in enumerate(all_prods_sorted, 1) if p["product_name"] == pname), len(all_prods_sorted))
    
    # Find top branch for this product
    top_b = max(c_prod["branches"], key=c_prod["branches"].get)
    top_b_val = c_prod["branches"][top_b]
    
    # Prior comparison
    p_prod = next((p for p in prior["products"] if p["product_name"] == pname), None) if prior else None
    p_qty = p_prod["total_qty"] if p_prod else 0
    p_inc = p_prod["total_incentive"] if p_prod else 0
    
    has_prior = p_qty > 0
    qty_diff_pct = 0.0
    if has_prior:
        qty_diff_pct = ((c_qty - p_qty) / p_qty) * 100

    # English product text
    en_overview = f"<strong>{pname}</strong> sold a total of <strong>{c_qty:,} units</strong> (generating <strong>฿{c_inc:,.0f}</strong>), ranking <strong>#{rank}</strong> out of {len(all_prods_sorted)} products. "
    if has_prior:
        dir_word = "upward growth of" if qty_diff_pct >= 0 else "downward decline of"
        en_overview += f"This marks an {dir_word} <strong>{abs(qty_diff_pct):.1f}%</strong> compared to the previous period. "
    
    en_branch = f"Sales were heavily driven by branch <strong>{top_b}</strong>, which contributed <strong>{top_b_val:,} units</strong> ({top_b_val/c_qty*100:.1f}% of its total sales)."
    
    # Strategic suggestion
    if rank <= 5:
        en_sug = "This is a top-tier product. Ensure maximum inventory levels and place promotional materials prominently near the cash counter to sustain performance."
    elif has_prior and qty_diff_pct < -10:
        en_sug = f"Sales have dropped significantly. Consider boosting employee motivation by running a small challenge or target bonus specifically for this product to drive recovery."
    else:
        en_sug = "Steady performance. Consider introducing product bundles or combining it with other items in branches with lower sales volumes to stimulate demand."

    # Thai product text
    th_overview = f"สินค้า <strong>{pname}</strong> ทำยอดขายรวมในงวดนี้ได้ <strong>{c_qty:,} ยูนิต</strong> (สร้างยอดค่าเชียร์ <strong>{c_inc:,.0f} บาท</strong>) จัดอยู่ใน<strong>อันดับที่ {rank}</strong> จากสินค้าทั้งหมด {len(all_prods_sorted)} รายการ "
    if has_prior:
        dir_word = "เติบโตเพิ่มขึ้น" if qty_diff_pct >= 0 else "หดตัวลง"
        th_overview += f"โดยมียอดขาย{dir_word} <strong>{abs(qty_diff_pct):.1f}%</strong> จากงวดก่อนหน้า "

    th_branch = f"สาขาที่เป็นเสาหลักทำยอดขายหลักคือ <strong>{top_b}</strong> มียอดจำหน่าย <strong>{top_b_val:,} ยูนิต</strong> (คิดเป็นสัดส่วน {top_b_val/c_qty*100:.1f}% ของยอดขายสินค้านี้ทั้งหมด)"
    
    # Strategic suggestion Thai
    if rank <= 5:
        th_sug = "จัดเป็นสินค้าขายดีมาก ควรดูแลเรื่องสต็อกไม่ให้ขาดตลาด และจัดพื้นที่จัดแสดงพิเศษเพื่อดึงดูดลูกค้าและรักษายอดขายหลักนี้ไว้"
    elif has_prior and qty_diff_pct < -10:
        th_sug = f"ยอดขายตกลงอย่างต่อเนื่อง (-{abs(qty_diff_pct):.1f}%) แนะนำให้จัดแคมเปญเพิ่มยอดค่าเชียร์พิเศษให้แก่พนักงานในสาขาเป้าหมายเพื่อช่วยฟื้นฟูยอดขาย"
    else:
        th_sug = "ยอดขายอยู่ในระดับปานกลางและทรงตัว สามารถกระตุ้นยอดขายได้ด้วยการแนะนำควบคู่กับผลิตภัณฑ์อื่นๆ หรือจัดกิจกรรมกระตุ้นหน้าร้านในสาขาที่ยอดขายยังต่ำอยู่"

    return {
        "stats": {
            "qty": c_qty,
            "incentive": c_inc,
            "rank": f"{rank} / {len(all_prods_sorted)}",
            "growth": f"{qty_diff_pct:+.1f}%" if has_prior else "New / Baseline"
        },
        "en": f"<p>{en_overview}</p><p>{en_branch}</p><p>🎯 <strong>Strategy:</strong> {en_sug}</p>",
        "th": f"<p>{th_overview}</p><p>{th_branch}</p><p>🎯 <strong>กลยุทธ์แนะนำ:</strong> {th_sug}</p>"
    }

# --- GENERATE INSIGHTS ACROSS ALL CONFIGURATIONS ---

print("Generating Monthly Insights...")
for idx, m in enumerate(sales_data):
    date_key = m["date_key"]
    prior = sales_data[idx - 1] if idx > 0 else None
    
    # Overall summary
    label_en = get_en_month_label(date_key)
    label_th = get_thai_month_label(date_key)
    insights["monthly"][date_key] = generate_overall_text(m, prior, label_th, label_en)
    
    # Product analyses
    for pname in all_products:
        insights["products"][pname]["monthly"][date_key] = generate_product_text(pname, m, prior, label_th, label_en)

print("Generating YTD Insights...")
for idx, m in enumerate(sales_data):
    date_key = m["date_key"]
    year = m["year"]
    month_num = m["month_num"]
    
    # Current YTD list of months
    curr_ytd_months = [x for x in sales_data if x["year"] == year and x["month_num"] <= month_num]
    curr_ytd_agg = aggregate_periods(curr_ytd_months)
    
    # Prior YTD list of months (prior year)
    prior_ytd_months = [x for x in sales_data if x["year"] == (year - 1) and x["month_num"] <= month_num]
    prior_ytd_agg = aggregate_periods(prior_ytd_months) if prior_ytd_months else None
    
    label_en = f"YTD Up to {months_en[month_num - 1]} {year}"
    label_th = f"สะสมตั้งแต่ต้นปีถึง {months_th[month_num - 1]} {year+543}"
    
    insights["ytd"][date_key] = generate_overall_text(curr_ytd_agg, prior_ytd_agg, label_th, label_en)
    
    for pname in all_products:
        insights["products"][pname]["ytd"][date_key] = generate_product_text(pname, curr_ytd_agg, prior_ytd_agg, label_th, label_en)

print("Generating Yearly Insights...")
years = sorted(list(set(m["year"] for m in sales_data)))
for y in years:
    curr_y_months = [x for x in sales_data if x["year"] == y]
    curr_y_agg = aggregate_periods(curr_y_months)
    
    prior_y_months = [x for x in sales_data if x["year"] == (y - 1)]
    prior_y_agg = aggregate_periods(prior_y_months) if prior_y_months else None
    
    label_en = f"Year {y}"
    label_th = f"ปี {y+543}"
    
    insights["yearly"][str(y)] = generate_overall_text(curr_y_agg, prior_y_agg, label_th, label_en)
    
    for pname in all_products:
        insights["products"][pname]["yearly"][str(y)] = generate_product_text(pname, curr_y_agg, prior_y_agg, label_th, label_en)

print("Generating YoY Insights...")
m25 = set(x["month_num"] for x in sales_data if x["year"] == 2025)
m26 = set(x["month_num"] for x in sales_data if x["year"] == 2026)
overlap_months = sorted(list(m25.intersection(m26)))

for mn in overlap_months:
    curr_yoy_months = [x for x in sales_data if x["year"] == 2026 and x["month_num"] == mn]
    curr_yoy_agg = aggregate_periods(curr_yoy_months)
    
    prior_yoy_months = [x for x in sales_data if x["year"] == 2025 and x["month_num"] == mn]
    prior_yoy_agg = aggregate_periods(prior_yoy_months)
    
    label_en = f"YoY {months_en[mn-1]} (2025 vs 2026)"
    label_th = f"เปรียบเทียบ {months_th[mn-1]} (2568 เทียบ 2569)"
    
    insights["yoy"][str(mn)] = generate_overall_text(curr_yoy_agg, prior_yoy_agg, label_th, label_en, is_yoy=True)
    
    for pname in all_products:
        insights["products"][pname]["yoy"][str(mn)] = generate_product_text(pname, curr_yoy_agg, prior_yoy_agg, label_th, label_en, is_yoy=True)

# Write output as JS file
output_js_path = os.path.join(workspace_dir, "insights_data.js")
with open(output_js_path, 'w', encoding='utf-8') as f:
    f.write("// Dynamic AI insights data computed from consolidated sales data\n")
    f.write("const aiInsights = ")
    json.dump(insights, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"Successfully generated insights file at: {output_js_path}")
