import os
import sys
import glob
import re
import json
import csv
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

print("Starting integrated data generation with explicit estimation labels...")

# ==============================================================================
# 1. PARSE LAO-THAI PHONETIC TRANSLATION DICTIONARY
# ==============================================================================
lao_thai_dict = {
    'ໂຄຕິມາໂຊນ': 'โคลไตรมาโซล',
    'ເບຕາເມທາໂຊນ': 'เบทาเมทาโซน',
    'ໂອເມປຼາໂຊນ': 'โอเมพราโซล',
    'ກູຕີຊິນ': 'กูติซิน',
    'ໂຄຊີຊິນ': 'โคลชิซิน',
    'ກູລໂກຄຼອນ': 'กลูโคครอน',
    'ກຼີກຼາຊາຍ': 'กลิคาไซด์',
    'ດົກຊີ ແຄັບ': 'ด็อกซี แคป',
    'ລ໋ອກຊີໂຕຼຊິນ': 'ร็อกซิโทรซิน',
    'ລ໋ອກຊີໂຕຼມາຍຊິນ': 'ร็อกซิโทรไมซิน',
    'ເຟກໂຊຕິນ': 'เฟกโซทีน',
    'ເຟກໂຊເຟນາດິນ': 'เฟกโซเฟนาดีน',
    'ເຊີຕິນ': 'เซอร์ติน',
    'ເຊຕີຣີຊິນ': 'เซทิริซีน',
    'ເຊັນເຊີລ່າ': 'เซนเซร่า',
    'ອັນເບນດາໂຊນ': 'อัลเบนดาโซล',
    'ໂນລາເຟັ້ນ': 'โนลาเฟน',
    'ສະປາດໂກປັງ': 'สปาสโคแพน',
    'ສປາດໂກປັງ': 'สปาสโคแพน',
    'ບຸດສໂກປັງ': 'บัสโคแพน',
    'ຄີໂນເວຍ': 'คลีโนเวียร์',
    'ຄຼີໂນເວຍ': 'คลีโนเวียร์',
    'ກາຍໂນເວຍ': 'ไกโนเวียร์',
    'ອາຊິດຄໍເວຍ': 'อะไซโคลเวียร์',
    'ອາຊີໂຄເວຍ': 'อะไซโคลเวียร์',
    'ສະໂປໂລຊີວ': 'สปอโรซิล',
    'ສະໂປລາຊີວ': 'สปอแร็กซิล',
    'ເກໂຕໂກນາໂຊນ': 'คีโตโคนาโซล',
    'ດອມເພີ-ເອັມ': 'ดอมเพอร์-เอ็ม',
    'ດອມເພີຣີໂດນ': 'ดอมเพอริโดน',
    'ຄຼີນີເມດ': 'คลีนิเมด',
    'ຊີເມຕີດິນ': 'ไซเมทิดีน',
    'ເຊຟາເລັກຊິລ': 'เซฟาเลกซิล',
    'ເຊຟາເລັກຊິນ': 'เซฟาเลกซิน',
    'ເຊຟ້າເລັກຊິນ': 'เซฟาเลกซิน',
    'ເຊພາເລັກຊິນ': 'เซฟาเลกซิน',
    'ສະຕູຈິ້ນ': 'สตูจิน',
    'ຊິນນາລີຊິນ': 'ซินนาริซีน',
    'ຄຼີນີວັດ-ເອັນ': 'คลีนิเวท-เอ็น',
    'ຄີນີວັດ-ເອັນ': 'คลีนิเวท-เอ็น',
    'ຄຼີນີວັດ': 'คลีนิเวท',
    'ຄີນີວັດ': 'คลีนิเวท',
    'ຄຼີໂນເດີມ': 'คลีโนเดิร์ม',
    'ຄີໂນເດີມ': 'คลีโนเดิร์ม',
    'ຄໍເບຕາໂຊນ': 'โคลเบทาโซน',
    'ໂຄເບຕາໂຊນ': 'โคลเบทาโซน',
    'ຄີນີເຈວ': 'คลีนิเจล',
    'ວັດເຊີລິນ': 'วาสลิน',
    'ແຟງໂກ-ບີດີ': 'แฟงโก-บีดี',
    'ແຟງໂກ-ບີ': 'แฟงโก-บี',
    'ແຟງໂກ': 'แฟงโก',
    'ສະກິນເຟັກ-ບີ': 'สกินเฟก-บี',
    'ສະກິນເຟກ-ບີ': 'สกินเฟก-บี',
    'ສະກິນເຟັກ': 'สกินเฟก',
    'ສະກິນເຟກ': 'สกินเฟก',
    'ຊັງຕ້າໄມຊິນ': 'เจนตามัยซิน',
    'ກູລໂກຊາ': 'กลูโคซ่า',
    'ກູລໂກແດບ': 'กลูโคแดบ',
    'ກີລປີຊາຍ': 'กลิพิไซด์',
    'ກາສໂຕ ບິສໂມນ': 'กาสโตร บิสมอล',
    'ກາດສໂຕບີຊາມອນ': 'กาสโตรบิสมอล',
    'ຈີ-ບີຊາໂມນ': 'จี-บิสมอล',
    'ຟາຕຸດຊິນ': 'ฟาตุสซิน',
    'ແຄບຊີກ້າ': 'แคปซิก้า',
    'ໄດອາບີເດີມ': 'ไดอาเบเดิร์ม',
    'ໄພວານາ': 'ไพลวาน่า',
    'ໂພຊີອຸດ15': 'โปรซีอุส 15',
    'ໂພຊີອຸດ': 'โปรซีอุส',
    'ອາຊາມິນ': 'อากซามิน',
    'ຕັງຊາມິກ ອາຊິດ': 'กรดทราเนกซามิก',
    'ເຊັນໂຕຊາຍ': 'เซนโตไซด์',
    'ປາຣາຊີກັງແຕນ': 'พราซิควอนเทล',
    'ມູໂຄບ໋ອກ': 'มิวโคบ็อกซ์',
    'ໄອຄ໋ອບ-ຈີ': 'ไอค็อฟ-จี',
    'ໄອຄ໋ອບ-ບີ': 'ไอค็อฟ-บี',
    'ໂອໂຟຼຊີ': 'โอฟลอซี',
    'ໂອໂຟຼຊາຊິນ': 'โอฟล็อกซาซิน',
    'ໂລລີຕ້າ': 'โลลิต้า',
    'ໂລລາຕາດິນ': 'ลอราทาดีน',
    'ຊີໂປຼຊິນ': 'ซิโปรซิน',
    'ຊີໂປຼໂຟຼຊາຊິນ': 'ซิโปรฟลอกซาซิน',
    'ໄຊໂປຼໂຟຼຊາຊິນ': 'ซิโปรฟลอกซาซิน',
    'ແອນແຊັກ': 'แอนแซก',
    'ຟູໂລຊີຕິນ': 'ฟลูออกซิทีน',
    'ຟູໂລຊິຕິນ': 'ฟลูออกซิทีน',
    'ຄາຊ່າ ພລັສ': 'คาช่า พลัส',
    'ຄາຊ່າ ໄນໂຕະ': 'คาช่า ไนโตะ',
    'ຄາຊ່າ': 'คาช่า',
    'ຄີນີເປດ': 'คลีนิเปร็ด',
    'ເປດນີໂຊໂລນ': 'เพรดนิโซโลน',
    'ຄຼີນນາສກາ': 'คลีนาสการ์',
    'ຊຸດລ້າງດັງ': 'ชุดล้างจมูก',
    'ເກືອລ້າງດັງ': 'เกลือล้างจมูก',
    'ດົກຊີຊິນລິນ': 'ด็อกซีไซคลิน',
    'ທາໂດນເຈສິກ': 'ทราดอลเจสิก',
    'ນໍຟຼອກຊິນ': 'นอร์ฟล็อกซิน',
    'ນໍຟຼອກຊາຊິນ': 'นอร์ฟล็อกซาซิน',
    'ບິນດູເລຕິກ': 'บินดูเรติก',
    'ບີ-ທີມິນ': 'บี-ธีมิน',
    'ຟາມາກ໋ອນ': 'ฟาร์มาคอน',
    'ຟາມາເຊັບ': 'ฟาร์มาเซฟ',
    'ເຊຟູໂຣຊິມ': 'เซฟูรอกซิม',
    'ຟາໂມແທບ': 'ฟาโมแทบ',
    'ຟາໂມຕີດິນ': 'ฟาโมทิดีน',
    'ຟູນາລີຊິນ': 'ฟลูนาริซีน',
    'ມາຍໂກຊິນ': 'ไมโคซิน',
    'ມາຍໂອລາ': 'ไมโอลา',
    'ອາເຊຕາມີໂນ+ຊໍໂຊ': 'พาราเซตามอล+คลอร์โซซาโซน',
    'ເດັກໂຕເມໂຕຟາມ': 'เดกซ์โทรเมทอร์แฟน',
    'ເນັບໄທ ນີເມຊູໄລ': 'เนปไท นิเมซูไลด์',
    'ເນັບໄທ': 'เนปไท',
    'ນີເມຊູໄລ': 'นิเมซูไลด์',
    'ເບສຕາຕິນ': 'เบสแตติน',
    'ເບຕາຮີດ': 'เบตาฮิสต์',
    'ເປດແຄັບ': 'เพรดแคป',
    'ເມັດຟໍມິນ': 'เมตฟอร์มิน',
    'ແຄວຊາ ແຄວຊຽມ': 'แคลซ่า แคลเซียม',
    'ແຄວຊາ': 'แคลซ่า',
    'ໂຄຕຼີຊິນ': 'โคตริซิน',
    'ບັກຕຼິມ': 'แบคทริม',
    'ໂລປິວ': 'โลปิล',
    'ໄກບີນິນ': 'กลัยนิน',
    'ກາຍໂນເຈຊິກ': 'ไกโนเจซิค',
    'ເມເຟນາມິກ ອາຊິດ': 'กรดเมเฟนามิก',
    'ຊີໂນ': 'ซีโน',
    'ອານເລີແລ໋ກ-ເອັຟຊີ': 'อัลเลอแร็กซ์-เอฟซี',
    'ອານເລີແລ໋ກ': 'อัลเลอแร็กซ์',
    'ຢາປົວໄວຣັສຕັບອັກເສບ ບີ': 'ยารักษาไวรัสตับอักเสบบี',
}

