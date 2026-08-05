import './superadmin-css.css';
import { useState, useEffect, useRef } from 'react';
import {
  Send,
  UserX,
  Trash2,
  Eye,
  MoreVertical,
  TriangleAlert,
  CircleCheckBig,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';

// Helper to retrieve token if backend integration is active
function getAuthToken() {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token') ||
    ''
  );
}

// ⚠️ REMOVE THIS: Initial mock superadmin data
const INITIAL_ADMINS = [
  {
    id: 1,
    email: 'superadmin.primary@icmda.gov.ph',
    invitation_date: '2026-07-01',
    expiration_date: '2026-07-03',
    status: 'Active',
  },
  {
    id: 2,
    email: 'maria.santos@icmda.gov.ph',
    invitation_date: '2026-08-01',
    expiration_date: '2026-08-03',
    status: 'Invited',
  },
  {
    id: 3,
    email: 'juan.delacruz@icmda.gov.ph',
    invitation_date: '2026-07-20',
    expiration_date: '2026-07-22',
    status: 'Invitation Expired',
  },
  {
    id: 4,
    email: 'admin.security@icmda.gov.ph',
    invitation_date: '2026-06-15',
    expiration_date: '2026-06-17',
    status: 'Active',
  },
  {
    id: 5,
    email: 'ronald.reyes@icmda.gov.ph',
    invitation_date: '2026-05-10',
    expiration_date: '2026-05-12',
    status: 'Suspended',
  },
];

const STATUS_META = {
  Invited: { label: 'Invited', className: 'sam-badge-invited' },
  'Invitation Expired': { label: 'Invitation Expired', className: 'sam-badge-expired' },
  Active: { label: 'Active', className: 'sam-badge-active' },
  Suspended: { label: 'Suspended', className: 'sam-badge-suspended' },
};

function SAMStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, className: '' };
  return <span className={`SAMStatusBadge ${meta.className}`}>{meta.label}</span>;
}

// Determines whether a status has any dropdown actions at all
function hasDropdownActions(status) {
  return status !== 'Invited';
}

