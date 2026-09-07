# แผนการพัฒนา Dashboard ควบคู่ 2 รูปแบบ (Classic Web Dashboard + Power BI Complete Edition)

ตามความต้องการที่ผู้ใช้ได้เน้นย้ำ: **"ให้แดชบอร์ดชุดปัจจุบันที่อยู่บนเว็บ GitHub Pages คงอยู่เหมือนเดิม 100% และให้ทำโปรเจกต์ Power BI ควบคู่กันไป"**

โครงสร้างของระบบจะถูกแยกเป็น 2 ส่วนชัดเจน (Dual Dashboard Architecture) โดยใช้ฐานข้อมูลชุดเดียวกัน (`data.js` / `Data/`) ทำให้ไม่ต้องดูแลข้อมูลซ้ำซ้อน และทั้งสองระบบทำงานร่วมกันได้อย่างสมบูรณ์แบบ:

1. **Dashboard ชุดเดิม (Classic Executive Dashboard)**:
   - ไฟล์: `index.html`, `styles.css`, `app.js`
   - **รักษาสภาพและฟังก์ชันเดิมไว้ 100%** ทั้งหน้าตา, สีสัน, เมนูด้านซ้าย, โหมดตรวจเยี่ยมสาขา, พจนานุกรม และระบบนำเข้าข้อมูล
   - เพิ่มเพียงปุ่มทางลัดสลับไปยังโหมด Power BI: **"📊 เปิดมุมมอง Power BI Dashboard"** (และในโหมด Power BI ก็มีปุ่มกลับมาหน้านี้)

2. **Dashboard ใหม่สไตล์ Power BI (Power BI Web Edition)**:
   - ไฟล์: `powerbi.html`, `powerbi_styles.css`, `powerbi_app.js`
   - หน้าเว็บอิสระที่สร้างขึ้นใหม่โดยเฉพาะ ออกแบบตาม UI/UX ของ **Microsoft Power BI Service / Desktop** 100%:
     - **Power BI Top Ribbon / Action Bar**: แถบเครื่องมือด้านบนพร้อมปุ่ม Export, Fullscreen, Filter Pane Toggle, และปุ่มสลับกลับหน้าเดิม
     - **Power BI Bottom Page Tabs**: แถบสลับหน้ารายงานที่ด้านล่าง (`Executive Summary`, `KSD Sell-Out`, `SSA Stores`, `Incentive Analytics`, `Strategic Matrix`, `Store Visit`, `Dictionary`)
     - **Power BI Collapsible Filter Pane**: แผงตัวกรองสไลด์เปิด/ปิดจากด้านขวา (Slicers: สาขา, กลุ่มสินค้า, สินค้ากลยุทธ์, ช่วงเวลา)
     - **Power BI Visual Containers**: การ์ดชาร์ตขอบมนพร้อม Visual Header, ปุ่ม Action Menu `...`, และปุ่ม **Focus Mode (ขยายเต็มจอ)**
     - **Power BI KPI New Cards**: ตัวเลข Callout ใหญ่พร้อมตัวบอกแนวโน้ม % Growth และสี Power BI มาตรฐาน
   - เชื่อมต่อกับ `data.js` ตัวเดียวกัน จึงอัปเดตข้อมูลพร้อมกันเสมอ และเปิดบน GitHub Pages ได้ทันทีผ่าน URL: `.../powerbi.html`

3. **ชุดไฟล์สำหรับ Microsoft Power BI Desktop (Desktop Data Model)**:
   - โฟลเดอร์: `PowerBI_DataModel/`
   - สคริปต์สกัดข้อมูล `export_powerbi_model.py` เพื่อสร้างตาราง Star Schema (CSV) สำหรับเปิดบนโปรแกรม Power BI Desktop
   - สูตรคำนวณ `PowerBI_DAX_Measures.dax`
   - ธีมสี `PAC_PowerBI_Theme.json` สำหรับ Import เข้า Power BI Desktop
   - คู่มือ `PowerBI_Desktop_Guide.md`

