# 1. Conversation State

### Metadata
- Version: 1.0
- Effective Date: 2026-06-26

## 1. Purpose
Document the session model and state transitions used by the LINE chatbot.

## 2. Scope
Session keys, timeouts, persistence options (KV, in-memory), and state machine.

## 3. Inputs
- Incoming events
- Persisted session data

## 4. Outputs
- Updated session state
- Actions and responses

## 5. Dependencies
- Vercel KV or fallback store
- Conversation Flow

## 6. Future Improvements
- Standardize event schema and state snapshots
