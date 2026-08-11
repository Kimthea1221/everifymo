// new lea-walkin-complaints.jsx 
import './lea-css.css'
import Sidebar from '../component/sidebar'
import TopBar from '../component/top-bar'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react'

// BACKEND: Status values must match the backend complaint workflow states exactly.
function WcGetStatusClass(status) {
    switch (status) {
        case 'queued':
            return 'WcStatus-queued';

        case 'pending':
            return 'WcStatus-pending';

        case 'confirmed_registered':
            return 'WcStatus-confirmed-registered';

        case 'confirmed_unregistered':
            return 'WcStatus-confirmed-unregistered';

        case 'rejected':
            return 'WcStatus-rejected';

        case 'recalled':
            return 'WcStatus-recalled';

        default:
            return '';
    }
}
function WcGetStatusLabel(status) {
    switch (status) {
        case 'queued':
            return 'Ready to Send';

        case 'pending':
            return 'Pending FDA Verification';

        case 'confirmed_registered':
            return 'Confirmed Registered';

        case 'confirmed_unregistered':
            return 'Confirmed Unregistered';

        case 'rejected':
            return 'Verification Rejected';

        case 'recalled':
            return 'Request Recalled';

        default:
            return status;
    }
}

function LeaWalkinComplaints() {
    // BACKEND:
    // Load complaints from API.
    const [complaints, setComplaints] = useState([
        {
            id: 'ICM-2025-00185',
            product: 'HerbalSlim Capsules',
            manufacturer: 'NatureFit Labs',
            complainant: 'M. Reyes',
            status: 'queued',
            category: 'Drugs',
            logged: '2026-05-17 10:42',
        },
        {
            id: 'ICM-2025-00186',
            product: 'BioGlow Serum',
            manufacturer: 'Aura Cosmetics',
            complainant: 'L. Dela Cruz',
            status: 'pending',
            category: 'Cosmetics',
            logged: '2026-05-17 11:15',
        },
        {
            id: 'ICM-2025-00187',
            product: 'ChocoMax Cereal',
            manufacturer: 'GrainGood Foods',
            complainant: 'J. Santos',
            status: 'confirmed_registered',
            category: 'Food',
            logged: '2026-05-18 09:30',
        },
        {
            id: 'ICM-2025-00188',
            product: 'GlucoMeter Pro',
            manufacturer: 'MedTech Solutions',
            complainant: 'A. Ramos',
            status: 'confirmed_unregistered',
            category: 'Medical Devices',
            logged: '2026-05-18 14:45',
        },
        {
            id: 'ICM-2025-00189',
            product: 'Vitamin C Plus',
            manufacturer: 'NutriVital',
            complainant: 'P. Alcantara',
            status: 'rejected',
            category: 'Drugs',
            logged: '2026-05-19 10:00',
        },
        {
            id: 'ICM-2025-00190',
            product: 'YouthCream Anti-Aging',
            manufacturer: 'GlowSkin Co.',
            complainant: 'S. Lopez',
            status: 'recalled',
            category: 'Cosmetics',
            logged: '2026-05-19 16:20',
        }
    ])
    const [search, setSearch] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('All')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selected, setSelected] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [viewModal, setViewModal] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [singleDeleteTarget, setSingleDeleteTarget] = useState(null)
    const [showSingleDeleteModal, setShowSingleDeleteModal] = useState(false)
    const menuRef = useRef(null)

    // BACKEND:
    // Filter using API query parameters if server-side filtering is implemented.
    const filtered = complaints.filter((c) => {
        const matchesSearch = c.id.toLowerCase().includes(search.toLowerCase()) ||
            c.product.toLowerCase().includes(search.toLowerCase()) ||
            c.complainant.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    })

    const handleSelectAll = () => {
        if (selectAll) {
            setSelected([])
        } else {
            setSelected(filtered.map(c => c.id))
        }
        setSelectAll(!selectAll)
    }

    const handleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((s) => s !== id))
        } else {
            setSelected([...selected, id])
        }
    }

    const handleDeleteClick = () => {
        if (selected.length === 0) return
        setShowModal(true)
    }

    const handleConfirmDelete = () => {
        setComplaints(complaints.filter((c) => !selected.includes(c.id)))
        setSelected([])
        setSelectAll(false)
        setShowModal(false)
    }

    const handleCancelDelete = () => {
        setShowModal(false)
    }

    const handleViewButton = (complaint) => {
        setSelectedComplaint(complaint)
        setViewModal(true)
    }
    const handleCloseViewbutton = () => {
        setViewModal(false)
        setSelectedComplaint(null)
    }

    // Three-dot dropdown: toggle open/close per row
    const handleToggleMenu = (id) => {
        setOpenMenuId((prev) => (prev === id ? null : id))
    }

    // Single-row delete via dropdown
    const handleDropdownDeleteClick = (complaint) => {
        setOpenMenuId(null)
        setSingleDeleteTarget(complaint)
        setShowSingleDeleteModal(true)
    }

    const handleConfirmSingleDelete = () => {
        // BACKEND: call delete API for singleDeleteTarget.id
        setComplaints(complaints.filter((c) => c.id !== singleDeleteTarget.id))
        setSelected(selected.filter((id) => id !== singleDeleteTarget.id))
        setSingleDeleteTarget(null)
        setShowSingleDeleteModal(false)
    }

    const handleCancelSingleDelete = () => {
        setSingleDeleteTarget(null)
        setShowSingleDeleteModal(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        if (openMenuId === null) return
        const handleOutsideClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [openMenuId])

    const navigate = useNavigate();

    const OpenNewIntakePageButton = () => {
        navigate('/leacidgfolder/lea-new-intake');
    };
    const handleEditComplaint = (complaint) => {
        // BACKEND:
        // The selected complaint data should be passed back from the API
        // so the New Intake page opens in Edit Mode.
        // All existing field values must automatically populate
        // their corresponding inputs.

        // BACKEND:
        // When opening Edit mode,
        // return all complaint fields so inputs are automatically pre-filled.
        navigate('/leacidgfolder/lea-new-intake', {
            state: {
                complaint
            }
        });
    };

    return (
        <div className='LeaDashboardMain LeaWalkinComplaintsMain'>
            <Sidebar sidebarType="LEA" />
            <div className='LeaContentContainer'>
                <TopBar topbarType="LEA" />
                <div className='LeaMainfeed LeaWalkinComplaintsFeed'>
                    <div className='LeaHeader'>
                        <div>
                            <p>LEA-CIDG: Walk-in Complaints</p>
                            <p>CITIZEN-REPORTED COMPLAINTS</p>
                        </div>
                        <div className='WalkinButtonActions'>
                            {selected.length > 0 && (
                                <button className='BtnDelete' onClick={handleDeleteClick}>
                                    🗑 Delete ({selected.length})
                                </button>
                            )}
                            <button className='BtnExportCSV'>Export CSV</button>
                            <button className='BtnNewComplaint' onClick={OpenNewIntakePageButton}>New Complaint</button>
                        </div>
                    </div>

                    {/* Filter & Search Section */}
                    <div className="DraftsFilterSection">
                        <div className="DraftsFilterControls">
                            <div className="DraftsFilterLeft">
                                <input
                                    type="text"
                                    className="DraftsSearchInput"
                                    placeholder="Search Case ID, Product or Complainant..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="DraftsFilterRight">
                                <select
                                    className="DraftsFilterDropdown"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="queued">Ready to Send</option>
                                    <option value="pending">Pending FDA Verification</option>
                                    <option value="confirmed_registered">Confirmed Registered</option>
                                    <option value="confirmed_unregistered">Confirmed Unregistered</option>
                                    <option value="rejected">Verification Rejected</option>
                                    <option value="recalled">Request Recalled</option>
                                </select>

                                <select
                                    className="DraftsFilterDropdown"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Cosmetics">Cosmetics</option>
                                    <option value="Food">Food</option>
                                    <option value="Medical Devices">Medical Devices</option>
                                    <option value="Drugs">Drugs</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className='TableCard'>
                        <table className='ComplaintsTable WcComplaintsTable'>
                            <thead>
                                <tr>
                                    <th>
                                        <input type='checkbox'
                                            checked={selectAll}
                                            onChange={handleSelectAll} />
                                    </th>
                                    <th>CASE ID</th>
                                    <th>PRODUCT</th>
                                    <th>MANUFACTURER</th>
                                    <th>COMPLAINANT</th>
                                    <th>STATUS</th>
                                    <th>CATEGORY</th>
                                    <th>LOGGED</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((complaint) => (
                                    <tr key={complaint.id} className={selected.includes(complaint.id) ? 'row-selected' : ''}>
                                        <td>
                                            <input type='checkbox'
                                                checked={selected.includes(complaint.id)}
                                                onChange={() => handleSelect(complaint.id)} />
                                        </td>
                                        <td className='ClassId'>{complaint.id}</td>
                                        <td>
                                            {/* BACKEND: maps to complaint.product field */}
                                            <p className='WcProductName'>{complaint.product}</p>
                                        </td>
                                        <td>
                                            {/* BACKEND: maps to complaint.manufacturer field */}
                                            <p className='WcManufacturerName'>{complaint.manufacturer}</p>
                                        </td>
                                        <td>{complaint.complainant}</td>
                                        <td>
                                            <span className={`WcStatusBadge ${WcGetStatusClass(complaint.status)}`}>
                                                {WcGetStatusLabel(complaint.status)}
                                            </span>
                                        </td>
                                        <td className='WcCategoryCell'>{complaint.category}</td>
                                        <td>{complaint.logged}</td>
                                        <td>
                                            <div className='WcActionCell' ref={openMenuId === complaint.id ? menuRef : null}>
                                                {/* View button — always visible */}
                                                <span className='WcActionTooltipWrap'>
                                                    <button
                                                        className='WcBtnIconView'
                                                        onClick={() => handleViewButton(complaint)}
                                                        aria-label='View complaint'
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <span className='WcTooltip'>View</span>
                                                </span>

                                                {/* Three-dot dropdown — only for queued (Ready to Send) */}
                                                {complaint.status === 'queued' && (
                                                    <div className='WcMenuWrapper'>
                                                        <button
                                                            className='WcBtnIconMore'
                                                            onClick={() => handleToggleMenu(complaint.id)}
                                                            aria-label='More actions'
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                        {openMenuId === complaint.id && (
                                                            <div className='WcDropdownMenu'>
                                                                <button
                                                                    className='WcDropdownItem WcDropdownItem--edit'
                                                                    onClick={() => {
                                                                        setOpenMenuId(null)
                                                                        handleEditComplaint(complaint)
                                                                    }}
                                                                >
                                                                    <Pencil size={14} />
                                                                    Edit Complaint
                                                                </button>
                                                                <button
                                                                    className='WcDropdownItem WcDropdownItem--delete'
                                                                    onClick={() => handleDropdownDeleteClick(complaint)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete Complaint
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className='Pagination'>
                            <p>Showing {filtered.length} of {complaints.length}</p>
                            <div className='PaginationBtn'>
                                <button className='BtnPage'>Previous</button>
                                <button className='BtnPage'>Next</button>
                            </div>
                        </div>
                        {viewModal && selectedComplaint && (
                            <div className='ModalOverlay'>
                                <div className='ModalViewButton'>
                                    <h4>{selectedComplaint.product}</h4>
                                    <div className='ModalSummary'>
                                        <div>
                                            <p><strong>Case ID:</strong> <br></br>{selectedComplaint.id}</p>
                                            <p><strong>Manufacturer:</strong><br></br> {selectedComplaint.manufacturer}</p>
                                            <p><strong>Category:</strong><br></br> {selectedComplaint.category}</p>
                                        </div>
                                        <div>
                                            <p><strong>Complainant:</strong><br></br> {selectedComplaint.complainant}</p>
                                            <p><strong>Logged:</strong><br></br> {selectedComplaint.logged}</p>
                                            <p><strong>Status:</strong> <br></br>
                                                <span className={`WcStatusBadge ${WcGetStatusClass(selectedComplaint.status)}`}>
                                                    {WcGetStatusLabel(selectedComplaint.status)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <h6 className='Statementcomp'>COMPLAINANT STATEMENT</h6>
                                    <div className='StatementBox'>
                                        <p>Example statement....</p>
                                    </div>
                                    <div className='ModalActions'>
                                        <button className='BtnCancelModal' onClick={handleCloseViewbutton}>Close</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showModal && (
                            <div className='ModalOverlay'>
                                <div className='ModalBox'>
                                    <h3>Confirm Delete</h3>
                                    <p>Are you sure you want to delete <strong>{selected.length}</strong> selected complaint{selected.length > 1 ? 's' : ''}? This action cannot be undone.</p>
                                    <div className='ModalActions'>
                                        <button className='BtnCancelModal' onClick={handleCancelDelete}>Cancel</button>
                                        <button className='BtnConfirmDelete' onClick={handleConfirmDelete}>Yes, Delete</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Single-row delete confirmation (from dropdown) */}
                        {showSingleDeleteModal && singleDeleteTarget && (
                            <div className='ModalOverlay'>
                                <div className='ModalBox'>
                                    <h3>Confirm Delete</h3>
                                    <p>Are you sure you want to delete complaint <strong>{singleDeleteTarget.id}</strong>? This action cannot be undone.</p>
                                    <div className='ModalActions'>
                                        <button className='BtnCancelModal' onClick={handleCancelSingleDelete}>Cancel</button>
                                        <button className='BtnConfirmDelete' onClick={handleConfirmSingleDelete}>Yes, Delete</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LeaWalkinComplaints