---

## Proposed Changes

### 1. Classic Dashboard (คงเดิม 100% + ทางลัดสลับโหมด)
#### [MODIFY] [index.html](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/index.html)
- เพิ่มปุ่มสลับไปยัง Power BI Edition ใน Header / Sidebar: `<a href="powerbi.html" class="pbi-switch-btn">📊 มุมมอง Power BI</a>`

---

### 2. New Power BI Web Dashboard (แยกไฟล์อิสระ)
#### [NEW] [powerbi.html](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/powerbi.html)
- โครงสร้างหน้าเว็บตามแบบฉบับ Microsoft Power BI:
  - Top Action Bar (File, Export, Refresh, Theme, Fullscreen)
  - Canvas Container สำหรับจัดวาง Visuals
  - Right Collapsible Filter Pane
  - Bottom Page Tabs Navigation bar

#### [NEW] [powerbi_styles.css](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/powerbi_styles.css)
- ระบบตกแต่งสไตล์ Microsoft Power BI / Fluent Design:
  - สีธีม Power BI (Teal `#00A389`, Blue `#118DFF`, Navy `#12239E`, Orange `#E66C37`, Canvas `#F3F2F1`)
  - Power BI Visual Card Box Shadow & Header Controls
  - Filter Pane Slicer Cards
  - Bottom Tabs Styling

#### [NEW] [powerbi_app.js](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/powerbi_app.js)
- ลอจิกการทำงานของ Power BI Edition:
  - ดึงข้อมูลจาก `data.js` (ชุดเดียวกับ Dashboard เดิม)
  - เรนเดอร์ ApexCharts ในสไตล์ Power BI
  - จัดการ Page Tabs สลับหน้า 7 หน้า
  - จัดการ Filter Pane Slicers (กรองข้อมูลตามสาขา/กลุ่มสินค้า/สถานะ)
  - ฟังก์ชัน Focus Mode ขยายชาร์ต/ตารางเต็มจอ

---

### 3. Power BI Desktop Package
#### [NEW] [export_powerbi_model.py](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/export_powerbi_model.py)
- สคริปต์สกัดตาราง Star Schema ลงในโฟลเดอร์ `PowerBI_DataModel/`:
  - `Fact_KSD_Sales.csv`, `Fact_SSA_Sales.csv`, `Fact_Incentive.csv`
  - `Dim_Product.csv`, `Dim_Store.csv`, `Dim_Date.csv`, `Dim_SalesRep.csv`

#### [NEW] [PowerBI_DAX_Measures.dax](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/PowerBI_DataModel/PowerBI_DAX_Measures.dax)
- รวมสูตรคำนวณ DAX สำหรับผู้บริหาร

#### [NEW] [PAC_PowerBI_Theme.json](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/PowerBI_DataModel/PAC_PowerBI_Theme.json)
- ไฟล์ JSON Theme สำหรับ Power BI Desktop

#### [NEW] [PowerBI_Desktop_Guide.md](file:///d:/Antigravity/SSA%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%B2%E0%B8%A2/PowerBI_Desktop_Guide.md)
- คู่มือการใช้งานอย่างละเอียด

---

## Verification Plan

1. **ทดสอบ Dashboard เดิม (`index.html`)**: ตรวจสอบว่าเปิดใช้งานได้ตามปกติ 100% ทุกฟังก์ชันและมีปุ่มสลับไป Power BI
2. **ทดสอบ Power BI Web (`powerbi.html`)**: ตรวจสอบการเปิดดูในเบราว์เซอร์, การสลับ Page Tabs ล่าง, Filter Pane ด้านขวา, และ Focus Mode
3. **ทดสอบการสร้าง Data Model**: รัน `python export_powerbi_model.py` และตรวจสอบความถูกต้องของไฟล์ CSV และสูตร DAX ใน `PowerBI_DataModel/`
