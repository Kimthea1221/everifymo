import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './pages/login-user.jsx'
 {/* LEA-CIDG PAGES */}
import LeaDashboard from './pages/leacidgfolder/lea-dashboard.jsx';
import LeaWalkinComplaints from './pages/leacidgfolder/lea-walkin-complaints.jsx';
import LeaVerificationRequest from './pages/leacidgfolder/lea-verification-request.jsx';
import LeaNewIntake from './pages/leacidgfolder/lea-new-intake.jsx';
import LeaSavedDraft from './pages/leacidgfolder/lea-saved-draft.jsx';

{/* OTP EMAIL TEMPLATE */}
import OtpEmailTemplate from './pages/emailtemplates/otp-email-template.jsx';

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

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
          {/*CHANGE THIS LINE ONLY WHEN TESTING */}
          <Route path='/' element={<SuperAdminUserManagement />} />

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
        <Route path='/preview-email' element={<OtpEmailTemplate />} />
        <Route path='/preview-email/registration' element={<UserEmailRegistration />} />
        <Route path='/preview-email/activation' element={<UserEmailActivation />} />

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