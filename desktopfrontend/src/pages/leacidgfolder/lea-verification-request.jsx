// merged lea-verification-request.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './lea-css.css'
import Sidebar from '../component/sidebar'
import TopBar from '../component/top-bar'
import {
  Clock3,
  BellRing,
  SquarePen,
  XCircle,
  Inbox,
  Siren,
  Archive,
  Search,
  Filter,
  Calendar,
  Paperclip,
  FileText,
  Eye,
  X,
  Download,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

// ADDED — API_BASE, parseBackendError, formatDateTime helpers
const API_BASE = 'http://127.0.0.1:8000';

// Helper: reads a FastAPI error response body and returns a single readable string.
// Handles both { "detail": "string" } and { "detail": [{ "msg": "...", ... }, ...] }
async function parseBackendError(res) {
  try {
    const data = await res.json();
    if (!data || !data.detail) return 'An unexpected error occurred.';
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((e) => e.msg || JSON.stringify(e)).join(' | ');
    }
    return JSON.stringify(data.detail);
  } catch {
    return 'An unexpected error occurred.';
  }
}

// Helper: format an ISO datetime string to a readable local date/time
function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ADDED — converts raw backend source values into readable labels
function GetSourceLabel(source) {
  if (source === 'walk_in') return 'Walk-in Intake';
  if (source === 'extension') return 'Browser Extension';
  return source;
}

// REMOVE THIS
// BACKEND: Dummy cases for FDA Response tab. 
const responseCases = [
  {
    id: 1,
    status: "Unregistered",
    caseNumber: "ICM-2025-00185",
    product: "HerbalSlim Capsules",
    manufacturer: "NatureFit Labs",
    complainant: "M. Reyes",
    category: "Drugs",
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
    category: "Drugs",
    loggedDate: "2026-05-16 11:21",
    source: "Walk-in Intake",
    returnedDate: "2026-05-17 09:00",
    sentDate: "2026-05-16 14:00",
    rejectionReason: "Incomplete product information. Please provide the complete manufacturer address and product lot number.",
    rejectedBy: "Dr. M. Dela Cruz · FDA Verifier",
  }
];

// REMOVE THIS
// BACKEND: Dummy cases for Initiated Cases tab. 
const initiatedCases = [
  {
    id: 1,
    status: "Operation in Progress",
    caseNumber: "ICM-2025-00185",
    product: "HerbalSlim Capsules",
    manufacturer: "NatureFit Labs",
    complainant: "M. Reyes",
    category: "Drugs",
    loggedDate: "2026-05-17 10:42",
    source: "Walk-in Intake",
    returnedDate: "2026-05-17 16:02",
    sentDate: "2026-05-17 14:33",
    description: "No CPR or LTO found for manufacturer. Takedown enforcement initiated."
  }
];

// REMOVE THIS
// BACKEND: Dummy cases for Closed cases. 
const dismissedCases = [
  {
    id: 1,
    caseId: 'ICM-2025-00185',
    product: 'HerbalSlim Capsules',
    manufacturer: 'NatureFit Labs',
    category: 'Drugs',
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
    category: 'Drugs',
    dateFiled: '2026-05-16',
    dateClosed: '2026-05-21',
    closedBy: 'Officer M. Santos',
    reasonClosed: 'Rejected by FDA',
  },
    {
    id: 3,
    caseId: 'ICM-2025-00185-T',
    product: 'HerbalSlim Capsules',
    manufacturer: 'NatureFit Labs',
    category: 'Drugs',
    dateFiled: '2026-05-14',
    dateClosed: '2026-05-22',
    closedBy: 'Officer J. Domingo',
    reasonClosed: 'Completed',
  },
];

// Frontend queue pagination helper — matches the existing project .Pagination / .BtnPage design
function QueuePagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;
  // Build page number list (max 5 visible)
  const pageStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);
  const pages = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);
  return (
    <div className="LeaVerifQueuePagination">
      <span className="LeaVerifQueuePageInfo">
        Page {currentPage} of {totalPages}
      </span>
      <div className="LeaVerifQueuePaginationControls">
        <button
          type="button"
          className="LeaVerifQueuePageBtn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &lsaquo; Prev
        </button>
        {pages.map((pg) => (
          <button
            key={pg}
            type="button"
            className={`LeaVerifQueuePageNum${currentPage === pg ? ' active' : ''}`}
            onClick={() => onPageChange(pg)}
          >
            {pg}
          </button>
        ))}
        <button
          type="button"
          className="LeaVerifQueuePageBtn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next &rsaquo;
        </button>
      </div>
    </div>
  );
}

