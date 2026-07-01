import React from 'react';

//SAMPLE OTP CODE
const OtpEmailTemplate = ({ otpCode = "123456" }) => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap');

          :root {
            --font-headings: 'Poppins', sans-serif;
            --font-body: 'Inter', sans-serif;
          }

          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-headings);
            font-weight: 600;
          }

          .EmailBody {
            margin: 0;
            padding: 0;
            font-family: var(--font-body);
            background-color: #f4f5f8;
            color: #333333;
          }
          .EmailTable {
            border-collapse: collapse;
          }
          .EmailWrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f4f5f8;
            padding-top: 40px;
            padding-bottom: 40px;
          }
          .EmailMainCard {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .EmailHeader {
            background: linear-gradient(135deg, #1a1a2e 0%, #161626 100%);
            padding: 30px 20px;
            text-align: center;
            border-bottom: 3px solid #f7931a;
          }
          .EmailHeader h2 {
            color: #ffffff;
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .EmailHeader p {
            color: #cfcfcf;
            margin: 5px 0 0 0;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .EmailContent {
            padding: 40px 30px;
          }
          .EmailGreeting {
            font-size: 16px;
            font-weight: 600;
            margin-top: 0;
            margin-bottom: 12px;
            color: #1a1a2e;
          }
          .EmailInstructions {
            font-size: 14px;
            line-height: 1.6;
            color: #555555;
            margin-top: 0;
            margin-bottom: 30px;
          }
          .EmailOtpBox {
            background-color: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 30px;
          }
          .EmailOtpCode {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #f7931a;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
          }
          .EmailExpiryAlert {
            font-size: 13px;
            color: #ef4444;
            margin: 10px 0 0 0;
            font-weight: 500;
          }
          .EmailDivider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 30px 0;
          }
          .EmailSecurityNotice {
            font-size: 12px;
            line-height: 1.5;
            color: #64748b;
          }
          .EmailSecurityNoticeTitle {
            font-weight: 600;
            color: #475569;
            margin-bottom: 4px;
          }
          .EmailFooter {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
          }
          .EmailFooter p {
            margin: 5px 0;
          }
            ul{
             padding: 0 0 0 20px;
            
            }
             li{
               margin-bottom: 8px;
             }
        `}
      </style>
      <div className="EmailBody">
        <center className="EmailWrapper">
          <table className="EmailMainCard EmailTable" role="presentation" border="0" cellPadding="0" cellSpacing="0">
            {/* HEADER */}
            <tbody>
              <tr>
                <td className="EmailHeader">
                  <h2>INTERAGENCY COMPLAINT MANAGEMENT SYSTEM</h2>
                  <p>FDA & LEA-CIDG Secure Verification</p>
                </td>
              </tr>
              
              {/* CONTENT */}
              <tr>
                <td className="EmailContent">
                  <h3 className="EmailGreeting">Security Verification Code</h3>
                  <p className="EmailInstructions">
                    We received a request to access your Interagency Complaint Management System account. Please use the following One-Time Password (OTP) to complete your login. This code is valid for single use only.
                  </p>
                  
                  <div className="EmailOtpBox">
                    <h1 className="EmailOtpCode">{otpCode}</h1>
                    <p className="EmailExpiryAlert">This code will expire in 5 minutes.</p>
                  </div>
                  
                  <p className="EmailInstructions">
                    If you did not initiate this login request, please contact your systems administrator immediately and secure your account credentials.
                  </p>
                  
                  <div className="EmailDivider"></div>
                  
                  <div className="EmailSecurityNotice">
                    <div className="EmailSecurityNoticeTitle">Security Information:</div>
                    <ul>
                      <li>Never share this verification code with anyone, including system administrators.</li>
                      <li>Ensure the URL starts with your department's official domain.</li>
                      <li>The system will never ask you to verify this code over phone, email, or messaging channels.</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              {/* FOOTER */}
              <tr>
                <td className="EmailFooter">
                 
                  <p>Food and Drug Administration (FDA) | Criminal Investigation and Detection Group (PNP-CIDG)</p>
                  <p>This is an automated security transmission. Please do not reply directly to this email.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </center>
      </div>
    </>
  );
};

export default OtpEmailTemplate;