lao_words = {
    'ຄຼີມ': 'ครีม', 'ຄຣີມ': 'ครีม', 'ຄຼິມ': 'ครีม',
    'ເຈວ': 'เจล',
    'ແຜງ': 'แผง', 'ກັບ': 'กล่อง', 'ປ໋ອງ': 'กระปุก', 'ແພັກ': 'แพ็ค',
    'ເມັດ': 'เม็ด', 'ຫຼອດ': 'หลอด', 'ຊອງ': 'ซอง', 'ແຄັບຊູນ': 'แคปซูล', 'ເເຄັບຊູນ': 'แคปซูล',
    'ນໍ້າ': 'น้ำ', 'ສີບົວ': 'สีชมพู', 'ບົວ': 'ชมพู', 'ສີຂຽວ': 'สีเขียว', 'ສີຟ້າ': 'สีฟ้า', 'ແດງ': 'สีแดง',
    'ໝາກນາວ': 'มะนาว', 'ໝາກກ້ຽງ': 'ส้ม', 'ຄລາຊິກ': 'คลาสสิก',
    'ຂ້າ​ແມ່​ທ້ອງ​ແບບ​ຊອງ': 'ถ่ายพยาธิแบบซอง',
    'ໂລຊັ່ນ': 'โลชั่น', 'ໂລຊັນ': 'โลชั่น', 'ສເປຼ': 'สเปรย์',
    'ຖົງຫິ້ວ': 'ถุงหิ้ว', 'ເສື້ອຢືດ': 'เสื้อยืด',
    'ຕັ່ງແຄມປິ້ງ': 'เก้าอี้แคมปิ้ง', 'ໂຕະແຄມປິ້ງ': 'โต๊ะแคมปิ้ง',
    'ສປັນ ແພກ': 'สปอนจ์แพ็ค', 'ສປັນ': 'สปอนจ์', 'ແພກ': 'แพ็ค',
    'ສີຫອມ': 'สีหอม', 'ສະພານທອງ': 'สะพานทอง', 'ຈອມມະນີ': 'จอมมณี', 'ແສງສະຫວ່າງ': 'แสงสว่าง', 'ເກົ້າຍອດ': 'เก้ายอด'
}

def translate_lao_to_thai(lao_text):
    if not isinstance(lao_text, str):
        return ""
    result = lao_text.strip()
    for k in sorted(lao_thai_dict.keys(), key=len, reverse=True):
        result = result.replace(k, lao_thai_dict[k])
    for lw, tw in lao_words.items():
        if lw in result:
            result = result.replace(lw, tw)
    result = re.sub(r'[\u0E80-\u0EFF]', '', result)
    result = re.sub(r'\s+', ' ', result).strip()
    return result

lao_to_en = {
    'ໄພວານາ': 'Plaivana', 'ແຄບຊີກ້າ': 'Capsika', 'ໄດອາບີເດີມ': 'Diabederm', 'ແຟງໂກ-ບີ': 'Fango-B',
    'ແຟງໂກ': 'Fango', 'ແອນແຊັກ': 'Anxac', 'ໂນລາເຟັ້ນ': 'Noraphen', 'ໂພຊີອຸດ15': 'Prozeus 15',
    'ໂພຊີອຸດ': 'Prozeus', 'ໂລລີຕ້າ': 'Lolita', 'ໂອໂຟຼຊີ': 'Oflocee', 'ໄອຄ໋ອບ-ຈີ': 'Icof-G',
    'ໄອຄ໋ອບ-ບີ': 'Icof-B', 'ເຊັນເຊີລ່າ': 'Zencera', 'ເຊີຕິນ': 'Zertin', 'ເຊຟາເລັກຊິນ': 'Cefalexin',
    'ເຊຟ້າເລັກຊິນ': 'Cefalexin', 'ເຊພາເລັກຊິນ': 'Cefalexin', 'ເຊຟາເລັກຊິລ': 'Cefalexin',
    'ເຊຟູໂຣຊິມ': 'Cefuroxime', 'ອາຊາມິນ': 'Axamin', 'ອານເລີແລ໋ກ-ເອັຟຊີ': 'Allerlax-FC',
    'ອານເລີແລ໋ກ': 'Allerlax', 'ມູໂຄບ໋ອກ': 'Mucobox', 'ຟາໂມແທບ': 'Famotab', 'ຟູນາລີຊິນ': 'Flunarizine',
    'ດອມເພີ-ເອັມ': 'Domper-M', 'ຄຼີນີເມດ': 'Klenimed', 'ຄຼີນີວັດ-ເອັນ': 'Klenivet-N',
    'ຄີນີວັດ-ເອັນ': 'Klenivet-N', 'ຄຼີນີວັດ': 'Klenivet', 'ຄີນີວັດ': 'Klenivet',
    'ຄຼີໂນເດີມ': 'Kleniderm', 'ຄີໂນເດີມ': 'Kleniderm', 'ຄີນີເຈວ': 'Klenigel', 'ສະປາດໂກປັງ': 'Spascopan',
    'ສປາດໂກປັງ': 'Spascopan', 'ສະໂປໂລຊີວ': 'Sporosil', 'ສະໂປລາຊີວ': 'Sporosil', 'ສະກິນເຟັກ-ບີ': 'Skinfect-B',
    'ສະກິນເຟກ-ບີ': 'Skinfect-B', 'ສະກິນເຟັກ': 'Skinfect', 'ສະກິນເຟກ': 'Skinfect', 'ສະຕູຈິ້ນ': 'Stugin',
    'ກາຍໂນເຈຊິກ': 'Gynogesic', 'ກູລໂກຊາ': 'Glucosa', 'ກູລໂກແດບ': 'Glucodab', 'ກູລໂກຄຼອນ': 'Glucocron',
    'ກາສໂຕ ບິສໂມນ': 'Gastro-Bismol', 'ກາດສໂຕບີຊາມອນ': 'Gastro-Bismol', 'ຈີ-ບີຊາໂມນ': 'G-Bismol',
    'ຊີໂນ': 'Zeno', 'ຊີໂປຼຊິນ': 'Ciprocin', 'ເຊັນໂຕຊາຍ': 'Zentocide', 'ເດັກໂຕເມໂຕຟາມ': 'Dextromethorphan',
    'ເນັບໄທ': 'Nepthai', 'ເບສຕາຕິນ': 'Bestatin', 'ເບຕາຮີດ': 'Betahist', 'ເປດແຄັບ': 'Predcap',
    'ເມັດຟໍມິນ': 'Metformin', 'ແຄວຊາ': 'Calza', 'ໂຄຕຼີຊິນ': 'Cotricin', 'ໂລປິວ': 'Lopil',
    'ໄກບີນິນ': 'Glynin', 'ມາຍໂກຊິນ': 'Mycosin', 'ມາຍໂອລາ': 'Myola', 'ລ໋ອກຊີໂຕຼຊິນ': 'Roxithromycin',
    'ຄີໂນເວຍ': 'Clinovir', 'ຄຼີໂນເວຍ': 'Clinovir', 'ກາຍໂນເວຍ': 'Gynovir', 'ຟາຕຸດຊິນ': 'Fatusin',
    'ຄາຊ່າ ພລັສ': 'Kachaa Plus', 'ຄາຊ່າ ໄນໂຕະ': 'Kachaa Nito', 'ຄາຊ່າ': 'Kachaa', 'ຄີນີເປດ': 'Klenipred',
    'ຄຼີນນາສກາ': 'Clenascar', 'ຊຸດລ້າງດັງ': 'Cleanoze Nasal Kit', 'ເກືອລ້າງດັງ': 'Cleanoze Nasal Salt',
    'ດົກຊີ ແຄັບ': 'Doxy Cap', 'ດົກຊີຊິນລິນ': 'Doxycycline', 'ທາໂດນເຈສິກ': 'Tradolgesic',
    'ນໍຟຼອກຊິນ': 'Norfloxin', 'ບິນດູເລຕິກ': 'Binduretic', 'ບີ-ທີມິນ': 'B-Themin', 'ຟາມາກ໋ອນ': 'Pharmacon',
    'ຟາມາເຊັບ': 'Pharmacef', 'ກູຕີຊິນ': 'Guticin'
}

