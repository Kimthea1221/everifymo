import { useEffect } from 'react'
// added useEffect and useNavigate
import {BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/login-user.jsx'
 {/* LEA-CIDG PAGES */}
import LeaDashboard from './pages/leacidgfolder/lea-dashboard.jsx';
import LeaWalkinComplaints from './pages/leacidgfolder/lea-walkin-complaints.jsx';
import LeaVerificationRequest from './pages/leacidgfolder/lea-verification-request.jsx';
import LeaNewIntake from './pages/leacidgfolder/lea-new-intake.jsx';
import LeaSavedDraft from './pages/leacidgfolder/lea-saved-draft.jsx';

{/* OTP EMAIL TEMPLATE */}
import OtpEmailTemplate from './pages/emailtemplates/otp-email-template.jsx';
import SuperadminOtpEmail from './pages/emailtemplates/superadmin-otp-email.jsx';


import DeepLinkStatus from './pages/emailtemplates/invitation-status.jsx'
import ProfileSetting from './pages/profile-setting.jsx';


{/* SUPERADMIN PAGES */}
import SuperAdminLogin from './pages/superadminfolder/superadmin-login.jsx';
import ForgotPassword from './pages/forgot-password.jsx';
import SuperAdminUserManagement from './pages/superadminfolder/superadmin-user-management.jsx';
import SuperAdminAuditLog from './pages/superadminfolder/superadmin-audit-log.jsx';
import UserRegistration from './pages/user-registration-form.jsx';
import ChangePassword from './pages/change-password.jsx';
import UserEmailRegistration from './pages/emailtemplates/user-email-registration.jsx';
import UserEmailActivation from './pages/emailtemplates/user-email-activation.jsx';

{/* FDA PAGES */}
import FDADashboard from './pages/fdafolder/fda-dashboard.jsx';
import FDAViewReports from './pages/fdafolder/fda-view-reports.jsx';
import FDAVerification from './pages/fdafolder/fda-verification.jsx';
import FDAStatus from './pages/fdafolder/fda-status.jsx';
import FDAProductDB from './pages/fdafolder/fda-product-db.jsx';


// deep-link listener component
function DeepLinkListener() {
  const navigate = useNavigate()

  useEffect(() => {
console.log('DeepLinkListener mounted, waiting for token...')

    window.electronAPI.onDeepLinkToken((token) => {
            console.log('Token received:', token)

      fetch(`http://localhost:8000/registration/validate/${token}`)
        .then((res) => res.json())
        .then((data) => {
                    console.log('Validate response:', data)

          if (data.status === 'valid') {
            navigate('/user-registration', { state: { ...data, invite_token: token } })
          } else {
            navigate('/invitation-status', { state: {status: data.status, invite_token: token } })
          }
        })
    })
  }, [])

  return null   // this component doesn't render anything visible, it just listens
}


export default function App(){
  return(
    <BrowserRouter>
      <DeepLinkListener />
      <Routes>
          {/*CHANGE THIS LINE ONLY WHEN TESTING */}
          <Route path='/' element={<FDADashboard />} />

        {/* AUTH ROUTES */}
        <Route path='/login' element={<Login />} />
        <Route path='/superadmin-login' element={<SuperAdminLogin />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='/user-registration' element={<UserRegistration />} />

        {/* LEA-CIDG ROUTES */}
        <Route path='/leacidgfolder/lea-dashboard' element={<LeaDashboard />} />
        <Route path='/leacidgfolder/lea-walkin-complaints' element={<LeaWalkinComplaints />} />
        <Route path='/leacidgfolder/lea-verification-request' element={<LeaVerificationRequest />} />
        <Route path='/leacidgfolder/lea-new-intake' element={<LeaNewIntake />} />
        <Route path='/leacidgfolder/lea-saved-draft' element={<LeaSavedDraft />} />

        {/* SUPERADMIN ROUTES */}
        <Route path='/superadminfolder/superadmin-user-management' element={<SuperAdminUserManagement />} />
        <Route path='/superadminfolder/superadmin-audit-log' element={<SuperAdminAuditLog />} />

        {/* EMAIL PREVIEW ROUTES:
        *makikita niyo lang to sa localhost:15173/preview-email/
        */}
        <Route path='/preview-email/interagency-otp' element={<OtpEmailTemplate />} />
        <Route path='/preview-email/registration' element={<UserEmailRegistration />} />
        <Route path='/preview-email/activation' element={<UserEmailActivation />} />
        <Route path='/preview-email/superadmin-otp'element={<SuperadminOtpEmail/>}/>

        {/* DEEP LINK ROUTES */}
        <Route path='/invitation-status' element={<DeepLinkStatus />} />

        <Route path='/profile-setting' element={<ProfileSetting />} />

        {/* FDA ROUTES */}
        <Route path='/fdafolder/fda-dashboard' element={<FDADashboard />} />
        <Route path='/fdafolder/fda-view-reports' element={<FDAViewReports />} />
        <Route path='/fdafolder/fda-verification' element={<FDAVerification />} />
        <Route path='/fdafolder/fda-status' element={<FDAStatus />} />
        <Route path='/fdafolder/fda-product-db' element={<FDAProductDB />} />
      </Routes>
    </BrowserRouter>
  );
}
