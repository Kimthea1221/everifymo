import { useState, useEffect, useRef } from "react";
import './superadmin-css.css';
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

//LOGIN PAGE EXCLUSIVELY FOR SUPERADMIN




function SuperAdminLogin() {
    const navigate = useNavigate();

    //FORM INPUT STATES
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //toggle password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [adminLoginError, setAdminLoginError] = useState('');

    // OTP verification states
    //controls if show ba otp screen or credentials form
    const [isOtpSent, setIsOtpSent] = useState(false);
    //stores each digit ng otp
    const [otp, setOtp] = useState(new Array(6).fill(''));
    //timer for resending otp
    const [timer, setTimer] = useState(300);

    //for input box focus to each digit
    const otpRefs = useRef([]);

    // Countdown timer for OTP Resending
    useEffect(() => {
        let interval;
        if (isOtpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOtpSent, timer]);

    // Handle OTP digit change
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

    // Handle backspacing or empty box deletes
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

    // Auto split pasted 6-digit text across inputs
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

    // Resend OTP trigger
    async function handleResendOtp() {
    setAdminLoginError('');
    try {
        const response = await fetch('http://127.0.0.1:8000/auth/superadmin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to resend code.');
        }

        setTimer(300);
        setOtp(new Array(6).fill(''));
        setTimeout(() => { otpRefs.current[0]?.focus(); }, 0);
    } catch (err) {
        setAdminLoginError(err.message);
    }
    }

    // Switch back to credentials form
    function handleBackToLogin() {
        setIsOtpSent(false);
        setOtp(new Array(6).fill(''));
        setAdminLoginError('');
    }



    async function handleLogin() {
    if (!isOtpSent) {

        // Check if fields are empty
        if (!email || !password) {
            setAdminLoginError('Please input your credentials to continue.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setAdminLoginError('Please enter a valid email address.');
            return;
        }



        try {
            const response = await fetch('http://127.0.0.1:8000/auth/superadmin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid email or password.');
            }

            setIsOtpSent(true);
            setTimer(300);
            setAdminLoginError('');
        } catch (err) {
            setAdminLoginError(err.message);
        }

    } else {

        const otpCode = otp.join('');

        if (otpCode.length < 6) {
            setAdminLoginError('Please enter the full 6-digit verification code.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/superadmin/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid verification code. Please try again.');
            }

            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('agency', 'superadmin');
            navigate('/superadminfolder/superadmin-user-management');
        } catch (err) {
            setAdminLoginError(err.message);
        }
    }
}
    const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="AdminLoginContainer">
            <div className="AdminLoginWrapper">
                 {/* LEFT PANEL */}
                <div className="AdminLoginLeftPanel">
                    <div className="AdminLoginTextWrapper">
                        <h1 className="AdminLoginWelcomeText">Welcome to</h1>
                        <p className="AdminLoginSubtitleText">ICMDA Super Admin log in page.</p>
                    </div>
                    <div className="AdminLoginLogoContainer">
                        <img src="src/images/fda_desktop.png" alt="FDA Philippines" />
                        <img src="src/images/cidg_desktop.png" alt="CIDG PNP" />
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className={`AdminLoginRightPanel ${isOtpSent ? 'OtpPanelActive' : ''}`}>
                    <form 
                        className={isOtpSent ? 'OtpFormActive' : ''}
                        onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>

                        {!isOtpSent ? (
                            <>
                                <div className="AdminLoginHeader">
                                    <p>Please login to your account.</p>
                                </div>

                                <div>
                                    <label htmlFor="email">Email <span>*</span></label>
                                    <div className="LoginInputWrapper">
                                        <Mail className="LoginInputIcon" size={16} />
                                        <input
                                            id="email"
                                            type="email" 
                                            placeholder="youremail@gmail.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setAdminLoginError(''); }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '15px' }}>
                                    <div className="PasswordLabelRow">
                                        <label htmlFor="password">Password <span>*</span></label>
                                        
                                         <a   onClick={() => navigate('/forgot-password?from=superadmin')}
                                            className="ForgotPasswordLink">
                                            Forgot?
                                        </a>
                                    </div>

                                    <div className="PasswordInputWrapper">
                                        <Lock className="LoginInputIcon" size={16} />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setAdminLoginError(''); }}
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

                                    {!isOtpSent && adminLoginError && (
                                        <p className="AdminLoginErrorMsg" style={{ marginTop: '8px' }}>{adminLoginError}</p>
                                    )}
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
                                        Enter the code sent to <span>{email}</span>.
                                    </div>

                                    <div className="OtpInputGrid">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                id={`otp-digit-${idx}`}
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

                                    <button type="button" className="BackToLoginBtn" onClick={handleBackToLogin}>
                                        ← Back to login
                                    </button>

                                    <button type="submit" style={{ marginTop: '20px' }}>
                                        Verify &amp; Login
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
                </div>
                
            </div>
        </div>
    );
}

export default SuperAdminLogin;