lao_terms_en = {
    'ຄຼີມ': 'Cream', 'ຄຣີມ': 'Cream', 'ຄຼິມ': 'Cream',
    'ເຈວ': 'Gel', 'ໂລຊັ່ນ': 'Lotion', 'ໂລຊັນ': 'Lotion',
    'ແຜງ': 'Bl', 'ກັບ': 'Box', 'ປ໋ອງ': 'Bottle', 'ແພັກ': 'Pack',
    'ເມັດ': 'Tab', 'ຫຼອດ': 'Tube', 'ຊອງ': 'Sach', 'ນໍ້າ': 'Syr',
    'ແຄັບຊູນ': 'Cap', 'ເເຄັບຊູນ': 'Cap',
    'ສີບົວ': 'Pink', 'ບົວ': 'Pink', 'ສີຂຽວ': 'Green', 'ສີຟ້າ': 'Blue', 'ແแดง': 'Red',
    'ໝາກນາວ': 'Lemon', 'ໝາກກ້ຽງ': 'Orange', 'ສເປຼ': 'Spray', 'ສປັນ ແພກ': 'SpongPak',
    'ສປັນ': 'SpongPak', 'ແພກ': 'Pack', 'ຄລາຊິກ': 'Classic',
    'ຂ້າ​ແມ່​ທ້ອງ​ແບບ​ຊອງ': 'Susp'
}

def translate_to_english(name):
    if not isinstance(name, str):
        return ""
    res = name.strip()
    for k in sorted(lao_to_en.keys(), key=len, reverse=True):
        res = res.replace(k, lao_to_en[k])
    for k in sorted(lao_terms_en.keys(), key=len, reverse=True):
        res = res.replace(k, lao_terms_en[k])
    # Remove remaining Lao chars
    res = re.sub(r'[\u0E80-\u0EFF]', '', res)
    res = re.sub(r'\s+', ' ', res).strip()
    return res

def get_brand_group(name):
    if not isinstance(name, str) or not name.strip():
        return "Other"
    n = name.lower()
    if '(free)' in n:
        n = n.replace('(free)', '').strip()
    if 'plaivana' in n or 'ไพลวาน่า' in n or 'ໄພວານາ' in n: return 'Plaivana'
    if 'capsika' in n or 'แคปซิก้า' in n or 'ແຄບຊີກ້າ' in n: return 'Capsika'
    if 'diabe' in n or 'ไดอาเบ' in n or 'ໄດອາບີ' in n: return 'Diabederm'
    if 'arotika' in n or 'อโรติกา' in n: return 'Arotika'
    if 'clenascar' in n or 'clena scar' in n or 'clena tm' in n or 'clena gel' in n or 'clena face' in n or 'คลีนาสการ์' in n: return 'Clenascar'
    if 'glucosa' in n or 'กลูโคซ่า' in n or 'ກູລໂກຊາ' in n: return 'Glucosa'
    if 'glucovia' in n or 'กลูโคเวีย' in n: return 'Glucovia'
    if 'prozeus' in n or 'โปรซีอุส' in n: return 'Prozeus'
    if 'precius' in n or 'เพรซิอุส' in n or 'ໂພຊີອຸດ' in n: return 'Precius'
    if 'fango' in n or 'แฟงโก' in n or 'ແຟงໂກ' in n: return 'Fango'
    if 'zenzera' in n or 'zencera' in n or 'เซนเซร่า' in n or 'ເຊັນເຊີລ່າ' in n: return 'Zenzera'
    if 'zertine' in n or 'zertin' in n or 'เซอร์ติน' in n or 'ເຊີຕິນ' in n: return 'Zertine'
    if 'anxac' in n or 'anzac' in n or 'แอนแซก' in n or 'ແອນແຊັກ' in n: return 'Anxac'
    if 'mucobox' in n or 'มิวโคบ็อกซ์' in n or 'ມູໂຄບ໋ອກ' in n: return 'Mucobox'
    if 'axamin' in n or 'อากซามิน' in n or 'ອາຊາມິນ' in n: return 'Axamin'
    if 'cephalex' in n or 'cefalex' in n or 'cepha' in n or 'เซฟาเลก' in n or 'ເຊຟາເລັກ' in n or 'ເຊພາເລັກ' in n: return 'Cephalexyl'
    if 'allerax' in n or 'allerlax' in n or 'อัลเลอแร็กซ์' in n or 'ອານເລີແລ໋ກ' in n: return 'Allerlax'
    if 'kleniderm' in n or 'คลีโนเดิร์ม' in n or 'ຄຼີໂນເດີມ' in n or 'ຄີໂນເດີມ' in n: return 'Kleniderm'
    if 'klenivet' in n or 'clinivate' in n or 'คลีนิเวท' in n or 'ຄຼີນີວັດ' in n or 'ຄີນີວັດ' in n: return 'Klenivet'
    if 'klenigel' in n or 'คลีนิเจล' in n or 'ຄີນີເຈວ' in n: return 'Klenigel'
    if 'klenimed' in n or 'clinimet' in n or 'คลีนิเมด' in n or 'ຄຼີນີເມດ' in n: return 'Klenimed'
    if 'klenipred' in n or 'clinipred' in n or 'คลีนิเพรด' in n: return 'Klenipred'
    if 'icof' in n or 'ไอค็อฟ' in n or 'ໄອຄ໋ອບ' in n: return 'Icof'
    if 'noraphen' in n or 'nolafen' in n or 'โนลาเฟน' in n or 'ໂນລາເຟັ້ນ' in n: return 'Noraphen'
    if 'famotab' in n or 'ฟาโมแทบ' in n or 'ຟາໂມແທບ' in n: return 'Famotab'
    if 'flunarizine' in n or 'ฟลูนาริซีน' in n or 'ຟູນາລີຊິນ' in n: return 'Flunarizine'
    if 'metformin' in n or 'เมตฟอร์มิน' in n or 'ເມັດຟໍມິນ' in n: return 'Metformin'
    if 'lopil' in n or 'โลปิล' in n or 'ໂລປິວ' in n: return 'Lopil'
    if 'oflocee' in n or 'ofloci' in n or 'โอฟลอซี' in n or 'ໂອໂຟຼຊີ' in n: return 'Oflocee'
    if 'lorita' in n or 'lolita' in n or 'โลลิต้า' in n or 'ໂລລີຕ້າ' in n: return 'Lolita'
    if 'skinfect' in n or 'สกินเฟก' in n or 'ສະກິນເຟັກ' in n: return 'Skinfect'
    if 'spascopan' in n or 'สปาสโคแพน' in n or 'ສະປາດໂກປັງ' in n or 'ສປາດໂກປັງ' in n: return 'Spascopan'
    if 'spasium' in n or 'สปาเซียม' in n: return 'Spasium'
    if 'sporosil' in n or 'sporaxyl' in n or 'sporoxyl' in n or 'สปอโรซิล' in n or 'ສະໂປໂລຊີວ' in n or 'ສະໂປລາຊີວ' in n: return 'Sporosil'
    if 'stugin' in n or 'สตูกิน' in n or 'สตูจิน' in n or 'ສະຕູຈິ້ນ' in n: return 'Stugin'
    if 'domper' in n or 'doper' in n or 'ดอมเพอร์' in n or 'ດອມເພີ' in n: return 'Domper-M'
    if 'gynogesic' in n or 'ไกโนเจซิค' in n or 'ກາຍໂນເຈຊິກ' in n: return 'Gynogesic'
    if 'bismol' in n or 'บิสมอล' in n or 'ບີຊາໂມน' in n: return 'Gastro-Bismol'
    if 'zeno' in n or 'zyno' in n or 'ซีโน' in n or 'ຊີໂນ' in n: return 'Zeno'
    if 'ciprocin' in n or 'ciproxyl' in n or 'ซิโปรซิน' in n or 'ຊີໂປຼຊິນ' in n: return 'Ciprocin'
    if 'zentocide' in n or 'zentozide' in n or 'เซนโตไซด์' in n or 'ເຊັນໂຕຊາຍ' in n: return 'Zentocide'
    if 'tristan' in n or 'ทริสตัน' in n: return 'Tristan'
    if 'nacoxib' in n or 'นาคอกซิบ' in n: return 'Nacoxib'
    if 'finasteride' in n or 'ฟีนาสเตอไรด์' in n: return 'Finasteride'
    if 'raqua' in n or 'ราควา' in n: return 'Raqua'
    if 'sportika' in n or 'สปอร์ตติกา' in n: return 'Sportika'
    if 'cleevec' in n or 'คลีเวค' in n: return 'Cleevec'
    if 'cleepro' in n or 'คลีโปร' in n: return 'Cleepro'
    if 'unifer' in n or 'ยูนิเฟอร์' in n: return 'Unifer'
    if 'clinovir' in n or 'climarir' in n or 'คลีโนเวียร์' in n or 'ຄີໂນເວຍ' in n: return 'Clinovir'
    if 'calza' in n or 'แคลซ่า' in n or 'ແຄວຊາ' in n: return 'Calza'
    if 'cotricin' in n or 'bactrim' in n or 'ໂຄຕຼີຊິນ' in n: return 'Cotricin'
    if 'fatusin' in n or 'ฟาตุสซิน' in n: return 'Fatusin'
    if 'dextiderm' in n or 'เด็กซ์ติเดิร์ม' in n: return 'Dextiderm'
    if 'donzept' in n or 'ดอนเซปต์' in n: return 'Donzept'
    if 'faibato' in n or 'ไฟบาโต' in n: return 'Faibato'
    if 'hepivir' in n or 'เฮปิเวียร์' in n: return 'Hepivir'
    if 'kachana' in n or 'kachaa' in n or 'คชาณะ' in n: return 'Kachana'
    if 'livera' in n or 'ลิเวร่า' in n: return 'Livera'
    if 'momor' in n or 'โมมอร์' in n: return 'Momor'
    if 'radiara' in n or 'ราเดียร่า' in n: return 'Radiara'
    if 'vs iii' in n or 'วีเอส' in n: return 'VS III'
    if 'banago' in n or 'บานาโก' in n: return 'Banago'
    if 'bestatin' in n or 'เบสแตติน' in n: return 'Bestatin'
    if 'glucocron' in n or 'กลูโคครอน' in n: return 'Glucocron'
    if 'glucodab' in n or 'กลูโคแดบ' in n: return 'Glucodab'
    if 'guticin' in n or 'กูติซิน' in n: return 'Guticin'
    if 'betahist' in n or 'เบต้าฮิสท์' in n: return 'Betahist'
    if 'b-themin' in n or 'บี-เธมิน' in n: return 'B-Themin'
    if 'cleanoze' in n or 'คลีนโนส' in n: return 'Cleanoze'
    if 'fegsotin' in n or 'เฟกโซทีน' in n: return 'Fegsotin'
    if 'gastrosec' in n or 'แกสโตรเซค' in n: return 'Gastrosec'
    clean_w = re.sub(r'[^a-zA-Z0-9\s]', '', n).split()
    return clean_w[0].title() if clean_w else 'Other'

