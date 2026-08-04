import './superadmin-css.css';
import { useState, useEffect, useRef } from 'react';
import { Send, UserCheck, UserX, RefreshCw, TriangleAlert, CircleCheckBig, Mail, Eye, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';

// helper to provide auth token for API calls
function getAuthToken() {
  return localStorage.getItem('access_token') || localStorage.getItem('authToken') || localStorage.getItem('token') || '';
}

const STATUS_META = {
  Pending: { label: 'Pending', className: 'badge-pending' },
  Invited: { label: 'Pending', className: 'badge-pending' },
  'Invite Requested': { label: 'Pending', className: 'badge-pending' },
  'For Activation': { label: 'For Activation', className: 'badge-for-activation' },
  'Pending Approval': { label: 'For Activation', className: 'badge-for-activation' },
  Active: { label: 'Active', className: 'badge-active' },
  Suspended: { label: 'Suspended', className: 'badge-suspended' },
  'Link Expired': { label: 'Link Expired', className: 'badge-expired' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, className: '' };
  return <span className={`UMStatusBadge ${meta.className}`}>{meta.label}</span>;
}

function UserMgmtActionDropdown({ user, isOpen, toggleDropdown, onAction, onView }) {
  const [openUpward, setOpenUpward] = useState(false);
  const triggerRef = useRef(null);

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
    <div className={`UserMgmtDropdownWrapper ${isOpen ? 'active-open' : ''}`}>
      <button
        className="UserMgmtViewBtn"
        data-tooltip="View Details"
        title="View Details"
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      >
        <Eye size={15} />
      </button>

      <button
        ref={triggerRef}
        className="UserMgmtDropdownTrigger"
        data-tooltip="Actions"
        title="More Actions"
        onClick={handleToggle}
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div className={`UserMgmtDropdownMenu ${openUpward ? 'open-upward' : ''}`}>
          {['Invited', 'Pending', 'Invite Requested', 'Link Expired'].includes(user.display_status || user.status) && (
            <button
              className="UserMgmtDropdownItem"
              onClick={() => {
                onAction('resend');
                toggleDropdown();
              }}
            >
              <Send size={14} /> Resend Link
            </button>
          )}

          {user.status === 'Pending Approval' && (
            <button
              className="UserMgmtDropdownItem"
              onClick={() => {
                onAction('activate');
                toggleDropdown();
              }}
            >
              <UserCheck size={14} /> Activate Account
            </button>
          )}

          {user.status === 'Active' && (
            <button
              className="UserMgmtDropdownItem"
              onClick={() => {
                onAction('suspend');
                toggleDropdown();
              }}
            >
              <UserX size={14} /> Suspend Account
            </button>
          )}

          {user.status === 'Suspended' && (
            <>
              <button
                className="UserMgmtDropdownItem"
                onClick={() => {
                  onAction('reactivate');
                  toggleDropdown();
                }}
              >
                <RotateCcw size={14} /> Reactivate Account
              </button>
              <div className="UserMgmtDropdownDivider" />
              <button
                className="UserMgmtDropdownItem danger"
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
    title: 'Resend Registration Link',
    message: 'Are you sure you want to resend the registration link to this user?',
    confirmLabel: 'Resend',
  },
  activate: {
    title: 'Activate Account',
    message: 'Are you sure you want to activate this account? The user will receive access to the system.',
    confirmLabel: 'Activate',
  },
  suspend: {
    title: 'Suspend Account',
    message: 'Are you sure you want to suspend this account? The account will temporarily lose access to the system.',
    confirmLabel: 'Suspend',
  },
  reactivate: {
    title: 'Reactivate Account',
    message: 'Are you sure you want to reactivate this account? The account will regain access to the system.',
    confirmLabel: 'Reactivate',
  },
  delete: {
    title: 'Delete Account',
    message: 'Are you sure you want to delete this account? The suspended account will be permanently deleted and this action cannot be undone.',
    confirmLabel: 'Delete',
  },
};

function ConfirmModal({ open, actionType, onConfirm, onCancel }) {
  if (!open) return null;
  const meta = CONFIRM_MESSAGES[actionType] || {};
  return (
    <div className="UMModalOverlay">
      <div className="UMModal UMConfirmModal">
        <div className="UMConfirmIcon">
          {actionType === 'suspend' || actionType === 'delete' ? (
            <TriangleAlert size={40} color="#D97706" strokeWidth={3} />
          ) : actionType === 'activate' || actionType === 'reactivate' ? (
            <CircleCheckBig size={40} color="#149660ff" strokeWidth={3} />
          ) : (
            <Mail size={40} color="#07338dff" strokeWidth={3} />
          )}
        </div>
        <h3 className="UMModalTitle">{meta.title}</h3>
        <p className="UMConfirmMessage">{meta.message}</p>
        <div className="UMModalFooter">
          <button className="UMCancelBtn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`UMConfirmBtn ${actionType === 'suspend' || actionType === 'delete' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
          >
            {meta.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddPersonnelModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('');
  const [agency, setAgency] = useState('');
  const [regions, setRegions] = useState([]);

  const [emailError, setEmailError] = useState('');
  const [regionError, setRegionError] = useState('');
  const [agencyError, setAgencyError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetch('http://127.0.0.1:8000/regions')
        .then((res) => res.json())
        .then((data) => setRegions(data))
        .catch((err) => console.error('Failed to load regions', err));
    }
  }, [open]);

  function handleClose() {
    setEmail('');
    setRegion('');
    setAgency('');

    setEmailError('');
    setRegionError('');
    setAgencyError('');

    setSuccessMsg('');
    setSending(false);

    onClose(null);
  }

  async function handleSend() {
    setEmailError('');
    setRegionError('');
    setAgencyError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!region) {
      setRegionError('Please select a region.');
      return;
    }

    if (!agency) {
      setAgencyError('Please select an agency.');
      return;
    }

    setSending(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ email, region_id: region, role: agency }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send invite.');
      }

      setSending(false);
      setSuccessMsg(`Registration link has been sent to ${email}`);
    } catch (err) {
      setSending(false);
      setEmailError(err.message);
    }
  }

  function handleDone() {
    onClose({
      email,
      region,
      agency,
    });

    setEmail('');
    setRegion('');
    setAgency('');

    setEmailError('');
    setRegionError('');
    setAgencyError('');

    setSuccessMsg('');
    setSending(false);
  }

  if (!open) return null;

  return (
    <div className="UMModalOverlay">
      <div className="UMModal UMAddModal">
        <div className="UMModalHeader">
          <h3 className="UMModalTitle">Add New Personnel</h3>
          <p className="UMModalSubtitle">
            Enter the email address, region, and agency of the new personnel.
            They will receive a registration link to complete their profile.
          </p>
        </div>

        {!successMsg ? (
          <>
            <div className="UMFormGroup">
              <label className="UMLabel">
                Email Address <span className="UMRequired">*</span>
              </label>

              <input
                type="email"
                className={`UMInput ${emailError ? 'input-error' : ''}`}
                placeholder="e.g. juan.delacruz@agency.gov.ph"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                disabled={sending}
              />

              {emailError && (
                <span className="UMFieldError">
                  {emailError}
                </span>
              )}
            </div>

            <div className="UMRegionAgencyRow">

              <div className="UMFormGroup">
                <label className="UMLabel">
                  Region <span className="UMRequired">*</span>
                </label>

                <select
                  className="UMRegionSelect"
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    setRegionError('');
                  }}
                  disabled={sending}
                >
                  <option value="">Select Region</option>
                  {regions.map((r) => (
                    <option key={r.region_id} value={r.region_id}>
                      {r.region_name}
                    </option>
                  ))}
                </select>

                {regionError && (
                  <span className="UMFieldError">
                    {regionError}
                  </span>
                )}
              </div>

              <div className="UMFormGroup">
                <label className="UMLabel">
                  Agency <span className="UMRequired">*</span>
                </label>

                <select
                  className="UMAgencySelect"
                  value={agency}
                  onChange={(e) => {
                    setAgency(e.target.value);
                    setAgencyError('');
                  }}
                  disabled={sending}
                >
                  <option value="">Select Agency</option>
                  <option value="fda_personnel">FDA</option>
                  <option value="lea_personnel">LEA-CIDG</option>
                </select>

                {agencyError && (
                  <span className="UMFieldError">
                    {agencyError}
                  </span>
                )}
              </div>

            </div>

            <div className="UMModalFooter">
              <button
                className="UMCancelBtn"
                onClick={handleClose}
                disabled={sending}
              >
                Cancel
              </button>

              <button
                className="UMConfirmBtn primary"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send Registration Link'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="UMSuccessBox">
              <div className="UMSuccessIcon">✉️</div>
              <p className="UMSuccessMsg">{successMsg}</p>
            </div>

            <div className="UMModalFooter UMFooterCenter">
              <button
                className="UMConfirmBtn primary"
                onClick={handleDone}
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ViewPersonnelModal({ open, user, onClose }) {
  if (!open || !user) return null;
  const status = user.display_status || user.status;

  return (
    <div className="UMModalOverlay">
      <div className="UMModal UserMgmtViewModal">
        <div className="UMModalHeader">
          <h3 className="UMModalTitle">Personnel Details</h3>
          <p className="UMModalSubtitle">Viewing profile information for this user.</p>
        </div>
        <div className="UserMgmtViewDetails">
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Full Name:</span>
            <span className="UserMgmtDetailValue">{user.fullname || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Employee ID:</span>
            <span className="UserMgmtDetailValue">{user.employee_id || user.employeeid || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Email:</span>
            <span className="UserMgmtDetailValue UserMgmtEmail">{user.email}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Agency:</span>
            <span className="UserMgmtDetailValue">{user.agency || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Region:</span>
            <span className="UserMgmtDetailValue">{user.region || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Department:</span>
            <span className="UserMgmtDetailValue">{user.department || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Position:</span>
            <span className="UserMgmtDetailValue">{user.position || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Contact No:</span>
            <span className="UserMgmtDetailValue">{user.contact_number || user.contactno || '—'}</span>
          </div>
          <div className="UserMgmtDetailRow">
            <span className="UserMgmtDetailLabel">Status:</span>
            <span className="UserMgmtDetailValue">
              <StatusBadge status={status} />
            </span>
          </div>
        </div>
        <div className="UMModalFooter UMFooterCenter">
          <button className="UMConfirmBtn primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SuperAdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewUser, setViewUser] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    actionType: '',
    targetId: null,
  });

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!event.target.closest('.UserMgmtDropdownWrapper')) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch('http://127.0.0.1:8000/admin/users', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  function handleAddModalClose(data) {
    setAddModalOpen(false);
    if (data) {
      fetchUsers();
    }
  }

  function openConfirm(actionType, userId) {
    setConfirmModal({ open: true, actionType, targetId: userId });
  }

  async function handleConfirm() {
    const { actionType, targetId } = confirmModal;
    let url = '';
    if (actionType === 'resend') {
      url = `http://127.0.0.1:8000/admin/users/${targetId}/resend`;
    } else if (actionType === 'activate') {
      url = `http://127.0.0.1:8000/admin/users/${targetId}/activate`;
    } else if (actionType === 'suspend') {
      url = `http://127.0.0.1:8000/admin/users/${targetId}/suspend`;
    } else if (actionType === 'reactivate') {
      url = `http://127.0.0.1:8000/admin/users/${targetId}/reactivate`;
    }

    if (url) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        if (!response.ok) {
          const errData = await response.json();
          alert(errData.detail || `Failed to perform action: ${actionType}`);
        } else {
          fetchUsers();
        }
      } catch (error) {
        console.error(`Error performing action ${actionType}:`, error);
      }
    }
    setConfirmModal({ open: false, actionType: '', targetId: null });
  }

  function handleCancelConfirm() {
    setConfirmModal({ open: false, actionType: '', targetId: null });
  }

  const filteredUsers = users.filter((u) => {
    if (statusFilter === 'All') return true;
    return (u.display_status || u.status) === statusFilter;
  });

  return (
    <div className="SuperadminMainContainer">
      <Sidebar sidebarType="SUPER_ADMIN" />
      <div className="SuperadminContentContainer">
        <TopBar topbarType="SUPER_ADMIN" />
        <div className="SuperadminMainfeed">
          <div className="UMPageContainer">
            {/* Page Header */}
            <div className="UMPageHeader">
              <div className="UMPageTitleBlock">
                <h2 className="UMPageTitle">User Management</h2>
                <p className="UMPageSubtitle">
                  Manage personnel accounts — send invites, activate, and control access.
                </p>
              </div>
              <button className="UMAddPersonnelBtn" onClick={() => setAddModalOpen(true)}>
                <span className="UMBtnIcon">＋</span>
                Add New Personnel
              </button>
            </div>

            {/* Stats Row */}
            <div className="UMStatsRow">
              {[
                { label: 'Total Users', value: users.length, className: 'stat-total' },
                {
                  label: 'Active',
                  value: users.filter((u) => (u.display_status || u.status) === 'Active').length,
                  className: 'stat-active',
                },
                {
                  label: 'Pending',
                  value: users.filter((u) => ['Pending', 'Invited', 'Invite Requested', 'Link Expired'].includes(u.display_status || u.status)).length,
                  className: 'stat-pending',
                },
                {
                  label: 'For Activation',
                  value: users.filter((u) => ['For Activation', 'Pending Approval'].includes(u.display_status || u.status)).length,
                  className: 'stat-activation',
                },
                {
                  label: 'Suspended',
                  value: users.filter((u) => (u.display_status || u.status) === 'Suspended').length,
                  className: 'stat-suspended',
                },
              ].map((s) => (
                <div key={s.label} className={`UMStatCard ${s.className}`}>
                  <span className="UMStatValue">{s.value}</span>
                  <span className="UMStatLabel">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="UserMgmtFiltersContainer">
              <span className="UserMgmtFilterLabel">Filter by Status:</span>
              <select
                className="UserMgmtSelectFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Invited">Invited</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Link Expired">Link Expired</option>
              </select>
            </div>

            {/* Table */}
            <div className="UMTableWrapper">
              <table className="UMTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Employee ID</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Contact No.</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => {
                    const userId = user.user_id || user.id;
                    return (
                      <tr key={userId}>
                        <td className="UMTdCenter">{idx + 1}</td>
                        <td>{user.fullname || <span className="UMEmpty">—</span>}</td>
                        <td>{user.employee_id || user.employeeid || <span className="UMEmpty">—</span>}</td>
                        <td className="UMEmailCell">{user.email}</td>
                        <td>{user.department || <span className="UMEmpty">—</span>}</td>
                        <td>{user.position || <span className="UMEmpty">—</span>}</td>
                        <td>{user.contact_number || user.contactno || <span className="UMEmpty">—</span>}</td>
                        <td>
                          <StatusBadge status={user.display_status || user.status} />
                        </td>
                        <td>
                          <UserMgmtActionDropdown
                            user={user}
                            isOpen={activeDropdownId === (user.user_id || user.id)}
                            toggleDropdown={() =>
                              setActiveDropdownId(
                                activeDropdownId === (user.user_id || user.id) ? null : (user.user_id || user.id)
                              )
                            }
                            onAction={(type) => openConfirm(type, user.user_id || user.id)}
                            onView={() => setViewUser(user)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Personnel Modal */}
      <AddPersonnelModal open={addModalOpen} onClose={handleAddModalClose} />

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        actionType={confirmModal.actionType}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {/* View Personnel Modal */}
      <ViewPersonnelModal
        open={!!viewUser}
        user={viewUser}
        onClose={() => setViewUser(null)}
      />
    </div>
  );
}

export default SuperAdminUserManagement;