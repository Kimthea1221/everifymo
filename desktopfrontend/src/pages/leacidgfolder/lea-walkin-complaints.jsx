import './lea-css.css'
import Sidebar from '../component/sidebar'
import TopBar from '../component/top-bar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'

function GetStatusClass(status){
    switch(status){
        case 'queued':
            return 'status-ready-to-send';

        case 'pending':
            return 'status-pending';

        case 'confirmed_registered':
            return 'status-confirmed-registered';

        case 'confirmed_unregistered':
            return 'status-confirmed-unregistered';

        case 'rejected':
            return 'status-rejected';

        case 'recalled':
            return 'status-recalled';

        default:
            return '';
    }
}
function GetStatusLabel(status){
    switch(status){
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

function LeaWalkinComplaints(){
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
            category: 'Medical Device',
            logged: '2026-05-18 14:45',
        },
        {
            id: 'ICM-2025-00189',
            product: 'Vitamin C Plus',
            manufacturer: 'NutriVital',
            complainant: 'P. Alcantara',
            status: 'rejected',
            category: 'Supplement',
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
        if(selectAll){
            setSelected([])
        } else {
            setSelected(filtered.map(c => c.id))
        }
        setSelectAll(!selectAll)
    }

    const handleSelect = (id) => {
        if(selected.includes(id)){
            setSelected(selected.filter((s) => s !== id))
        } else {
            setSelected([...selected, id])
        }
    }

    const handleDeleteClick = () => {
        if(selected.length === 0) return
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
                <TopBar />
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
                        <input
                            type="text"
                            className="DraftsSearchInput"
                            placeholder="Search Case ID, Product or Complainant..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="DraftsFilterDropdown"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="queued">Queued</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed_registered">Registered</option>
                            <option value="confirmed_unregistered">Unregistered</option>
                            <option value="rejected">Rejected</option>
                            <option value="recalled">Recalled</option>
                        </select>

                        <select
                            className="DraftsFilterDropdown"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Drugs">Drugs</option>
                            <option value="Cosmetics">Cosmetics</option>
                            <option value="Food">Food</option>
                            <option value="Medical Device">Medical Device</option>
                            <option value="Supplement">Supplement</option>
                        </select>
                    </div>
                </div>

                <div className='TableCard'>
                    <table className='ComplaintsTable'>
                        <thead>
                            <tr>
                                <th>
                                    <input type='checkbox'
                                    checked={selectAll}
                                    onChange={handleSelectAll} />
                                </th>
                                <th>CASE ID</th>
                                <th>PRODUCT / BRAND</th>
                                <th>COMPLAINANT</th>
                                <th>STATUS</th>
                                <th>Category</th>
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
                                        <p className='ProductName'>{complaint.product}</p>
                                        <p className='ManufacturerName'>{complaint.manufacturer}</p>
                                    </td>
                                    <td>{complaint.complainant}</td>
                                    <td>
                                        <span className={`StatusBadge ${GetStatusClass(complaint.status)}`}>
                                            {GetStatusLabel(complaint.status)}
                                        </span>
                                    </td>
                                    <td>{complaint.category}</td>
                                    <td>{complaint.logged}</td>
                                    <td>
                                        <button className='BtnView' onClick={() => handleViewButton(complaint)}>View</button>
                                        {complaint.status === 'queued' && (
                                            <button
                                                className="BtnEdit"
                                                onClick={() => handleEditComplaint(complaint)}
                                            >
                                                <Pencil size={16} /> Edit
                                            </button>
                                        )}
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
                                                <span className={`StatusBadge ${GetStatusClass(selectedComplaint.status)}`}>
                                                    {GetStatusLabel(selectedComplaint.status)}
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
                </div>
            </div>
            </div>
        </div>
    )
}

export default LeaWalkinComplaints