def get_therapeutic_category(brand_group):
    cat_map = {
        'Plaivana': 'ยาแก้ปวด/กล้ามเนื้อ/ข้อกระดูก (Analgesics & Musculoskeletal)',
        'Capsika': 'ยาแก้ปวด/กล้ามเนื้อ/ข้อกระดูก (Analgesics & Musculoskeletal)',
        'Arotika': 'ยาแก้ปวด/กล้ามเนื้อ/ข้อกระดูก (Analgesics & Musculoskeletal)',
        'Sportika': 'ยาแก้ปวด/กล้ามเนื้อ/ข้อกระดูก (Analgesics & Musculoskeletal)',
        'Tristan': 'ยาแก้ปวด/ต้านการอักเสบ (NSAIDs & Pain Relief)',
        'Nacoxib': 'ยาแก้ปวด/ต้านการอักเสบ (NSAIDs & Pain Relief)',
        'Noraphen': 'ยาแก้ปวด/ต้านการอักเสบ (NSAIDs & Pain Relief)',
        'Gynogesic': 'ยาแก้ปวดประจำเดือน/กล้ามเนื้อ (Analgesics)',
        
        'Cephalexyl': 'ยาปฏิชีวนะ/ฆ่าเชื้อแบคทีเรีย (Antibiotics)',
        'Ciprocin': 'ยาปฏิชีวนะ/ฆ่าเชื้อทางเดินปัสสาวะ (Antibiotics)',
        'Oflocee': 'ยาปฏิชีวนะ/ฆ่าเชื้อ (Antibiotics)',
        'Cotricin': 'ยาปฏิชีวนะ/ฆ่าเชื้อ (Antibiotics)',
        'Sporosil': 'ยาต้านเชื้อรา (Antifungals)',
        'Clinovir': 'ยาต้านเชื้อไวรัสเริม/งูสวัด (Antivirals)',
        'Hepivir': 'ยาต้านไวรัสตับอักเสบ (Antivirals & Hepatology)',
        
        'Zertine': 'ยาแก้แพ้/ต้านฮิสตามีน (Antihistamines)',
        'Lolita': 'ยาแก้แพ้/ต้านฮิสตามีน (Antihistamines)',
        'Allerlax': 'ยาแก้แพ้/ต้านฮิสตามีน (Antihistamines)',
        'Fegsotin': 'ยาแก้แพ้/ต้านฮิสตามีน (Antihistamines)',
        'Mucobox': 'ยาละลายเสมหะ/ระบบทางเดินหายใจ (Respiratory & Cough)',
        'Icof': 'ยาแก้ไอ/ขับเสมหะ (Respiratory & Cough)',
        'Fatusin': 'ยาแก้ไอ/บรรเทาหวัด (Respiratory & Cough)',
        'Cleanoze': 'เวชภัณฑ์ดูแลโพรงจมูก (Nasal Care)',
        
        'Diabederm': 'ยาผิวหนัง/บำรุงผิวแห้งแตก (Dermatology)',
        'Clenascar': 'เวชสำอางดูแลแผลเป็น/สิว (Dermatology & Skincare)',
        'Fango': 'ยาผิวหนังต้านเชื้อรา/อักเสบ (Dermatology)',
        'Kleniderm': 'ยาสเตียรอยด์ทาผิวหนัง (Dermatology)',
        'Klenivet': 'ยาผิวหนังฆ่าเชื้อ/ต้านอักเสบ (Dermatology)',
        'Skinfect': 'ยาปฏิชีวนะทาแผล/ผิวหนัง (Dermatology)',
        'Klenigel': 'เจลบำรุงผิว (Skincare)',
        'Klenipred': 'ยาผิวหนังลดอักเสบ (Dermatology)',
        'Raqua': 'ผลิตภัณฑ์ทำความสะอาดผิวหน้า (Skincare)',
        'Radiara': 'เวชสำอางบำรุงผิว (Skincare)',
        'VS III': 'เวชสำอางพรีเมียม (Skincare)',
        'Momor': 'ครีมกันแดดเวชสำอาง (Skincare)',
        'Dextiderm': 'ขี้ผึ้งสมานผิว (Dermatology)',
        
        'Spascopan': 'ยาบรรเทาอาการปวดเกร็งช่องท้อง (Antispasmodics)',
        'Spasium': 'ยาบรรเทาอาการปวดเกร็งช่องท้อง (Antispasmodics)',
        'Gastro-Bismol': 'ยาเคลือบกระเพาะ/กรดไหลย้อน (Antacids & GI)',
        'Gastrosec': 'ยาลดกรดในกระเพาะอาหาร (PPIs & Antacids)',
        'Famotab': 'ยาลดกรดในกระเพาะอาหาร (Antacids & GI)',
        'Klenimed': 'ยาลดกรดในกระเพาะอาหาร (Antacids & GI)',
        'Domper-M': 'ยาช่วยย่อย/ต้านคลื่นไส้อาเจียน (Antiemetics)',
        'Livera': 'ยาบำรุงตับ/ต้านอนุมูลอิสระ (Hepatology)',
        
        'Zenzera': 'ยาถ่ายพยาธิ (Anthelmintics)',
        'Zentocide': 'ยาถ่ายพยาธิใบไม้ในตับ (Antiparasitics)',
        
        'Glucosa': 'ยาบำรุงข้อกระดูก (Osteoarthritis)',
        'Glucovia': 'ยารักษาโรคเบาหวาน (Antidiabetics)',
        'Glucodab': 'ยารักษาโรคเบาหวาน (Antidiabetics)',
        'Glucocron': 'ยารักษาโรคเบาหวาน (Antidiabetics)',
        'Metformin': 'ยารักษาโรคเบาหวาน (Antidiabetics)',
        'Bestatin': 'ยาลดไขมันในเส้นเลือด (Lipid-lowering)',
        'Lopil': 'ยาลดไขมันในเส้นเลือด (Lipid-lowering)',
        'Finasteride': 'ยารักษาต่อมลูกหมาก/ผมร่วง (Urology & Men Health)',
        'Stugin': 'ยาบรรเทาอาการเวียนศีรษะ/บ้านหมุน (Vertigo & CNS)',
        'Betahist': 'ยาบรรเทาอาการเวียนศีรษะ/บ้านหมุน (Vertigo & CNS)',
        'Flunarizine': 'ยาป้องกันไมเกรน/เวียนศีรษะ (Migraine & CNS)',
        'Anxac': 'ยาปรับสารเคมีในสมอง/คลายกังวล (Psychotropics)',
        'Precius': 'ยารักษาอาการปวดเส้นประสาท (Neuropathic Pain)',
        'Donzept': 'ยาชะลอความจำเสื่อม/อัลไซเมอร์ (CNS & Dementia)',
        
        'Calza': 'แคลเซียมและแร่ธาตุบำรุงกระดูก (Calcium & Minerals)',
        'Prozeus': 'โปรตีนและโภชนาการเสริม (Nutritional Supplements)',
        'Axamin': 'ยาห้ามเลือด/บำรุงสุขภาพ (Hemostatics & Wellness)',
        'Kachana': 'สมุนไพรเสริมสมรรถภาพและกำลัง (Herbal Health)',
        'Faibato': 'ผลิตภัณฑ์เสริมอาหารไฟเบอร์ (Dietary Supplements)',
        'Banago': 'ผลิตภัณฑ์เสริมอาหาร (Dietary Supplements)',
        'B-Themin': 'วิตามินบำรุงประสาท (Vitamins & Minerals)',
        'Guticin': 'ยารักษาโรคเกาต์ (Antigout)'
    }
    return cat_map.get(brand_group, 'กลุ่มยาและเวชภัณฑ์ทั่วไป (General Health & Others)')

STRATEGIC_BRANDS = {
    'Arotika', 'Axamin', 'Banago', 'Calza', 'Capsika', 'Clenascar', 
    'Dextiderm', 'Diabederm', 'Donzept', 'Faibato', 'Fango', 
    'Finasteride', 'Gastro-Bismol', 'Glucosa', 'Glucovia', 'Hepivir', 
    'Kachana', 'Livera', 'Momor', 'Nacoxib', 'Plaivana', 'Precius', 
    'Prozeus', 'Radiara', 'Raqua', 'Tristan', 'VS III', 'Zentocide', 'Zenzera'
}

