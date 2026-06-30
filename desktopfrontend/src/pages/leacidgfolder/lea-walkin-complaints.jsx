import './lea-css.css'
import LeaSideBar from './lea-sidebar'
import TopBar from '../component/top-bar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function GetStatusClass(status){
    if(status === 'Pending Verification') return 'status-pending'
    if(status === 'Verified by LEA') return 'status-verified-by-lea'
    if(status === 'Forwarded to NBI') return 'status-forwarded-to-nbi'
    if(status === 'NBI Verified') return 'status-nbi-verified'
    if(status === 'Closed') return 'status-closed'
    if(status === 'For Follow-up') return 'status-for-follow-up'
    return ''
}

function LeaWalkinComplaints(){
    const [complaints, setComplaints] = useState([
        {
            id: 'ICM-2025-00185',
            product: 'HerbalSlim Capsules',
            manufacturer: 'NatureFit Labs',
            complainant: 'M. Reyes',
            status: 'Pending Verification',
            category: 'Drugs',
            logged: '2026-05-17 10:42',
        },
        {
            id: 'ICM-2025-00186',
            product: 'HerbalSlim Capsules',
            manufacturer: 'NatureFit Labs',
            complainant: 'M. Reyes',
            status: 'Pending Verification',
            category: 'Drugs',
            logged: '2026-05-17 10:42',
        }
    ])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [viewModal, setViewModal] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState(null)

    const filtered = complaints.filter((c) =>
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.product.toLowerCase().includes(search.toLowerCase()) ||
        c.complainant.toLowerCase().includes(search.toLowerCase())
    )

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
    const OpenNewIntakePageButton = () =>{
        navigate('/leacidgfolder/lea-new-intake');
    }

    return (
        <div className='LeaDashboardMain LeaWalkinComplaintsMain'>
            <LeaSideBar />
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
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td>{complaint.category}</td>
                                    <td>{complaint.logged}</td>
                                    <td>
                                        <button className='BtnView' onClick={() => handleViewButton(complaint)}>View</button>
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
                                                    {selectedComplaint.status}
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