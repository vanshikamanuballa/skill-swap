import React, { useEffect, useRef } from "react";

export interface ChatMessage {
  id?: number | string;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at?: string;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  currentUserId: number;
  targetUserName: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  currentUserId,
  targetUserName
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages load/update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-body-scroll">
      {messages.length === 0 ? (
        <div className="empty-state fade-in" style={{ opacity: 1, margin: "auto" }}>
          <div className="empty-state-icon">💬</div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
            No Messages Yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Start the conversation with {targetUserName}! Say hello and schedule a swap.
          </p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isSentByMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id || index}
              className={`message-bubble-row ${isSentByMe ? "sent" : "received"}`}
            >
              <div className="message-bubble">
                <p style={{ margin: 0 }}>{msg.message}</p>
                <span className="message-time">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBox;
