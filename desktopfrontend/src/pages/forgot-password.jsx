import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import check_img from '../images/check_img.png';

// FORGET PASSWORD FOR LEA-FDA SIDE & SUPERADMIN (PWEDE NAMAN YATA MAREUSE)

function ForgotPassword(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const from = searchParams.get('from');
    const [step, setStep] = useState('email'); 


    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [forgotError, setForgotError] = useState('');

    const handleBackToLogin = () => {
        if (from === 'superadmin') {
            navigate('/');
        } else {
            navigate('/login');
        }
    };

    //For simulating code send
    const handleSendCode = (e) => {
        e.preventDefault();
        if(!email) return;
        setForgotError('');
        setStep('code');
    };

    // for verified
    const handleVerifyCode = (e) => {
        e.preventDefault();
        if(!code) return;
        setForgotError('');
        setStep('reset');
    }

    const handleResetPassword = (e) =>{
        e.preventDefault();
        if(newPassword !== confirmPassword) {
            setForgotError("Passwords do not match.");
            return;
        }
        setForgotError('');
        setStep('success');
    }

    

    return(
      <>
        <style>
          {`
            .ForgotPasswordContainer {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100vw;
              height: 100vh;
              background: #fdfdfd;
              color: #1f2937;
              font-family: var(--font-body, 'Inter', sans-serif);
              padding: 20px;
            }

            .ForgotPasswordWrapper {
              width: 100%;
              max-width: 420px;
              background: #ffffff;
              border-radius: 20px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
              overflow: hidden;
              animation: fadeIn 0.4s ease-out forwards;
            }

            .ForgotPasswordHeader {
              background: linear-gradient(135deg, #1E293B 0%, #0f172a 100%);
              padding: 32px 32px 28px;
              border-bottom: 4px solid #0D9488;
              text-align: center;
              margin-bottom: 0;
            }

            .ForgotPasswordHeader h3 {
              font-family: var(--font-headings, 'Poppins', sans-serif);
              font-size: 20px;
              font-weight: 700;
              color: #fff;
              margin-bottom: 0;
              letter-spacing: 0.5px;
            }

            .ForgotPasswordHeader p {
              font-size: 13px;
              color: #94a3b8;
              line-height: 1.5;
              margin: 8px 0 0 0;
            }

            .ForgotPasswordWrapper form {
              display: flex;
              flex-direction: column;
              gap: 20px;
              padding: 28px 32px 36px;
            }

            .ForgotPasswordWrapper label {
              display: block;
              font-size: 13px;
              font-weight: 600;
              color: #374151;
              margin-bottom: 6px;
              letter-spacing: 0.3px;
            }

            .ForgotPasswordWrapper input {
              width: 100%;
              padding: 12px 16px;
              border-radius: 8px;
              border: 1.5px solid #e2e8f0;
              background: #f9fafb;
              color: #111827;
              font-size: 14px;
              transition: all 0.25s ease;
              box-sizing: border-box;
            }

            .ForgotPasswordWrapper input::placeholder {
              color: #94a3b8;
            }

            .ForgotPasswordWrapper input:focus {
              border-color: #0D9488;
              box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
              background: #fff;
              outline: none;
            }

            .InputWrapper {
              position: relative;
              display: flex;
              align-items: center;
            }

            .InputWrapper input {
              padding-right: 64px;
            }

            .ToggleBtn {
              position: absolute;
              right: 12px;
              background: transparent;
              border: none;
              cursor: pointer;
              font-size: 12px;
              font-weight: 600;
              line-height: 1;
              padding: 4px 6px;
              color: #64748b;
              transition: color 0.15s ease;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }

            .ToggleBtn:hover {
              color: #0D9488;
            }

            .BtnSendCode, .BtnSubmitCode, .BtnResetPass {
              width: 100%;
              padding: 14px;
              background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%);
              color: #fff;
              font-size: 15px;
              font-weight: 700;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              transition: all 0.22s ease;
              box-shadow: 0 6px 20px rgba(13, 148, 136, 0.35);
              text-align: center;
              margin-top: 10px;
              font-family: 'Poppins', sans-serif;
              letter-spacing: 0.3px;
            }

            .BtnBackToLogin {
              width: 100%;
              padding: 8px;
              background: transparent;
              color: #64748b;
              font-size: 14px;
              font-weight: 500;
              border: none;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: none;
              text-align: center;
              margin-top: 10px;
              text-decoration: underline;
            }

            .BtnSendCode:hover, .BtnSubmitCode:hover, .BtnResetPass:hover {
              background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(13, 148, 136, 0.45);
            }

            .BtnBackToLogin:hover {
              color: #0D9488;
              background: transparent;
              transform: none;
            }

            .BtnSendCode:active, .BtnSubmitCode:active, .BtnResetPass:active, .BtnBackToLogin:active {
              transform: translateY(0);
            }

            .BtnBack {
              width: 100%;
              padding: 12px;
              background: transparent;
              color: #64748b;
              font-size: 14px;
              font-weight: 500;
              border: 1.5px solid #e2e8f0;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s ease;
              text-align: center;
              margin-top: 10px;
            }

            .BtnBack:hover {
              color: #1e293b;
              background: #f1f5f9;
              border-color: #cbd5e1;
            }

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
              object-fit: contain;
              margin-bottom: 10px;
              animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }

            @keyframes popIn {
              from { transform: scale(0); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }

            .ForgotErrorMsgContainer {
              background-color: rgba(239, 68, 68, 0.1);
              border: 1px solid #ef4444; /* Designated Red */
              padding: 10px;
              border-radius: 8px;
              margin: 20px 32px 0;
              text-align: center;
              animation: fadeIn 0.3s ease forwards;
            }

            .ForgotErrorMsg {
              color: #ef4444 !important;
              font-size: 13px;
              font-weight: 500;
              margin: 0;
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
          `}
        </style>
        <div className="ForgotPasswordContainer">
          <div className='ForgotPasswordWrapper'>
        
        {/* */}
        <div className="ForgotPasswordHeader">
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

        {forgotError && (
          <div className="ForgotErrorMsgContainer">
            <p className="ForgotErrorMsg">{forgotError}</p>
          </div>
        )}

        {/*FOR INPUT EMAIL */}
        {step === 'email' && (
          <form onSubmit={handleSendCode}>
            <div>
              <label>Email</label>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="BtnSendCode">Send Code</button>
            <button type="button" className="BtnBackToLogin" onClick={handleBackToLogin}>Back to Login</button>
          </form>
        )}

        {/* FOR INPUT VERIFICATION CODE */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode}>
            <div className="CodeInputContainer">
              <label>Verification Code</label>
              <input 
                type="text" 
                placeholder="Enter 6-digit Code" 
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="BtnSubmitCode">Verify Code</button>
            <button type="button" className="BtnBack" onClick={() => setStep('email')}>
              Back to Email
            </button>
          </form>
        )}

        {/* FOR CREATE NEW PASSWORD */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div>
              <label>New Password</label>
              <div className="InputWrapper">
                <input 
                  type={showNew ? "text" : "password"} 
                  placeholder="Minimum 8 characters" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ToggleBtn"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label>Confirm Password</label>
              <div className="InputWrapper">
                <input 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="Re-type new password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ToggleBtn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="BtnResetPass" style={{ marginTop: '20px' }}>
              Update Password
            </button>
          </form>
        )}

        {/* FOR SUMACCESS MAGRESET PASS */}
        {step === 'success' && (
          <div className="SuccessContainer" style={{ textAlign: 'center', marginTop: '20px' }}>
            <img src={check_img} alt="Success" className="SuccessIcon" />
            <button 
              type="button" 
              className="BtnBackToLogin"
              style={{ marginTop: '20px', display: 'block', width: '100%' }}
              onClick={handleBackToLogin}
            >
             ← Go to Login Screen
            </button>
          </div>
        )}

      </div>
    </div>
    </>
    )
}

export default ForgotPassword;