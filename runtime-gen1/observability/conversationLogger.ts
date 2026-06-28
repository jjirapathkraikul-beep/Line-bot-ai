// Conversation Logger — Beta Release Sprint
// Emits [CONV_LOG] structured JSON for every Gen1 conversation turn.
// All 26 fields from the Beta Release spec are included.
// userMessage and assistantResponse are truncated previews — no customer PII.

export interface ConversationLogEntry {
  conversationId:          string;   // conv-{userId8}-{YYYY-MM-DD} — groups daily turns per user
  sessionId:               string;   // unique per turn (contextTrace.auditId)
  timestamp:               string;   // ISO 8601
  runtimeVersion:          string;
  runtimeMode:             string;
  userId:                  string;   // masked: "Uabc1234***"
  userMessage:             string;   // first 60 chars — no PII
  assistantResponse:       string;   // first 150 chars
  latency:                 number;   // ms
  intent:                  string;
  capability:              string;
  decision:                string;
  strategy:                string;
  questionCount:           number;
  recommendationDelivered: boolean;
  educationDelivered:      boolean;
  leadCaptureStarted:      boolean;
  leadCaptureCompleted:    boolean;
  trustFlow:               boolean;
  medicalFlow:             boolean;
  formatterApplied:        boolean;
  validatorPassed:         boolean;
  fallbackUsed:            boolean;
  fallbackReason:          string | null;
  error:                   string | null;
  responseLength:          number;
}

// Derives a daily conversation ID per user — groups all turns from one user on one day.
export function buildConversationId(userId: string, timestamp: string): string {
  const masked = userId.substring(0, 8);
  const date   = timestamp.substring(0, 10); // YYYY-MM-DD
  return `conv-${masked}-${date}`;
}

// Emits the structured log entry. In production, Vercel captures this as a log line.
export function logConversationTurn(entry: ConversationLogEntry): void {
  console.log('[CONV_LOG]', JSON.stringify(entry));
}