# ==============================================================================
# 2. READ STRATEGIC PRODUCTS & PAC CATALOG
# ==============================================================================
print("1. Reading Strategic Products and PAC Catalog...")
strat_path = 'Data/รายการสินค้ากลยุทธ์ 2026.xlsx'
excel_strat = pd.ExcelFile(strat_path)
df_strat_raw = pd.read_excel(excel_strat, 'รายการสินค้ากลยุทธ์', header=None)

strategic_items = []
for block in [(0, 1, 2, 3), (4, 5, 6, 7), (8, 9, 10, 11)]:
    sub = df_strat_raw.iloc[2:, [block[0], block[1], block[2], block[3]]].dropna(subset=[block[1]])
    for _, row in sub.iterrows():
        pname = str(row[block[2]]).strip()
        if '(free)' in pname.lower():
            continue
        strategic_items.append({
            'no': int(row[block[0]]) if pd.notna(row[block[0]]) else len(strategic_items) + 1,
            'item_code': str(row[block[1]]).strip(),
            'name': pname,
            'size': str(row[block[3]]).strip() if pd.notna(row[block[3]]) else ''
        })

df_pac = pd.read_excel(excel_strat, 'PAC Catalog', header=1)
pac_catalog = []
for idx, r in df_pac.iterrows():
    if pd.notna(r.iloc[1]):
        pname = str(r.iloc[2]).strip()
        if '(free)' in pname.lower():
            continue
        actives = str(r.iloc[3]).strip() if pd.notna(r.iloc[3]) else ''
        
        # USER SPECIFIC CORRECTION: Glucovia is Sitagliptin (NOT Semaglutide)
        if 'glucovia' in pname.lower():
            actives = 'Sitagliptin'
            
        pac_catalog.append({
            'no': int(r.iloc[1]),
            'name': pname,
            'actives': actives,
            'size': str(r.iloc[4]).strip() if pd.notna(r.iloc[4]) else '',
            'classification': str(r.iloc[5]).strip() if pd.notna(r.iloc[5]) else 'Drug'
        })

# ==============================================================================
# 3. READ KSD_M8.xlsx (KSD DISTRIBUTOR SALES)
# ==============================================================================
print("2. Reading KSD_M8.xlsx...")
ksd_path = 'Data/KSD_M8.xlsx'
df_ksd_all = pd.read_excel(ksd_path, sheet_name='Sheet1')
df_ksd_all = df_ksd_all[~df_ksd_all['Invoice lines/Product/Name'].astype(str).str.lower().str.contains(r'\(free\)', regex=True)]

df_ksd_pha = df_ksd_all[df_ksd_all['Invoice lines/Product/Vendor Reference'] == 'PHA00001'].copy()
df_ksd_pha['SKU_clean'] = df_ksd_pha['Invoice lines/Product/Internal Reference'].astype(str).str.replace('.0', '', regex=False).str.strip().str.zfill(5)

sku_to_ksd_name = {}
for _, r in df_ksd_pha.iterrows():
    sku = r['SKU_clean']
    pname = str(r['Invoice lines/Product/Name']).strip()
    if sku not in sku_to_ksd_name:
        sku_to_ksd_name[sku] = pname

ksd_by_team = []
for team, group in df_ksd_pha.groupby('Sales Team'):
    ksd_by_team.append({
        'sales_team': team,
        'count': int(len(group)),
        'total_bath': float(group['Bath'].sum()),
        'total_qty': int(group['Invoice lines/Quantity'].sum())
    })
ksd_by_team.sort(key=lambda x: x['total_bath'], reverse=True)

ksd_by_salesperson = []
for sp, group in df_ksd_pha.groupby('Salesperson'):
    top_p = group.groupby('Invoice lines/Product/Name')['Bath'].sum().sort_values(ascending=False).head(3).to_dict()
    top_p_list = [{'name': k, 'bath': float(v)} for k, v in top_p.items()]
    
    top_c = group.groupby('Invoice lines/Partner')['Bath'].sum().sort_values(ascending=False).head(3).to_dict()
    top_c_list = [{'name': k, 'bath': float(v)} for k, v in top_c.items()]
    
    ksd_by_salesperson.append({
        'salesperson': sp,
        'team': group['Sales Team'].iloc[0] if len(group) > 0 else 'N/A',
        'orders_count': int(len(group)),
        'total_bath': float(group['Bath'].sum()),
        'total_qty': int(group['Invoice lines/Quantity'].sum()),
        'top_products': top_p_list,
        'top_customers': top_c_list
    })
ksd_by_salesperson.sort(key=lambda x: x['total_bath'], reverse=True)

df_ksd_pha['Date_Str'] = pd.to_datetime(df_ksd_pha['Invoice lines/Date']).dt.strftime('%Y-%m-%d')
ksd_daily = []
for d, group in df_ksd_pha.groupby('Date_Str'):
    ksd_daily.append({
        'date': d,
        'bath': float(group['Bath'].sum()),
        'qty': int(group['Invoice lines/Quantity'].sum()),
        'orders': int(len(group))
    })
ksd_daily.sort(key=lambda x: x['date'])

# ------------------------------------------------------------------------------
# 2.2 KSD CUSTOMER CLEANING & STRATEGIC PRODUCT HELPERS
# ------------------------------------------------------------------------------
CUST_TRANSLATIONS = {
    'ໃສສະອາດ ສາຂາໜອງດ້ວງ (ສາຂາ 1)': 'ร้านยาใสสะอาด สาขา 1 (หนองด้วง/สีหอม)',
    'ໃສສະອາດ ສາຂາ 1': 'ร้านยาใสสะอาด สาขา 1 (หนองด้วง/สีหอม)',
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

strat_skus_set = {str(item['item_code']).replace('.0', '').strip().zfill(5) for item in strategic_items if item.get('item_code')}
strat_names_lower = {item['name'].lower().strip() for item in strategic_items if item.get('name')}

def check_is_strategic_prod(sku, name):
    bg = get_brand_group(name)
    s_clean = str(sku).replace('.0', '').strip().zfill(5)
    name_low = str(name).lower().strip()
    
    # 1. Exact SKU match with strategic sheet
    if s_clean in strat_skus_set:
        return True, 'Strategic', bg
        
    # 2. Brand group match with genuine strategic brands
    if bg in STRATEGIC_BRANDS:
        return True, 'Strategic', bg
        
    # 3. Match strategic item names
    for sn in strat_names_lower:
        if sn in name_low or (len(name_low) > 4 and name_low in sn):
            return True, 'Strategic', bg
            
    return False, 'General', bg

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
        'category': get_therapeutic_category(bg),
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
df_sku25 = pd.read_excel(f25_ksd, sheet_name='All sales by SKU', header=None)
df_cust26 = pd.read_excel(f26_ksd, sheet_name='Sales by customer', header=None)

ksd_products_by_period = { '2026-08': ksd_top_products }

# 1. 2026 Individual Months (M01 - M07)
col_26_thb = { '2026-01': 11, '2026-02': 13, '2026-03': 15, '2026-04': 17, '2026-05': 19, '2026-06': 21, '2026-07': 23 }
col_26_qty = { '2026-01': 49, '2026-02': 51, '2026-03': 53, '2026-04': 55, '2026-05': 57, '2026-06': 59, '2026-07': 61 }

for per in sorted(col_26_thb.keys()):
    c_thb = col_26_thb[per]
    c_qty = col_26_qty[per]
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
                'category': get_therapeutic_category(bg),
                'is_strategic': is_strat,
                'total_bath': round(thb, 2),
                'total_qty': qty,
                'orders': 0
            })
    prods.sort(key=lambda x: x['total_bath'], reverse=True)
    ksd_products_by_period[per] = prods

# 2. 2025 Individual Months (M01 - M12)
for m_idx in range(1, 13):
    per = f'2025-{m_idx:02d}'
    c_thb = 11 + (m_idx - 1) * 2
    c_qty = 49 + (m_idx - 1) * 2
    prods = []
    for r in range(9, len(df_sku25)):
        sku = str(df_sku25.iloc[r, 0]).strip()
        name = str(df_sku25.iloc[r, 1]).strip()
        if not sku or sku == 'nan': continue
        val_thb = pd.to_numeric(df_sku25.iloc[r, c_thb], errors='coerce')
        val_qty = pd.to_numeric(df_sku25.iloc[r, c_qty], errors='coerce')
        thb = float(val_thb) if pd.notna(val_thb) else 0.0
        qty = int(val_qty) if pd.notna(val_qty) else 0
        if thb > 0 or qty > 0:
            is_strat, cat, bg = check_is_strategic_prod(sku, name)
            prods.append({
                'sku': sku,
                'name': name,
                'brand_group': bg,
                'classification': cat,
                'category': get_therapeutic_category(bg),
                'is_strategic': is_strat,
                'total_bath': round(thb, 2),
                'total_qty': qty,
                'orders': 0
            })
    prods.sort(key=lambda x: x['total_bath'], reverse=True)
    ksd_products_by_period[per] = prods

