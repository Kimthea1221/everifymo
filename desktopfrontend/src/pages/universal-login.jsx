import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Users, ShieldCheck } from 'lucide-react'
import FDALogo from '../images/FDA.png'
import PNPLogo from '../images/pnp-cidg.jpg'

// ============================================================================
// ⚠️ MOCKUP FILE — FRONTEND ONLY
// This file does NOT call any real backend endpoint. All "login"/"OTP" flows
// below are simulated with setTimeout so the UI can be tested standalone.
// Do not wire this into the existing /auth/login, /auth/verify-otp, or
// /auth/superadmin/* endpoints until this is reviewed and approved.
// ============================================================================

function UniversalLogin() {
  const navigate = useNavigate();

  // Which tab is active: 'personnel' | 'superadmin'
  const [activeTab, setActiveTab] = useState('personnel');

  function handleTabSwitch(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
  }

  return (
    <div>
      <div className="LoginPage">
        <div className="LoginGlassContainer">
          {/* LEFT PANEL — shared, stays the same regardless of tab */}
          <div className="LeftPanel">
            <div className="Agency AgencyTop">
              <img src={FDALogo} alt="FDA AGENCY LOGO" className="FdaLogo" />
              <div>
                <p>REPUBLIC OF THE PHILIPPINES</p>
                <h3>FOOD AND DRUGS ADMINISTRATION</h3>
              </div>
            </div>

            <div className="Hero">
              <h1>WELCOME! <br /></h1>
              <h4>
                This is Interagency <span>Complaint Management </span> <br />
                System Desktop Application (<span>ICMDA</span>)
              </h4>
            </div>

            <div className="Agency AgencyBottom">
              <img src={PNPLogo} alt="PNP-CIDG AGENCY LOGO" />
              <div>
                <p>REPUBLIC OF THE PHILIPPINES</p>
                <h3>CRIMINAL INVESTIGATION AND DETECTION GROUP</h3>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — tabs + white card */}
          <div className="UniversalRightWrapper">
            <div className="UniversalTabsColumn">
              <button
                type="button"
                className={`UniversalTabBtn ${activeTab === 'personnel' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('personnel')}
              >
                <Users size={16} />
                <span>Personnel</span>
              </button>
              <button
                type="button"
                className={`UniversalTabBtn ${activeTab === 'superadmin' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('superadmin')}
              >
                <ShieldCheck size={16} />
                <span>Super Admin</span>
              </button>
            </div>

            <div className="UniversalRightPanel">
              {activeTab === 'personnel' ? (
                <PersonnelLoginForm navigate={navigate} />
              ) : (
                <SuperAdminLoginForm navigate={navigate} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* STYLES — combined from login-user.jsx (App.css) + superadmin-login.jsx (superadmin-css.css) */}
      {/* plus new Universal-* classes for the tab mechanism */}
      {/* ================================================================== */}
      <style>{`
        * { padding: 0; margin: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; }

        /* ===== LOGIN PAGE / GLASS CONTAINER (from App.css) ===== */
        .LoginPage {
          background-color: #1D3439;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 24px;
          color: #fdfdfd;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .LoginGlassContainer {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: stretch;
          width: min(88vw, 1320px);
          min-height: 560px;
          background: rgba(253, 253, 253, 0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 48px 56px;
          gap: 72px;
          box-sizing: border-box;
        }

        .LeftPanel {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px 0;
          gap: 24px;
        }

        .Agency { display: flex; align-items: center; gap: 16px; flex-direction: row; }
        .Agency img {
          width: 56px; height: 56px; object-fit: contain; border-radius: 50%;
          background: rgba(255, 255, 255, 0.95); padding: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); flex-shrink: 0;
        }
        .AgencyTop img, .FdaLogo { width: 60px; height: 60px; }
        .Agency h3 { color: #ffffff; font-size: 0.95rem; font-weight: 600; letter-spacing: 0.3px; line-height: 1.3; }
        .Agency p {
          color: rgba(255, 255, 255, 0.75); font-size: 11px; font-weight: 600;
          letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 3px;
        }

        .Hero { margin: 16px 0; text-align: center; }
        .Hero h1 {
          font-size: clamp(1.5rem, 2.5vw, 2.9rem); line-height: 1.15;
          font-weight: 700; color: #ffffff; letter-spacing: -0.5px;
        }
        .Hero span { color: #f7931a; }
        .Hero h4 { font-size: 1.5rem; color: rgba(255, 255, 255, 0.8); font-weight: 600; margin-top: 12px; }

        /* ===== TAB MECHANISM (new) ===== */
        .UniversalRightWrapper {
          position: relative;
          display: flex;
          align-items: stretch;
          flex-shrink: 0;
        }

        .UniversalTabsColumn {
          display: flex;
          flex-direction: column;
          gap: 14px;
          justify-content: center;
          margin-right: -1px;
          z-index: 2;
        }

        .UniversalTabBtn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          width: 76px;
          padding: 16px 8px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-right: none;
          border-radius: 12px 0 0 12px;
          background: rgba(253, 253, 253, 0.07);
          color: rgba(253, 253, 253, 0.75);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .UniversalTabBtn:hover:not(.active) {
          background: rgba(253, 253, 253, 0.14);
          color: #ffffff;
        }

        .UniversalTabBtn.active {
          background: #ffffff;
          color: #0f172a;
          border-color: #ffffff;
          box-shadow: -4px 0 14px rgba(0, 0, 0, 0.15);
        }

        .UniversalTabBtn.active svg { color: #1D3439; }

        .UniversalRightPanel {
          width: 100%;
          max-width: 480px;
          min-height: 580px;
          background: #ffffff;
          padding: 44px 40px;
          border-radius: 16px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          flex-shrink: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        /* ===== PERSONNEL FORM (unchanged classnames from login-user.jsx) ===== */
        .RightPanel h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.3px; }
        .RightPanel small {
          display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
          text-transform: uppercase; color: #64748b; margin-bottom: 6px;
        }
        .RightPanel p { font-size: 13px; color: #64748b; margin-top: 0; margin-bottom: 24px; }

        .LoginForm { display: flex; flex-direction: column; }
        .LoginForm label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .LoginForm input { width: 100%; padding: 10px; margin-bottom: 25px !important; border: 1px solid #ccc; border-radius: 5px; }
        .LoginForm input:focus { border-color: #f7931a; outline: none; }
        .LoginForm span { color: #ef4444; }

        .AgencyButtons input[type="radio"] { display: none; }
        .AgencyButtons label { color: #334155; font-weight: 600; }
        .AgencyButtons { display: flex; gap: 12px; margin-top: 4px; margin-bottom: 18px; flex-direction: row; justify-content: center; }

        .InterButtons {
          flex: 1; padding: 11px 16px; border: 2px solid #e2e8f0; border-radius: 8px;
          cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s ease;
          text-align: center; display: inline-flex; align-items: center; justify-content: center;
          background: #f8fafc; color: #334155;
        }
        .AgencyButtonFDA { background: #f8fafc; border-color: #e2e8f0; }
        .AgencyButtonFDA:hover { border-color: #1b4322; background: #1b4322; color: #fdfdfd; }
        .AgencyButtonCIDG { background: #f8fafc; border-color: #e2e8f0; }
        .AgencyButtonCIDG:hover { background: #1f2937; border-color: #1f2937; color: #fdfdfd; }
        input[type="radio"]#fda:checked + label {
          border-color: #2d6c39; background: #2d6c39; color: #fff;
          box-shadow: 0 4px 12px rgba(45, 108, 57, 0.25); transform: translateY(-1px);
        }
        input[type="radio"]#cidg:checked + label {
          border-color: #1f2937; background: #1f2937; color: #fff;
          box-shadow: 0 4px 12px rgba(31, 41, 55, 0.25); transform: translateY(-1px);
        }

        .RememberMe { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 22px; }
        .RememberMe label { display: inline-flex !important; align-items: center !important; gap: 8px; margin: 0 !important; font-size: 13px; color: #475569; cursor: pointer; }
        .RememberMe input[type="checkbox"] { width: 16px !important; height: 16px !important; margin: 0 !important; cursor: pointer; accent-color: #1e293b; }
        .ForgetPass { color: #f7931a; font-size: 13px; font-weight: 500; text-align: right; margin: 0 !important; }
        .ForgetPass a { color: #f7931a; text-decoration: none; }
        .ForgetPass:hover { text-decoration: underline; cursor: pointer; }

        .LoginErrorMsgContainer {
          background-color: #fef2f2; border: 1px solid #fca5a5; padding: 10px 14px;
          border-radius: 8px; margin-bottom: 18px; display: flex; align-items: center; justify-content: center;
        }
        .LoginErrorMsg { color: #dc2626 !important; font-size: 13px; font-weight: 500; text-align: center; margin: 0 !important; }

        .LoginButton {
          width: 100%; margin-top: 10px; padding: 12px; background: #1D3439; color: #fff;
          font-size: 15px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;
          transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);
        }
        .LoginButton:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.3); }

        .OtpContainer { display: flex; flex-direction: column; animation: fadeIn 0.4s ease-out forwards; }
        .OtpInstructions { font-size: 13px; color: #475569; margin-bottom: 20px; line-height: 1.5; text-align: center; }
        .OtpInstructions span { font-weight: 600; color: #0f172a; }
        .LoginOtpInputGrid { display: flex; gap: 8px; justify-content: space-between; margin-bottom: 20px; }
        .LoginOtpDigitInput {
          width: 44px; height: 48px; text-align: center; font-size: 20px; font-weight: 600;
          border-radius: 8px; border: 1.5px solid #cbd5e1 !important; background-color: #ffffff;
          color: #0f172a; transition: all 0.2s ease; margin-bottom: 0 !important;
        }
        .LoginOtpDigitInput:focus { border-color: #f7931a !important; box-shadow: 0 0 0 3px rgba(247, 147, 26, 0.2); outline: none; }
        .LoginOtpTimerContainer { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 13px; color: #64748b; }
        .LoginResendButton { background: none; border: none; color: #f7931a; font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline; }
        .LoginResendButton:disabled { color: #94a3b8; cursor: not-allowed; text-decoration: none; }
        .LoginBackToLoginBtn {
          background: none; border: none; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px;
        }
        .LoginBackToLoginBtn:hover { color: #0f172a; text-decoration: underline; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .LoginInputWrapper { position: relative; display: flex; align-items: center; width: 100%; margin-bottom: 20px; }
        .LoginInputWrapper input {
          width: 100%; padding: 11px 12px 11px 40px !important; margin-bottom: 0 !important;
          border: 1px solid #ccc; border-radius: 5px; font-size: 14px; background: #ffffff; outline: none; transition: all 0.2s ease;
        }
        .LoginInputWrapper input:focus { border-color: #f7931a; }

        .PasswordInputWrapper { position: relative; display: flex; align-items: center; width: 100%; margin-bottom: 20px; }
        .PasswordInputWrapper input {
          width: 100%; padding: 11px 45px 11px 40px !important; margin-bottom: 0 !important;
          border: 1px solid #ccc; border-radius: 5px; font-size: 14px; background: #ffffff; outline: none; transition: all 0.2s ease;
        }
        .PasswordInputWrapper input:focus { border-color: #f7931a; }

        .LoginInputIcon { position: absolute; left: 14px; color: #94a3b8; pointer-events: none; display: flex; align-items: center; justify-content: center; }
        .TogglePasswordBtn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: transparent;
          border: none; color: #94a3b8; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; transition: color 0.15s ease;
        }
        .TogglePasswordBtn:hover { color: #f7931a; }

        .LoginFieldError { font-size: 12px; color: #ef4444 !important; margin-top: -14px !important; margin-bottom: 20px; display: flex; align-items: center; gap: 4px; }

        /* ===== SUPER ADMIN FORM (unchanged classnames from superadmin-login.jsx) ===== */
        .AdminLoginform { display: flex; flex-direction: column; }
        .AdminLoginform label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }

        .AdminLoginHeader { display: flex; flex-direction: column; margin-bottom: 10px; }
        .AdminLoginHeader small {
          display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
          text-transform: uppercase; color: #64748b; margin-bottom: 6px;
        }
        .AdminLoginHeader h2 { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 6px; letter-spacing: -0.3px; }

        .AdminLoginHeader_otp { width: 100%; box-sizing: border-box; text-align: center; margin-bottom: 12px; }
        .AdminLoginHeader_otp h3 { font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: 0.3px; margin: 0; }
        .AdminLoginHeader_otp p { font-family: 'Poppins', sans-serif; font-size: 14px; color: #64748b; margin: 8px 0 0 0; }

        .AdminLoginInputWrapper { position: relative; display: flex; align-items: center; width: 100%; margin-bottom: 10px; }
        .AdminLoginInputIcon { position: absolute; left: 14px; color: #94a3b8; pointer-events: none; display: flex; align-items: center; justify-content: center; }
        .AdminLoginInputWrapper input {
          width: 100%; padding: 11px 12px 11px 40px !important; margin-bottom: 0 !important;
          border: 1px solid #ccc; border-radius: 5px; font-size: 14px; background: #ffffff; outline: none; transition: all 0.2s ease;
        }

        .AdminPasswordInputWrapper { position: relative; display: flex; align-items: center; }
        .AdminPasswordInputWrapper input {
          width: 100%; padding: 11px 45px 11px 40px !important; margin-bottom: 0 !important;
          border: 1px solid #ccc; border-radius: 5px; font-size: 14px; background: #ffffff; outline: none; transition: all 0.2s ease;
        }
        .AdminPasswordInputWrapper input:focus { border-color: #0D9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25); outline: none; }

        .PasswordLabelRow { position: relative; display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 10px; }
        .PasswordLabelRow label { margin: 0; }

        .AdminRememberMeRow { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 10px; }
        .AdminRememberMeRow label { display: inline-flex !important; align-items: center !important; gap: 8px; margin: 0 !important; font-size: 12.5px; color: #475569; cursor: pointer; }
        .AdminRememberMeRow input[type="checkbox"] { width: 15px !important; height: 15px !important; margin: 0 !important; cursor: pointer; accent-color: #0D9488; }

        .ForgotPasswordLink { font-size: 12.5px; color: #0D9488; cursor: pointer; }
        .ForgotPasswordLink:hover { color: #0f766e; }

        .AdminLoginform button[type="submit"] {
          width: 100%; margin-top: 15px; padding: 13px; background: #0D9488; color: #ffffff;
          font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;
          transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(13, 148, 136, 0.35); letter-spacing: 0.3px;
        }
        .AdminLoginform button[type="submit"]:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(13, 148, 136, 0.5); }
        .AdminLoginform button[type="submit"]:active { transform: translateY(0); }

        .OtpInputGrid { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
        .OtpDigitInput {
          width: 44px; height: 48px; padding: 0 !important; text-align: center; font-size: 22px; font-weight: 700;
          color: #0f172a; background: #f8fafc; border: 2px solid #e2e8f0 !important; border-radius: 10px; transition: all 0.2s ease;
        }
        .OtpDigitInput:focus { border-color: #0D9488 !important; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25) !important; outline: none; }

        .OtpTimerContainer { color: #64748b; text-align: center; margin-bottom: 16px; font-size: 13px; }
        .OtpTimerContainer strong { color: #0D9488; font-weight: 700; }
        .ResendButton { background: transparent; border: none; color: #0D9488; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }
        .ResendButton:hover { color: #0f766e; }

        .BackToLoginBtn {
          background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; display: block;
          margin: 4px auto; padding: 4px 0; text-decoration: underline;
        }
        .BackToLoginBtn:hover { color: #0f172a; }

        .AdminLoginErrorMsgContainer { padding: 10px 14px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; }
        .AdminLoginErrorMsg { font-family: 'Inter', sans-serif; font-size: 13px; color: #dc2626; text-align: center; }

        @media (max-width: 1023px) {
          .LoginGlassContainer { flex-direction: column; width: min(92vw, 640px); min-height: auto; padding: 36px 28px; gap: 32px; align-items: center; }
          .LeftPanel { width: 100%; align-items: center; text-align: center; gap: 24px; padding: 0; }
          .Agency { justify-content: center; text-align: left; }
          .Hero { margin: 12px 0; text-align: center; }
          .Hero h1 { font-size: 2.1rem; }
          .UniversalRightWrapper { flex-direction: column-reverse; width: 100%; align-items: center; }
          .UniversalTabsColumn { flex-direction: row; margin-right: 0; margin-bottom: -1px; }
          .UniversalTabBtn { flex-direction: row; width: auto; flex: 1; border-radius: 12px 12px 0 0; border-right: 1px solid rgba(255,255,255,0.16); border-bottom: none; }
          .UniversalTabBtn.active { box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.15); }
          .UniversalRightPanel { width: 100%; max-width: 100%; }
        }

        @media (max-width: 767px) {
          .LoginPage { padding: 20px 12px; justify-content: flex-start; }
          .LoginGlassContainer { width: 95vw; padding: 24px 18px; border-radius: 14px; gap: 24px; }
          .Hero h1 { font-size: 1.55rem; }
          .Hero h4 { font-size: 0.95rem; }
          .Agency img, .AgencyTop img, .FdaLogo { width: 46px; height: 46px; }
          .Agency h3 { font-size: 0.85rem; }
          .UniversalRightPanel { padding: 24px 18px; border-radius: 12px; }
          .RightPanel h2, .AdminLoginHeader h2 { font-size: 20px; }
          .AgencyButtons { gap: 8px; }
          .InterButtons { padding: 10px 8px; font-size: 13px; }
          .LoginOtpInputGrid { gap: 6px; }
          .LoginOtpDigitInput { width: 38px; height: 44px; font-size: 18px; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// PERSONNEL LOGIN FORM — reused logic/classnames from login-user.jsx
// ⚠️ Fetch calls replaced with mock async simulation, no real backend hit
// ============================================================================
function PersonnelLoginForm({ navigate }) {
  const [agency, setAgency] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState(new Array(6).fill(''))
  const [timer, setTimer] = useState(300)
  const otpRefs = useRef([])

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  function handleOtpChange(element, index) {
    let val = element.value;
    if (!/^\d*$/.test(val)) return;
    val = val.substring(val.length - 1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1].focus();
  }

  function handleOtpKeyDown(e, index) {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().substring(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) newOtp[i] = digits[i] || '';
      setOtp(newOtp);
      const targetFocusIndex = Math.min(digits.length, 5);
      otpRefs.current[targetFocusIndex]?.focus();
    }
  }

  // ⚠️ MOCK — simulates resending an OTP without hitting a real endpoint
  async function handleResendOtp() {
    setLoginError('');
    await new Promise((res) => setTimeout(res, 600));
    setTimer(300);
    setOtp(new Array(6).fill(''));
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  }

  function handleBackToLogin() {
    setIsOtpSent(false);
    setOtp(new Array(6).fill(''));
    setLoginError('');
  }

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function maskEmail(rawEmail) {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail
    const [localPart, domain] = rawEmail.split('@')
    const visibleChars = Math.min(2, localPart.length)
    const maskedLocal = localPart.slice(0, visibleChars) + '*'.repeat(Math.max(localPart.length - visibleChars, 3))
    return `${maskedLocal}@${domain}`
  }

  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, email: '' }));
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: emailRegex.test(val.trim()) ? '' : 'Please enter a valid email address.',
      }));
    }
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  }

  function handleAgencyChange(value) {
    setAgency(value);
    if (errors.agency) setErrors((prev) => ({ ...prev, agency: '' }));
  }

  // ⚠️ MOCK — validation logic preserved exactly; network calls simulated
  async function handleLogin() {
    if (!isOtpSent) {
      const newErrors = {};

      if (!agency) newErrors.agency = 'Please select an agency.';

      if (!email.trim()) {
        newErrors.email = 'Email is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address.';
      }

      if (!password.trim()) newErrors.password = 'Password is required.';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});

      try {
        // 🔌 MOCK: simulate network delay, always succeeds if fields pass validation
        await new Promise((res) => setTimeout(res, 700));

        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        setIsOtpSent(true);
        setTimer(300);
        setLoginError('');
      } catch (err) {
        setLoginError('Something went wrong. Please try again.');
      }
    } else {
      const otpCode = otp.join('');
      if (otpCode.length < 6) {
        setLoginError('Please enter the full 6-digit verification code.');
        return;
      }

      try {
        // 🔌 MOCK: any complete 6-digit code is accepted for testing purposes
        await new Promise((res) => setTimeout(res, 700));

        localStorage.setItem('access_token', 'mock_access_token');
        localStorage.setItem('refresh_token', 'mock_refresh_token');
        localStorage.setItem('agency', agency);

        if (agency === 'fda') {
          navigate('/fdafolder/fda-dashboard');
        } else {
          navigate('/leacidgfolder/lea-dashboard');
        }
      } catch (err) {
        setLoginError('Invalid verification code. Please try again.');
      }
    }
  }

  return (
    <>
      {isOtpSent ? (
        <>
          <small>SECURITY VERIFICATION</small>
          <h2>Enter Security Code</h2>
          <p><i>We've sent a 6-digit verification code to your email.</i></p>
        </>
      ) : (
        <>
          <small>AUTHORIZED LOGIN</small>
          <h2>Please log in to continue</h2>
          <p><i>Select your agency and enter your credentials.</i></p>
        </>
      )}

      <div className="LoginForm">
        {!isOtpSent ? (
          <>
            <label htmlFor="agency">Agency <span>*</span></label>
            <div className="AgencyButtons">
              <input type="radio" id="fda" name="agency" value="fda" onChange={() => handleAgencyChange('fda')} checked={agency === 'fda'} />
              <label htmlFor="fda" className="InterButtons AgencyButtonFDA">FDA</label>

              <input type="radio" id="cidg" name="agency" value="lea" onChange={() => handleAgencyChange('lea')} checked={agency === 'lea'} />
              <label htmlFor="cidg" className="InterButtons AgencyButtonCIDG">LEA-CIDG</label>
            </div>
            {errors.agency && <span className="LoginFieldError"><AlertCircle size={12} /> {errors.agency}</span>}

            <label htmlFor="email">Email <span>*</span></label>
            <div className="LoginInputWrapper">
              <Mail className="LoginInputIcon" size={16} />
              <input type="email" id="email" placeholder="youremail@gmail.com" value={email} onChange={handleEmailChange} required />
            </div>
            {errors.email && <span className="LoginFieldError"><AlertCircle size={12} /> {errors.email}</span>}

            <label htmlFor="password">Password <span>*</span></label>
            <div className="PasswordInputWrapper">
              <Lock className="LoginInputIcon" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="TogglePasswordBtn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="LoginFieldError"><AlertCircle size={12} /> {errors.password}</span>}

            <div className="RememberMe">
              <label htmlFor="remember-me">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember my email
              </label>
              <label htmlFor="forgot-password" className="ForgetPass">
                <a onClick={() => navigate('/forgot-password?from=interagency')} style={{ cursor: 'pointer' }}>Forgot password?</a>
              </label>
            </div>
          </>
        ) : (
          <div className="OtpContainer">
            <div className="OtpInstructions">
              Enter the code sent to your email <span>{maskEmail(email)}</span>.
            </div>

            <div className="LoginOtpInputGrid">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="LoginOtpDigitInput"
                  value={digit}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  required
                />
              ))}
            </div>

            <div className="LoginOtpTimerContainer">
              {timer > 0 ? (
                <p>Resend code in <strong>{formatTimer(timer)}</strong></p>
              ) : (
                <p>
                  Didn't receive the code?{' '}
                  <button type="button" className="LoginResendButton" onClick={handleResendOtp}>
                    Resend OTP
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {loginError && <div className="LoginErrorMsgContainer"><p className="LoginErrorMsg">{loginError}</p></div>}

        <button className="LoginButton" onClick={handleLogin}>
          {isOtpSent ? 'Verify & Login' : 'Login'}
        </button>
        {isOtpSent && (
          <button type="button" className="LoginBackToLoginBtn" onClick={handleBackToLogin}>
            ← Back to login credentials
          </button>
        )}
      </div>
    </>
  );
}

// ============================================================================
// SUPER ADMIN LOGIN FORM — reused logic/classnames from superadmin-login.jsx
// ⚠️ Fetch calls replaced with mock async simulation, no real backend hit
// ============================================================================
function SuperAdminLoginForm({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timer, setTimer] = useState(300);
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  function handleOtpChange(element, index) {
    let val = element.value;
    if (!/^\d*$/.test(val)) return;
    val = val.substring(val.length - 1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) otpRefs.current[index + 1].focus();
  }

  function handleOtpKeyDown(e, index) {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().substring(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) newOtp[i] = digits[i] || '';
      setOtp(newOtp);
      const targetFocusIndex = Math.min(digits.length, 5);
      otpRefs.current[targetFocusIndex]?.focus();
    }
  }

  // ⚠️ MOCK — simulates resending an OTP without hitting a real endpoint
  async function handleResendOtp() {
    setAdminLoginError('');
    await new Promise((res) => setTimeout(res, 600));
    setTimer(300);
    setOtp(new Array(6).fill(''));
    setTimeout(() => otpRefs.current[0]?.focus(), 0);
  }

  function handleBackToLogin() {
    setIsOtpSent(false);
    setOtp(new Array(6).fill(''));
    setAdminLoginError('');
  }

  function maskEmail(rawEmail) {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail
    const [localPart, domain] = rawEmail.split('@')
    const visibleChars = Math.min(2, localPart.length)
    const maskedLocal = localPart.slice(0, visibleChars) + '*'.repeat(Math.max(localPart.length - visibleChars, 3))
    return `${maskedLocal}@${domain}`
  }

  function handleEmailChange(e) {
    const val = e.target.value;
    setEmail(val);
    if (!val.trim()) {
      setErrors((prev) => ({ ...prev, email: '' }));
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: emailRegex.test(val.trim()) ? '' : 'Please enter a valid email address.',
      }));
    }
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
  }

  // ⚠️ MOCK — validation logic preserved exactly; network calls simulated
  async function handleLogin() {
    if (!isOtpSent) {
      const newErrors = {};

      if (!email.trim()) {
        newErrors.email = 'Email is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email address.';
      }

      if (!password.trim()) newErrors.password = 'Password is required.';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});

      try {
        // 🔌 MOCK: simulate network delay, always succeeds if fields pass validation
        await new Promise((res) => setTimeout(res, 700));

        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        setIsOtpSent(true);
        setTimer(300);
        setAdminLoginError('');
      } catch (err) {
        setAdminLoginError('Something went wrong. Please try again.');
      }
    } else {
      const otpCode = otp.join('');
      if (otpCode.length < 6) {
        setAdminLoginError('Please enter the full 6-digit verification code.');
        return;
      }

      try {
        // 🔌 MOCK: any complete 6-digit code is accepted for testing purposes
        await new Promise((res) => setTimeout(res, 700));

        localStorage.setItem('access_token', 'mock_access_token');
        localStorage.setItem('refresh_token', 'mock_refresh_token');
        localStorage.setItem('agency', 'superadmin');
        navigate('/superadminfolder/superadmin-user-management');
      } catch (err) {
        setAdminLoginError('Invalid verification code. Please try again.');
      }
    }
  }

  const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      {!isOtpSent ? (
        <>
          <div className="AdminLoginHeader">
            <small>AUTHORIZED LOGIN</small>
            <h2>Super Admin Login</h2>
          </div>
          <div className="AdminLoginform">
            <div>
              <label htmlFor="admin-email">Email <span>*</span></label>
              <div className="AdminLoginInputWrapper">
                <Mail className="AdminLoginInputIcon" size={16} />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="youremail@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              {errors.email && <span className="LoginFieldError"><AlertCircle size={12} /> {errors.email}</span>}
            </div>

            <div style={{ marginTop: '15px' }}>
              <div className="PasswordLabelRow">
                <label htmlFor="admin-password">Password <span>*</span></label>
              </div>

              <div className="AdminPasswordInputWrapper">
                <Lock className="LoginInputIcon" size={16} />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  className="TogglePasswordBtn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="LoginFieldError"><AlertCircle size={12} /> {errors.password}</span>}

              <div className="AdminRememberMeRow">
                <label htmlFor="admin-remember-me">
                  <input
                    type="checkbox"
                    id="admin-remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember my email
                </label>
                <a
                  onClick={() => navigate('/forgot-password?from=superadmin')}
                  className="ForgotPasswordLink"
                  style={{ cursor: 'pointer' }}
                >
                  Forgot Password?
                </a>
              </div>

              {adminLoginError && (
                <p className="AdminLoginErrorMsg" style={{ marginTop: '8px' }}>{adminLoginError}</p>
              )}
            </div>
          </div>

          <button type="submit">Login</button>
        </>
      ) : (
        <>
          <div className="AdminLoginHeader_otp">
            <h3>Security Verification</h3>
            <p>We've sent a 6-digit verification code to your email.</p>
          </div>

          <div className="OtpContainer">
            <div className="OtpInstructions">
              Enter the code sent to <span>{maskEmail(email)}</span>.
            </div>

            <div className="OtpInputGrid">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`admin-otp-digit-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="OtpDigitInput"
                  value={digit}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  onChange={(e) => handleOtpChange(e.target, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  onPaste={handleOtpPaste}
                  required
                />
              ))}
            </div>

            <div className="OtpTimerContainer">
              {timer > 0 ? (
                <p>Resend code in <strong>{formatTimer(timer)}</strong></p>
              ) : (
                <p>
                  Didn't receive the code?{' '}
                  <button type="button" className="ResendButton" onClick={handleResendOtp}>
                    Resend OTP
                  </button>
                </p>
              )}
            </div>

            <button type="submit" style={{ marginTop: '20px' }}>
              Verify &amp; Login
            </button>
            <button type="button" className="BackToLoginBtn" onClick={handleBackToLogin}>
              ← Back to login
            </button>
          </div>

          {adminLoginError && (
            <div className="AdminLoginErrorMsgContainer" style={{ marginTop: '15px' }}>
              <p className="AdminLoginErrorMsg">{adminLoginError}</p>
            </div>
          )}
        </>
      )}
    </form>
  );
}

export default UniversalLogin;