import { useState } from 'react';
import './lea-css.css'
import Sidebar from '../component/sidebar'
import TopBar from '../component/top-bar'
import {Clock3,
        BellRing,
        SquarePen,
        ShieldCheck,
        ShieldX,
        CircleCheckBig,
        XCircle
} from 'lucide-react';

// ⚠️ REMOVE THIS
// 🔌 BACKEND: Dummy cases for FDA Response tab. Real data comes from verification_requests_full view joining complaints table.
// verification_request_status values: 'queued' | 'pending' | 'confirmed_registered' | 'confirmed_unregistered' | 'rejected' | 'recalled' | 'acknowledged'
const responseCases = [
  {
    id: 1,
    status: "Unregistered",
    caseNumber: "ICM-2025-00185",
    product: "HerbalSlim Capsules",
    manufacturer: "NatureFit Labs",
    complainant: "M. Reyes",
    category: "Supplement",
    loggedDate: "2026-05-17 10:42",
    source: "Walk-in Intake",
    returnedDate: "2026-05-17 16:02",
    sentDate: "2026-05-17 14:33",
    description: "No CPR or LTO found for manufacturer. Recommend takedown coordination."
  },
  {
    id: 2,
    status: "Registered",
    caseNumber: "ICM-2026-00412",
    product: "GlowSkin Cream",
    manufacturer: "Radiant Beauty Co.",
    complainant: "A. Santos",
    category: "Cosmetic",
    loggedDate: "2026-06-01 09:15",
    source: "Online Portal",
    returnedDate: "2026-06-03 14:20",
    sentDate: "2026-06-02 10:00",
    description: "Valid CPR and LTO found. Product is fully registered and compliant."
  },
  {
    id: 3,
    status: "Rejected",
    caseNumber: "ICM-2026-00188",
    product: "PureVita Multivitamin",
    manufacturer: "Vita Manufacturing Inc.",
    complainant: "J. Cruz",
    category: "Supplement",
    loggedDate: "2026-05-16 11:21",
    source: "Walk-in Intake",
    returnedDate: "2026-05-17 09:00",
    sentDate: "2026-05-16 14:00",
    rejectionReason: "Incomplete product information. Please provide the complete manufacturer address and product lot number.",
    rejectedBy: "Dr. M. Dela Cruz · FDA Verifier",
  }
];

// ⚠️ REMOVE THIS
// 🔌 BACKEND: Dummy cases for Initiated Cases tab. Real data comes from verification_requests_full view joining complaints table where complaint_status = 'takedown_initiated'.
// complaint_status values: 'open' | 'under_review' | 'takedown_initiated' | 'takedown_completed' | 'dismissed'
const initiatedCases = [
  {
    id: 1,
    status: "Operation in Progress",
    caseNumber: "ICM-2025-00185",
    product: "HerbalSlim Capsules",
    manufacturer: "NatureFit Labs",
    complainant: "M. Reyes",
    category: "Supplement",
    loggedDate: "2026-05-17 10:42",
    source: "Walk-in Intake",
    returnedDate: "2026-05-17 16:02",
    sentDate: "2026-05-17 14:33",
    description: "No CPR or LTO found for manufacturer. Takedown enforcement initiated."
  }
];

// ⚠️ REMOVE THIS
// 🔌 BACKEND: Dummy cases for Closed and Dismissed cases. Real data comes from verification_requests_full view joining complaints table where complaint_status = 'dismissed' (includes registered dismissals and acknowledged rejections).
const dismissedCases = [
  {
    id: 1,
    caseId: 'ICM-2025-00185',
    product: 'HerbalSlim Capsules',
    manufacturer: 'NatureFit Labs',
    category: 'Supplement',
    dateFiled: '2026-05-17',
    dateClosed: '2026-05-20',
    closedBy: 'Officer J. Domingo',
    reasonClosed: 'Registered',
  },
  {
    id: 2,
    caseId: 'ICM-2026-00188',
    product: 'PureVita Multivitamin',
    manufacturer: 'Vita Manufacturing Inc.',
    category: 'Supplement',
    dateFiled: '2026-05-16',
    dateClosed: '2026-05-21',
    closedBy: 'Officer M. Santos',
    reasonClosed: 'Rejected by FDA',
  },
];