# 3. 2025 Full Year (Total 2025)
prods_25_full = []
for r in range(9, len(df_sku25)):
    sku = str(df_sku25.iloc[r, 0]).strip()
    name = str(df_sku25.iloc[r, 1]).strip()
    if not sku or sku == 'nan': continue
    val_thb = pd.to_numeric(df_sku25.iloc[r, 4], errors='coerce') # Total 2025 THB
    val_qty = pd.to_numeric(df_sku25.iloc[r, 48], errors='coerce') # Total 2025 QTY
    thb = float(val_thb) if pd.notna(val_thb) else 0.0
    qty = int(val_qty) if pd.notna(val_qty) else 0
    if thb > 0 or qty > 0:
        is_strat, cat, bg = check_is_strategic_prod(sku, name)
        prods_25_full.append({
            'sku': sku,
            'name': name,
            'brand_group': bg,
            'classification': cat,
            'category': get_therapeutic_category(bg),
            'is_strategic': is_strat,
            'total_bath': round(thb, 2),
            'total_qty': qty,
            'orders': 0
        })
prods_25_full.sort(key=lambda x: x['total_bath'], reverse=True)
ksd_products_by_period['2025-Full'] = prods_25_full
ksd_products_by_period['2025-FULL'] = prods_25_full

# 4. 2025 YTD (M01 - M08 to match 2026 YTD 8 months)
prods_25_ytd = []
for r in range(9, len(df_sku25)):
    sku = str(df_sku25.iloc[r, 0]).strip()
    name = str(df_sku25.iloc[r, 1]).strip()
    if not sku or sku == 'nan': continue
    thb = sum(pd.to_numeric(df_sku25.iloc[r, 11 + i*2], errors='coerce') or 0.0 for i in range(8))
    qty = sum(pd.to_numeric(df_sku25.iloc[r, 49 + i*2], errors='coerce') or 0 for i in range(8))
    if thb > 0 or qty > 0:
        is_strat, cat, bg = check_is_strategic_prod(sku, name)
        prods_25_ytd.append({
            'sku': sku,
            'name': name,
            'brand_group': bg,
            'classification': cat,
            'category': get_therapeutic_category(bg),
            'is_strategic': is_strat,
            'total_bath': round(thb, 2),
            'total_qty': int(qty),
            'orders': 0
        })
prods_25_ytd.sort(key=lambda x: x['total_bath'], reverse=True)
ksd_products_by_period['2025-YTD'] = prods_25_ytd

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
        'category': get_therapeutic_category(bg),
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
ksd_products_by_period['2026-FULL'] = ytd_list

# Precompute Product Groups Breakdown for KSD (By Brand and By Therapeutic Category)
ksd_group_breakdown_by_period = {}
for per, plist in ksd_products_by_period.items():
    tot_period_thb = sum(p['total_bath'] for p in plist) or 1.0
    
    # Group By Brand
    brand_map = {}
    for p in plist:
        bg = p['brand_group']
        if bg not in brand_map:
            brand_map[bg] = {
                'name': bg,
                'category': p.get('category') or get_therapeutic_category(bg),
                'is_strategic': p['is_strategic'],
                'total_bath': 0.0,
                'total_qty': 0,
                'sku_count': 0
            }
        brand_map[bg]['total_bath'] += p['total_bath']
        brand_map[bg]['total_qty'] += p['total_qty']
        brand_map[bg]['sku_count'] += 1
        
    by_brand = list(brand_map.values())
    for b in by_brand:
        b['total_bath'] = round(b['total_bath'], 2)
        b['share_pct'] = round((b['total_bath'] / tot_period_thb) * 100.0, 1)
    by_brand.sort(key=lambda x: x['total_bath'], reverse=True)
    
    # Group By Therapeutic Category
    cat_map = {}
    for p in plist:
        cat = p.get('category') or get_therapeutic_category(p['brand_group'])
        if cat not in cat_map:
            cat_map[cat] = {
                'name': cat,
                'total_bath': 0.0,
                'total_qty': 0,
                'sku_count': 0
            }
        cat_map[cat]['total_bath'] += p['total_bath']
        cat_map[cat]['total_qty'] += p['total_qty']
        cat_map[cat]['sku_count'] += 1
        
    by_category = list(cat_map.values())
    for c in by_category:
        c['total_bath'] = round(c['total_bath'], 2)
        c['share_pct'] = round((c['total_bath'] / tot_period_thb) * 100.0, 1)
    by_category.sort(key=lambda x: x['total_bath'], reverse=True)
    
    ksd_group_breakdown_by_period[per] = {
        'by_brand': by_brand,
        'by_category': by_category,
        'total_bath': round(tot_period_thb, 2)
    }

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

ksd_monthly_history = []
# 2025 Months (M1 - M12)
for i in range(1, 13):
    m_key = f'2025-{str(i).zfill(2)}'
    ret = float(df25_rep.iloc[16, i])
    ws  = float(df25_rep.iloc[27, i])
    tot = float(df25_rep.iloc[56, i])
    cust = int(float(df25_rep.iloc[66, i])) if pd.notna(df25_rep.iloc[66, i]) else 0
    ksd_monthly_history.append({
        'date_key': m_key,
        'year': 2025,
        'month': i,
        'retail_ssa_bath': ret,
        'wholesale_bath': ws,
        'total_sellout_bath': tot,
        'active_customers': cust
    })

# 2026 Months (M1 - M7)
for i in range(1, 8):
    m_key = f'2026-{str(i).zfill(2)}'
    ret = float(df26_rep.iloc[17, i])
    ws  = float(df26_rep.iloc[29, i])
    tot = float(df26_rep.iloc[60, i])
    cust = int(float(df26_rep.iloc[71, i])) if pd.notna(df26_rep.iloc[71, i]) else 0
    ksd_monthly_history.append({
        'date_key': m_key,
        'year': 2026,
        'month': i,
        'retail_ssa_bath': ret,
        'wholesale_bath': ws,
        'total_sellout_bath': tot,
        'active_customers': cust
    })

# Month 8 from KSD_M8 (August 2026)
m8_tot = float(df_ksd_pha['Bath'].sum())
m8_cust = int(df_ksd_pha['Invoice lines/Partner'].nunique())
ksd_monthly_history.append({
    'date_key': '2026-08',
    'year': 2026,
    'month': 8,
    'retail_ssa_bath': 0.0,
    'wholesale_bath': m8_tot,
    'total_sellout_bath': m8_tot,
    'active_customers': m8_cust
})

# Channels 2025 & 2026
ksd_channels_2025 = []
for r in range(4, 18):
    cname = df25_rep.iloc[r, 34]
    if pd.notna(cname) and str(cname).strip() != '0':
        vals = [float(df25_rep.iloc[r, c]) if pd.notna(df25_rep.iloc[r, c]) and isinstance(df25_rep.iloc[r, c], (int, float)) else 0.0 for c in range(35, 47)]
        ksd_channels_2025.append({'channel': str(cname).strip(), 'total_bath': sum(vals), 'monthly': vals})
ksd_channels_2025.sort(key=lambda x: x['total_bath'], reverse=True)

ksd_channels_2026 = []
for r in range(4, 18):
    cname = df26_rep.iloc[r, 34]
    if pd.notna(cname) and str(cname).strip() != '0':
        vals = [float(df26_rep.iloc[r, c]) if pd.notna(df26_rep.iloc[r, c]) and isinstance(df26_rep.iloc[r, c], (int, float)) else 0.0 for c in range(35, 42)]
        ksd_channels_2026.append({'channel': str(cname).strip(), 'total_bath': sum(vals), 'monthly': vals})
ksd_channels_2026.sort(key=lambda x: x['total_bath'], reverse=True)

# Provinces 2025 vs 2026 (YTD July Comparison)
df26_prov = pd.read_excel(f26_ksd, sheet_name='All sales by province', header=None)
ksd_provinces = []
for r in range(9, 25):
    pname = df26_prov.iloc[r, 0]
    if pd.notna(pname) and str(pname).strip() not in ['Total', 'Grand Total', 'nan']:
        val_25_jul = float(df26_prov.iloc[r, 1]) if pd.notna(df26_prov.iloc[r, 1]) and isinstance(df26_prov.iloc[r, 1], (int, float)) else 0.0
        val_26_jul = float(df26_prov.iloc[r, 2]) if pd.notna(df26_prov.iloc[r, 2]) and isinstance(df26_prov.iloc[r, 2], (int, float)) else 0.0
        share = float(df26_prov.iloc[r, 3]) if pd.notna(df26_prov.iloc[r, 3]) and isinstance(df26_prov.iloc[r, 3], (int, float)) else 0.0
        diff = float(df26_prov.iloc[r, 4]) if pd.notna(df26_prov.iloc[r, 4]) and isinstance(df26_prov.iloc[r, 4], (int, float)) else 0.0
        pct = float(df26_prov.iloc[r, 5]) if pd.notna(df26_prov.iloc[r, 5]) and isinstance(df26_prov.iloc[r, 5], (int, float)) else 0.0
        ksd_provinces.append({
            'province': str(pname).strip(),
            'val_2025_jul': val_25_jul,
            'val_2026_jul': val_26_jul,
            'share': share,
            'diff': diff,
            'pct_growth': pct * 100
        })
ksd_provinces.sort(key=lambda x: x['val_2026_jul'], reverse=True)

# ==============================================================================
# 4. READ SSA_M8.xlsx (SSA PHARMACY RETAIL SELL-OUT)
# ==============================================================================
print("3. Reading SSA_M8.xlsx...")
ssa_path = 'Data/SSA_M8.xlsx'
excel_ssa = pd.ExcelFile(ssa_path)
branches = ['SSA1', 'SSA2', 'SSA3', 'SSA5', 'SSA6', 'SSA7']
branch_names_th = {
    'SSA1': 'สาขา 1 (หนองด้วง/สีหอม)',
    'SSA2': 'สาขา 2 (IMDC)',
    'SSA3': 'สาขา 3 (สะพานทอง)',
    'SSA5': 'สาขา 5 (จอมมณี)',
    'SSA6': 'สาขา 6 (แสงสว่าง)',
    'SSA7': 'สาขา 7 (เก้ายอด)'
}

