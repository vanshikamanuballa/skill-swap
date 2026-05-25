import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Navbar from "../components/Navbar";
import { API_BASE_URL, SOCKET_URL } from "../config";

interface ConnectionUser {
  id: number;
  name: string;
  skills_offered: string[];
  skills_wanted: string[];
  bio: string;
  profile_pic: string;
  badge: string;
}

interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string | Date;
}

function Chat() {
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ConnectionUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user and fetch connections
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserStr = localStorage.getItem("user");

    if (!token || !storedUserStr) {
      navigate("/");
      return;
    }

    const user = JSON.parse(storedUserStr);
    setCurrentUser(user);

    const socketInstance = io(SOCKET_URL);
    setSocket(socketInstance);

    const fetchConnections = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/connections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConnections(data);

          const partnerIdStr = localStorage.getItem("chatPartnerId");
          if (partnerIdStr) {
            const partnerId = parseInt(partnerIdStr, 10);
            const preselected = data.find((c: ConnectionUser) => c.id === partnerId);

            if (preselected) {
              setSelectedPartner(preselected);
            } else {
              const name = localStorage.getItem("chatPartnerName") || "User";
              const pic = localStorage.getItem("chatPartnerPic") || "";
              setSelectedPartner({
                id: partnerId,
                name,
                skills_offered: [],
                skills_wanted: [],
                bio: "",
                profile_pic: pic,
                badge: "LEARNER",
              });
            }
            localStorage.removeItem("chatPartnerId");
          } else if (data.length > 0) {
            setSelectedPartner(data[0]);
          }
        } else {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        console.error("Chat connections load error:", error);
        setErrorMsg("Failed to load connections.");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();

    return () => {
      socketInstance.disconnect();
    };
  }, [navigate]);

  // Listen for receiving messages & join rooms when partner changes
  useEffect(() => {
    if (!socket || !currentUser || !selectedPartner) return;

    const senderId = currentUser.id;
    const receiverId = selectedPartner.id;
    socket.emit("join_chat", { senderId, receiverId });

    // Fetch history
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/messages/${selectedPartner.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    fetchHistory();

    socket.off("receive_message");
    socket.on("receive_message", (newMsg: Message) => {
      const isFromCurrentOpenChat =
        (newMsg.sender_id === senderId && newMsg.receiver_id === receiverId) ||
        (newMsg.sender_id === receiverId && newMsg.receiver_id === senderId);

      if (isFromCurrentOpenChat) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, currentUser, selectedPartner]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !currentUser || !selectedPartner || messageText.trim() === "") return;

    const token = localStorage.getItem("token");


    // Note: We use the API route for sending because it saves to the DB and triggers Match.connect natively
    // The Socket broadcast can be triggered independently from backend, but the backend is currently designed 
    // such that you just send via Socket directly... Wait, in chatSocket.js we have:
    // socket.on("send_message", async (data) => { Message.create(...); io.to(...).emit("receive_message") });
    // So if we emit "send_message", it will save and broadcast.
    // If we use the REST API, it saves but DOESN'T broadcast in the current messageController implementation!
    // So we should stick to socket.emit for real-time.
    // Wait, the prompt asked to create `/api/messages/send`, which we did, but to make real-time work, socket is better.
    // So let's emit socket, but ALSO fetch the connect API just to make sure they are connected if it's the first message.
    
    try {
      await fetch(`${API_BASE_URL}/api/matches/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId: selectedPartner.id }),
      });
    } catch (e) {}

    socket.emit("send_message", {
      senderId: currentUser.id,
      receiverId: selectedPartner.id,
      message: messageText.trim(),
    });
    
    setMessageText("");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>Connection Error</h2>
          <p>{errorMsg}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page-layout">
      <Navbar />

      <main className="chat-content-area">
        <div className="glass-card chat-messenger-container">
          {/* Chat Sidebar */}
          <div className="chat-sidebar">
            <div className="sidebar-header">
              <h3>Connections</h3>
              <span className="connections-count">{connections.length} active</span>
            </div>

            <div className="sidebar-list">
              {connections.length === 0 ? (
                <div className="sidebar-empty">
                  <p>No connections yet.</p>
                  <button
                    onClick={() => navigate("/matches")}
                    className="action-btn primary-btn btn-sm"
                  >
                    Find Matches
                  </button>
                </div>
              ) : (
                connections.map((c) => (
                  <div
                    key={c.id}
                    className={`sidebar-item ${selectedPartner?.id === c.id ? "active" : ""}`}
                    onClick={() => setSelectedPartner(c)}
                  >
                    <img
                      src={
                        c.profile_pic ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                      }
                      alt={c.name}
                      className="contact-avatar"
                    />
                    <div className="contact-details">
                      <div className="contact-name-row">
                        <h4>{c.name}</h4>
                        <span className={`badge ${c.badge.toLowerCase()}`}>{c.badge}</span>
                      </div>
                      <p className="contact-skill">Teaches: {c.skills_offered?.join(", ") || "Nothing yet"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages Panel */}
          <div className="chat-messages-panel">
            {selectedPartner ? (
              <>
                <div className="chat-partner-header">
                  <div className="partner-avatar-info">
                    <img
                      src={
                        selectedPartner.profile_pic ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                      }
                      alt={selectedPartner.name}
                      className="partner-header-avatar"
                    />
                    <div className="partner-header-text">
                      <h3>{selectedPartner.name}</h3>
                      <p className="partner-skill-subtitle">
                        Teaches: {selectedPartner.skills_offered?.join(", ") || "Not specified"} | Learns:{" "}
                        {selectedPartner.skills_wanted?.join(", ") || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="chat-body-messages">
                  {messages.length === 0 ? (
                    <div className="messages-empty-state">
                      <span className="wave-hand">👋</span>
                      <h4>Start the conversation!</h4>
                      <p>Send a message to introduce yourself and plan your first swap session.</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      return (
                        <div
                          key={index}
                          className={`message-bubble-wrapper ${isMe ? "sent" : "received"}`}
                        >
                          <div className={`message-bubble ${isMe ? "sent" : "received"}`}>
                            <p className="text">{msg.message}</p>
                            <span className="timestamp">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="chat-input-footer">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                  />
                  <button type="submit" className="send-message-btn">
                    Send 🚀
                  </button>
                </form>
              </>
            ) : (
               <div className="chat-empty-panel">
                 <span className="chat-empty-icon">💬</span>
                 <h3>No Chat Selected</h3>
                 <p>Select a contact from the sidebar or find skill matches to start swapping knowledge.</p>
                 <button onClick={() => navigate("/matches")} className="action-btn primary-btn">
                   Browse Matches
                 </button>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;