import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import FDALogo from '../images/FDA.png'
import PNPLogo from '../images/pnp-cidg.jpg'

//FOR INTERAGENCY ACCOUNT TO
{/*for Test Accounts*/}
const TestAccount=[
    { agency: 'fda', email:'admin.fda@gmail.com', password:'@Fda12345'},
    { agency:'cidg', email:'admin.cidg@gmail.com', password:'@Cidg12345'},
]

function Login(){
    const navigate = useNavigate();


    // tracks which agency button the user selected (fda or cidg)
    const [agency, setAgency] = useState('fda')
    // form input states
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState('')

    // OTP verification states
    // controls whether to show the OTP screen or the login form
    const [isOtpSent, setIsOtpSent] = useState(false)
    // stores the 6 digits of OTP
    const [otp, setOtp] = useState(new Array(6).fill(''))
    // countdown timer (seconds)
    const [timer, setTimer] = useState(180)

    const otpRefs = useRef([])

    // Countdown Timer for OTP Resending
    useEffect(() => {
      let interval;
      if (isOtpSent && timer > 0) {
        interval = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isOtpSent, timer]);

    // Handle single OTP digit change and only allows numbers then auto-moves to next box
    function handleOtpChange(element, index) {
      let val = element.value;
      if (!/^\d*$/.test(val)) return;
      val = val.substring(val.length - 1);
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      // auto jump to next box after typing
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

    // Resend OTP trigger: resets OTP boxes and restarts the timer when user clicks "Resend OTP"
    //BACKEND: trigger resend OTP API call here
    function handleResendOtp() {
      setTimer(60);
      setOtp(new Array(6).fill(''));
      setLoginError('');
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 0);
    }

    // Switch back to credentials form
    function handleBackToLogin() {
      setIsOtpSent(false);
      setOtp(new Array(6).fill(''));
      setLoginError('');
    }

      // frontend password format validation (need din validate sa backend)
    function validatePassword(pwd) {
      if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
      if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\\[\]~`';]/.test(pwd)) return 'Password must contain at least one special character.';
      return null;
    }

    // handles both credential check and OTP verification
    function handleLogin() {
      if (!isOtpSent) {
        // check if fields are empty
        if (!email || !password) {
          setLoginError('Please input your credentials to continue.')
          return
        }
        // validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setLoginError('Please enter a valid email address.');
          return;
        }
        //validate password format
        const pwdError = validatePassword(password);
        if (pwdError) {
          setLoginError(pwdError);
          return;
        }
        //check if the credentials match but wrong agency was selected
        //BACKEND: replace this block with an API call to verify credentials
        const accountWithCredentials = TestAccount.find(
          (acc) => acc.email === email && acc.password === password
        )

        if (accountWithCredentials) {
          if (accountWithCredentials.agency !== agency) {
            setLoginError(`Access Denied: Make sure you select the correct agency to sign in.`)
            return
          }
        }

        //full match check — email, password, and agency all correct
        //BACKEND: replace this block with an API call to verify credentials
        const match = TestAccount.find(
          (acc) => acc.email === email && acc.password === password && acc.agency === agency
        )
        if(match){
          setIsOtpSent(true)
          setTimer(180)
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

        // Mock verification: match standard test code '123456'
        if (otpCode === '123456') {
          localStorage.setItem('agency', agency)
          // ✅ FIX 1: redirect based on agency
          if (agency === 'fda') {
            navigate('/fdafolder/fda-dashboard')
          } else {
            navigate('/leacidgfolder/lea-dashboard')
          }
        } else {
          setLoginError('Invalid verification code. Please try again.')
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
                  <input type="radio" id="fda" name="agency" value="fda" onChange={() => setAgency('fda')} checked={agency === 'fda'} />
                  <label htmlFor="fda" className="InterButtons AgencyButtonFDA">FDA</label>

                  <input type="radio" id="cidg" name="agency" value="cidg" onChange={() => setAgency('cidg')} checked={agency === 'cidg'} />
                  <label htmlFor="cidg" className="InterButtons AgencyButtonCIDG">LEA-CIDG</label>
                </div>

                <label htmlFor="email">Email <span>*</span></label>
                <input type="email" id="email" placeholder="youremail@gmail.com" value={email} onChange={(e)=> setEmail(e.target.value)} required/>

                <label htmlFor="password">Password <span>*</span></label>
                <div className="PasswordInputWrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="TogglePasswordBtn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="RememberMe">
                  <label htmlFor="remember-me"> 
                    <input type="checkbox" id="remember-me" />
                    Remember my email
                  </label>
                  <label htmlFor="forgot-password" className="ForgetPass"><a onClick={() => navigate('/forgot-password?from=interagency')} style={{cursor:'pointer'}}>Forget your password?</a></label>
                </div>
              </>
            ) : (
              <div className="OtpContainer">
                <div className="OtpInstructions">
                  Enter the code sent to your email <span>{email}</span>.
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '400', display: 'block', marginTop: '6px' }}>
                    (For testing, use verification code: <strong>123456</strong>)
                  </span>
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

                <button type="button" className="LoginBackToLoginBtn" onClick={handleBackToLogin}>
                  ← Back to login credentials
                </button>
              </div>
            )}
            
            {loginError && <div className="LoginErrorMsgContainer"><p className="LoginErrorMsg">{loginError}</p></div>}
            
            <button className="LoginButton" onClick={handleLogin}>
              {isOtpSent ? 'Verify & Login' : 'Login'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Login