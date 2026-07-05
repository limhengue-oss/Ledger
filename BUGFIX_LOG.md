# Ledger App — Bug Hunt & Fix Log

**File reviewed:** `index.html` (~7361 lines, single-file HTML+JS ledger app)
**Patch:** PATCH 1 (v5.1)

---

## Critical bugs found & fixed

### 1-3. PDF Import ทำให้ account/to_account หายทั้งชุด
**ตำแหน่ง:** `showPdfPreview()`, `pdfImportNow()`, `pdfExportCsv()` (~line 5035-5087)

**ปัญหา:** ตอน parse PDF สร้าง object ด้วย key ชื่อ `account`/`to_account` แต่โค้ดที่ใช้ต่อ (preview, import, export) กลับอ้างด้วย key ผิดชื่อว่า `accId` ซึ่งไม่มีอยู่จริง ทำให้ทุกรายการที่ import จาก PDF statement ไม่มีบัญชีผูกอยู่เลย และข้อมูล transfer ปลายทางถูกทิ้งไป

**แก้ไข:** เปลี่ยนทั้ง 3 จุดให้ใช้ `r.account`/`r.to_account` ให้ตรงกับข้อมูลที่สร้างไว้จริง

---

### 4. Portfolio Modified-Dietz Return คำนวณผิดถ้าลบสินทรัพย์กลาง switch-chain
**ตำแหน่ง:** `deleteAsset()` (~line 4329)

**ปัญหา:** สูตรคำนวณผลตอบแทนพอร์ต (`totalInvested` vs `totalCurrent`) พึ่งพา switch-chain ระหว่างสินทรัพย์ต้นทาง (closed) กับสินทรัพย์ปลายทางที่เกิดจากการ switch แต่ `deleteAsset()` เดิมลบสินทรัพย์ตัวไหนก็ได้แบบไม่มี guard — ถ้าผู้ใช้ลบสินทรัพย์ต้นทางหรือปลายทางของ chain ทิ้ง ผลตอบแทนพอร์ตจะเพี้ยน (ดูดีเกินจริงหรือติดลบเกินจริง)

**แก้ไข:** เพิ่ม guard ใน `deleteAsset()` บล็อกการลบถ้าสินทรัพย์นั้น `closed===true` (ต้นทาง) หรือมี `switchedFromId` (ปลายทาง) พร้อม alert อธิบายเหตุผล

---

### 5. หารด้วยศูนย์ใน calcModifiedDietz
**ตำแหน่ง:** `calcModifiedDietz()` (line 4138), Restore backup (~line 4851)

**ปัญหา:** `(curVal-a.investValue+totalDivs)/a.investValue` ไม่มีการเช็คว่า `investValue` เป็น 0 — ช่องทางสร้าง asset ผ่าน UI ปกติบล็อก 0 อยู่แล้ว แต่ Restore จาก Excel backup ไม่มีการกรอง ทำให้แถวข้อมูลเสีย (investValue ว่าง/0) หลุดเข้าระบบได้

**แก้ไข:**
- เพิ่ม guard ใน `calcModifiedDietz()`: `if(!(a.investValue>0))return{totalReturn:0,annualized:0}`
- กรอง asset ที่ `investValue<=0` ออกตอน restore backup พร้อมแจ้งเตือนจำนวนที่ถูกข้าม

---

### 6. ยอดหนี้ลูกหนี้ผิดเมื่อกรอก 0 ตรงๆ
**ตำแหน่ง:** `saveTx()` (~line 2298-2313)

**ปัญหา:** `parseFloat(...)||amt` — ถ้าผู้ใช้กรอกยอด "จ่ายแทนคนอื่น" เป็น 0 ตรงๆ `0` เป็น falsy ใน JS ทำให้ `||amt` ใช้ยอดเต็มแทนโดยไม่ตั้งใจ

**แก้ไข:** เพิ่มการตรวจสอบก่อนบันทึก — ถ้ากรอกน้อยกว่า 1 บาท (รวม 0) จะบล็อกการบันทึกพร้อม alert "กรุณากรอกจำนวนที่จ่ายแทน อย่างน้อย 1 บาท" ถ้าปล่อยว่างจะใช้ยอดเต็มตามเดิม การตรวจสอบเกิดก่อน push รายการเข้า `TXS` เพื่อไม่ให้บันทึกข้อมูลครึ่งๆ กลางๆ

---

### 7-8. ยอดรวมไม่ตรงกันระหว่างหน้าจอ (tx.amount vs txEffAmt)
**ตำแหน่ง:** หลายจุด — Dashboard (`sm()` line 1928), Account History (line 3643), Overview (`rOverall` line 3880-3881), Analytics (`rAn` line 2495)

**ปัญหา:** แอปมีฟีเจอร์แชร์ค่าใช้จ่าย/ปรับยอด ทำให้แต่ละรายการมี 2 ยอด: `tx.amount` (ยอดเต็ม) กับ `txEffAmt(tx)` (ยอดสุทธิ) แต่ละหน้าจอเลือกใช้คนละตัวแบบไม่สม่ำเสมอ ทำให้ตัวเลขไม่ตรงกันระหว่างหน้า

**แก้ไข (ตามที่ผู้ใช้กำหนด):**
- **Dashboard, Account History, Overview** → ใช้ `tx.amount` (ยอดจริง)
- **Analytics, Budget** → ใช้ `txEffAmt()` (ยอดสุทธิ) — Budget ใช้ถูกต้องอยู่แล้ว ไม่ต้องแก้, Analytics แก้ 1 จุด (กราฟแท่งรวม) ให้สอดคล้องกับส่วนแบ่งหมวดหมู่ที่ใช้ยอดสุทธิอยู่แล้ว
- Widget % งบประมาณในหน้า Dashboard (ใช้ `cspend()`) **ไม่แตะ** เพราะเป็นตัวเลขเทียบงบประมาณโดยตรง ต้องสอดคล้องกับ Budget page

---

## Version tracking

- เพิ่ม comment บอกเลข patch ไว้บรรทัดบนสุดของไฟล์ (ก่อน `<!DOCTYPE html>`)
- อัปเดต version badge บน UI (topbar, line 573) จาก `v5.0` → `v5.1`
- Convention: แก้บั๊ก/เพิ่มฟีเจอร์ครั้งต่อไป ให้อัปเดตทั้ง comment และ badge คู่กัน เพิ่มเลข patch/version ต่อเนื่อง

---

## บั๊กที่ยังไม่ได้แก้ (พบระหว่างการรีวิว แต่ยังไม่ได้ลงมือ)

- **XSS ผ่าน innerHTML** — หลายจุดที่ insert user input (description, tags, notes, ชื่อสินทรัพย์/หนี้สิน) ลง innerHTML แบบไม่ escape
- **PDF import — account/category name mismatch จาก casing ต่างกัน** สร้างรายการซ้ำ
- **impExecute** — account ไม่ match จะได้ `__deleted__` แบบเงียบๆ
- **restoreFromCSV** — กรองทิ้งรายการที่ amount เป็น 0 จริงๆ (data loss edge case)
- **Excel serial date 1900 leap-year bug** ใน `impExcelDate` (ผลกระทบต่ำมาก)
- **HTML id ซ้ำสองอัน** บนแท็กเดียวกัน (line ~7294 เดิม, อาจขยับ)
- **Firestore timeout race** ใน `_onAuthReady` ไม่ cancel promise เดิม
