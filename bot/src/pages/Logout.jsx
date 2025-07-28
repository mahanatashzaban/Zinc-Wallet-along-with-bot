import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-4 h-12 w-12 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const Logout = () => {
  const [showConfirm, setShowConfirm] = useState(true);
  const [showThanks, setShowThanks] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    sessionStorage.clear();

    setShowConfirm(false);
    setShowThanks(true);

    setTimeout(() => {
      window.location.href = "/";
    }, 2500);
  };

  const handleCancel = () => {
    navigate("/about");
  };

  return (
    <div className="flex justify-center items-center h-full text-center p-4">
      {showConfirm && (
        <div className="bg-white p-6 rounded shadow max-w-sm w-full text-right" dir="rtl">
          <h2 className="text-xl font-bold mb-4">آیا برای خروج از حساب مطمئن هستید؟</h2>
          <div className="flex justify-between">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              لغو
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#FF7A59] text-white rounded hover:bg-[#e6684d] transition"
            >
              بله، خروج
            </button>
          </div>
        </div>
      )}

      {showThanks && (
        <div className="bg-white p-6 rounded shadow max-w-sm w-full" dir="rtl">
          {/* آیکون تایید در این قسمت */}
          <CheckIcon />
          <h2 className="text-xl font-bold text-[#FF7A59] mb-2">متشکریم!</h2>
          <p>به امید دیدار دوباره</p>
        </div>
      )}
    </div>
  );
};

export default Logout;