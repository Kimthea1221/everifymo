// desktopfrontend/src/pages/fdafolder/fda-status.jsx   
import { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css';
import {
  Search,
  Filter,
  Mail,
  Send,
  BellRing,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */

const initialComplaints = [
  {
    complaintId: "c1",
    caseReference: "ICM-2025-00184",
    productTitle: "GlowMax Whitening Cream",
    manufacturer: "BrightSkin Co.",
    region: "NCR",
    status: "under_review",
    reporterUsername: "ext_user_4421",
    reporterEmail: "jdelacruz@gmail.com",
  },
  {
    complaintId: "c2",
    caseReference: "ICM-2025-00185",
    productTitle: "HerbalSlim Capsules",
    manufacturer: "NatureFit Labs",
    region: "Region IV-A",
    status: "open",
    reporterUsername: "ext_user_7790",
    reporterEmail: "m.santos@gmail.com",
  },
  {
    complaintId: "c3",
    caseReference: "ICM-2025-00186",
    productTitle: "PainAway Patch",
    manufacturer: "Unknown",
    region: "Region VII",
    status: "takedown_requested",
    reporterUsername: "ext_user_2210",
    reporterEmail: "a.reyes@yahoo.com",
  },
  {
    complaintId: "c4",
    caseReference: "ICM-2025-00189",
    productTitle: "QuickHeal Antibiotic Ointment",
    manufacturer: "MediQuick",
    region: "Region VI",
    status: "completed",
    reporterUsername: "ext_user_5541",
    reporterEmail: "kristine.p@gmail.com",
  },
  {
    complaintId: "c5",
    caseReference: "ICM-2025-00190",
    productTitle: "Miracle Hair Tonic",
    manufacturer: "GlowLabs LLC",
    region: "Region IV-B",
    status: "dismissed",
    reporterUsername: "ext_user_3387",
    reporterEmail: "d.cruz@gmail.com",
  },
];

const initialStatusHistory = [
  {
    historyId: "h1",
    caseReference: "ICM-2025-00190",
    productTitle: "Miracle Hair Tonic",
    previousStatus: "under_review",
    newStatus: "dismissed",
    changeNote: "Product found to be registered under a different FDA record.",
    changedBy: "fda.juan",
    changedAt: "2026-05-18 13:20",
  },
  {
    historyId: "h2",
    caseReference: "ICM-2025-00189",
    productTitle: "QuickHeal Antibiotic Ointment",
    previousStatus: "takedown_requested",
    newStatus: "completed",
    changeNote: "This complaint has been completed. The seller listing was taken down following FDA enforcement action.",
    changedBy: "fda.maria",
    changedAt: "2026-05-18 09:12",
  },
  {
    historyId: "h3",
    caseReference: "ICM-2025-00186",
    productTitle: "PainAway Patch",
    previousStatus: "under_review",
    newStatus: "takedown_requested",
    changeNote: "Forwarded to platform compliance for removal.",
    changedBy: "fda.juan",
    changedAt: "2026-05-17 16:40",
  },
  {
    historyId: "h4",
    caseReference: "ICM-2025-00184",
    productTitle: "GlowMax Whitening Cream",
    previousStatus: "open",
    newStatus: "under_review",
    changeNote: "Evidence acknowledged. Under FDA review.",
    changedBy: "fda.maria",
    changedAt: "2026-05-17 11:05",
  },
];

// Options for the "New status" dropdown on the right panel — what FDA
// personnel can manually set a complaint TO.
const STATUS_OPTIONS = [
  { value: "under_review", label: "Under Review" },
  { value: "takedown_requested", label: "Takedown Requested" },
  { value: "completed", label: "Completed" },
  { value: "dismissed", label: "Dismissed" },
];

// Options for the left-panel filter — what a complaint can currently BE,
// including "open" and "All" since those are things you'd want to filter by.
const CASE_FILTER_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "takedown_requested", label: "Takedown Requested" },
  { value: "completed", label: "Completed" },
  { value: "dismissed", label: "Dismissed" },
];

const STATUS_LABELS = {
  open: "Open",
  under_review: "Under Review",
  takedown_requested: "Takedown Requested",
  completed: "Completed",
  dismissed: "Dismissed",
};

