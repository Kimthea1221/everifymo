// desktopfrontend/src/pages/fdafolder/fda-view-reports.jsx
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css';
import { 
  Globe, 
  Footprints, 
  Search, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  X,
  FileText,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { allConsumerReports } from './reportData';
import mammoth from 'mammoth';

const ITEMS_PER_PAGE = 25;

// Display-label mapping for categories.
// Underlying data values stay unchanged (Supplement / Pharmaceutical) so
// filtering logic and reportData.js don't need to change — only what's shown.
const CATEGORY_LABELS = {
  Supplement: 'Foods',
  Food: 'Food',
  Pharmaceutical: 'Drugs',
};

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

// Maps the legacy status values still stored in reportData.js to the FINAL
// user-facing complaint-workflow statuses. This keeps the change scoped to
// fda-view-reports.jsx only, without touching reportData.js or any other
// module. Legacy label -> final label reasoning:
//   "Under Review"          -> "Under Review"          (unchanged)
//   "Pending Verification"  -> "Under Review"           (obsolete label folded in)
//   "Takedown Requested"    -> "Forwarded to LEA"        (FDA requested a takedown = case handed to LEA)
//   "Forwarded to LEA"      -> "Forwarded to LEA"        (unchanged)
//   "Verified"              -> "Case Closed"             (no violation found, obsolete label removed)
//   "Takedown Completed"    -> "Takedown Completed"       (unchanged)
//   "Dismissed"             -> "Case Closed"             (renamed from "Closed")
//   "New Report"            -> no legacy source; left untouched, not in scope
// "Operation in Progress" (takedown_initiated) has no mock data source yet,
// but is included below as a display case + filter option so the page is
// ready once real takedown_initiated data comes from the backend.
const STATUS_WORKFLOW_MAP = {
  // Backend / snake_case status values
  "under_review": "Under Review",
  "takedown_requested": "Forwarded to LEA",
  "takedown_initiated": "Operation in Progress",
  "completed": "Takedown Completed",
  "dismissed": "Case Closed",

  // Legacy / Title Case status values from mock data
  "Under Review": "Under Review",
  "Pending Verification": "Under Review",
  "Takedown Requested": "Forwarded to LEA",
  "Forwarded to LEA": "Forwarded to LEA",
  "Operation in Progress": "Operation in Progress",
  "Verified": "Case Closed",
  "Takedown Completed": "Takedown Completed",
  "Dismissed": "Case Closed",
  "Case Closed": "Case Closed",
  "Closed": "Case Closed",
};

function getWorkflowStatus(status) {
  return STATUS_WORKFLOW_MAP[status] || status;
}

function FDAViewReports() {
  // REPORTS DATABASE STATE
  const [reports] = useState(allConsumerReports);

  // SEARCH AND TABS STATE
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const tabs = ['All', 'Browser Extension', 'Walk-in'];
  const location = useLocation();

  useEffect(() => {
    const selectedTab = location.state?.selectedTab;
    if (selectedTab && tabs.includes(selectedTab)) {
      setActiveTab(selectedTab);
      setCurrentPage(1);
    }
  }, [location.state?.selectedTab]);

  // EXPANDABLE FILTERS STATE
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // SELECTED ROW IDs FOR BULK ACTIONS
  const [selectedIds, setSelectedIds] = useState([]);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);

  // SELECTED DETAIL CARD REPORT ID
  const [selectedReportId, setSelectedReportId] = useState(null);

  // DOCUMENT PREVIEW MODAL STATE
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docxHtml, setDocxHtml] = useState('');
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState(false);

  // MAMMOTH DOCX CONVERSION
  useEffect(() => {
    if (!previewDoc) {
      setDocxHtml('');
      setDocxError(false);
      setDocxLoading(false);
      return;
    }

    const isDocx = previewDoc.name?.toLowerCase().endsWith('.docx') || 
                   previewDoc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isDocx && previewDoc.url && previewDoc.url !== '#') {
      setDocxLoading(true);
      setDocxError(false);
      fetch(previewDoc.url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
        .then(result => {
          setDocxHtml(result.value);
        })
        .catch((err) => {
          console.error('Docx preview error:', err);
          setDocxError(true);
        })
        .finally(() => {
          setDocxLoading(false);
        });
    } else {
      setDocxHtml('');
    }
  }, [previewDoc]);

  // FIND REPORT FOR DETAIL VIEW
  const selectedReport = reports.find(r => r.id === selectedReportId) || null;

  // TAB CLICK WITH VIEW TRANSITION COMPATIBILITY
  const handleTabClick = (tabName) => {
    if (activeTab === tabName) return;
    setCurrentPage(1); // Reset page on tab switch
    
    if (!document.startViewTransition) {
      setActiveTab(tabName);
      return;
    }
    document.startViewTransition(() => {
      setActiveTab(tabName);
    });
  };

  // FILTERED DATASET COMPUTATION
  const filteredReports = reports.filter(report => {
    // 1. Tab filter (source)
    const matchesTab = activeTab === 'All' || report.source === activeTab;

    // 2. Search query filter (product, manufacturer, caseId)
    const query = searchQuery.toLowerCase();
    const matchesSearch = report.product.toLowerCase().includes(query) ||
                          report.manufacturer.toLowerCase().includes(query) ||
                          report.caseId.toLowerCase().includes(query);

    // 3. Dropdown Filters
    const matchesCategory = filterCategory === 'All' || report.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || getWorkflowStatus(report.status) === filterStatus;

    return matchesTab && matchesSearch && matchesCategory && matchesStatus;
  });

  // COUNT COMPUTATION PER TAB DYNAMICALLY BASED ON CURRENT FILTERS
  const getTabCount = (tabName) => {
    return reports.filter(report => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = report.product.toLowerCase().includes(query) ||
                            report.manufacturer.toLowerCase().includes(query) ||
                            report.caseId.toLowerCase().includes(query);

      const matchesCategory = filterCategory === 'All' || report.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || getWorkflowStatus(report.status) === filterStatus;

      if (!matchesSearch || !matchesCategory || !matchesStatus) return false;

      if (tabName === 'All') return true;
      return report.source === tabName;
    }).length;
  };

  // PAGINATION COMPUTATION
  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const sanitizedPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (sanitizedPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // ROW SELECTION HANDLERS
  const visibleIds = paginatedReports.map(r => r.id);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));

  const handleHeaderCheckboxChange = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const unique = new Set([...prev, ...visibleIds]);
        return Array.from(unique);
      });
    }
  };

  const handleRowCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // EXPORT CSV HANDLER
  const handleExportCSV = () => {
    const rowsToExport = selectedIds.length > 0 
      ? reports.filter(r => selectedIds.includes(r.id))
      : filteredReports;

    if (rowsToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Case ID", "Product", "Manufacturer", "Category", "Source", "Status", "Region", "Date Received"];
    const csvRows = [headers.join(",")];

    for (const report of rowsToExport) {
      const values = [
        report.caseId,
        `"${report.product.replace(/"/g, '""')}"`,
        `"${report.manufacturer.replace(/"/g, '""')}"`,
        `"${report.category.replace(/"/g, '""')}"`,
        report.source,
        getWorkflowStatus(report.status),
        report.region,
        report.dateReceived
      ];
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fda_consumer_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // STATUS COLORS STYLING HELPER
  // Reflects the complaint lifecycle only (not verification results or
  // enforcement actions, which live in the Verification Queue module).
  const getStatusStyle = (status) => {
    const s = getWorkflowStatus(status);
    switch (s) {
      case "Under Review":
        return {
          backgroundColor: "rgba(217, 119, 6, 0.1)", // 10% opacity of #D97706
          color: "#D97706"
        };
      case "Forwarded to LEA":
        return {
          backgroundColor: "rgba(37, 99, 235, 0.1)", // 10% opacity of #2563EB
          color: "#2563EB"
        };
      case "Operation in Progress":
        return {
          backgroundColor: "rgba(234, 88, 12, 0.1)", // 10% opacity of #EA580C
          color: "#EA580C"
        };
      case "Takedown Completed":
        return {
          backgroundColor: "rgba(27, 67, 50, 0.1)", // 10% opacity of #1B4332
          color: "#1B4332"
        };
      case "Case Closed":
        return {
          backgroundColor: "rgba(31, 41, 55, 0.08)", // 8% opacity of #1F2937
          color: "rgba(31, 41, 55, 0.6)"
        };
      default:
        return {
          backgroundColor: "#EDEDED",
          color: "#1F2937"
        };
    }
  };

  // UNIQUE FILTER OPTIONS COMPUTATION
  const categoriesList = ["All", ...Array.from(new Set(reports.map(r => r.category)))];
  const statusesList = [
    "All",
    "Under Review",
    "Forwarded to LEA",
    "Operation in Progress",
    "Takedown Completed",
    "Case Closed"
  ];

  return (
    <div className="FdaDashboardMain">
      <Sidebar sidebarType="FDA" />
      <div className="FdaContentContainer">
        <TopBar topbarType="FDA" />
        <div className="FdaMainFeed">
          
          {/* HEADER BLOCK */}
          <div className="FdaHeader">
            <div className="FdaHeaderLeft">
              <p className="FdaEyebrow">FDA · Reports</p>
              <h1 className="FdaHeaderTitle">All consumer complaints</h1>
              <p className="FdaSubtitle">
                Centralized record of every submission. Browser-extension and walk-in complaints are classified separately.
              </p>
            </div>
          </div>

          {/* FILTER / SEGMENT ROW — tabs left, Export CSV level with tabs on the right */}
          <div className="FdaFilterRow">
            <div className="FdaPillContainer">
              {tabs.map(tab => (
                <button
                  key={tab}
                  className={`FdaPill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab}
                  <span className="FdaPillCount">{getTabCount(tab)}</span>
                </button>
              ))}
            </div>

            <button className="BtnExportCSV" onClick={handleExportCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>

          {/* FILTER PANEL — search fixed-width left, filters grouped right */}
          <div className="FdaReportsFilterPanel">
            <div className="FdaSearchWrapper FdaSearchFixed">
              <Search size={16} className="FdaSearchIcon" />
              <input
                type="text"
                placeholder="Search product, manufacturer, ID..."
                className="FdaSearchInput"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="FdaFilterGroupsRight">
              <div className="FdaFilterGroup">
                <label>Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All' : getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="FdaFilterGroup">
                <label>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {statusesList.map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>

              {(filterCategory !== 'All' || filterStatus !== 'All' || searchQuery !== '') && (
                <button
                  className="BtnClearFilters"
                  onClick={() => {
                    setFilterCategory('All');
                    setFilterStatus('All');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  <X size={16} />
                </button>
                
              )}
            </div>
          </div>

          {/* BULK ACTIONS BAR */}
          {selectedIds.length > 0 && (
            <div className="FdaBulkBar">
              <span className="FdaBulkInfo">
                {selectedIds.length} {selectedIds.length === 1 ? 'row' : 'rows'} selected
              </span>
              <div className="FdaBulkActions">
                <button className="BtnBulkExport" onClick={handleExportCSV}>
                  Bulk Export CSV
                </button>
                <button className="BtnClearSelection" onClick={() => setSelectedIds([])}>
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* MAIN PAGE INTERACTIVE GRID */}
          <div className="FdaLayoutGrid">
            
            {/* LEFT COLUMN: TABLE AND PAGINATION */}
            <div className="FdaTableCard">
              <div className="FdaTableWrapper">
                <table className="FdaTable">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          className="FdaCheckbox"
                          checked={isAllSelected}
                          onChange={handleHeaderCheckboxChange}
                        />
                      </th>
                      <th>CASE ID</th>
                      <th>PRODUCT</th>
                      <th>MANUFACTURER</th>
                      <th>CATEGORY</th>
                      <th>SOURCE</th>
                      <th>STATUS</th>
                      <th>REGION</th>
                      <th>DATE RECEIVED</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="FdaEmptyState">
                          <Search size={32} />
                          <p>No complaints match your search query or active filter settings.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedReports.map(report => (
                        <tr 
                          key={report.id}
                          className={selectedIds.includes(report.id) ? 'row-selected' : ''}
                        >
                          <td>
                            <input
                              type="checkbox"
                              className="FdaCheckbox"
                              checked={selectedIds.includes(report.id)}
                              onChange={() => handleRowCheckboxChange(report.id)}
                            />
                          </td>
                          <td className="CaseIdCell">{report.caseId}</td>
                          <td className="ProductNameCell">{report.product}</td>
                          <td className="ManufacturerCell">{report.manufacturer}</td>
                          <td>{getCategoryLabel(report.category)}</td>
                          <td>
                            <span className="FdaSourceBadge">
                              {report.source === "Browser Extension" ? (
                                <Globe size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                              ) : (
                                <Footprints size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                              )}
                              {report.source}
                            </span>
                          </td>
                          <td>
                            <span className="FdaBadge" style={getStatusStyle(getWorkflowStatus(report.status))}>
                              {getWorkflowStatus(report.status)}
                            </span>
                          </td>
                          <td>{report.region}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{report.dateReceived}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="BtnActionView"
                              onClick={() => setSelectedReportId(report.id)}
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER / PAGINATION BLOCK */}
              <div className="FdaTableFooter">
                <span className="FdaFooterInfo">
                  Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} entries
                </span>
                
                <div className="FdaPagination">
                  <button
                    className="BtnPageNav"
                    disabled={sanitizedPage === 1}
                    onClick={() => setCurrentPage(sanitizedPage - 1)}
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`FdaPageNumber ${sanitizedPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="BtnPageNav"
                    disabled={sanitizedPage === totalPages}
                    onClick={() => setCurrentPage(sanitizedPage + 1)}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* DETAIL MODAL OVERLAY */}
          {selectedReport && (
            <div className="FdaModalOverlay" onClick={() => setSelectedReportId(null)}>
              <div className="FdaModalContent" onClick={(e) => e.stopPropagation()}>
                <button
                  className="FdaDetailClose"
                  onClick={() => setSelectedReportId(null)}
                  title="Close details"
                >
                  <X size={16} />
                </button>
                
                <div className="FdaDetailHeader">
                  <small>Case Details · {selectedReport.caseId}</small>
                  <h2>{selectedReport.product}</h2>
                  <p>{selectedReport.manufacturer}</p>
                </div>

                <div className="FdaDetailGrid">
                  <div className="FdaDetailItem">
                    <label>Category</label>
                    <span>{getCategoryLabel(selectedReport.category)}</span>
                  </div>
                  <div className="FdaDetailItem">
                    <label>Region</label>
                    <span>{selectedReport.region}</span>
                  </div>
                  <div className="FdaDetailItem">
                    <label>Source Type</label>
                    <span className="FdaSourceBadge" style={{ width: 'fit-content' }}>
                      {selectedReport.source === "Browser Extension" ? (
                        <Globe size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      ) : (
                        <Footprints size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      )}
                      {selectedReport.source}
                    </span>
                  </div>
                  <div className="FdaDetailItem">
                    {/* Read-only — reflects the complaint lifecycle only, not editable here */}
                    <label>Current Status</label>
                    <span className="FdaBadge" style={{ ...getStatusStyle(getWorkflowStatus(selectedReport.status)), width: 'fit-content' }}>
                      {getWorkflowStatus(selectedReport.status)}
                    </span>
                  </div>
                  <div className="FdaDetailItem" style={{ gridColumn: 'span 2' }}>
                    <label>Submitted At</label>
                    <span>{selectedReport.dateReceived}</span>
                  </div>
                </div>

                <div className="FdaDetailDesc">
                  <label>Complaint Description</label>
                  <p>{selectedReport.description}</p>
                </div>

                {/* Replaces the old "Update Case Status" control — shows files
                    submitted by the reporter (Browser Extension user) or LEA
                    personnel (Walk-in complaints), viewable by FDA. */}
                <div className="FdaDetailAttachments">
                  <label>Attached Files / Evidence</label>
                  {selectedReport.documents && selectedReport.documents.length > 0 ? (
                    <div className="FdaVerifDocsGrid">
                      {selectedReport.documents.map(doc => {
                        const isImage = doc.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.name || doc.url);
                        return (
                          <div className="FdaVerifDocCard" key={doc.id}>
                            <div className="FdaVerifDocIcon">
                              {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
                            </div>
                            <div className="FdaVerifDocInfo">
                              <p className="FdaVerifDocName" title={doc.name}>{doc.name}</p>
                              <span className="FdaVerifDocMeta">
                                {doc.uploadedBy}{doc.size ? ` · ${doc.size}` : ''}
                              </span>
                            </div>
                            <div className="FdaVerifDocActions">
                              <button
                                className="FdaVerifDocActionBtn"
                                title="Inspect Attachment"
                                onClick={() => setPreviewDoc(doc)}
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="FdaVerifNoDocsText">No files or evidence were attached to this complaint.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ATTACHMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="FdaVerifModalOverlay" role="dialog" aria-modal="true" style={{ zIndex: 1000 }}>
          <div className="FdaVerifDocModalContainer">
            <div className="FdaVerifDocModalHeader">
              <div className="FdaVerifDocModalTitleGroup">
                <Paperclip size={18} className="FdaVerifGreenIcon" />
                <div>
                  <h3>{previewDoc.name}</h3>
                  <p className="FdaVerifDocModalMeta">
                    {previewDoc.type || 'Document'} &bull; {previewDoc.size || ''}{previewDoc.uploadedBy ? ` &bull; ${previewDoc.uploadedBy}` : ''}
                  </p>
                </div>
              </div>
              <button
                className="FdaVerifIconButton"
                onClick={() => setPreviewDoc(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="FdaVerifDocModalBody">
              {(previewDoc.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(previewDoc.name || previewDoc.url)) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="FdaVerifDocImagePreview"
                />
              ) : (previewDoc.type === 'application/pdf' || /\.pdf$/i.test(previewDoc.name || previewDoc.url)) ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.name}
                  className="FdaVerifDocPdfPreview"
                />
              ) : (previewDoc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.docx$/i.test(previewDoc.name || previewDoc.url)) ? (
                docxLoading ? (
                  <div className="FdaVerifDocPlaceholderPreview">
                    <p className="FdaVerifPreviewText">Converting Word document for preview&hellip;</p>
                  </div>
                ) : docxError ? (
                  <div className="FdaVerifDocPlaceholderPreview">
                    <FileText size={48} className="FdaVerifDocPreviewIcon" />
                    <p className="FdaVerifPreviewTitle">Could not render Word preview</p>
                    <p className="FdaVerifPreviewText">Try downloading the document to view its full contents.</p>
                  </div>
                ) : (
                  <div className="FdaVerifDocDocxPreview">
                    <div
                      className="FdaVerifDocxContent"
                      dangerouslySetInnerHTML={{ __html: docxHtml }}
                    />
                  </div>
                )
              ) : (
                <div className="FdaVerifDocPlaceholderPreview">
                  <FileText size={48} className="FdaVerifDocPreviewIcon" />
                  <p className="FdaVerifPreviewTitle">Preview not supported</p>
                  <p className="FdaVerifPreviewText">
                    <strong>{previewDoc.name}</strong> can't be previewed inline &mdash; use download instead.
                  </p>
                </div>
              )}
            </div>

            <div className="FdaVerifModalFooter">
              <button
                className="FdaVerifBtnOutline"
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </button>
              <button
                className="FdaVerifBtnDownloadAttachment"
                onClick={() => {
                  if (!previewDoc.url || previewDoc.url === '#') {
                    alert('Mock file cannot be downloaded.');
                    return;
                  }
                  const a = document.createElement('a');
                  a.href = previewDoc.url;
                  a.download = previewDoc.name;
                  a.target = '_blank';
                  a.click();
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
  );
}

export default FDAViewReports;