//desktopfrontend/src/pages/emailtemplates/invitation-status.jsx
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClockAlert, Link, CircleCheckBig } from 'lucide-react'

function DeepLinkStatus() {
    const location = useLocation()
    const navigate = useNavigate()

    const { status: linkStatus, invite_token } = location.state || {}

    const [requested, setRequested] = useState(false)
    const [resendNotice, setResendNotice] = useState('')
    const [resendSending, setResendSending] = useState(false)

    function handleRequestResend() {
        setResendSending(true)
        fetch('http://localhost:8000/registration/request-resend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invite_token }),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}))
                setResendSending(false)

                if (res.status === 409) {
                    // Already requested (or otherwise already handled) — still show as "sent" so
                    // the user isn't stuck clicking a button that will never succeed.
                    setRequested(true)
                    setResendNotice(data.detail || 'A resend has already been requested for this invitation.')
                    return
                }

                if (!res.ok) {
                    throw new Error(data.detail || 'Request failed')
                }

                setRequested(true)
                setResendNotice('Your request has been sent. Please wait for your administrator.')
            })
            .catch(() => {
                setResendSending(false)
                alert('Something went wrong. Please contact your administrator directly.')
            })
    }

    const statusContent = {
        expired: {
            icon: <ClockAlert size={32} color="#D97706" />,
            iconBg: '#FEF3C7',
            title: 'Invitation Link Expired',
            message: 'Your registration link has expired. Invitation links are only valid for a limited time. Please request a new invitation from your administrator.',
            showButton: !requested,
            buttonLabel: resendSending ? 'Sending Request…' : 'Request New Invitation',
            buttonAction: handleRequestResend,
            accentColor: '#D97706',
        },
        invalid: {
            icon: <Link size={32} color="#B91C1C" />,
            iconBg: '#FEE2E2',
            title: 'Invalid Invitation Link',
            message: 'This invitation link is not recognized or may have already been used. If you believe this is an error, please contact your administrator.',
            showButton: false,
            accentColor: '#B91C1C',
        },
        used: {
            icon: <CircleCheckBig size={32} color="#0D9488" />,
            iconBg: '#D1FAE5',
            title: 'Registration Already Complete',
            message: 'Your registration has already been completed. You do not need to register again. Please wait for your administrator to activate your account, or login if your account is already active.',
            showButton: true,
            buttonLabel: 'Go to Login',
            buttonAction: () => navigate('/login'),
            accentColor: '#0D9488',
        },
    }

    const content = statusContent[linkStatus]

    if (!content) return <p>Something went wrong.</p>

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

                :root {
                    --font-headings: 'Poppins', sans-serif;
                    --font-body: 'Inter', sans-serif;
                }

                body, input, textarea, select, button {
                    font-family: var(--font-body);
                }

                h1, h2, h3, h4, h5, h6 {
                    font-family: var(--font-headings);
                    font-weight: 600;
                }

                .DeepLinkPage {
                    min-height: 100vh;
                    background-color: #F9FAFB;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    font-family: var(--font-body);
                }

                .DeepLinkCard {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 48px 40px;
                    max-width: 480px;
                    width: 100%;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                    text-align: center;
                    border-top: 4px solid;
                }

                .DeepLinkIconBox {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    margin: 0 auto 24px auto;
                }

                .DeepLinkTitle {
                    font-family: var(--font-headings);
                    font-size: 22px;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 12px;
                }

                .DeepLinkMessage {
                    font-family: var(--font-body);
                    font-size: 14px;
                    color: #6B7280;
                    line-height: 1.7;
                    margin-bottom: 32px;
                }

                .DeepLinkBtn {
                    width: 100%;
                    padding: 13px 24px;
                    border: none;
                    border-radius: 8px;
                    font-family: var(--font-body);
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                    letter-spacing: 0.3px;
                }

                .DeepLinkBtn:hover {
                    opacity: 0.88;
                }

                .DeepLinkBtn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .DeepLinkSystemName {
                    margin-top: 40px;
                    font-size: 11px;
                    color: #9CA3AF;
                    letter-spacing: 1px;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .DeepLinkDivider {
                    width: 40px;
                    height: 2px;
                    background: #E5E7EB;
                    margin: 20px auto;
                    border-radius: 2px;
                }

                .DeepLinkAlertBox {
                    background: #F0FDF4;
                    border: 1.5px solid #99F6E4;
                    border-radius: 8px;
                    padding: 14px 16px;
                    margin-bottom: 24px;
                    text-align: left;
                }

                .DeepLinkAlertBox p {
                    font-size: 13px;
                    color: #0D9488;
                    font-weight: 500;
                    margin: 0;
                }

            `}</style>

            <div className='DeepLinkPage'>
                <div
                    className='DeepLinkCard'
                    style={{ borderTopColor: content.accentColor }}
                >
                    <div
                        className='DeepLinkIconBox'
                        style={{ backgroundColor: content.iconBg }}
                    >
                        {content.icon}
                    </div>

                    <h2 className='DeepLinkTitle'>{content.title}</h2>

                    {linkStatus === 'used' && (
                        <div className='DeepLinkAlertBox'>
                            <p>✓ Your registration details have been received.</p>
                        </div>
                    )}

                    <p className='DeepLinkMessage'>{content.message}</p>

                    <div className='DeepLinkDivider' />

                    {content.showButton && (
                        <button
                            className='DeepLinkBtn'
                            style={{ backgroundColor: content.accentColor }}
                            onClick={content.buttonAction}
                            disabled={resendSending}
                        >
                            {content.buttonLabel}
                        </button>
                    )}

                    {linkStatus === 'expired' && requested && (
                        <p className='DeepLinkMessage' style={{ marginTop: 16, marginBottom: 0 }}>
                            {resendNotice}
                        </p>
                    )}

                    <p className='DeepLinkSystemName'>
                        ICMDA · Interagency Complaint Management
                    </p>
                </div>
            </div>
        </>
    )
}

export default DeepLinkStatus