branch_price_maps = {}
branch_totals_lak = {b: 0.0 for b in branches}
for b in branches:
    df_b = pd.read_excel(excel_ssa, b, header=1)
    df_b = df_b[pd.to_numeric(df_b['No'], errors='coerce').notna()]
    b_map = {}
    tot_price = 0.0
    for _, r in df_b.iterrows():
        pname = str(r['Name']).strip()
        if '(free)' in pname.lower():
            continue
        sku = str(r['SKU']).replace('.0', '').strip().zfill(5)
        qty = float(r['Qty']) if pd.notna(r['Qty']) else 0.0
        price = float(r['Price']) if pd.notna(r['Price']) else 0.0
        b_map[sku] = {'qty': qty, 'price': price}
        tot_price += price
    branch_price_maps[b] = b_map
    branch_totals_lak[b] = tot_price

df_ssa_total = pd.read_excel(excel_ssa, 'Total', header=1)
df_ssa_total = df_ssa_total[pd.to_numeric(df_ssa_total['No'], errors='coerce').notna()]
df_ssa_total = df_ssa_total[~df_ssa_total['Name'].astype(str).str.lower().str.contains(r'\(free\)', regex=True)]

ssa_products_august = []
branch_totals_qty = {b: 0 for b in branches}

for _, r in df_ssa_total.iterrows():
    sku = str(r['SKU']).replace('.0', '').strip().zfill(5)
    lao_name = str(r['Name']).strip()
    thai_name = translate_lao_to_thai(lao_name)
    ksd_name = sku_to_ksd_name.get(sku, '')
    unit = str(r['Unit']).strip() if pd.notna(r['Unit']) else 'ชิ้น'
    
    b_qtys = {}
    b_prices = {}
    total_qty = 0
    total_price_lak = 0.0
    
    for b in branches:
        qty_val = pd.to_numeric(r[b] if b in r else 0, errors='coerce')
        q = int(qty_val) if pd.notna(qty_val) else 0
        b_qtys[b] = q
        total_qty += q
        branch_totals_qty[b] += q
        
        p = branch_price_maps.get(b, {}).get(sku, {}).get('price', 0.0)
        b_prices[b] = p
        total_price_lak += p

    english_name = ksd_name if ksd_name else translate_to_english(lao_name)
    if not english_name:
        english_name = translate_to_english(lao_name)
    brand_group = get_brand_group(english_name)

    is_strat, strat_class, _ = check_is_strategic_prod(sku, english_name)

    incentive_brands = {
        'Plaivana', 'Capsika', 'Diabederm', 'Arotika', 'Clenascar', 'Glucosa', 
        'Prozeus', 'Tristan', 'Nacoxib', 'Finasteride', 'Raqua', 'G-Bismol', 'Zentocide'
    }
    is_inc = (brand_group in incentive_brands)

    ssa_products_august.append({
        'sku': sku,
        'lao_name': lao_name,
        'thai_name': thai_name,
        'english_name': english_name,
        'brand_group': brand_group,
        'is_incentive': is_inc,
        'ksd_name': ksd_name,
        'unit': unit,
        'branch_qtys': b_qtys,
        'branch_prices_lak': b_prices,
        'total_qty': total_qty,
        'total_price_lak': total_price_lak,
        'is_strategic': is_strat,
        'classification': strat_class
    })

# ==============================================================================
# 5. LOAD HISTORICAL INCENTIVES (16 OFFICIAL MONTHS: 2025-04 to 2026-07)
# ==============================================================================
print("4. Loading Official Historical Incentive Data (16 Months)...")
old_json_path = 'Data/SSA dashboard old/consolidated_sales_data.json'
with open(old_json_path, 'r', encoding='utf-8') as f:
    raw_history = json.load(f)

historical_months = []
for m in raw_history:
    filtered_products = [p for p in m.get('products', []) if '(free)' not in p['product_name'].lower()]
    for p in filtered_products:
        p['english_name'] = p['product_name']
        p['brand_group'] = get_brand_group(p['product_name'])
        p['is_incentive'] = True

    m_qty = sum(p.get('total_qty', 0) for p in filtered_products)
    m_inc = sum(p.get('total_incentive', 0.0) for p in filtered_products)
    
    b_totals_m = {b: sum(p.get('branches', {}).get(b, 0) for p in filtered_products) for b in branches}
    b_inc_m = {b: sum(p.get('branches', {}).get(b, 0) * p.get('incentive_price', 0) for p in filtered_products) for b in branches}

    historical_months.append({
        'date_key': m['date_key'],
        'year': m['year'],
        'month_num': m['month_num'],
        'month_name': m.get('month_str', m['date_key'].split('-')[1]),
        'products': filtered_products,
        'total_qty': m_qty,
        'total_incentive': m_inc,
        'branch_qtys': b_totals_m,
        'branch_incentives': b_inc_m,
        'status': 'Official'  # ยอดจริงทางการ
    })

# Parse July 2026 (Official File 16)
july_csv_path = 'Data/ค่าเชียร์/คำนวณค่าเชียร์ SSA - July 26.csv'
df_july_raw = pd.read_csv(july_csv_path, header=1, encoding='utf-8')
df_july_raw = df_july_raw[df_july_raw.iloc[:, 0] != 'รวม'].dropna(subset=[df_july_raw.columns[0], df_july_raw.columns[1]])

july_products = []
tot_jul_qty = 0
tot_jul_inc = 0.0
incentive_rates_july = {}

for _, row in df_july_raw.iterrows():
    pname = str(row.iloc[0]).strip()
    if '(free)' in pname.lower():
        continue
    try:
        rate = float(str(row.iloc[1]).replace(',', '').strip())
    except Exception:
        rate = 0.0
    incentive_rates_july[pname] = rate
    
    b_q = {}
    for col_idx, b in enumerate(branches, start=2):
        try:
            val = int(float(str(row.iloc[col_idx]).replace(',', '').strip()))
        except Exception:
            val = 0
        b_q[b] = val
        
    p_tot_qty = sum(b_q.values())
    p_tot_inc = p_tot_qty * rate
    tot_jul_qty += p_tot_qty
    tot_jul_inc += p_tot_inc
    
    july_products.append({
        'product_name': pname,
        'english_name': pname,
        'brand_group': get_brand_group(pname),
        'is_incentive': True,
        'incentive_price': rate,
        'branches': b_q,
        'total_qty': p_tot_qty,
        'total_incentive': p_tot_inc
    })

b_totals_jul = {b: sum(p['branches'].get(b, 0) for p in july_products) for b in branches}
b_inc_jul = {b: sum(p['branches'].get(b, 0) * p['incentive_price'] for p in july_products) for b in branches}

historical_months.append({
    'date_key': '2026-07',
    'year': 2026,
    'month_num': 7,
    'month_name': 'Jul',
    'products': july_products,
    'total_qty': tot_jul_qty,
    'total_incentive': tot_jul_inc,
    'branch_qtys': b_totals_jul,
    'branch_incentives': b_inc_jul,
    'status': 'Official'  # ยอดจริงทางการ
})

# Parse August 2026 (Official File 17)
aug_csv_path = 'Data/ค่าเชียร์/คำนวณค่าเชียร์ SSA - Aug 26.csv'
df_aug_raw = pd.read_csv(aug_csv_path, header=1, encoding='utf-8')
df_aug_raw = df_aug_raw[df_aug_raw.iloc[:, 0] != 'รวม'].dropna(subset=[df_aug_raw.columns[0], df_aug_raw.columns[1]])

aug_products = []
tot_aug_qty = 0
tot_aug_inc = 0.0
incentive_rates_aug = {}

for _, row in df_aug_raw.iterrows():
    pname = str(row.iloc[0]).strip()
    if '(free)' in pname.lower():
        continue
    try:
        rate = float(str(row.iloc[1]).replace(',', '').strip())
    except Exception:
        rate = 0.0
    incentive_rates_aug[pname] = rate
    
    b_q = {}
    for col_idx, b in enumerate(branches, start=2):
        try:
            val = int(float(str(row.iloc[col_idx]).replace(',', '').strip()))
        except Exception:
            val = 0
        b_q[b] = val
        
    p_tot_qty = sum(b_q.values())
    p_tot_inc = p_tot_qty * rate
    tot_aug_qty += p_tot_qty
    tot_aug_inc += p_tot_inc
    
    aug_products.append({
        'product_name': pname,
        'english_name': pname,
        'brand_group': get_brand_group(pname),
        'is_incentive': True,
        'incentive_price': rate,
        'branches': b_q,
        'total_qty': p_tot_qty,
        'total_incentive': p_tot_inc
    })

b_totals_aug = {b: sum(p['branches'].get(b, 0) for p in aug_products) for b in branches}
b_inc_aug = {b: sum(p['branches'].get(b, 0) * p['incentive_price'] for p in aug_products) for b in branches}

historical_months.append({
    'date_key': '2026-08',
    'year': 2026,
    'month_num': 8,
    'month_name': 'Aug',
    'products': aug_products,
    'total_qty': tot_aug_qty,
    'total_incentive': tot_aug_inc,
    'branch_qtys': b_totals_aug,
    'branch_incentives': b_inc_aug,
    'status': 'Official'  # ยอดจริงทางการ
})

