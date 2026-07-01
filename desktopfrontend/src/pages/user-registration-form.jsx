import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'
import ImgSuccess from '../images/success_img.png'
import ImgTime from '../images/time_img.png'

// REGISTRATION PAGE FOR ADDED PERSONNEL
function UserRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    employeeId: '',
    email: 'invited.user@icmda.gov.ph', // pre-filled from deep link token
    agency: 'LEA-CIDG', // pre-filled from superadmin side
    region: 'NCR', // pre-filled from superadmin side
    contactNumber: '',
    department: '',
    position: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const REQUIRED_FIELDS = [
    'firstName',
    'lastName',
    'employeeId',
    'contactNumber',
    'department',
    'position',
  ];

  function validate() {
    const newErrors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field].trim()) {
        const label = {
          firstName: 'First Name',
          lastName: 'Last Name',
          employeeId: 'Employee ID',
          contactNumber: 'Contact Number',
          department: 'Department',
          position: 'Position',
        }[field];
        newErrors[field] = `${label} is required.`;
      }
    });
    return newErrors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitted(true);
  }

  /*Success Screen*/
  if (submitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="RegPageContainer">
          <div className="RegCard">
            <div className="RegSuccessScreen">
              <div className="RegSuccessIconLarge"><img src={ImgSuccess} alt="Success Icon" /></div>
              <h2 className="RegSuccessTitle">Registration Submitted!</h2>
              <p className="RegSuccessDesc">
                Your registration has been submitted. Please wait for the administrator to activate
                your account. You will receive an email once your account is ready.
              </p>
              <div className="RegSuccessTag">
                <span className='RegTimeIcon'><img src={ImgTime} alt="Hour glass icon" /></span> Pending Administrator Approval
              </div>
              
            </div>
          </div>
        </div>
      </>
    );
  }

  /* Registration Form for user side */
  return (
    <>
      <style>{styles}</style>
      <div className="RegPageContainer">
        <div className="RegCard">
          {/* Card Header */}
          <div className="RegCardHeader">
            <div className="RegSystemBadge">ICMDA</div>
            <h1 className="RegCardTitle">Complete Your Registration</h1>
            <p className="RegCardSubtitle">
              Please fill in your details to complete your personnel registration.
            </p>
          </div>

          <form className="RegForm" onSubmit={handleSubmit} noValidate>
            {/* Name Row */}
            <div className="RegFieldRow">
              <div className="RegFormGroup">
                <label className="RegLabel">
                  First Name <span className="RegRequired">*</span>
                </label>
                <input
                  className={`RegInput ${errors.firstName ? 'reg-input-error' : ''}`}
                  type="text"
                  name="firstName"
                  placeholder="Juan"
                  value={form.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <span className="RegError">{errors.firstName}</span>}
              </div>

              <div className="RegFormGroup">
                <label className="RegLabel">Middle Name</label>
                <input
                  className="RegInput"
                  type="text"
                  name="middleName"
                  placeholder="Optional"
                  value={form.middleName}
                  onChange={handleChange}
                />
              </div>

              <div className="RegFormGroup">
                <label className="RegLabel">
                  Last Name <span className="RegRequired">*</span>
                </label>
                <input
                  className={`RegInput ${errors.lastName ? 'reg-input-error' : ''}`}
                  type="text"
                  name="lastName"
                  placeholder="Dela Cruz"
                  value={form.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <span className="RegError">{errors.lastName}</span>}
              </div>
            </div>

            {/* Employee ID & Contact */}
            <div className="RegFieldRow">
              <div className="RegFormGroup">
                <label className="RegLabel">
                  Employee ID <span className="RegRequired">*</span>
                </label>
                <input
                  className={`RegInput ${errors.employeeId ? 'reg-input-error' : ''}`}
                  type="text"
                  name="employeeId"
                  placeholder="EMP-00123"
                  value={form.employeeId}
                  onChange={handleChange}
                />
                {errors.employeeId && <span className="RegError">{errors.employeeId}</span>}
              </div>

              <div className="RegFormGroup">
                <label className="RegLabel">
                  Contact Number <span className="RegRequired">*</span>
                </label>
                <input
                  className={`RegInput ${errors.contactNumber ? 'reg-input-error' : ''}`}
                  type="text"
                  name="contactNumber"
                  placeholder="09XX XXX XXXX"
                  value={form.contactNumber}
                  onChange={handleChange}
                />
                {errors.contactNumber && <span className="RegError">{errors.contactNumber}</span>}
              </div>
            </div>

            {/* Account Info (read-only) kase pre-filled na based sa superadmin entry */}
            <div className="RegFormGroup">
              <label className="RegLabel">
                Email Address{' '}
                <span className="RegReadonlyTag">pre-filled</span>
              </label>
              <input
                className="RegInput reg-input-readonly"
                type="email"
                name="email"
                value={form.email}
                readOnly
              />
            </div>

            <div className="RegFieldRow">
              <div className="RegFormGroup">
                <label className="RegLabel">
                  Agency{' '}
                  <span className="RegReadonlyTag">pre-filled</span>
                </label>
                <input
                  className="RegInput reg-input-readonly"
                  type="text"
                  name="agency"
                  value={form.agency}
                  readOnly
                />
              </div>

              <div className="RegFormGroup">
                <label className="RegLabel">
                  Region{' '}
                  <span className="RegReadonlyTag">pre-filled</span>
                </label>
                <input
                  className="RegInput reg-input-readonly"
                  type="text"
                  name="region"
                  value={form.region}
                  readOnly
                />
              </div>
            </div>

            {/* Department & Position */}
            <div className="RegFieldRow">
              <div className="RegFormGroup">
                <label className="RegLabel">
                  Department <span className="RegRequired">*</span>
                </label>
                <input
                  className={`RegInput ${errors.department ? 'reg-input-error' : ''}`}
                  type="text"
                  name="department"
                  placeholder="e.g. Operations Division"
                  value={form.department}
                  onChange={handleChange}
                />
                {errors.department && <span className="RegError">{errors.department}</span>}
              </div>

              <div className="RegFormGroup">
                <label className="RegLabel">
                  Position <span className="RegRequired">*</span>
                </label>
                <input
                  className={`RegInput ${errors.position ? 'reg-input-error' : ''}`}
                  type="text"
                  name="position"
                  placeholder="e.g. Senior Analyst"
                  value={form.position}
                  onChange={handleChange}
                />
                {errors.position && <span className="RegError">{errors.position}</span>}
              </div>
            </div>

            <button type="submit" className="RegSubmitBtn">
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </>
  );
}


