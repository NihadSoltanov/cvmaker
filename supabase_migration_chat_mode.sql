-- Add chat_mode column to support_messages
-- 'ai'    = user talking to the AI bot (admin does NOT see these)
-- 'human' = user escalated to human support (admin sees these)
ALTER TABLE support_messages
  ADD COLUMN IF NOT EXISTS chat_mode TEXT NOT NULL DEFAULT 'human';

-- Back-fill: messages from AI sender are clearly AI-mode
UPDATE support_messages SET chat_mode = 'ai' WHERE sender = 'ai';

-- Index for admin inbox filter
CREATE INDEX IF NOT EXISTS idx_support_messages_chat_mode
  ON support_messages (user_id, chat_mode, created_at);
