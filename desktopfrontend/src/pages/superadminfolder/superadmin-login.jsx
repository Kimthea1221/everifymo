import { useState, useEffect, useRef } from "react";
import './superadmin-css.css';
import { useNavigate } from "react-router-dom";

//LOGIN PAGE EXCLUSIVELY FOR SUPERADMIN


//TEST ACCOUNT ONLY AND TO BE REPLACED ONCE MY BACKEND NA
const TestAccount = [
    { email: 'superadmin@gmail.com', password: '@Superadmin12345' }
];

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
    const [timer, setTimer] = useState(180);

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
    function handleResendOtp() {
        setTimer(180);
        setOtp(new Array(6).fill(''));
        setAdminLoginError('');
        setTimeout(() => { otpRefs.current[0]?.focus(); }, 0);
    }

    // Switch back to credentials form
    function handleBackToLogin() {
        setIsOtpSent(false);
        setOtp(new Array(6).fill(''));
        setAdminLoginError('');
    }

    function validatePassword(pwd) {
        if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
        if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/.test(pwd)) return 'Password must contain at least one special character.';
        return null;
    }

    function handleLogin() {
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

        // Validate password format
        const pwdError = validatePassword(password);
        if (pwdError) {
            setAdminLoginError(pwdError);
            return;
        }

        // Check credentials (temporary frontend logic)
        // BACKEND: Replace this block with API call
        const match = TestAccount.find(
            (acc) => acc.email === email && acc.password === password
        );

        if (match) {
            setIsOtpSent(true);
            setTimer(180);
            setAdminLoginError('');
        } else {
            setAdminLoginError('Invalid email or password.');
        }

    } else {

        const otpCode = otp.join('');

        if (otpCode.length < 6) {
            setAdminLoginError('Please enter the full 6-digit verification code.');
            return;
        }

        // BACKEND: Replace this block with OTP verification API
        if (otpCode === '123456') {
            navigate('/superadminfolder/superadmin-user-management');
        } else {
            setAdminLoginError('Invalid verification code. Please try again.');
        }
    }
}
    const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div className="AdminLoginContainer">
            <div className="AdminLoginWrapper">
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>

                    {!isOtpSent ? (
                        <>
                            <div className="AdminLoginHeader">
                                <h3>Welcome Back</h3>
                                <p>Please login to your account.</p>
                            </div>

                            <div>
                                <label htmlFor="email">Email <span>*</span></label>
                                <div className="PasswordInputWrapper">
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
                                <label htmlFor="password">Password <span>*</span></label>
                                <div className="PasswordInputWrapper">
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
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <a
                                onClick={() => navigate('/forgot-password?from=superadmin')}
                                className="ForgotPasswordLink"
                            >
                                Forgot Password?
                            </a>

                            <button type="submit">Login</button>
                        </>
                    ) : (
                        <>
                            <div className="AdminLoginHeader">
                                <h3>Security Verification</h3>
                                <p>We've sent a 6-digit verification code to your email.</p>
                            </div>

                            <div className="OtpContainer">
                                <div className="OtpInstructions">
                                    Enter the code sent to <span>{email}</span>.
                                    <span className="OtpTestHint">
                                        (For testing, use verification code: <strong>123456</strong>)
                                    </span>
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
                        </>
                    )}

                    {adminLoginError && (
                        <div className="AdminLoginErrorMsgContainer" style={{ marginTop: '15px' }}>
                            <p className="AdminLoginErrorMsg">{adminLoginError}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default SuperAdminLogin;