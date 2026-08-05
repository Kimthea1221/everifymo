import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import "./fda-css.css";
import {
    Eye,
    MoreVertical,
    PenLine,
    Trash2,
    Info,
    Inbox,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    X,
} from "lucide-react";

const ITEMS_PER_PAGE = 5;

function FDASavedDraft() {

    const navigate = useNavigate();

    // Mock data — drafts saved from the Verification Queue only
    const [drafts, setDrafts] = useState([
        {
            caseId: "VR-2026-00341",
            product: "HerbalSlim Capsules",
            manufacturer: "Wellness Naturals Inc.",
            category: "Drugs",
            source: "Walk-in",
            lastModified: "2026-07-29 10:14",
        },
        {
            caseId: "VR-2026-00338",
            product: "BioGlow Whitening Serum",
            manufacturer: "Radiance Cosmetics Co.",
            category: "Cosmetics",
            source: "Browser Extension",
            lastModified: "2026-07-28 16:47",
        },
        {
            caseId: "VR-2026-00335",
            product: "PainAway Relief Cream",
            manufacturer: "MedCare Pharma",
            category: "Drugs",
            source: "Walk-in",
            lastModified: "2026-07-27 09:02",
        },
        {
            caseId: "VR-2026-00330",
            product: "PureGlow Vitamin C Drops",
            manufacturer: "NutriHealth Labs",
            category: "Foods",
            source: "Browser Extension",
            lastModified: "2026-07-25 13:38",
        },
        {
            caseId: "VR-2026-00327",
            product: "DermaShield Sunblock SPF50",
            manufacturer: "SunCare Cosmetics",
            category: "Cosmetics",
            source: "Walk-in",
            lastModified: "2026-07-24 11:20",
        },
        {
            caseId: "VR-2026-00321",
            product: "FlexJoint Tablets",
            manufacturer: "Wellness Naturals Inc.",
            category: "Medical Devices",
            source: "Browser Extension",
            lastModified: "2026-07-22 15:05",
        },
    ]);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [sourceFilter, setSourceFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    // Row dropdown
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState(null);

    // View Draft Summary modal
    const [viewModalData, setViewModalData] = useState(null);

    // Toast
    const [toastMessage, setToastMessage] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2200);
    };

    const toggleDropdown = (caseId) => {
        setOpenDropdownId((prev) => (prev === caseId ? null : caseId));
    };

    // Sends the clicked draft's caseId (and full record) to the Verification Queue
    // page via navigation state, so that page can auto-select/open it on load.
    const handleViewDraft = (draft) => {
        setOpenDropdownId(null);
        showToast(`Opening draft ${draft.caseId}...`);
        setTimeout(() => {
            navigate("/fdaworkspace/fda-verification-queue", {
                state: { openDraftId: draft.caseId, draftRecord: draft }
            });
        }, 1000);
    };

    const handleContinueEditing = (draft) => {
        setOpenDropdownId(null);
        showToast(`Resuming draft ${draft.caseId}...`);
        setTimeout(() => {
            navigate("/fdaworkspace/fda-verification-queue", {
                state: { openDraftId: draft.caseId, draftRecord: draft, mode: "edit" }
            });
        }, 1000);
    };

    const handleDeleteClick = (draft) => {
        setOpenDropdownId(null);
        setDraftToDelete(draft);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (draftToDelete) {
            setDrafts((prev) => prev.filter((d) => d.caseId !== draftToDelete.caseId));
            setShowDeleteModal(false);
            setDraftToDelete(null);
            showToast("Draft deleted successfully");
        }
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("All");
        setSourceFilter("All");
        setDateFilter("");
        setCurrentPage(1);
    };

    // Filtering
    const filteredDrafts = drafts.filter((draft) => {
        if (categoryFilter !== "All" && draft.category !== categoryFilter) return false;
        if (sourceFilter !== "All" && draft.source !== sourceFilter) return false;
        if (dateFilter && !draft.lastModified.startsWith(dateFilter)) return false;

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const matchesCaseId = draft.caseId.toLowerCase().includes(query);
            const matchesProduct = draft.product.toLowerCase().includes(query);
            const matchesManufacturer = draft.manufacturer.toLowerCase().includes(query);
            if (!matchesCaseId && !matchesManufacturer && !matchesProduct) return false;
        }

        return true;
    });

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filteredDrafts.length / ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedDrafts = filteredDrafts.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE
    );

    return (
        <div className="FdaDashboardMain">
            <Sidebar sidebarType="FDA" />
            <div className="FdaContentContainer">
                <TopBar topbarType="FDA" />
                <div className="FdaMainFeed">

                    {/* Header */}
                    <div className="FdaVerifHeader">
                        <div className="FdaVerifHeaderLeft">
                            <p className="FdaVerifEyebrow">FDA · SAVED DRAFTS</p>
                            <h1 className="FdaVerifTitle">Saved Drafts</h1>
                            <p className="FdaVerifSubtitle">
                                Verification requests saved from the Verification Queue. Continue
                                editing or submit them once ready.
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="FdaProductFilterPanel">
                        <div className="FdaSearchFixed">
                            <div className="FdaSearchWrapper">
                                <input
                                    type="text"
                                    className="FdaSearchInput"
                                    placeholder="Search Case ID, Product, or Manufacturer..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="FdaFilterGroupsRight">
                            <div className="FdaFilterGroup">
                                <label>Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All">All</option>
                                    <option value="Foods">Foods</option>
                                    <option value="Cosmetics">Cosmetics</option>
                                    <option value="Drugs">Drugs</option>
                                    <option value="Medical Devices">Medical Devices</option>
                                </select>
                            </div>

                            <div className="FdaFilterGroup">
                                <label>Source</label>
                                <select
                                    value={sourceFilter}
                                    onChange={(e) => {
                                        setSourceFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="All">All Sources</option>
                                    <option value="Walk-in">Walk-in</option>
                                    <option value="Browser Extension">Browser Extension</option>
                                </select>
                            </div>

                            <div className="FdaFilterGroup">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            <button className="BtnFilters" onClick={handleClearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Drafts Table */}
                    {paginatedDrafts.length > 0 ? (
                        <div className="FdaTableCard FdaSavedDraftTableCard">
                            <div className="FdaTableWrapper FdaSavedDraftTableWrapper">
                                <table className="FdaTable">
                                    <thead>
                                        <tr>
                                            <th>CASE ID</th>
                                            <th>PRODUCT NAME</th>
                                            <th>MANUFACTURER</th>
                                            <th>CATEGORY</th>
                                            <th>SOURCE</th>
                                            <th>LAST MODIFIED</th>
                                            <th>DRAFT STATUS</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedDrafts.map((draft) => (
                                            <tr key={draft.caseId}>
                                                <td className="CaseIdCell">{draft.caseId}</td>
                                                <td className="ProductNameCell">{draft.product}</td>
                                                <td className="ManufacturerCell">{draft.manufacturer}</td>
                                                <td>{draft.category}</td>
                                                <td>
                                                    <span className="FdaSourceBadge">{draft.source}</span>
                                                </td>
                                                <td className="FdaSavedDraftLastModified">
                                                    {draft.lastModified}
                                                </td>
                                                <td>
                                                    <span className="FdaSavedDraftStatusBadge">Draft</span>
                                                </td>
                                                <td>
                                                    <div className="FdaDropdownWrapper">
                                                        <button
                                                            className="FdaViewBtn"
                                                            title="View Draft"
                                                            onClick={() => setViewModalData(draft)}
                                                        >
                                                            <Eye size={15} />
                                                        </button>
                                                        <button
                                                            className="FdaDropdownTrigger"
                                                            onClick={() => toggleDropdown(draft.caseId)}
                                                        >
                                                            <MoreVertical size={15} />
                                                        </button>

                                                        {openDropdownId === draft.caseId && (
                                                            <div className="FdaDropdownMenu">
                                                                <button
                                                                    className="FdaDropdownItem"
                                                                    onClick={() => handleContinueEditing(draft)}
                                                                >
                                                                    <PenLine size={14} /> Continue Editing
                                                                </button>
                                                                <button
                                                                    className="FdaDropdownItem"
                                                                    onClick={() => handleDeleteClick(draft)}
                                                                >
                                                                    <Trash2 size={14} /> Delete Draft
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="FdaTableFooter">
                                <span className="FdaFooterInfo">
                                    Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–
                                    {Math.min(safePage * ITEMS_PER_PAGE, filteredDrafts.length)} of{" "}
                                    {filteredDrafts.length} drafts
                                </span>
                                <div className="FdaPagination">
                                    <button
                                        className="BtnPageNav"
                                        disabled={safePage === 1}
                                        onClick={() => setCurrentPage(safePage - 1)}
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            className={`FdaPageNumber ${page === safePage ? "active" : ""}`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        className="BtnPageNav"
                                        disabled={safePage === totalPages}
                                        onClick={() => setCurrentPage(safePage + 1)}
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="FdaTableCard">
                            <div className="FdaSavedDraftEmptyState">
                                <div className="FdaSavedDraftEmptyIconWrap">
                                    <Inbox size={28} />
                                </div>
                                <h3>No Saved Drafts</h3>
                                <p>
                                    You currently have no saved verification request drafts. Drafts
                                    saved from the Verification Queue will appear here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && draftToDelete && (
                <div className="FdaModalOverlay">
                    <div className="FdaModalContent" style={{ maxWidth: "440px" }}>
                        <div className="FdaSavedDraftModalHeaderRow">
                            <div className="FdaSavedDraftDeleteIconWrap">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="FdaSavedDraftModalTitle">Delete Draft?</h3>
                                <p className="FdaSavedDraftModalDesc">
                                    Are you sure you want to permanently delete this draft
                                    verification request ({draftToDelete.caseId})? This action
                                    cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="FdaModalFooter">
                            <button
                                className="BtnModalCancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="BtnModalDelete" onClick={handleConfirmDelete}>
                                Delete Draft
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Draft Summary Modal */}
            {viewModalData && (
                <div className="FdaVerifModalOverlay">
                    <div className="FdaRecordModalContainer" style={{ width: "560px" }}>
                        <div className="FdaRecordModalHeader">
                            <div className="FdaRecordModalTitleGroup">
                                <Eye size={20} className="FdaVerifGreenIcon" />
                                <div>
                                    <h3>Draft Summary</h3>
                                    <p className="FdaRecordModalSubtitle">
                                        {viewModalData.caseId} &bull; Last modified {viewModalData.lastModified}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="FdaVerifIconButton"
                                onClick={() => setViewModalData(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="FdaRecordModalBody">
                            <div className="FdaRecordInfoGrid">
                                <div className="FdaRecordInfoItem">
                                    <span className="FdaVerifInfoLabel">CASE ID</span>
                                    <span className="FdaVerifInfoValueHighlight">{viewModalData.caseId}</span>
                                </div>
                                <div className="FdaRecordInfoItem">
                                    <span className="FdaVerifInfoLabel">PRODUCT NAME</span>
                                    <span className="FdaVerifInfoValue">{viewModalData.product}</span>
                                </div>
                                <div className="FdaRecordInfoItem">
                                    <span className="FdaVerifInfoLabel">MANUFACTURER</span>
                                    <span className="FdaVerifInfoValue">{viewModalData.manufacturer}</span>
                                </div>
                                <div className="FdaRecordInfoItem">
                                    <span className="FdaVerifInfoLabel">CATEGORY</span>
                                    <span className="FdaVerifInfoValue">{viewModalData.category}</span>
                                </div>
                                <div className="FdaRecordInfoItem">
                                    <span className="FdaVerifInfoLabel">SOURCE</span>
                                    <span className="FdaVerifInfoValue">{viewModalData.source}</span>
                                </div>
                                <div className="FdaRecordInfoItem">
                                    <span className="FdaVerifInfoLabel">DRAFT STATUS</span>
                                    <span className="FdaSavedDraftStatusBadge">Draft</span>
                                </div>
                            </div>
                        </div>

                        <div className="FdaRecordModalFooter">
                            <button
                                className="FdaVerifBtnOutline"
                                onClick={() => setViewModalData(null)}
                            >
                                Close
                            </button>
                            <button
                                className="FdaBtnCloseModal"
                                onClick={() => {
                                    setViewModalData(null);
                                    handleContinueEditing(viewModalData);
                                }}
                            >
                                Continue Editing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="FdaSavedDraftToast">
                    <Info size={16} />
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default FDASavedDraft;