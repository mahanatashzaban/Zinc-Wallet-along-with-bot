import React, { useState, useEffect, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef(null);

  const user = auth.currentUser;

  // Listen for new messages in real-time
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user) {
      alert("لطفا ابتدا وارد شوید");
      return;
    }
    if (message.trim() === "") return;

    const userName = user.displayName || "ناشناس";

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        senderName: userName,
        type: "text",
        content: message,
        timestamp: serverTimestamp(),
      });
      setMessage("");
      setShowStickers(false);
    } catch (error) {
      console.error("خطا در ارسال پیام:", error);
    }
  };

  const handleStickerClick = async (src) => {
    if (!user) {
      alert("لطفا ابتدا وارد شوید");
      return;
    }

    const userName = user.displayName || "ناشناس";

    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        senderName: userName,
        type: "sticker",
        content: src,
        timestamp: serverTimestamp(),
      });
      setShowStickers(false);
    } catch (error) {
      console.error("خطا در ارسال استیکر:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // فرض بر این است که استیکرها در پوشه public قرار دارند
  const stickerList = Array.from({ length: 36 }, (_, i) => `/emoji${i + 1}.png`);

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      {/* بخش پیام‌ها */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg max-w-xs ${
              msg.type === "text" ? "bg-blue-100" : "bg-transparent"
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">{msg.senderName || "ناشناس"}</div>
            {msg.type === "text" ? (
              <span>{msg.content}</span>
            ) : (
              <img
                src={msg.content}
                alt="sticker"
                className="w-10 h-10"
                draggable={false}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ورودی پیام و استیکر */}
      <div className="flex flex-col">
        <div className="flex gap-2 mb-2">
          <textarea
            rows={1}
            className="flex-1 p-2 rounded border border-gray-300 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="پیامتان را بنویسید..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            aria-label="ارسال پیام"
          >
            ارسال
          </button>
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="bg-yellow-400 px-3 py-2 rounded hover:bg-yellow-500"
            aria-label="نمایش استیکرها"
          >
            😊
          </button>
        </div>

        {showStickers && (
          <div className="grid grid-cols-6 gap-2 p-2 bg-white rounded shadow max-h-64 overflow-y-auto">
            {stickerList.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`sticker-${index + 1}`}
                className="w-16 h-16 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleStickerClick(src)}
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}