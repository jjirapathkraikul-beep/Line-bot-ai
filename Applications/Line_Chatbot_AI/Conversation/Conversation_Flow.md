# 1. Conversation Flow

### Metadata
- Version: 1.0
- Effective Date: 2026-06-26
- Authority: Conversation Designer

## 1. Purpose
Describe canonical conversation flows for the LINE Chatbot AI.

## 2. Scope
Entry points, intent routing, key subflows (FAQ, lead capture, quote, handoff).

## 3. Inputs
- LINE webhook events
- User messages and actions
- Session state

## 4. Outputs
- Bot responses
- Lead updates
- Handoff triggers

## 5. Dependencies
- AIOS Vision, Principles, Conversation Intelligence, Decision Engine
- CRM and external integrations

## 6. Future Improvements
- Add sequence diagrams and test scripts

```mermaid
flowchart LR
  Webhook --> IntentRouter --> {FAQ|LeadCapture|Quote|Handoff}
```