const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

  .RegPageContainer {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdfdfd;
    padding: 32px 16px;
    box-sizing: border-box;
  }

  .RegCard {
    width: 100%;
    max-width: 700px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: RegSlideUp 0.35s ease;
  }

  @keyframes RegSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /*Card Header*/
  .RegCardHeader {
    background: linear-gradient(135deg, #1E293B 0%, #0f172a 100%);
    padding: 32px 36px;
    border-bottom: 4px solid #0D9488;
    text-align: center;
  }

  .RegSystemBadge {
    display: inline-block;
    background: rgba(13, 148, 136, 0.15);
    border: 1px solid rgba(13, 148, 136, 0.4);
    color: #0D9488;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 4px 14px;
    border-radius: 20px;
    margin-bottom: 12px;
  }

  .RegCardTitle {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px;
    font-family: 'Poppins', sans-serif;
  }

  .RegCardSubtitle {
    font-size: 13.5px;
    color: #94a3b8;
    margin: 0;
    line-height: 1.5;
  }

  /*Form*/
  .RegForm {
    padding: 32px 36px 36px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .RegFieldRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .RegFormGroup {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .RegLabel {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .RegRequired { color: #ef4444; }

  .RegReadonlyTag {
    font-size: 10.5px;
    font-weight: 600;
    color: #0D9488;
    background: rgba(13, 148, 136, 0.1);
    border: 1px solid rgba(13, 148, 136, 0.3);
    padding: 1px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .RegInput {
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 9px;
    font-size: 14px;
    color: #111827;
    background: #f9fafb;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
    width: 100%;
    font-family: 'Inter', sans-serif;
  }

  .RegInput:focus {
    border-color: #0D9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
    background: #fff;
  }

  .reg-input-error {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  }

  .reg-input-readonly {
    background: #f1f5f9 !important;
    color: #64748b !important;
    cursor: not-allowed;
    border-color: #e2e8f0 !important;
  }

  .RegSelect {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }

  .RegError {
    font-size: 12px;
    color: #ef4444;
    margin-top: 2px;
  }

  /* Submit Button*/
  .RegSubmitBtn {
    margin-top: 8px;
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

  .RegSubmitBtn:hover {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(13, 148, 136, 0.5);
  }

  .RegSubmitBtn:active {
    transform: translateY(0);
  }

  /* Success Screen*/
  .RegSuccessScreen {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 56px 36px;
    gap: 16px;
  }

  .RegSuccessIconLarge img{
    width: 100px !important;
    animation: RegPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes RegPop {
    from { transform: scale(0); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .RegSuccessTitle {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    font-family: 'Poppins', sans-serif;
  }

  .RegSuccessDesc {
    font-size: 14px;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
    max-width: 420px;
  }

  .RegSuccessTag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #92400e;
    margin-top: 8px;
  }
    .RegTimeIcon img{
    width: 18px;
    height: auto;
    margin-top: 5px;
  }

`;

export default UserRegistration;
