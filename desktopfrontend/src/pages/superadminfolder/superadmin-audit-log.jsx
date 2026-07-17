import './superadmin-css.css';
import { useState, useEffect } from 'react';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';
import { Search, Calendar, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';

// TODO(backend): user/region display names - These need to come pre-joined from the API, not resolved client-side.
const MOCK_AUDIT_LOGS = [
  {
    log_id: 1,
    timestamp: "2026-07-10 14:05:22",
    user_id: 1,
    user_name: "Maria Santos",
    user_role: "FDA Admin",
    region: "NCR",
    action_type: "create",
    target_table: "products",
    target_id: "PROD-2026-00912",
    ip_address: "192.168.1.105",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: { product_name: "BioGlow Serum", registration_no: "FR-400000123", status: "Active", manufacturer: "BioGlow Cosmetics Inc." }
  },
  {
    log_id: 2,
    timestamp: "2026-07-10 13:48:10",
    user_id: 2,
    user_name: "Jose Reyes",
    user_role: "LEA Admin",
    region: "Region 3",
    action_type: "update",
    target_table: "verification_requests",
    target_id: "VR-2026-00045",
    ip_address: "192.168.22.45",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    old_value: { status: "Draft", priority: "standard" },
    new_value: { status: "Sent", priority: "high" }
  },
  {
    log_id: 3,
    timestamp: "2026-07-10 12:15:00",
    user_id: null,
    user_name: null,
    user_role: null,
    region: null,
    action_type: "update",
    target_table: "verification_requests",
    target_id: "VR-2026-00041",
    ip_address: "10.0.4.18",
    user_agent: null,
    old_value: { status: "Pending Verification" },
    new_value: { status: "Auto-Dismissed" }
  },
  {
    log_id: 4,
    timestamp: "2026-07-10 11:30:15",
    user_id: 3,
    user_name: "Admin Kristine",
    user_role: "Superadmin",
    region: "NCR",
    action_type: "create",
    target_table: "users",
    target_id: "EMP-009",
    ip_address: "124.83.120.4",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    old_value: null,
    new_value: { fullname: "Cardo Dalisay", email: "cardo.dalisay@cidg.gov.ph", agency: "LEA-CIDG", region: "Region 4A", status: "Pending" }
  },
  {
    log_id: 5,
    timestamp: "2026-07-10 10:02:44",
    user_id: 3,
    user_name: "Admin Kristine",
    user_role: "Superadmin",
    region: "NCR",
    action_type: "login",
    target_table: "sessions",
    target_id: "SESS-88123A",
    ip_address: "124.83.120.4",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: null
  },
  {
    log_id: 6,
    timestamp: "2026-07-09 16:55:30",
    user_id: 1,
    user_name: "Maria Santos",
    user_role: "FDA Admin",
    region: "NCR",
    action_type: "delete",
    target_table: "products",
    target_id: "PROD-2025-00112",
    ip_address: "192.168.1.105",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { product_name: "Expired Herbal Slim", status: "Registered" },
    new_value: null
  },
  {
    log_id: 7,
    timestamp: "2026-07-09 15:40:12",
    user_id: 5,
    user_name: "Juan Dela Cruz",
    user_role: "FDA Personnel",
    region: "Region 1",
    action_type: "update",
    target_table: "products",
    target_id: "PROD-2026-00445",
    ip_address: "192.168.4.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { status: "Under Review" },
    new_value: { status: "Registered" }
  },
  {
    log_id: 8,
    timestamp: "2026-07-09 14:12:00",
    user_id: 6,
    user_name: "Ramon Magsaysay",
    user_role: "LEA Personnel",
    region: "Region 7",
    action_type: "create",
    target_table: "walkin_complaints",
    target_id: "COMP-2026-0011",
    ip_address: "192.168.35.10",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: { complainant: "B. Aquino", product_name: "Fake Toothpaste", description: "Purchased from sidewalk vendor, caused gum irritation." }
  },
  {
    log_id: 9,
    timestamp: "2026-07-09 10:05:00",
    user_id: 3,
    user_name: "Admin Kristine",
    user_role: "Superadmin",
    region: "NCR",
    action_type: "update",
    target_table: "users",
    target_id: "EMP-002",
    ip_address: "124.83.120.4",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { status: "Active" },
    new_value: { status: "Suspended" }
  },
  {
    log_id: 10,
    timestamp: "2026-07-08 17:22:45",
    user_id: null,
    user_name: null,
    user_role: null,
    region: null,
    action_type: "login",
    target_table: "sessions",
    target_id: "SESS-FAILED-99",
    ip_address: "203.111.45.8",
    user_agent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    old_value: null,
    new_value: { status: "Failed Login Attempt", details: "Invalid credentials for email admin@fda.gov.ph" }
  },
  {
    log_id: 11,
    timestamp: "2026-07-08 13:02:11",
    user_id: 5,
    user_name: "Juan Dela Cruz",
    user_role: "FDA Personnel",
    region: "Region 1",
    action_type: "create",
    target_table: "products",
    target_id: "PROD-2026-00445",
    ip_address: "192.168.4.12",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: { product_name: "Healthy Herbal Capsule", manufacturer: "Pure Organics", registration_no: "PENDING" }
  },
  {
    log_id: 12,
    timestamp: "2026-07-08 11:45:00",
    user_id: 2,
    user_name: "Jose Reyes",
    user_role: "LEA Admin",
    region: "Region 3",
    action_type: "delete",
    target_table: "walkin_complaints",
    target_id: "COMP-2025-0902",
    ip_address: "192.168.22.45",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { complainant: "Anonymous", product_name: "Unknown Brand Soap" },
    new_value: null
  },
  {
    log_id: 13,
    timestamp: "2026-07-08 09:12:30",
    user_id: 6,
    user_name: "Ramon Magsaysay",
    user_role: "LEA Personnel",
    region: "Region 7",
    action_type: "login",
    target_table: "sessions",
    target_id: "SESS-RAMON-101",
    ip_address: "192.168.35.10",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: null
  },
  {
    log_id: 14,
    timestamp: "2026-07-07 16:30:00",
    user_id: 1,
    user_name: "Maria Santos",
    user_role: "FDA Admin",
    region: "NCR",
    action_type: "update",
    target_table: "products",
    target_id: "PROD-2026-00045",
    ip_address: "192.168.1.105",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { status: "Active" },
    new_value: { status: "Suspended", reason: "Safety recall alert" }
  },
  {
    log_id: 15,
    timestamp: "2026-07-07 14:15:22",
    user_id: 3,
    user_name: "Admin Kristine",
    user_role: "Superadmin",
    region: "NCR",
    action_type: "create",
    target_table: "users",
    target_id: "EMP-008",
    ip_address: "124.83.120.4",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: { fullname: "Ramon Magsaysay", email: "ramon.magsaysay@cidg.gov.ph", agency: "LEA-CIDG", region: "Region 7", status: "Active" }
  },
  {
    log_id: 16,
    timestamp: "2026-07-07 10:10:00",
    user_id: null,
    user_name: null,
    user_role: null,
    region: null,
    action_type: "update",
    target_table: "system_settings",
    target_id: "SETT-MAX-ATTEMPTS",
    ip_address: "127.0.0.1",
    user_agent: null,
    old_value: { value: "3" },
    new_value: { value: "5" }
  },
  {
    log_id: 17,
    timestamp: "2026-07-06 15:45:10",
    user_id: 7,
    user_name: "Clara Recto",
    user_role: "FDA Personnel",
    region: "Region 4A",
    action_type: "login",
    target_table: "sessions",
    target_id: "SESS-CLARA-88",
    ip_address: "192.168.12.89",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: null
  },
  {
    log_id: 18,
    timestamp: "2026-07-06 11:22:33",
    user_id: 7,
    user_name: "Clara Recto",
    user_role: "FDA Personnel",
    region: "Region 4A",
    action_type: "update",
    target_table: "products",
    target_id: "PROD-2025-00998",
    ip_address: "192.168.12.89",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { product_name: "VitC Glow Tablet", status: "Expired" },
    new_value: { product_name: "VitC Glow Tablet", status: "Renewed" }
  },
  {
    log_id: 19,
    timestamp: "2026-07-06 09:30:00",
    user_id: 2,
    user_name: "Jose Reyes",
    user_role: "LEA Admin",
    region: "Region 3",
    action_type: "update",
    target_table: "users",
    target_id: "EMP-002",
    ip_address: "192.168.22.45",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { fullname: "Jose A. Reyes", contactno: "" },
    new_value: { fullname: "Jose Reyes Jr.", contactno: "09281234567" }
  },
  {
    log_id: 20,
    timestamp: "2026-07-05 16:50:11",
    user_id: 3,
    user_name: "Admin Kristine",
    user_role: "Superadmin",
    region: "NCR",
    action_type: "update",
    target_table: "system_config",
    target_id: "CFG-MAINTENANCE-MODE",
    ip_address: "124.83.120.4",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { active: true },
    new_value: { active: false }
  },
  {
    log_id: 21,
    timestamp: "2026-07-05 13:10:00",
    user_id: 8,
    user_name: "Andres Bonifacio",
    user_role: "LEA Personnel",
    region: "NIR",
    action_type: "create",
    target_table: "verification_requests",
    target_id: "VR-2026-00088",
    ip_address: "192.168.88.19",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: null,
    new_value: { complainant: "A. Bonifacio", product_code: "P-882", reason: "Suspected adulteration" }
  },
  {
    log_id: 22,
    timestamp: "2026-07-05 10:05:00",
    user_id: 8,
    user_name: "Andres Bonifacio",
    user_role: "LEA Personnel",
    region: "NIR",
    action_type: "login",
    target_table: "sessions",
    target_id: "SESS-ANDRES-77",
    ip_address: "192.168.88.19",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    old_value: null,
    new_value: null
  },
  {
    log_id: 23,
    timestamp: "2026-07-04 16:15:30",
    user_id: 1,
    user_name: "Maria Santos",
    user_role: "FDA Admin",
    region: "NCR",
    action_type: "update",
    target_table: "products",
    target_id: "PROD-2025-00122",
    ip_address: "192.168.1.105",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { status: "Pending Registration" },
    new_value: { status: "Registered" }
  },
  {
    log_id: 24,
    timestamp: "2026-07-04 14:00:22",
    user_id: 3,
    user_name: "Admin Kristine",
    user_role: "Superadmin",
    region: "NCR",
    action_type: "update",
    target_table: "users",
    target_id: "EMP-003",
    ip_address: "124.83.120.4",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    old_value: { status: "Pending" },
    new_value: { status: "For Activation" }
  },
  {
    log_id: 25,
    timestamp: "2026-07-04 09:15:40",
    user_id: null,
    user_name: null,
    user_role: null,
    region: null,
    action_type: "delete",
    target_table: "sessions",
    target_id: "SESS-EXP-110",
    ip_address: "127.0.0.1",
    user_agent: null,
    old_value: { session_id: "SESS-EXP-110", expiry: "2026-07-04 09:00:00" },
    new_value: null
  }
];

const REGION_OPTIONS = [
  'NCR', 'CAR', 'Region 1', 'Region 2', 'Region 3', 'Region 4A', 'MIMAROPA', 
  'Region 5', 'Region 6', 'Region 7', 'Region 8', 'NIR', 'Region 9', 
  'Region 10', 'Region 11', 'Region 12', 'Region 13', 'BARMM'
];

function deriveAgencyInfo(userId, userRole) {
  if (!userId || !userRole) {
    return { name: 'System', badgeClass: 'badge-agency-system' };
  }
  const roleUpper = userRole.toUpperCase();
  if (roleUpper.includes('FDA')) {
    return { name: 'FDA', badgeClass: 'badge-agency-fda' };
  }
  if (roleUpper.includes('LEA') || roleUpper.includes('CIDG')) {
    return { name: 'LEA-CIDG', badgeClass: 'badge-agency-lea' };
  }
  if (roleUpper.includes('SUPERADMIN')) {
    return { name: 'Superadmin', badgeClass: 'badge-agency-super' };
  }
  return { name: 'System', badgeClass: 'badge-agency-system' };
}

function getActionBadgeClass(actionType) {
  switch (actionType) {
    case 'create':
      return 'badge-action-create';
    case 'update':
      return 'badge-action-update';
    case 'delete':
      return 'badge-action-delete';
    case 'login':
    default:
      return 'badge-action-neutral';
  }
}

function truncateTargetId(id) {
  if (!id) return '—';
  const idStr = String(id);
  if (idStr.length > 10) {
    return `${idStr.substring(0, 6)}...${idStr.substring(idStr.length - 4)}`;
  }
  return idStr;
}

function SuperAdminAuditLog() {
  // Filters & State mapping query parameters
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'FDA', 'LEA-CIDG', 'Superadmin'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10); // page size
  
  // Simulated server-side response states
  const [logs, setLogs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Detail Drawer State
  const [selectedLog, setSelectedLog] = useState(null);

  // TAB CLICK WITH VIEW TRANSITION COMPATIBILITY (reference from lea-saved-draft.jsx pattern)
  const handleTabClick = (tabName) => {
    if (activeTab === tabName) return;
    setCurrentPage(1);
    
    if (!document.startViewTransition) {
      setActiveTab(tabName);
      return;
    }
    document.startViewTransition(() => {
      setActiveTab(tabName);
    });
  };

  // Reset Filters handler
  const handleClearFilters = () => {
    setSearchQuery('');
    setActionFilter('All');
    setRegionFilter('All');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // TODO(backend): fetch function - Note expected endpoint: GET /api/superadmin/audit-logs
  // Expected query params: page, limit, agency, action, dateFrom, dateTo, region, search
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...MOCK_AUDIT_LOGS];

      // 1. Agency tab filter (FDA green / LEA teal / Superadmin navy / System gray)
      if (activeTab !== 'All') {
        filtered = filtered.filter(log => {
          const agencyInfo = deriveAgencyInfo(log.user_id, log.user_role);
          return agencyInfo.name === activeTab;
        });
      }

      // 2. Action filter
      if (actionFilter !== 'All') {
        filtered = filtered.filter(log => log.action_type === actionFilter);
      }

      // 3. Region filter
      if (regionFilter !== 'All') {
        filtered = filtered.filter(log => log.region === regionFilter);
      }

      // 4. Date From filter
      if (dateFrom) {
        filtered = filtered.filter(log => log.timestamp >= `${dateFrom} 00:00:00`);
      }

      // 5. Date To filter
      if (dateTo) {
        filtered = filtered.filter(log => log.timestamp <= `${dateTo} 23:59:59`);
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(log =>
          (log.target_id && log.target_id.toLowerCase().includes(query)) ||
          (log.user_name && log.user_name.toLowerCase().includes(query)) ||
          (log.target_table && log.target_table.toLowerCase().includes(query))
        );
      }

      // Pagination slice
      const count = filtered.length;
      const pages = Math.ceil(count / limit) || 1;
      const activePage = Math.min(Math.max(1, currentPage), pages);
      const startIdx = (activePage - 1) * limit;
      const slicedLogs = filtered.slice(startIdx, startIdx + limit);

      setLogs(slicedLogs);
      setTotalItems(count);
      setTotalPages(pages);
      setLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [activeTab, actionFilter, regionFilter, dateFrom, dateTo, searchQuery, currentPage, limit]);

  // Tab count calculation based on active secondary filters
  const getTabCount = (tabName) => {
    let result = [...MOCK_AUDIT_LOGS];

    if (actionFilter !== 'All') {
      result = result.filter(log => log.action_type === actionFilter);
    }
    if (regionFilter !== 'All') {
      result = result.filter(log => log.region === regionFilter);
    }
    if (dateFrom) {
      result = result.filter(log => log.timestamp >= `${dateFrom} 00:00:00`);
    }
    if (dateTo) {
      result = result.filter(log => log.timestamp <= `${dateTo} 23:59:59`);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(log =>
        (log.target_id && log.target_id.toLowerCase().includes(query)) ||
        (log.user_name && log.user_name.toLowerCase().includes(query)) ||
        (log.target_table && log.target_table.toLowerCase().includes(query))
      );
    }

    if (tabName === 'All') return result.length;

    return result.filter(log => {
      const agencyInfo = deriveAgencyInfo(log.user_id, log.user_role);
      return agencyInfo.name === tabName;
    }).length;
  };

  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  return (
    <div className="SuperadminMainContainer">
      <Sidebar sidebarType="SUPER_ADMIN" />
      <div className="SuperadminContentContainer">
        <TopBar />
        <div className="SuperadminMainfeed">
          <div className="UMPageContainer">
            {/* Page Header */}
            <div className="UMPageHeader">
              <div className="UMPageTitleBlock">
                <h2 className="UMPageTitle">Audit Trail Logs</h2>
                <p className="UMPageSubtitle">
                  Track and examine system actions, resource creations, profile changes, and session activities.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="AuditTabsContainer">
              <div className="AuditTabsButton">
                {['All', 'FDA', 'LEA-CIDG', 'Superadmin', 'System'].map((tab) => (
                  <button
                    key={tab}
                    className={`AuditTabButton ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab)}
                  >
                    {tab === 'All' ? 'All Activities' : tab}
                    <span className="AuditTabCount">{getTabCount(tab)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Filter Controls */}
            <div className="AuditFiltersRow">
              <div className="AuditSearchWrapper">
                <Search size={16} className="AuditSearchIcon" />
                <input
                  type="text"
                  placeholder="Search Target ID, Table, User..."
                  className="AuditSearchInput"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="AuditFiltersGroup">
                <select
                  className="AuditSelectFilter"
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                </select>

                <select
                  className="AuditSelectFilter"
                  value={regionFilter}
                  onChange={(e) => {
                    setRegionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Regions</option>
                  {REGION_OPTIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>

                <div className="AuditDateGroup">
                  <span className="AuditDateLabel">From:</span>
                  <input
                    type="date"
                    className="AuditDateInput"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="AuditDateGroup">
                  <span className="AuditDateLabel">To:</span>
                  <input
                    type="date"
                    className="AuditDateInput"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {(searchQuery || actionFilter !== 'All' || regionFilter !== 'All' || dateFrom || dateTo) && (
                  <button className="BtnClearAuditFilters" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="UMTableWrapper">
              {loading ? (
                <div className="UMEmpty" style={{ padding: '40px', textAlign: 'center' }}>
                  Loading logs...
                </div>
              ) : logs.length > 0 ? (
                <>
                  <table className="UMTable">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Agency</th>
                        <th>Region</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>IP Address</th>
                        <th className="AuditTextCenter">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => {
                        const agencyInfo = deriveAgencyInfo(log.user_id, log.user_role);
                        return (
                          <tr key={log.log_id}>
                            <td className="AuditNoWrap">{log.timestamp}</td>
                            <td>
                              {log.user_id ? (
                                <div className="AuditUserCell">
                                  <strong>{log.user_name}</strong>
                                  <span className="role-badge-pill">{log.user_role}</span>
                                </div>
                              ) : (
                                <strong>System</strong>
                              )}
                            </td>
                            <td>
                              <span className={`UMStatusBadge ${agencyInfo.badgeClass}`}>
                                {agencyInfo.name}
                              </span>
                            </td>
                            <td>{log.region || '—'}</td>
                            <td>
                              <span className={getActionBadgeClass(log.action_type)}>
                                {log.action_type}
                              </span>
                            </td>
                            <td>
                              <span className="AuditNoWrap">
                                {log.target_table}
                                <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '4px' }}>
                                  ({truncateTargetId(log.target_id)})
                                </span>
                              </span>
                            </td>
                            <td className="AuditNoWrap">{log.ip_address || '—'}</td>
                            <td className="AuditTextCenter">
                              <button
                                className="AuditDetailsBtn"
                                onClick={() => setSelectedLog(log)}
                                title="View detailed audit changes"
                              >
                                <Info size={14} /> Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="AuditPaginationWrapper">
                    <span className="AuditPaginationInfo">
                      Showing {totalItems === 0 ? 0 : startIndex + 1}–{endIndex} of {totalItems} entries
                    </span>
                    <div className="AuditPaginationControls">
                      <button
                        className="AuditPageBtn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          className={`AuditPageNumber ${currentPage === page ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        className="AuditPageBtn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="UMEmpty" style={{ padding: '60px', textAlign: 'center' }}>
                  No audit logs found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row Detail Drawer Overlay */}
      {selectedLog && (
        <div className="AuditDrawerOverlay" onClick={() => setSelectedLog(null)}>
          <div className="AuditDrawerContent" onClick={(e) => e.stopPropagation()}>
            <div className="AuditDrawerHeader">
              <h3 className="AuditDrawerTitle">Audit Log Details</h3>
              <button 
                className="AuditDrawerCloseBtn" 
                onClick={() => setSelectedLog(null)}
                title="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="AuditDrawerBody">
              <div className="AuditDrawerSection">
                <div className="AuditDrawerLabel">Log ID</div>
                <div className="AuditDrawerValue">{selectedLog.log_id}</div>
              </div>

              <div className="AuditDrawerSection">
                <div className="AuditDrawerLabel">Timestamp</div>
                <div className="AuditDrawerValue">{selectedLog.timestamp}</div>
              </div>

              <div className="AuditDrawerSection">
                <div className="AuditDrawerLabel">User</div>
                <div className="AuditDrawerValue">
                  {selectedLog.user_id ? (
                    `${selectedLog.user_name} (${selectedLog.user_role})`
                  ) : (
                    "System"
                  )}
                </div>
              </div>

              <div className="AuditDrawerSection">
                <div className="AuditDrawerLabel">IP Address</div>
                <div className="AuditDrawerValue">{selectedLog.ip_address || '—'}</div>
              </div>

              <div className="AuditDrawerSection">
                <div className="AuditDrawerLabel">Action Target</div>
                <div className="AuditDrawerValue">
                  Table: <strong>{selectedLog.target_table}</strong> | ID: <strong>{selectedLog.target_id || "—"}</strong>
                </div>
              </div>

              {selectedLog.old_value === null && selectedLog.new_value === null ? (
                <div className="AuditDrawerSection">
                  <div className="AuditDrawerLabel">Data Changes</div>
                  <div className="AuditNoChangesText">No data changes recorded for this action.</div>
                </div>
              ) : (
                <>
                  <div className="AuditDrawerSection">
                    <div className="AuditDrawerLabel">Before Value (old_value)</div>
                    {selectedLog.old_value ? (
                      <pre className="AuditPreBlock">
                        {JSON.stringify(selectedLog.old_value, null, 2)}
                      </pre>
                    ) : (
                      <div className="AuditDrawerValue">null</div>
                    )}
                  </div>

                  <div className="AuditDrawerSection">
                    <div className="AuditDrawerLabel">After Value (new_value)</div>
                    {selectedLog.new_value ? (
                      <pre className="AuditPreBlock">
                        {JSON.stringify(selectedLog.new_value, null, 2)}
                      </pre>
                    ) : (
                      <div className="AuditDrawerValue">null</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminAuditLog;
