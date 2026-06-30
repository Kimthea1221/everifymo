import './superadmin-css.css';
import { useState } from 'react';
import SuperAdminSidebar from './superadmin-sidebar';
import TopBar from '../component/top-bar';

const DUMMY_USERS = [
  {
    id: 1,
    fullname: 'Maria Santos',
    employeeid: 'EMP-001',
    email: 'maria.santos@gmail.com',
    department: 'Operations',
    position: 'Senior Analyst',
    contactno: '09171234567',
    status: 'Active',
  },
  {
    id: 2,
    fullname: 'Jose Reyes',
    employeeid: 'EMP-002',
    email: 'jose.reyes@gmail.com',
    department: 'Compliance',
    position: 'Compliance Officer',
    contactno: '09281234567',
    status: 'Suspended',
  },
  {
    id: 3,
    fullname: 'Ana Dela Cruz',
    employeeid: '',
    email: 'ana.delacruz@gmail.com',
    department: '',
    position: '',
    contactno: '',
    status: 'For Activation',
  },
  {
    id: 4,
    fullname: '',
    employeeid: '',
    email: 'pending.user@gmail.com',
    department: '',
    position: '',
    contactno: '',
    status: 'Pending',
  },
];

const STATUS_META = {
  Pending: { label: 'Pending', className: 'badge-pending' },
  'For Activation': { label: 'For Activation', className: 'badge-for-activation' },
  Active: { label: 'Active', className: 'badge-active' },
  Suspended: { label: 'Suspended', className: 'badge-suspended' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, className: '' };
  return <span className={`UMStatusBadge ${meta.className}`}>{meta.label}</span>;
}

function ActionButton({ status, onAction }) {
  if (status === 'Pending') {
    return (
      <button className="UMActionBtn btn-resend" onClick={() => onAction('resend')}>
        Resend Link
      </button>
    );
  }
  if (status === 'For Activation') {
    return (
      <button className="UMActionBtn btn-activate" onClick={() => onAction('activate')}>
        Activate
      </button>
    );
  }
  if (status === 'Active') {
    return (
      <button className="UMActionBtn btn-suspend" onClick={() => onAction('suspend')}>
        Suspend
      </button>
    );
  }
  if (status === 'Suspended') {
    return (
      <button className="UMActionBtn btn-reactivate" onClick={() => onAction('reactivate')}>
        Reactivate
      </button>
    );
  }
  return null;
}

const CONFIRM_MESSAGES = {
  resend: {
    title: 'Resend Registration Link',
    message: 'Are you sure you want to resend the registration link to this user?',
    confirmLabel: 'Resend',
  },
  activate: {
    title: 'Activate Account',
    message:
      'Are you sure you want to activate this account? The user will receive an email with their login credentials.',
    confirmLabel: 'Activate',
  },
  suspend: {
    title: 'Suspend Account',
    message:
      'Are you sure you want to suspend this account? The user will lose access to the system.',
    confirmLabel: 'Suspend',
  },
  reactivate: {
    title: 'Reactivate Account',
    message: 'Are you sure you want to reactivate this account?',
    confirmLabel: 'Reactivate',
  },
};

