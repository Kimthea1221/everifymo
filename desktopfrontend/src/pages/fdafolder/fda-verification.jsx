import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Save,
  Paperclip,
  Calendar,
  Info,
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ============================================================================
// BACKEND NOTIFICATION ARCHITECTURE SPECIFICATION
// ============================================================================
// NOTE: Global notifications occur through the TopBar component (top-bar.jsx).
// Inter-Agency Notification triggers between LEA-CIDG and FDA are handled via:
// 1. LEA Submits Request -> // BACKEND: Trigger notification to FDA TopBar notification panel ("New verification request received from LEA. CASE ID: XXXXX")
// 2. LEA Recalls Request -> // BACKEND: Trigger notification to FDA TopBar notification panel ("Verification request recalled by LEA. CASE ID: XXXXX")
// 3. LEA Sends Reminder -> // BACKEND: Trigger notification to FDA TopBar notification panel ("Reminder received from LEA for CASE ID XXXXX.")
// 4. FDA Submits Verification -> // BACKEND: Trigger notification to LEA TopBar notification panel ("FDA has completed verification for CASE ID XXXXX.")
// 5. FDA Rejects Verification -> // BACKEND: Trigger notification to LEA TopBar notification panel ("FDA rejected verification request for CASE ID XXXXX.")
// 6. LEA Acknowledges Rejection -> // BACKEND: Trigger notification to FDA TopBar notification panel ("LEA acknowledged rejection for CASE ID XXXXX.")
// 7. LEA Initiates Takedown -> // BACKEND: Trigger notification to FDA TopBar notification panel ("LEA initiated enforcement operation for CASE ID XXXXX.")
// 8. LEA Closes Case -> // BACKEND: Trigger notification to FDA TopBar notification panel ("LEA has closed CASE ID XXXXX.")
//
// WORKFLOW TRANSITIONS:
// Verification Queue (Pending) -> FDA reviews -> Registered or Unregistered -> Completed
// or
// Verification Queue (Pending) -> Rejected -> Rejected Requests
// ============================================================================

// ============================================================================
// DUMMY DATASETS - FDA VERIFICATION WORKFLOW (LEA REQUESTS ONLY)
// ============================================================================

// BACKEND: GET /api/fda/verification-requests?status=pending
// Returns newly received verification requests submitted by LEA-CIDG requiring FDA review.
const dummyQueueRequests = [
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00501',
    caseId: 'ICM-2026-00501',
    productName: 'PureGlow Whitening Soap',
    manufacturer: 'Lumina Beauty Philippines Inc.',
    complainant: 'PO3 R. Dela Cruz (LEA-CIDG)',
    category: 'Cosmetics',
    dateLogged: '2026-07-28 08:30 AM',
    dateReceived: '2026-07-28 08:35 AM',
    source: 'LEA Verification Request',
    productCode: 'PRD-COS-2026-9081',
    priority: 'Urgent',
    leaNotes: 'Seized 500 units during enforcement operation at Divisoria market. Packaging displays suspicious FDA registration mark. Immediate validation requested prior to legal filing.',
    documents: [
      { id: 'doc-101', name: 'Product_Label_Front_Back.jpg', size: '2.4 MB', type: 'image/jpeg', category: 'Evidence Photo' },
      { id: 'doc-102', name: 'LEA_Seizure_Intake_Report_00501.pdf', size: '1.2 MB', type: 'application/pdf', category: 'Official Report' },
      { id: 'doc-103', name: 'LEA_Chain_of_Custody_Form.pdf', size: '480 KB', type: 'application/pdf', category: 'Chain of Custody' }
    ]
  },
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00498',
    caseId: 'ICM-2026-00498',
    productName: 'VigorMax Male Energy Capsules',
    manufacturer: 'BioHealth Apex Labs Co.',
    complainant: 'Agent G. Tan (LEA-CIDG)',
    category: 'Supplements',
    dateLogged: '2026-07-27 03:45 PM',
    dateReceived: '2026-07-27 04:10 PM',
    source: 'LEA Verification Request',
    productCode: 'PRD-SUP-2026-4412',
    priority: 'High',
    leaNotes: 'Product identified during field operations without CPR badge. LEA field team flagged potential counterfeit packaging. Request urgent verification of CPR and LTO status.',
    documents: [
      { id: 'doc-104', name: 'Blister_Pack_HighRes.png', size: '3.1 MB', type: 'image/png', category: 'Evidence Photo' },
      { id: 'doc-105', name: 'Field_Seizure_Photos.pdf', size: '1.8 MB', type: 'application/pdf', category: 'Seizure Evidence' }
    ]
  },
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00492',
    caseId: 'ICM-2026-00492',
    productName: 'KetoFast Slimming Tea Bags',
    manufacturer: 'GreenHerb Organics Mfg.',
    complainant: 'Insp. A. Mercado (LEA-CIDG)',
    category: 'Supplements',
    dateLogged: '2026-07-26 11:20 AM',
    dateReceived: '2026-07-26 11:45 AM',
    source: 'LEA Verification Request',
    productCode: 'PRD-SUP-2026-1290',
    priority: 'Standard',
    leaNotes: 'LEA intelligence unit flagged batch samples. Request verification if GreenHerb Organics holds a valid License to Operate (LTO).',
    documents: [
      { id: 'doc-106', name: 'Box_Packaging_Photo.jpg', size: '1.5 MB', type: 'image/jpeg', category: 'Evidence Photo' },
      { id: 'doc-107', name: 'LEA_Request_Statement.pdf', size: '890 KB', type: 'application/pdf', category: 'Official Statement' }
    ]
  }
];



// BACKEND: GET /api/fda/verification-requests?status=completed
// Returns historical verifications completed by FDA and transmitted back to LEA-CIDG.
const dummyCompletedRequests = [
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00412',
    caseId: 'ICM-2026-00412',
    productName: 'GlowSkin Moisturizing Cream',
    manufacturer: 'Radiant Beauty Co.',
    complainant: 'Insp. A. Santos (LEA-CIDG)',
    category: 'Cosmetics',
    dateLogged: '2026-06-01 09:15 AM',
    dateReceived: '2026-06-01 09:30 AM',
    dateCompleted: '2026-06-03 02:20 PM',
    source: 'LEA Verification Request',
    productCode: 'PRD-COS-2026-1109',
    priority: 'Standard',
    verificationResult: 'Registered',
    cprNumber: 'FDA-NN-1000003819',
    cprExpiry: '2029-04-30',
    ltoNumber: 'FDA-LTO-30000019283',
    verifierName: 'Dr. Maria Santos',
    verifierTitle: 'FDA Senior Regulatory Officer',
    remarks: 'Valid CPR and LTO found. Product is fully registered, active, and compliant with national cosmetic safety standards.',
    documents: [
      { id: 'doc-301', name: 'FDA_Official_CPR_Certificate.pdf', size: '1.1 MB', type: 'application/pdf', category: 'Official Certificate' },
      { id: 'doc-302', name: 'GlowSkin_Lab_Analysis_Report.pdf', size: '2.5 MB', type: 'application/pdf', category: 'Lab Report' }
    ]
  },
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2025-00185',
    caseId: 'ICM-2025-00185',
    productName: 'HerbalSlim Weight Loss Capsules',
    manufacturer: 'NatureFit Labs Inc.',
    complainant: 'Insp. M. Reyes (LEA-CIDG)',
    category: 'Supplements',
    dateLogged: '2026-05-17 10:42 AM',
    dateReceived: '2026-05-17 10:50 AM',
    dateCompleted: '2026-05-17 04:02 PM',
    source: 'LEA Verification Request',
    productCode: 'PRD-SUP-2025-8812',
    priority: 'Urgent',
    verificationResult: 'Unregistered',
    verifierName: 'Inspector J. Bautista',
    verifierTitle: 'FDA Enforcement Officer',
    unregisteredReason: 'No CPR or LTO found for manufacturer NatureFit Labs Inc. in the official FDA database. Product presents potential public health risks.',
    remarks: 'Product is UNREGISTERED. Immediate enforcement, public health advisory, and online marketplace takedown coordination strongly recommended.',
    documents: [
      { id: 'doc-303', name: 'HerbalSlim_Packaging_Evidence.pdf', size: '3.4 MB', type: 'application/pdf', category: 'Evidence File' },
      { id: 'doc-304', name: 'FDA_Verification_Response_Form.pdf', size: '920 KB', type: 'application/pdf', category: 'Official Response' }
    ]
  },
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00330',
    caseId: 'ICM-2026-00330',
    productName: 'AstraMed Pain Relief Patch 5s',
    manufacturer: 'Astra Therapeutics Inc.',
    complainant: 'Agent E. Gomez (LEA-CIDG)',
    category: 'Medical Devices',
    dateLogged: '2026-05-08 01:10 PM',
    dateReceived: '2026-05-08 01:25 PM',
    dateCompleted: '2026-05-10 11:00 AM',
    source: 'LEA Verification Request',
    productCode: 'PRD-DEV-2026-0044',
    priority: 'High',
    verificationResult: 'Registered',
    cprNumber: 'FDA-DVR-2025-01928',
    cprExpiry: '2027-12-31',
    ltoNumber: 'FDA-LTO-30000055192',
    verifierName: 'Dr. E. Gomez',
    verifierTitle: 'FDA Medical Device Officer',
    remarks: 'Verified active registration under Medical Device Regulation Office. License to Operate valid.',
    documents: [
      { id: 'doc-305', name: 'AstraMed_Device_License.pdf', size: '1.4 MB', type: 'application/pdf', category: 'Official License' }
    ]
  }
];

