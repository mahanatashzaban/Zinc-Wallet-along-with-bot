import React, { useState, useEffect } from "react";
import backgroundImage from "../assets/background.png";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const TicketSVG = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("لطفاً ابتدا وارد حساب کاربری شوید");

    const ticketRef = collection(db, "users", user.uid, "tickets");

    await addDoc(ticketRef, {
      ...formData,
      createdAt: serverTimestamp(),
    });

    setSubmitted(true);
    setFormData({ title: "", category: "", message: "" });
    fetchTickets();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const fetchTickets = async () => {
    if (!user) return;
    const ticketRef = collection(db, "users", user.uid, "tickets");
    const q = query(ticketRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const ticketList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTickets(ticketList);
  };

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  // Mobile adjustments
  const svgWidth = isMobile ? 360 : 700;
  const formWidth = isMobile ? 280 : 620;
  const marginX = isMobile ? 40 : 40;
  const heightOffset = 700 + tickets.length * 120;
  const fontSizeTitle = isMobile ? 16 : 20;
  const fontSizeHistory = isMobile ? 14 : 16;

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-fixed bg-center px-4 py-10"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <svg
        width={svgWidth}
        height={heightOffset}
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: 20 }}
      >
        {/* Dark Background Box */}
        <rect x="0" y="0" width={svgWidth} height="100%" rx="20" fill="#36454F" />

        {/* Title */}
        <text
          x={svgWidth / 2}
          y="40"
          fontSize={fontSizeTitle}
          fill="#fff"
          textAnchor="middle"
          fontWeight="bold"
        >
          ارسال تیکت پشتیبانی
        </text>

        {/* Form */}
        <foreignObject x={marginX} y="60" width={formWidth} height="500" required>
          <form onSubmit={handleSubmit} xmlns="http://www.w3.org/1999/xhtml">
            <div
              dir="rtl"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "14px",
                color: "#fff",
              }}
            >
              <label>
                عنوان تیکت
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="مثلاً مشکل در برداشت"
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#F3F4F6",
                    marginTop: "4px",
                  }}
                />
              </label>

              <label>
                دسته‌بندی
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#0e0e0fff",
                    marginTop: "4px",
                  }}
                >
                  <option value="">انتخاب کنید</option>
                  <option value="financial">مشکلات مالی</option>
                  <option value="technical">مشکلات فنی</option>
                  <option value="identity">احراز هویت</option>
                  <option value="other">سایر</option>
                </select>
              </label>

              <label>
                توضیحات
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="لطفاً توضیحات کامل وارد کنید..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#F3F4F6",
                    marginTop: "4px",
                    resize: "vertical",
                  }}
                />
              </label>

              <button
                type="submit"
                style={{
                  marginTop: "12px",
                  background: "#FF7A59",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ارسال تیکت
              </button>

              {submitted && (
                <p style={{ color: "lightgreen", fontWeight: "500", marginTop: "10px" }}>
                  تیکت با موفقیت ارسال شد.
                </p>
              )}
            </div>
          </form>
        </foreignObject>

        {/* Ticket History */}
        <text
          x={svgWidth / 2}
          y="580"
          fontSize={fontSizeHistory}
          fill="#fff"
          textAnchor="middle"
          fontWeight="bold"
        >
          تاریخچه تیکت‌ها
        </text>

        <foreignObject x={marginX} y="600" width={formWidth} height={tickets.length * 120}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            dir="rtl"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              color: "#fff",
            }}
          >
            {tickets.length === 0 ? (
              <p style={{ color: "#ccc", fontSize: "12px" }}>تاکنون تیکتی ثبت نشده است.</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    background: "#ffffff",
                    color: "#222",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "13px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#FF7A59" }}>
                    {ticket.title} - {ticket.category}
                  </div>
                  <div style={{ whiteSpace: "pre-line", marginTop: "5px" }}>
                    {ticket.message}
                  </div>
                  <div style={{ color: "#777", fontSize: "10px", marginTop: "5px" }}>
                    {ticket.createdAt?.toDate?.().toLocaleString() || "در حال ثبت..."}
                  </div>
                </div>
              ))
            )}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
};

export default TicketSVG;