function ConfirmModal({ open, actionType, onConfirm, onCancel }) {
  if (!open) return null;
  const meta = CONFIRM_MESSAGES[actionType] || {};
  return (
    <div className="UMModalOverlay">
      <div className="UMModal UMConfirmModal">
        <div className="UMConfirmIcon">
          {actionType === 'suspend' ? '⚠️' : actionType === 'activate' || actionType === 'reactivate' ? '✅' : '📧'}
        </div>
        <h3 className="UMModalTitle">{meta.title}</h3>
        <p className="UMConfirmMessage">{meta.message}</p>
        <div className="UMModalFooter">
          <button className="UMCancelBtn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`UMConfirmBtn ${actionType === 'suspend' ? 'danger' : 'primary'}`}
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

  const [emailError, setEmailError] = useState('');
  const [regionError, setRegionError] = useState('');
  const [agencyError, setAgencyError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [sending, setSending] = useState(false);

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

  function handleSend() {
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

    // BACKEND:
    // POST /api/superadmin/personnel/invite
    // {
    //   email,
    //   region,
    //   agency
    // }

    setSending(true);

    setTimeout(() => {
      setSending(false);
      setSuccessMsg(`Registration link has been sent to ${email}`);
    }, 800);
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
                  <option value="NCR">NCR</option>
                  <option value="CAR">CAR</option>
                  <option value="Region 1">Region 1</option>
                  <option value="Region 2">Region 2</option>
                  <option value="Region 3">Region 3</option>
                  <option value="Region 4A">Region 4A</option>
                  <option value="MIMAROPA">MIMAROPA</option>
                  <option value="Region 5">Region 5</option>
                  <option value="Region 6">Region 6</option>
                  <option value="Region 7">Region 7</option>
                  <option value="Region 8">Region 8</option>
                  <option value="NIR">NIR</option>
                  <option value="Region 9">Region 9</option>
                  <option value="Region 10">Region 10</option>
                  <option value="Region 11">Region 11</option>
                  <option value="Region 12">Region 12</option>
                  <option value="Region 13">Region 13</option>
                  <option value="BARMM">BARMM</option>
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
                  <option value="FDA">FDA</option>
                  <option value="LEA-CIDG">LEA-CIDG</option>
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

function SuperAdminUserManagement() {
  const [users, setUsers] = useState(DUMMY_USERS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    actionType: '',
    targetId: null,
  });

  let nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;

  function handleAddModalClose(data) {
  setAddModalOpen(false);

  if (data) {
    setUsers((prev) => [
      ...prev,
      {
        id: nextId++,
        fullname: '',
        employeeid: '',
        email: data.email,
        agency: data.agency,
        region: data.region,
        department: '',
        position: '',
        contactno: '',
        status: 'Pending',
      },
    ]);
  }
}

  function openConfirm(actionType, userId) {
    setConfirmModal({ open: true, actionType, targetId: userId });
  }

  function handleConfirm() {
    const { actionType, targetId } = confirmModal;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== targetId) return u;
        if (actionType === 'activate' || actionType === 'reactivate') return { ...u, status: 'Active' };
        if (actionType === 'suspend') return { ...u, status: 'Suspended' };
        return u; // resend → stays Pending
      })
    );
    setConfirmModal({ open: false, actionType: '', targetId: null });
  }

  function handleCancelConfirm() {
    setConfirmModal({ open: false, actionType: '', targetId: null });
  }

  return (
    <div className="SuperadminMainContainer">
      <SuperAdminSidebar />
      <div className="SuperadminContentContainer">
        <TopBar />
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
                  value: users.filter((u) => u.status === 'Active').length,
                  className: 'stat-active',
                },
                {
                  label: 'Pending',
                  value: users.filter((u) => u.status === 'Pending').length,
                  className: 'stat-pending',
                },
                {
                  label: 'For Activation',
                  value: users.filter((u) => u.status === 'For Activation').length,
                  className: 'stat-activation',
                },
                {
                  label: 'Suspended',
                  value: users.filter((u) => u.status === 'Suspended').length,
                  className: 'stat-suspended',
                },
              ].map((s) => (
                <div key={s.label} className={`UMStatCard ${s.className}`}>
                  <span className="UMStatValue">{s.value}</span>
                  <span className="UMStatLabel">{s.label}</span>
                </div>
              ))}
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
                  {users.map((user, idx) => (
                    <tr key={user.id}>
                      <td className="UMTdCenter">{idx + 1}</td>
                      <td>{user.fullname || <span className="UMEmpty">—</span>}</td>
                      <td>{user.employeeid || <span className="UMEmpty">—</span>}</td>
                      <td className="UMEmailCell">{user.email}</td>
                      <td>{user.department || <span className="UMEmpty">—</span>}</td>
                      <td>{user.position || <span className="UMEmpty">—</span>}</td>
                      <td>{user.contactno || <span className="UMEmpty">—</span>}</td>
                      <td>
                        <StatusBadge status={user.status} />
                      </td>
                      <td>
                        <ActionButton
                          status={user.status}
                          onAction={(type) => openConfirm(type, user.id)}
                        />
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
}

export default SuperAdminUserManagement;