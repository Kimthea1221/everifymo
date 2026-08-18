import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircleCheckBig, Mail, Lock, Eye, EyeOff } from 'lucide-react';

function ForgotPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const from = searchParams.get('from');
    const isSuperAdmin = from === 'superadmin';
    const themeClass = isSuperAdmin ? 'superadmin' : 'interagency';

    const [step, setStep] = useState('email'); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [timer, setTimer] = useState(300);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [forgotError, setForgotError] = useState('');

    const checks = {
        length:    newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        number:    /[0-9]/.test(newPassword),
        special:   /[^A-Za-z0-9]/.test(newPassword),
    };
    const allChecksPassed = Object.values(checks).every(Boolean);

    const otpRefs = useRef([]);

    // Countdown Timer for OTP Resending
    useEffect(() => {
        let interval;
        if (step === 'code' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleBackToLogin = () => {
        if (from === 'superadmin') {
            navigate('/');
        } else {
            navigate('/login');
        }
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        if (!val.trim()) {
            setForgotError('');
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val.trim())) {
                setForgotError('Please enter a valid email address.');
            } else {
                setForgotError('');
            }
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!email) return;
        setForgotError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/password/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to send code.');
            }

            setStep('code');
            setTimer(300);
            setOtp(new Array(6).fill(''));
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 0);
        } catch (err) {
            setForgotError(err.message);
        }
    };

    const handleResendOtp = async () => {
        setForgotError('');
        try {
            const response = await fetch('http://127.0.0.1:8000/auth/password/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to resend code.');
            }

            setTimer(300);
            setOtp(new Array(6).fill(''));
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 0);
        } catch (err) {
            setForgotError(err.message);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            setForgotError('Please enter the full 6-digit verification code.');
            return;
        }
        setForgotError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/password/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid verification code.');
            }

            setStep('reset');
        } catch (err) {
            setForgotError(err.message);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword) {
            setForgotError('New password is required.');
            return;
        } else if (!allChecksPassed) {
            setForgotError('Password does not meet all requirements.');
            return;
        }
        if (!confirmPassword) {
            setForgotError('Please confirm your new password.');
            return;
        } else if (newPassword !== confirmPassword) {
            setForgotError('Passwords do not match.');
            return;
        }
        setForgotError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otp.join(''), new_password: newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to reset password.');
            }

            setStep('success');
        } catch (err) {
            setForgotError(err.message);
            setStep('code'); // send them back to re-enter the code if it was wrong/expired
        }
    };

    function handleOtpChange(element, index) {
        let val = element.value;
        if (!/^\d*$/.test(val)) return;
        val = val.substring(val.length - 1);
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        if (val && index < 5) {
            otpRefs.current[index + 1].focus();
        }
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
            for (let i = 0; i < 6; i++) {
                newOtp[i] = digits[i] || '';
            }
            setOtp(newOtp);
            const targetFocusIndex = Math.min(digits.length, 5);
            otpRefs.current[targetFocusIndex]?.focus();
        }
    }

    function maskEmail(rawEmail) {
        if (!rawEmail || !rawEmail.includes('@')) return rawEmail;
        const [localPart, domain] = rawEmail.split('@');
        const visibleChars = Math.min(2, localPart.length);
        const maskedLocal =
            localPart.slice(0, visibleChars) + '*'.repeat(Math.max(localPart.length - visibleChars, 3));
        return `${maskedLocal}@${domain}`;
    }

    const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <>
            <style>
                {`
                /* --- COMMON / RESET --- */
                .ForgotPasswordContainer {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 100vw;
                  height: 100vh;
                  padding: 20px;
                  box-sizing: border-box;
                  overflow: auto;
                  transition: background 0.3s ease;
                }

                /* --- INTERAGENCY THEME (Matches login-user.jsx) --- */
                .ForgotPasswordContainer.interagency {
                  background-color: #041d20; 
                  color: #fdfdfd;
                  font-family: 'Poppins', sans-serif;
                }

                .ForgotPasswordWrapper.interagency {
                  width: 100%;
                  max-width: 460px;
                  background: #f8f8f8;
                  padding: 40px;
                  border-radius: 30px;
                  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
                  color: #333;
                  animation: fadeIn 0.4s ease-out forwards;
                }

                .ForgotPasswordHeader.interagency {
                  text-align: center;
                  margin-bottom: 20px;
                }

                .ForgotPasswordHeader.interagency h3 {
                  font-size: 28px;
                  font-weight: 700;
                  color: #333;
                  margin-bottom: 8px;
                }

                .ForgotPasswordHeader.interagency p {
                  font-size: 13px;
                  color: #666;
                  line-height: 1.5;
                  margin: 8px 0 0 0;
                }

                .ForgotForm.interagency {
                  display: flex;
                  flex-direction: column;
                  gap: 20px;
                }

                .ForgotForm.interagency label {
                  display: block;
                  font-size: 14px;
                  color: #333;
                  margin-bottom: 5px;
                  font-weight: 500;
                }

                .ForgotForm.interagency label span {
                  color: #f7931a;
                }

                .LoginInputWrapper.interagency, .PasswordInputWrapper.interagency {
                  position: relative;
                  display: flex;
                  align-items: center;
                  width: 100%;
                }

                .LoginInputWrapper.interagency input, .PasswordInputWrapper.interagency input {
                  width: 100%;
                  padding: 11px 12px 11px 40px !important;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  font-size: 14px;
                  background: #ffffff;
                  color: #1a1a2e;
                  outline: none;
                  transition: border-color 0.2s ease;
                  box-sizing: border-box;
                  margin-top: 0px;
                }

                .LoginInputWrapper.interagency input:focus, .PasswordInputWrapper.interagency input:focus {
                  border-color: #f7931a;
                }

                .PasswordInputWrapper.interagency input {
                  padding-right: 45px !important;
                }

                .LoginInputIcon.interagency {
                  position: absolute;
                  left: 14px;
                  color: #94a3b8;
                  pointer-events: none;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .TogglePasswordBtn.interagency {
                  position: absolute;
                  right: 14px;
                  top: 50%;
                  transform: translateY(-50%);
                  background: transparent;
                  border: none;
                  color: #94a3b8;
                  cursor: pointer;
                  padding: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: color 0.15s ease;
                }

                .TogglePasswordBtn.interagency:hover {
                  color: #f7931a;
                }

                .SubmitBtn.interagency {
                  width: 100%;
                  margin-top: 10px;
                  padding: 10px;
                  background: #26262a;
                  color: #fff;
                  font-size: 16px;
                  font-weight: 600;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                }

                .SubmitBtn.interagency:hover {
                  background: #050b07;
                  transform: scale(1.03);
                }

                .BackBtn.interagency {
                  background: none;
                  border: none;
                  color: #64748b;
                  font-size: 13px;
                  font-weight: 500;
                  cursor: pointer;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 6px;
                  margin-top: 10px;
                  transition: color 0.2s ease;
                  text-decoration: underline;
                }

                .BackBtn.interagency:hover {
                  color: #1a1a2e;
                }

                /* OTP Digit inputs - Interagency */
                .OtpGridContainer.interagency {
                  display: flex;
                  gap: 8px;
                  justify-content: space-between;
                  margin-bottom: 10px;
                }

                .OtpDigitInput.interagency {
                  width: 46px;
                  height: 50px;
                  text-align: center;
                  font-size: 20px;
                  font-weight: 600;
                  border-radius: 8px;
                  border: 1.5px solid #011329 !important;
                  background-color: #ffffff;
                  color: #1a1a2e;
                  transition: all 0.2s ease;
                  box-sizing: border-box;
                }

                .OtpDigitInput.interagency:focus {
                  border-color: #f7931a !important;
                  box-shadow: 0 0 0 3px rgba(247, 147, 26, 0.25);
                  outline: none;
                }

                .OtpTimerContainer.interagency {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 20px;
                  font-size: 13px;
                  color: #666;
                }

                .ResendButton.interagency {
                  background: none;
                  border: none;
                  color: #f7931a;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  padding: 0;
                  text-decoration: underline;
                  transition: color 0.2s ease;
                }

                .ErrorContainer.interagency {
                  background-color: #eb83835b;
                  border: 1px solid red;
                  padding: 12px 16px;
                  border-radius: 8px;
                  margin-bottom: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .ErrorMsg.interagency {
                  color: #cc0000 !important;
                  font-size: 12px;
                  font-weight: 400;
                  text-align: center;
                  margin: 0 !important;
                }

                /* --- SUPERADMIN THEME (Matches superadmin-login.jsx / superadmin-css.css) --- */
                .ForgotPasswordContainer.superadmin {
                  background: #1E293B;
                  color: #ffffff;
                  font-family: 'Inter', sans-serif;
                }

                .ForgotPasswordWrapper.superadmin {
                  width: 100%;
                  max-width: 500px;
                  background: linear-gradient(135deg, #13213c 0%, #1E293B 100%);
                  border-radius: 20px;
                  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
                  border: 1px solid rgba(255, 255, 255, 0.12);
                  overflow: hidden;
                  animation: fadeIn 0.4s ease-out forwards;
                }

                .ForgotPasswordHeader.superadmin {
                  background: linear-gradient(135deg, #1E293B 0%, #111827 100%);
                  padding: 32px 48px 28px;
                  border-bottom: 1px solid #0D9488;
                  text-align: center;
                }

                .ForgotPasswordHeader.superadmin h3 {
                  font-family: 'Poppins', sans-serif;
                  font-size: 20px;
                  font-weight: 700;
                  color: #ffffff;
                  letter-spacing: 0.3px;
                  margin: 0;
                }

                .ForgotPasswordHeader.superadmin p {
                  font-family: 'Poppins', sans-serif;
                  font-size: 15px;
                  color: #a6a6a6;
                  margin: 8px 0 0 0;
                }

                .ForgotForm.superadmin {
                  display: flex;
                  flex-direction: column;
                  gap: 18px;
                  padding: 28px 48px 36px;
                }

                .ForgotForm.superadmin label {
                  font-family: 'Inter', sans-serif;
                  font-size: 14px;
                  color: #e2e2e2;
                }

                .ForgotForm.superadmin label span {
                  color: red;
                }

                .LoginInputWrapper.superadmin, .PasswordInputWrapper.superadmin {
                  position: relative;
                  display: flex;
                  align-items: center;
                  width: 100%;
                }

                .LoginInputWrapper.superadmin input, .PasswordInputWrapper.superadmin input {
                  width: 100%;
                  padding: 12px 16px 12px 40px !important;
                  border-radius: 10px;
                  border: 1.5px solid rgba(255, 255, 255, 0.15);
                  background: rgba(255, 255, 255, 0.06);
                  color: #f1f5f9;
                  font-size: 14px;
                  transition: all 0.25s ease;
                  box-sizing: border-box;
                  outline: none;
                  margin-top: 4px;
                }

                .LoginInputWrapper.superadmin input::placeholder, .PasswordInputWrapper.superadmin input::placeholder {
                  color: rgba(255, 255, 255, 0.3);
                }

                .LoginInputWrapper.superadmin input:focus, .PasswordInputWrapper.superadmin input:focus {
                  border-color: #0D9488;
                  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25);
                  background: rgba(13, 148, 136, 0.1);
                }

                .PasswordInputWrapper.superadmin input {
                  padding-right: 64px !important;
                }

                .LoginInputIcon.superadmin {
                  position: absolute;
                  left: 14px;
                  color: #94a3b8;
                  pointer-events: none;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .TogglePasswordBtn.superadmin {
                  position: absolute;
                  right: 12px;
                  background: transparent;
                  border: none;
                  color: #0D9488;
                  font-size: 12px;
                  font-weight: 600;
                  cursor: pointer;
                  padding: 4px 6px;
                  border-radius: 4px;
                  transition: color 0.15s ease;
                  letter-spacing: 0.3px;
                  text-transform: uppercase;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }

                .TogglePasswordBtn.superadmin:hover {
                  color: #5eead4;
                }

                .SubmitBtn.superadmin {
                  width: 100%;
                  margin-top: 20px;
                  padding: 13px;
                  background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%);
                  color: #fff;
                  font-size: 15px;
                  font-weight: 700;
                  border: none;
                  border-radius: 10px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                  box-shadow: 0 4px 15px rgba(13, 148, 136, 0.35);
                  letter-spacing: 0.3px;
                }

                .SubmitBtn.superadmin:hover {
                  background: linear-gradient(135deg, #2dd4a8 0%, #115e59 100%);
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.5);
                }

                .BackBtn.superadmin {
                  background: transparent;
                  border: none;
                  color: #94a3b8;
                  font-size: 13px;
                  cursor: pointer;
                  display: block;
                  margin: 10px auto 0;
                  padding: 4px 0;
                  transition: color 0.15s ease;
                  text-decoration: underline;
                  text-underline-offset: 3px;
                }

                .BackBtn.superadmin:hover {
                  color: #f1f5f9;
                }

                /* OTP Digit inputs - Superadmin */
                .OtpGridContainer.superadmin {
                  display: flex;
                  justify-content: center;
                  gap: 10px;
                  margin-bottom: 20px;
                }

                .OtpDigitInput.superadmin {
                  width: 48px !important;
                  height: 56px;
                  padding: 0 !important;
                  text-align: center;
                  font-size: 22px;
                  font-weight: 700;
                  color: #f1f5f9;
                  background: rgba(255, 255, 255, 0.07);
                  border: 2px solid rgba(255, 255, 255, 0.15) !important;
                  border-radius: 10px;
                  caret-color: #0D9488;
                  transition: all 0.2s ease;
                  box-sizing: border-box;
                }

                .OtpDigitInput.superadmin:focus {
                  border-color: #0D9488 !important;
                  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25) !important;
                  background: rgba(13, 148, 136, 0.06);
                  outline: none;
                }

                .OtpTimerContainer.superadmin {
                  color: #94a3b8;
                  text-align: center;
                  margin-bottom: 16px;
                  font-size: 13px;
                }

                .ResendButton.superadmin {
                  background: transparent;
                  border: none;
                  color: #0D9488;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  text-decoration: underline;
                  text-underline-offset: 3px;
                  padding: 0;
                  transition: color 0.15s ease;
                }

                .ErrorContainer.superadmin {
                  padding: 10px 14px;
                  background: rgba(239, 68, 68, 0.15);
                  border: 1px solid rgba(239, 68, 68, 0.5);
                  border-radius: 8px;
                  margin-top: 4px;
                }

                .ErrorMsg.superadmin {
                  font-family: 'Inter', sans-serif;
                  font-style: italic;
                  font-size: 10px;
                  color: #B91C1C;
                  margin: 0;
                }

                /* --- Success page specific overrides --- */
                .SuccessContainer {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 15px;
                  padding: 28px 32px 36px;
                }

                .SuccessIcon {
                  width: 64px;
                  height: 64px;
                  color: #10B981;
                  margin-bottom: 10px;
                  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                  transition: color .2s ease, transform .2s ease;
                }

                .SuccessIcon:hover {
                  transform: scale(1.08);
                }

                @keyframes popIn {
                  from { transform: scale(0); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }

                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                /* ── CP Form alignment matching change-password.jsx ── */
                .CPForm {
                  display: flex;
                  flex-direction: column;
                  gap: 18px;
                  box-sizing: border-box;
                }
                .ForgotPasswordWrapper.superadmin .CPForm {
                  padding: 28px 48px 36px;
                }
                .ForgotPasswordWrapper.interagency .CPForm {
                  padding: 20px 0 0;
                }

                .CPFormGroup {
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                }

                .CPLabel {
                  font-size: 13px;
                  font-weight: 600;
                  box-sizing: border-box;
                }
                .ForgotPasswordWrapper.superadmin .CPLabel {
                  color: #e2e2e2;
                }
                .ForgotPasswordWrapper.interagency .CPLabel {
                  color: #374151;
                }

                .CPRequired {
                  color: #ef4444;
                }

                .CPInputWrapper {
                  position: relative;
                  display: flex;
                  align-items: center;
                }

                .CPInput {
                  width: 100%;
                  padding: 11px 54px 11px 14px;
                  border-radius: 9px;
                  font-size: 14px;
                  outline: none;
                  transition: all 0.2s ease;
                  box-sizing: border-box;
                  font-family: 'Inter', sans-serif;
                }
                .ForgotPasswordWrapper.superadmin .CPInput {
                  background: rgba(255, 255, 255, 0.06);
                  color: #f1f5f9;
                  border: 1.5px solid rgba(255, 255, 255, 0.15);
                }
                .ForgotPasswordWrapper.superadmin .CPInput:focus {
                  border-color: #0D9488;
                  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25);
                  background: rgba(13, 148, 136, 0.1);
                }
                .ForgotPasswordWrapper.interagency .CPInput {
                  background: #ffffff;
                  color: #1a1a2e;
                  border: 1.5px solid #ccc;
                }
                .ForgotPasswordWrapper.interagency .CPInput:focus {
                  border-color: #f7931a;
                  box-shadow: 0 0 0 3px rgba(247, 147, 26, 0.15);
                }

                .cp-input-error {
                  border-color: #ef4444 !important;
                  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
                }

                .CPToggleBtn {
                  position: absolute;
                  right: 12px;
                  background: transparent;
                  border: none;
                  cursor: pointer;
                  font-size: 12px;
                  font-weight: 600;
                  line-height: 1;
                  padding: 4px 6px;
                  transition: color 0.15s ease;
                  text-transform: uppercase;
                  letter-spacing: 0.3px;
                }
                .ForgotPasswordWrapper.superadmin .CPToggleBtn {
                  color: #0D9488;
                }
                .ForgotPasswordWrapper.superadmin .CPToggleBtn:hover {
                  color: #5eead4;
                }
                .ForgotPasswordWrapper.interagency .CPToggleBtn {
                  color: #64748b;
                }
                .ForgotPasswordWrapper.interagency .CPToggleBtn:hover {
                  color: #f7931a;
                }

                .CPMatchIndicator {
                  font-size: 12px;
                  font-weight: 600;
                  margin-top: 4px;
                }
                .match-ok { color: #16a34a; }
                .match-fail { color: #ef4444; }

                /* Password Requirements list */
                .CPRequirements {
                  border-radius: 10px;
                  padding: 14px 16px;
                  box-sizing: border-box;
                }
                .ForgotPasswordWrapper.superadmin .CPRequirements {
                  background: rgba(255, 255, 255, 0.03);
                  border: 1px solid rgba(255, 255, 255, 0.12);
                }
                .ForgotPasswordWrapper.interagency .CPRequirements {
                  background: #f8fafc;
                  border: 1px solid #e2e8f0;
                }

                .CPReqTitle {
                  font-size: 12px;
                  font-weight: 600;
                  margin: 0 0 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .ForgotPasswordWrapper.superadmin .CPReqTitle {
                  color: #94a3b8;
                }
                .ForgotPasswordWrapper.interagency .CPReqTitle {
                  color: #475569;
                }

                .CPReqList {
                  list-style: none;
                  padding: 0;
                  margin: 0;
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                }

                .CPReqItem {
                  font-size: 13px;
                  font-weight: 500;
                  transition: color 0.2s ease;
                }
                .ForgotPasswordWrapper.superadmin .CPReqItem.req-met {
                  color: #4ade80;
                }
                .ForgotPasswordWrapper.superadmin .CPReqItem.req-unmet {
                  color: #64748b;
                }
                .ForgotPasswordWrapper.interagency .CPReqItem.req-met {
                  color: #166534;
                }
                .ForgotPasswordWrapper.interagency .CPReqItem.req-unmet {
                  color: #94a3b8;
                }

                .CPErrorMsgContainer {
                  background-color: rgba(239, 68, 68, 0.15);
                  border: 1px solid rgba(239, 68, 68, 0.5);
                  padding: 10px 14px;
                  border-radius: 8px;
                  margin-top: 5px;
                  text-align: center;
                }

                .CPErrorMsg {
                  color: #ef4444 !important;
                  margin: 0;
                  font-size: 13px;
                  text-align: center;
                  line-height: 1.5;
                }

                .CPSubmitBtn {
                  width: 100%;
                  padding: 14px;
                  color: #ffffff;
                  font-size: 15px;
                  font-weight: 700;
                  border: none;
                  border-radius: 10px;
                  cursor: pointer;
                  transition: all 0.22s ease;
                  font-family: 'Poppins', sans-serif;
                  letter-spacing: 0.3px;
                }
                .CPSubmitBtn.superadmin {
                  background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%);
                  box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
                }
                .CPSubmitBtn.superadmin:hover {
                  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
                  transform: translateY(-2px);
                  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.5);
                }
                .CPSubmitBtn.interagency {
                  background: #26262a;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .CPSubmitBtn.interagency:hover {
                  background: #050b07;
                  transform: translateY(-2px);
                  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
                }
                .CPSubmitBtn:active {
                  transform: translateY(0);
                }
                `}
            </style>
            <div className={`ForgotPasswordContainer ${themeClass}`}>
                <div className={`ForgotPasswordWrapper ${themeClass}`}>
                    <div className={`ForgotPasswordHeader ${themeClass}`}>
                        <h3>
                            {step === 'success' ? 'Password Reset Complete!' : 'Forgot Password'}
                        </h3>
                        <p>
                            {step === 'email' && "Please enter your account email address. We will send you a verification code."}
                            {step === 'code' && `We sent a code to ${email}. Please enter it below.`}
                            {step === 'reset' && "Verification successful! Create your new account password below."}
                            {step === 'success' && "Your password has been successfully updated. You can now securely log back in."}
                        </p>
                    </div>

                    {forgotError && step !== 'reset' && (
                        <div className={`ErrorContainer ${themeClass}`} style={{ margin: isSuperAdmin ? '20px 48px 0' : '20px 40px 0' }}>
                            <p className={`ErrorMsg ${themeClass}`}>{forgotError}</p>
                        </div>
                    )}

                    {/*FOR INPUT EMAIL */}
                    {step === 'email' && (
                        <form onSubmit={handleSendCode} className={`ForgotForm ${themeClass}`}>
                            <div>
                                <label>Email {isSuperAdmin && <span>*</span>}</label>
                                <div className={`LoginInputWrapper ${themeClass}`}>
                                    <Mail className={`LoginInputIcon ${themeClass}`} size={16} />
                                    <input 
                                        type="email" 
                                        placeholder="youremail@gmail.com" 
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className={`SubmitBtn ${themeClass}`}>Send Code</button>
                            <button type="button" className={`BackBtn ${themeClass}`} onClick={handleBackToLogin}>Back to Login</button>
                        </form>
                    )}

                    {/* FOR INPUT VERIFICATION CODE (6-digit grid layout) */}
                    {step === 'code' && (
                        <form onSubmit={handleVerifyCode} className={`ForgotForm ${themeClass}`}>
                            <div className="OtpContainer">
                                <div className="OtpInstructions" style={{ color: isSuperAdmin ? '#cbd5e1' : '#555' }}>
                                    Enter the code sent to {isSuperAdmin ? '' : 'your email'} <span style={{ color: isSuperAdmin ? '#0D9488' : '#1a1a2e', fontWeight: 600 }}>{maskEmail(email)}</span>.
                                </div>

                                <div className={`OtpGridContainer ${themeClass}`}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className={`OtpDigitInput ${themeClass}`}
                                            value={digit}
                                            ref={(el) => (otpRefs.current[idx] = el)}
                                            onChange={(e) => handleOtpChange(e.target, idx)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                            onPaste={handleOtpPaste}
                                            required
                                        />
                                    ))}
                                </div>

                                <div className={`OtpTimerContainer ${themeClass}`}>
                                    {timer > 0 ? (
                                        <p>Resend code in <strong>{formatTimer(timer)}</strong></p>
                                    ) : (
                                        <p>
                                            Didn't receive the code?{' '}
                                            <button type="button" className={`ResendButton ${themeClass}`} onClick={handleResendOtp}>
                                                Resend OTP
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className={`SubmitBtn ${themeClass}`}>Verify Code</button>
                            <button type="button" className={`BackBtn ${themeClass}`} onClick={() => setStep('email')}>
                                Back to Email
                            </button>
                        </form>
                    )}

                    {/* FOR CREATE NEW PASSWORD */}
                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="CPForm" noValidate>
                            {/* New Password */}
                            <div className="CPFormGroup">
                                <label className="CPLabel">
                                    New Password <span className="CPRequired">*</span>
                                </label>
                                <div className="CPInputWrapper">
                                    <input
                                        className={`CPInput ${forgotError && !newPassword ? 'cp-input-error' : ''}`}
                                        type={showNew ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setForgotError('');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className={`CPToggleBtn ${themeClass}`}
                                        onClick={() => setShowNew((v) => !v)}
                                        aria-label={showNew ? 'Hide password' : 'Show password'}
                                    >
                                        {showNew ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="CPFormGroup">
                                <label className="CPLabel">
                                    Confirm New Password <span className="CPRequired">*</span>
                                </label>
                                <div className="CPInputWrapper">
                                    <input
                                        className={`CPInput ${forgotError && (!confirmPassword || newPassword !== confirmPassword) ? 'cp-input-error' : ''}`}
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setForgotError('');
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className={`CPToggleBtn ${themeClass}`}
                                        onClick={() => setShowConfirm((v) => !v)}
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? 'Hide' : 'Show'}
                                    </button>
                                </div>

                                {confirmPassword && (
                                    <span
                                        className={`CPMatchIndicator ${
                                            newPassword === confirmPassword ? 'match-ok' : 'match-fail'
                                        }`}
                                    >
                                        {newPassword === confirmPassword
                                            ? '✅ Passwords match'
                                            : '❌ Passwords do not match'}
                                    </span>
                                )}
                            </div>

                            <div className="CPRequirements">
                                <p className="CPReqTitle">Password requirements:</p>
                                <ul className="CPReqList">
                                    <li className={`CPReqItem ${checks.length ? 'req-met' : 'req-unmet'}`}>
                                        {checks.length ? '✅' : '❌'} At least 8 characters
                                    </li>
                                    <li className={`CPReqItem ${checks.uppercase ? 'req-met' : 'req-unmet'}`}>
                                        {checks.uppercase ? '✅' : '❌'} At least one uppercase letter
                                    </li>
                                    <li className={`CPReqItem ${checks.number ? 'req-met' : 'req-unmet'}`}>
                                        {checks.number ? '✅' : '❌'} At least one number
                                    </li>
                                    <li className={`CPReqItem ${checks.special ? 'req-met' : 'req-unmet'}`}>
                                        {checks.special ? '✅' : '❌'} At least one special character
                                    </li>
                                </ul>
                            </div>

                            {forgotError && (
                                <div className="CPErrorMsgContainer">
                                    <p className="CPErrorMsg">{forgotError}</p>
                                </div>
                            )}

                            <button type="submit" className={`CPSubmitBtn ${themeClass}`}>
                                Update Password
                            </button>
                        </form>
                    )}

                    {/* FOR SUCCESS PASSWORD RESET */}
                    {step === 'success' && (
                        <div className="SuccessContainer" style={{ textAlign: 'center', marginTop: '20px' }}>
                            <CircleCheckBig className="SuccessIcon" />
                            <button 
                                type="button" 
                                className={`BackBtn ${themeClass}`}
                                style={{ marginTop: '20px', display: 'block', width: '100%', textDecoration: 'underline' }}
                                onClick={handleBackToLogin}
                            >
                                ← Go to Login Screen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;