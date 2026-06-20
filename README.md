# LINE AI Chatbot — ผู้ช่วยจิราวัฒน์
โตเกียวมารีนประกันชีวิต | Next.js 14 + OpenAI GPT + LINE OA

## Tech Stack
- **Next.js 14** App Router + TypeScript
- **LINE Messaging API** (`@line/bot-sdk`)
- **OpenAI API** (GPT-5.5)
- **Google Sheet** — FAQ Database + CRM Lead Database
- **Vercel** — Serverless deployment

## Project Structure
```
app/
  api/line-webhook/route.ts   ← LINE Webhook endpoint
lib/
  openai.ts                   ← GPT integration, conversation history, timeout/retry
  sheet.ts                    ← FAQ fetch from Google Sheet CSV (cache 60s)
  prompt.ts                   ← System prompt builder with FAQ XML
  lead.ts                     ← CRM upsert via Google Apps Script
types/
  faq.ts                      ← TypeScript interfaces: FaqRow, Lead, LeadUpsert
.env.example                  ← Environment variables template
vercel.json                   ← Vercel function config (maxDuration: 30s)
```

## Environment Variables

| Variable | ที่มา |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers Console → Messaging API |
| `LINE_CHANNEL_SECRET` | LINE Developers Console → Messaging API |
| `OPENAI_API_KEY` | platform.openai.com |
| `SHEET_CSV_URL` | Google Sheet → Publish to web → CSV URL |
| `LEAD_SHEET_CSV_URL` | Google Apps Script Web App URL |

## Google Sheet Setup

### 1. FAQ Sheet
Columns (แถวแรกเป็น header):
```
category | question | answer | keyword | updated_at
```
วิธีได้ `SHEET_CSV_URL`: File → Share → Publish to web → Sheet 1 → CSV → Publish → Copy URL

### 2. CRM Lead Sheet + Google Apps Script
Columns:
```
line_user_id | display_name | real_name | phone | age | occupation |
monthly_income | tax_bracket | marital_status | children | interest |
budget_annual | product_interest | lead_status | follow_up_status |
last_question | conversation_summary | preferred_contact_time |
source | first_contact_date | last_contact_date
```

สร้าง Apps Script (Extensions → Apps Script) แนบกับ CRM Sheet:
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const userId = data.line_user_id;

  const colA = sheet.getRange('A:A').getValues().flat();
  const rowIdx = colA.indexOf(userId);

  if (rowIdx > 0) {
    headers.forEach((h, i) => {
      if (data[h] !== undefined) sheet.getRange(rowIdx + 1, i + 1).setValue(data[h]);
    });
  } else {
    const row = headers.map(h => data[h] ?? '');
    if (!row[0]) row[0] = userId;
    row[headers.indexOf('first_contact_date')] = new Date().toISOString().split('T')[0];
    sheet.appendRow(row);
  }

  return ContentService.createTextOutput('ok');
}
```
Deploy → New deployment → Web App → Execute as: Me → Who can access: Anyone → Deploy → Copy URL → ใส่ใน `LEAD_SHEET_CSV_URL`

## Local Development
```bash
cp .env.example .env.local
# กรอกค่าทุก variable ใน .env.local

npm install
npm run dev
```

## Deploy to Vercel
```bash
git add .
git commit -m "feat: LINE AI Chatbot initial setup"
git push origin main
```
1. Connect repo on vercel.com → New Project → Import
2. ตั้งค่า Environment Variables ใน Vercel Dashboard
3. ตั้ง LINE Webhook URL: `https://your-project.vercel.app/api/line-webhook`

## Production Testing Checklist
- [ ] ส่งข้อความทดสอบผ่าน LINE OA → ได้รับ reply ภายใน 5 วินาที
- [ ] ตรวจ Vercel Function Logs → token usage ถูก log ครบ
- [ ] ส่ง request ปลอม (ไม่มี signature) → ได้ HTTP 400
- [ ] ปิด SHEET_CSV_URL ชั่วคราว → ได้ default reply
- [ ] ตรวจ CRM Sheet → Lead ถูกบันทึกทุกครั้งที่มีบทสนทนา
- [ ] พิมพ์ "สนใจสมัคร" → ได้รับ handoff summary
