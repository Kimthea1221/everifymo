import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './lea-css.css';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';
import { PenLine, Trash2, Info } from 'lucide-react';


function GetDraftStatusClass(status) {
    if (status === 'Draft') return 'status-draft';
    if (status === 'Incomplete') return 'status-incomplete';
    return '';
}

function LeaSavedDraft() {
    const navigate = useNavigate();

    // Initial mock data as specified in the user request
    const [drafts, setDrafts] = useState([
        {
            id: 'ICM-2025-00201',
            draftType: 'Walk-in Intake',
            productCategory: 'Cosmetics',
            product: 'BioGlow Serum',
            complainant: 'L. Dela Cruz',
            lastEdited: '2026-05-18 14:32',
            savedBy: 'Admin',
            status: 'Incomplete'
        },
        {
            id: 'VR-2025-00122',
            draftType: 'Verification Request',
            productCategory: 'Dietary Supplement',
            product: 'HerbalSlim Capsules',
            complainant: 'M. Reyes',
            lastEdited: '2026-05-18 11:15',
            savedBy: 'Admin',
            status: 'Draft'
        },
        {
            id: 'ICM-2025-00200',
            draftType: 'Walk-in Intake',
            productCategory: 'Drug',
            product: 'PainAway Cream',
            complainant: 'R. Tan',
            lastEdited: '2026-05-17 16:48',
            savedBy: 'Admin',
            status: 'Draft'
        }
    ]);

    // States for filter and search controls
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Walk-in Intake', 'Verification Request'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Draft', 'Incomplete'
    const [sortOption, setSortOption] = useState('Recently Edited'); // 'Recently Edited', 'Oldest First', 'Product Name'
    
    // States for Modals and Toast notifications
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleClearFilters = () => {
        setActiveTab('All');
        setSearchQuery('');
        setStatusFilter('All');
        setSortOption('Recently Edited');
    };

    const handleDeleteClick = (draft) => {
        setDraftToDelete(draft);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (draftToDelete) {
            setDrafts(drafts.filter(d => d.id !== draftToDelete.id));
            setShowDeleteModal(false);
            setDraftToDelete(null);
            showToast('Draft deleted successfully');
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 2000);
    };

    const handleEditDraft = (draft) => {
        showToast(`Loading draft ${draft.id} for ${draft.product}...`);
        setTimeout(() => {
            if (draft.draftType === 'Walk-in Intake') {
                navigate('/leacidgfolder/lea-new-intake');
            } else {
                navigate('/leacidgfolder/lea-verification-request');
            }
        }, 1200);
    };

    // Filtering and sorting calculations
    const filteredDrafts = drafts.filter(draft => {
        // Tab / Type filter
        if (activeTab !== 'All' && draft.draftType !== activeTab) {
            return false;
        }

        // Status filter
        if (statusFilter !== 'All' && draft.status !== statusFilter) {
            return false;
        }

        // Search query filter (Product, Product Category, Case Number, Complainant)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const matchesProduct = draft.product.toLowerCase().includes(query);
            const matchesCategory = draft.productCategory ? draft.productCategory.toLowerCase().includes(query) : false;
            const matchesId = draft.id.toLowerCase().includes(query);
            const matchesComplainant = draft.complainant.toLowerCase().includes(query);
            if (!matchesProduct && !matchesCategory && !matchesId && !matchesComplainant) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        if (sortOption === 'Recently Edited') {
            return new Date(b.lastEdited) - new Date(a.lastEdited);
        } else if (sortOption === 'Oldest First') {
            return new Date(a.lastEdited) - new Date(b.lastEdited);
        } else if (sortOption === 'Product Name') {
            return a.product.localeCompare(b.product);
        }
        return 0;
    });

    return (
        <div className='LeaDashboardMain'>
            <Sidebar sidebarType="LEA" />
            <div className='LeaContentContainer'>
                <TopBar topbarType="LEA" />
                <div className="LeaMainfeed">
                    {/* Page Header */}
                    <div className='LeaHeader'>
                        <div>
                            <p>LEA-CIDG: Saved Drafts</p>
                            <p>SAVED DRAFTS</p>
                         
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="VerificationTabs" style={{ marginBottom: '20px', width: '100%', maxWidth: '1100px', justifySelf: 'center' }}>
                        <div className='VerificationTabsButton'>
                            <button 
                                className={`ButtonTab ${activeTab === 'All' ? 'active' : ''}`} 
                                onClick={() => handleTabClick('All')}
                            >
                                All Drafts
                            </button>
                            <button 
                                className={`ButtonTab ${activeTab === 'Walk-in Intake' ? 'active' : ''}`} 
                                onClick={() => handleTabClick('Walk-in Intake')}
                            >
                                Walk-in Intake
                            </button>
                            <button 
                                className={`ButtonTab ${activeTab === 'Verification Request' ? 'active' : ''}`} 
                                onClick={() => handleTabClick('Verification Request')}
                            >
                                Verification Request
                            </button>
                        </div>
                    </div>

                    {/* Filter & Search Section */}
                    <div className="DraftsFilterSection">
                        <div className="DraftsFilterControls">
                            <input
                                type="text"
                                className="DraftsSearchInput"
                                placeholder="Search by Product Name or Product Category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <select
                                className="DraftsFilterDropdown"
                                value={activeTab}
                                onChange={(e) => handleTabClick(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Walk-in Intake">Walk-in Intake</option>
                                <option value="Verification Request">Verification Request</option>
                            </select>

                            <select
                                className="DraftsFilterDropdown"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Draft">Draft</option>
                                <option value="Incomplete">Incomplete</option>
                            </select>

                            <select
                                className="DraftsFilterDropdown"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="Recently Edited">Recently Edited</option>
                                <option value="Oldest First">Oldest First</option>
                                <option value="Product Name">Product Name (A–Z)</option>
                            </select>

                            <button className="BtnClearFilters" onClick={handleClearFilters}>
                                Clear Filters
                            </button>
                        </div>

                        <div className="DraftsTotalCount">
                            Total Drafts: {filteredDrafts.length}
                        </div>
                    </div>

                    {/* Draft List Layout */}
                    {filteredDrafts.length > 0 ? (
                        <div className='TableCard'>
                            <table className='ComplaintsTable'>
                                <thead>
                                    <tr>
                                        <th>DRAFT TYPE</th>
                                        <th>PRODUCT CATEGORY</th>
                                        <th>PRODUCT NAME</th>
                                        <th>COMPLAINANT</th>
                                        <th>LAST EDITED</th>
                                        <th>SAVED BY</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDrafts.map((draft) => (
                                        <tr key={draft.id}>
                                            <td style={{ fontWeight: '600', color: '#13213C' }}>{draft.draftType}</td>
                                            <td>{draft.productCategory}</td>
                                            <td className='ProductName'>{draft.product}</td>
                                            <td>{draft.complainant}</td>
                                            <td>{draft.lastEdited}</td>
                                            <td>{draft.savedBy}</td>
                                            <td>
                                                <span className={`StatusBadge ${GetDraftStatusClass(draft.status)}`}>
                                                    {draft.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="TableActionsCell">
                                                    <button 
                                                        className="BtnTableEdit"
                                                        onClick={() => handleEditDraft(draft)}
                                                    >
                                                        <PenLine className="BtnEditIcon" size={16} /> Edit Draft
                                                    </button>
                                                    <button 
                                                        className="BtnTableDelete"
                                                        onClick={() => handleDeleteClick(draft)}
                                                        title="Delete Draft"
                                                    >
                                                        <Trash2 className="BtnDeleteIcon" size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="EmptyStateContainer">
                            <div className="EmptyStateIcon">📂</div>
                            <h3 className="EmptyStateTitle">No saved drafts yet</h3>
                            <p className="EmptyStateMessage">
                                You haven't saved any drafts.<br />
                                Any complaint or verification request you save as a draft will appear here.
                            </p>
                            <span 
                                className="EmptyStateLink" 
                                onClick={() => navigate('/leacidgfolder/lea-new-intake')}
                            >
                                Create New Complaint
                            </span>
                        </div>
                    )}

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && draftToDelete && (
                <div className='ModalOverlay'>
                    <div className='ModalBox'>
                        <h3>Confirm Delete</h3>
                        <p>
                            Are you sure you want to delete the draft for <strong>{draftToDelete.product}</strong> ({draftToDelete.id})? This action cannot be undone.
                        </p>
                        <div className='ModalActions'>
                            <button className='BtnCancelModal' onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className='BtnConfirmDelete' onClick={handleConfirmDelete}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    background: '#1B2746',
                    color: '#FDFDFD',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span><Info className="BtnInfoIcon" size={18} /></span> {toastMessage}
                </div>
            )}
        </div>
    );
}

export default LeaSavedDraft;

