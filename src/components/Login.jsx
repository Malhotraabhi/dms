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
      console.log("✅ OTP Verified, Full Response:", res);

      const { token, user_id, user_name } = res.data;

      // store token + user info in sessionStorage
      sessionStorage.setItem(
        "auth",
        JSON.stringify({
          mobile_number: mobile,
          token,
          user_id,
          user_name,
        })
      );

      // also update app state
      onLogin({ mobile_number: mobile, token, user_id, user_name });
    } else {
      setError(res.data || "Invalid OTP, try again.");
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h4 className="mb-3 text-center">Login with OTP</h4>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Enter Mobile Number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      {!otpSent ? (
        <button className="btn btn-primary w-100" onClick={handleSendOtp}>
          Send OTP
        </button>
      ) : (
        <>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="btn btn-success w-100" onClick={handleVerifyOtp}>
            Verify OTP
          </button>
        </>
      )}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default Login;