historical_months.sort(key=lambda x: (x['year'], x['month_num']))

# 5.1 BUILD COMPLETE 17-MONTH SSA MONTHLY TIMELINE (2025-04 to 2026-08)
ssa_monthly_history = []
for m in historical_months:
    ssa_monthly_history.append({
        'date_key': m['date_key'],
        'year': m['year'],
        'month_num': m['month_num'],
        'month_name': m['month_name'],
        'total_qty': m['total_qty'],
        'total_price_lak': m['total_qty'] * 14000.0,
        'total_incentive': m['total_incentive'],
        'branch_qtys': m['branch_qtys'],
        'branch_incentives': m.get('branch_incentives', {}),
        'products': m['products'],
        'has_all_pac': False
    })

# August 2026 products for retail audit census (All 82 PAC products with matched incentive data)
aug_inc_map = {p['product_name']: p for p in aug_products}
m8_aug_prods = []
for p in ssa_products_august:
    p_name = p['english_name']
    inc_info = aug_inc_map.get(p_name)
    if not inc_info:
        for k, v in aug_inc_map.items():
            if k.lower() in p_name.lower() or p_name.lower() in k.lower():
                inc_info = v
                break
    inc_rate = inc_info['incentive_price'] if inc_info else 0.0
    inc_val = inc_info['total_incentive'] if inc_info else 0.0
    m8_aug_prods.append({
        'product_name': p['english_name'],
        'english_name': p['english_name'],
        'brand_group': p['brand_group'],
        'sku': p['sku'],
        'is_incentive': p['is_incentive'],
        'branches': p['branch_qtys'],
        'total_qty': p['total_qty'],
        'total_price_lak': p['total_price_lak'],
        'incentive_price': inc_rate,
        'total_incentive': inc_val
    })

m8_branch_qtys = {b: sum(p['branches'].get(b, 0) for p in m8_aug_prods) for b in branches}

# Replace August 2026 in ssa_monthly_history with rich product info
aug_hist_idx = next((i for i, m in enumerate(ssa_monthly_history) if m['date_key'] == '2026-08'), -1)
if aug_hist_idx >= 0:
    ssa_monthly_history[aug_hist_idx]['total_price_lak'] = sum(p['total_price_lak'] for p in ssa_products_august)
    ssa_monthly_history[aug_hist_idx]['total_incentive'] = tot_aug_inc
    ssa_monthly_history[aug_hist_idx]['all_pac_products'] = m8_aug_prods
    ssa_monthly_history[aug_hist_idx]['incentive_products'] = aug_products
    ssa_monthly_history[aug_hist_idx]['has_all_pac'] = True

# ==============================================================================
# 6. COMPUTE STORE VISIT DEEP-DIVE & MoM GROWTH/DECLINE (JULY vs AUGUST 2026)
# ==============================================================================
# Compare SSA retail sales in August 2026 with July 2026 official incentive baseline
july_data = next((m for m in historical_months if m['date_key'] == '2026-07'), None)
aug_data = next((m for m in historical_months if m['date_key'] == '2026-08'), None)
july_prod_map = {p['product_name']: p for p in july_data['products']} if july_data else {}
aug_prod_map = {p['product_name']: p for p in aug_data['products']} if aug_data else {}

store_visit_data = {}

for b in branches:
    b_items = []
    for p in ssa_products_august:
        q = p['branch_qtys'].get(b, 0)
        pr = p['branch_prices_lak'].get(b, 0.0)
        b_items.append({
            'sku': p['sku'],
            'lao_name': p['lao_name'],
            'thai_name': p['thai_name'],
            'ksd_name': p['ksd_name'],
            'qty': q,
            'price_lak': pr,
            'is_strategic': p['is_strategic'],
            'classification': p['classification']
        })
    b_items_by_qty = sorted([it for it in b_items if it['qty'] > 0], key=lambda x: x['qty'], reverse=True)
    b_items_by_price = sorted([it for it in b_items if it['price_lak'] > 0], key=lambda x: x['price_lak'], reverse=True)

    mom_changes = []
    for pname in incentive_rates_july.keys():
        if '(free)' in pname.lower():
            continue
        q_jul = july_prod_map.get(pname, {}).get('branches', {}).get(b, 0)
        q_aug = aug_prod_map.get(pname, {}).get('branches', {}).get(b, 0)
        diff = q_aug - q_jul
        pct_change = (diff / q_jul * 100.0) if q_jul > 0 else (100.0 if q_aug > 0 else 0.0)
        mom_changes.append({
            'product_name': pname,
            'qty_jul': q_jul,
            'qty_aug': q_aug,
            'diff': diff,
            'pct_change': pct_change
        })
        
    top_growth = sorted([x for x in mom_changes if x['diff'] > 0], key=lambda x: x['diff'], reverse=True)[:10]
    top_decline = sorted([x for x in mom_changes if x['diff'] < 0], key=lambda x: x['diff'])[:10]
    zero_sales = [x for x in mom_changes if x['qty_aug'] == 0 and x['qty_jul'] > 0]

    store_visit_data[b] = {
        'branch_id': b,
        'branch_name_th': branch_names_th[b],
        'total_qty_aug': branch_totals_qty[b],
        'total_lak_aug': branch_totals_lak[b],
        'ranked_by_qty': b_items_by_qty,
        'ranked_by_price': b_items_by_price,
        'top_growth': top_growth,
        'top_decline': top_decline,
        'zero_sales': zero_sales
    }

# ==============================================================================
# 8. STRATEGIC WHITE-SPACE PENETRATION MATRIX (Excl. Free)
# ==============================================================================
white_space_matrix = []
for p in ssa_products_august:
    if p['is_strategic'] or p['total_qty'] > 50:
        row = {
            'sku': p['sku'],
            'thai_name': p['thai_name'],
            'ksd_name': p['ksd_name'],
            'total_qty': p['total_qty'],
            'classification': p['classification'],
            'branches': {b: p['branch_qtys'].get(b, 0) for b in branches}
        }
        white_space_matrix.append(row)

white_space_matrix.sort(key=lambda x: x['total_qty'], reverse=True)

# ==============================================================================
# 9. PRODUCT BLINDING MAPPING
# ==============================================================================
blinding_path = 'Data/SSA dashboard old/product_blinding_mapping.csv'
blinding_map = {}
if os.path.exists(blinding_path):
    df_bld = pd.read_csv(blinding_path, encoding='utf-8')
    for _, r in df_bld.iterrows():
        orig = str(r['Original Product Name']).strip()
        blind = str(r['Blinded Product Name']).strip()
        if '(free)' not in orig.lower():
            blinding_map[orig] = blind

# ==============================================================================
# 10. WRITE COMPLETE data.js
# ==============================================================================
final_data = {
    'generated_at': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
    'branches': branches,
    'branch_names_th': branch_names_th,
    
    # Executive KPIs
    'summary_kpis': {
        'ksd_total_revenue_thb': float(df_ksd_all['Bath'].sum()),
        'ksd_pac_revenue_thb': float(df_ksd_pha['Bath'].sum()),
        'ksd_pac_transactions': int(len(df_ksd_pha)),
        'ksd_pac_units': int(df_ksd_pha['Invoice lines/Quantity'].sum()),
        'ssa_total_units': sum(p['total_qty'] for p in ssa_products_august),
        'ssa_total_lak': sum(p['total_price_lak'] for p in ssa_products_august),
        'latest_official_incentive_thb': tot_aug_inc,
        'latest_official_incentive_units': tot_aug_qty,
        'latest_official_incentive_period': '2026-08'
    },
    
    # SSA Retail Data (August 2026)
    'ssa_products_august': ssa_products_august,
    'branch_totals_qty': branch_totals_qty,
    'branch_totals_lak': branch_totals_lak,
    'store_visit_data': store_visit_data,
    'white_space_matrix': white_space_matrix,
    
    # SSA Monthly Continuous Timeline (17 Months: 2025-04 to 2026-08)
    'ssa_monthly_history': ssa_monthly_history,
    
    # Incentive Historical System (17 Official Months: 2025-04 to 2026-08)
    'historical_incentives': historical_months,
    
    # KSD Distributor Sell-Out Data (To Hospitals, Pharmacies, Wholesale, and SSA)
    'ksd_monthly_history': ksd_monthly_history,
    'ksd_channels_2025': ksd_channels_2025,
    'ksd_channels_2026': ksd_channels_2026,
    'ksd_provinces': ksd_provinces,
    'ksd_by_team': ksd_by_team,
    'ksd_by_salesperson': ksd_by_salesperson,
    'ksd_daily_trend': ksd_daily,
    'ksd_top_customers': ksd_top_customers[:50],
    'ksd_top_pac_products': ksd_top_products,
    'ksd_products_by_period': ksd_products_by_period,
    'ksd_customers_by_period': ksd_customers_by_period,
    'ksd_group_breakdown_by_period': ksd_group_breakdown_by_period,
    'strategic_brands': sorted(list(STRATEGIC_BRANDS)),
    
    # Strategic Products & Catalog
    'strategic_catalog': pac_catalog,
    'blinding_map': blinding_map
}

output_file = 'data.js'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('// Integrated Pharma Alliance (PAC) Sales & Incentive Database\n')
    f.write('const PAC_DATA = ')
    json.dump(final_data, f, ensure_ascii=False, indent=2)
    f.write(';\n')

print(f"SUCCESS: {output_file} updated with explicit Status badges! Size: {os.path.getsize(output_file) / 1024:.2f} KB")
