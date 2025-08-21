import React, { useState } from "react";
import { sendOtp, verifyOtp } from "../services/api";
import "../styles/custom.css";

const Login = ({ onLogin }) => {
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    const res = await sendOtp(mobile);
    if (res.status) {
      setOtpSent(true);
      setError("");
    } else {
      setError(res.data || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const res = await verifyOtp(mobile, otp);
    if (res.status) {
      const { token, user_id, user_name } = res.data;

      sessionStorage.setItem(
        "auth",
        JSON.stringify({ mobile_number: mobile, token, user_id, user_name })
      );

      onLogin({ mobile_number: mobile, token, user_id, user_name });
    } else {
      setError(res.data || "Invalid OTP, try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card shadow-lg">
        <h2 className="text-center text-gradient mb-2">Welcome Back 👋</h2>
        <p className="text-center text-muted mb-4">
          Sign in with your mobile number to continue
        </p>

        <input
          type="text"
          className="form-control input-animated mb-3"
          placeholder="📱 Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        {!otpSent ? (
          <button
            className="btn btn-gradient w-100 mb-3"
            onClick={handleSendOtp}
          >
            Send OTP
          </button>
        ) : (
          <>
            <input
              type="text"
              className="form-control input-animated mb-3"
              placeholder="🔑 Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="btn btn-gradient w-100 mb-3"
              onClick={handleVerifyOtp}
            >
              Verify OTP ✅
            </button>
          </>
        )}

        {error && <p className="text-danger text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
