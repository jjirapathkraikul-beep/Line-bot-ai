import type { FlexMessage } from '@line/bot-sdk';

// ─── "ประวัติ" profile card ───────────────────────────────────────────────────
// ส่งเมื่อผู้ใช้กด Rich Menu "รู้จักจิราวัฒน์" (postback data = "action=about_jirawat")
// แก้ข้อความได้ที่ไฟล์นี้โดยตรง — ไม่ต้องแตะ route.ts
//
// ถ้ามี URL รูปภาพของจิราวัฒน์ ให้เพิ่ม hero section ใน bubble ด้านล่าง:
//   hero: {
//     type: 'image',
//     url: 'https://YOUR_PUBLIC_IMAGE_URL',
//     size: 'full',
//     aspectRatio: '20:13',
//     aspectMode: 'cover',
//   } as FlexImage,

export const aboutJirawatMessage: FlexMessage = {
  type: 'flex',
  altText: 'ประวัติจิราวัฒน์ จิรพัชร์ไกรกุล — ตัวแทนประกันชีวิต โตเกียวมารีน',
  contents: {
    type: 'bubble',
    size: 'mega',

    // ── Header: ชื่อ + ตำแหน่ง ──────────────────────────────────────────────
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1B4F8A',
      paddingAll: '20px',
      paddingBottom: '18px',
      contents: [
        {
          type: 'text',
          text: 'จิราวัฒน์ จิรพัชร์ไกรกุล',
          color: '#FFFFFF',
          size: 'xl',
          weight: 'bold',
          wrap: true,
        },
        {
          type: 'text',
          text: 'ตัวแทนประกันชีวิต',
          color: '#BDD7EE',
          size: 'sm',
          margin: 'xs',
        },
        {
          type: 'text',
          text: '🏢 โตเกียวมารีนประกันชีวิต',
          color: '#FFFFFF',
          size: 'sm',
          weight: 'bold',
          margin: 'xs',
        },
      ],
    },

    // ── Body: ประวัติโดยย่อ ──────────────────────────────────────────────────
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      paddingAll: '20px',
      contents: [
        // Bio paragraph
        {
          type: 'text',
          text: 'สวัสดีครับ 👋 ผมจิราวัฒน์ ยินดีให้คำปรึกษาเรื่องการวางแผนประกันชีวิตและการเงินส่วนบุคคลครับ',
          wrap: true,
          size: 'sm',
          color: '#333333',
        },

        { type: 'separator', margin: 'lg' },

        // Key highlights
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              spacing: 'md',
              contents: [
                { type: 'text', text: '🏆', size: 'sm', flex: 0 },
                {
                  type: 'text',
                  text: 'ตัวแทนโตเกียวมารีนประกันชีวิต',
                  size: 'sm',
                  color: '#333333',
                  flex: 5,
                  wrap: true,
                  weight: 'bold',
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              spacing: 'md',
              contents: [
                { type: 'text', text: '📋', size: 'sm', flex: 0 },
                {
                  type: 'text',
                  text: 'เชี่ยวชาญประกันสุขภาพ ประกันชีวิต และการลดหย่อนภาษี',
                  size: 'sm',
                  color: '#333333',
                  flex: 5,
                  wrap: true,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              spacing: 'md',
              contents: [
                { type: 'text', text: '🤝', size: 'sm', flex: 0 },
                {
                  type: 'text',
                  text: 'ดูแลลูกค้าด้วยความจริงใจ วิเคราะห์ตรงกับความต้องการ',
                  size: 'sm',
                  color: '#333333',
                  flex: 5,
                  wrap: true,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              spacing: 'md',
              contents: [
                { type: 'text', text: '💡', size: 'sm', flex: 0 },
                {
                  type: 'text',
                  text: 'ให้คำปรึกษาฟรี ไม่มีค่าใช้จ่าย',
                  size: 'sm',
                  color: '#1B6EC2',
                  flex: 5,
                  wrap: true,
                  weight: 'bold',
                },
              ],
            },
          ],
        },

        { type: 'separator', margin: 'lg' },

        // Specialty tags
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: 'ความเชี่ยวชาญ',
              size: 'xs',
              color: '#888888',
              weight: 'bold',
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'sm',
              spacing: 'sm',
              flexWrap: true,
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#EBF3FB',
                  cornerRadius: '12px',
                  paddingAll: '5px',
                  paddingStart: '10px',
                  paddingEnd: '10px',
                  contents: [
                    { type: 'text', text: 'ประกันสุขภาพ', size: 'xs', color: '#1B4F8A' },
                  ],
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#EBF3FB',
                  cornerRadius: '12px',
                  paddingAll: '5px',
                  paddingStart: '10px',
                  paddingEnd: '10px',
                  contents: [
                    { type: 'text', text: 'ประกันชีวิต', size: 'xs', color: '#1B4F8A' },
                  ],
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#EBF3FB',
                  cornerRadius: '12px',
                  paddingAll: '5px',
                  paddingStart: '10px',
                  paddingEnd: '10px',
                  contents: [
                    { type: 'text', text: 'ลดหย่อนภาษี', size: 'xs', color: '#1B4F8A' },
                  ],
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#EBF3FB',
                  cornerRadius: '12px',
                  paddingAll: '5px',
                  paddingStart: '10px',
                  paddingEnd: '10px',
                  contents: [
                    { type: 'text', text: 'วางแผนการเงิน', size: 'xs', color: '#1B4F8A' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── Footer: CTA buttons ──────────────────────────────────────────────────
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      paddingAll: '15px',
      contents: [
        {
          type: 'button',
          action: {
            type: 'message',
            label: '💬 ปรึกษาจิราวัฒน์ฟรี',
            text: 'สนใจปรึกษาเรื่องประกันครับ',
          },
          style: 'primary',
          color: '#1B4F8A',
          height: 'sm',
        },
        {
          type: 'button',
          action: {
            type: 'message',
            label: '📋 ขอใบเสนอราคา',
            text: 'ขอใบเสนอราคาครับ',
          },
          style: 'secondary',
          height: 'sm',
        },
      ],
    },
  },
} as FlexMessage;
