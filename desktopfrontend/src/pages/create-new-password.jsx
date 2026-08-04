import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateNewPassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const checks = {
    length: form.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(form.newPassword),
    number: /[0-9]/.test(form.newPassword),
    special: /[^A-Za-z0-9]/.test(form.newPassword),
  };
  const allChecksPassed = Object.values(checks).every(Boolean);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    const newErrors = {};

    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (!allChecksPassed) {
      newErrors.newPassword = 'Password does not meet all requirements.';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError(Object.values(newErrors)[0]);
      return;
    }

    setSubmitting(true);

    try {
      // 🔌 BACKEND: Submit new password to API endpoint
      // const response = await fetch('http://127.0.0.1:8000/auth/password/create-from-invite', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     token: inviteToken,
      //     new_password: form.newPassword,
      //   }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.detail || 'Failed to create password.');
      // }

      // ⚠️ REMOVE THIS: Simulated frontend delay and success
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSubmitting(false);
      setSaved(true);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'An error occurred.');
    }
  }

  function handleGoToLogin() {
    navigate('/superadmin-login');
  }

  if (saved) {
    return (
      <>
        <style>{styles}</style>
        <div className="CNPPageContainer">
          <div className="CNPCard">
            <div className="CNPSuccessScreen">
              <div className="CNPSuccessIcon">🔐</div>
              <h2 className="CNPSuccessTitle">Password Created!</h2>
              <p className="CNPSuccessDesc">
                Your Superadmin password has been created successfully. You can now proceed to log in to your Superadmin account.
              </p>
              <button className="CNPSuccessBtn" onClick={handleGoToLogin}>
                Go to Superadmin Login
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="CNPPageContainer">
        <div className="CNPCard">
          <div className="CNPCardHeader">
            <h1 className="CNPCardTitle">Create Your Superadmin Password</h1>
            <p className="CNPCardSubtitle">
              Welcome! Please set a secure password for your Superadmin personnel account before logging in.
            </p>
          </div>

          <form className="CNPForm" onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="CNPFormGroup">
              <label className="CNPLabel">
                New Password <span className="CNPRequired">*</span>
              </label>
              <div className="CNPInputWrapper">
                <input
                  className={`CNPInput ${errors.newPassword ? 'cnp-input-error' : ''}`}
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="CNPToggleBtn"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="CNPFormGroup">
              <label className="CNPLabel">
                Confirm Password <span className="CNPRequired">*</span>
              </label>
              <div className="CNPInputWrapper">
                <input
                  className={`CNPInput ${errors.confirmPassword ? 'cnp-input-error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="CNPToggleBtn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>

              {form.confirmPassword && (
                <span
                  className={`CNPMatchIndicator ${
                    form.newPassword === form.confirmPassword ? 'match-ok' : 'match-fail'
                  }`}
                >
                  {form.newPassword === form.confirmPassword
                    ? '✅ Passwords match'
                    : '❌ Passwords do not match'}
                </span>
              )}
            </div>

            {/* Password Requirements Checklist */}
            <div className="CNPRequirements">
              <p className="CNPReqTitle">Password requirements:</p>
              <ul className="CNPReqList">
                <li className={`CNPReqItem ${checks.length ? 'req-met' : 'req-unmet'}`}>
                  {checks.length ? '✅' : '❌'} At least 8 characters
                </li>
                <li className={`CNPReqItem ${checks.uppercase ? 'req-met' : 'req-unmet'}`}>
                  {checks.uppercase ? '✅' : '❌'} At least one uppercase letter
                </li>
                <li className={`CNPReqItem ${checks.number ? 'req-met' : 'req-unmet'}`}>
                  {checks.number ? '✅' : '❌'} At least one number
                </li>
                <li className={`CNPReqItem ${checks.special ? 'req-met' : 'req-unmet'}`}>
                  {checks.special ? '✅' : '❌'} At least one special character
                </li>
              </ul>
            </div>

            {submitError && (
              <div className="CNPErrorMsgContainer">
                <p className="CNPErrorMsg">{submitError}</p>
              </div>
            )}

            <button type="submit" className="CNPSubmitBtn" disabled={submitting}>
              {submitting ? 'Creating Password…' : 'Create Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

  .CNPPageContainer {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdfdfd;
    padding: 32px 16px;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  .CNPCard {
    width: 100%;
    max-width: 460px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    animation: CNPSlideUp 0.35s ease;
  }

  @keyframes CNPSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .CNPCardHeader {
    background: linear-gradient(135deg, #1E293B 0%, #0f172a 100%);
    padding: 32px 32px 28px;
    border-bottom: 4px solid #0D9488;
    text-align: center;
  }

  .CNPCardTitle {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px;
    font-family: 'Poppins', sans-serif;
  }

  .CNPCardSubtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  .CNPForm {
    padding: 28px 32px 36px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .CNPFormGroup {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .CNPLabel {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  .CNPRequired {
    color: #ef4444;
  }

  .CNPInputWrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .CNPInput {
    width: 100%;
    padding: 11px 44px 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 9px;
    font-size: 14px;
    color: #111827;
    background: #f9fafb;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  .CNPInput:focus {
    border-color: #0D9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    background: #fff;
  }

  .cnp-input-error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }

  .CNPToggleBtn {
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

  .CNPToggleBtn:hover {
    color: #0D9488;
  }

  .CNPMatchIndicator {
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
  }

  .match-ok { color: #16a34a; }
  .match-fail { color: #ef4444; }

  .CNPRequirements {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .CNPReqTitle {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .CNPReqList {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .CNPReqItem {
    font-size: 13px;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .req-met { color: #166534; }
  .req-unmet { color: #94a3b8; }

  .CNPSubmitBtn {
    margin-top: 4px;
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
    font-family: 'Poppins', sans-serif;
    letter-spacing: 0.3px;
  }

  .CNPSubmitBtn:hover {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(13, 148, 136, 0.5);
  }

  .CNPSubmitBtn:active {
    transform: translateY(0);
  }

  .CNPSuccessScreen {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 56px 32px;
    gap: 16px;
  }

  .CNPSuccessIcon {
    font-size: 64px;
    animation: CNPPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes CNPPop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .CNPSuccessTitle {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    font-family: 'Poppins', sans-serif;
  }

  .CNPSuccessDesc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
    max-width: 340px;
  }

  .CNPSuccessBtn {
    margin-top: 8px;
    padding: 12px 32px;
    background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: 0 6px 18px rgba(13, 148, 136, 0.35);
    font-family: 'Poppins', sans-serif;
  }

  .CNPSuccessBtn:hover {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(13, 148, 136, 0.45);
  }

  .CNPErrorMsgContainer {
    background-color: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.5);
    padding: 10px 14px;
    border-radius: 8px;
    margin-top: 10px;
    text-align: center;
  }

  .CNPErrorMsg {
    color: #ef4444 !important;
    margin: 0;
    font-size: 13px;
    text-align: center;
    line-height: 1.5;
  }
`;

export default CreateNewPassword;