const COMPLETED_MESSAGE =
  "This complaint has been completed. The seller listing was taken down following FDA enforcement action.";

const DISMISS_PRESETS = [
  "Product found to be registered under a different FDA record.",
  "Registration currently in process.",
  "Insufficient evidence to proceed.",
];

const CASES_PER_PAGE = 5;
const HISTORY_PER_PAGE = 5;

function getStatusBadgeStyle(status) {
  switch (status) {
    case "completed":
      return { backgroundColor: "rgba(27, 67, 50, 0.1)", color: "#1B4332" };
    case "takedown_requested":
      return { backgroundColor: "rgba(185, 28, 28, 0.1)", color: "#B91C1C" };
    case "under_review":
      return { backgroundColor: "rgba(19, 33, 60, 0.1)", color: "#13213c" };
    case "dismissed":
      return { backgroundColor: "rgba(31, 41, 55, 0.08)", color: "rgba(31, 41, 55, 0.6)" };
    default: // "open"
      return { backgroundColor: "rgba(217, 119, 6, 0.1)", color: "#D97706" };
  }
}

function FdaStatus() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [statusHistory, setStatusHistory] = useState(initialStatusHistory);

  // Left panel: search + filter + pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [isCaseFilterOpen, setIsCaseFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [casePage, setCasePage] = useState(1);

  const [selectedComplaintId, setSelectedComplaintId] = useState(
    initialComplaints[0].complaintId
  );

  // Draft form state (right panel)
  const [newStatus, setNewStatus] = useState("");
  const [dismissPreset, setDismissPreset] = useState("");
  const [dismissNote, setDismissNote] = useState("");

  const [historyPage, setHistoryPage] = useState(1);

  const selectedComplaint =
    complaints.find((c) => c.complaintId === selectedComplaintId) || null;

  useEffect(() => {
    if (!selectedComplaint) return;
    setNewStatus(
      selectedComplaint.status === "open" ? "under_review" : selectedComplaint.status
    );
    setDismissPreset("");
    setDismissNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComplaintId]);

  // Search + status filter combined
  const filteredComplaints = complaints.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.caseReference.toLowerCase().includes(query) ||
      c.productTitle.toLowerCase().includes(query) ||
      c.manufacturer.toLowerCase().includes(query);
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Case list pagination
  const totalCasePages = Math.ceil(filteredComplaints.length / CASES_PER_PAGE) || 1;
  const safeCasePage = Math.min(Math.max(1, casePage), totalCasePages);
  const caseStart = (safeCasePage - 1) * CASES_PER_PAGE;
  const pagedComplaints = filteredComplaints.slice(caseStart, caseStart + CASES_PER_PAGE);

  const getOutgoingMessage = () => {
    if (newStatus === "completed") return COMPLETED_MESSAGE;
    if (newStatus === "dismissed") return dismissNote || dismissPreset;
    return null;
  };

  const handlePushUpdate = () => {
    if (!selectedComplaint) return;

    const outgoingMessage = getOutgoingMessage();
    if (newStatus === "dismissed" && !outgoingMessage) {
      alert("Please choose or write a reason for dismissing this complaint.");
      return;
    }

    const previousStatus = selectedComplaint.status;

    setComplaints((prev) =>
      prev.map((c) =>
        c.complaintId === selectedComplaint.complaintId
          ? { ...c, status: newStatus }
          : c
      )
    );

    const entry = {
      historyId: `h${Date.now()}`,
      caseReference: selectedComplaint.caseReference,
      productTitle: selectedComplaint.productTitle,
      previousStatus,
      newStatus,
      changeNote: outgoingMessage || "",
      changedBy: "fda.admin", // TODO: replace once auth is wired up
      changedAt: new Date().toLocaleString(),
    };
    setStatusHistory((prev) => [entry, ...prev]);
    setHistoryPage(1);

    /*
      BACKEND INTEGRATION (later):
      await fetch(`/api/complaints/${selectedComplaint.complaintId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, change_note: outgoingMessage }),
      });
    */
  };

  const totalHistoryPages = Math.ceil(statusHistory.length / HISTORY_PER_PAGE) || 1;
  const safeHistoryPage = Math.min(Math.max(1, historyPage), totalHistoryPages);
  const historyStart = (safeHistoryPage - 1) * HISTORY_PER_PAGE;
  const pagedHistory = statusHistory.slice(historyStart, historyStart + HISTORY_PER_PAGE);

  return (
    <div className="FdaDashboardMain">
      <Sidebar sidebarType="FDA" />
      <div className="FdaContentContainer">
        <TopBar topbarType="FDA" />
        <div className="FdaMainFeed">

          <div className="FdaHeader">
            <div className="FdaHeaderLeft">
              <p className="FdaEyebrow">FDA · Consumer Communications</p>
              <h1 className="FdaHeaderTitle">Status updates & notifications</h1>
              <p className="FdaSubtitle">
                Update a complaint's progress, push it to the consumer's browser extension, and notify the original reporter.
              </p>
            </div>
          </div>

          <div className="FdaStatusGrid">

            {/* LEFT: complaint list */}
            <div className="FdaCaseListPanel">
              <div className="FdaCaseListSearch">
                <div className="FdaCaseListControls">
                  <div className="FdaSearchWrapper">
                    <Search size={16} className="FdaSearchIcon" />
                    <input
                      type="text"
                      placeholder="Search case ID or product..."
                      className="FdaSearchInput"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCasePage(1);
                      }}
                    />
                  </div>
                  <button
                    className={`BtnFilters ${isCaseFilterOpen ? "active" : ""}`}
                    onClick={() => setIsCaseFilterOpen(!isCaseFilterOpen)}
                    title="Filter by status"
                  >
                    <Filter size={16} />
                  </button>
                </div>

                {isCaseFilterOpen && (
                  <div className="FdaFilterGroup FdaCaseListFilterPanel">
                    <label>Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCasePage(1);
                      }}
                    >
                      {CASE_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="FdaCaseList">
                {pagedComplaints.length === 0 ? (
                  <div className="FdaCaseListEmpty">No complaints match your search or filter.</div>
                ) : (
                  pagedComplaints.map((c) => (
                    <button
                      key={c.complaintId}
                      className={`FdaCaseCard ${c.complaintId === selectedComplaintId ? "active" : ""}`}
                      onClick={() => setSelectedComplaintId(c.complaintId)}
                    >
                      <div className="FdaCaseCardTop">
                        <span className="FdaCaseCardId">{c.caseReference}</span>
                        <span className="FdaBadge" style={getStatusBadgeStyle(c.status)}>
                          {STATUS_LABELS[c.status]}
                        </span>
                      </div>
                      <div className="FdaCaseCardTitle">{c.productTitle}</div>
                      <div className="FdaCaseCardSub">{c.manufacturer} · {c.region}</div>
                    </button>
                  ))
                )}
              </div>

              <div className="FdaCaseListFooter">
                <span className="FdaFooterInfo">
                  {filteredComplaints.length === 0 ? 0 : caseStart + 1}-
                  {Math.min(caseStart + CASES_PER_PAGE, filteredComplaints.length)} of {filteredComplaints.length}
                </span>
                <div className="FdaPagination">
                  <button
                    className="BtnPageNav"
                    disabled={safeCasePage === 1}
                    onClick={() => setCasePage(safeCasePage - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    className="BtnPageNav"
                    disabled={safeCasePage === totalCasePages}
                    onClick={() => setCasePage(safeCasePage + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: selected complaint detail + form */}
            {selectedComplaint && (
              <div className="FdaDetailPanel">
                <div className="FdaDetailPanelHeader">
                  <div>
                    <small>{selectedComplaint.caseReference}</small>
                    <h2>{selectedComplaint.productTitle}</h2>
                    <p>{selectedComplaint.manufacturer} · {selectedComplaint.region}</p>
                  </div>
                  <div>
                    <small style={{ display: "block", marginBottom: 6, textAlign: "right" }}>Current</small>
                    <span className="FdaBadge" style={getStatusBadgeStyle(selectedComplaint.status)}>
                      {STATUS_LABELS[selectedComplaint.status]}
                    </span>
                  </div>
                </div>

                <div className="FdaFormRow">
                  <div className="FdaFormGroup">
                    <label>New status</label>
                    <select
                      className="FdaStatusSelect"
                      style={{ width: "100%" }}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="FdaFormGroup">
                    <label>Reporter on record</label>
                    <div className="FdaReporterField">
                      <Mail size={14} />
                      {selectedComplaint.reporterUsername} · {selectedComplaint.reporterEmail}
                    </div>
                  </div>
                </div>

                {newStatus === "completed" && (
                  <div className="FdaCompletedNotice">{COMPLETED_MESSAGE}</div>
                )}

                {newStatus === "dismissed" && (
                  <div className="FdaMessageBox">
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(31,41,55,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      Reason for dismissal
                    </label>
                    <select
                      value={dismissPreset}
                      onChange={(e) => {
                        setDismissPreset(e.target.value);
                        setDismissNote(e.target.value);
                      }}
                    >
                      <option value="">Choose a common reason (optional)...</option>
                      {DISMISS_PRESETS.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Write or edit the reason the consumer will see..."
                      value={dismissNote}
                      onChange={(e) => setDismissNote(e.target.value)}
                    />
                  </div>
                )}

                <div className="FdaNoticeBanner">
                  <BellRing size={18} />
                  <div className="FdaNoticeBannerText">
                    Pushing this update automatically syncs it to the consumer's browser extension
                    and sends them an in-app + email notification. This isn't optional per update.
                  </div>
                </div>

                <div className="FdaNotificationPreview">
                  <label>Notification preview</label>
                  <div className="FdaNotifPreviewCard">
                    <div className="FdaNotifPreviewIcon"><ShieldCheck size={16} /></div>
                    <div>
                      <div className="FdaNotifPreviewTop">
                        <strong>FDA Complaint Update</strong>
                        <span className="FdaBadge" style={getStatusBadgeStyle(newStatus)}>
                          {STATUS_LABELS[newStatus]}
                        </span>
                      </div>
                      <div className="FdaNotifPreviewMeta">
                        {selectedComplaint.productTitle} · {selectedComplaint.caseReference}
                      </div>
                      <div className="FdaNotifPreviewMsg">
                        {getOutgoingMessage() ||
                          `Your report has been received and is now marked as "${STATUS_LABELS[newStatus]}".`}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="FdaPushRow">
                  <button className="BtnPushUpdate" onClick={handlePushUpdate}>
                    <Send size={15} />
                    Push update
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RECENT STATUS PUSHES */}
          <div className="FdaHistorySection">
            <div className="FdaHistoryTitle">Recent status pushes</div>

            {pagedHistory.map((entry) => (
              <div className="FdaHistoryItem" key={entry.historyId}>
                <div className="FdaHistoryIcon"><ShieldCheck size={14} /></div>
                <div>
                  <div className="FdaHistoryTop">
                    <strong>{entry.productTitle}</strong>
                    <span className="FdaBadge" style={getStatusBadgeStyle(entry.newStatus)}>
                      {STATUS_LABELS[entry.newStatus]}
                    </span>
                  </div>
                  {entry.changeNote && <div className="FdaHistoryNote">{entry.changeNote}</div>}
                  <div className="FdaHistoryMeta">
                    <span>{entry.caseReference}</span>
                    <span>by {entry.changedBy}</span>
                    <span>{entry.changedAt}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="FdaTableFooter">
              <span className="FdaFooterInfo">
                Showing {statusHistory.length === 0 ? 0 : historyStart + 1}-
                {Math.min(historyStart + HISTORY_PER_PAGE, statusHistory.length)} of {statusHistory.length}
              </span>
              <div className="FdaPagination">
                <button
                  className="BtnPageNav"
                  disabled={safeHistoryPage === 1}
                  onClick={() => setHistoryPage(safeHistoryPage - 1)}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`FdaPageNumber ${safeHistoryPage === page ? "active" : ""}`}
                    onClick={() => setHistoryPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="BtnPageNav"
                  disabled={safeHistoryPage === totalHistoryPages}
                  onClick={() => setHistoryPage(safeHistoryPage + 1)}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FdaStatus;