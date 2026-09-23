import { useState } from 'react';

/**
 * ChangePassword Page
 * Shown automatically after first login.
 * Enforces password requirements before allowing submission.
 */
function ChangePassword() {
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  /* Password requirement checks */
  const checks = {
    length:    form.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(form.newPassword),
    number:    /[0-9]/.test(form.newPassword),
    special:   /[^A-Za-z0-9]/.test(form.newPassword),
  };
  const allChecksPassed = Object.values(checks).every(Boolean);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setChangePasswordError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setChangePasswordError('');
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
      if (newErrors.newPassword) {
        setChangePasswordError(newErrors.newPassword);
      } else if (newErrors.confirmPassword) {
        setChangePasswordError(newErrors.confirmPassword);
      }
      return;
    }

    setSaved(true);
  }

  /* Success Screen*/
  if (saved) {
    return (
      <>
        <style>{styles}</style>
        <div className="CPPageContainer">
          <div className="CPCard">
            <div className="CPSuccessScreen">
              <div className="CPSuccessIcon">🔐</div>
              <h2 className="CPSuccessTitle">Password Updated!</h2>
              <p className="CPSuccessDesc">
                Your new password has been saved successfully. You can now continue using the ICMDA
                desktop application.
              </p>
              <button className="CPSuccessBtn" onClick={() => setSaved(false)}>
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* Change Password Form */
  return (
    <>
      <style>{styles}</style>
      <div className="CPPageContainer">
        <div className="CPCard">
          {/* Header */}
          <div className="CPCardHeader">
            
            <h1 className="CPCardTitle">Set Your New Password</h1>
            <p className="CPCardSubtitle">
              You are required to set a new password before continuing.
            </p>
          </div>

          <form className="CPForm" onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className="CPFormGroup">
              <label className="CPLabel">
                New Password <span className="CPRequired">*</span>
              </label>
              <div className="CPInputWrapper">
                <input
                  className={`CPInput ${errors.newPassword ? 'cp-input-error' : ''}`}
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="CPToggleBtn"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
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

            {/* Confirm Password */}
            <div className="CPFormGroup">
              <label className="CPLabel">
                Confirm New Password <span className="CPRequired">*</span>
              </label>
              <div className="CPInputWrapper">
                <input
                  className={`CPInput ${errors.confirmPassword ? 'cp-input-error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="CPToggleBtn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Match indicator */}
              {form.confirmPassword && (
                <span
                  className={`CPMatchIndicator ${
                    form.newPassword === form.confirmPassword ? 'match-ok' : 'match-fail'
                  }`}
                >
                  {form.newPassword === form.confirmPassword
                    ? '✅ Passwords match'
                    : '❌ Passwords do not match'}
                </span>
              )}
            </div>

            {changePasswordError && (
              <div className="CPErrorMsgContainer">
                <p className="CPErrorMsg">{changePasswordError}</p>
              </div>
            )}

            <button type="submit" className="CPSubmitBtn">
              Save New Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

  .CPPageContainer {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdfdfd;
    padding: 32px 16px;
    box-sizing: border-box;
  }

  .CPCard {
    width: 100%;
    max-width: 460px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: CPSlideUp 0.35s ease;
  }

  @keyframes CPSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  
  .CPCardHeader {
    background: linear-gradient(135deg, #1E293B 0%, #0f172a 100%);
    padding: 32px 32px 28px;
    border-bottom: 4px solid #0D9488;
    text-align: center;
  }



  .CPCardTitle {
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px;
    font-family: 'Poppins', sans-serif;
  }

  .CPCardSubtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  /* Form*/
  .CPForm {
    padding: 28px 32px 36px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .CPFormGroup {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .CPLabel {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  .CPRequired {
    color: #ef4444;
  }

  /*Input with toggle*/
  .CPInputWrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .CPInput {
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

  .CPInput:focus {
    border-color: #0D9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    background: #fff;
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
    color: #64748b;
    transition: color 0.15s ease;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .CPToggleBtn:hover {
    color: #0D9488;
  }

  .CPError {
    font-size: 12px;
    color: #ef4444;
    margin-top: 2px;
  }

  .CPMatchIndicator {
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
  }

  .match-ok  { color: #16a34a; }
  .match-fail { color: #ef4444; }

  /* ── Password Requirements ── */
  .CPRequirements {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .CPReqTitle {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

  .req-met   { color: #166534; }
  .req-unmet { color: #94a3b8; }


  .CPSubmitBtn {
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

  .CPSubmitBtn:hover {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(13, 148, 136, 0.5);
  }

  .CPSubmitBtn:active {
    transform: translateY(0);
  }

  /*Success Screen*/
  .CPSuccessScreen {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 56px 32px;
    gap: 16px;
  }

  .CPSuccessIcon {
    font-size: 64px;
    animation: CPPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes CPPop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .CPSuccessTitle {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    font-family: 'Poppins', sans-serif;
  }

  .CPSuccessDesc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
    max-width: 340px;
  }

  .CPSuccessBtn {
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

  .CPSuccessBtn:hover {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(13, 148, 136, 0.45);
  }

  .CPErrorMsgContainer {
    background-color: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.5);
    padding: 10px 14px;
    border-radius: 8px;
    margin-top: 15px;
    margin-bottom: 5px;
    text-align: center;
  }

  .CPErrorMsg {
    color: #ef4444 !important;
    margin: 0;
    font-size: 13px;
    text-align: center;
    line-height: 1.5;
  }
`;

export default ChangePassword;
