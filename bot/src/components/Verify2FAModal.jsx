import React, { useState } from "react";

const Verify2FAModal = ({ onClose, onVerify }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedCode = code.replace(/\D/g, "").trim(); // digits only
    if (sanitizedCode.length < 6) {
      alert("کد ۶ رقمی معتبر وارد کنید");
      return;
    }
    onVerify(sanitizedCode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md text-right">
        <h2 className="text-xl font-bold mb-4">کد Google Authenticator را وارد کنید:</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF7A59]"
            required
            placeholder="مثلاً 123456"
          />
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF7A59] text-white rounded"
            >
              تایید
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verify2FAModal;
