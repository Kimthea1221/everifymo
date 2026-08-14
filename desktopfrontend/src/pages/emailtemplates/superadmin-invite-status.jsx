import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClockAlert, Link, CircleCheckBig, ArrowRight } from 'lucide-react';

function SuperadminInviteStatus() {
  const location = useLocation();
  const navigate = useNavigate();

  // Receives status from navigation state, query params, or defaults for preview/testing
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = location.state?.status || queryParams.get('status') || 'valid';
  const inviteToken = location.state?.token || queryParams.get('token') || '';

  const [linkStatus, setLinkStatus] = useState(initialStatus);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    // If state is valid, automatically redirect to create-new-password after short notice/delay or immediately
    if (linkStatus === 'valid') {
      const timer = setTimeout(() => {
        navigate('/create-new-password', { state: { token: inviteToken } });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [linkStatus, navigate, inviteToken]);

  const handleRequestNewInvite = () => {
    // 🔌 BACKEND: Call API to request a new superadmin invitation resend
    // fetch('http://127.0.0.1:8000/superadmin/invite/request-new', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token: inviteToken }),
    // })

    // ⚠️ REMOVE THIS: Simulated frontend response
    setRequested(true);
  };

  const statusContent = {
    valid: {
      icon: <CircleCheckBig size={32} color="#0D9488" />,
      iconBg: '#CCFBF1',
      title: 'Valid Invitation Link',
      message: 'Your invitation link is valid. Redirecting you to set up your password...',
      showButton: true,
      buttonLabel: 'Proceed to Create Password',
      buttonAction: () => navigate('/create-new-password', { state: { token: inviteToken } }),
      accentColor: '#0D9488',
    },
    expired: {
      icon: <ClockAlert size={32} color="#D97706" />,
      iconBg: '#FEF3C7',
      title: 'Invitation Expired',
      message: 'Your Superadmin invitation link has expired. Invitation links are only valid for 2 days. Please request a new invitation from your administrator.',
      showButton: !requested,
      buttonLabel: 'Request New Invitation',
      buttonAction: handleRequestNewInvite,
      accentColor: '#D97706',
    },
    used: {
      icon: <CircleCheckBig size={32} color="#0D9488" />,
      iconBg: '#D1FAE5',
      title: 'Invitation Already Accepted',
      message: 'This invitation has already been accepted and used to set up a Superadmin account. You can proceed to log in to the Superadmin portal.',
      showButton: true,
      buttonLabel: 'Go to Superadmin Login',
      buttonAction: () => navigate('/superadmin-login'),
      accentColor: '#0D9488',
    },
    accepted: {
      icon: <CircleCheckBig size={32} color="#0D9488" />,
      iconBg: '#D1FAE5',
      title: 'Invitation Already Accepted',
      message: 'This invitation has already been accepted and used to set up a Superadmin account. You can proceed to log in to the Superadmin portal.',
      showButton: true,
      buttonLabel: 'Go to Superadmin Login',
      buttonAction: () => navigate('/superadmin-login'),
      accentColor: '#0D9488',
    },
    invalid: {
      icon: <Link size={32} color="#B91C1C" />,
      iconBg: '#FEE2E2',
      title: 'Invalid Invitation Link',
      message: 'This Superadmin invitation link is invalid or unrecognized. If you believe this is an error, please contact your lead system administrator.',
      showButton: false,
      accentColor: '#B91C1C',
    },
  };

  const content = statusContent[linkStatus] || statusContent.invalid;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

        .SuperadminInvitePage {
          min-height: 100vh;
          background-color: #fdfdfd;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }

        .SuperadminInviteCard {
          background: #ffffff;
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          text-align: center;
          border-top: 5px solid;
          animation: InviteSlideUp 0.3s ease;
          box-sizing: border-box;
        }

        @keyframes InviteSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .SuperadminInviteIconBox {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
        }

        .SuperadminInviteTitle {
          font-family: 'Poppins', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
        }

        .SuperadminInviteMessage {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #6B7280;
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .SuperadminInviteBtn {
          width: 100%;
          padding: 13px 24px;
          border: none;
          border-radius: 10px;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.3px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .SuperadminInviteBtn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .SuperadminInviteBtn:active {
          transform: translateY(0);
        }

        .SuperadminInviteSystemName {
          margin-top: 36px;
          font-size: 11px;
          color: #9CA3AF;
          letter-spacing: 1.2px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .SuperadminInviteDivider {
          width: 40px;
          height: 2px;
          background: #E5E7EB;
          margin: 20px auto;
          border-radius: 2px;
        }

        .SuperadminInviteDevControls {
          margin-top: 24px;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .SuperadminInviteDevBtn {
          background: #334155;
          color: #e2e8f0;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        .SuperadminInviteDevBtn:hover {
          background: #475569;
        }
      `}</style>

      <div className="SuperadminInvitePage">
        <div
          className="SuperadminInviteCard"
          style={{ borderTopColor: content.accentColor }}
        >
          {/* Icon */}
          <div
            className="SuperadminInviteIconBox"
            style={{ backgroundColor: content.iconBg }}
          >
            {content.icon}
          </div>

          {/* Title */}
          <h2 className="SuperadminInviteTitle">{content.title}</h2>

          {/* Message */}
          <p className="SuperadminInviteMessage">{content.message}</p>

          <div className="SuperadminInviteDivider" />

          {/* Action Button */}
          {content.showButton && (
            <button
              className="SuperadminInviteBtn"
              style={{ backgroundColor: content.accentColor }}
              onClick={content.buttonAction}
            >
              {content.buttonLabel} <ArrowRight size={16} />
            </button>
          )}

          {/* Resend requested notice */}
          {linkStatus === 'expired' && requested && (
            <p className="SuperadminInviteMessage" style={{ color: '#0D9488', fontWeight: 600 }}>
              ✓ Request sent successfully! Please notify your administrator.
            </p>
          )}

          {/* System Footer */}
          <p className="SuperadminInviteSystemName">
            ICMDA · Superadmin Management
          </p>
        </div>

        {/* ⚠️ REMOVE THIS: Interactive status switcher for testing */}
        <div className="SuperadminInviteDevControls">
          <span style={{ color: '#94a3b8', fontSize: '11px', alignSelf: 'center' }}>Test Status:</span>
          <button className="SuperadminInviteDevBtn" onClick={() => setLinkStatus('valid')}>Valid</button>
          <button className="SuperadminInviteDevBtn" onClick={() => setLinkStatus('expired')}>Expired</button>
          <button className="SuperadminInviteDevBtn" onClick={() => setLinkStatus('used')}>Already Accepted</button>
          <button className="SuperadminInviteDevBtn" onClick={() => setLinkStatus('invalid')}>Invalid</button>
        </div>
      </div>
    </>
  );
}

export default SuperadminInviteStatus;