// BACKEND: GET /api/fda/verification-requests?status=rejected
// Returns verification requests rejected by FDA due to missing information, invalid inputs, or duplication.
const dummyRejectedRequests = [
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00188',
    caseId: 'ICM-2026-00188',
    productName: 'PureVita Daily Multivitamin',
    manufacturer: 'Vita Manufacturing Inc.',
    complainant: 'Insp. J. Cruz (LEA-CIDG)',
    category: 'Supplements',
    dateLogged: '2026-05-16 11:21 AM',
    dateReceived: '2026-05-16 11:35 AM',
    dateRejected: '2026-05-17 09:00 AM',
    source: 'LEA Verification Request',
    productCode: 'PRD-SUP-2026-0019',
    priority: 'Standard',
    rejectedBy: 'Dr. M. Dela Cruz',
    verifierTitle: 'FDA Verifier',
    rejectionReason: 'Incomplete product information. The submission lacks clear high-resolution photos of the product back-label lot number and complete manufacturer street address. Please obtain complete packaging photos from LEA field office before re-submitting.',
    leaNotes: 'Initial request submitted by LEA intake desk.',
    documents: [
      { id: 'doc-401', name: 'Blurry_Packaging_Photo.jpg', size: '520 KB', type: 'image/jpeg', category: 'Incomplete Evidence' }
    ]
  },
  {
    // BACKEND: maps to verification_requests.id & case_id
    id: 'VR-2026-00120',
    caseId: 'ICM-2026-00120',
    productName: 'YouthElixir Anti-Aging Gel',
    manufacturer: 'Unknown Distributor / Unmarked Pack',
    complainant: 'Insp. R. Solis (LEA-CIDG)',
    category: 'Cosmetics',
    dateLogged: '2026-04-10 03:15 PM',
    dateReceived: '2026-04-10 03:30 PM',
    dateRejected: '2026-04-12 04:30 PM',
    source: 'LEA Verification Request',
    productCode: 'PRD-COS-2026-0002',
    priority: 'High',
    rejectedBy: 'Officer K. Ramos',
    verifierTitle: 'FDA Senior Inspector',
    rejectionReason: 'Duplicate verification request. Case ID ICM-2026-00105 was already processed and verified for this exact product batch on April 05, 2026.',
    leaNotes: 'Re-submitted by regional field office.',
    documents: [
      { id: 'doc-402', name: 'Field_Referral_Notice.pdf', size: '780 KB', type: 'application/pdf', category: 'Referral Document' }
    ]
  }
];

