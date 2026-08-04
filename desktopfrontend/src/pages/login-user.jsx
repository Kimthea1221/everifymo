import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import '../App.css'
import FDALogo from '../images/FDA.png'
import PNPLogo from '../images/pnp-cidg.jpg'

function Login(){
    const navigate = useNavigate();

    // tracks which agency button the user selected (fda or cidg)
    // CHANGED: starts unselected so it can be a real required field
    const [agency, setAgency] = useState('')
    // form input states
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState('')
    // per-field validation errors (same pattern as UserRegistration)
    const [errors, setErrors] = useState({})

    // OTP verification states
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [otp, setOtp] = useState(new Array(6).fill(''))
    const [timer, setTimer] = useState(180)

    const otpRefs = useRef([])

    useEffect(() => {
      let interval;
      if (isOtpSent && timer > 0) {
        interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
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

    function handleResendOtp() {
      setTimer(60);
      setOtp(new Array(6).fill(''));
      setLoginError('');
      try {
        const response = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, agency }),
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
        setLoginError(err.message);
      }
    }

    function handleBackToLogin() {
      setIsOtpSent(false);
      setOtp(new Array(6).fill(''));
      setLoginError('');
    }

    function validatePassword(pwd) {
      if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
      if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\\[\]~`';]/.test(pwd)) return 'Password must contain at least one special character.';
      return null;
    }

    // centralized per-field validation, mirrors validate() in UserRegistration
    // CHANGED: added agency required check
    function validateLoginFields() {
      const newErrors = {};

      if (!agency) {
        newErrors.agency = 'Please select an agency.';
      }

      if (!email.trim()) {
        newErrors.email = 'Email is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = 'Please enter a valid email address.';
        }
      }

      if (!password.trim()) {
        newErrors.password = 'Password is required.';
      } else {
        const pwdError = validatePassword(password);
        if (pwdError) {
          newErrors.password = pwdError;
        }
      }

      return newErrors;
    }

    // NEW: clears agency error the moment a radio is picked
    function handleAgencyChange(value) {
      setAgency(value);
      if (errors.agency) {
        setErrors((prev) => ({ ...prev, agency: '' }));
      }
    }

    function handleEmailChange(e) {
      setEmail(e.target.value);
      if (errors.email) {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
    }

    function handlePasswordChange(e) {
      setPassword(e.target.value);
      if (errors.password) {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
    }

    function handleLogin() {
      if (!isOtpSent) {
        const validationErrors = validateLoginFields();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
        setErrors({});

        const accountWithCredentials = TestAccount.find(
          (acc) => acc.email === email && acc.password === password
        )

        if (accountWithCredentials) {
          if (accountWithCredentials.agency !== agency) {
            setLoginError(`Access Denied: Make sure you select the correct agency to sign in.`)
            return
          }

        const match = TestAccount.find(
          (acc) => acc.email === email && acc.password === password && acc.agency === agency
        )
        if(match){
          setIsOtpSent(true)
          setTimer(300)
          setLoginError('')
        }else{
          setLoginError('Invalid email or password')
        }

      } else {
        const otpCode = otp.join('');
        if (otpCode.length < 6) {
          setLoginError('Please enter the full 6-digit verification code.');
          return;
        }

        if (otpCode === '123456') {
          localStorage.setItem('agency', agency)
          if (agency === 'fda') {
            navigate('/fdafolder/fda-dashboard')
          } else {
            navigate('/leacidgfolder/lea-dashboard');
          }
        } catch (err) {
          setLoginError(err.message);
        }
      }
    }

  return (
    <div>
      <div className="LoginPage">
        <div className="LeftPanel">
          <div className="Agency AgencyTop">
            <img src={FDALogo} alt="FDA AGENCY LOGO" className='FdaLogo'/>
            <div>
              <p>REPUBLIC OF THE PHILIPPINES</p>
              <h3>FOOD AND DRUGS ADMINISTRATION</h3>
            </div>
          </div>

          <div className="Hero">
            <h1>
              Interagency <span>Complaint</span> <br />
              Management System <br />
            </h1>
            <h4>Desktop Application</h4>
          </div>

          <div className="Agency AgencyBottom">
            <img src={PNPLogo} alt="PNP-CIDG AGENCY LOGO" />
            <div>
              <p>REPUBLIC OF THE PHILIPPINES</p>
              <h3>CRIMINAL INVESTIGATION AND DETECTION GROUP</h3>
            </div>
          </div>
        </div>

        <div className ="RightPanel">
          {isOtpSent ? (
            <>
              <small>SECURITY VERIFICATION</small>
              <h2>Enter Security Code</h2>
              <p><i>We've sent a 6-digit verification code to your email.</i></p>
            </>
          ) : (
            <>
              <small>AUTHORIZED LOGIN</small>
              <h2>Sign in to continue</h2>
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
                <div className={`LoginInputWrapper ${errors.email ? 'login-input-error' : ''}`}>
                  <Mail className="LoginInputIcon" size={16} />
                  <input type="email" id="email" placeholder="youremail@gmail.com" value={email} onChange={handleEmailChange} required/>
                </div>
                {errors.email && <span className="LoginFieldError"><AlertCircle size={12} /> {errors.email}</span>}

                <label htmlFor="password">Password <span>*</span></label>
                <div className={`PasswordInputWrapper ${errors.password ? 'login-input-error' : ''}`}>
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
                  <label htmlFor="forgot-password" className="ForgetPass"><a onClick={() => navigate('/forgot-password?from=interagency')} style={{cursor:'pointer'}}>Forget your password?</a></label>
                </div>
              </>
            ) : (
              <div className="OtpContainer">
                <div className="OtpInstructions">
                  Enter the code sent to your email <span>{email}</span>.
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
                    <p>Resend code in <strong>{timer}s</strong></p>
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
        </div>

      </div>

    </div>
  );
}

export default Login