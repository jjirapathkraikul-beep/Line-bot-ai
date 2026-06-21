import {
  getLeadData,
  getLeadCompleteness,
  getCurrentState,
  cancelAllCapture,
  clearLeadData,
  getMissingFields,
  QUOTE_REQUIRED_FIELDS,
  FIELD_LABELS,
  type LeadField,
} from './leadCapture';

export function isAdmin(userId: string): boolean {
  const adminId = process.env.ADMIN_LINE_USER_ID;
  return !!adminId && userId === adminId;
}

export function isAdminCommand(text: string): boolean {
  return text.startsWith('#');
}

export interface AdminCommandResult {
  reply: string;
  handled: boolean;
}

export function handleAdminCommand(
  userId: string,
  text: string,
  displayName: string
): AdminCommandResult {
  const cmd = text.trim().toLowerCase().split(/\s+/)[0];
  console.log(`[Admin] command=${cmd} userId=${userId.substring(0, 8)}***`);

  switch (cmd) {
    case '#reset': {
      cancelAllCapture(userId);
      clearLeadData(userId);
      console.log(`[Admin] session reset done userId=${userId.substring(0, 8)}***`);
      return {
        reply:
          '🔄 รีเซ็ตข้อมูลการทดสอบเรียบร้อยแล้วครับ\n\n' +
          'สิ่งที่ถูกล้าง:\n' +
          '• State (phone / goal / field capture)\n' +
          '• Lead data ใน memory\n\n' +
          'พร้อมเริ่มทดสอบใหม่ครับ 🧪',
        handled: true,
      };
    }

    case '#debug': {
      const data    = getLeadData(userId);
      const { score, total, missing: missingScored } = getLeadCompleteness(userId);
      const state   = getCurrentState(userId);
      const missingQ = getMissingFields(userId, QUOTE_REQUIRED_FIELDS);

      const dataLines =
        Object.entries(data)
          .filter(([, v]) => v)
          .map(([k, v]) => `• ${FIELD_LABELS[k as LeadField] ?? k}: ${v}`)
          .join('\n') || '(ไม่มีข้อมูล)';

      const reply = [
        '🔍 Debug Info',
        '',
        `📊 Lead Score: ${score}/${total}`,
        `🔄 State: ${state}`,
        `❌ Missing scored: ${missingScored.map((f) => FIELD_LABELS[f]).join(', ') || 'none'}`,
        `❌ Missing quote:  ${missingQ.map((f) => FIELD_LABELS[f]).join(', ') || 'none'}`,
        '',
        '📋 Lead Data ใน Memory:',
        dataLines,
      ].join('\n');

      return { reply, handled: true };
    }

    case '#whoami': {
      const role = isAdmin(userId) ? '✅ Admin' : '👤 User';
      return {
        reply:
          `👤 LINE User ID:\n${userId}\n\n` +
          `Role: ${role}\n` +
          `Name: ${displayName || '-'}`,
        handled: true,
      };
    }

    case '#help': {
      return {
        reply: [
          '📋 Admin Commands',
          '',
          '#reset  — ล้าง session + lead data',
          '#debug  — แสดง state + missing fields + lead data',
          '#whoami — แสดง userId + role',
          '#help   — แสดงคำสั่งทั้งหมด',
        ].join('\n'),
        handled: true,
      };
    }

    default:
      return {
        reply: `❓ ไม่รู้จักคำสั่ง: ${cmd}\nพิมพ์ #help เพื่อดูคำสั่งที่รองรับ`,
        handled: true,
      };
  }
}
