import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Identity = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const idInputRef = useRef(null);
  const selfieInputRef = useRef(null);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const identityRef = doc(db, "users", user.uid, "identity", "info");
    const unsubscribe = onSnapshot(identityRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStatus(data.status || "pending");
        setName(data.fullName || "");
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return alert("لطفاً وارد شوید");
    if (!name || !idImage || !selfieImage)
      return alert("");

    setLoading(true);
    try {
      const idBase64 = await fileToBase64(idImage);
      const selfieBase64 = await fileToBase64(selfieImage);
      const identityRef = doc(db, "users", user.uid, "identity", "info");
      await setDoc(identityRef, {
        fullName: name,
        idCardBase64: idBase64,
        selfieBase64: selfieBase64,
        status: "pending",
        timestamp: Date.now(),
      });
      setStatus("pending");
      alert("اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      console.error("Error:", err);
      alert("خطا در ذخیره اطلاعات");
    }
    setLoading(false);
  };

  const width = 1300; // عرض خیلی بزرگ
  const height = 1700; // ارتفاع خیلی بزرگ

  return (
    <svg
      width="100%"
      height="100vh"
      viewBox={`0 0 ${width} ${height}`}
      style={{
        backgroundImage: `url(/workspaces/SQL-Injec-Checker/bot/src/assets/background.png)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        fontFamily: "Vazirmatn, Vazirmatn, Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* جعبه تیره بسیار بزرگ */}
      <rect
        x={width * 0.02}
        y={height * 0.02}
        width={width * 0.96}
        height={height * 1.4}
        fill="#36454F"
        rx={20}
        ry={20}
      />

      {/* عنوان */}
      <text
        x={width / 2}
        y={height * 0.07}
        fill="#fff"
        fontSize={57}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="Vazirmatn"
      >
        فرم احراز هویت
      </text>

      {/* ورودی نام */}
      <foreignObject
        x={width * 0.1}
        y={height * 0.12}
        width={width * 0.8}
        height={120}
      >
        <input
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            padding: "30px",
            fontSize: "55px",
            borderRadius: "8px",
            boxSizing: "border-box",
            fontFamily: "Vazirmatn",
          }}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام و نام خانوادگی"
          disabled={status === "pending" || status === "approved"}
        />
      </foreignObject>

      {/* آپلود کارت شناسایی */}
      <g
        style={{ cursor: "pointer" }}
        onClick={() => idInputRef.current.click()}
      >
        <rect
          x={width * 0.1}
          y={height * 0.22}
          width={width * 0.8}
          height={120}
          fill="#fff"
          rx={12}
          ry={12}
        />
        <text
          x={width / 2}
          y={height * 0.22 + 70}
          fill="#222"
          fontSize={55}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: "Vazirmatn" }}
        >
          بارگذاری تصویر کارت
        </text>
        <foreignObject
          x={width * 0.1}
          y={height * 0.22}
          width={width * 0.8}
          height={120}
        >
          <input
            ref={idInputRef}
            type="file"
            accept="image/*"
            style={{
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setIdImage(e.target.files[0]);
              }
            }}
            disabled={status === "pending" || status === "approved"}
          />
        </foreignObject>
      </g>

      {/* آپلود سلفی */}
      <g
        style={{ cursor: "pointer" }}
        onClick={() => selfieInputRef.current.click()}
      >
        <rect
          x={width * 0.1}
          y={height * 0.36}
          width={width * 0.8}
          height={120}
          fill="#fff"
          rx={12}
          ry={12}
        />
        <text
          x={width / 2}
          y={height * 0.36 + 70}
          fill="#222"
          fontSize={55}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: "Vazirmatn" }}
        >
          بارگذاری تصویر سلفی
        </text>
        <foreignObject
          x={width * 0.1}
          y={height * 0.36}
          width={width * 0.8}
          height={120}
        >
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            style={{
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelfieImage(e.target.files[0]);
              }
            }}
            disabled={status === "pending" || status === "approved"}
          />
        </foreignObject>
      </g>

      {/* دکمه ارسال */}
      <g
        style={{ cursor: "pointer" }}
        onClick={handleSubmit}
      >
        <rect
          x={width * 0.2}
          y={height * 0.52}
          width={width * 0.6}
          height={120}
          fill={
            loading || status === "pending" || status === "approved"
              ? "#999"
              : "#FF7A59"
          }
          rx={12}
          ry={12}
        />
        <text
          x={width / 2}
          y={height * 0.52 + 60}
          fill="#fff"
          fontSize={55}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: "Vazirmatn" }}
        >
          {loading ? "در حال ارسال..." : "ارسال برای بررسی"}
        </text>
      </g>

      {/* وضعیت */}
      <rect
        x={width * 0.05}
        y={height * 0.68}
        width={width * 0.9}
        height={height * 0.3}
        fill="#fff"
        rx={15}
        ry={15}
        stroke="#ccc"
        strokeWidth={1}
      />
      <text
        x={width / 2}
        y={height * 0.72}
        fill="#36454F"
        fontSize={40}
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="Vazirmatn"
      >
        وضعیت احراز هویت:
      </text>
      {status === "pending" && (
        <text
          x={width / 2}
          y={height * 0.8}
          fill="#FFCC00"
          fontSize={32}
          fontWeight="bold"
          textAnchor="middle"
        >
          در حال تایید مدارک هویتی
        </text>
      )}
      {status === "approved" && (
        <text
          x={width / 2}
          y={height * 0.8}
          fill="#008000"
          fontSize={55}
          fontWeight="bold"
          textAnchor="middle"
        >
          احراز هویت با موفقیت انجام شد
        </text>
      )}
      {status === "rejected" && (
        <text
          x={width / 2}
          y={height * 0.8}
          fill="#FF0000"
          fontSize={52}
          fontWeight="bold"
          textAnchor="middle"
        >
          رد شده - لطفاً مجدداً تلاش کنید
        </text>
      )}
      {!status && (
        <text
          x={width / 2}
          y={height * 0.8}
          fill="#888"
          fontSize={52}
          fontWeight="bold"
          textAnchor="middle"
        >
          مدارکی ارسال نشده است
        </text>
      )}
    </svg>
  );
};

export default Identity;