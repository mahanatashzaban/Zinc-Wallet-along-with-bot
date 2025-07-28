import React, { useState } from "react";

const AddBankCardModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    holderName: "",
    cardNumber: "",
    cvv2: "",
    bankName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !formData.holderName ||
      !formData.cardNumber ||
      !formData.cvv2 ||
      !formData.bankName
    ) {
      alert("لطفاً تمام فیلدها را پر کنید");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-right">
        <h2 className="text-xl font-semibold mb-4">افزودن کارت بانکی</h2>
        <div className="space-y-4">
          <input
            name="holderName"
            value={formData.holderName}
            onChange={handleChange}
            placeholder="نام دارنده حساب"
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="شماره ۱۶ رقمی کارت"
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="cvv2"
            value={formData.cvv2}
            onChange={handleChange}
            placeholder="CVV2"
            className="w-full border px-4 py-2 rounded"
          />
          <input
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="نام بانک"
            className="w-full border px-4 py-2 rounded"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-gray-600">
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            ارسال برای تایید
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBankCardModal;
