import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";

const SvgButton = ({ width = 200, height = 50, fill = "#FF7A59", text = "Button", onClick }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 200 50"
    style={{ cursor: 'pointer' }}
    onClick={onClick}
  >
    <rect
      width="100%"
      height="100%"
      rx="8"
      fill={fill}
      style={{ transition: 'fill 0.3s' }}
    />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="#fff"
      fontSize="1rem"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {text}
    </text>
  </svg>
);

const SvgModalOverlay = ({ children }) => (
  <div style={{
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30
  }}>
    {children}
  </div>
);

const SvgModalBox = ({ children, style }) => (
  <div style={{
    width: '90%',
    maxWidth: '400px',
    backgroundColor: '#36454F',
    borderRadius: '12px',
    padding: '20px',
    boxSizing: 'border-box',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    ...style
  }}>
    {children}
  </div>
);

const WalletSwapPage = () => {
  const [zincBalance, setZincBalance] = useState(0);
  const [usdtInAccount, setUsdtInAccount] = useState(0);
  const [swapAmount, setSwapAmount] = useState('');
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoPosition, setLogoPosition] = useState(0); // 0 center, 1 top
  const [logoVisible, setLogoVisible] = useState(true);
  const logoRef = useRef();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [swapDirection, setSwapDirection] = useState("deposit"); // or "withdraw"

  const intervalRef = useRef();

  const userId = auth.currentUser?.uid;

  // بارگذاری داده‌های اولیه
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setZincBalance(data.zincBalance || 0);
        setUsdtInAccount(data.usdt || 0);
      } else {
        await setDoc(userRef, { zincBalance: 0, usdt: 0 });
        setZincBalance(0);
        setUsdtInAccount(0);
      }
      const historyCol = collection(db, "users", userId, "swapHistory");
      const historySnap = await getDocs(historyCol);
      const history = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSwapHistory(history);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  // هر ثانیه 1 Zinc اضافه می‌شود و در Firebase ذخیره می‌شود
  useEffect(() => {
    if (!userId) return;
    intervalRef.current = setInterval(async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const newZinc = (currentData.zincBalance || 0) + 1;
        await updateDoc(userRef, { zincBalance: newZinc });
        setZincBalance(newZinc);
      }
    }, 1000); // هر ثانیه
    return () => clearInterval(intervalRef.current);
  }, [userId]);

  // انیمیشن لوگو
  useEffect(() => {
    setLogoPosition(0);
    setTimeout(() => {
      setLogoPosition(1);
    }, 3000);
  }, []);

  useEffect(() => {
    if (logoPosition === 1) {
      setTimeout(() => {
        setLogoVisible(false);
      }, 2000);
    }
  }, [logoPosition]);

  // عملیات swap
  const handleSwap = async () => {
    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0 || amount > usdtInAccount) {
      alert("مقدار معتبر وارد کنید");
      return;
    }
    const zincAmount = amount * 1000000;
    const newUsdt = usdtInAccount - amount;
    const newZinc = zincBalance + zincAmount;

    setUsdtInAccount(newUsdt);
    setZincBalance(newZinc);

    if (userId) {
      await updateDoc(doc(db, "users", userId), {
        usdt: newUsdt,
        zincBalance: newZinc,
      });
      await addDoc(collection(db, "users", userId, "swapHistory"), {
        type: "deposit",
        amount: amount,
        zincAmount: zincAmount,
        date: new Date(),
      });
    }
    setSwapHistory(prev => [
      ...prev,
      {
        id: Date.now(),
        type: "deposit",
        amount: amount,
        zincAmount: zincAmount,
        date: new Date(),
      },
    ]);
    setSwapAmount('');
  };

  const handleWithdrawZinc = async () => {
    const amount = parseFloat(swapAmount);
    if (isNaN(amount) || amount <= 0 || amount > zincBalance) {
      alert("مقدار معتبر وارد کنید");
      return;
    }
    const usdtEquivalent = amount / 1000000;
    const newZinc = zincBalance - amount;
    const newUsdt = usdtInAccount + usdtEquivalent;

    setZincBalance(newZinc);
    setUsdtInAccount(newUsdt);

    if (userId) {
      await updateDoc(doc(db, "users", userId), {
        usdt: newUsdt,
        zincBalance: newZinc,
      });
      await addDoc(collection(db, "users", userId, "swapHistory"), {
        type: "withdraw",
        amount: usdtEquivalent,
        zincAmount: amount,
        date: new Date(),
      });
    }
    setSwapHistory(prev => [
      ...prev,
      {
        id: Date.now(),
        type: "withdraw",
        amount: usdtEquivalent,
        zincAmount: amount,
        date: new Date(),
      },
    ]);
    setSwapAmount('');
  };

  return (
    <div style={{
      backgroundColor: '#222',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* لوگو */}
      {logoVisible && (
        <div
          style={{
            position: 'absolute',
            top: logoPosition === 0 ? '50%' : '10px',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'top 2s',
            zIndex: 50
          }}
        >
          <img src="/assets/logo192.png" alt="Logo" style={{ width: '100px' }} />
        </div>
      )}

      {/* موجودی Zinc */}
      <h2 style={{ textAlign: 'center', color: '#fff', marginBottom: '20px' }}>Zinc موجودی: {zincBalance} </h2>

      {/* دکمه‌های عملیات */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
        <SvgButton
          width={150}
          height={50}
          fill="#FF7A59"
          text="Zinc برداشت"
          onClick={() => setShowWithdrawModal(true)}
        />
        <SvgButton
          width={150}
          height={50}
          fill="#FF7A59"
          text="Zinc واریز"
          onClick={() => setShowDepositModal(true)}
        />
      </div>

      {/* بخش عملیات */}
      <div style={{
        backgroundColor: '#36454F',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '600px',
        margin: '0 auto',
        color: '#000'
      }}>
        {/* ورودی مقدار */}
        <input
          type="number"
          placeholder={swapDirection === "deposit" ? "مقدار USDT" : "مقدار Zinc"}
          value={swapAmount}
          onChange={(e) => setSwapAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            marginBottom: '10px'
          }}
        />
        {/* دکمه‌های تغییر جهت */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px' }}>
          <SvgButton
            width={150}
            height={40}
            fill={swapDirection === 'deposit' ? '#FF7A59' : '#888'}
            text="USDT به Zinc"
            onClick={() => setSwapDirection('deposit')}
          />
          <SvgButton
            width={150}
            height={40}
            fill={swapDirection === 'withdraw' ? '#FF7A59' : '#888'}
            text="Zinc به USDT"
            onClick={() => setSwapDirection('withdraw')}
          />
        </div>
        {/* عملیات */}
        <SvgButton
          width="100%"
          height={45}
          fill="#FF7A59"
          text="انجام عملیات"
          onClick={swapDirection === 'deposit' ? handleSwap : handleWithdrawZinc}
        />
      </div>

      {/* موجودی‌ها */}
      <div style={{ marginTop: '20px', color: '#fff', maxWidth: '600px', margin: 'auto' }}>
        <p>USDT موجودی: {usdtInAccount}</p>
        <p>Zinc موجودی: {zincBalance}</p>
      </div>

      {/* تاریخچه */}
      <div style={{
        marginTop: '30px',
        maxWidth: '600px',
        margin: 'auto',
        backgroundColor: '#444',
        padding: '10px',
        borderRadius: '8px',
        color: '#fff',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <h3>تاریخچه swap</h3>
        {swapHistory.map((item) => (
          <div key={item.id} style={{ marginBottom: '8px' }}>
            <div>نوع: {item.type}</div>
            <div>مقدار USDT: {item.amount}</div>
            <div>مقدار Zinc: {item.zincAmount}</div>
            <div>تاریخ: {item.date.toDate().toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* مودال Zinc واریزی */}
      {showDepositModal && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <h4>مقدار Zinc واریزی</h4>
              <input
                type="number"
                placeholder="مقدار Zinc"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  marginBottom: '10px'
                }}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value);
                  if (isNaN(amount)) return;
                  // اضافه کردن Zinc به موجودی در Firebase
                  setZincBalance(prev => {
                    const newBalance = prev + amount;
                    if (userId) {
                      updateDoc(doc(db, "users", userId), { zincBalance: newBalance });
                    }
                    return newBalance;
                  });
                }}
              />
              <SvgButton
                width="100%"
                height={45}
                fill="#aaa"
                text="بستن"
                onClick={() => setShowDepositModal(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}

      {/* مودال Zinc برداشت */}
      {showWithdrawModal && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <h4>مقدار Zinc برای برداشت</h4>
              <input
                type="number"
                placeholder="مقدار Zinc"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  marginBottom: '10px'
                }}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value);
                  if (isNaN(amount) || amount > zincBalance) {
                    alert("مقدار نامعتبر");
                    return;
                  }
                  // کم کردن Zinc از موجودی در Firebase
                  setZincBalance(prev => {
                    const newBalance = prev - amount;
                    if (userId) {
                      updateDoc(doc(db, "users", userId), { zincBalance: newBalance });
                    }
                    return newBalance;
                  });
                }}
              />
              <SvgButton
                width="100%"
                height={45}
                fill="#aaa"
                text="بستن"
                onClick={() => setShowWithdrawModal(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}
    </div>
  );
};

export default WalletSwapPage;