function FDAVerification() {




  // BACKEND: active tab filter state ('queue' | 'completed' | 'rejected')
  const [fdaActiveTab, setFdaActiveTab] = useState('queue');

  // BACKEND: dataset states (local state for frontend simulation)
  const [fdaQueueList, setFdaQueueList] = useState(dummyQueueRequests);
  const [fdaCompletedList, setFdaCompletedList] = useState(dummyCompletedRequests);
  const [fdaRejectedList, setFdaRejectedList] = useState(dummyRejectedRequests);

  // BACKEND: selected item pointer for Verification Queue
  const [selectedQueueItem, setSelectedQueueItem] = useState(dummyQueueRequests[0] || null);

  // BACKEND: Queue search query & priority filter states
  const [fdaSearchQuery, setFdaSearchQuery] = useState('');
  const [fdaPriorityFilter, setFdaPriorityFilter] = useState('all');

  // BACKEND: Completed Records Table Filters
  const [completedSearch, setCompletedSearch] = useState('');
  const [completedDateFrom, setCompletedDateFrom] = useState('');
  const [completedDateTo, setCompletedDateTo] = useState('');
  const [completedCategory, setCompletedCategory] = useState('');

  // BACKEND: Rejected Records Table Filters
  const [rejectedSearch, setRejectedSearch] = useState('');
  const [rejectedDateFrom, setRejectedDateFrom] = useState('');
  const [rejectedDateTo, setRejectedDateTo] = useState('');
  const [rejectedCategory, setRejectedCategory] = useState('');

  // Pagination for Completed & Rejected tables (5 rows per page, matching fda-view-reports)
  const FDA_VERIF_TABLE_PAGE_SIZE = 5;
  const [completedPage, setCompletedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);


  // BACKEND: Form inputs for FDA Verification Result section
  // Maps to: verification_requests.fda_verification_status ('Registered' | 'Unregistered')
  const [fdaVerificationStatus, setFdaVerificationStatus] = useState('');
  // Maps to: verification_requests.fda_cpr_number
  const [fdaCprNumber, setFdaCprNumber] = useState('');
  // Maps to: verification_requests.fda_cpr_expiry
  const [fdaCprExpiry, setFdaCprExpiry] = useState('');
  // Maps to: verification_requests.fda_official_remarks
  const [fdaOfficialRemarks, setFdaOfficialRemarks] = useState('');
  // Maps to: verification_requests.fda_unregistered_reason
  const [fdaUnregisteredReason, setFdaUnregisteredReason] = useState('');
  // Maps to: verification_requests.fda_rejection_reason
  const [fdaRejectionReason, setFdaRejectionReason] = useState('');

  // BACKEND: UI view toggles & modal states
  const [fdaIsRejecting, setFdaIsRejecting] = useState(false);
  const [fdaModalConfig, setFdaModalConfig] = useState(null); // { type: 'submit' | 'reject' | 'save_draft', title, description }
  const [fdaSuccessAlert, setFdaSuccessAlert] = useState(null); // { message, type }
  const [fdaDocPreviewModal, setFdaDocPreviewModal] = useState(null); // document object
  const [fdaRecordModalData, setFdaRecordModalData] = useState(null); // Completed or Rejected record for View modal

  // Receives navigation state from FDA Saved Drafts page (openDraftId + draftRecord)
  // and auto-opens that request in the Verification Queue tab.
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const incoming = location.state;
    if (!incoming?.openDraftId) return;

    // Try to match an item already present in the queue (by id or caseId)
    const existing = fdaQueueList.find(
      (q) => q.id === incoming.openDraftId || q.caseId === incoming.openDraftId
    );

    if (existing) {
      setFdaActiveTab('queue');
      handleSelectItem(existing);
    } else if (incoming.draftRecord) {
      // Draft wasn't in the queue mock data — reconstruct a queue-shaped item
      // from the saved-draft record so it can be reviewed here.
      const draft = incoming.draftRecord;
      const restoredItem = {
        id: draft.caseId,
        caseId: draft.caseId,
        productName: draft.product,
        manufacturer: draft.manufacturer,
        complainant: 'N/A',
        category: draft.category,
        dateLogged: draft.lastModified,
        dateReceived: draft.lastModified,
        source:
          draft.source === 'Walk-in'
            ? 'LEA Walk-in Intake'
            : 'Browser Extension Submission',
        productCode: 'N/A',
        priority: 'Standard',
        leaNotes: 'Restored from FDA Saved Drafts.',
        documents: []
      };

      setFdaQueueList((prev) => [restoredItem, ...prev]);
      setFdaActiveTab('queue');
      setSelectedQueueItem(restoredItem);
      setFdaVerificationStatus('');
      setFdaCprNumber('');
      setFdaCprExpiry('');
      setFdaOfficialRemarks('');
      setFdaUnregisteredReason('');
    }

    // Clear navigation state so refreshing/back doesn't re-trigger this
    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // TAB SELECTION & VIEW TRANSITIONS

  const handleTabChange = (tabKey) => {
    if (fdaActiveTab === tabKey) return;
    setFdaIsRejecting(false);
    
    // BACKEND: Analytics / log tab change
    // GET /api/fda/verification-requests?status=${tabKey}
    if (!document.startViewTransition) {
      setFdaActiveTab(tabKey);
    } else {
      document.startViewTransition(() => {
        setFdaActiveTab(tabKey);
      });
    }
  };


  // FILTERING LOGIC FOR VERIFICATION QUEUE & FULL-WIDTH TABLES

  const filteredQueue = useMemo(() => {
    return fdaQueueList.filter((item) => {
      const q = fdaSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.caseId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        (item.productCode && item.productCode.toLowerCase().includes(q));

      const matchesPriority =
        fdaPriorityFilter === 'all' || item.priority === fdaPriorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [fdaQueueList, fdaSearchQuery, fdaPriorityFilter]);

  const filteredCompleted = useMemo(() => {
    return fdaCompletedList.filter((item) => {
      const q = completedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.caseId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        (item.productCode && item.productCode.toLowerCase().includes(q));

      const matchesCategory =
        !completedCategory || item.category === completedCategory;

      let matchesDateFrom = true;
      if (completedDateFrom) {
        matchesDateFrom = new Date(item.dateCompleted) >= new Date(completedDateFrom);
      }

      let matchesDateTo = true;
      if (completedDateTo) {
        matchesDateTo = new Date(item.dateCompleted) <= new Date(completedDateTo + 'T23:59:59');
      }

      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [fdaCompletedList, completedSearch, completedCategory, completedDateFrom, completedDateTo]);

  const filteredRejected = useMemo(() => {
    return fdaRejectedList.filter((item) => {
      const q = rejectedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.caseId.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.manufacturer.toLowerCase().includes(q) ||
        (item.productCode && item.productCode.toLowerCase().includes(q));

      const matchesCategory =
        !rejectedCategory || item.category === rejectedCategory;

      let matchesDateFrom = true;
      if (rejectedDateFrom) {
        matchesDateFrom = new Date(item.dateRejected) >= new Date(rejectedDateFrom);
      }

      let matchesDateTo = true;
      if (rejectedDateTo) {
        matchesDateTo = new Date(item.dateRejected) <= new Date(rejectedDateTo + 'T23:59:59');
      }

      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
    });
  }, [fdaRejectedList, rejectedSearch, rejectedCategory, rejectedDateFrom, rejectedDateTo]);

  // Active item in Verification Queue
  const currentItem = selectedQueueItem;

  const handleSelectItem = (item) => {
    setFdaIsRejecting(false);
    if (fdaActiveTab === 'queue') {
      setSelectedQueueItem(item);
      setFdaVerificationStatus(item.draftStatus || '');
      setFdaCprNumber(item.draftCprNumber || '');
      setFdaCprExpiry(item.draftCprExpiry || '');
      setFdaOfficialRemarks(item.draftRemarks || '');
      setFdaUnregisteredReason(item.draftUnregisteredReason || '');
    }
  };

  // Helper for success alerts
  const triggerAlert = (message, type = 'success') => {
    setFdaSuccessAlert({ message, type });
    setTimeout(() => {
      setFdaSuccessAlert(null);
    }, 4500);
  };


  // CONFIRMATION MODAL HANDLERS
 
  // Open modal for Save Draft
  const handleOpenSaveDraftModal = () => {
    if (!currentItem) return;
    setFdaModalConfig({
      type: 'save_draft',
      title: 'Save Verification as Draft?',
      description: `Save current verification draft for Case ID ${currentItem.caseId}? You can return to continue working on this request anytime from the Verification Queue.`,
      confirmText: 'Save Draft',
      confirmVariant: 'secondary'
    });
  };

  // Open modal for Submit Verification
  const handleOpenSubmitModal = () => {
    if (!currentItem) return;
    if (!fdaVerificationStatus) {
      triggerAlert('Please select a Verification Status (Registered or Unregistered) before submitting.', 'warning');
      return;
    }
    if (fdaVerificationStatus === 'Registered' && !fdaOfficialRemarks.trim()) {
      triggerAlert('Please provide Official FDA Verification Remarks for registered products.', 'warning');
      return;
    }
    if (fdaVerificationStatus === 'Unregistered' && !fdaUnregisteredReason.trim()) {
      triggerAlert('Please provide the Reason Product is Not Registered.', 'warning');
      return;
    }

    setFdaModalConfig({
      type: 'submit',
      title: 'Submit Verification Result back to LEA?',
      description: `Transmit official FDA verification result (${fdaVerificationStatus.toUpperCase()}) for Case ID ${currentItem.caseId} back to LEA-CIDG? This will finalize the verification and notify the LEA investigation team.`,
      confirmText: 'Submit Verification',
      confirmVariant: 'primary'
    });
  };

  // Open modal for Reject Request
  const handleOpenRejectModal = () => {
    if (!currentItem) return;
    if (!fdaRejectionReason.trim()) {
      triggerAlert('Please provide a detailed rejection reason for LEA before confirming rejection.', 'warning');
      return;
    }

    setFdaModalConfig({
      type: 'reject',
      title: 'Reject Verification Request?',
      description: `Reject verification request for Case ID ${currentItem.caseId} back to LEA-CIDG? The request will be recorded as Rejected and LEA officers will be notified with your rejection reason.`,
      confirmText: 'Confirm Rejection',
      confirmVariant: 'danger'
    });
  };

  // Modal execution handler
  const handleExecuteModalAction = () => {
    if (!fdaModalConfig || !currentItem) return;

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (fdaModalConfig.type === 'save_draft') {
      // BACKEND: PATCH /api/fda/verification-requests/:id/draft
      // Body: { fda_verification_status, fda_cpr_number, fda_cpr_expiry, fda_official_remarks, fda_unregistered_reason }
      // STATUS UPDATE: verification_request_status remains 'pending'
      // BACKEND: Trigger notification to FDA TopBar notification panel
      const updatedItem = {
        ...currentItem,
        draftStatus: fdaVerificationStatus,
        draftCprNumber: fdaCprNumber,
        draftCprExpiry: fdaCprExpiry,
        draftRemarks: fdaOfficialRemarks,
        draftUnregisteredReason: fdaUnregisteredReason
      };

      if (fdaActiveTab === 'queue') {
        setFdaQueueList(fdaQueueList.map((item) => (item.id === currentItem.id ? updatedItem : item)));
        setSelectedQueueItem(updatedItem);
      }

      triggerAlert(`Draft saved successfully for Case ID ${currentItem.caseId}.`, 'success');
    } 
    else if (fdaModalConfig.type === 'submit') {
      // BACKEND:
      // After submitting verification:
      // status = completed
      // result = registered | unregistered
      //
      // API CALL: POST /api/fda/verification-requests/:id/submit
      // Body: {
      //   verification_status: fdaVerificationStatus, // 'Registered' | 'Unregistered'
      //   cpr_number: fdaCprNumber,
      //   cpr_expiry: fdaCprExpiry,
      //   official_remarks: fdaOfficialRemarks,
      //   unregistered_reason: fdaUnregisteredReason,
      //   verified_at: new Date().toISOString(),
      //   verified_by: current_user.id
      // }
      // DATABASE MUTATION:
      // 1. UPDATE verification_requests SET status = 'completed', fda_verification_status = :verification_status WHERE id = :id
      // 2. INSERT INTO verification_logs (case_id, action, performed_by) VALUES (:caseId, 'VERIFICATION_SUBMITTED', :user_id)
      // 3. TRIGGER NOTIFICATION SERVICE:
      //    // BACKEND: Trigger notification to LEA TopBar notification panel ("FDA has completed verification for CASE ID: [Case ID].")

      const completedItem = {
        ...currentItem,
        dateCompleted: timestamp,
        verificationResult: fdaVerificationStatus,
        cprNumber: fdaCprNumber || 'N/A',
        cprExpiry: fdaCprExpiry || 'N/A',
        ltoNumber: 'FDA-LTO-300000' + Math.floor(10000 + Math.random() * 90000),
        verifierName: 'Dr. FDA Verifier',
        verifierTitle: 'Senior Regulatory Inspector',
        remarks: fdaOfficialRemarks || 'Verification completed.',
        unregisteredReason: fdaUnregisteredReason
      };

      // Remove from current list and add to Completed
      if (fdaActiveTab === 'queue') {
        const remaining = fdaQueueList.filter((q) => q.id !== currentItem.id);
        setFdaQueueList(remaining);
        setSelectedQueueItem(remaining[0] || null);
      }

      setFdaCompletedList([completedItem, ...fdaCompletedList]);
      setSelectedCompletedItem(completedItem);
      setFdaActiveTab('completed');

      // Reset form states
      setFdaVerificationStatus('');
      setFdaCprNumber('');
      setFdaCprExpiry('');
      setFdaOfficialRemarks('');
      setFdaUnregisteredReason('');

      triggerAlert(`Verification for Case ID ${currentItem.caseId} submitted successfully back to LEA!`, 'success');
    }
    else if (fdaModalConfig.type === 'reject') {
      // BACKEND:
      // If verifier rejects due to incomplete information:
      // status = rejected
      //
      // API CALL: POST /api/fda/verification-requests/:id/reject
      // Body: { rejection_reason: fdaRejectionReason, rejected_by: current_user.id }
      // DATABASE MUTATION:
      // 1. UPDATE verification_requests SET status = 'rejected', rejection_reason = :rejection_reason WHERE id = :id
      // 2. TRIGGER NOTIFICATION SERVICE:
      //    // BACKEND: Trigger notification to LEA TopBar notification panel ("FDA rejected verification request for CASE ID: [Case ID].")

      const rejectedItem = {
        ...currentItem,
        dateRejected: timestamp,
        rejectedBy: 'Dr. FDA Verifier',
        verifierTitle: 'FDA Senior Inspector',
        rejectionReason: fdaRejectionReason
      };

      if (fdaActiveTab === 'queue') {
        const remaining = fdaQueueList.filter((q) => q.id !== currentItem.id);
        setFdaQueueList(remaining);
        setSelectedQueueItem(remaining[0] || null);
      }

      setFdaRejectedList([rejectedItem, ...fdaRejectedList]);
      setSelectedRejectedItem(rejectedItem);
      setFdaActiveTab('rejected');
      setFdaIsRejecting(false);

      setFdaRejectionReason('');
      triggerAlert(`Request for Case ID ${currentItem.caseId} rejected and returned to LEA.`, 'success');
    }

    setFdaModalConfig(null);
  };

  // Helper badge color lookup for priorities
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'FdaVerifBadgeUrgent';
      case 'High':
        return 'FdaVerifBadgeHigh';
      case 'Standard':
      default:
        return 'FdaVerifBadgeStandard';
    }
  };

  return (
    <div className="FdaDashboardMain">
      <Sidebar sidebarType="FDA" />
      <div className="FdaContentContainer">
        <TopBar topbarType="FDA" />

        <div className="FdaMainFeed FdaVerifFeedContainer">
          
          {/* HEADER SECTION */}

          <div className="FdaVerifHeader">
            <div className="FdaVerifHeaderLeft">
              <p className="FdaVerifEyebrow">FDA · VERIFICATION MANAGEMENT SYSTEM</p>
              <h1 className="FdaVerifTitle">FDA Verification Queue</h1>
              <p className="FdaVerifSubtitle">
                Inspect verification requests submitted by LEA, review attached evidence, verify product CPR / LTO registrations, and submit official FDA findings.
              </p>
            </div>
          </div>


          {/* FLOATING SUCCESS / WARNING TOAST ALERT */}

          {fdaSuccessAlert && (
            <div className={`FdaVerifToastAlert FdaVerifToast_${fdaSuccessAlert.type}`} role="alert">
              <div className="FdaVerifToastIconWrap">
                {fdaSuccessAlert.type === 'success' && <CheckCircle size={18} />}
                {fdaSuccessAlert.type === 'info' && <Info size={18} />}
                {fdaSuccessAlert.type === 'warning' && <AlertTriangle size={18} />}
                {fdaSuccessAlert.type === 'danger' && <XCircle size={18} />}
              </div>
              <div className="FdaVerifToastBody">
                <p className="FdaVerifToastMessage">{fdaSuccessAlert.message}</p>
              </div>
              <button
                className="FdaVerifToastCloseBtn"
                onClick={() => setFdaSuccessAlert(null)}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* STATS METRIC SUMMARY BAR - INFORMATIONAL ONLY (NON-CLICKABLE) */}

          <div className="FdaVerifStatsBar">

            <div className="FdaVerifStatCard">
              <div className="FdaVerifStatCardTop">
                <span className="FdaVerifStatBadge FdaVerifStatBadgeQueue">
                  <Clock size={14} />
                </span>
              </div>
              <span className="FdaVerifStatValue">{fdaQueueList.length}</span>
              <span className="FdaVerifStatLabel">Verification Queue</span>
            </div>

            <div className="FdaVerifStatCard">
              <div className="FdaVerifStatCardTop">
                <span className="FdaVerifStatBadge FdaVerifStatBadgeCompleted">
                  <CheckCircle2 size={14} />
                </span>
              </div>
              <span className="FdaVerifStatValue">{fdaCompletedList.length}</span>
              <span className="FdaVerifStatLabel">Completed</span>
            </div>

            <div className="FdaVerifStatCard">
              <div className="FdaVerifStatCardTop">
                <span className="FdaVerifStatBadge FdaVerifStatBadgeRejected">
                  <XCircle size={14} />
                </span>
              </div>
              <span className="FdaVerifStatValue">{fdaRejectedList.length}</span>
              <span className="FdaVerifStatLabel">Rejected Requests</span>
            </div>

          </div>

          {/* WORKFLOW NAVIGATION TABS - VISUALLY IDENTICAL TO VIEW REPORTS PILL TABS */}
          {/* BACKEND: Tab switching triggers state filter & loads corresponding API dataset */}
          <div className="FdaFilterRow FdaVerifTabsRow">
            <div className="FdaPillContainer">
              <button
                className={`FdaPill ${fdaActiveTab === 'queue' ? 'active' : ''}`}
                onClick={() => handleTabChange('queue')}
                id="fda-tab-verification-queue"
              >
                Verification Queue
                <span className="FdaPillCount">{fdaQueueList.length}</span>
              </button>

              <button
                className={`FdaPill ${fdaActiveTab === 'completed' ? 'active' : ''}`}
                onClick={() => handleTabChange('completed')}
                id="fda-tab-completed"
              >
                Completed
                <span className="FdaPillCount">{fdaCompletedList.length}</span>
              </button>

              <button
                className={`FdaPill ${fdaActiveTab === 'rejected' ? 'active' : ''}`}
                onClick={() => handleTabChange('rejected')}
                id="fda-tab-rejected"
              >
                Rejected Requests
                <span className="FdaPillCount">{fdaRejectedList.length}</span>
              </button>
            </div>
          </div>


          {/* VERIFICATION QUEUE — SPLIT LAYOUT (ONLY FOR QUEUE TAB) */}

          {fdaActiveTab === 'queue' && (
            <div className="FdaVerifSplitLayout">

              {/* LEFT COLUMN: QUEUE LIST PANEL */}
   
              <div className="FdaVerifQueueColumn">
                
                {/* Search & Priority Filter Header */}
                <div className="FdaVerifFilterHeader">
                  <div className="FdaVerifSearchBox">
                    <Search size={16} className="FdaVerifSearchIcon" />
                    <input
                      type="text"
                      className="FdaVerifSearchInput"
                      placeholder="Search Case ID, Product, or Manufacturer..."
                      value={fdaSearchQuery}
                      onChange={(e) => setFdaSearchQuery(e.target.value)}
                      id="fda-verification-search-input"
                    />
                    {fdaSearchQuery && (
                      <button className="FdaVerifClearSearchBtn" onClick={() => setFdaSearchQuery('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="FdaVerifPriorityFilterWrap">
                    <Filter size={14} className="FdaVerifFilterIcon" />
                    <select
                      className="FdaVerifPrioritySelect"
                      value={fdaPriorityFilter}
                      onChange={(e) => setFdaPriorityFilter(e.target.value)}
                      id="fda-verification-priority-filter"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                </div>

                {/* Request Cards List */}
                <div className="FdaVerifCardsScrollList">
                  {filteredQueue.length === 0 ? (
                    <div className="FdaVerifEmptyList">
                      <Clock size={32} className="FdaVerifEmptyIcon" />
                      <p className="FdaVerifEmptyTitle">No Queue Requests</p>
                      <p className="FdaVerifEmptyText">There are currently no new verification requests matching your filter.</p>
                    </div>
                  ) : (
                    filteredQueue.map((item) => {
                      const isSelected = selectedQueueItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`FdaVerifCard ${isSelected ? 'FdaVerifCardSelected' : ''}`}
                          onClick={() => handleSelectItem(item)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="FdaVerifCardTop">
                            <span className="FdaVerifCaseId">{item.caseId}</span>
                            <span className={`FdaVerifPriorityBadge ${getPriorityBadgeClass(item.priority)}`}>
                              {item.priority}
                            </span>
                          </div>

                          <h3 className="FdaVerifProductName">{item.productName}</h3>
                          
                          <div className="FdaVerifCardMetaRow">
                            <span>{item.manufacturer}</span>
                          </div>

                          <div className="FdaVerifCardFooter">
                            <span className="FdaVerifCategoryTag">{item.category}</span>
                            <span className="FdaVerifDateReceived">
                              <Calendar size={12} />
                              {item.dateReceived}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>


              {/* RIGHT COLUMN: SELECTED REQUEST DETAILS PANEL */}
              <div className="FdaVerifDetailsColumn">
                {!currentItem ? (
                  <div className="FdaVerifEmptyDetails">
                    <FileText size={44} className="FdaVerifEmptyDetailsIcon" />
                    <h3>No Request Selected</h3>
                    <p>Select a verification request from the left queue list to review details and perform FDA verification actions.</p>
                  </div>
                ) : (
                  <div className="FdaVerifDetailsScrollBody">

                    {/* DETAILS HEADER BAR */}
                    <div className="FdaVerifDetailsHeader">
                      <div>
                        <div className="FdaVerifDetailsBreadcrumb">
                          <span className="FdaVerifBreadcrumbActive">{currentItem.caseId}</span>
                        </div>
                        <h2 className="FdaVerifDetailsTitle">{currentItem.productName}</h2>
                        <p className="FdaVerifDetailsSubTitle">Manufacturer: <strong>{currentItem.manufacturer}</strong></p>
                      </div>
                    </div>

                    {/* MERGED CARD: Case Information + Verification Request Information + Auto-Attached Evidence */}
                    <div className="FdaVerifMergedInfoCard">

                      {/* SECTION 1: CASE INFORMATION */}
                      <div className="FdaVerifMergedSection">
                        <div className="FdaVerifSectionHeader">
                          <FileText size={16} className="FdaVerifGreenIcon" />
                          <h3>Case Information</h3>
                        </div>

                        <div className="FdaVerifGrid2">
                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Case ID (LEA Reference):</span>
                            {/* BACKEND: maps to verification_requests.case_id */}
                            <span className="FdaVerifInfoValueHighlight">{currentItem.caseId}</span>
                          </div>

                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Product Name:</span>
                            {/* BACKEND: maps to verification_requests.product_name */}
                            <span className="FdaVerifInfoValue">{currentItem.productName}</span>
                          </div>

                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Manufacturer:</span>
                            {/* BACKEND: maps to verification_requests.manufacturer_name */}
                            <span className="FdaVerifInfoValue">{currentItem.manufacturer}</span>
                          </div>

                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Requesting LEA Officer / Unit:</span>
                            {/* BACKEND: maps to verification_requests.complainant_name */}
                            <span className="FdaVerifInfoValue">{currentItem.complainant}</span>
                          </div>

                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Product Category:</span>
                            {/* BACKEND: maps to verification_requests.product_category */}
                            <span className="FdaVerifInfoValue">{currentItem.category}</span>
                          </div>

                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Date Logged & Received:</span>
                            {/* BACKEND: maps to verification_requests.created_at */}
                            <span className="FdaVerifInfoValue">{currentItem.dateLogged}</span>
                          </div>

                          <div className="FdaVerifInfoGroup FdaVerifGridFull">
                            <span className="FdaVerifInfoLabel">Verification Request Source:</span>
                            {/* BACKEND: maps to verification_requests.intake_source */}
                            <span className="FdaVerifInfoValue">{currentItem.source}</span>
                          </div>
                        </div>
                      </div>

                      <hr className="FdaVerifSectionDivider" />

                      {/* SECTION 2: VERIFICATION REQUEST INFORMATION FROM LEA */}

                      <div className="FdaVerifMergedSection">
                        <div className="FdaVerifSectionHeader">
                          <FileText size={16} className="FdaVerifGreenIcon" />
                          <h3>Verification Request Information (LEA-CIDG)</h3>
                        </div>

                        <div className="FdaVerifGrid2">
                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Product Code / Barcode:</span>
                            {/* BACKEND: maps to verification_requests.product_code */}
                            <span className="FdaVerifCodeBadge">
                              {currentItem.productCode || 'N/A'}
                            </span>
                          </div>

                          <div className="FdaVerifInfoGroup">
                            <span className="FdaVerifInfoLabel">Priority Level:</span>
                            {/* BACKEND: maps to verification_requests.priority */}
                            <span className={`FdaVerifPriorityBadge ${getPriorityBadgeClass(currentItem.priority)}`}>
                              {currentItem.priority}
                            </span>
                          </div>

                          <div className="FdaVerifInfoGroup FdaVerifGridFull">
                            <span className="FdaVerifInfoLabel">Notes & Statement from LEA Officers:</span>
                            {/* BACKEND: maps to verification_requests.lea_notes */}
                            <div className="FdaVerifNotesBox">
                              <p>{currentItem.leaNotes}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr className="FdaVerifSectionDivider" />

                      {/* SECTION 3: AUTO-ATTACHED EVIDENCE & REQUEST DOCUMENTS */}

                      <div className="FdaVerifMergedSection">
                        <div className="FdaVerifSectionHeader">
                          <Paperclip size={16} className="FdaVerifGreenIcon" />
                          <h3>Auto-Attached Evidence & Request Documents</h3>
                        </div>

                        {/* BACKEND: maps to verification_request_attachments table */}
                        <div className="FdaVerifDocsGrid">
                          {currentItem.documents && currentItem.documents.length > 0 ? (
                            currentItem.documents.map((doc) => (
                              <div key={doc.id} className="FdaVerifDocCard">
                                <div className="FdaVerifDocIcon">
                                  <FileText size={18} />
                                </div>
                                <div className="FdaVerifDocInfo">
                                  <p className="FdaVerifDocName">{doc.name}</p>
                                  <span className="FdaVerifDocMeta">{doc.category} &bull; {doc.size}</span>
                                </div>
                                <div className="FdaVerifDocActions">
                                  <button
                                    className="FdaVerifDocActionBtn"
                                    title="Inspect Attachment"
                                    onClick={() => setFdaDocPreviewModal(doc)}
                                  >
                                    <Eye size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="FdaVerifNoDocsText">No evidence documents attached to this request.</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* SECTION 4: FDA VERIFICATION RESULT INTERACTIVE CONTROL PANEL — REMAINS A SEPARATE STANDALONE CARD */}
                    {/* (For Verification Queue Tab) */}

                    <div className="FdaVerifSectionCard FdaVerifControlPanelCard">
                      
                      {!fdaIsRejecting ? (
                        <>
                          <div className="FdaVerifSectionHeader">
                            <ShieldCheck size={18} className="FdaVerifGreenIcon" />
                            <div>
                              <h3 className="FdaVerifControlTitle">FDA Verification Result Section</h3>
                              <p className="FdaVerifControlSub">Select verification determination and enter official FDA database findings.</p>
                            </div>
                          </div>

                          <div className="FdaVerifControlForm">
                            
                            {/* Verification Status Radio Selection */}
                            <div className="FdaVerifFormGroup">
                              <label className="FdaVerifFormLabel">
                                Verification Status <span className="FdaVerifRequired">*</span>
                              </label>
                              
                              {/* BACKEND: maps to verification_requests.fda_verification_status */}
                              <div className="FdaVerifRadioOptionsGroup">
                                <label
                                  className={`FdaVerifRadioCard ${fdaVerificationStatus === 'Registered' ? 'FdaVerifRadioRegisteredActive' : ''}`}
                                  id="fda-radio-status-registered"
                                >
                                  <input
                                    type="radio"
                                    name="fdaVerificationStatus"
                                    value="Registered"
                                    checked={fdaVerificationStatus === 'Registered'}
                                    onChange={(e) => setFdaVerificationStatus(e.target.value)}
                                  />
                                  <div className="FdaVerifRadioContent">
                                    <div className="FdaVerifRadioHeader">
                                      <CheckCircle size={16} className="FdaVerifGreenIcon" />
                                      <span className="FdaVerifRadioTitle">Registered Product</span>
                                    </div>
                                    <p className="FdaVerifRadioDesc">Product holds valid, active FDA Certificate of Product Registration (CPR).</p>
                                  </div>
                                </label>

                                 <label
                                  className={`FdaVerifRadioCard ${fdaVerificationStatus === 'Unregistered' ? 'FdaVerifRadioUnregisteredActive' : ''}`}
                                  id="fda-radio-status-unregistered"
                                >
                                  <input
                                    type="radio"
                                    name="fdaVerificationStatus"
                                    value="Unregistered"
                                    checked={fdaVerificationStatus === 'Unregistered'}
                                    onChange={(e) => setFdaVerificationStatus(e.target.value)}
                                  />
                                  <div className="FdaVerifRadioContent">
                                    <div className="FdaVerifRadioHeader">
                                      <AlertTriangle size={16} className="FdaVerifRedIcon" />
                                      <span className="FdaVerifRadioTitle">Unregistered Product</span>
                                    </div>
                                    <p className="FdaVerifRadioDesc">No valid CPR found, expired license, or counterfeit registration mark.</p>
                                  </div>
                                </label>
                              </div>
                            </div>

                            {/* DYNAMIC PANEL 1: REGISTERED CONFIRMATION PANEL */}
                            {fdaVerificationStatus === 'Registered' && (
                              <div className="FdaVerifRegisteredPanel">
                                <div className="FdaVerifPanelHeaderGreen">
                                  <CheckCircle size={18} />
                                  <div>
                                    <h4>CONFIRMED REGISTERED PRODUCT</h4>
                                    <p>Provide verified CPR details and official regulatory remarks.</p>
                                  </div>
                                </div>

                                <div className="FdaVerifGrid2" style={{ marginBottom: '12px' }}>
                                  <div className="FdaVerifFormGroup">
                                    <label className="FdaVerifFormLabel">
                                      FDA CPR Registration Number <span className="FdaVerifRequired">*</span>
                                    </label>
                                    {/* BACKEND: maps to verification_requests.fda_cpr_number */}
                                    <input
                                      type="text"
                                      className="FdaVerifTextInput"
                                      placeholder="e.g. FDA-CPR-2024-99812"
                                      value={fdaCprNumber}
                                      onChange={(e) => setFdaCprNumber(e.target.value)}
                                      id="fda-input-cpr-number"
                                    />
                                  </div>

                                  <div className="FdaVerifFormGroup">
                                    <label className="FdaVerifFormLabel">CPR Validity / Expiry Date</label>
                                    {/* BACKEND: maps to verification_requests.fda_cpr_expiry */}
                                    <input
                                      type="date"
                                      className="FdaVerifTextInput"
                                      value={fdaCprExpiry}
                                      onChange={(e) => setFdaCprExpiry(e.target.value)}
                                      id="fda-input-cpr-expiry"
                                    />
                                  </div>
                                </div>

                                <div className="FdaVerifFormGroup">
                                  <label className="FdaVerifFormLabel">
                                    Official FDA Verification Remarks <span className="FdaVerifRequired">*</span>
                                  </label>
                                  {/* BACKEND: maps to verification_requests.fda_official_remarks */}
                                  <textarea
                                    className="FdaVerifTextarea"
                                    rows={3}
                                    placeholder="Enter official remarks confirming registration status, CPR validity, manufacturer License to Operate (LTO) details, and compliance notes..."
                                    value={fdaOfficialRemarks}
                                    onChange={(e) => setFdaOfficialRemarks(e.target.value)}
                                    id="fda-textarea-registered-remarks"
                                  ></textarea>
                                </div>
                              </div>
                            )}

                            {/* DYNAMIC PANEL 2: UNREGISTERED WARNING PANEL */}
                            {fdaVerificationStatus === 'Unregistered' && (
                              <div className="FdaVerifUnregisteredPanel">
                                <div className="FdaVerifPanelHeaderOrange">
                                  <AlertTriangle size={18} className="FdaVerifRedIcon" />
                                  <div>
                                    <h4>UNREGISTERED PRODUCT WARNING</h4>
                                    <p>Specify exact reasons why product is not registered and regulatory advisories.</p>
                                  </div>
                                </div>

                                <div className="FdaVerifFormGroup" style={{ marginBottom: '12px' }}>
                                  <label className="FdaVerifFormLabel">
                                    Reason Product is Not Registered <span className="FdaVerifRequired">*</span>
                                  </label>
                                  {/* BACKEND: maps to verification_requests.fda_unregistered_reason */}
                                  <textarea
                                    className="FdaVerifTextarea"
                                    rows={3}
                                    placeholder="Provide detailed rationale (e.g., No CPR or LTO found in FDA database, counterfeit CPR code on label, revoked registration, prohibited ingredients)..."
                                    value={fdaUnregisteredReason}
                                    onChange={(e) => setFdaUnregisteredReason(e.target.value)}
                                    id="fda-textarea-unregistered-reason"
                                  ></textarea>
                                </div>

                                <div className="FdaVerifFormGroup">
                                  <label className="FdaVerifFormLabel">
                                    Advisory & Enforcement Recommendations for LEA
                                  </label>
                                  {/* BACKEND: maps to verification_requests.fda_official_remarks */}
                                  <textarea
                                    className="FdaVerifTextarea"
                                    rows={2}
                                    placeholder="Recommended enforcement steps for LEA-CIDG (e.g. Initiate market seizure, request online domain takedown, issue public health warning)..."
                                    value={fdaOfficialRemarks}
                                    onChange={(e) => setFdaOfficialRemarks(e.target.value)}
                                    id="fda-textarea-unregistered-remarks"
                                  ></textarea>
                                </div>
                              </div>
                            )}

                          </div>
                        </>
                      ) : (
                        /* REJECTION INLINE MODE PANEL */
                        <div className="FdaVerifInlineRejectPanel">
                          <div className="FdaVerifInlineRejectHeader">
                            <XCircle size={18} className="FdaVerifRedIcon" />
                            <div>
                              <h4>REJECT VERIFICATION REQUEST TO LEA</h4>
                              <p>Provide reason for rejecting this verification request back to LEA-CIDG officers.</p>
                            </div>
                          </div>

                          <div className="FdaVerifFormGroup">
                            <label className="FdaVerifFormLabel">
                              Rejection Rationale & Required Field Corrections <span className="FdaVerifRequired">*</span>
                            </label>
                            {/* BACKEND: maps to verification_requests.fda_rejection_reason */}
                            <textarea
                              className="FdaVerifTextarea FdaVerifTextareaReject"
                              rows={4}
                              placeholder="Explain clearly why the request is rejected (e.g. Incomplete product photos, missing lot number, duplicate case submission, unreadable label images)..."
                              value={fdaRejectionReason}
                              onChange={(e) => setFdaRejectionReason(e.target.value)}
                              id="fda-textarea-rejection-reason"
                            ></textarea>
                          </div>

                          <div className="FdaVerifRejectActionRow">
                            <button
                              className="FdaVerifBtnOutline"
                              onClick={() => setFdaIsRejecting(false)}
                            >
                              Cancel Rejection
                            </button>
                            
                            {/* BACKEND: POST /api/fda/verification-requests/:id/reject */}
                            {/* BACKEND: Trigger notification to LEA TopBar notification panel */}
                            <button
                              className="FdaVerifBtnDanger"
                              onClick={handleOpenRejectModal}
                              id="fda-btn-confirm-reject-trigger"
                            >
                              <XCircle size={15} />
                              <span>Reject Request & Send to LEA</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION BUTTONS BAR */}
                      {!fdaIsRejecting && (
                        <div className="FdaVerifActionBar">
                          <div className="FdaVerifActionBarLeft">
                            <button
                              className="FdaVerifBtnRejectMode"
                              onClick={() => setFdaIsRejecting(true)}
                              title="Reject request back to LEA"
                              id="fda-btn-open-reject-mode"
                            >
                              <XCircle size={15} />
                              <span>Reject Request</span>
                            </button>
                          </div>

                          <div className="FdaVerifActionBarRight">
                            {/* BACKEND: PATCH /api/fda/verification-requests/:id/draft */}
                            {/* BACKEND: Trigger notification to FDA TopBar notification panel */}
                            <button
                              className="FdaVerifBtnOutline"
                              onClick={handleOpenSaveDraftModal}
                              id="fda-btn-save-draft"
                            >
                              <Save size={15} />
                              <span>Save Draft</span>
                            </button>

                            {/* BACKEND: POST /api/fda/verification-requests/:id/submit */}
                            {/* BACKEND: Trigger notification to LEA TopBar notification panel */}
                            <button
                              className="FdaVerifBtnPrimary"
                              onClick={handleOpenSubmitModal}
                              id="fda-btn-submit-verification"
                            >
                              <Send size={15} />
                              <span>Submit Verification</span>
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* COMPLETED VERIFICATIONS — FULL-WIDTH TABLE */}
      

          {fdaActiveTab === 'completed' && (() => {
            // Pagination helpers for Completed table
            const totalCompleted = filteredCompleted.length;
            const totalCompletedPages = Math.ceil(totalCompleted / FDA_VERIF_TABLE_PAGE_SIZE) || 1;
            const safeCompletedPage = Math.min(Math.max(1, completedPage), totalCompletedPages);
            const cStartIdx = (safeCompletedPage - 1) * FDA_VERIF_TABLE_PAGE_SIZE;
            const cEndIdx = Math.min(cStartIdx + FDA_VERIF_TABLE_PAGE_SIZE, totalCompleted);
            const pagedCompleted = filteredCompleted.slice(cStartIdx, cEndIdx);
            return (
              <div className="FdaVerifTableSection">

                {/* Filter Panel — search fixed-width left, dropdowns grouped right */}
                <div className="FdaVerifFilterPanel">
                  <div className="FdaSearchWrapper FdaSearchFixed">
                    <Search size={16} className="FdaSearchIcon" />
                    {/* BACKEND: pass completedSearch as keyword param to GET /api/fda/verification-requests?status=completed */}
                    <input
                      type="text"
                      placeholder="Search Case ID, Product or Manufacturer..."
                      className="FdaSearchInput"
                      value={completedSearch}
                      onChange={(e) => { setCompletedSearch(e.target.value); setCompletedPage(1); }}
                      id="fda-completed-search-input"
                    />
                  </div>

                  <div className="FdaFilterGroupsRight">
                    <div className="FdaFilterGroup">
                      {/* BACKEND: pass completedDateFrom as from_date query param */}
                      <label>From</label>
                      <input
                        type="date"
                        className="FdaVerifDateInput"
                        value={completedDateFrom}
                        onChange={(e) => { setCompletedDateFrom(e.target.value); setCompletedPage(1); }}
                        title="Date Verified From"
                      />
                    </div>

                    <div className="FdaFilterGroup">
                      {/* BACKEND: pass completedDateTo as to_date query param */}
                      <label>To</label>
                      <input
                        type="date"
                        className="FdaVerifDateInput"
                        value={completedDateTo}
                        onChange={(e) => { setCompletedDateTo(e.target.value); setCompletedPage(1); }}
                        title="Date Verified To"
                      />
                    </div>

                    <div className="FdaFilterGroup">
                      {/* BACKEND: pass completedCategory as category query param */}
                      <label>Category</label>
                      <select
                        value={completedCategory}
                        onChange={(e) => { setCompletedCategory(e.target.value); setCompletedPage(1); }}
                        id="fda-completed-category-filter"
                      >
                        <option value="">All Categories</option>
                        <option value="Cosmetics">Cosmetics</option>
                        <option value="Foods">Foods</option>
                        <option value="Medical Devices">Medical Devices</option>
                        <option value="Drugs">Drugs</option>
                      </select>
                    </div>

                    {(completedSearch || completedDateFrom || completedDateTo || completedCategory) && (
                      <button
                        className="BtnClearFilters"
                        onClick={() => { setCompletedSearch(''); setCompletedDateFrom(''); setCompletedDateTo(''); setCompletedCategory(''); setCompletedPage(1); }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Table — matches fda-view-reports FdaTableCard + FdaTableWrapper + FdaTable */}
                {/* BACKEND: GET /api/fda/verification-requests?status=completed&keyword=...&from_date=...&to_date=...&category=... */}
                <div className="FdaTableCard FdaVerifTableCard">
                  <div className="FdaTableWrapper">
                    <table className="FdaTable">
                      <thead>
                        <tr>
                          <th>CASE ID</th>
                          <th>PRODUCT NAME</th>
                          <th>MANUFACTURER</th>
                          <th>CATEGORY</th>
                          <th>DATE RECEIVED</th>
                          <th>DATE VERIFIED</th>
                          <th>VERIFICATION RESULT</th>
                          <th>VERIFIED BY</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedCompleted.length > 0 ? (
                          pagedCompleted.map((item) => (
                            <tr key={item.id}>
                              <td className="CaseIdCell">{item.caseId}</td>
                              <td>
                                <div className="ProductCell">
                                  <span className="ProductCellTitle">{item.productName}</span>
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: '#1F2937', opacity: 0.8 }}>{item.manufacturer}</td>
                              <td>{item.category}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>{item.dateReceived}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>{item.dateCompleted}</td>
                              <td>
                                <span className={`FdaVerifResultTag ${item.verificationResult === 'Registered' ? 'FdaVerifTagReg' : 'FdaVerifTagUnreg'}`}>
                                  {item.verificationResult}
                                </span>
                              </td>
                              <td style={{ fontSize: '12px' }}>{item.verifierName}</td>
                              <td style={{ textAlign: 'center' }}>
                                {/* BACKEND: GET verification record by verification_request_id */}
                                <button
                                  className="BtnActionView"
                                  onClick={() => setFdaRecordModalData({ ...item, _type: 'completed' })}
                                  title="View record details"
                                  id={`fda-btn-view-completed-${item.id}`}
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="FdaEmptyState">
                              <Search size={32} />
                              <p>No completed verification records match your current filters.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="FdaTableFooter">
                    <span className="FdaFooterInfo">
                      Showing {totalCompleted === 0 ? 0 : cStartIdx + 1}–{cEndIdx} of {totalCompleted} entries
                    </span>
                    <div className="FdaPagination">
                      <button
                        className="BtnPageNav"
                        disabled={safeCompletedPage === 1}
                        onClick={() => setCompletedPage(safeCompletedPage - 1)}
                      >
                        <ChevronLeft size={14} />
                        Prev
                      </button>
                      {Array.from({ length: totalCompletedPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`FdaPageNumber ${safeCompletedPage === page ? 'active' : ''}`}
                          onClick={() => setCompletedPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="BtnPageNav"
                        disabled={safeCompletedPage === totalCompletedPages}
                        onClick={() => setCompletedPage(safeCompletedPage + 1)}
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================================ */}
          {/* REJECTED REQUESTS — FULL-WIDTH TABLE */}
          {/* ============================================================================ */}

          {fdaActiveTab === 'rejected' && (() => {
            // Pagination helpers for Rejected table
            const totalRejected = filteredRejected.length;
            const totalRejectedPages = Math.ceil(totalRejected / FDA_VERIF_TABLE_PAGE_SIZE) || 1;
            const safeRejectedPage = Math.min(Math.max(1, rejectedPage), totalRejectedPages);
            const rStartIdx = (safeRejectedPage - 1) * FDA_VERIF_TABLE_PAGE_SIZE;
            const rEndIdx = Math.min(rStartIdx + FDA_VERIF_TABLE_PAGE_SIZE, totalRejected);
            const pagedRejected = filteredRejected.slice(rStartIdx, rEndIdx);
            return (
              <div className="FdaVerifTableSection">

                {/* Filter Panel — search fixed-width left, dropdowns grouped right */}
                <div className="FdaVerifFilterPanel">
                  <div className="FdaSearchWrapper FdaSearchFixed">
                    <Search size={16} className="FdaSearchIcon" />
                    {/* BACKEND: pass rejectedSearch as keyword param to GET /api/fda/verification-requests?status=rejected */}
                    <input
                      type="text"
                      placeholder="Search Case ID, Product or Manufacturer..."
                      className="FdaSearchInput"
                      value={rejectedSearch}
                      onChange={(e) => { setRejectedSearch(e.target.value); setRejectedPage(1); }}
                      id="fda-rejected-search-input"
                    />
                  </div>

                  <div className="FdaFilterGroupsRight">
                    <div className="FdaFilterGroup">
                      {/* BACKEND: pass rejectedDateFrom as from_date query param */}
                      <label>From</label>
                      <input
                        type="date"
                        className="FdaVerifDateInput"
                        value={rejectedDateFrom}
                        onChange={(e) => { setRejectedDateFrom(e.target.value); setRejectedPage(1); }}
                        title="Date Rejected From"
                      />
                    </div>

                    <div className="FdaFilterGroup">
                      {/* BACKEND: pass rejectedDateTo as to_date query param */}
                      <label>To</label>
                      <input
                        type="date"
                        className="FdaVerifDateInput"
                        value={rejectedDateTo}
                        onChange={(e) => { setRejectedDateTo(e.target.value); setRejectedPage(1); }}
                        title="Date Rejected To"
                      />
                    </div>

                    <div className="FdaFilterGroup">
                      {/* BACKEND: pass rejectedCategory as category query param */}
                      <label>Category</label>
                      <select
                        value={rejectedCategory}
                        onChange={(e) => { setRejectedCategory(e.target.value); setRejectedPage(1); }}
                        id="fda-rejected-category-filter"
                      >
                        <option value="">All Categories</option>
                        <option value="Cosmetics">Cosmetics</option>
                        <option value="Foods">Foods</option>
                        <option value="Medical Devices">Medical Devices</option>
                        <option value="Drugs">Drugs</option>
                      </select>
                    </div>

                    {(rejectedSearch || rejectedDateFrom || rejectedDateTo || rejectedCategory) && (
                      <button
                        className="BtnClearFilters"
                        onClick={() => { setRejectedSearch(''); setRejectedDateFrom(''); setRejectedDateTo(''); setRejectedCategory(''); setRejectedPage(1); }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Table — matches fda-view-reports FdaTableCard + FdaTableWrapper + FdaTable */}
                {/* BACKEND: GET /api/fda/verification-requests?status=rejected&keyword=...&from_date=...&to_date=...&category=... */}
                <div className="FdaTableCard FdaVerifTableCard">
                  <div className="FdaTableWrapper">
                    <table className="FdaTable">
                      <thead>
                        <tr>
                          <th>CASE ID</th>
                          <th>PRODUCT NAME</th>
                          <th>MANUFACTURER</th>
                          <th>CATEGORY</th>
                          <th>DATE RECEIVED</th>
                          <th>DATE REJECTED</th>
                          <th>REJECTED BY</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRejected.length > 0 ? (
                          pagedRejected.map((item) => (
                            <tr key={item.id}>
                              <td className="CaseIdCell">{item.caseId}</td>
                              <td>
                                <div className="ProductCell">
                                  <span className="ProductCellTitle">{item.productName}</span>
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: '#1F2937', opacity: 0.8 }}>{item.manufacturer}</td>
                              <td>{item.category}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>{item.dateReceived}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>{item.dateRejected}</td>
                              <td style={{ fontSize: '12px' }}>{item.rejectedBy}</td>
                              <td style={{ textAlign: 'center' }}>
                                {/* BACKEND: GET rejection details */}
                                <button
                                  className="BtnActionView"
                                  onClick={() => setFdaRecordModalData({ ...item, _type: 'rejected' })}
                                  title="View rejection details"
                                  id={`fda-btn-view-rejected-${item.id}`}
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="FdaEmptyState">
                              <Search size={32} />
                              <p>No rejected requests match your current filters.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="FdaTableFooter">
                    <span className="FdaFooterInfo">
                      Showing {totalRejected === 0 ? 0 : rStartIdx + 1}–{rEndIdx} of {totalRejected} entries
                    </span>
                    <div className="FdaPagination">
                      <button
                        className="BtnPageNav"
                        disabled={safeRejectedPage === 1}
                        onClick={() => setRejectedPage(safeRejectedPage - 1)}
                      >
                        <ChevronLeft size={14} />
                        Prev
                      </button>
                      {Array.from({ length: totalRejectedPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`FdaPageNumber ${safeRejectedPage === page ? 'active' : ''}`}
                          onClick={() => setRejectedPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        className="BtnPageNav"
                        disabled={safeRejectedPage === totalRejectedPages}
                        onClick={() => setRejectedPage(safeRejectedPage + 1)}
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============================================================================ */}
          {/* CONFIRMATION MODAL OVERLAY */}
          {/* ============================================================================ */}
          {fdaModalConfig && (
            <div className="FdaVerifModalOverlay" role="dialog" aria-modal="true">
              <div className="FdaVerifModalContainer">
                <div className="FdaVerifModalHeader">
                  <div className={`FdaVerifModalIconWrap FdaVerifModalIcon_${fdaModalConfig.type}`}>
                    {fdaModalConfig.type === 'submit' && <ShieldCheck size={22} />}
                    {fdaModalConfig.type === 'save_draft' && <Save size={22} />}
                    {fdaModalConfig.type === 'reject' && <AlertTriangle size={22} />}
                  </div>
                  <div>
                    <h3 className="FdaVerifModalTitle">{fdaModalConfig.title}</h3>
                    <p className="FdaVerifModalDesc">{fdaModalConfig.description}</p>
                  </div>
                </div>

                <div className="FdaVerifModalFooter">
                  <button
                    className="FdaVerifBtnModalCancel"
                    onClick={() => setFdaModalConfig(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className={`FdaVerifBtnModalConfirm FdaVerifBtnModal_${fdaModalConfig.confirmVariant}`}
                    onClick={handleExecuteModalAction}
                    id="fda-modal-confirm-action-btn"
                  >
                    {fdaModalConfig.confirmText}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* RECORD VIEW MODAL (COMPLETED & REJECTED) */}
          {/* ============================================================================ */}
          {fdaRecordModalData && (
            <div className="FdaVerifModalOverlay" role="dialog" aria-modal="true">
              <div className="FdaRecordModalContainer">

                {/* Modal Header */}
                <div className="FdaRecordModalHeader">
                  <div className="FdaRecordModalTitleGroup">
                    {fdaRecordModalData._type === 'completed' ? (
                      <>
                        <ShieldCheck size={20} className="FdaVerifGreenIcon" />
                        <div>
                          <h3>Verification Record</h3>
                          <p className="FdaRecordModalSubtitle">
                            {fdaRecordModalData.caseId} &bull; Completed on {fdaRecordModalData.dateCompleted}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle size={20} className="FdaVerifRedIcon" />
                        <div>
                          <h3>Rejected Request Record</h3>
                          <p className="FdaRecordModalSubtitle">
                            {fdaRecordModalData.caseId} &bull; Rejected on {fdaRecordModalData.dateRejected}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Modal Body */}
                <div className="FdaRecordModalBody">
                  {/* Core Details Grid */}
                  <div className="FdaRecordInfoGrid">
                    <div className="FdaRecordInfoItem">
                      <span className="FdaVerifInfoLabel">CASE ID</span>
                      <span className="FdaVerifInfoValueHighlight">{fdaRecordModalData.caseId}</span>
                    </div>
                    <div className="FdaRecordInfoItem">
                      <span className="FdaVerifInfoLabel">PRODUCT NAME</span>
                      <span className="FdaVerifInfoValue">{fdaRecordModalData.productName}</span>
                    </div>
                    <div className="FdaRecordInfoItem">
                      <span className="FdaVerifInfoLabel">MANUFACTURER</span>
                      <span className="FdaVerifInfoValue">{fdaRecordModalData.manufacturer}</span>
                    </div>
                    <div className="FdaRecordInfoItem">
                      <span className="FdaVerifInfoLabel">PRODUCT CATEGORY</span>
                      <span className="FdaVerifInfoValue">{fdaRecordModalData.category}</span>
                    </div>
                    <div className="FdaRecordInfoItem">
                      <span className="FdaVerifInfoLabel">DATE RECEIVED</span>
                      <span className="FdaVerifInfoValue">{fdaRecordModalData.dateReceived}</span>
                    </div>
                    <div className="FdaRecordInfoItem">
                      <span className="FdaVerifInfoLabel">REQUESTING LEA OFFICER</span>
                      <span className="FdaVerifInfoValue">{fdaRecordModalData.complainant}</span>
                    </div>
                  </div>

                  {/* COMPLETED RECORD DETAILS */}
                  {fdaRecordModalData._type === 'completed' && (
                    <div className="FdaRecordResultSection">
                      <div className="FdaRecordSectionTitle">
                        <ShieldCheck size={15} className="FdaVerifGreenIcon" />
                        <span>Official FDA Verification Result</span>
                      </div>

                      <div className="FdaRecordResultRow">
                        <span className="FdaVerifInfoLabel">Verification Determination:</span>
                        <span className={`FdaVerifResultTag ${fdaRecordModalData.verificationResult === 'Registered' ? 'FdaVerifTagReg' : 'FdaVerifTagUnreg'}`}>
                          {fdaRecordModalData.verificationResult}
                        </span>
                      </div>

                      {fdaRecordModalData.verificationResult === 'Registered' ? (
                        <div className="FdaRecordInfoGrid">
                          <div className="FdaRecordInfoItem">
                            <span className="FdaVerifInfoLabel">FDA CPR Number</span>
                            <span className="FdaVerifInfoValueHighlight">{fdaRecordModalData.cprNumber}</span>
                          </div>
                          <div className="FdaRecordInfoItem">
                            <span className="FdaVerifInfoLabel">CPR Expiry Date</span>
                            <span className="FdaVerifInfoValue">{fdaRecordModalData.cprExpiry}</span>
                          </div>
                          <div className="FdaRecordInfoItem">
                            <span className="FdaVerifInfoLabel">License to Operate (LTO)</span>
                            <span className="FdaVerifInfoValue">{fdaRecordModalData.ltoNumber}</span>
                          </div>
                          <div className="FdaRecordInfoItem">
                            <span className="FdaVerifInfoLabel">Verified By</span>
                            <span className="FdaVerifInfoValue">{fdaRecordModalData.verifierName} &bull; {fdaRecordModalData.verifierTitle}</span>
                          </div>
                          <div className="FdaRecordInfoItem FdaRecordInfoItemFull">
                            <span className="FdaVerifInfoLabel">Official FDA Remarks</span>
                            <p className="FdaRecordRemarksText">{fdaRecordModalData.remarks}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="FdaRecordInfoGrid">
                          <div className="FdaRecordInfoItem">
                            <span className="FdaVerifInfoLabel">Verified By</span>
                            <span className="FdaVerifInfoValue">{fdaRecordModalData.verifierName} &bull; {fdaRecordModalData.verifierTitle}</span>
                          </div>
                          <div className="FdaRecordInfoItem FdaRecordInfoItemFull">
                            <span className="FdaVerifInfoLabel">Reason Product is Unregistered</span>
                            <p className="FdaRecordRemarksText">{fdaRecordModalData.unregisteredReason}</p>
                          </div>
                          <div className="FdaRecordInfoItem FdaRecordInfoItemFull">
                            <span className="FdaVerifInfoLabel">FDA Advisory Remarks</span>
                            <p className="FdaRecordRemarksText">{fdaRecordModalData.remarks}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* REJECTED RECORD DETAILS */}
                  {fdaRecordModalData._type === 'rejected' && (
                    <div className="FdaRecordResultSection FdaRecordRejectedSection">
                      <div className="FdaRecordSectionTitle">
                        <XCircle size={15} className="FdaVerifRedIcon" />
                        <span>Rejection Details</span>
                      </div>

                      <div className="FdaRecordInfoGrid">
                        <div className="FdaRecordInfoItem">
                          <span className="FdaVerifInfoLabel">Rejected By</span>
                          <span className="FdaVerifInfoValue">{fdaRecordModalData.rejectedBy}</span>
                        </div>
                        <div className="FdaRecordInfoItem">
                          <span className="FdaVerifInfoLabel">Date Rejected</span>
                          <span className="FdaVerifInfoValue">{fdaRecordModalData.dateRejected}</span>
                        </div>
                        <div className="FdaRecordInfoItem FdaRecordInfoItemFull">
                          <span className="FdaVerifInfoLabel">Rejection Rationale (Sent to LEA)</span>
                          <div className="FdaRecordRejectionReasonBox">
                            <p>{fdaRecordModalData.rejectionReason}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="FdaRecordModalFooter">
                  {/* BACKEND: GET /api/fda/verification-requests/:id/export-pdf */}
                  <button
                    className="FdaVerifBtnOutline"
                    onClick={() => {
                      triggerAlert(`Exported record for ${fdaRecordModalData.caseId} as PDF.`, 'info');
                      setFdaRecordModalData(null);
                    }}
                  >
                    <Download size={14} />
                    <span>Export Record as PDF</span>
                  </button>
                  <button
                    className="FdaVerifBtnModalCancel"
                    onClick={() => setFdaRecordModalData(null)}
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ============================================================================ */}
          {/* INTAKE DOCUMENT PREVIEW MODAL */}
          {/* ============================================================================ */}
          {fdaDocPreviewModal && (
            <div className="FdaVerifModalOverlay" role="dialog" aria-modal="true">
              <div className="FdaVerifDocModalContainer">
                <div className="FdaVerifDocModalHeader">
                  <div className="FdaVerifDocModalTitleGroup">
                    <Paperclip size={18} className="FdaVerifGreenIcon" />
                    <div>
                      <h3>{fdaDocPreviewModal.name}</h3>
                      <p className="FdaVerifDocModalMeta">{fdaDocPreviewModal.category} &bull; {fdaDocPreviewModal.size}</p>
                    </div>
                  </div>
                  <button
                    className="FdaVerifIconButton"
                    onClick={() => setFdaDocPreviewModal(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="FdaVerifDocModalBody">
                  <div className="FdaVerifDocPlaceholderPreview">
                    <FileText size={48} className="FdaVerifDocPreviewIcon" />
                    <p className="FdaVerifPreviewTitle">Document Preview Mode</p>
                    <p className="FdaVerifPreviewText">
                      Showing auto-attached evidence document file: <strong>{fdaDocPreviewModal.name}</strong>.
                    </p>
                    <span className="FdaVerifBackendBadge">
                      // BACKEND: GET /api/attachments/{fdaDocPreviewModal.id}/download
                    </span>
                  </div>
                </div>

                <div className="FdaVerifModalFooter">
                  <button
                    className="FdaVerifBtnOutline"
                    onClick={() => setFdaDocPreviewModal(null)}
                  >
                    Close Preview
                  </button>
                  <button
                    className="FdaVerifBtnDownloadAttachment"
                    onClick={() => {
                      triggerAlert(`Downloaded attachment file: ${fdaDocPreviewModal.name}`, 'info');
                      setFdaDocPreviewModal(null);
                    }}
                  >
                    <Download size={14} />
                    <span>Download Attachment</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default FDAVerification;