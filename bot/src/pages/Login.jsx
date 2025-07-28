// src/pages/Login.jsx
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

const Login = ({ onLoginSuccess }) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Login Success:", result.user);

      localStorage.setItem("isLoggedIn", "true");
      onLoginSuccess(); // notify App that login succeeded
    } catch (error) {
      console.error("❌ Login Failed:", error);
      alert("ورود با گوگل موفق نشد. لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h2 className="mb-6 text-xl font-bold">لطفاً با گوگل وارد شوید</h2>
      <button
        onClick={handleLogin}
        className="bg-[#4285F4] hover:bg-[#357ae8] text-white px-6 py-3 rounded shadow"
      >
        ورود با گوگل
      </button>
    </div>
  );
};

export default Login;