function LeaVerificationRequest() {

  const navigate = useNavigate();
  const location = useLocation();

  //FOR BUTTON TABS ON VERIFICATION REQUEST
  const [activeTab, setActiveTab] = useState('Ready to Send');
  const [selectedResponse, setSelectedResponse] = useState(responseCases[0]);
  const tabs = ['Ready to Send', 'Awaiting FDA', 'FDA Response', 'Initiated Cases', 'Closed Cases'];
  const handleTabClick = (tabName) => {
    if (activeTab === tabName) return;

    if (!document.startViewTransition) {
      setActiveTab(tabName);
      return;
    }
    document.startViewTransition(() => {
      setActiveTab(tabName);
    })
  }

  // NOTE: States for new form inputs
  // BACKEND: priority maps to priority column in verification_requests table
  const [priority, setPriority] = useState('standard');
  // BACKEND: maps to field_operation_notes in verification_requests
  const [fieldOperationNotes, setFieldOperationNotes] = useState('');
  // BACKEND: maps to notes_to_fda / complaint_statement in verification_requests
  // CHANGED: removed hardcoded default — now starts empty
  const [complaintStatement, setComplaintStatement] = useState('');
  // BACKEND: maps to product_code in verification_requests
  const [productCode, setProductCode] = useState('');

  // NOTE: States for the new tabs' selected items
  const [selectedInitiatedCase, setSelectedInitiatedCase] = useState(initiatedCases[0]);

  // MERGED-ADD — search & category filter state for Ready to Send / Awaiting FDA / FDA Response / Initiated Cases queues
  const [readySearch, setReadySearch] = useState('');
  const [readyCategory, setReadyCategory] = useState('');
  const [awaitingSearch, setAwaitingSearch] = useState('');
  const [awaitingCategory, setAwaitingCategory] = useState('');
  const [responseSearch, setResponseSearch] = useState('');
  const [responseCategory, setResponseCategory] = useState('');
  const [initiatedSearch, setInitiatedSearch] = useState('');
  const [initiatedCategory, setInitiatedCategory] = useState('');

  // Frontend-only queue pagination states (25 items per page)
  const QUEUE_PAGE_SIZE = 25;
  const [readyPage, setReadyPage] = useState(1);
  const [awaitingPage, setAwaitingPage] = useState(1);
  const [responsePage, setResponsePage] = useState(1);
  const [initiatedPage, setInitiatedPage] = useState(1);
  const [closedPage, setClosedPage] = useState(1);

  // Reset to page 1 whenever search, category, or active tab changes
  useEffect(() => { setReadyPage(1); }, [readySearch, readyCategory, activeTab]);
  useEffect(() => { setAwaitingPage(1); }, [awaitingSearch, awaitingCategory, activeTab]);
  useEffect(() => { setResponsePage(1); }, [responseSearch, responseCategory, activeTab]);
  useEffect(() => { setInitiatedPage(1); }, [initiatedSearch, initiatedCategory, activeTab]);

  // NOTE: States for Dismissed Cases tab filters
  const [dismissedSearch, setDismissedSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterReasonClosed, setFilterReasonClosed] = useState('');
useEffect(() => { setClosedPage(1); }, [dismissedSearch, filterCategory, filterReasonClosed, filterDateFrom, filterDateTo, activeTab]);

  // NOTE: Modal overlay, success alert, and read-only details modal states
  const [modalConfig, setModalConfig] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewCaseModalData, setViewCaseModalData] = useState(null);


  // TAB 1: Ready to Send
  const [readyList, setReadyList] = useState([]);
  const [readyLoading, setReadyLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);


  //  TAB 2: Awaiting FDA
  const [awaitingList, setAwaitingList] = useState([]);
  const [awaitingLoading, setAwaitingLoading] = useState(false);
  const [selectedAwaitingFda, setSelectedAwaitingFda] = useState(null);

  // ADDED — doc preview modal state, mirrors the FDA-side implementation.
  // docPreviewModal holds the clicked attachment object (file_id, file_name, mime_type, file_size_display).
  // docPreviewUrl holds a blob object URL (revoked on close); Loading/Error track the in-flight fetch.
  const [docPreviewModal, setDocPreviewModal] = useState(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);
  const [docPreviewLoading, setDocPreviewLoading] = useState(false);
  const [docPreviewError, setDocPreviewError] = useState(false);

  // ADDED — real counts for the 3 top stat cards, replaces the dummy-array .length
  const [leaCounts, setLeaCounts] = useState({ fda_response_count: 0, initiated_count: 0, dismissed_count: 0 });

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 4000);
  };

  // ADDED — GET /complaints/awaiting-verification-request
  //Fetch: Ready to Send list 
  const fetchReadyList = async () => {
    const token = localStorage.getItem('access_token');
    setReadyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaints/awaiting-verification-request`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await parseBackendError(res);
        showError(msg);
        return;
      }
      const data = await res.json();
      setReadyList(data);
    } catch {
      showError('Could not load the ready-to-send list.');
    } finally {
      setReadyLoading(false);
    }
  };

  // ADDED — GET /complaints/{id}/verification-detail
  //Fetch: complaint verification detail (right panel) 
  const fetchComplaintDetail = async (complaintId) => {
    const token = localStorage.getItem('access_token');
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaints/${complaintId}/verification-detail`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await parseBackendError(res);
        showError(msg);
        return;
      }
      const data = await res.json();
      setSelectedComplaint(data);
    } catch {
      showError('Could not load complaint details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // ADDED — GET /verification-requests/awaiting-fda
  // Fetch: Awaiting FDA list
  const fetchAwaitingList = async () => {
    const token = localStorage.getItem('access_token');
    setAwaitingLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verification-requests/awaiting-fda`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await parseBackendError(res);
        showError(msg);
        return;
      }
      const data = await res.json();
      setAwaitingList(data);
      if (data.length > 0 && !selectedAwaitingFda) {
        setSelectedAwaitingFda(data[0]);
      }
    } catch {
      showError('Could not load awaiting FDA list.');
    } finally {
      setAwaitingLoading(false);
    }
  };

  // ADDED — fetches the real counts for the FDA Response / Initiated / Dismissed stat cards
  const fetchLeaCounts = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_BASE}/verification-requests/lea-counts`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeaCounts(data);
    } catch (err) {
      console.error('Failed to fetch LEA verification counts:', err);
    }
  };

  useEffect(() => {
    fetchLeaCounts();
  }, []);

  // ADDED — loads existing draft when arriving via Edit Draft navigation
  // ─── On mount: handle "Edit Draft" navigation state ──────────────────────
  useEffect(() => {
    const draftId = location.state?.draftId;
    if (draftId) {
      setCurrentDraftId(draftId);
      setActiveTab('Ready to Send');
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE}/drafts/verification/${draftId}`, {
        headers: { authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            const msg = await parseBackendError(res);
            showError(msg);
            return;
          }
          const data = await res.json();
          if (data.product_code != null) setProductCode(data.product_code);
          if (data.priority) setPriority(data.priority);
          if (data.notes_to_fda != null) setComplaintStatement(data.notes_to_fda);
          if (data.complaint) setSelectedComplaint(data.complaint);
        })
        .catch(() => showError('Could not load draft details.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fetch lists when tabs become active ─────────────────────────────────
  useEffect(() => {
    if (activeTab === 'Ready to Send') {
      fetchReadyList();
    } else if (activeTab === 'Awaiting FDA') {
      fetchAwaitingList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ADDED — fetches a preview blob from GET /shared-files/{file_id}/preview whenever
  // docPreviewModal changes. Supports images and PDFs; other types are left to
  // the download-only fallback. Object URL is revoked on cleanup to avoid memory leaks.
  useEffect(() => {
    if (!docPreviewModal) {
      setDocPreviewUrl(null);
      setDocPreviewError(false);
      return;
    }

    const isImage = docPreviewModal.mime_type?.startsWith('image/');
    const isPdf = docPreviewModal.mime_type === 'application/pdf';
    if (!isImage && !isPdf) return; // unsupported types keep the placeholder

    let objectUrl = null;
    setDocPreviewLoading(true);
    setDocPreviewError(false);

    const token = localStorage.getItem('access_token');
    fetch(`${API_BASE}/shared-files/${docPreviewModal.file_id}/preview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setDocPreviewUrl(objectUrl);
      })
      .catch(() => setDocPreviewError(true))
      .finally(() => setDocPreviewLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [docPreviewModal]);

  // ADDED — POST/PUT /drafts/verification/
  // ─── Save Draft handler ───────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!selectedComplaint) {
      showError('Please select a complaint first.');
      return;
    }
    const token = localStorage.getItem('access_token');
    const body = JSON.stringify({
      complaint_id: selectedComplaint.complaint_id,
      product_code: productCode || null,
      priority,
      notes_to_fda: complaintStatement,
    });
    const headers = {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      let res;
      if (!currentDraftId) {
        res = await fetch(`${API_BASE}/drafts/verification/`, {
          method: 'POST',
          headers,
          body,
        });
      } else {
        res = await fetch(`${API_BASE}/drafts/verification/${currentDraftId}`, {
          method: 'PUT',
          headers,
          body,
        });
      }

      if (!res.ok) {
        const msg = await parseBackendError(res);
        showError(msg);
        return;
      }

      const data = await res.json();
      if (data.draft_id) setCurrentDraftId(data.draft_id);
      showSuccess('Draft saved successfully.');
      navigate('/leacidgfolder/lea-saved-draft');
    } catch {
      showError('Failed to save draft. Please try again.');
    }
  };

  // ADDED — POST /verification-requests/ or /drafts/verification/{id}/submit
  // ─── Send Request to FDA handler ─────────────────────────────────────────
  const handleSendRequest = async () => {
    if (!selectedComplaint) {
      showError('Please select a complaint first.');
      return;
    }

    // Validate required fields for both new requests and existing drafts
    if (!complaintStatement.trim()) {
      showError('Please enter notes to FDA verifier.');
      return;
    }

    const token = localStorage.getItem('access_token');
    const headers = {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      let res;
      if (currentDraftId) {
        // Update the draft first
        const updateRes = await fetch(`${API_BASE}/drafts/verification/${currentDraftId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            complaint_id: selectedComplaint.complaint_id,
            product_code: productCode || null,
            priority,
            notes_to_fda: complaintStatement,
          }),
        });

        if (!updateRes.ok) {
          const msg = await parseBackendError(updateRes);
          showError(msg);
          return;
        }

        // Finish an existing draft → submit it
        res = await fetch(`${API_BASE}/drafts/verification/${currentDraftId}/submit`, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        });
      } else {
        res = await fetch(`${API_BASE}/verification-requests/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            complaint_id: selectedComplaint.complaint_id,
            product_code: productCode || null,
            priority,
            notes_to_fda: complaintStatement,
          }),
        });
      }

      if (!res.ok) {
        const msg = await parseBackendError(res);
        showError(msg);
        return;
      }

      showSuccess('Verification request sent to FDA.');
      // Reset compose form state
      setCurrentDraftId(null);
      setSelectedComplaint(null);
      setProductCode('');
      setComplaintStatement('');
      setPriority('standard');
      // Navigate to Awaiting FDA tab (re-render same page with tab state)
      if (document.startViewTransition) {
        document.startViewTransition(() => setActiveTab('Awaiting FDA'));
      } else {
        setActiveTab('Awaiting FDA');
      }
    } catch {
      showError('Failed to send request. Please try again.');
    }
  };

  // ADDED — Delete Draft / Verification Request handler for Ready to Send tab
  const handleDeleteRequest = () => {
    if (!selectedComplaint) {
      showError('Please select a complaint first.');
      return;
    }

    setModalConfig({
      title: 'Delete Complaint?',
      message: 'Are you sure you want to delete this complaint? This action cannot be undone.',
      confirmText: 'Delete',
      confirmBg: '#ef4444',
      onConfirm: async () => {
        setModalConfig(null);

        if (currentDraftId) {
          const token = localStorage.getItem('access_token');
          try {
            const res = await fetch(`${API_BASE}/drafts/verification/${currentDraftId}`, {
              method: 'DELETE',
              headers: { authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              const msg = await parseBackendError(res);
              showError(msg);
              return;
            }
            showSuccess('Draft deleted successfully.');
          } catch {
            showError('Failed to delete draft. Please try again.');
            return;
          }
        } else {
          showSuccess('Verification request draft cleared.');
        }

        // Reset compose form state and selection
        setCurrentDraftId(null);
        setSelectedComplaint(null);
        setProductCode('');
        setComplaintStatement('');
        setPriority('standard');
        fetchReadyList();
      },
      onCancel: () => {
        setModalConfig(null);
      },
    });
  };

  // MERGED-ADD — client-side search + category filtering for the four queue tabs
  const filteredReadyList = readyList.filter((item) => {
    const q = readySearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (item.case_reference || '').toLowerCase().includes(q) ||
      (item.product_title || '').toLowerCase().includes(q) ||
      (item.manufacturer || '').toLowerCase().includes(q);
    const matchesCategory = !readyCategory || item.product_category === readyCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAwaitingList = awaitingList.filter((item) => {
    const q = awaitingSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (item.case_reference || '').toLowerCase().includes(q) ||
      (item.product_name || '').toLowerCase().includes(q) ||
      (item.manufacturer || '').toLowerCase().includes(q);
    const matchesCategory = !awaitingCategory || item.product_category === awaitingCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredResponseCases = responseCases.filter((item) => {
    const q = responseSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      item.caseNumber.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q);
    const matchesCategory = !responseCategory || item.category === responseCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInitiatedCases = initiatedCases.filter((item) => {
    const q = initiatedSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      item.caseNumber.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q);
    const matchesCategory = !initiatedCategory || item.category === initiatedCategory;
    return matchesSearch && matchesCategory;
  });

  // Frontend pagination slices — 15 items per page, operating on the already-filtered lists
  const readyTotalPages = Math.ceil(filteredReadyList.length / QUEUE_PAGE_SIZE) || 1;
  const paginatedReadyList = filteredReadyList.slice((readyPage - 1) * QUEUE_PAGE_SIZE, readyPage * QUEUE_PAGE_SIZE);

  const awaitingTotalPages = Math.ceil(filteredAwaitingList.length / QUEUE_PAGE_SIZE) || 1;
  const paginatedAwaitingList = filteredAwaitingList.slice((awaitingPage - 1) * QUEUE_PAGE_SIZE, awaitingPage * QUEUE_PAGE_SIZE);

  const responseTotalPages = Math.ceil(filteredResponseCases.length / QUEUE_PAGE_SIZE) || 1;
  const paginatedResponseCases = filteredResponseCases.slice((responsePage - 1) * QUEUE_PAGE_SIZE, responsePage * QUEUE_PAGE_SIZE);

  const initiatedTotalPages = Math.ceil(filteredInitiatedCases.length / QUEUE_PAGE_SIZE) || 1;
  const paginatedInitiatedCases = filteredInitiatedCases.slice((initiatedPage - 1) * QUEUE_PAGE_SIZE, initiatedPage * QUEUE_PAGE_SIZE);

  // NOTE: Filter logic for closed/dismissed complaints table rows
  // MERGED-CHANGED — now also matches dismissedSearch against case ID / product / manufacturer
const filteredDismissed = dismissedCases.filter((c) => {
  const q = dismissedSearch.toLowerCase().trim();
  const matchSearch = !q ||
    c.caseId.toLowerCase().includes(q) ||
    c.product.toLowerCase().includes(q) ||
    c.manufacturer.toLowerCase().includes(q);
  const matchCategory = filterCategory ? c.category === filterCategory : true;
  const matchReasonClosed = filterReasonClosed ? c.reasonClosed === filterReasonClosed : true;
  const matchFrom = filterDateFrom ? c.dateClosed >= filterDateFrom : true;
  const matchTo = filterDateTo ? c.dateClosed <= filterDateTo : true;
  return matchSearch && matchCategory && matchReasonClosed && matchFrom && matchTo;
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
      message = `This will close CASE ID: ${caseNumber}. Product has been confirmed registered with FDA. The case will be moved to the Closed Cases tab. Do you want to proceed?`;
      confirmText = "Acknowledge";
      successText = "Case dismissed. Moved to Closed Cases.";
    } else if (actionType === 'Close Case') {
      title = "Close Takedown Case?";
      message = `This will mark the takedown operation for CASE ID: ${caseNumber} as complete and close the case. Make sure field operation notes are updated before closing. This action cannot be undone. Do you want to proceed?`;
      confirmText = "Close Case";
      successText = "Case closed successfully.";
    } else if (actionType === 'Acknowledge') {
      title = "Acknowledge Rejection?";
      message = `This will acknowledge the rejection of CASE ID: ${caseNumber} by FDA. The case will be moved to the Closed Cases tab. Do you want to proceed?`;
      confirmText = "Acknowledge";
      successText = "Rejection acknowledged. Case moved to Closed Cases.";
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
         BACKEND NOTIFICATION:
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

  return (
    <div className='LeaDashboardMain'>
      <Sidebar sidebarType="LEA" />
      <div className='LeaContentContainer'>
        <TopBar topbarType="LEA" />
        <div className='LeaMainfeed'>
          <div className='LeaHeader'>
            <div>
              <p>LEA-CIDG: VERIFICATION REQUEST</p>
              <p>SEND & TRACK FDA VERIFICATION REQUEST</p>
            </div>
          </div>

          {/* STATS METRIC SUMMARY BAR (NON-CLICKABLE) */}
          <div className="LeaVerifStatsBar">
            <div className="LeaVerifStatCard">
              <div className="LeaVerifStatCardTop">
                <div className="LeaVerifStatBadge LeaVerifStatBadgeResponse">
                  <Inbox size={14} />
                </div>
              </div>
              {/* CHANGED — was {responseCases.length}, now uses real backend count */}
              <p className="LeaVerifStatValue">{leaCounts.fda_response_count}</p>
              <p className="LeaVerifStatLabel">FDA Response</p>
            </div>

            <div className="LeaVerifStatCard">
              <div className="LeaVerifStatCardTop">
                <div className="LeaVerifStatBadge LeaVerifStatBadgeInitiated">
                  <Siren size={14} />
                </div>
              </div>
              {/* CHANGED — was {initiatedCases.length}, now uses real backend count */}
              <p className="LeaVerifStatValue">{leaCounts.initiated_count}</p>
              <p className="LeaVerifStatLabel">Initiated Cases</p>
            </div>

            <div className="LeaVerifStatCard">
              <div className="LeaVerifStatCardTop">
                <div className="LeaVerifStatBadge LeaVerifStatBadgeDismissed">
                  <Archive size={14} />
                </div>
              </div>
              {/* CHANGED — was {dismissedCases.length}, now uses real backend count */}
              <p className="LeaVerifStatValue">{leaCounts.dismissed_count}</p>
              <p className="LeaVerifStatLabel">Closed Cases</p>
            </div>
          </div>

          <div className="VerificationContainer">

            <div className="VerificationTabs">
              <div className='VerificationTabsButton'>
                {tabs.slice(0, 3).map((tabName) => (
                  <button key={tabName} className={`ButtonTab ${activeTab === tabName ? 'active' : ''}`} onClick={() => handleTabClick(tabName)}>{tabName}</button>
                ))}
                {/* styles the tab separator between process tabs and tracking tabs */}
                <div className="TabSeparator"></div>
                {tabs.slice(3).map((tabName) => (
                  <button key={tabName} className={`ButtonTab ${activeTab === tabName ? 'active' : ''}`} onClick={() => handleTabClick(tabName)}>{tabName}</button>
                ))}
              </div>
            </div>
            {/*CONTENT FOR EACH TAB */}

            {/*READY TO SEND TAB CONTENT*/}
            <div className='VerificationTabContent ReadySendButtonContent'>
              {activeTab === 'Ready to Send' &&
                <div className="VerificationContent">
                  {/* CHANGED — real data from readyList, was hardcoded card */}
                  {/* LEFT PANEL */}
                  <div className="ReadytoSendQueue">
                    {/* MERGED-ADD — search bar + category filter dropdown */}
                     <div className="ReadytoSendHeader">
                      <p>Walk-in cases awaiting your request</p>
                      {/* MERGED-CHANGED — count now reflects filtered results */}
                      <span>{filteredReadyList.length}</span>
                    </div>
                    <div className="LeaVerifQueueFilterHeader">
                      <div className="LeaSearchWrapper">
                        <Search size={16} className="LeaSearchIcon" />
                        <input
                          type="text"
                          placeholder="Search Case ID, Product, or Manufacturer..."
                          className="LeaCategoriesSearchInput"
                          value={readySearch}
                          onChange={(e) => setReadySearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EDEDED', padding: '5px 10px', borderRadius: '6px' }}>
                        <Filter size={14} className="LeaVerifFilterIcon" />
                        <select
                          style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '12px', fontWeight: '600', color: '#030303', outline: 'none', cursor: 'pointer' }}
                          value={readyCategory}
                          onChange={(e) => setReadyCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          <option value="Cosmetics">Cosmetics</option>
                          <option value="Food">Food</option>
                          <option value="Medical Devices">Medical Devices</option>
                          <option value="Drugs">Drugs</option>
                        </select>
                      </div>
                    </div>
                   

                    {readyLoading && (
                      <p style={{ padding: '12px', color: '#7a8796', fontSize: '13px' }}>Loading...</p>
                    )}

                    {!readyLoading && readyList.length === 0 && (
                      <p style={{ padding: '12px', color: '#7a8796', fontSize: '13px' }}>No cases awaiting verification request.</p>
                    )}

                    {/* MERGED-ADD — empty state for when filters exclude everything */}
                    {!readyLoading && readyList.length > 0 && filteredReadyList.length === 0 && (
                      <div className="LeaVerifEmptyList">
                        <Search size={32} />
                        <p className="LeaVerifEmptyText">No cases match your current filters.</p>
                      </div>
                    )}

                    {!readyLoading && paginatedReadyList.map((item) => (
                      <div
                        key={item.complaint_id}
                        className={`QueueCard ${selectedComplaint?.complaint_id === item.complaint_id ? 'ActiveQueueCard' : ''}`}
                        onClick={() => fetchComplaintDetail(item.complaint_id)}
                      >
                        <div className='QueueLabels'>
                          <h4>{item.product_title}</h4>
                          <p>{item.manufacturer || '—'}</p>
                          <small>
                            CASE ID: {item.case_reference}
                          </small>
                        </div>

                        <div className="QueueTag">
                          <span>{GetSourceLabel(item.source)}</span>
                        </div>

                        {/* MERGED-ADD — category + date, matching old version's QueueCardFooterRow.
                            FLAGGED: date field name not confirmed against the real API response for this
                            list endpoint — using item.created_at as the best guess; please confirm the
                            actual field the backend returns (or add it if it's missing from that endpoint). */}
                        <div className="QueueCardFooterRow">
                          <span className="QueueCategoryTag">{item.product_category || '—'}</span>
                          <span className="QueueDateTag">
                            <Calendar size={12} />
                            {item.created_at ? formatDateTime(item.created_at) : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                    <QueuePagination
                      currentPage={readyPage}
                      totalPages={readyTotalPages}
                      onPageChange={setReadyPage}
                    />
                  </div>

                  {/* CHANGED — real data from selectedComplaint, was hardcoded */}
                  {/* RIGHT PANEL */}
                  <div className="VerificationDetails">
                    <div className="VerificationCard">
                      <div>
                        {detailLoading ? (
                          <p style={{ color: '#7a8796', fontSize: '13px' }}>Loading details...</p>
                        ) : selectedComplaint ? (
                          <>
                            <small>CASE ID: {selectedComplaint.case_reference}</small>
                            <h2>{selectedComplaint.product_title}</h2>
                            <p>MANUFACTURER: {selectedComplaint.manufacturer || '—'}</p>

                            <div className="CaseInfoGrid">
                              <div>
                                <label>COMPLAINANT</label>
                                <p>{selectedComplaint.complainant_name || '—'}</p>
                              </div>

                              <div>
                                <label>CATEGORY</label>
                                <p>{selectedComplaint.product_category || '—'}</p>
                              </div>

                              <div>
                                <label>LOGGED</label>
                                <p>{formatDateTime(selectedComplaint.created_at)}</p>
                              </div>

                              <div>
                                <label>SOURCE</label>
                                <p>{GetSourceLabel(selectedComplaint.source)}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p style={{ color: '#7a8796', fontSize: '13px' }}>Select a case from the list to view details.</p>
                        )}
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
                            {/* BACKEND: maps to product_code in verification_requests */}
                            <input
                              type="text"
                              placeholder="Barcode / lot number"
                              value={productCode}
                              onChange={(e) => setProductCode(e.target.value)}
                            />
                          </div>

                          <div>
                            <label>Priority</label>
                            {/* BACKEND: priority maps to priority column in verification_requests table */}
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
                          {/*     BACKEND: maps to notes_to_fda in verification_requests */}
                          <textarea
                            rows="5"
                            placeholder="Enter notes for FDA verification..."
                            value={complaintStatement}
                            onChange={(e) => setComplaintStatement(e.target.value)}
                          ></textarea>
                        </div>

                        {/* CHANGED — now driven by the real SharedFileResponse shape (file_id, file_name,
                            file_size_bytes, mime_type, file_size_display). Icon picks image vs generic
                            document based on mime_type; meta line shows file size only, per your call —
                            file_name is the card's title, file_size_display is the only thing under it. */}
                        <div className="LeaVerifSectionCard">
                          <div className="LeaVerifSectionHeader">
                            <Paperclip size={16} className="LeaVerifBlueIcon" />
                            <h3>Auto-Attached Evidence & Request Documents</h3>
                          </div>
                          <div className="LeaVerifDocsGrid">
                            {selectedComplaint?.attached_files?.length > 0 ? (
                              selectedComplaint.attached_files.map((f, idx) => (
                                <div key={f.file_id || idx} className="LeaVerifDocCard">
                                  <div className="LeaVerifDocIcon">
                                    {f.mime_type?.startsWith('image/') ? (
                                      <ImageIcon size={18} />
                                    ) : (
                                      <FileText size={18} />
                                    )}
                                  </div>
                                  <div className="LeaVerifDocInfo">
                                    <p className="LeaVerifDocName">{f.file_name}</p>
                                    <span className="LeaVerifDocMeta">{f.file_size_display}</span>
                                  </div>
                                  {/* CHANGED — eye button now opens the doc preview modal instead of doing nothing */}
                                  <div className="LeaVerifDocActions">
                                    <button
                                      className="LeaVerifDocActionBtn"
                                      title="Inspect Attachment"
                                      onClick={() => setDocPreviewModal(f)}
                                    >
                                      <Eye size={13} />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="LeaVerifNoDocsText">No evidence documents attached to this request.</p>
                            )}
                          </div>
                        </div>

                        <div className="VerificationActions">
                          <button type="button" className="DeleteBtn" onClick={handleDeleteRequest}>
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                          <div className="VerificationRightActions">
                            {/* BACKEND: POST/PUT to /drafts/verification/ */}
                            <button type="button" className="DraftButton" onClick={handleSaveDraft}>
                              Save Draft
                            </button>
                            {/* BACKEND: POST to /verification-requests/ or /drafts/verification/:id/submit */}
                            <button type="button" className="SendReqBtn" onClick={handleSendRequest}>
                              Send Request to FDA
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>}

              {/*AWAITING FDA TAB CONTENT*/}
              {activeTab === 'Awaiting FDA' &&
                <div className='VerificationContent AwaitingButtonContent'>

                  {/* CHANGED — real data from awaitingList/selectedAwaitingFda, was hardcoded */}
                  {/* LEFT PANEL */}
                  <div className="AwaitingLEAQueue">
                    <div className="AwaitingHeader">
                      <p>Request Pending FDA Review</p>
                      {/* MERGED-CHANGED — count now reflects filtered results */}
                      <span>{filteredAwaitingList.length}</span>
                    </div>
                    {/* MERGED-ADD — search bar + category filter dropdown */}
                    <div className="LeaVerifQueueFilterHeader">
                      <div className="LeaSearchWrapper">
                        <Search size={16} className="LeaSearchIcon" />
                        <input
                          type="text"
                          placeholder="Search Case ID, Product, or Manufacturer..."
                          className="LeaCategoriesSearchInput"
                          value={awaitingSearch}
                          onChange={(e) => setAwaitingSearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EDEDED', padding: '5px 10px', borderRadius: '6px' }}>
                        <Filter size={14} className="LeaVerifFilterIcon" />
                        <select
                          style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '12px', fontWeight: '600', color: '#030303', outline: 'none', cursor: 'pointer' }}
                          value={awaitingCategory}
                          onChange={(e) => setAwaitingCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          <option value="Cosmetics">Cosmetics</option>
                          <option value="Food">Food</option>
                          <option value="Medical Devices">Medical Devices</option>
                          <option value="Drugs">Drugs</option>
                        </select>
                      </div>
                    </div>
                    

                    {awaitingLoading && (
                      <p style={{ padding: '12px', color: '#7a8796', fontSize: '13px' }}>Loading...</p>
                    )}

                    {!awaitingLoading && awaitingList.length === 0 && (
                      <p style={{ padding: '12px', color: '#7a8796', fontSize: '13px' }}>No pending verification requests.</p>
                    )}

                    {/* MERGED-ADD — empty state for when filters exclude everything */}
                    {!awaitingLoading && awaitingList.length > 0 && filteredAwaitingList.length === 0 && (
                      <div className="LeaVerifEmptyList">
                        <Search size={32} />
                        <p className="LeaVerifEmptyText">No cases match your current filters.</p>
                      </div>
                    )}

                    {!awaitingLoading && paginatedAwaitingList.map((item) => (
                      <div
                        key={item.request_id}
                        className={`QueueCard ${selectedAwaitingFda?.request_id === item.request_id ? 'ActiveQueueCard' : ''}`}
                        onClick={() => setSelectedAwaitingFda(item)}
                      >
                        {/* MERGED-CHANGED — restructured to match the reference UI: CASE ID + source tag on top row */}
                        <div className="QueueCardTopRow">
                          <small style={{ margin: 0 }}>CASE ID: {item.case_reference}</small>
                          <span className="QueueTagInline">{GetSourceLabel(item.source)}</span>
                        </div>
                        <h4>{item.product_name}</h4>
                        <p>{item.manufacturer || '—'}</p>

                        {/* MERGED-ADD — category + date, matching old version's QueueCardFooterRow.
                            FLAGGED: same field-name caveat as the Ready to Send list — using
                            item.requested_at (confirmed elsewhere in this tab's detail panel) as the date. */}
                        <div className="QueueCardFooterRow">
                          <span className="QueueCategoryTag">{item.product_category || '—'}</span>
                          <span className="QueueDateTag">
                            <Calendar size={12} />
                            {item.requested_at ? formatDateTime(item.requested_at) : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                    <QueuePagination
                      currentPage={awaitingPage}
                      totalPages={awaitingTotalPages}
                      onPageChange={setAwaitingPage}
                    />

                  </div>

                  {/* CHANGED — real data from awaitingList/selectedAwaitingFda, was hardcoded */}
                  {/* RIGHT PANEL */}
                  <div className="VerificationDetails">
                    <div className="VerificationCard">
                      <div>
                        {selectedAwaitingFda ? (
                          <>
                            <small>CASE ID: {selectedAwaitingFda.case_reference}</small>
                            <h2>{selectedAwaitingFda.product_name}</h2>
                            <p>MANUFACTURER: {selectedAwaitingFda.manufacturer || '—'}</p>

                            {/* BACKEND: complainant, category, source, and region are NOT stored
                                                        directly in verification_requests. They are fetched via complaint_id
                                                        joining to the complaints and walkin_complainants tables through the
                                                        verification_requests_full view */}
                            <div className="CaseInfoGrid">
                              <div>
                                <label>COMPLAINANT</label>
                                <p>{selectedAwaitingFda.complainant_name || '—'}</p>
                              </div>

                              <div>
                                <label>CATEGORY</label>
                                <p>{selectedAwaitingFda.product_category || '—'}</p>
                              </div>

                              <div>
                                <label>LOGGED</label>
                                <p>{formatDateTime(selectedAwaitingFda.requested_at)}</p>
                              </div>

                              <div>
                                <label>SOURCE</label>
                                <p>{GetSourceLabel(selectedAwaitingFda.source)}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p style={{ color: '#7a8796', fontSize: '13px' }}>Select a case from the list to view details.</p>
                        )}
                      </div>

                      <div className='UpdateForResponse'>
                        <div className='StatusTitle'>
                          <div className='TitleHolder'>
                            <div className='WaitingIconBox'><Clock3 /></div>
                            <div><h3>Awaiting FDA Response</h3></div>
                          </div>
                          {/* requested_at used as the send date for this tab */}
                          <p>
                            {selectedAwaitingFda
                              ? `Request sent ${formatDateTime(selectedAwaitingFda.requested_at)}. FDA verifier will respond with a digital confirmation of registration status.`
                              : 'FDA verifier will respond with a digital confirmation of registration status.'}
                          </p>
                        </div>
                        <div className='ButtonsForResponse'>
                          {/* BACKEND: POST to /api/verification-requests/:id/reminder */}
                          {/* CHANGED — now passes real case_reference/request_id instead of hardcoded values; handleActionButtonClick itself still has no backend */}
                          <button
                            className='SendReminderBtn'
                            onClick={() => handleActionButtonClick(
                              'Send Reminder',
                              selectedAwaitingFda?.case_reference || '',
                              selectedAwaitingFda?.request_id || null
                            )}
                          >
                            <BellRing />
                            <p>Send Reminder</p>
                          </button>
                          {/* BACKEND: PATCH to /api/verification-requests/:id (status: recalled) */}
                          <button
                            className='RecallRequestBtn'
                            onClick={() => handleActionButtonClick(
                              'Recall Request',
                              selectedAwaitingFda?.case_reference || '',
                              selectedAwaitingFda?.request_id || null
                            )}
                          >
                            Recall Request
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>}

              {/*FDA RESPONSE TAB CONTENT*/}
              {activeTab === 'FDA Response' &&
                <div className='VerificationContent FDAResponseButtonContent'>
                  {/* LEFT PANEL */}
                  <div className="LEAResponseQueue">
                    {/* MERGED-ADD — search bar + category filter dropdown */}
                     <div className="LEAResponseHeader">
                      <p>FDA confirmations received</p>
                      {/* REMOVE THIS */}
                      {/* BACKEND: count of responseCases */}
                      {/* MERGED-CHANGED — count now reflects filtered results */}
                      <span>{filteredResponseCases.length}</span>
                    </div>
                    <div className="LeaVerifQueueFilterHeader">
                      
                      <div className="LeaSearchWrapper">
                        <Search size={16} className="LeaSearchIcon" />
                        <input
                          type="text"
                          placeholder="Search Case ID, Product, or Manufacturer..."
                          className="LeaCategoriesSearchInput"
                          value={responseSearch}
                          onChange={(e) => setResponseSearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EDEDED', padding: '5px 10px', borderRadius: '6px' }}>
                        <Filter size={14} className="LeaVerifFilterIcon" />
                        <select
                          style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '12px', fontWeight: '600', color: '#030303', outline: 'none', cursor: 'pointer' }}
                          value={responseCategory}
                          onChange={(e) => setResponseCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          <option value="Cosmetics">Cosmetics</option>
                          <option value="Food">Food</option>
                          <option value="Medical Devices">Medical Devices</option>
                          <option value="Drugs">Drugs</option>
                        </select>
                      </div>
                    </div>
                   

                    {/* MERGED-ADD — empty state for when filters exclude everything */}
                    {filteredResponseCases.length === 0 && (
                      <div className="LeaVerifEmptyList">
                        <Search size={32} />
                        <p className="LeaVerifEmptyText">No cases match your current filters.</p>
                      </div>
                    )}

                    {paginatedResponseCases.map((item) => (
                      <div
                        key={item.id}
                        className={`QueueCard ${selectedResponse.id === item.id ? 'ActiveQueueCard' : ''}`}
                        id=''
                        onClick={() => setSelectedResponse(item)}
                      >
                        {/* MERGED-CHANGED — restructured to match the reference UI: CASE ID + status badge on top row, category + date in footer */}
                        <div className="QueueCardTopRow">
                          <small style={{ margin: 0 }}>CASE ID: {item.caseNumber}</small>
                          {/*  BACKEND: status badge reflects verification_request_status ('confirmed_registered' | 'confirmed_unregistered' | 'rejected') */}
                          <span className={`QueueStatusBadge ${item.status === 'Registered' ? 'registered' :
                            item.status === 'Rejected' ? 'rejected' : 'unregistered'
                            }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4>{item.product}</h4>
                        <p>{item.manufacturer}</p>
                        <div className="QueueCardFooterRow">
                          <span className="QueueCategoryTag">{item.category}</span>
                          <span className="QueueDateTag">
                            <Calendar size={12} />
                            {item.returnedDate}
                          </span>
                        </div>
                      </div>
                    ))}
                    <QueuePagination
                      currentPage={responsePage}
                      totalPages={responseTotalPages}
                      onPageChange={setResponsePage}
                    />

                  </div>

                  {/* RIGHT PANEL */}
                  <div className='VerificationDetails'>
                    <div className='VerificationCard'>
                      <div>
                        <small>CASE ID: {selectedResponse.caseNumber}</small>
                        <h2>{selectedResponse.product}</h2>
                        <p>MANUFACTURER: {selectedResponse.manufacturer || '—'}</p>

                        <div className="CaseInfoGrid">
                          <div>
                            <label>COMPLAINANT</label>
                            {/* REMOVE THIS */}
                            {/* BACKEND: complainant name */}
                            <p>{selectedResponse.complainant}</p>
                          </div>

                          <div>
                            <label>CATEGORY</label>
                            {/* REMOVE THIS */}
                            {/* BACKEND: category */}
                            <p>{selectedResponse.category}</p>
                          </div>

                          <div>
                            <label>LOGGED</label>
                            {/* REMOVE THIS */}
                            {/* BACKEND: created_at */}
                            <p>{selectedResponse.loggedDate}</p>
                          </div>

                          <div>
                            <label>SOURCE</label>
                            {/* REMOVE THIS */}
                            {/* BACKEND: source */}
                            <p>{selectedResponse.source}</p>
                          </div>
                        </div>
                      </div>

                      <div className='ConfirmationReturned'>
                        {selectedResponse.status === 'Rejected' ? (
                          <>
                            <div className="ResponseBox ResponseRejected">
                              <div className='LeaVerifResponseStatusHeader LeaVerifRejectedHeader'>
                                <XCircle style={{ color: '#EF4444' }} />
                                <div className='StatementReturn'>
                                  <h3>CONFIRMED REJECTED PRODUCT</h3>
                                </div>
                              </div>

                              <div className="LeaVerifRejectionFieldsGrid">
                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">Rejected By</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.rejectedBy || selectedResponse.rejected_by_name || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">Date Returned / Responded</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.returnedDate || selectedResponse.responded_at || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField LeaVerifFullWidthField">
                                  <label className="LeaVerifFieldLabel">Reason for Rejection</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.rejectionReason || selectedResponse.rejection_reason || '—'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="LeaVerifAckNotice">
                              <p>
                                Please review the rejection reason above and click Acknowledge to move this case to closed/dismissed records.
                              </p>
                            </div>

                            <div className='ResponseBtn' style={{ marginTop: '20px' }}>
                              <button
                                style={{ width: '300', height: '40px' }}
                                onClick={() => handleActionButtonClick('Acknowledge', selectedResponse.caseNumber || selectedResponse.case_reference || '', selectedResponse.id || selectedResponse.request_id || null)}
                              >
                                Acknowledge
                              </button>
                            </div>
                          </>
                        ) : selectedResponse.status === 'Registered' ? (
                          <>
                            <div className="ResponseBox ResponseRegistered">
                              <div className='LeaVerifResponseStatusHeader LeaVerifRegisteredHeader'>
                                <CheckCircle style={{ color: '#10B981', backgroundColor: '#D1FAE5' }} />
                                <div className='StatementReturn'>
                                  <h3>CONFIRMED REGISTERED PRODUCT</h3>
                                </div>
                              </div>

                              <div className="LeaVerifResultFieldsGrid">
                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">Verified By</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.verifiedBy || selectedResponse.verified_by_name || 'Dr. J. Santos · FDA Officer'}</p>
                                </div>

                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">Date Returned / Responded</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.returnedDate || selectedResponse.responded_at || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">FDA CPR Registration Number</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.cprNumber || selectedResponse.cpr_number || selectedResponse.fda_cpr_number || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">CPR Validity / Expiry Date</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.cprExpiry || selectedResponse.cpr_expiry || selectedResponse.fda_cpr_expiry || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField LeaVerifFullWidthField">
                                  <label className="LeaVerifFieldLabel">Official FDA Verification Remarks</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.remarks || selectedResponse.response_notes || selectedResponse.description || '—'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="LeaVerifAckNotice">
                              <p>
                                This case has been confirmed to be Registered. Status is now dismissed. Please click Acknowledge to move this case to closed/dismissed records.
                              </p>
                            </div>

                            <div className='ResponseBtn'>
                              <button onClick={() => handleActionButtonClick(
                                'Dismiss Case',
                                selectedResponse.caseNumber || selectedResponse.case_reference || '',
                                selectedResponse.id || selectedResponse.request_id || null
                              )}>
                                Acknowledge
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="ResponseBox ResponseUnregistered">
                              <div className='LeaVerifResponseStatusHeader LeaVerifUnregisteredHeader'>
                                <AlertTriangle style={{ color: '#EF4444', backgroundColor: '#FEE2E2' }} />
                                <div className='StatementReturn'>
                                  <h3>CONFIRMED UNREGISTERED PRODUCT</h3>
                                </div>
                              </div>

                              <div className="LeaVerifResultFieldsGrid">
                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">Verified By</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.verifiedBy || selectedResponse.verified_by_name || 'Inspector J. Bautista · FDA Officer'}</p>
                                </div>

                                <div className="LeaVerifResultField">
                                  <label className="LeaVerifFieldLabel">Date Returned / Responded</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.returnedDate || selectedResponse.responded_at || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField LeaVerifFullWidthField">
                                  <label className="LeaVerifFieldLabel">Reason Product is Not Registered</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.unregisteredReason || selectedResponse.unregistered_reason || selectedResponse.description || '—'}</p>
                                </div>

                                <div className="LeaVerifResultField LeaVerifFullWidthField">
                                  <label className="LeaVerifFieldLabel">Advisory &amp; Enforcement Recommendations for LEA</label>
                                  <p className="LeaVerifFieldValue">{selectedResponse.advisoryRemarks || selectedResponse.remarks || selectedResponse.response_notes || '—'}</p>
                                </div>
                              </div>
                            </div>

                            <div className='ResponseUpdateBox'>
                              <h6>Field operation status update</h6>
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
                                'Initiate Takedown',
                                selectedResponse.caseNumber || selectedResponse.case_reference || '',
                                selectedResponse.id || selectedResponse.request_id || null
                              )}>
                                Initiate Takedown
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
                  <div className="LEAResponseQueue">
                    {/* MERGED-ADD — search bar + category filter dropdown */}
                    <div className="LEAResponseHeader">
                      <p>Cases with active takedown operations</p>
                      {/* REMOVE THIS */}
                      {/* BACKEND: count of cases where complaint_status = 'takedown_initiated' */}
                      {/* MERGED-CHANGED — count now reflects filtered results */}
                      <span>{filteredInitiatedCases.length}</span>
                    </div>
                    <div className="LeaVerifQueueFilterHeader">
                      <div className="LeaSearchWrapper">
                        <Search size={16} className="LeaSearchIcon" />
                        <input
                          type="text"
                          placeholder="Search Case ID, Product, or Manufacturer..."
                          className="LeaCategoriesSearchInput"
                          value={initiatedSearch}
                          onChange={(e) => setInitiatedSearch(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#EDEDED', padding: '5px 10px', borderRadius: '6px' }}>
                        <Filter size={14} className="LeaVerifFilterIcon" />
                        <select
                          style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '12px', fontWeight: '600', color: '#030303', outline: 'none', cursor: 'pointer' }}
                          value={initiatedCategory}
                          onChange={(e) => setInitiatedCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          <option value="Cosmetics">Cosmetics</option>
                          <option value="Food">Food</option>
                          <option value="Medical Devices">Medical Devices</option>
                          <option value="Drugs">Drugs</option>
                        </select>
                      </div>
                    </div>
                    

                    {/* MERGED-ADD — empty state for when filters exclude everything */}
                    {filteredInitiatedCases.length === 0 && (
                      <div className="LeaVerifEmptyList">
                        <Search size={32} />
                        <p className="LeaVerifEmptyText">No cases match your current filters.</p>
                      </div>
                    )}

                    {paginatedInitiatedCases.map((item) => (
                      <div
                        key={item.id}
                        className={`QueueCard ${selectedInitiatedCase.id === item.id ? 'ActiveQueueCard' : ''}`}
                        onClick={() => setSelectedInitiatedCase(item)}
                      >
                        {/* MERGED-CHANGED — restructured to match the reference UI: CASE ID + status badge on top row, category + date in footer */}
                        <div className="QueueCardTopRow">
                          <small style={{ margin: 0 }}>CASE ID: {item.caseNumber}</small>
                          <span className="OperationInProgressBadge">{item.status}</span>
                        </div>
                        <h4>{item.product}</h4>
                        <p>{item.manufacturer}</p>
                        <div className="QueueCardFooterRow">
                          <span className="QueueCategoryTag">{item.category}</span>
                          <span className="QueueDateTag">
                            <Calendar size={12} />
                            {item.returnedDate}
                          </span>
                        </div>
                      </div>
                    ))}
                    <QueuePagination
                      currentPage={initiatedPage}
                      totalPages={initiatedTotalPages}
                      onPageChange={setInitiatedPage}
                    />
                  </div>

                  {/* RIGHT PANEL */}
                  <div className='VerificationDetails'>
                    <div className='VerificationCard'>
                      <div>
                        {/* REMOVE THIS */}
                        {/* BACKEND: caseNumber */}
                        <small>CASE ID: {selectedInitiatedCase.caseNumber}</small>
                        {/* REMOVE THIS */}
                        {/* BACKEND: product_name */}
                        <h2>{selectedInitiatedCase.product}</h2>
                        {/* REMOVE THIS */}
                        {/* BACKEND: manufacturer_name */}
                        <p>MANUFACTURER: {selectedInitiatedCase.manufacturer || '—'}</p>

                        {/* BACKEND: complainant, category, source, and region are NOT stored
                                                directly in verification_requests. They are fetched via complaint_id
                                                joining to the complaints and walkin_complainants tables through the
                                                verification_requests full view */}
                        <div className="CaseInfoGrid">
                          <div>
                            <label>COMPLAINANT</label>
                            {/* REMOVE THIS */}
                            {/* BACKEND: complainant name */}
                            <p>{selectedInitiatedCase.complainant}</p>
                          </div>

                          <div>
                            <label>CATEGORY</label>
                            {/*  REMOVE THIS */}
                            {/* BACKEND: category */}
                            <p>{selectedInitiatedCase.category}</p>
                          </div>

                          <div>
                            <label>LOGGED</label>
                            {/*  REMOVE THIS */}
                            {/* BACKEND: created_at */}
                            <p>{selectedInitiatedCase.loggedDate}</p>
                          </div>

                          <div>
                            <label>SOURCE</label>
                            {/*  REMOVE THIS */}
                            {/* BACKEND: source */}
                            <p>{selectedInitiatedCase.source}</p>
                          </div>
                        </div>
                      </div>

                      <div className='ConfirmationReturned'>
                        <div className='ResponseUpdateBox' style={{ marginTop: '0px' }}>
                          <h6>Field operation status update</h6>
                          {/* BACKEND: fieldOperationNotes maps to field_operation_notes column in verification_requests — PATCH to /api/verification-requests/:id */}
                          <textarea
                            placeholder="Enter notes on field operation progress..."
                            value={fieldOperationNotes}
                            onChange={(e) => setFieldOperationNotes(e.target.value)}
                          ></textarea>
                        </div>
                        <div className='ResponseBtn' style={{ marginTop: '20px' }}>
                          {/* BACKEND: Close Case -> PATCH /api/complaints/:id (complaint_status: completed) */}
                          <button onClick={() => handleActionButtonClick('Close Case', selectedInitiatedCase.caseNumber, selectedInitiatedCase.id)}>
                            Close Case
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

              {/* CLOSED CASES TAB CONTENT */}
              {activeTab === 'Closed Cases' &&
                <div className="DismissedTableContainer">

                  {/* MERGED-CHANGED — Filters Bar rebuilt: search leftmost, FROM/TO + category filters rightmost, matching old version's LeaFilterPanel pattern */}
                  <div className="LeaFilterPanel LeaVerifFilterPanel">
                    <div className="LeaVerifFilterControlsLeft">
                      <div className="LeaSearchWrapper">
                        <Search size={16} className="LeaSearchIcon" />
                        <input
                          type="text"
                          placeholder="Search Case ID, Product or Manufacturer..."
                          className="LeaSearchInput"
                          value={dismissedSearch}
                          onChange={(e) => setDismissedSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="LeaVerifFilterControlsRight">
                      <div className="LeaFilterGroup">
                        {/* BACKEND: pass filterDateFrom as from_date query param */}
                        <label>From</label>
                        <input
                          type="date"
                          className="LeaVerifDateInput"
                          value={filterDateFrom}
                          onChange={(e) => setFilterDateFrom(e.target.value)}
                          title="Closed From"
                        />
                      </div>
                      <div className="LeaFilterGroup">
                        {/* BACKEND: pass filterDateTo as to_date query param */}
                        <label>To</label>
                        <input
                          type="date"
                          className="LeaVerifDateInput"
                          value={filterDateTo}
                          onChange={(e) => setFilterDateTo(e.target.value)}
                          title="Closed To"
                        />
                      </div>
                      <div className="LeaFilterGroup">
                        {/* BACKEND: pass filterCategory as category query param */}
                        <label>Category</label>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                          <option value="">All Categories</option>
                          <option value="Cosmetics">Cosmetics</option>
                          <option value="Food">Food</option>
                          <option value="Drugs">Drugs</option>
                          <option value="Medical Devices">Medical Devices</option>
                        </select>
                      </div>
                      <div className="LeaFilterGroup">
                        {/* BACKEND: pass filterReasonClosed as reason_closed query param */}
                        <label>Reason Closed</label>
                        <select value={filterReasonClosed} onChange={(e) => setFilterReasonClosed(e.target.value)}>
                          <option value="">All Reasons</option>
                          <option value="Registered">Registered</option>
                          <option value="Rejected by FDA">Rejected by FDA</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      {/* Change 1 — icon-only Clear Filters button (X icon, no text label) */}
                      {(() => {
                        const hasDismissedFilters = Boolean(dismissedSearch || filterCategory || filterDateFrom || filterDateTo);
                        return (
                          <button
                            className="BtnClearFiltersIcon"
                            aria-label="Clear Filters"
                            title="Clear Filters"
                            disabled={!hasDismissedFilters}
                            style={{ display: hasDismissedFilters ? 'inline-flex' : 'none' }}
                            onClick={() => {
                              setDismissedSearch('');
                              setFilterCategory('');
                              setFilterDateFrom('');
                              setFilterDateTo('');
                            }}
                          >
                            <X size={16} />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                  {/* MERGED-CHANGED — Total Cases moved out of the filter-row flexbox onto its own line below,
                      matching the already-working Saved Drafts pattern. It was previously a third child inside
                      .LeaFilterPanel's flex row, so it got squeezed onto the same line as the Category dropdown
                      instead of wrapping cleanly underneath. */}
                  {/* BACKEND: GET /api/complaints?status=dismissed&from_date=${filterDateFrom}&to_date=${filterDateTo}&category=${filterCategory} */}
                  <div className="DraftsTotalCount" style={{ margin: '4px 2px 16px 20px' }}>
                    Total Cases: {filteredDismissed.length}
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
                        {(() => {
                          const CLOSED_PAGE_SIZE = 25;
                          const totalClosedPages = Math.ceil(filteredDismissed.length / CLOSED_PAGE_SIZE) || 1;
                          const safeClosedPage = Math.min(Math.max(1, closedPage), totalClosedPages);
                          const closedStartIdx = (safeClosedPage - 1) * CLOSED_PAGE_SIZE;
                          const closedEndIdx = Math.min(closedStartIdx + CLOSED_PAGE_SIZE, filteredDismissed.length);
                          const paginatedClosedCases = filteredDismissed.slice(closedStartIdx, closedEndIdx);

                          if (paginatedClosedCases.length === 0) {
                            return (
                              <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#7a8796' }}>
                                  No closed cases match current filters.
                                </td>
                              </tr>
                            );
                          }

                          return paginatedClosedCases.map((c) => (
                            <tr key={c.id}>
                              <td style={{ fontWeight: '700', color: '#13213C' }}>{c.caseId}</td>
                              <td style={{ fontWeight: '600' }}>{c.product}</td>
                              <td>{c.manufacturer}</td>
                              <td>{c.category}</td>
                              <td>{c.dateFiled}</td>
                              <td>{c.dateClosed}</td>
                              <td>{c.closedBy}</td>
                            <td>
                              <span className={
                                c.reasonClosed === 'Registered' ? 'ReasonRegistered' :
                                c.reasonClosed === 'Completed' ? 'ReasonCompleted' :
                                'ReasonRejected'
                              }>
                                {c.reasonClosed}
                              </span>
                            </td>
                              <td>
                                <button
                                  className="BtnView"
                                  onClick={() => setViewCaseModalData(c)}
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>

                    {(() => {
                      const CLOSED_PAGE_SIZE = 25;
                      const totalClosedPages = Math.ceil(filteredDismissed.length / CLOSED_PAGE_SIZE) || 1;
                      const safeClosedPage = Math.min(Math.max(1, closedPage), totalClosedPages);
                      const closedStartIdx = (safeClosedPage - 1) * CLOSED_PAGE_SIZE;
                      const closedEndIdx = Math.min(closedStartIdx + CLOSED_PAGE_SIZE, filteredDismissed.length);

                      return (
                        <div className="Pagination">
                          <p>Showing {filteredDismissed.length === 0 ? 0 : closedStartIdx + 1}–{closedEndIdx} of {filteredDismissed.length}</p>
                          <div className="PaginationBtn">
                            <button
                              className="BtnPage"
                              disabled={safeClosedPage === 1}
                              onClick={() => setClosedPage(safeClosedPage - 1)}
                            >
                              Previous
                            </button>
                            {Array.from({ length: totalClosedPages }, (_, i) => i + 1).map((p) => (
                              <button
                                key={p}
                                className={`BtnPage ${safeClosedPage === p ? 'active' : ''}`}
                                onClick={() => setClosedPage(p)}
                              >
                                {p}
                              </button>
                            ))}
                            <button
                              className="BtnPage"
                              disabled={safeClosedPage === totalClosedPages}
                              onClick={() => setClosedPage(safeClosedPage + 1)}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      );
                    })()}
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

            {/* BACKEND: GET /api/complaints/:id for full case details */}
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
              backgroundColor:
                viewCaseModalData.reasonClosed === 'Registered' ? 'rgba(16, 185, 129, 0.1)' :
                viewCaseModalData.reasonClosed === 'Completed' ? 'rgba(37, 99, 235, 0.1)' :
                'rgba(249, 115, 22, 0.1)',
              borderColor:
                viewCaseModalData.reasonClosed === 'Registered' ? '#10b981' :
                viewCaseModalData.reasonClosed === 'Completed' ? '#2563eb' :
                '#f97316',
              margin: '0 0 20px 0'
            }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                color:
                  viewCaseModalData.reasonClosed === 'Registered' ? '#059669' :
                  viewCaseModalData.reasonClosed === 'Completed' ? '#1d4ed8' :
                  '#ea580c',
                fontWeight: '600',
                marginBottom: '6px'
              }}>Reason Closed</label>
              <p className="ReasonDetail" style={{ color: '#030303', fontWeight: '500', margin: 0 }}>
                {viewCaseModalData.reasonClosed === 'Registered'
                  ? 'Product confirmed registered with FDA registry'
                  : viewCaseModalData.reasonClosed === 'Completed'
                  ? 'Takedown operation completed — case closed by field officer'
                  : 'Rejected by FDA verifier — case acknowledged and dismissed'}
              </p>
            </div>

            <div className="ModalActions">
              <button className="BtnCancelModal" onClick={() => setViewCaseModalData(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADDED — attachment preview modal, mirrors the FDA-side implementation.
    Fetches inline preview from GET /shared-files/{file_id}/preview (images + PDF only);
    other mime types fall back to a download-only placeholder. */}
      {docPreviewModal && (
        <div className="ModalOverlay">
          <div className="LeaVerifDocModalContainer">
            <div className="LeaVerifDocModalHeader">
              <div className="LeaVerifDocModalTitleGroup">
                <Paperclip size={16} className="LeaVerifBlueIcon" />
                <div>
                  <h3>{docPreviewModal.file_name}</h3>
                  <p className="LeaVerifDocModalMeta">
                    {docPreviewModal.mime_type} &bull; {docPreviewModal.file_size_display}
                  </p>
                </div>
              </div>
              <button className="LeaVerifIconButton" onClick={() => setDocPreviewModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="LeaVerifDocModalBody">
              {(docPreviewModal.mime_type?.startsWith('image/') || docPreviewModal.mime_type === 'application/pdf') ? (
                docPreviewLoading ? (
                  <div className="LeaVerifDocPlaceholderPreview">
                    <p className="LeaVerifPreviewText">Loading preview&hellip;</p>
                  </div>
                ) : docPreviewError ? (
                  <div className="LeaVerifDocPlaceholderPreview">
                    <FileText size={48} className="LeaVerifDocPreviewIcon" />
                    <p className="LeaVerifPreviewTitle">Preview unavailable</p>
                    <p className="LeaVerifPreviewText">Try downloading the file instead.</p>
                  </div>
                ) : docPreviewModal.mime_type.startsWith('image/') ? (
                  <img
                    src={docPreviewUrl}
                    alt={docPreviewModal.file_name}
                    className="LeaVerifDocImagePreview"
                  />
                ) : (
                  <iframe
                    src={docPreviewUrl}
                    title={docPreviewModal.file_name}
                    className="LeaVerifDocPdfPreview"
                  />
                )
              ) : (
                <div className="LeaVerifDocPlaceholderPreview">
                  <FileText size={48} className="LeaVerifDocPreviewIcon" />
                  <p className="LeaVerifPreviewTitle">Preview not supported</p>
                  <p className="LeaVerifPreviewText">
                    <strong>{docPreviewModal.file_name}</strong> can't be previewed inline &mdash; use download instead.
                  </p>
                </div>
              )}
            </div>

            <div className="LeaVerifModalFooter">
              <button className="LeaVerifBtnOutline" onClick={() => setDocPreviewModal(null)}>
                Close Preview
              </button>
              <button
                className="LeaVerifBtnPrimary"
                onClick={() => {
                  const token = localStorage.getItem('access_token');
                  fetch(`${API_BASE}/shared-files/${docPreviewModal.file_id}/download`, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                      return res.blob();
                    })
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = docPreviewModal.file_name;
                      a.click();
                      URL.revokeObjectURL(url);
                    })
                    .catch(() => setErrorMessage('Could not download the file. Please try again.'));
                }}
              >
                <Download size={14} />
                <span>Download Attachment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FDA-STYLE FLOATING SUCCESS TOAST ALERT */}
      {successMessage && (
        <div className="LeaToastAlert LeaToast_success" role="alert">
          <div className="LeaToastIconWrap">
            <CheckCircle size={18} />
          </div>
          <div className="LeaToastBody">
            <p className="LeaToastMessage">{successMessage}</p>
          </div>
          <button
            className="LeaToastCloseBtn"
            onClick={() => setSuccessMessage('')}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* FDA-STYLE FLOATING ERROR TOAST ALERT */}
      {errorMessage && (
        <div className="LeaToastAlert LeaToast_danger" role="alert">
          <div className="LeaToastIconWrap">
            <XCircle size={18} />
          </div>
          <div className="LeaToastBody">
            <p className="LeaToastMessage">{errorMessage}</p>
          </div>
          <button
            className="LeaToastCloseBtn"
            onClick={() => setErrorMessage('')}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
export default LeaVerificationRequest
