/**
 * GOOGLE APPS SCRIPT - สุโขทัยแสงอุปกรณ์
 * 
 * เชื่อมต่อกับ Google Sheet ID: 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4
 * 
 * ระบบรองรับ:
 * 1. รับคำสั่งซื้อสินค้าจากเว็บไซต์ บันทึกลง Google Sheet ทันที (รองรับทั้ง จัดส่งตามที่อยู่ และ รับเองที่ร้าน)
 * 2. รองรับข้อมูลใบกำกับภาษี, พิกัด GPS และรูปสลิปโอนเงิน
 * 3. ส่งอีเมลแจ้งเตือนคำสั่งซื้อแยกส่วนอย่างชัดเจน:
 *    - ทางร้าน (scghomessk@gmail.com) ได้รับแจ้งเตือนออเดอร์ใหม่ พร้อมรูปสลิปและลิงก์เปิดดู Sheet หลังบ้าน
 *    - ลูกค้าได้รับเพียง 1 ฉบับเท่านั้น เป็นใบยืนยันคำสั่งซื้อที่สุภาพ สะอาดตา แสดงเฉพาะรายการสั่งซื้อ (ไม่เห็นสลีป และไม่เห็นลิงก์ Sheet หลังบ้าน)
 * 4. ฟังก์ชัน testInsertOrder() สำหรับทดสอบบันทึกข้อมูลเข้า Sheet
 * 5. ฟังก์ชัน testSendOrderEmail() สำหรับทดสอบส่งอีเมลทั้งฝั่งร้านค้าและฝั่งลูกค้า
 * 
 * -------------------------------------------------------------
 * วิธีการติดตั้งและอัปเดต:
 * 1. นำโค้ดทั้งหมดในไฟล์นี้ไปวางแทนที่ใน Google Apps Script (ไฟล์ Code.gs)
 * 2. กดปุ่มบันทึก (Ctrl+S หรือรูปแผ่นดิสก์)
 * 3. กด "การทำให้ใช้งานได้" (Deploy) > "การจัดการการทำให้ใช้งานได้ใหม่" (Manage deployments)
 * 4. กดไอคอนดินสอแก้ไข (Edit) > เลือกเวอร์ชัน: "เวอร์ชันใหม่" (New version)
 *    - Execute as: "ฉัน" (Me) และ "ผู้มีสิทธิ์เข้าถึง" (Who has access) เป็น "ทุกคน" (Anyone)
 *    - ห้ามแชร์ Google Sheet คำสั่งซื้อให้ "ทุกคนที่มีลิงก์" เด็ดขาด
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy)
 * -------------------------------------------------------------
 */

// อีเมลของร้านสำหรับรับการแจ้งเตือนคำสั่งซื้อ
const TARGET_STORE_EMAIL = "scghomessk@gmail.com";

// true = ใครมีลิงก์ก็เปิดดูสลิป/ไฟล์แนบได้ | false (แนะนำ) = เปิดได้เฉพาะบัญชี Google ของร้านที่เป็นเจ้าของ
const ALLOW_PUBLIC_FILE_LINK = false;

function lockDownFile_(file) {
  if (ALLOW_PUBLIC_FILE_LINK) {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } else {
    file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  }
}

// ID ของ Google Sheet ตามที่ระบุเจาะจง
const SPREADSHEET_ID = "1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4";

// ใส่ ID โฟลเดอร์ Google Drive หากต้องการเก็บไฟล์แนบสลิปหรือแบบแปลน (เว้นว่างไว้หากเก็บในไดรฟ์หลัก)
const DRIVE_FOLDER_ID = "1-bK2XduKVA4l-l_mx3JDke4JQnv-B6gC";

/**
 * ค้นหาหรือเปิด Google Spreadsheet ID: 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4
 * บังคับเปิดชีตคำสั่งซื้อตาม ID โดยตรง ไม่บันทึกลงชีตสินค้า
 */
function getTargetSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
      if (ss) return ss;
    } catch (err) {
      Logger.log("❌ ไม่สามารถเปิด Sheet ID: " + SPREADSHEET_ID + " ข้อผิดพลาด: " + err.toString());
      throw new Error("ไม่สามารถเปิด Google Sheet ID: " + SPREADSHEET_ID + " ได้ (" + err.toString() + ") กรุณาตรวจสอบสิทธิ์การแชร์ชีต หรือเปิด Apps Script จากชีตใหม่โดยตรง");
    }
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error("ไม่พบ Google Sheet ID: " + SPREADSHEET_ID);
}

/**
 * ค้นหาหรือสร้างแท็บ "รายการคำสั่งซื้อ" พร้อมกำหนดหัวตาราง 26 คอลัมน์
 */
function getOrCreateOrderSheet(ss) {
  const sheetName = "รายการคำสั่งซื้อ";
  let sheet = ss.getSheetByName(sheetName);

  const headers = [
    "รหัสออเดอร์",
    "วันที่-เวลาสั่งซื้อ",
    "ชื่อลูกค้า",
    "เบอร์โทรศัพท์",
    "LINE ID",
    "อีเมลลูกค้า",
    "รูปแบบการจัดส่ง",
    "ที่อยู่จัดส่ง / สาขาที่รับ",
    "พิกัด GPS",
    "ลิงก์หมุด Google Maps",
    "ระยะทาง (กม.)",
    "โซนจัดส่ง",
    "ยอดรวมสินค้า (บาท)",
    "ค่าจัดส่ง (บาท)",
    "ยอดสุทธิทั้งสิ้น (บาท)",
    "วิธีชำระเงิน",
    "สลิปโอนเงิน",
    "ขอใบกำกับภาษี",
    "ประเภทผู้เสียภาษี",
    "ชื่อผู้เสียภาษี/นิติบุคคล",
    "เลขประจำตัวผู้เสียภาษี",
    "สาขา",
    "ที่อยู่ออกใบกำกับภาษี",
    "รายการสินค้าทั้งหมด",
    "หมายเหตุเพิ่มเติม",
    "สถานะคำสั่งซื้อ"
  ];

  if (!sheet) {
    try {
      sheet = ss.insertSheet(sheetName);
    } catch (e) {
      sheet = ss.getActiveSheet();
      sheet.setName(sheetName);
    }

    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#DC2626")
      .setFontColor("#FFFFFF")
      .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    for (let c = 1; c <= headers.length; c++) {
      try {
        sheet.autoResizeColumn(c);
      } catch (colErr) {}
    }
  } else {
    // หากแท็บมีอยู่แล้ว ตรวจสอบว่ามีคอลัมน์ "อีเมลลูกค้า" หรือไม่ ถ้ายังไม่มีให้แทรกอัตโนมัติ
    try {
      const lastCol = sheet.getLastColumn();
      if (lastCol > 0) {
        const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        const hasEmailCol = currentHeaders.some(function(h) {
          return h && h.toString().indexOf("อีเมล") >= 0;
        });
        if (!hasEmailCol && lastCol >= 5) {
          sheet.insertColumnAfter(5);
          sheet.getRange(1, 6).setValue("อีเมลลูกค้า")
            .setFontWeight("bold")
            .setBackground("#DC2626")
            .setFontColor("#FFFFFF")
            .setHorizontalAlignment("center");
        }
      }
    } catch (migErr) {
      Logger.log("Migration check notice: " + migErr.toString());
    }
  }

  return sheet;
}

