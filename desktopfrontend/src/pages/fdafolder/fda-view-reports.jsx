
import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css';
import { 
  Globe, 
  Footprints, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import { allConsumerReports } from './reportData';

const ITEMS_PER_PAGE = 5;

function FDAViewReports() {
  // REPORTS DATABASE STATE
  const [reports, setReports] = useState(allConsumerReports);

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
    const matchesStatus = report.status === filterStatus || filterStatus === 'All';

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
      const matchesStatus = report.status === filterStatus || filterStatus === 'All';

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

  // INDIVIDUAL STATUS UPDATE
  const handleUpdateStatus = (id, newStatus) => {
    setReports(prev => prev.map(report => {
      if (report.id === id) {
        return { ...report, status: newStatus };
      }
      return report;
    }));
  };

  // BULK ACTIONS
  const handleBulkAction = (actionType) => {
    setReports(prev => prev.map(report => {
      if (selectedIds.includes(report.id)) {
        return { ...report, status: actionType };
      }
      return report;
    }));
    setSelectedIds([]);
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
        report.status,
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
  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified":
      case "Takedown Completed":
        return {
          backgroundColor: "rgba(27, 67, 50, 0.1)", // 10% opacity of #1B4332
          color: "#1B4332"
        };
      case "Pending Verification":
        return {
          backgroundColor: "rgba(217, 119, 6, 0.1)", // 10% opacity of #D97706
          color: "#D97706"
        };
      case "Takedown Requested":
        return {
          backgroundColor: "rgba(185, 28, 28, 0.1)", // 10% opacity of #B91C1C
          color: "#B91C1C"
        };
      case "Under Review":
      case "Forwarded to LEA":
        return {
          backgroundColor: "rgba(19, 33, 60, 0.1)", // 10% opacity of #13213c
          color: "#13213c"
        };
      case "Dismissed":
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
    "Pending Verification", 
    "Takedown Requested", 
    "Verified", 
    "Forwarded to LEA", 
    "Takedown Completed", 
    "Dismissed"
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
            <button className="BtnExportCSV" onClick={handleExportCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>

          {/* FILTER / SEGMENT ROW */}
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
          </div>

          {/* FILTER PANEL */}
          <div className="FdaFilterPanel">
            <div className="FdaSearchWrapper">
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
                  <option key={cat} value={cat}>{cat}</option>
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
                Clear Filters
              </button>
            )}
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
                <button className="BtnBulkForward" onClick={() => handleBulkAction("Forwarded to LEA")}>
                  Forward to LEA
                </button>
                <button className="BtnBulkDismiss" onClick={() => handleBulkAction("Dismissed")}>
                  Dismiss Cases
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
                      <th>PRODUCT / MANUFACTURER</th>
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
                        <td colSpan="9" className="FdaEmptyState">
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
                          <td>
                            <div className="ProductCell">
                              <span className="ProductCellTitle">{report.product}</span>
                              <span className="ProductCellSub">{report.manufacturer}</span>
                            </div>
                          </td>
                          <td>{report.category}</td>
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
                            <span className="FdaBadge" style={getStatusStyle(report.status)}>
                              {report.status}
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
                    <span>{selectedReport.category}</span>
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
                    <label>Current Status</label>
                    <span className="FdaBadge" style={{ ...getStatusStyle(selectedReport.status), width: 'fit-content' }}>
                      {selectedReport.status}
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

                <div className="FdaDetailActions">
                  <label>Update Case Status</label>
                  <div className="FdaDetailActionControls">
                    <select
                      className="FdaStatusSelect"
                      value={selectedReport.status}
                      onChange={(e) => handleUpdateStatus(selectedReport.id, e.target.value)}
                    >
                      {statusesList.filter(s => s !== "All").map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default FDAViewReports;