function LeaVerificationRequest(){
    
    //FOR BUTTON TABS ON VERIFICATION REQUEST
    const [activeTab, setActiveTab] = useState('Ready to Send');
    const [selectedResponse, setSelectedResponse] = useState(responseCases[0]);
    const tabs = ['Ready to Send', 'Awaiting FDA', 'FDA Response', 'Initiated Cases', 'Dismissed Cases'];
    const handleTabClick =(tabName)=>{
        if (activeTab === tabName) return;

        if(!document.startViewTransition){
            setActiveTab(tabName);
            return;
        }
        document.startViewTransition(()=>{
            setActiveTab(tabName);
        })
    }

    // NOTE: States for new form inputs
    // 🔌 BACKEND: priority maps to priority column in verification_requests table
    const [priority, setPriority] = useState('standard');
    // 🔌 BACKEND: maps to field_operation_notes in verification_requests
    const [fieldOperationNotes, setFieldOperationNotes] = useState('');
    // 🔌 BACKEND: maps to complaint_statement in verification_requests
    const [complaintStatement, setComplaintStatement] = useState('Complainant alleges the product was sold without FDA markings. Please confirm registration status of product and manufacturer.');
    // 🔌 BACKEND: maps to product_code in verification_requests
    const [productCode, setProductCode] = useState('');

    // NOTE: States for the new tabs' selected items
    const [selectedInitiatedCase, setSelectedInitiatedCase] = useState(initiatedCases[0]);

    // NOTE: States for Dismissed Cases tab filters
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // NOTE: Modal overlay, success alert, and read-only details modal states
    const [modalConfig, setModalConfig] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [viewCaseModalData, setViewCaseModalData] = useState(null);

    // NOTE: Filter logic for closed/dismissed complaints table rows
    const filteredDismissed = dismissedCases.filter((c) => {
      const matchCategory = filterCategory ? c.category === filterCategory : true;
      const matchFrom = filterDateFrom ? c.dateClosed >= filterDateFrom : true;
      const matchTo = filterDateTo ? c.dateClosed <= filterDateTo : true;
      return matchCategory && matchFrom && matchTo;
    });

    // NOTE: Trigger confirmation modals and success alerts for actions
    const handleActionButtonClick = (actionType, caseNumber, id) => {
        let title = "";
        let message = "";
        let confirmText = "";
        let successText = "";
        let confirmBg = "#13213C";

        if (actionType === 'Send Reminder') {
            title = "Send Reminder to FDA?";
            message = `A reminder notification will be sent to the assigned FDA verifier for CASE ID: ${caseNumber}. Do you want to proceed?`;
            confirmText = "Send Reminder";
            successText = "Reminder sent successfully.";
        } else if (actionType === 'Recall Request') {
            title = "Recall Verification Request?";
            message = `This will cancel the pending verification request for CASE ID: ${caseNumber}. The case will be moved back to Ready to Send. Do you want to proceed?`;
            confirmText = "Recall Request";
            confirmBg = "#cc0000";
            successText = "Request recalled successfully.";
        } else if (actionType === 'Initiate Takedown') {
            title = "Initiate Takedown Operation?";
            message = `This will mark CASE ID: ${caseNumber} for takedown enforcement. The case will be moved to Initiated Cases tab. Do you want to proceed?`;
            confirmText = "Initiate Takedown";
            successText = "Takedown operation initiated.";
        } else if (actionType === 'Dismiss Case') {
            title = "Dismiss Case?";
            message = `This will close CASE ID: ${caseNumber}. Product has been confirmed registered with FDA. This action cannot be undone. Do you want to proceed?`;
            confirmText = "Dismiss Case";
            successText = "Case dismissed successfully.";
        } else if (actionType === 'Close Case') {
            title = "Close Takedown Case?";
            message = `This will mark the takedown operation for CASE ID: ${caseNumber} as complete and close the case. Make sure field operation notes are updated before closing. This action cannot be undone. Do you want to proceed?`;
            confirmText = "Close Case";
            successText = "Case closed successfully.";
        } else if (actionType === 'Acknowledge') {
            title = "Acknowledge Rejection?";
            message = `This will acknowledge the rejection of CASE ID: ${caseNumber} by FDA. The case will be moved to the Dismissed Cases tab. Do you want to proceed?`;
            confirmText = "Acknowledge";
            successText = "Rejection acknowledged. Case moved to Dismissed Cases.";
        }

        setModalConfig({
            title,
            message,
            confirmText,
            confirmBg,
            onConfirm: () => {
                // Trigger success alert
                setSuccessMessage(successText);
                setModalConfig(null);
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
                
                /*
                🔌 BACKEND NOTIFICATION:
                After this action succeeds, trigger a notification for:
                - Target: 
                  ${actionType === 'Send Reminder' ? 'FDA verifier assigned to this request' : 
                    actionType === 'Recall Request' ? 'FDA verifier assigned to this request' : 
                    actionType === 'Initiate Takedown' ? 'LEA supervisors / team leaders' : 
                    actionType === 'Dismiss Case' ? 'LEA supervisors / team leaders' : 
                    actionType === 'Close Case' ? 'LEA supervisors / team leaders' : 
                    actionType === 'Acknowledge' ? 'LEA supervisors / team leaders' : 'System'}
                - Message: 
                  ${actionType === 'Send Reminder' ? `LEA sent a reminder for CASE ID: ${caseNumber}` : 
                    actionType === 'Recall Request' ? `LEA has recalled the verification request for CASE ID: ${caseNumber}` : 
                    actionType === 'Initiate Takedown' ? `Takedown operation initiated for CASE ID: ${caseNumber}` : 
                    actionType === 'Dismiss Case' ? `Case dismissed — CASE ID: ${caseNumber} confirmed registered` : 
                    actionType === 'Close Case' ? `Takedown case completed — CASE ID: ${caseNumber}` : 
                    actionType === 'Acknowledge' ? `LEA acknowledged FDA rejection for CASE ID: ${caseNumber} — case moved to Dismissed Cases` : 'Notification'}
                - Type: ${actionType === 'Send Reminder' ? 'info' : 
                          actionType === 'Recall Request' ? 'warning' : 
                          actionType === 'Initiate Takedown' ? 'warning' : 
                          actionType === 'Dismiss Case' ? 'success' : 
                          actionType === 'Close Case' ? 'success' : 
                          actionType === 'Acknowledge' ? 'info' : 'info'}
                - Channel: notification panel in TopBar component
                */
            },
            onCancel: () => {
                setModalConfig(null);
            }
        });
    };

    return(
        <div className='LeaDashboardMain'>
            <Sidebar sidebarType="LEA" />
            <div className='LeaContentContainer'>
                <TopBar />
                <div className='LeaMainfeed'>
                    <div className='LeaHeader'>
                        <div>
                            <p>LEA-CIDG: VERIFICATION REQUEST</p>
                            <p>SEND & TRACK FDA VERIFICATION REQUEST</p>
                        </div>
                    </div>
                    <div className="VerificationContainer">
                    
                        <div className="VerificationTabs">
                            <div className='VerificationTabsButton'>
                                {tabs.slice(0, 3).map((tabName)=>(
                                    <button key={tabName} className={`ButtonTab ${activeTab === tabName ?  'active' : ''}`} onClick={() => handleTabClick(tabName)}>{tabName}</button>
                                ))}
                                {/* styles the tab separator between process tabs and tracking tabs */}
                                <div className="TabSeparator"></div>
                                {tabs.slice(3).map((tabName)=>(
                                    <button key={tabName} className={`ButtonTab ${activeTab === tabName ?  'active' : ''}`} onClick={() => handleTabClick(tabName)}>{tabName}</button>
                                ))}
                            </div>
                        </div>
                        {/*CONTENT FOR EACH TAB */}

                        {/*READY TO SEND TAB CONTENT*/}
                        <div className='VerificationTabContent ReadySendButtonContent'>
                            {activeTab === 'Ready to Send' && 
                            <div className="VerificationContent">
                                {/* LEFT PANEL */}
                                <div className="ReadytoSendQueue">
                                    <div className="ReadytoSendHeader">
                                        <p>Walk-in cases awaiting your request</p>
                                        {/* ⚠️ REMOVE THIS */}
                                        {/* 🔌 BACKEND: count of cases where verification_request_status is 'queued' or 'recalled' */}
                                        <span>1</span> {/*walk in cases count need backend*/}
                                    </div>

                                    {/* 🔌 BACKEND: verification_request_status: 'queued' or 'recalled' */}
                                    <div className="QueueCard ActiveQueueCard" id=''>
                                        <div className='QueueLabels'>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: product_name */}
                                            <h4>HerbalSlim Capsules</h4>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: manufacturer_name */}
                                            <p>NatureFit Labs</p>
                                            <small>
                                                {/* ⚠️ REMOVE THIS */}
                                                {/* 🔌 BACKEND: caseNumber and loggedDate from verification_requests_full */}
                                                CASE ID: ICM-2025-00185
                                            </small>
                                        </div>
                                        
                                        <div className="QueueTag">
                                            <span>Walk-in</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT PANEL */}
                                <div className="VerificationDetails">
                                    <div className="VerificationCard">
                                        <div>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: caseNumber */}
                                            <small>CASE ID: ICM-2025-00185</small>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: product_name */}
                                            <h2>HerbalSlim Capsules</h2>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: manufacturer_name */}
                                            <p>NatureFit Labs</p>

                                            {/* 🔌 BACKEND: complainant, category, source, and region are NOT stored
                                                directly in verification_requests. */}
                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: complainant name */}
                                                    <p>M. Reyes</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: category */}
                                                    <p>Supplement</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: created_at */}
                                                    <p>2026-05-17 10:42</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: source */}
                                                    <p>Walk-in Intake</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="VerificationRequestCard">
                                            <div className="CaseInfoTitle">
                                                <SquarePen /><h2>Compose verification request to FDA</h2>
                                            </div>
                                            <p>
                                                Ask FDA to confirm whether the product or manufacturer is
                                                registered. Your intake evidence is attached automatically.
                                            </p>

                                            <div className="VerificationRow">
                                                <div>
                                                    <label>Product code (if known)</label>
                                                    {/* 🔌 BACKEND: maps to product_code in verification_requests */}
                                                    <input
                                                        type="text"
                                                        placeholder="Barcode / lot number"
                                                        value={productCode}
                                                        onChange={(e) => setProductCode(e.target.value)}
                                                    />
                                                </div>

                                                <div>
                                                    <label>Priority</label>
                                                    {/* 🔌 BACKEND: priority maps to priority column in verification_requests table */}
                                                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                                        <option value="standard">Standard</option>
                                                        <option value="high">High (48 hours)</option>
                                                        <option value="urgent">Urgent (24 hours)</option>
                                                        <option value="critical">Critical (1 hour)</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="VerificationNotes">
                                                <label>Notes to FDA verifier</label>
                                                {/* 🔌 BACKEND: maps to complaint_statement in verification_requests */}
                                                <textarea
                                                    rows="5"
                                                    placeholder="Enter notes for FDA verification..."
                                                    value={complaintStatement}
                                                    onChange={(e) => setComplaintStatement(e.target.value)}
                                                ></textarea>
                                            </div>

                                            <div className="AttachedFiles">
                                                <h4>Auto-attached from intake</h4>
                                                <p>
                                                    LEA_intake_form_signed.pdf ·
                                                    consumer_id_redacted.jpg ·
                                                    product_photo_front.jpg ·
                                                    purchase_receipt.pdf
                                                </p>
                                            </div>
                            
                                            <div className="VerificationActions">
                                                {/* 🔌 BACKEND: POST to /api/verification-requests (status: draft) */}
                                                <button className="DraftButton">
                                                    Save Draft
                                                </button>
                                                {/* 🔌 BACKEND: POST to /api/verification-requests (status: pending) */}
                                                <button className="SendReqBtn">
                                                    Send Request to FDA
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>}

                            {/*AWAITING FDA TAB CONTENT*/}
                            {activeTab === 'Awaiting FDA' && 
                            <div className='VerificationContent AwaitingButtonContent'>
                                {/* LEFT PANEL */}
                                <div className="AwaitingFDAQueue">
                                    <div className="AwaitingHeader">
                                        <p>Request Pending FDA Review</p>
                                        {/* ⚠️ REMOVE THIS */}
                                        {/* 🔌 BACKEND: count of cases where verification_request_status is 'pending' */}
                                        <span>1</span>
                                    </div>

                                    {/* 🔌 BACKEND: verification_request_status: 'pending' */}
                                    <div className="QueueCard ActiveQueueCard" id=''>
                                        <div>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: product_name */}
                                            <h4>HerbalSlim Capsules</h4>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: manufacturer_name */}
                                            <p>NatureFit Labs</p>
                                            <small>
                                                {/* ⚠️ REMOVE THIS */}
                                                {/* 🔌 BACKEND: caseNumber */}
                                                CASE ID: ICM-2025-00185
                                            </small>
                                        </div>
                    
                                        <div className="QueueTag">
                                            <span>Walk-in</span>
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT PANEL */}
                                <div className="VerificationDetails">
                                    <div className="VerificationCard">
                                        <div>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: caseNumber */}
                                            <small>CASE ID: ICM-2025-00185</small>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: product_name */}
                                            <h2>HerbalSlim Capsules</h2>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: manufacturer_name */}
                                            <p>NatureFit Labs</p>

                                            {/* 🔌 BACKEND: complainant, category, source, and region are NOT stored
                                                directly in verification_requests. They are fetched via complaint_id
                                                joining to the complaints and walkin_complainants tables through the
                                                verification_requests_full view */}
                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: complainant name */}
                                                    <p>M. Reyes</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: category */}
                                                    <p>Supplement</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: created_at */}
                                                    <p>2026-05-17 10:42</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: source */}
                                                    <p>Walk-in Intake</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='UpdateForResponse'>
                                            <div className='StatusTitle'>
                                                <div className='TitleHolder'>
                                                    <div className='WaitingIconBox'><Clock3 /></div>
                                                    <div><h3>Awaiting FDA Response</h3></div>
                                                </div>
                                                {/* ⚠️ REMOVE THIS */}
                                                {/* 🔌 BACKEND: maps to requested_at in verification_requests */}
                                                <p>Request sent 2026-05-18 08:10. FDA verifier will respond with a digital confirmation of registration status.</p>
                                            </div>
                                            <div className='ButtonsForResponse'>
                                                {/* 🔌 BACKEND: POST to /api/verification-requests/:id/reminder */}
                                                <button className='SendReminderBtn' onClick={() => handleActionButtonClick('Send Reminder', 'ICM-2025-00185', 1)}>
                                                    <BellRing />
                                                    <p>Send Reminder</p>
                                                </button>
                                                {/* 🔌 BACKEND: PATCH to /api/verification-requests/:id (status: recalled) */}
                                                <button className='RecallRequestBtn' onClick={() => handleActionButtonClick('Recall Request', 'ICM-2025-00185', 1)}>Recall Request</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>}
                            
                            {/*FDA RESPONSE TAB CONTENT*/}
                            {activeTab === 'FDA Response' && 
                            <div className='VerificationContent FDAResponseButtonContent'>
                                {/* LEFT PANEL */}
                                <div className="FDAResponseQueue">
                                    <div className="FDAResponseHeader">
                                        <p>FDA confirmations received</p>
                                        {/* ⚠️ REMOVE THIS */}
                                        {/* 🔌 BACKEND: count of responseCases */}
                                        <span>{responseCases.length}</span>
                                    </div>

                                    {responseCases.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className={`QueueCard ${selectedResponse.id === item.id ? 'ActiveQueueCard' : ''}`} 
                                            id=''
                                            onClick={() => setSelectedResponse(item)}
                                        >
                                            <div>
                                                <h4>{item.product}</h4>
                                                <p>{item.manufacturer}</p>
                                                <small>
                                                    {/* 🔌 BACKEND: status badge reflects verification_request_status ('confirmed_registered' | 'confirmed_unregistered' | 'rejected') */}
                                                    CASE ID: {item.caseNumber}
                                                </small>
                                            </div>
                                            <div className="ResponseQueueTag">
                                                <span className={
                                                    item.status === 'Registered' 
                                                        ? 'registered' 
                                                        : item.status === 'Rejected'
                                                            ? 'RejectedBadge'
                                                            : ''
                                                }>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                </div>

                                {/* RIGHT PANEL */}
                                <div className='VerificationDetails'>
                                   <div className='VerificationCard'>
                                        <div>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: caseNumber */}
                                            <small>CASE ID: {selectedResponse.caseNumber}</small>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: product_name */}
                                            <h2>{selectedResponse.product}</h2>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: manufacturer_name */}
                                            <p>{selectedResponse.manufacturer}</p>

                                            {/* 🔌 BACKEND: complainant, category, source, and region are NOT stored
                                                directly in verification_requests. They are fetched via complaint_id
                                                joining to the complaints and walkin_complainants tables through the
                                                verification_requests_full view */}
                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: complainant name */}
                                                    <p>{selectedResponse.complainant}</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: category */}
                                                    <p>{selectedResponse.category}</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: created_at */}
                                                    <p>{selectedResponse.loggedDate}</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: source */}
                                                    <p>{selectedResponse.source}</p>
                                                </div>
                                            </div>
                                    </div>

                                        <div className='ConfirmationReturned'>
                                            {selectedResponse.status === 'Rejected' ? (
                                                <>
                                                    <div className='ConfirmationReturnedBox'>
                                                        <XCircle style={{ color: '#EF4444' }} />
                                                        <div className='StatementReturn'>
                                                            <h3>Request Rejected by FDA</h3>
                                                            {/* ⚠️ REMOVE THIS */}
                                                            {/* 🔌 BACKEND: rejectedBy maps to user who updated status, returnedDate maps to responded_at */}
                                                            <p>Rejected by: {selectedResponse.rejectedBy} · {selectedResponse.returnedDate}</p>
                                                        </div> 
                                                    </div>
                                                    
                                                    <div className="RejectionReasonBox">
                                                        <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#ea580c', fontWeight: '600', marginBottom: '6px' }}>Reason for Rejection</label>
                                                        {/* ⚠️ REMOVE THIS */}
                                                        {/* 🔌 BACKEND: rejectionReason maps to rejection_reason in verification_requests */}
                                                        <p className="ReasonDetail">{selectedResponse.rejectionReason}</p>
                                                    </div>
                                                    
                                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '20px 0 10px 0' }}>
                                                        Please review the rejection reason above and click Acknowledge to move this case to closed/dismissed records.
                                                    </p>
                                                    
                                                    <div className='ResponseBtn' style={{ marginTop: '20px' }}>
                                                        {/* 🔌 BACKEND: PATCH /api/verification-requests/:id (status: acknowledged) AND PATCH /api/complaints/:id (complaint_status: dismissed) */}
                                                        <button 
                                                            style={{ width: '300', height: '40px' }}
                                                            onClick={() => handleActionButtonClick('Acknowledge', selectedResponse.caseNumber, selectedResponse.id)}
                                                        >
                                                            Acknowledge
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className='ConfirmationReturnedBox'>
                                                        <ShieldCheck />
                                                        <div className='StatementReturn'>
                                                            <h3>FDA digital confirmation received</h3>
                                                            {/* ⚠️ REMOVE THIS */}
                                                            {/* 🔌 BACKEND: responded_by -> users.user_id join */}
                                                            <p className="VerifiedByText">Verified by: Dr. J. Santos · FDA Officer</p>
                                                            {/* ⚠️ REMOVE THIS */}
                                                            {/* 🔌 BACKEND: returnedDate maps to responded_at, sentDate to requested_at */}
                                                            <p>Returned {selectedResponse.returnedDate} · sent {selectedResponse.sentDate}</p>
                                                        </div> 
                                                    </div>
                                                    <div className={`ResponseBox ${selectedResponse.status === 'Registered' ? 'ResponseRegistered' : 'ResponseUnregistered'}`}>
                                                        <div className='ResponseStatus'>
                                                            {selectedResponse.status === 'Registered' ? (
                                                                <CircleCheckBig />
                                                            ) : (
                                                                <ShieldX />
                                                            )}
                                                            <h4>
                                                                {selectedResponse.status === 'Registered' 
                                                                    ? 'Registered with FDA' 
                                                                    : 'Unregistered — not in FDA registry'}
                                                            </h4>
                                                        </div>
                                                        <p className='ReasonDetail'>{selectedResponse.description}</p>
                                                    </div>
                                                    <div className='ResponseUpdateBox'>
                                                        <h6>Field operation status update</h6>
                                                        {/* 🔌 BACKEND: fieldOperationNotes maps to field_operation_notes column in verification_requests — PATCH to /api/verification-requests/:id */}
                                                        <textarea 
                                                            name="" 
                                                            id="" 
                                                            placeholder="Operation conducted at seller's address on 2026-05-18. Product siezed, takedown notice served."
                                                            value={fieldOperationNotes}
                                                            onChange={(e) => setFieldOperationNotes(e.target.value)}
                                                        ></textarea>
                                                    </div>
                                                    <div className='ResponseBtn'>
                                                        <button onClick={() => handleActionButtonClick(
                                                            selectedResponse.status === 'Registered' ? 'Dismiss Case' : 'Initiate Takedown',
                                                            selectedResponse.caseNumber,
                                                            selectedResponse.id
                                                        )}>
                                                            {selectedResponse.status === 'Registered' ? 'Dismiss Case' : 'Initiate Takedown'}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                   </div>

                                </div>
                            </div>}

                            {/* INITIATED CASES TAB CONTENT */}
                            {activeTab === 'Initiated Cases' && 
                            <div className='VerificationContent FDAResponseButtonContent'>
                                {/* LEFT PANEL */}
                                <div className="FDAResponseQueue">
                                    <div className="FDAResponseHeader">
                                        <p>Cases with active takedown operations</p>
                                        {/* ⚠️ REMOVE THIS */}
                                        {/* 🔌 BACKEND: count of cases where complaint_status = 'takedown_initiated' */}
                                        <span>{initiatedCases.length}</span>
                                    </div>

                                    {initiatedCases.map((item) => (
                                        <div 
                                            key={item.id} 
                                            className={`QueueCard ${selectedInitiatedCase.id === item.id ? 'ActiveQueueCard' : ''}`}
                                            onClick={() => setSelectedInitiatedCase(item)}
                                        >
                                            <div>
                                                <h4>{item.product}</h4>
                                                <p>{item.manufacturer}</p>
                                                <small>
                                                    CASE ID: {item.caseNumber}
                                                </small>
                                            </div>
                                            <div className="ResponseQueueTag">
                                                <span className="OperationInProgressBadge">
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* RIGHT PANEL */}
                                <div className='VerificationDetails'>
                                    <div className='VerificationCard'>
                                        <div>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: caseNumber */}
                                            <small>CASE ID: {selectedInitiatedCase.caseNumber}</small>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: product_name */}
                                            <h2>{selectedInitiatedCase.product}</h2>
                                            {/* ⚠️ REMOVE THIS */}
                                            {/* 🔌 BACKEND: manufacturer_name */}
                                            <p>{selectedInitiatedCase.manufacturer}</p>

                                            {/* 🔌 BACKEND: complainant, category, source, and region are NOT stored
                                                directly in verification_requests. They are fetched via complaint_id
                                                joining to the complaints and walkin_complainants tables through the
                                                verification_requests_full view */}
                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: complainant name */}
                                                    <p>{selectedInitiatedCase.complainant}</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: category */}
                                                    <p>{selectedInitiatedCase.category}</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: created_at */}
                                                    <p>{selectedInitiatedCase.loggedDate}</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    {/* ⚠️ REMOVE THIS */}
                                                    {/* 🔌 BACKEND: source */}
                                                    <p>{selectedInitiatedCase.source}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='ConfirmationReturned'>
                                            <div className='ResponseUpdateBox' style={{ marginTop: '0px' }}>
                                                <h6>Field operation status update</h6>
                                                {/* 🔌 BACKEND: fieldOperationNotes maps to field_operation_notes column in verification_requests — PATCH to /api/verification-requests/:id */}
                                                <textarea 
                                                    placeholder="Enter notes on field operation progress..."
                                                    value={fieldOperationNotes}
                                                    onChange={(e) => setFieldOperationNotes(e.target.value)}
                                                ></textarea>
                                            </div>
                                            <div className='ResponseBtn' style={{ marginTop: '20px' }}>
                                                {/* 🔌 BACKEND: Close Case -> PATCH /api/complaints/:id (complaint_status: completed) */}
                                                <button onClick={() => handleActionButtonClick('Close Case', selectedInitiatedCase.caseNumber, selectedInitiatedCase.id)}>
                                                    Close Case
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                            {/* DISMISSED CASES TAB CONTENT */}
                            {activeTab === 'Dismissed Cases' && 
                            <div className="DismissedTableContainer">

                                {/* Filters Bar — matches Saved Drafts filter style */}
                                <div className="DraftsFilterSection">
                                    <div className="DraftsFilterControls">
                                        {/* 🔌 BACKEND: pass filterDateFrom as from_date query param */}
                                        <input
                                            type="date"
                                            className="DraftsFilterDropdown"
                                            value={filterDateFrom}
                                            onChange={(e) => setFilterDateFrom(e.target.value)}
                                            title="Closed From"
                                        />
                                        {/* 🔌 BACKEND: pass filterDateTo as to_date query param */}
                                        <input
                                            type="date"
                                            className="DraftsFilterDropdown"
                                            value={filterDateTo}
                                            onChange={(e) => setFilterDateTo(e.target.value)}
                                            title="Closed To"
                                        />
                                        {/* 🔌 BACKEND: pass filterCategory as category query param */}
                                        <select
                                            className="DraftsFilterDropdown"
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            <option value="Supplement">Supplement</option>
                                            <option value="Cosmetic">Cosmetic</option>
                                            <option value="Food">Food</option>
                                            <option value="Drug">Drug</option>
                                            <option value="Medical Device">Medical Device</option>
                                        </select>
                                        <button
                                            className="BtnClearFilters"
                                            onClick={() => {
                                                setFilterDateFrom('');
                                                setFilterDateTo('');
                                                setFilterCategory('');
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                    {/* 🔌 BACKEND: GET /api/complaints?status=dismissed&from_date=${filterDateFrom}&to_date=${filterDateTo}&category=${filterCategory} */}
                                    <div className="DraftsTotalCount">
                                        Total Cases: {filteredDismissed.length}
                                    </div>
                                </div>

                                {/* Full-width table */}
                                <div className="TableCard" style={{ maxWidth: '100%' }}>
                                    <table className="DismissedTable">
                                        <thead>
                                            <tr>
                                                <th>Case ID</th>
                                                <th>Product Name</th>
                                                <th>Manufacturer</th>
                                                <th>Category</th>
                                                <th>Date Filed</th>
                                                <th>Date Closed</th>
                                                <th>Closed By</th>
                                                <th>Reason Closed</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDismissed.length > 0 ? (
                                                filteredDismissed.map((c) => (
                                                    <tr key={c.id}>
                                                        <td style={{ fontWeight: '700', color: '#13213C' }}>{c.caseId}</td>
                                                        <td style={{ fontWeight: '600' }}>{c.product}</td>
                                                        <td>{c.manufacturer}</td>
                                                        <td>{c.category}</td>
                                                        <td>{c.dateFiled}</td>
                                                        <td>{c.dateClosed}</td>
                                                        <td>{c.closedBy}</td>
                                                        <td>
                                                            <span className={c.reasonClosed === 'Registered' ? 'ReasonRegistered' : 'ReasonRejected'}>
                                                                {c.reasonClosed}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="BtnView"
                                                                onClick={() => setViewCaseModalData(c)}
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#7a8796' }}>
                                                        No closed or dismissed cases match current filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>}

                        </div>
                    </div>
                </div>
            </div>

            {/* NOTE: Reusable Confirmation Modal UI */}
            {modalConfig && (
                <div className="ModalOverlay">
                    <div className="ModalBox">
                        <h3>{modalConfig.title}</h3>
                        <p>{modalConfig.message}</p>
                        <div className="ModalActions">
                            <button className="BtnCancelModal" onClick={modalConfig.onCancel}>Cancel</button>
                            <button 
                                className="BtnConfirmDelete" 
                                style={{ backgroundColor: modalConfig.confirmBg || '#13213C' }} 
                                onClick={modalConfig.onConfirm}
                            >
                                {modalConfig.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTE: Read-only modal displaying full case details for dismissed cases */}
            {viewCaseModalData && (
                <div className="ModalOverlay">
                    <div className="ModalViewButton" style={{ width: '600px' }}>
                        <h4 style={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: '700', color: '#13213C', marginBottom: '16px' }}>
                            Case Details — {viewCaseModalData.caseId}
                        </h4>
                        
                        {/* 🔌 BACKEND: GET /api/complaints/:id for full case details */}
                        <div className="CaseInfoGrid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', borderTop: '1px solid #EDEDED', borderBottom: '1px solid #EDEDED', padding: '16px 0', margin: '16px 0' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#7a8796', marginBottom: '4px' }}>Product Name</label>
                                <p style={{ fontWeight: '600', margin: 0 }}>{viewCaseModalData.product}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#7a8796', marginBottom: '4px' }}>Manufacturer</label>
                                <p style={{ fontWeight: '600', margin: 0 }}>{viewCaseModalData.manufacturer}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#7a8796', marginBottom: '4px' }}>Category</label>
                                <p style={{ fontWeight: '600', margin: 0 }}>{viewCaseModalData.category}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#7a8796', marginBottom: '4px' }}>Closed By</label>
                                <p style={{ fontWeight: '600', margin: 0 }}>{viewCaseModalData.closedBy}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#7a8796', marginBottom: '4px' }}>Date Filed</label>
                                <p style={{ fontWeight: '600', margin: 0 }}>{viewCaseModalData.dateFiled}</p>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#7a8796', marginBottom: '4px' }}>Date Closed</label>
                                <p style={{ fontWeight: '600', margin: 0 }}>{viewCaseModalData.dateClosed}</p>
                            </div>
                        </div>

                        <div className="RejectionReasonBox" style={{ 
                            backgroundColor: viewCaseModalData.reasonClosed === 'Registered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                            borderColor: viewCaseModalData.reasonClosed === 'Registered' ? '#10b981' : '#f97316',
                            margin: '0 0 20px 0'
                        }}>
                            <label style={{ 
                                display: 'block', 
                                fontSize: '11px', 
                                textTransform: 'uppercase', 
                                color: viewCaseModalData.reasonClosed === 'Registered' ? '#059669' : '#ea580c', 
                                fontWeight: '600', 
                                marginBottom: '6px' 
                            }}>Reason Closed</label>
                            <p className="ReasonDetail" style={{ color: '#030303', fontWeight: '500', margin: 0 }}>
                                {viewCaseModalData.reasonClosed === 'Registered' 
                                    ? 'Product confirmed registered with FDA registry' 
                                    : 'Rejected by FDA verifier — case acknowledged and dismissed'}
                            </p>
                        </div>

                        <div className="ModalActions">
                            <button className="BtnCancelModal" onClick={() => setViewCaseModalData(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTE: Reusable Success Alert Notification */}
            {successMessage && (
                <div className="SuccessAlert">
                    <p>{successMessage}</p>
                </div>
            )}
        </div>
    )
}
export default LeaVerificationRequest