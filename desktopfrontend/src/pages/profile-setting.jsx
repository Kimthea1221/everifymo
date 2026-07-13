import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building2, 
  MapPin, 
  Lock, 
  Phone, 
  Briefcase, 
  Save, 
  X, 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Fingerprint
} from 'lucide-react';

import Sidebar from './component/sidebar';
import TopBar from './component/top-bar';

// Load layouts for the respective workspaces
import './fdafolder/fda-css.css';
import './leacidgfolder/lea-css.css';
import './superadminfolder/superadmin-css.css';

/**
 * PROFILE & SETTINGS COMPONENT FOR ICMDA
 * Used by both FDA, LEA-CIDG, and Super Admin personnel.
 * Styled with neutral colors (#13213C Navy, #1F2937 Slate, #FCA311 Gold Accent).
 * Wraps itself in the corresponding dashboard layout (Sidebar + TopBar) depending on logged-in agency.
 */
function ProfileSetting() {
  const navigate = useNavigate();

  // Determine logged-in agency from local storage to dynamically load the respective default data and layout wrappers
  const loggedAgency = (localStorage.getItem('agency') || 'FDA').toUpperCase();
  const defaultAgency = loggedAgency === 'CIDG' || loggedAgency === 'LEA' || loggedAgency === 'LEA-CIDG' ? 'LEA-CIDG' : 'FDA';

  // Primary user profile state pre-filled based on logged-in agency
  const [form, setForm] = useState({
    firstName: defaultAgency === 'FDA' ? 'Kristine' : 'Jun',
    middleName: defaultAgency === 'FDA' ? '' : '',
    lastName: defaultAgency === 'FDA' ? 'Fajardo' : 'Cat',
    employeeId: defaultAgency === 'FDA' ? 'EMP-2026-0892' : 'CIDG-2026-0391',
    email: defaultAgency === 'FDA' ? 'kristine.fajardo@gmail.com' : 'jun.cat@gmail.com',
    agency: defaultAgency, // Pre-filled and read-only
    region: defaultAgency === 'FDA' ? 'Region IV-A (CALABARZON)' : 'NCR - National Capital Region',
    contactNumber: defaultAgency === 'FDA' ? '09171234567' : '09228765432',
    department: defaultAgency === 'FDA' ? 'Regulation and Enforcement Division' : 'Anti-Fraud and Commercial Crimes Unit',
    position: defaultAgency === 'FDA' ? 'Senior Food and Drug Officer' : 'Chief Investigator',
  });

  // Password / Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form interaction/validation states
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message: string }

  // Fields that cannot be left empty
  const REQUIRED_FIELDS = [
    'firstName',
    'lastName',
    'employeeId',
    'contactNumber',
    'department',
    'position'
  ];

  /* 
    BACKEND INTEGRATION NOTE (Fetch Profile):
    Use a useEffect hook to retrieve the current user's profile details on component mount:
    
    useEffect(() => {
      async function fetchProfile() {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setForm(data);
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
        }
      }
      fetchProfile();
    }, []);
  */

  // Form field inputs handler
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Password fields input handler
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation before submitting
  const validate = () => {
    const newErrors = {};

    // Validate Profile Required Fields
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field] || !form[field].trim()) {
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

    // Validate Contact Number Format
    const phoneRegex = /^[0-9+\s-]{7,15}$/;
    if (form.contactNumber && !phoneRegex.test(form.contactNumber.trim())) {
      newErrors.contactNumber = 'Please enter a valid contact number format.';
    }

    // Validate Password changes if user starts typing a password
    const { currentPassword, newPassword, confirmPassword } = security;
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required to update security credentials.';
      }
      if (!newPassword) {
        newErrors.newPassword = 'New password is required.';
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'New password must be at least 8 characters long.';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return newErrors;
  };

  // Submit / Save form changes
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaveStatus({
        type: 'error',
        message: 'Kindly address the validation errors before saving your changes.',
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    /* 
      BACKEND INTEGRATION NOTE (Save Changes & Update Password):
      Perform PUT or POST calls to update details:
      
      try {
        const profileRes = await fetch('/api/user/profile/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
        
        if (security.newPassword) {
          await fetch('/api/user/profile/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentPassword: security.currentPassword,
              newPassword: security.newPassword
            })
          });
        }
        setSaveStatus({ type: 'success', message: 'Changes saved successfully.' });
      } catch (err) {
        setSaveStatus({ type: 'error', message: 'API error. Failed to save changes.' });
      }
    */

    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus({
        type: 'success',
        message: 'Your profile settings have been successfully updated.',
      });
      
      // Clear security inputs on successful submit
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }, 1200);
  };

  // Revert updates
  const handleCancel = () => {
    setForm({
      firstName: defaultAgency === 'FDA' ? 'Kristine' : 'Jun',
      middleName: defaultAgency === 'FDA' ? '' : '',
      lastName: defaultAgency === 'FDA' ? 'Fajardo' : 'Cat',
      employeeId: defaultAgency === 'FDA' ? 'EMP-2026-0892' : 'CIDG-2026-0391',
      email: defaultAgency === 'FDA' ? 'kristine.fajardo@gmail.com' : 'juna.cat@gmail.com',
      agency: defaultAgency,
      region: defaultAgency === 'FDA' ? 'Region IV-A (CALABARZON)' : 'NCR - National Capital Region',
      contactNumber: defaultAgency === 'FDA' ? '09171234567' : '09228765432',
      department: defaultAgency === 'FDA' ? 'Regulation and Enforcement Division' : 'Anti-Fraud and Commercial Crimes Unit',
      position: defaultAgency === 'FDA' ? 'Senior Food and Drug Officer' : 'Chief Investigator',
    });

    setSecurity({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    setErrors({});
    setSaveStatus(null);

    /* 
      BACKEND INTEGRATION:
      Optionally reload fresh database records or redirect the user.
      navigate(-1);
    */
    console.log('Profile edit cancelled. Reverted to default settings.');
  };

  const isFDA = form.agency === 'FDA';

  // Determine layout classes and sidebar settings based on agency role
  const agencyLower = (localStorage.getItem('agency') || 'fda').toLowerCase();
  
  let sidebarType = 'FDA';
  let mainContainerClass = 'FdaDashboardMain';
  let contentContainerClass = 'FdaContentContainer';
  let mainFeedClass = 'FdaMainFeed';

  if (agencyLower === 'superadmin') {
    sidebarType = 'SUPER_ADMIN';
    mainContainerClass = 'SuperadminMainContainer';
    contentContainerClass = 'SuperadminContentContainer';
    mainFeedClass = 'SuperadminMainfeed';
  } else if (agencyLower === 'cidg' || agencyLower === 'lea' || agencyLower === 'lea-cidg') {
    sidebarType = 'LEA';
    mainContainerClass = 'LeaDashboardMain';
    contentContainerClass = 'LeaContentContainer';
    mainFeedClass = 'LeaMainfeed';
  }

  return (
    <>
      <style>{styles}</style>
      
      <div className={mainContainerClass}>
        <Sidebar sidebarType={sidebarType} />
        
        <div className={contentContainerClass}>
          <TopBar />
          
          <div className={mainFeedClass}>
            <div className="ProfileContainer">
              
              {/* Profile Header */}
              <div className={`ProfileHeaderCard ${isFDA ? 'agency-fda' : 'agency-lea'}`}>
                <div className="ProfileAvatarCircle">
                  <User size={48} />
                </div>

                <div className="ProfileHeaderInfo">
                  <h1 className="ProfileHeaderTitle">
                    {form.firstName} {form.middleName ? form.middleName + ' ' : ''}{form.lastName}
                    <span className="ProfileAgencyBadge">{form.agency}</span>
                  </h1>
                  <div className="ProfileHeaderMeta">
                    <div className="ProfileMetaItem">
                      <Mail size={14} />
                      <span>{form.email}</span>
                    </div>
                    <div className="ProfileMetaItem">
                      <Building2 size={14} />
                      <span>{form.department}</span>
                    </div>
                    <div className="ProfileMetaItem">
                      <MapPin size={14} />
                      <span>{form.region}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status notification banner */}
              {saveStatus && (
                <div className={`ProfileStatusBanner ${
                  saveStatus.type === 'success' ? 'ProfileStatusSuccess' : 'ProfileStatusError'
                }`}>
                  {saveStatus.type === 'success' ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span>{saveStatus.message}</span>
                </div>
              )}

              {/* Form sections */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="ProfileGrid">
                  
                  {/* Left Column: Account & Profile details */}
                  <div className="ProfileCard">
                    <div className="ProfileCardHeader">
                      <h2 className="ProfileCardTitle">
                        <User size={18} />
                        Account & Personnel Information
                      </h2>
                      <p className="ProfileCardDesc">
                        Manage your general profile details and agency identification settings.
                      </p>
                    </div>

                    {/* Read Only Fields Container */}
                    <div className="ProfileReadonlySection">
                      <div className="ProfileReadonlyTitle">
                        <Shield size={13} />
                        Official Account Classification (Read-Only)
                      </div>
                      
                      <div className="ProfileFormRow">
                        <div className="ProfileFormGroup">
                          <label className="ProfileLabel">
                            Email Address
                            <span className="ProfileReadonlyBadge">Read-Only</span>
                          </label>
                          <div className="ProfileInputWrapper">
                            <Mail className="ProfileInputIcon" size={16} />
                            <input
                              className="ProfileInput ProfileInputReadonly"
                              type="email"
                              value={form.email}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="ProfileFormGroup">
                          <label className="ProfileLabel">
                            Affiliated Agency
                            <span className="ProfileReadonlyBadge">Read-Only</span>
                          </label>
                          <div className="ProfileInputWrapper">
                            <Building2 className="ProfileInputIcon" size={16} />
                            <input
                              className="ProfileInput ProfileInputReadonly"
                              type="text"
                              value={form.agency}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="ProfileFormGroup">
                          <label className="ProfileLabel">
                            Assigned Region
                            <span className="ProfileReadonlyBadge">Read-Only</span>
                          </label>
                          <div className="ProfileInputWrapper">
                            <MapPin className="ProfileInputIcon" size={16} />
                            <input
                              className="ProfileInput ProfileInputReadonly"
                              type="text"
                              value={form.region}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Editable Fields Section */}
                    <div className="ProfileFormRow">
                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">
                          First Name <span className="ProfileRequired">*</span>
                        </label>
                        <div className="ProfileInputWrapper">
                          <User className="ProfileInputIcon" size={16} />
                          <input
                            className={`ProfileInput ${errors.firstName ? 'ProfileInputError' : ''}`}
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleProfileChange}
                            placeholder="Enter first name"
                          />
                        </div>
                        {errors.firstName && (
                          <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.firstName}</span>
                        )}
                      </div>

                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">Middle Name</label>
                        <div className="ProfileInputWrapper">
                          <User className="ProfileInputIcon" size={16} />
                          <input
                            className="ProfileInput"
                            type="text"
                            name="middleName"
                            value={form.middleName}
                            onChange={handleProfileChange}
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">
                          Last Name <span className="ProfileRequired">*</span>
                        </label>
                        <div className="ProfileInputWrapper">
                          <User className="ProfileInputIcon" size={16} />
                          <input
                            className={`ProfileInput ${errors.lastName ? 'ProfileInputError' : ''}`}
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleProfileChange}
                            placeholder="Enter last name"
                          />
                        </div>
                        {errors.lastName && (
                          <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.lastName}</span>
                        )}
                      </div>
                    </div>

                    <div className="ProfileFormRow">
                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">
                          Employee ID<span className="ProfileRequired">*</span>
                        </label>
                        <div className="ProfileInputWrapper">
                          <Fingerprint className="ProfileInputIcon" size={16} />
                          <input
                            className={`ProfileInput ${errors.employeeId ? 'ProfileInputError' : ''}`}
                            type="text"
                            name="employeeId"
                            value={form.employeeId}
                            onChange={handleProfileChange}
                            placeholder="EMP-XXXXX"
                          />
                        </div>
                        {errors.employeeId && (
                          <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.employeeId}</span>
                        )}
                      </div>

                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">
                          Contact Number <span className="ProfileRequired">*</span>
                        </label>
                        <div className="ProfileInputWrapper">
                          <Phone className="ProfileInputIcon" size={16} />
                          <input
                            className={`ProfileInput ${errors.contactNumber ? 'ProfileInputError' : ''}`}
                            type="text"
                            name="contactNumber"
                            value={form.contactNumber}
                            onChange={handleProfileChange}
                            placeholder="e.g. 0917XXXXXXX"
                          />
                        </div>
                        {errors.contactNumber && (
                          <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.contactNumber}</span>
                        )}
                      </div>
                    </div>

                    <div className="ProfileFormRow">
                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">
                          Department <span className="ProfileRequired">*</span>
                        </label>
                        <div className="ProfileInputWrapper">
                          <Building2 className="ProfileInputIcon" size={16} />
                          <input
                            className={`ProfileInput ${errors.department ? 'ProfileInputError' : ''}`}
                            type="text"
                            name="department"
                            value={form.department}
                            onChange={handleProfileChange}
                            placeholder="Specify department"
                          />
                        </div>
                        {errors.department && (
                          <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.department}</span>
                        )}
                      </div>

                      <div className="ProfileFormGroup">
                        <label className="ProfileLabel">
                          Position / Job Title <span className="ProfileRequired">*</span>
                        </label>
                        <div className="ProfileInputWrapper">
                          <Briefcase className="ProfileInputIcon" size={16} />
                          <input
                            className={`ProfileInput ${errors.position ? 'ProfileInputError' : ''}`}
                            type="text"
                            name="position"
                            value={form.position}
                            onChange={handleProfileChange}
                            placeholder="Specify position"
                          />
                        </div>
                        {errors.position && (
                          <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.position}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Security/Password Management */}
                  <div className="ProfileCard">
                    <div className="ProfileCardHeader">
                      <h2 className="ProfileCardTitle">
                        <Lock size={18} />
                        Security Credentials
                      </h2>
                      <p className="ProfileCardDesc">
                        Update your system password here. Leave blank if you do not wish to modify.
                      </p>
                    </div>

                    <div className="ProfileFormGroup">
                      <label className="ProfileLabel">Current Password</label>
                      <div className="ProfileInputWrapper">
                        <Key className="ProfileInputIcon" size={16} />
                        <input
                          className={`ProfileInput ${errors.currentPassword ? 'ProfileInputError' : ''}`}
                          type={showCurrent ? 'text' : 'password'}
                          name="currentPassword"
                          value={security.currentPassword}
                          onChange={handleSecurityChange}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="ProfilePasswordToggle"
                          onClick={() => setShowCurrent(!showCurrent)}
                          aria-label="Toggle Password Visibility"
                        >
                          {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.currentPassword}</span>
                      )}
                    </div>

                    <div className="ProfileFormGroup">
                      <label className="ProfileLabel">New Password</label>
                      <div className="ProfileInputWrapper">
                        <Lock className="ProfileInputIcon" size={16} />
                        <input
                          className={`ProfileInput ${errors.newPassword ? 'ProfileInputError' : ''}`}
                          type={showNew ? 'text' : 'password'}
                          name="newPassword"
                          value={security.newPassword}
                          onChange={handleSecurityChange}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="ProfilePasswordToggle"
                          onClick={() => setShowNew(!showNew)}
                          aria-label="Toggle Password Visibility"
                        >
                          {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.newPassword}</span>
                      )}
                    </div>

                    <div className="ProfileFormGroup">
                      <label className="ProfileLabel">Confirm New Password</label>
                      <div className="ProfileInputWrapper">
                        <Lock className="ProfileInputIcon" size={16} />
                        <input
                          className={`ProfileInput ${errors.confirmPassword ? 'ProfileInputError' : ''}`}
                          type={showConfirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={security.confirmPassword}
                          onChange={handleSecurityChange}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="ProfilePasswordToggle"
                          onClick={() => setShowConfirm(!showConfirm)}
                          aria-label="Toggle Password Visibility"
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className="ProfileFieldError"><AlertCircle size={12} /> {errors.confirmPassword}</span>
                      )}
                    </div>

                    {/* Password Policy Card */}
                    <div className="ProfileSecurityTips">
                      <div className="ProfileSecurityTipsTitle">
                        <Shield size={14} style={{ color: '#D97706' }} />
                        Password Requirements
                      </div>
                      <ul className="ProfileSecurityTipsList">
                        <li>Minimum length of 8 characters</li>
                        <li>Include upper & lowercase letters</li>
                        <li>Include numbers & special characters</li>
                      </ul>
                    </div>
                  </div>

                  {/* Global Actions Panel */}
                  <div className="ProfileActionsContainer">
                    <button
                      type="button"
                      className="ProfileBtn ProfileBtnSecondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X size={16} />
                      Cancel Changes
                    </button>

                    <button
                      type="submit"
                      className="ProfileBtn ProfileBtnPrimary"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="ProfileSpinner"></span>
                          Saving Profile...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Scoped and clean CSS configurations for the component
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

  .ProfileContainer {
    --p-dark: #030303;
    --p-slate: #1F2937;
    --p-navy: #13213C;
    --p-green: #1B4332;
    --p-gold: #FCA311;
    --p-gold-dark: #D97706;
    --p-light-gray: #EDEDED;
    --p-white: #FDFDFD;
    --p-error: #B91C1C;
    
    width: 100%;
    padding: 24px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--p-slate);
    box-sizing: border-box;
    animation: ProfileFadeIn 0.35s ease-out;
  }

  .ProfileContainer * {
    box-sizing: border-box;
  }

  @keyframes ProfileFadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Header Banner */
  .ProfileHeaderCard {
    border-radius: 16px;
    padding: 32px;
    color: var(--p-white);
    box-shadow: 0 10px 25px rgba(19, 33, 60, 0.15);
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    border-bottom: 4px solid var(--p-gold);
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .ProfileHeaderCard.agency-fda {
    background: linear-gradient(135deg, var(--p-green) 0%, #0f241c 100%);
  }

  .ProfileHeaderCard.agency-lea {
    background: linear-gradient(135deg, var(--p-navy) 0%, #0c1526 100%);
  }

  @media (max-width: 640px) {
    .ProfileHeaderCard {
      flex-direction: column;
      text-align: center;
      padding: 24px 16px;
      gap: 16px;
    }
  }

  .ProfileHeaderCard::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(252, 163, 17, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  /* Static Circle Avatar */
  .ProfileAvatarCircle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid rgba(253, 163, 17, 0.4);
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--p-white);
    flex-shrink: 0;
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    transition: border-color 0.3s ease;
  }

  .ProfileAvatarCircle:hover {
    border-color: var(--p-gold);
  }

  .ProfileHeaderInfo {
    flex-grow: 1;
  }

  .ProfileHeaderTitle {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  @media (max-width: 640px) {
    .ProfileHeaderTitle {
      justify-content: center;
    }
  }

  .ProfileAgencyBadge {
    font-size: 11px;
    font-weight: 700;
    background: var(--p-gold);
    color: var(--p-navy);
    padding: 2px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-flex;
    align-items: center;
  }

  .ProfileHeaderMeta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13.5px;
    color: rgba(253, 253, 253, 0.85);
  }

  @media (max-width: 640px) {
    .ProfileHeaderMeta {
      justify-content: center;
    }
  }

  .ProfileMetaItem {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.08);
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Status notifications */
  .ProfileStatusBanner {
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 550;
    animation: ProfileSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes ProfileSlideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ProfileStatusSuccess {
    background: rgba(27, 67, 50, 0.08);
    border: 1.5px solid var(--p-green);
    color: var(--p-green);
  }

  .ProfileStatusError {
    background: rgba(185, 28, 28, 0.08);
    border: 1.5px solid var(--p-error);
    color: var(--p-error);
  }

  /* Two Column Grid */
  .ProfileGrid {
    display: grid;
    grid-template-columns: 1.8fr 1fr;
    gap: 24px;
  }

  @media (max-width: 968px) {
    .ProfileGrid {
      grid-template-columns: 1fr;
    }
  }

  /* Custom Card layout */
  .ProfileCard {
    background: var(--p-white);
    border-radius: 14px;
    border: 1.5px solid var(--p-light-gray);
    box-shadow: 0 4px 12px rgba(3, 3, 3, 0.02);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.25s ease;
  }

  .ProfileCard:hover {
    box-shadow: 0 8px 24px rgba(3, 3, 3, 0.05);
  }

  .ProfileCardHeader {
    border-bottom: 1.5px solid var(--p-light-gray);
    padding-bottom: 16px;
    margin-bottom: 4px;
  }

  .ProfileCardTitle {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--p-navy);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ProfileCardDesc {
    font-size: 13px;
    color: #64748b;
    margin: 6px 0 0 0;
    line-height: 1.4;
  }

  /* Read-Only Credentials Section */
  .ProfileReadonlySection {
    background: #f8fafc;
    border-radius: 10px;
    border: 1.5px dashed #cbd5e1;
    padding: 18px;
    margin-bottom: 6px;
  }

  .ProfileReadonlyTitle {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: #475569;
    letter-spacing: 0.8px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Form Elements */
  .ProfileFormRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .ProfileFormGroup {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ProfileLabel {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--p-slate);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ProfileRequired {
    color: var(--p-error);
  }

  .ProfileInputWrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .ProfileInputIcon {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    pointer-events: none;
  }

  .ProfileInput {
    width: 100%;
    padding: 11px 12px 11px 38px;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    color: var(--p-slate);
    background: #ffffff;
    outline: none;
    transition: all 0.2s ease;
    font-family: inherit;
  }

  .ProfileInput:focus {
    border-color: var(--p-navy);
    box-shadow: 0 0 0 3px rgba(19, 33, 60, 0.12);
  }

  .ProfileInputError {
    border-color: var(--p-error) !important;
  }

  .ProfileInputError:focus {
    box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12) !important;
  }

  .ProfileInputReadonly {
    background: #f1f5f9;
    color: #64748b;
    cursor: not-allowed;
    border-color: #e2e8f0;
  }

  .ProfileInputReadonly:focus {
    border-color: #e2e8f0;
    box-shadow: none;
  }

  .ProfileReadonlyBadge {
    font-size: 9.5px;
    background: #e2e8f0;
    color: #475569;
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.3px;
  }

  /* Password eye-toggle button */
  .ProfilePasswordToggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .ProfilePasswordToggle:hover {
    color: var(--p-navy);
  }

  /* Input Error Messages */
  .ProfileFieldError {
    font-size: 11.5px;
    color: var(--p-error);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Global Actions Bottom bar */
  .ProfileActionsContainer {
    grid-column: span 2;
    display: flex;
    justify-content: flex-end;
    gap: 14px;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1.5px solid var(--p-light-gray);
  }

  @media (max-width: 968px) {
    .ProfileActionsContainer {
      grid-column: span 1;
    }
  }

  .ProfileBtn {
    padding: 11px 24px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Poppins', sans-serif;
  }

  .ProfileBtnPrimary {
    background: var(--p-navy);
    color: var(--p-white);
    border: 1.5px solid var(--p-navy);
    box-shadow: 0 4px 10px rgba(19, 33, 60, 0.2);
  }

  .ProfileBtnPrimary:hover:not(:disabled) {
    background: #1e293b;
    border-color: #1e293b;
    transform: translateY(-1.5px);
    box-shadow: 0 6px 14px rgba(19, 33, 60, 0.25);
  }

  .ProfileBtnPrimary:active:not(:disabled) {
    transform: translateY(0);
  }

  .ProfileBtnPrimary:disabled {
    background: #94a3b8;
    border-color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
  }

  .ProfileBtnSecondary {
    background: var(--p-white);
    color: var(--p-slate);
    border: 1.5px solid #cbd5e1;
  }

  .ProfileBtnSecondary:hover:not(:disabled) {
    background: var(--p-light-gray);
    border-color: #94a3b8;
  }

  .ProfileBtnSecondary:active:not(:disabled) {
    background: #e2e8f0;
  }

  /* Loader spinner */
  .ProfileSpinner {
    width: 16px;
    height: 16px;
    border: 2.5px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: var(--p-white);
    animation: ProfileSpin 0.85s linear infinite;
  }

  @keyframes ProfileSpin {
    to { transform: rotate(360deg); }
  }

  /* Security instructions block */
  .ProfileSecurityTips {
    background: #fdfdfd;
    border: 1.5px solid var(--p-light-gray);
    border-radius: 10px;
    padding: 16px;
    font-size: 13px;
    color: #475569;
    margin-top: 6px;
  }

  .ProfileSecurityTipsTitle {
    font-weight: 700;
    color: var(--p-slate);
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ProfileSecurityTipsList {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    line-height: 1.4;
  }
`;

export default ProfileSetting;