function SAMActionDropdown({ admin, isOpen, toggleDropdown, onAction, onView }) {
  const status = admin.status;
  const [openUpward, setOpenUpward] = useState(false);
  const triggerRef = useRef(null);
  const showTrigger = hasDropdownActions(status);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 170);
    }
    toggleDropdown();
  };

  return (
    <div className={`SAMDropdownWrapper ${isOpen ? 'active-open' : ''}`}>
      <button
        className="SAMViewBtn"
        data-tooltip="View Details"
        title="View Details"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      >
        <Eye size={15} />
      </button>

      {showTrigger && (
        <button
          ref={triggerRef}
          className="SAMDropdownTrigger"
          data-tooltip="Actions"
          title="More Actions"
          onClick={handleToggle}
        >
          <MoreVertical size={16} />
        </button>
      )}

      {isOpen && showTrigger && (
        <div className={`SAMDropdownMenu ${openUpward ? 'open-upward' : ''}`}>
          {/* Invitation Expired status actions — only Resend remains, no delete in DB */}
          {status === 'Invitation Expired' && (
            <button
              className="SAMDropdownItem"
              onClick={() => {
                onAction('resend');
                toggleDropdown();
              }}
            >
              <Send size={14} /> Resend Invitation
            </button>
          )}

          {/* Active status actions */}
          {status === 'Active' && (
            <>
              <button
                className="SAMDropdownItem"
                onClick={() => {
                  onAction('suspend');
                  toggleDropdown();
                }}
              >
                <UserX size={14} /> Suspend Account
              </button>
              <div className="SAMDropdownDivider" />
              <button
                className="SAMDropdownItem danger"
                onClick={() => {
                  onAction('delete');
                  toggleDropdown();
                }}
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </>
          )}

          {/* Suspended status actions */}
          {status === 'Suspended' && (
            <>
              <button
                className="SAMDropdownItem"
                onClick={() => {
                  onAction('reactivate');
                  toggleDropdown();
                }}
              >
                <RotateCcw size={14} /> Reactivate Account
              </button>
              <div className="SAMDropdownDivider" />
              <button
                className="SAMDropdownItem danger"
                onClick={() => {
                  onAction('delete');
                  toggleDropdown();
                }}
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const CONFIRM_MESSAGES = {
  resend: {
    title: 'Resend Invitation Email',
    message: 'Are you sure you want to resend the Superadmin invitation email to this user?',
    confirmLabel: 'Resend Invitation',
  },
  suspend: {
    title: 'Suspend Account',
    message: 'Are you sure you want to suspend this Superadmin account? Access will be temporarily revoked.',
    confirmLabel: 'Suspend Account',
  },
  reactivate: {
    title: 'Reactivate Account',
    message: 'Are you sure you want to reactivate this Superadmin account? Access will be restored immediately.',
    confirmLabel: 'Reactivate Account',
  },
  delete: {
    title: 'Delete Admin Account',
    message: 'Are you sure you want to delete this Superadmin account entry? This action cannot be undone.',
    confirmLabel: 'Delete Account',
  },
};

function SAMConfirmModal({ open, actionType, onConfirm, onCancel }) {
  if (!open) return null;
  const meta = CONFIRM_MESSAGES[actionType] || {};

  const isDestructive = actionType === 'suspend' || actionType === 'delete';
  const isReactivate = actionType === 'reactivate';

  return (
    <div className="SAMModalOverlay">
      <div className="SAMModal SAMConfirmModal">
        <div className="SAMConfirmIcon">
          {isDestructive ? (
            <TriangleAlert size={40} color="#D97706" strokeWidth={2.5} />
          ) : isReactivate ? (
            <CircleCheckBig size={40} color="#0D9488" strokeWidth={2.5} />
          ) : (
            <Mail size={40} color="#0D9488" strokeWidth={2.5} />
          )}
        </div>
        <h3 className="SAMModalTitle">{meta.title}</h3>
        <p className="SAMConfirmMessage">{meta.message}</p>
        <div className="SAMModalFooter">
          <button className="SAMCancelBtn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`SAMConfirmBtn ${isDestructive ? 'danger' : 'primary'}`}
            onClick={onConfirm}
          >
            {meta.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddSuperadminModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sending, setSending] = useState(false);

  function handleClose() {
    setEmail('');
    setEmailError('');
    setSuccessMsg('');
    setSending(false);
    onClose(null);
  }

  async function handleSend() {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setSending(true);

    try {
      // 🔌 BACKEND: Send invitation email API call
      // const response = await fetch('http://127.0.0.1:8000/superadmin/invite', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${getAuthToken()}`,
      //   },
      //   body: JSON.stringify({ email: email.trim() }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.detail || 'Failed to send invite.');
      // }

      // ⚠️ REMOVE THIS: Simulated frontend email dispatch
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSending(false);
      setSuccessMsg(`Superadmin invitation email has been sent to ${email.trim()}`);
    } catch (err) {
      setSending(false);
      setEmailError(err.message || 'Failed to send invitation.');
    }
  }

  function handleDone() {
    onClose({ email: email.trim() });
    setEmail('');
    setEmailError('');
    setSuccessMsg('');
    setSending(false);
  }

  if (!open) return null;

  return (
    <div className="SAMModalOverlay">
      <div className="SAMModal SAMAddModal">
        <div className="SAMModalHeader">
          <h3 className="SAMModalTitle">Add Superadmin</h3>
          <p className="SAMModalSubtitle">
            Enter the email address of the new Superadmin personnel. They will receive an email invitation to set up their password.
          </p>
        </div>

        {!successMsg ? (
          <>
            <div className="SAMFormGroup">
              <label className="SAMLabel">
                Email Address <span className="SAMRequired">*</span>
              </label>

              <input
                type="email"
                className={`SAMInput ${emailError ? 'input-error' : ''}`}
                placeholder="e.g. admin.personnel@icmda.gov.ph"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                disabled={sending}
                autoFocus
              />

              {emailError && <span className="SAMFieldError">{emailError}</span>}
            </div>

            <div className="SAMModalFooter">
              <button className="SAMCancelBtn" onClick={handleClose} disabled={sending}>
                Cancel
              </button>

              <button
                className="SAMConfirmBtn primary"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send Invitation'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="SAMSuccessBox">
              <div className="SAMSuccessIcon">✉️</div>
              <p className="SAMSuccessMsg">{successMsg}</p>
            </div>

            <div className="SAMModalFooter SAMFooterCenter">
              <button className="SAMConfirmBtn primary" onClick={handleDone}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ViewAdminModal({ open, admin, onClose }) {
  if (!open || !admin) return null;

  return (
    <div className="SAMModalOverlay">
      <div className="SAMModal SAMViewModal">
        <div className="SAMModalHeader">
          <div className="SAMViewTitleRow">
            <ShieldCheck size={24} color="#0D9488" />
            <h3 className="SAMModalTitle">Superadmin Details</h3>
          </div>
          <p className="SAMModalSubtitle">Viewing account status and invitation details.</p>
        </div>

        <div className="SAMViewDetails">
          <div className="SAMDetailRow">
            <span className="SAMDetailLabel">Email Address:</span>
            <span className="SAMDetailValue SAMEmail">{admin.email}</span>
          </div>
          <div className="SAMDetailRow">
            <span className="SAMDetailLabel">Invitation Date:</span>
            <span className="SAMDetailValue">{admin.invitation_date || '—'}</span>
          </div>
          <div className="SAMDetailRow">
            <span className="SAMDetailLabel">Expiration Date:</span>
            <span className="SAMDetailValue">{admin.expiration_date || '—'}</span>
          </div>
          <div className="SAMDetailRow">
            <span className="SAMDetailLabel">Role:</span>
            <span className="SAMDetailValue">Super Administrator</span>
          </div>
          <div className="SAMDetailRow">
            <span className="SAMDetailLabel">Status:</span>
            <span className="SAMDetailValue">
              <SAMStatusBadge status={admin.status} />
            </span>
          </div>
        </div>

        <div className="SAMModalFooter SAMFooterCenter">
          <button className="SAMConfirmBtn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminAdminManagement() {
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewAdmin, setViewAdmin] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    actionType: '',
    targetId: null,
  });

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!event.target.closest('.SAMDropdownWrapper')) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // 🔌 BACKEND: Fetch superadmins from API on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      // 🔌 BACKEND: Endpoint fetch for Superadmin list
      // const response = await fetch('http://127.0.0.1:8000/superadmin/list', {
      //   headers: { Authorization: `Bearer ${getAuthToken()}` },
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   setAdmins(data);
      // }
    } catch (error) {
      console.error('Error fetching superadmins:', error);
    }
  }

  function handleAddModalClose(data) {
    setAddModalOpen(false);
    if (data && data.email) {
      // ⚠️ REMOVE THIS: Add new invitation to local state
      const today = new Date().toISOString().split('T')[0];
      const expireDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const newAdmin = {
        id: Date.now(),
        email: data.email,
        invitation_date: today,
        expiration_date: expireDate,
        status: 'Invited',
      };
      setAdmins((prev) => [newAdmin, ...prev]);
    }
  }

  function openConfirm(actionType, adminId) {
    setConfirmModal({ open: true, actionType, targetId: adminId });
  }

  async function handleConfirm() {
    const { actionType, targetId } = confirmModal;

    // 🔌 BACKEND: Execute action endpoint
    // let url = `http://127.0.0.1:8000/superadmin/${targetId}/${actionType}`;

    // ⚠️ REMOVE THIS: Local state simulation
    setAdmins((prev) =>
      prev
        .map((a) => {
          if (a.id === targetId) {
            if (actionType === 'resend') {
              const today = new Date().toISOString().split('T')[0];
              const expireDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];
              return {
                ...a,
                status: 'Invited',
                invitation_date: today,
                expiration_date: expireDate,
              };
            }
            if (actionType === 'suspend') {
              return { ...a, status: 'Suspended' };
            }
            if (actionType === 'reactivate') {
              return { ...a, status: 'Active' };
            }
            if (actionType === 'delete') {
              return null; // marked for removal
            }
          }
          return a;
        })
        .filter(Boolean)
    );

    setConfirmModal({ open: false, actionType: '', targetId: null });
  }

  function handleCancelConfirm() {
    setConfirmModal({ open: false, actionType: '', targetId: null });
  }

  const filteredAdmins = admins.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="SuperadminMainContainer">
      <Sidebar sidebarType="SUPER_ADMIN" />
      <div className="SuperadminContentContainer">
        <TopBar topbarType="SUPER_ADMIN" />
        <div className="SuperadminMainfeed">
          <div className="SAMPageContainer">
            {/* Page Header */}
            <div className="SAMPageHeader">
              <div className="SAMPageTitleBlock">
                <h2 className="SAMPageTitle">Admin Management</h2>
                <p className="SAMPageSubtitle">
                  Manage Superadmin personnel accounts — send invitations, resend links, and control access.
                </p>
              </div>
              <button className="SAMAddBtn" onClick={() => setAddModalOpen(true)}>
                <Plus size={18} />
                Add Superadmin
              </button>
            </div>

            {/* Stats Row */}
            <div className="SAMStatsRow">
              {[
                { label: 'Total Superadmins', value: admins.length, className: 'sam-stat-total' },
                {
                  label: 'Active',
                  value: admins.filter((a) => a.status === 'Active').length,
                  className: 'sam-stat-active',
                },
                {
                  label: 'Invited',
                  value: admins.filter((a) => a.status === 'Invited').length,
                  className: 'sam-stat-invited',
                },
                {
                  label: 'Invitation Expired',
                  value: admins.filter((a) => a.status === 'Invitation Expired').length,
                  className: 'sam-stat-expired',
                },
                {
                  label: 'Suspended',
                  value: admins.filter((a) => a.status === 'Suspended').length,
                  className: 'sam-stat-suspended',
                },
              ].map((s) => (
                <div key={s.label} className={`SAMStatCard ${s.className}`}>
                  <span className="SAMStatValue">{s.value}</span>
                  <span className="SAMStatLabel">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Filter Container */}
            <div className="SAMFiltersContainer">
              <div className="SAMSearchWrapper">
                <Search size={16} className="SAMSearchIcon" />
                <input
                  type="text"
                  className="SAMSearchInput"
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="SAMClearSearch"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="SAMFilterGroup">
                <span className="SAMFilterLabel">Filter by Status:</span>
                <select
                  className="SAMSelectFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Invited">Invited</option>
                  <option value="Invitation Expired">Invitation Expired</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="SAMTableWrapper">
              <table className="SAMTable">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Email</th>
                    <th>Invitation Date</th>
                    <th>Expiration Date</th>
                    <th>Status</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin, idx) => (
                      <tr key={admin.id}>
                        <td className="SAMTdCenter">{idx + 1}</td>
                        <td className="SAMEmailCell">{admin.email}</td>
                        <td>{admin.invitation_date || <span className="SAMEmpty">—</span>}</td>
                        <td>{admin.expiration_date || <span className="SAMEmpty">—</span>}</td>
                        <td>
                          <SAMStatusBadge status={admin.status} />
                        </td>
                        <td>
                          <SAMActionDropdown
                            admin={admin}
                            isOpen={activeDropdownId === admin.id}
                            toggleDropdown={() =>
                              setActiveDropdownId(
                                activeDropdownId === admin.id ? null : admin.id
                              )
                            }
                            onAction={(type) => openConfirm(type, admin.id)}
                            onView={() => setViewAdmin(admin)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="SAMNoResults">
                        No superadmin records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Superadmin Modal */}
      <AddSuperadminModal
        open={addModalOpen}
        onClose={handleAddModalClose}
      />

      {/* Action Confirmation Modal */}
      <SAMConfirmModal
        open={confirmModal.open}
        actionType={confirmModal.actionType}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {/* View Details Modal */}
      <ViewAdminModal
        open={!!viewAdmin}
        admin={viewAdmin}
        onClose={() => setViewAdmin(null)}
      />
    </div>
  );
}