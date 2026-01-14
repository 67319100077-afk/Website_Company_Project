```markdown
# เว็บไซต์โรงงานผลิตอาหารสัตว์ (Static multi-page)

โครงโปรเจคนี้เป็นเว็บไซต์ static แบบ multi-page สำหรับโรงงานผลิตอาหารสัตว์ (สุนัขและแมว) ใช้ HTML/CSS/JS + Bootstrap — มีหน้าแยกสำหรับข่าว (news) แบบ static เพื่อรองรับ SEO

ไฟล์สำคัญ
- index.html — หน้าแรก (แนะนำบริษัท)
- products.html — รายละเอียดสินค้าและบริการ
- news/index.html — หน้าแสดงรายการข่าว (dynamic จาก news-data.json)
- news/news-001.html, news/news-002.html, news/news-003.html — หน้าแยกข่าวตัวอย่าง (static)
- contact.html — หน้าติดต่อ (ฟอร์มใช้ Formspree เป็นตัวอย่าง)
- css/styles.css — สไตล์ (ธีมขาว-แดง)
- js/main.js — สคริปต์รวม (ค้นหา/โหลดข่าว, ฟอร์ม UX)
- news-data.json — ข้อมูลข่าว (แก้ไขได้)
- assets/images/ — (ไม่รวมไฟล์จริง) วางรูปของคุณที่นี่หรือใช้ลิงก์จาก CDN

การรันแบบ local
1. คัดลอกโฟลเดอร์โปรเจคทั้งหมดลงเครื่อง
2. แนะนำให้รัน simple HTTP server (เพื่อให้ fetch โหลด news-data.json ได้)
   - Python 3: `python -m http.server 8000`
   - Node (http-server): `npx http-server`
3. เข้าใช้งานที่ `http://localhost:8000` หรือพาธที่รัน

การปรับแต่งสำคัญ
- เปลี่ยนข้อมูลบริษัท (ชื่อ, ที่อยู่, เบอร์โทร, อีเมล) ในไฟล์ index.html และ contact.html
- เปลี่ยนรูปภาพ: สร้างโฟลเดอร์ `assets/images/` และวางชื่อไฟล์ตามที่อ้างอิงในไฟล์ (news-puppy.jpg, news-cert.jpg, news-oem.jpg, ฯลฯ) หรือแก้เป็นลิงก์ภาพที่ต้องการ
- Formspree: ฟอร์มใน contact.html ใช้ action เป็น `https://formspree.io/f/your-form-id` — ลงทะเบียนที่ Formspree แล้วแทนที่ด้วย endpoint ของคุณ
- เพิ่มข่าว: แก้ `news-data.json` และสร้าง/แก้ไฟล์ news/news-<id>.html ถ้าต้องการหน้า static ใหม่ (หรือผมช่วย generate ให้เพิ่มเติมได้)

Deploy
- เว็บไซต์เป็น static จึงสามารถ deploy ได้บน:
  - GitHub Pages
  - Netlify
  - Vercel (static)
  - หรือโฮสต์อื่นๆ ที่รองรับ static files

สิ่งที่ผมสามารถช่วยเพิ่มเติมได้ (คุณบอกได้เลย)
- สร้างไฟล์ news page เพิ่มจาก `news-data.json` ให้เป็น static pages อัตโนมัติ
- เปลี่ยนฟอร์มเป็น Netlify Forms หรือ EmailJS แทน Formspree
- เพิ่ม SEO meta tags และ structured data (JSON-LD) สำหรับข่าว
- ช่วย deploy ไป GitHub Pages / Netlify พร้อมตั้งค่า Formspree/Netlify Forms

```