import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import background from '../assets/background.png';
import bankCardImage from "../assets/mellat_bank.png";

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

const BankCard = ({ owner, number, bank }) => (
  <div style={{
    width: '300px',
    height: '180px',
    backgroundColor: '#2C3E50',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    padding: '20px',
    boxSizing: 'border-box',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div>
      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>بانک {bank}</h4>
    </div>
    <div>
      <p style={{ margin: 0 }}>شماره کارت: {number}</p>
      <p style={{ margin: 0 }}>صاحب کارت: {owner}</p>
    </div>
  </div>
);

const VerifiedBankCard = ({ owner, number, bank }) => (
  <div style={{
    width: '150px', // کاهش عرض
    height: '80px', // کاهش ارتفاع
    backgroundColor: '#2C3E50',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    padding: '10px',
    boxSizing: 'border-box',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div>
      <strong>بانک {bank}</strong>
    </div>
    <div>
      <span>شماره: {number}</span>
    </div>
    <div>
      <span>صاحب: {owner}</span>
    </div>
  </div>
);

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [targetAction, setTargetAction] = useState("");
  const [cards, setCards] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCard, setNewCard] = useState({ owner: "", number: "", cvv2: "", bank: "", expireMonth: "", expireYear: "" });
  const [loading, setLoading] = useState(true);

  // Additional states
  const [showCryptoWithdraw, setShowCryptoWithdraw] = useState(false);
  const [cryptoWithdrawData, setCryptoWithdrawData] = useState({ address: "", amount: "" });
  const [showCryptoDeposit, setShowCryptoDeposit] = useState(false);
  const [showFiatDepositModal, setShowFiatDepositModal] = useState(false);
  const [fiatDepositAmount, setFiatDepositAmount] = useState("");
  const [showFiatWithdrawPopup, setShowFiatWithdrawPopup] = useState(false);
  const [fiatWithdrawAmount, setFiatWithdrawAmount] = useState("");

  const [overlayCardInfo, setOverlayCardInfo] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchData = async () => {
      const userId = auth.currentUser.uid;
      const walletRef = doc(db, "users", userId, "wallet", "info");
      const snap = await getDoc(walletRef);
      if (snap.exists()) {
        const data = snap.data();
        setBalance(data.balance || 0);
      }

      const cardsCol = collection(db, "users", userId, "cards");
      const cardSnap = await getDocs(cardsCol);
      const cardList = cardSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(card => card.status === "approved");
      setCards(cardList);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handle2FAVerification = async (code) => {
    const user = auth.currentUser;
    if (!user) return alert("لطفاً وارد شوید");

    const res = await fetch("https://jubilant-space-disco-9755jqrvqxgwcpg49-5000.app.github.dev/api/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, token: code }),
    });
    const data = await res.json();
    if (!data.success) return alert("کد 2FA نامعتبر است");

    if (targetAction === "cryptoWithdraw") {
      await setDoc(doc(db, "users", user.uid, "wallet", "cryptoWithdraw"), {
        address: cryptoWithdrawData.address,
        amount: cryptoWithdrawData.amount,
        status: "pending",
        createdAt: new Date(),
      });
      alert("درخواست برداشت ارسال شد");
      setShowCryptoWithdraw(false);
    } else if (targetAction === "fiatWithdraw") {
      alert("برداشت وجه نقد انجام شد");
    }
    setShow2FAModal(false);
  };

  const handleAddCard = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "cards"), {
      ...newCard,
      status: "pending",
      createdAt: new Date(),
    });
    alert("کارت برای تایید ارسال شد");
    setNewCard({ owner: "", number: "", cvv2: "", bank: "", expireMonth: "", expireYear: "" });
    setShowCardModal(false);
    const cardsCol = collection(db, "users", user.uid, "cards");
    const cardSnap = await getDocs(cardsCol);
    const cardList = cardSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(card => card.status === "approved");
    setCards(cardList);
  };

  const handleDeleteCard = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "cards", id));
    setCards(cards.filter((c) => c.id !== id));
    alert("کارت بانکی با موفقیت حذف شد");
  };

  return (
<div
  style={{
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    backgroundAttachment: 'fixed', // این خط پس‌زمینه را ثابت می‌کند
  }}
>
      {/* overlay for dimming */}
      <div style={{
        position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: -1
      }} />

      {/* Main content container */}
      <div
        dir="rtl"
        className="relative z-20 p-6 max-w-3xl mx-auto"
        style={{
          fontSize: "1rem",
          lineHeight: 1.5,
          marginTop: "1rem",
          backgroundColor: 'rgba(54, 69, 79, 0.8)',
          borderRadius: '12px'
        }}
      >
        {/* عنوان و موجودی */}
        <h2 className="text-2xl font-bold mb-4 sm:text-3xl" style={{ color: '#fff' }}>کیف پول من</h2>
        <p className="text-lg mb-4 sm:text-xl" style={{ color: '#fff' }}>موجودی: {balance} تومان</p>

        {/* دکمه‌ها */}
        <div className="grid grid-cols-2 gap-4 mb-4 justify-center">
          <SvgButton
            width="100%"
            height={50}
            fill="#FF7A59"
            text="واریز وجه نقد"
            onClick={() => setShowFiatDepositModal(true)}
          />
          <SvgButton
            width="100%"
            height={50}
            fill="#FF7A59"
            text="برداشت وجه نقد"
            onClick={() => setShowFiatWithdrawPopup(true)}
          />
          <SvgButton
            width="100%"
            height={50}
            fill="#FF7A59"
            text="برداشت ارز دیجیتال"
            onClick={() => setShowCryptoWithdraw(true)}
          />
          <SvgButton
            width="100%"
            height={50}
            fill="#FF7A59"
            text="واریز ارز دیجیتال"
            onClick={() => setShowCryptoDeposit(true)}
          />
        </div>

        {/* کارت‌های بانکی */}
        <h3 className="text-lg font-semibold mt-6 mb-2 sm:text-xl" style={{ color: '#fff' }}>کارت‌های بانکی</h3>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            justifyContent: 'center',
          }}
        >
          {cards.map((card) => (
            <BankCard
              key={card.id}
              owner={card.owner}
              number={card.number}
              bank={card.bank}
            />
          ))}
        </div>

        {/* افزودن کارت */}
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <SvgButton
            width={200}
            height={50}
            fill="#FF7A59"
            text="افزودن کارت بانکی"
            onClick={() => setShowCardModal(true)}
          />
        </div>
      </div>

      {/* --- مودال‌ها --- */}

      {/* واریز وجه نقد */}
      {showFiatDepositModal && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <h4 style={{ marginBottom: '10px' }}>مقدار واریزی مورد نظر چقدر است؟</h4>
              <input
                type="number"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  marginBottom: '10px',
                  color: '#000'
                }}
                value={fiatDepositAmount}
                onChange={(e) => setFiatDepositAmount(e.target.value)}
                placeholder="مبلغ به تومان"
              />
              {/* تایید */}
              <SvgButton
                width="100%"
                height={45}
                fill="#FF7A59"
                text="تایید"
                onClick={async () => {
                  const user = auth.currentUser;
                  if (!user) return alert("لطفاً وارد شوید");
                  if (!fiatDepositAmount || isNaN(fiatDepositAmount))
                    return alert("مبلغ نامعتبر است");
                  await setDoc(doc(db, "users", user.uid, "wallet", "fiatDeposit"), {
                    amount: fiatDepositAmount,
                    status: "pending",
                    createdAt: new Date(),
                  });
                  alert("درخواست واریز ارسال شد");
                  setShowFiatDepositModal(false);
                }}
              />
              {/* بستن */}
              <SvgButton
                width="100%"
                height={45}
                fill="#aaa"
                text="بستن"
                onClick={() => setShowFiatDepositModal(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}

      {/* برداشت ارز دیجیتال */}
      {showCryptoWithdraw && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <p style={{ color: 'red', marginBottom: '10px' }}>لطفاً قبل از برداشت، ربات را غیرفعال کنید</p>
              <input
                placeholder="آدرس مقصد تتر (TRC20)"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  marginBottom: '10px',
                }}
                value={cryptoWithdrawData.address}
                onChange={(e) =>
                  setCryptoWithdrawData({ ...cryptoWithdrawData, address: e.target.value })
                }
              />
              <input
                placeholder="مقدار برداشت"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  marginBottom: '10px',
                }}
                value={cryptoWithdrawData.amount}
                onChange={(e) =>
                  setCryptoWithdrawData({ ...cryptoWithdrawData, amount: e.target.value })
                }
              />
              {/* وارد کردن 2FA */}
              <SvgButton
                width="100%"
                height={45}
                fill="#FF7A59"
                text="وارد کردن 2FA"
                onClick={() => {
                  setTargetAction("cryptoWithdraw");
                  setShow2FAModal(true);
                }}
              />
              {/* بستن */}
              <SvgButton
                width="100%"
                height={45}
                fill="#aaa"
                text="بستن"
                onClick={() => setShowCryptoWithdraw(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}

      {/* واریز ارز دیجیتال */}
      {showCryptoDeposit && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <p>🔹 ارسال تتر (TRC20) به آدرس زیر:</p>
              <div
                style={{
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  direction: 'ltr'
                }}
                onClick={() => {
                  navigator.clipboard.writeText("huyfuyjhgjbuikjbjkklhklhkn");
                  alert("آدرس کپی شد!");
                }}
              >
                huyfuyjhgjbuikjbjkklhklhkn
              </div>
              <p style={{ fontSize: '0.8rem', color: '#555' }}>تراکنش موفق را با txid ارسال کنید و منتظر تایید باشید.</p>
              {/* بستن */}
              <SvgButton
                width="100%"
                height={45}
                fill="#aaa"
                text="بستن"
                onClick={() => setShowCryptoDeposit(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}

      {/* برداشت وجه نقد (popup) */}
      {showFiatWithdrawPopup && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <h4 style={{ marginBottom: '10px' }}>مقدار برداشت</h4>
              <input
                type="number"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  marginBottom: '10px'
                }}
                value={fiatWithdrawAmount}
                onChange={(e) => setFiatWithdrawAmount(e.target.value)}
                placeholder="مبلغ به تومان"
              />
              {/* وارد کردن 2FA */}
              <SvgButton
                width="100%"
                height={45}
                fill="#FF7A59"
                text="وارد کردن 2FA"
                onClick={() => {
                  setTargetAction("fiatWithdraw");
                  setShow2FAModal(true);
                  setShowFiatWithdrawPopup(false);
                }}
              />
              {/* بستن */}
              <SvgButton
                width="100%"
                height={45}
                fill="#aaa"
                text="بستن"
                onClick={() => setShowFiatWithdrawPopup(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}

      {/* تایید 2FA */}
      {show2FAModal && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ textAlign: 'center' }}>
              <h4>کد 2FA را وارد کنید</h4>
              <input type="text" style={{ width: '80%', padding: '8px', marginBottom: '10px' }} />
              {/* تایید */}
              <SvgButton
                width="80%"
                height={40}
                fill="#FF7A59"
                text="تایید"
                onClick={() => {
                  handle2FAVerification('your-code-here');
                }}
              />
              {/* بستن */}
              <SvgButton
                width="80%"
                height={40}
                fill="#aaa"
                text="بستن"
                onClick={() => setShow2FAModal(false)}
              />
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}

      {/* افزودن کارت */}
      {showCardModal && (
        <SvgModalOverlay>
          <SvgModalBox>
            <div style={{ padding: '10px', textAlign: 'right' }}>
              <h4 style={{ marginBottom: '10px' }}>افزودن کارت</h4>
              <input
                placeholder="نام صاحب کارت"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '0px solid #ccc',
                  marginBottom: '10px',
                }}
                value={newCard.owner}
                onChange={(e) => setNewCard({ ...newCard, owner: e.target.value })}
              />
              <input
                placeholder="شماره کارت"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '0px solid #ccc',
                  marginBottom: '10px',
                }}
                value={newCard.number}
                onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
              />
              <input
                placeholder="CVV2"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '0px solid #ccc',
                  marginBottom: '10px',
                }}
                value={newCard.cvv2}
                onChange={(e) => setNewCard({ ...newCard, cvv2: e.target.value })}
              />
              <input
                placeholder="نام بانک"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '0px solid #ccc',
                  marginBottom: '10px',
                }}
                value={newCard.bank}
                onChange={(e) => setNewCard({ ...newCard, bank: e.target.value })}
              />

              {/* فرم تاریخ انقضا */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  placeholder="ماه انقضا"
                  style={{
                    flex: '1',
                    maxWidth: '100px', // کاهش عرض
                    padding: '8px',
                    borderRadius: '8px',
                    border: '0px solid #ccc',
                  }}
                  value={newCard.expireMonth}
                  onChange={(e) => setNewCard({ ...newCard, expireMonth: e.target.value })}
                />
                <input
                  placeholder="سال انقضا"
                  style={{
                    flex: '1',
                    maxWidth: '100px', // کاهش عرض
                    padding: '8px',
                    borderRadius: '8px',
                    border: '0px solid #ccc',
                  }}
                  value={newCard.expireYear}
                  onChange={(e) => setNewCard({ ...newCard, expireYear: e.target.value })}
                />
              </div>

              {/* دکمه‌های تایید و بستن */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <SvgButton
                  width="45%"
                  height={45}
                  fill="#FF7A59"
                  text="تایید و ارسال برای تایید"
                  onClick={handleAddCard}
                />
                <SvgButton
                  width="45%"
                  height={45}
                  fill="#aaa"
                  text="بستن"
                  onClick={() => setShowCardModal(false)}
                />
              </div>
            </div>
          </SvgModalBox>
        </SvgModalOverlay>
      )}
    </div>
  );
};

export default Wallet;