/**
 * ฟังก์ชันสำหรับสร้าง HTML อีเมลสำหรับลูกค้า (Customer Email)
 * ข้อกำหนดสำคัญ:
 * 1. แสดงเฉพาะรายละเอียดการสั่งซื้อ ยอดเงิน และข้อมูลติดต่อร้าน
 * 2. ภาษาและข้อความมีความสุภาพ ให้ความเคารพแก่ลูกค้า
 * 3. ไม่แสดงรูปภาพสลิป หรือลิงก์สลิปใดๆ
 * 4. ไม่แสดงลิงก์หรือข้อความเกี่ยวกับ Google Sheet หลังบ้าน ("📊 บันทึกลง Google Sheet...") เด็ดขาด
 * 5. ไม่แสดงพิกัด GPS นำทาง หรือข้อความแจ้งเตือนภายในของร้าน
 */
function buildCustomerEmailHtml(postData) {
  const isPickup = postData.deliveryMethod === "pickup" || postData.deliveryMethod === "store_pickup";
  const deliveryMethodLabel = isPickup ? "รับสินค้าเองที่หน้าร้าน (สุโขทัยแสงอุปกรณ์)" : "จัดส่งตามที่อยู่";
  const orderDateStr = postData.orderDateStr || new Date().toLocaleString("th-TH");

  // ตารางรายการสินค้า
  let itemsRowsHtml = "";
  if (Array.isArray(postData.items)) {
    itemsRowsHtml = postData.items.map(function(it) {
      const barcodeText = it.barcode ? " <span style='color:#6b7280; font-size:11px;'>(" + it.barcode + ")</span>" : "";
      return "<tr>" +
        "<td style='padding:10px 12px; border-bottom:1px solid #f3f4f6; color:#111827;'>" + it.name + barcodeText + "</td>" +
        "<td style='padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:center; color:#374151;'>" + it.quantity + " " + (it.unit || "ชิ้น") + "</td>" +
        "<td style='padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; color:#374151;'>฿" + Number(it.unitPrice || 0).toLocaleString() + "</td>" +
        "<td style='padding:10px 12px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold; color:#111827;'>฿" + Number(it.itemTotal || 0).toLocaleString() + "</td>" +
      "</tr>";
    }).join("");
  }

  // ข้อมูลใบกำกับภาษี (ถ้ามีขอ)
  let taxHtml = "";
  if (postData.needTaxInvoice) {
    taxHtml = 
      "<div style='background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:14px 16px; margin-bottom:18px;'>" +
        "<h4 style='margin:0 0 8px 0; color:#1e40af; font-size:14px; font-weight:bold;'>🧾 ข้อมูลสำหรับออกใบกำกับภาษี:</h4>" +
        "<p style='margin:3px 0; font-size:13px; color:#1e3a8a;'><strong>ประเภท:</strong> " + (postData.taxType || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px; color:#1e3a8a;'><strong>ชื่อผู้เสียภาษี:</strong> " + (postData.taxName || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px; color:#1e3a8a;'><strong>เลขประจำตัวผู้เสียภาษี:</strong> " + (postData.taxId || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px; color:#1e3a8a;'><strong>สาขา:</strong> " + (postData.taxBranch || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px; color:#1e3a8a;'><strong>ที่อยู่ออกใบกำกับ:</strong> " + (postData.taxAddress || "-") + "</p>" +
      "</div>";
  }

  // กล่องแจ้งการนัดหมายส่งหรือรับของ
  const appointmentNoticeHtml = isPickup
    ? "<div style='background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:12px 16px; margin-top:12px; font-size:13px; color:#166534;'>" +
        "🏬 <strong>รูปแบบการรับสินค้า: รับเองที่หน้าร้านสุโขทัยแสงอุปกรณ์ (ฟรีค่าจัดส่ง)</strong><br/>" +
        "<span style='font-size:12px; color:#15803d;'>ทางร้านได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการเตรียมสินค้าและติดต่อกลับหาคุณผ่านเบอร์โทร <strong>" + (postData.phone || "-") + "</strong> เพื่อแจ้งนัดหมายวันเข้ารับสินค้าค่ะ</span>" +
      "</div>"
    : "<div style='background:#fef3c7; border:1px solid #fcd34d; border-radius:8px; padding:12px 16px; margin-top:12px; font-size:13px; color:#92400e;'>" +
        "🚚 <strong>รูปแบบการจัดส่ง: จัดส่งตามที่อยู่</strong><br/>" +
        "<span style='font-size:12px; color:#78350f;'>ทางร้านได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบสต็อกสินค้าและโทรติดต่อกลับเพื่อยืนยันวัน-เวลานัดหมายจัดส่งสินค้าให้ถึงมือคุณโดยเร็วที่สุดค่ะ</span>" +
      "</div>";

  // ข้อความวิธีชำระเงินที่สุภาพสำหรับลูกค้า
  let paymentMethodLabel = postData.paymentMethod || "ตามที่ระบุในคำสั่งซื้อ";
  if (paymentMethodLabel.indexOf("โอน") >= 0) {
    paymentMethodLabel = "โอนเงินผ่านธนาคาร กสิกรไทย 157-2-45402-5";
  }

  return (
    "<div style='font-family:Prompt, Tahoma, sans-serif; max-width:650px; margin:0 auto; padding:20px; border:1px solid #e5e7eb; border-radius:12px; background:#ffffff;'>" +
      // ส่วนหัวโลโก้และชื่อร้าน
      "<div style='background:#DC2626; color:#ffffff; padding:18px 20px; border-radius:10px; text-align:center; margin-bottom:20px;'>" +
        "<h2 style='margin:0 0 4px 0; font-size:22px; font-weight:bold;'>ร้านสุโขทัยแสงอุปกรณ์</h2>" +
        "<p style='margin:0; font-size:13px; opacity:0.95;'>ใบสรุปรายการคำสั่งซื้อสินค้า (SCG  สุโขทัย)</p>" +
      "</div>" +

      // ข้อความแสดงความขอบพระคุณอย่างสุภาพ
      "<div style='background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px; margin-bottom:18px; text-align:center;'>" +
        "<h3 style='margin:0 0 6px 0; color:#166534; font-size:16px; font-weight:bold;'>ขอแสดงความนับถือ และขอบพระคุณสำหรับคำสั่งซื้อค่ะ 🙏</h3>" +
        "<p style='margin:0; font-size:13px; color:#15803d; line-height:1.6;'>เรียน คุณ <strong>" + (postData.customerName || "ลูกค้า") + "</strong><br/>ทางร้านสุโขทัยแสงอุปกรณ์ ขอขอบพระคุณเป็นอย่างยิ่งที่ท่านได้มอบความไว้วางใจสั่งซื้อสินค้ากับทางร้านเรา ด้านล่างนี้คือรายละเอียดและใบสรุปรายการสั่งซื้อของคุณค่ะ</p>" +
      "</div>" +

      // กล่องข้อมูลผู้สั่งซื้อและการจัดส่ง
      "<div style='background:#f9fafb; padding:16px 18px; border-radius:10px; margin-bottom:18px; border:1px solid #f3f4f6; font-size:13px; line-height:1.6;'>" +
        "<p style='margin:4px 0; font-size:14px;'><strong>รหัสคำสั่งซื้อ:</strong> <span style='color:#DC2626; font-weight:bold; font-size:16px;'>#" + postData.orderId + "</span></p>" +
        "<p style='margin:4px 0;'><strong>วันที่สั่งซื้อ:</strong> " + orderDateStr + "</p>" +
        "<p style='margin:4px 0;'><strong>ชื่อผู้สั่งซื้อ:</strong> " + (postData.customerName || "-") + "</p>" +
        "<p style='margin:4px 0;'><strong>เบอร์โทรศัพท์:</strong> " + (postData.phone || "-") + "</p>" +
        (postData.lineId ? "<p style='margin:4px 0;'><strong>LINE ID:</strong> " + postData.lineId + "</p>" : "") +
        "<p style='margin:4px 0;'><strong>รูปแบบการรับสินค้า:</strong> <span style='color:#15803d; font-weight:bold;'>" + deliveryMethodLabel + "</span></p>" +
        (!isPickup ? "<p style='margin:4px 0;'><strong>ที่อยู่จัดส่ง:</strong> " + (postData.addressDetail || "-") + "</p>" : "") +
        "<p style='margin:4px 0;'><strong>วิธีชำระเงิน:</strong> " + paymentMethodLabel + "</p>" +
        (postData.notes ? "<p style='margin:4px 0;'><strong>หมายเหตุเพิ่มเติม:</strong> " + postData.notes + "</p>" : "") +
        appointmentNoticeHtml +
      "</div>" +

      taxHtml +

      // ตารางรายการสินค้า
      "<h3 style='margin:18px 0 8px 0; color:#111827; font-size:15px; font-weight:bold;'>🛒 รายการสินค้าที่คุณสั่งซื้อ</h3>" +
      "<table style='width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px;'>" +
        "<thead>" +
          "<tr style='background:#f3f4f6; text-align:left;'>" +
            "<th style='padding:10px 12px; border-bottom:2px solid #e5e7eb;'>รายการ</th>" +
            "<th style='padding:10px 12px; border-bottom:2px solid #e5e7eb; text-align:center;'>จำนวน</th>" +
            "<th style='padding:10px 12px; border-bottom:2px solid #e5e7eb; text-align:right;'>ราคา/หน่วย</th>" +
            "<th style='padding:10px 12px; border-bottom:2px solid #e5e7eb; text-align:right;'>รวม (บาท)</th>" +
          "</tr>" +
        "</thead>" +
        "<tbody>" +
          itemsRowsHtml +
        "</tbody>" +
        "<tfoot>" +
          "<tr>" +
            "<td colspan='3' style='padding:10px 12px; text-align:right; color:#4b5563;'>ยอดรวมค่าสินค้า:</td>" +
            "<td style='padding:10px 12px; text-align:right; font-weight:bold;'>฿" + Number(postData.subtotal || 0).toLocaleString() + "</td>" +
          "</tr>" +
          "<tr>" +
            "<td colspan='3' style='padding:10px 12px; text-align:right; color:#4b5563;'>ค่าจัดส่ง:</td>" +
            "<td style='padding:10px 12px; text-align:right; font-weight:bold; color:#DC2626;'>" + (Number(postData.deliveryFee || 0) === 0 ? "ฟรี (฿0)" : "฿" + Number(postData.deliveryFee || 0).toLocaleString()) + "</td>" +
          "</tr>" +
          "<tr style='background:#fef2f2;'>" +
            "<td colspan='3' style='padding:12px 10px; text-align:right; font-size:15px; font-weight:bold; color:#991B1B;'>ยอดสุทธิทั้งสิ้น:</td>" +
            "<td style='padding:12px 10px; text-align:right; font-size:18px; font-weight:bold; color:#DC2626;'>฿" + Number(postData.grandTotal || 0).toLocaleString() + "</td>" +
          "</tr>" +
        "</tfoot>" +
      "</table>" +

      // ส่วนท้ายอีเมลและช่องทางติดต่อร้าน
      "<div style='text-align:center; color:#6b7280; font-size:12px; padding-top:16px; border-top:1px solid #e5e7eb; margin-top:20px; line-height:1.6;'>" +
        "<p style='margin:0 0 4px 0; font-weight:bold; color:#111827;'>ร้านสุโขทัยแสงอุปกรณ์ (SCG  สุโขทัย) | เริ่มที่นี่ no worry เรื่องบ้าน</p>" +
        "<p style='margin:0; font-size:11px; color:#4b5563;'>📍 123 ม.1 ต.ปากแคว อ.เมือง จ.สุโขทัย 64000 • โทร: 055-616437 | LINE: @exu1868n</p>" +
        "<p style='margin:4px 0 0 0; font-size:11px; color:#9ca3af;'>เวลาทำการ: ทุกวัน 08:00 - 17:00 น.</p>" +
      "</div>" +
    "</div>"
  );
}

/**
 * ฟังก์ชันสำหรับสร้าง HTML อีเมลสำหรับทางร้าน (Store Email)
 * ประกอบด้วย:
 * 1. ข้อมูลผู้สั่งซื้อ และเบอร์โทรสำหรับกดโทรออกได้ทันที
 * 2. ลิงก์หมุด GPS แผนที่นำทาง
 * 3. รูปภาพสลิปโอนเงิน พร้อมลิงก์เปิดดูสลิปขนาดเต็มบน Google Drive
 * 4. ลิงก์เปิดดูและจัดการตารางคำสั่งซื้อใน Google Sheet (ID: 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4)
 */
function buildStoreEmailHtml(postData, slipBlob, slipUrl, sheetSaveStatus, sheetUrl) {
  const isPickup = postData.deliveryMethod === "pickup" || postData.deliveryMethod === "store_pickup";
  const deliveryMethodLabel = isPickup ? "รับสินค้าเองที่หน้าร้าน" : "จัดส่งตามที่อยู่";
  const orderDateStr = postData.orderDateStr || new Date().toLocaleString("th-TH");

  const mapsPinUrl = (postData.lat && postData.lng && !isPickup)
    ? "https://www.google.com/maps?q=" + postData.lat + "," + postData.lng
    : (isPickup ? "https://maps.app.goo.gl/wNSma6LbqY2ebmmf6" : "-");

  // บล็อกสลิปโอนเงิน (เฉพาะทางร้านดู)
  let slipBlockHtml = "";
  if (postData.slipData) {
    const imgSrc = slipBlob ? "cid:slipImg" : postData.slipData;
    slipBlockHtml = 
      "<div style='background:#f0fdf4; border:2px solid #86efac; border-radius:10px; padding:16px; margin-bottom:16px;'>" +
        "<h4 style='margin:0 0 10px 0; color:#166534; font-size:15px; font-weight:bold;'>📄 รูปภาพสลิปโอนเงิน (หลักฐานการชำระเงิน):</h4>" +
        "<div style='text-align:center; margin:12px 0; background:#ffffff; padding:10px; border-radius:8px; border:1px solid #dcfce7; display:inline-block; max-width:100%;'>" +
          "<img src='" + imgSrc + "' style='max-width:340px; max-height:480px; width:100%; height:auto; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.1);' alt='สลิปการโอนเงิน' />" +
        "</div>" +
        (slipUrl && slipUrl.indexOf("http") === 0 ? "<p style='margin:10px 0 0 0; font-size:13px; text-align:center;'><a href='" + slipUrl + "' target='_blank' style='background:#16a34a; color:#ffffff; padding:8px 16px; border-radius:6px; font-weight:bold; text-decoration:none; display:inline-block;'>🔗 คลิกเปิดดูรูปสลิปขนาดเต็มบน Google Drive ↗</a></p>" : "") +
      "</div>";
  } else if (postData.paymentMethod && postData.paymentMethod.indexOf("โอน") >= 0) {
    slipBlockHtml = 
      "<div style='background:#fff1f2; border:2px dashed #f43f5e; border-radius:10px; padding:14px; margin-bottom:16px;'>" +
        "<h4 style='margin:0 0 6px 0; color:#be123c; font-size:14px; font-weight:bold;'>⚠️ สถานะสลิป: ลูกค้ายังไม่ได้แนบสลิปโอนเงินในระบบ</h4>" +
        "<p style='margin:0; font-size:13px; color:#881337; line-height:1.5;'>" +
          "ลูกค้าเลือกชำระเงินโดยการโอนเงิน แต่ยังไม่ได้แนบสลิปตอนสั่งซื้อ<br/>" +
          "👉 กรุณาโทรติดต่อลูกค้าที่เบอร์: <a href='tel:" + postData.phone + "' style='color:#be123c; font-weight:bold; text-decoration:underline; font-size:14px;'>" + postData.phone + "</a> หรือรอรับสลิปผ่านทาง LINE @exu1868n ก่อนจัดส่งสินค้า" +
        "</p>" +
      "</div>";
  }

  // บล็อกข้อมูลใบกำกับภาษี
  let taxBlockHtml = "";
  if (postData.needTaxInvoice) {
    taxBlockHtml = 
      "<div style='background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; margin-bottom:16px;'>" +
        "<h4 style='margin:0 0 8px 0; color:#1e40af; font-size:14px;'>🧾 ข้อมูลสำหรับออกใบกำกับภาษี:</h4>" +
        "<p style='margin:3px 0; font-size:13px;'><strong>ประเภท:</strong> " + (postData.taxType || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px;'><strong>ชื่อผู้เสียภาษี:</strong> " + (postData.taxName || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px;'><strong>เลขประจำตัวผู้เสียภาษี:</strong> " + (postData.taxId || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px;'><strong>สาขา:</strong> " + (postData.taxBranch || "-") + "</p>" +
        "<p style='margin:3px 0; font-size:13px;'><strong>ที่อยู่ออกใบกำกับ:</strong> " + (postData.taxAddress || "-") + "</p>" +
      "</div>";
  }

  const deliveryNoticeHtml = isPickup
    ? "<div style='background:#dcfce7; border:1px solid #86efac; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:13px; color:#166534; font-weight:bold;'>" +
        "🏬 <strong>ลูกค้าระบุ: รับสินค้าเองที่ร้าน (สุโขทัยแสงอุปกรณ์)</strong><br/>" +
        "<span style='font-size:12px; font-weight:normal;'>ทางร้านจะเช็คสต็อกสินค้าและโทรนัดหมายวันรับสินค้ากับลูกค้าผ่านเบอร์: <a href='tel:" + postData.phone + "' style='color:#15803d; font-weight:bold;'>" + postData.phone + "</a></span>" +
      "</div>"
    : "<div style='background:#fef3c7; border:1px solid #fcd34d; border-radius:8px; padding:10px 14px; margin-top:10px; font-size:13px; color:#92400e; font-weight:bold;'>" +
        "🕒 <strong>รอพนักงานติดต่อกลับเพื่อนัดวันจัดส่งสินค้า</strong>" +
      "</div>";

  let itemsRowsHtml = "";
  if (Array.isArray(postData.items)) {
    itemsRowsHtml = postData.items.map(function(it) {
      return "<tr>" +
        "<td style='padding:8px 10px; border-bottom:1px solid #f3f4f6;'>" + it.name + (it.barcode ? " <span style='color:#6b7280; font-size:11px;'>(" + it.barcode + ")</span>" : "") + "</td>" +
        "<td style='padding:8px 10px; border-bottom:1px solid #f3f4f6; text-align:center;'>" + it.quantity + " " + (it.unit || "ชิ้น") + "</td>" +
        "<td style='padding:8px 10px; border-bottom:1px solid #f3f4f6; text-align:right;'>฿" + Number(it.unitPrice || 0).toLocaleString() + "</td>" +
        "<td style='padding:8px 10px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:bold;'>฿" + Number(it.itemTotal || 0).toLocaleString() + "</td>" +
      "</tr>";
    }).join("");
  }

  return (
    "<div style='font-family:Prompt, Tahoma, sans-serif; max-width:650px; margin:0 auto; padding:20px; border:1px solid #e5e7eb; border-radius:12px; background:#ffffff;'>" +
      "<div style='background:#DC2626; color:#ffffff; padding:16px 20px; border-radius:8px; text-align:center; margin-bottom:20px;'>" +
        "<h2 style='margin:0 0 4px 0; font-size:22px; font-weight:bold;'>สุโขทัยแสงอุปกรณ์</h2>" +
        "<p style='margin:0; font-size:13px; opacity:0.95;'>มีคำสั่งซื้อสินค้าใหม่เข้ามาจากเว็บไซต์ (สำหรับทางร้าน)</p>" +
      "</div>" +
      
      "<div style='background:#f9fafb; padding:16px; border-radius:8px; margin-bottom:16px; border:1px solid #f3f4f6;'>" +
        "<p style='margin:4px 0; font-size:14px;'><strong>รหัสคำสั่งซื้อ:</strong> <span style='color:#DC2626; font-weight:bold;'>#" + postData.orderId + "</span></p>" +
        "<p style='margin:4px 0; font-size:13px;'><strong>วันที่สั่งซื้อ:</strong> " + orderDateStr + "</p>" +
        "<p style='margin:4px 0; font-size:14px;'><strong>ชื่อผู้สั่งซื้อ:</strong> " + (postData.customerName || "-") + "</p>" +
        "<p style='margin:4px 0; font-size:14px;'><strong>เบอร์โทรศัพท์:</strong> <a href='tel:" + postData.phone + "' style='color:#DC2626; font-weight:bold; font-size:15px;'>" + (postData.phone || "-") + "</a></p>" +
        "<p style='margin:4px 0; font-size:13px;'><strong>LINE ID:</strong> " + (postData.lineId || "-") + "</p>" +
        "<p style='margin:4px 0; font-size:13px;'><strong>อีเมลลูกค้า:</strong> " + (postData.customerEmail ? ("<a href='mailto:" + postData.customerEmail + "' style='color:#2563EB; font-weight:bold;'>" + postData.customerEmail + "</a>") : "-") + "</p>" +
        "<p style='margin:4px 0; font-size:13px;'><strong>รูปแบบการรับสินค้า:</strong> <span style='color:#15803d; font-weight:bold;'>" + deliveryMethodLabel + "</span></p>" +
        (!isPickup ? "<p style='margin:4px 0; font-size:13px;'><strong>ที่อยู่จัดส่ง:</strong> " + (postData.addressDetail || "-") + "</p>" : "") +
        "<p style='margin:4px 0; font-size:13px;'><strong>พิกัดหมุดจัดส่ง (GPS):</strong> <a href='" + mapsPinUrl + "' target='_blank' style='color:#2563EB; font-weight:bold;'>📍 " + (isPickup ? "พิกัดร้านสุโขทัยแสงอุปกรณ์" : "เปิดแผนที่นำทาง") + "</a></p>" +
        "<p style='margin:4px 0; font-size:13px;'><strong>วิธีชำระเงิน:</strong> " + (postData.paymentMethod || "-") + "</p>" +
        "<p style='margin:4px 0; font-size:13px;'><strong>หมายเหตุเพิ่มเติม:</strong> " + (postData.notes || "-") + "</p>" +
        deliveryNoticeHtml +
      "</div>" +
      
      slipBlockHtml +
      taxBlockHtml +

      "<h3 style='margin:16px 0 8px 0; color:#111827; font-size:15px; font-weight:bold;'>🛒 รายการสินค้าในออเดอร์</h3>" +
      "<table style='width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px;'>" +
        "<thead>" +
          "<tr style='background:#f3f4f6; text-align:left;'>" +
            "<th style='padding:8px 10px; border-bottom:2px solid #e5e7eb;'>รายการ</th>" +
            "<th style='padding:8px 10px; border-bottom:2px solid #e5e7eb; text-align:center;'>จำนวน</th>" +
            "<th style='padding:8px 10px; border-bottom:2px solid #e5e7eb; text-align:right;'>ราคา/หน่วย</th>" +
            "<th style='padding:8px 10px; border-bottom:2px solid #e5e7eb; text-align:right;'>รวม (บาท)</th>" +
          "</tr>" +
        "</thead>" +
        "<tbody>" +
          itemsRowsHtml +
        "</tbody>" +
        "<tfoot>" +
          "<tr>" +
            "<td colspan='3' style='padding:8px 10px; text-align:right; color:#4b5563;'>ยอดรวมค่าสินค้า:</td>" +
            "<td style='padding:8px 10px; text-align:right; font-weight:bold;'>฿" + Number(postData.subtotal || 0).toLocaleString() + "</td>" +
          "</tr>" +
          "<tr>" +
            "<td colspan='3' style='padding:8px 10px; text-align:right; color:#4b5563;'>ค่าจัดส่ง:</td>" +
            "<td style='padding:8px 10px; text-align:right; font-weight:bold; color:#DC2626;'>" + (Number(postData.deliveryFee || 0) === 0 ? "ฟรี (฿0)" : "฿" + Number(postData.deliveryFee || 0).toLocaleString()) + "</td>" +
          "</tr>" +
          "<tr style='background:#fef2f2;'>" +
            "<td colspan='3' style='padding:10px; text-align:right; font-size:15px; font-weight:bold; color:#991B1B;'>ยอดสุทธิทั้งสิ้น:</td>" +
            "<td style='padding:10px; text-align:right; font-size:18px; font-weight:bold; color:#DC2626;'>฿" + Number(postData.grandTotal || 0).toLocaleString() + "</td>" +
          "</tr>" +
        "</tfoot>" +
      "</table>" +

      // ลิงก์เปิดดู Google Sheet หลังบ้านสำหรับทางร้าน
      "<div style='background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px; margin-top:16px; margin-bottom:16px; font-size:12px; color:#166534;'>" +
        "📊 <strong>บันทึกลง Google Sheet:</strong> <a href='" + sheetUrl + "' target='_blank' style='color:#15803d; font-weight:bold; text-decoration:underline;'>คลิกเปิดดูตารางคำสั่งซื้อใน Sheet (ID: " + SPREADSHEET_ID + ") ↗</a>" +
        (sheetSaveStatus !== "success" ? "<br/><span style='color:#dc2626; font-weight:bold;'>⚠️ แจ้งเตือน: " + sheetSaveStatus + "</span>" : "") +
      "</div>" +

      "<div style='text-align:center; color:#6b7280; font-size:11px; padding-top:16px; border-top:1px solid #f3f4f6;'>" +
        "ร้านสุโขทัยแสงอุปกรณ์ | เริ่มที่นี่ no worry เรื่องบ้าน • โทร: 055-616437 | LINE: @exu1868n" +
      "</div>" +
    "</div>"
  );
}

/**
 * ฟังก์ชันสำหรับทดสอบบันทึกข้อมูลคำสั่งซื้อเข้า Sheet 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4
 * คุณสามารถกดเลือกฟังก์ชันนี้ใน Apps Script แล้วกดปุ่ม "เรียกใช้" (Run) เพื่อเช็คได้ทันที
 */
function testInsertOrder() {
  const ss = getTargetSpreadsheet();
  const sheet = getOrCreateOrderSheet(ss);

  const testOrderId = "TEST-" + Math.floor(1000 + Math.random() * 9000);
  const nowStr = new Date().toLocaleString("th-TH");

  sheet.appendRow([
    testOrderId,
    nowStr,
    "ทดสอบระบบ (สุโขทัยแสงอุปกรณ์)",
    "055-616437",
    "@exu1868n",
    "scghomessk@gmail.com",
    "จัดส่งตามที่อยู่",
    "123 ต.ธานี อ.เมือง จ.สุโขทัย",
    "17.0076, 99.8234",
    "https://maps.google.com?q=17.0076,99.8234",
    "2.5",
    "ในเขตเทศบาลตำบลธานี",
    "5000",
    "0",
    "5000",
    "โอนเงินผ่านธนาคาร กสิกรไทย 157-2-45402-5",
    "ทดสอบสลิป",
    "ไม่ต้องการ",
    "-",
    "-",
    "-",
    "-",
    "-",
    "1. ปูนซีเมนต์ SCG แดง x 10 ถุง = 1,490 บาท",
    "ทดสอบการเชื่อมต่อระบบเข้า Sheet ID 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4",
    "ทดสอบสำเร็จ"
  ]);

  SpreadsheetApp.flush();
  Logger.log("✅ ทดสอบบันทึกข้อมูลเข้า Sheet ID: " + SPREADSHEET_ID + " สำเร็จแล้ว!");
  Logger.log("สามารถเปิดดูแถวใหม่ใน Sheet ได้ทันที: " + ss.getUrl());
}

/**
 * ฟังก์ชันสำหรับทดสอบส่งอีเมลคำสั่งซื้อ
 * - ส่งให้ร้านค้า (scghomessk@gmail.com) 1 ฉบับ (มีข้อมูลหลังบ้าน/สลิป/ลิงก์ Sheet)
 * - ส่งให้ลูกค้า (testCustomerEmail) เพียง 1 ฉบับเท่านั้น (แสดงเฉพาะรายการสั่งซื้อ ไม่เห็นสลีป และไม่เห็นลิงก์ Sheet หลังบ้าน)
 */
function testSendOrderEmail() {
  const testCustomerEmail = "dungdaww978@gmail.com"; // ใส่อีเมลลูกค้าที่ต้องการทดสอบรับใบยืนยันคำสั่งซื้อ
  const orderId = "TEST-EMAIL-" + Math.floor(1000 + Math.random() * 9000);
  const nowStr = new Date().toLocaleString("th-TH");

  const sampleOrder = {
    orderId: orderId,
    orderDateStr: nowStr,
    customerName: "คุณสมชาย ใจดี (ทดสอบระบบ)",
    phone: "055-616437",
    lineId: "@exu1868n",
    customerEmail: testCustomerEmail,
    deliveryMethod: "delivery",
    addressDetail: "123 ต.ธานี อ.เมือง จ.สุโขทัย",
    lat: 17.0076,
    lng: 99.8234,
    distanceKm: 2.5,
    zoneName: "ในเขตเทศบาลตำบลธานี",
    paymentMethod: "โอนเงินผ่านธนาคาร กสิกรไทย 157-2-45402-5",
    needTaxInvoice: false,
    subtotal: 5000,
    deliveryFee: 0,
    grandTotal: 5000,
    notes: "ทดสอบการส่งอีเมลคำสั่งซื้อ",
    items: [
      { name: "ปูนซีเมนต์ SCG แดง (50 กก.)", barcode: "8852422001011", quantity: 10, unit: "ถุง", unitPrice: 149, itemTotal: 1490 },
      { name: "กระเบื้องหลังคา ซีแพคโมเนีย SCG สีเทา", barcode: "8852422002022", quantity: 100, unit: "แผ่น", unitPrice: 18, itemTotal: 1800 },
      { name: "สีทาภายนอก TOA Shield-1 (กึ่งเงา)", barcode: "8852422003033", quantity: 2, unit: "ถัง", unitPrice: 855, itemTotal: 1710 }
    ]
  };

  const ss = getTargetSpreadsheet();

  // 1. ส่งอีเมลแจ้งเตือนไปยังทางร้าน (scghomessk@gmail.com) เพียงที่เดียวเท่านั้น (ห้าม CC ลูกค้าเด็ดขาด!)
  const storeHtmlBody = buildStoreEmailHtml(sampleOrder, null, "", "success", ss.getUrl());
  MailApp.sendEmail({
    to: TARGET_STORE_EMAIL,
    name: "ร้านสุโขทัยแสงอุปกรณ์ (SCG สุโขทัย)",
    replyTo: testCustomerEmail,
    subject: "📦 [แจ้งเตือนร้านค้า] ทดสอบคำสั่งซื้อใหม่ #" + orderId + " - สุโขทัยแสงอุปกรณ์ [ยอด ฿5,000]",
    htmlBody: storeHtmlBody
  });

  // 2. ส่งอีเมลยืนยันคำสั่งซื้อไปยังลูกค้า (เพียง 1 ฉบับเท่านั้น สะอาด สุภาพ ไม่เห็นสลีป และไม่เห็นลิงก์ Google Sheet หลังบ้าน)
  const customerHtmlBody = buildCustomerEmailHtml(sampleOrder);
  MailApp.sendEmail({
    to: testCustomerEmail,
    name: "ร้านสุโขทัยแสงอุปกรณ์",
    replyTo: TARGET_STORE_EMAIL,
    subject: "📦 ขอบพระคุณสำหรับคำสั่งซื้อ #" + orderId + " - ร้านสุโขทัยแสงอุปกรณ์",
    htmlBody: customerHtmlBody
  });

  Logger.log("✅ ทดสอบส่งอีเมลสำเร็จ!");
  Logger.log("1. ร้านค้า (" + TARGET_STORE_EMAIL + ") ได้รับแจ้งเตือนคำสั่งซื้อ 1 ฉบับ (มีข้อมูลหลังบ้าน/สลิป/ลิงก์ Sheet)");
  Logger.log("2. ลูกค้า (" + testCustomerEmail + ") ได้รับเพียง 1 ฉบับ (แสดงเฉพาะรายละเอียดคำสั่งซื้อ ไม่เห็นสลีป และไม่เห็นลิงก์ Sheet หลังบ้าน)");
}

/**
 * รับคำขอ GET สำหรับตรวจสอบสถานะเว็บแอปผ่านเบราว์เซอร์
 */
function doGet(e) {
  // ความปลอดภัย: URL นี้ฝังอยู่ในเว็บ ใครก็เรียกได้ จึงตอบแค่สถานะ
  // ห้ามส่ง Sheet ID / ลิงก์ Sheet / ข้อความ error ภายในออกไป
  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "ระบบเว็บแอป สุโขทัยแสงอุปกรณ์ ทำงานปกติ" })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * รับคำขอ POST คำสั่งซื้อจากหน้าเว็บไซต์
 */
function doPost(e) {
  try {
    let postData = {};

    // อ่านข้อมูล request รองรับทั้ง JSON, Text, Parameter
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        try {
          postData = JSON.parse(decodeURIComponent(e.postData.contents));
        } catch (e2) {
          postData = e.parameter || {};
        }
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const ss = getTargetSpreadsheet();

    // ==========================================
    // 1. กรณี: คำสั่งซื้อสินค้า (Order) จากหน้าเว็บ
    // ==========================================
    if (postData.action === "create_order" || postData.orderId) {
      // กันส่งซ้ำ: รหัสออเดอร์เดิมภายใน 6 ชั่วโมงจะถูกข้าม (ไม่บันทึกซ้ำ ไม่ส่งอีเมลซ้ำ)
      if (postData.orderId) {
        const cache = CacheService.getScriptCache();
        const dupKey = "order_" + String(postData.orderId).substring(0, 80);
        if (cache.get(dupKey)) {
          return ContentService.createTextOutput(
            JSON.stringify({ status: "success", orderId: postData.orderId, message: "ได้รับคำสั่งซื้อนี้แล้ว" })
          ).setMimeType(ContentService.MimeType.JSON);
        }
      }

      const sheet = getOrCreateOrderSheet(ss);

      // บันทึกไฟล์รูปสลิปโอนเงินลง Google Drive (ถ้ามีแนบมา)
      let slipUrl = "";
      let slipBlob = null;
      if (postData.slipData && postData.slipData.trim() !== "") {
        try {
          const rawBase64 = postData.slipData.split(",")[1] || postData.slipData;
          const fileBytes = Utilities.base64Decode(rawBase64);
          const mimeType = postData.slipType || "image/jpeg";
          const fileName = "Slip-" + (postData.orderId || Date.now()) + (postData.slipName ? ("-" + postData.slipName) : ".jpg");
          slipBlob = Utilities.newBlob(fileBytes, mimeType, fileName);

          let folder;
          if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== "") {
            folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
          } else {
            folder = DriveApp.getRootFolder();
          }

          const slipFile = folder.createFile(slipBlob);
          lockDownFile_(slipFile);
          slipUrl = slipFile.getUrl();
        } catch (slipErr) {
          slipUrl = "แนบสลิปแล้ว (Drive: " + slipErr.toString() + ")";
        }
      }

      // แปลงรายการสินค้าเป็นข้อความสรุปสำหรับบันทึกลง Sheet
      let itemsSummary = "";
      if (Array.isArray(postData.items)) {
        itemsSummary = postData.items.map(function(it, idx) {
          const barcodeText = it.barcode ? " [บาร์: " + it.barcode + "]" : "";
          return (idx + 1) + ". " + it.name + barcodeText + " x " + it.quantity + " " + (it.unit || "ชิ้น") + " = " + Number(it.itemTotal || 0).toLocaleString() + " บาท";
        }).join("\n");
      }

      const isPickup = postData.deliveryMethod === "pickup" || postData.deliveryMethod === "store_pickup";
      const deliveryMethodLabel = isPickup ? "รับสินค้าเองที่หน้าร้าน" : "จัดส่งตามที่อยู่";

      const mapsPinUrl = (postData.lat && postData.lng && !isPickup)
        ? "https://www.google.com/maps?q=" + postData.lat + "," + postData.lng
        : (isPickup ? "https://maps.app.goo.gl/wNSma6LbqY2ebmmf6" : "-");

      const orderDateStr = new Date().toLocaleString("th-TH");
      postData.orderDateStr = orderDateStr;

      // บันทึกลง Sheet: 1wcGVcCeBj1EA6WTpkTKEuy_1n-Mjm1qwhSlz0iS_zG4
      let sheetSaveStatus = "success";
      try {
        sheet.appendRow([
          postData.orderId || "",
          orderDateStr,
          postData.customerName || "",
          postData.phone || "",
          postData.lineId || "",
          postData.customerEmail || "-",
          deliveryMethodLabel,
          isPickup ? "รับเองที่ร้านสุโขทัยแสงอุปกรณ์" : (postData.addressDetail || ""),
          isPickup ? "หน้าร้านสุโขทัยแสงอุปกรณ์" : ((postData.lat || 0) + ", " + (postData.lng || 0)),
          mapsPinUrl,
          isPickup ? 0 : (postData.distanceKm || 0),
          isPickup ? "รับเองที่ร้าน (ฟรี)" : (postData.zoneName || ""),
          postData.subtotal || 0,
          postData.deliveryFee || 0,
          postData.grandTotal || 0,
          postData.paymentMethod || "",
          (slipUrl && slipUrl.indexOf("http") === 0)
            ? ('=HYPERLINK("' + slipUrl + '", "📄 เปิดดูรูปสลิป")')
            : (slipUrl || (postData.slipData ? "แนบรูปสลิปในออเดอร์แล้ว" : (postData.paymentMethod && postData.paymentMethod.indexOf("โอน") >= 0 ? "⚠️ ยังไม่แนบสลิป" : "ไม่มีสลิป"))),
          postData.needTaxInvoice ? "ต้องการ" : "ไม่ต้องการ",
          postData.taxType || "-",
          postData.taxName || "-",
          postData.taxId || "-",
          postData.taxBranch || "-",
          postData.taxAddress || "-",
          itemsSummary,
          postData.notes || "",
          isPickup ? "ลูกค้ารับเองที่ร้าน (รอนัดหมาย)" : "รอยืนยันการจัดส่ง"
        ]);

      // บันทึกแถวสำเร็จแล้ว จึงจำรหัสออเดอร์นี้ไว้ (กันส่งซ้ำ 6 ชั่วโมง)
      if (postData.orderId) {
        CacheService.getScriptCache().put("order_" + String(postData.orderId).substring(0, 80), "1", 21600);
      }
        SpreadsheetApp.flush();
      } catch (sheetErr) {
        Logger.log("Sheet append error: " + sheetErr.toString());
        sheetSaveStatus = "error: " + sheetErr.toString();
      }

      // ====================================================
      // จัดการส่งอีเมล: แยกส่วนชัดเจนระหว่างร้านค้า และลูกค้า
      // ====================================================
      let emailSendStatus = "not_sent";
      try {
        const pickupSubjectTag = isPickup ? " [รับเองที่ร้าน]" : " [จัดส่ง]";
        const isCustomerStoreOwner = postData.customerEmail && postData.customerEmail.toLowerCase().trim() === TARGET_STORE_EMAIL.toLowerCase().trim();

        // 1. ส่งอีเมลแจ้งเตือนไปยังร้านค้า (TARGET_STORE_EMAIL)
        // มีรูปภาพสลิป + ลิงก์ Google Drive + ลิงก์ตาราง Google Sheet หลังบ้าน
        const storeEmailSubject = "📦 [แจ้งเตือนร้านค้า] คำสั่งซื้อใหม่ #" + postData.orderId + pickupSubjectTag + " คุณ" + (postData.customerName || "ลูกค้า") + " [ยอด ฿" + Number(postData.grandTotal || 0).toLocaleString() + "]";
        const storeHtmlBody = buildStoreEmailHtml(postData, slipBlob, slipUrl, sheetSaveStatus, ss.getUrl());

        const storeMailOptions = {
          to: TARGET_STORE_EMAIL,
          name: "ร้านสุโขทัยแสงอุปกรณ์ (SCG สุโขทัย)",
          subject: storeEmailSubject,
          htmlBody: storeHtmlBody
        };

        // หากลูกค้ากรอกอีเมลมา ทางร้านสามารถกดปุ่ม Reply ใน Gmail เพื่อตอบกลับหาลูกค้าได้ทันที
        if (postData.customerEmail && postData.customerEmail.trim() !== "" && !isCustomerStoreOwner) {
          storeMailOptions.replyTo = postData.customerEmail.trim();
        }

        // แนบไฟล์สลิปส่งให้ทางร้านตรวจสอบ
        if (slipBlob) {
          storeMailOptions.attachments = [slipBlob];
          storeMailOptions.inlineImages = {
            slipImg: slipBlob
          };
        }

        // ส่งอีเมลให้ทางร้านค้า (ห้ามใส่ CC หาเมลลูกค้าเด็ดขาด เพื่อป้องกันเมลซ้ำและไม่ให้ลูกค้าเห็นข้อมูลหลังบ้าน)
        MailApp.sendEmail(storeMailOptions);
        emailSendStatus = "sent";

        // 2. ส่งอีเมลยืนยันคำสั่งซื้อให้ลูกค้า (เพียง 1 ฉบับเท่านั้น)
        // แสดงเฉพาะรายละเอียดการสั่งซื้อ ยอดเงิน และข้อมูลติดต่อ
        // ไม่แสดงสลิป และไม่แสดงลิงก์หรือข้อความ Google Sheet หลังบ้านใดๆ ทั้งสิ้น
        if (postData.customerEmail && postData.customerEmail.trim() !== "") {
          try {
            const customerSubject = isCustomerStoreOwner 
              ? "📦 [ใบยืนยันคำสั่งซื้อสำหรับลูกค้า] ขอบพระคุณสำหรับคำสั่งซื้อ #" + postData.orderId + " - ร้านสุโขทัยแสงอุปกรณ์"
              : "📦 ขอบพระคุณสำหรับคำสั่งซื้อ #" + postData.orderId + " - ร้านสุโขทัยแสงอุปกรณ์";

            const customerHtml = buildCustomerEmailHtml(postData);

            const customerMailOptions = {
              to: postData.customerEmail.trim(),
              name: "ร้านสุโขทัยแสงอุปกรณ์",
              replyTo: TARGET_STORE_EMAIL,
              subject: customerSubject,
              htmlBody: customerHtml
            };

            // ไม่แนบ slipBlob ให้ลูกค้า
            MailApp.sendEmail(customerMailOptions);
            Logger.log("✅ ส่งสรุปคำสั่งซื้อให้ลูกค้าสำเร็จ (1 ฉบับ): " + postData.customerEmail);
          } catch (custMailErr) {
            Logger.log("⚠️ ส่งเมลตรงถึงลูกค้าเกิดข้อผิดพลาด: " + custMailErr.toString());
          }
        }
      } catch (mailErr) {
        Logger.log("Mail error: " + mailErr.toString());
        emailSendStatus = "error: " + mailErr.toString();
      }

      // ตอบกลับเฉพาะข้อมูลที่จำเป็น ไม่ส่ง Sheet ID / ลิงก์สลิปออกไป
      const response = {
        status: "success",
        orderId: postData.orderId,
        message: "บันทึกออเดอร์เรียบร้อยแล้ว"
      };

      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 2. กรณี: ถอดแบบประมาณการราคา
    // ==========================================
    const estSheetName = "ถอดแบบประมาณการ";
    let estSheet = ss.getSheetByName(estSheetName);

    if (!estSheet) {
      try {
        estSheet = ss.insertSheet(estSheetName);
      } catch (e) {
        estSheet = ss.getActiveSheet();
      }
      estSheet.appendRow([
        "ชื่อผู้ติดต่อ", 
        "เบอร์โทรศัพท์", 
        "ช่องทางการติดต่อออนไลน์", 
        "ที่อยู่อาคาร", 
        "แบบที่ต้องการแปลน หรือลิงก์ไดรฟ์",
        "วันที่ส่งข้อมูล"
      ]);
      estSheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#1A1A1E").setFontColor("#FFFFFF");
      estSheet.setFrozenRows(1);
    }

    let fileUrl = "";
    if (postData.fileData && postData.fileName) {
      try {
        const fileBytes = Utilities.base64Decode(postData.fileData.split(",")[1] || postData.fileData);
        const blob = Utilities.newBlob(fileBytes, postData.fileType || "application/octet-stream", postData.fileName);

        let folder;
        if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID.trim() !== "") {
          folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        } else {
          folder = DriveApp.getRootFolder();
        }

        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        fileUrl = file.getUrl();
      } catch (fileError) {
        fileUrl = "เกิดข้อผิดพลาดในการเซฟไฟล์แนบ: " + fileError.toString();
      }
    }

    const finalFileOrLink = fileUrl || postData.driveLink || "ไม่มีไฟล์แนบ";

    estSheet.appendRow([
      postData.name || "",
      postData.phone || "",
      postData.onlineContact || "",
      postData.address || "",
      finalFileOrLink,
      new Date().toLocaleString("th-TH")
    ]);

    const response = { status: "success", message: "บันทึกข้อมูลถอดแบบเรียบร้อยแล้ว" };
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("doPost error: " + error.toString());
    const errorResponse = { status: "error", message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  const output = ContentService.createTextOutput();
  return output.setMimeType(ContentService.MimeType.TEXT);
}
