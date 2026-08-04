import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './lea-css.css';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';
import { PenLine, Trash2, Info } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000'

// CHANGED — checks real backend values now ("draft"/"incomplete",
// lowercase), not the old mock-data capitalized strings
function GetDraftStatusClass(status) {
    if (status === 'draft') return 'status-draft';
    if (status === 'incomplete') return 'status-incomplete';
    return '';
}

// ADDED — backend sends draft_type as "walkin"/"verification"; this
// converts that into the readable label your UI already displays
function GetDraftTypeLabel(draftType) {
    if (draftType === 'walkin') return 'Walk-in Intake';
    if (draftType === 'verification') return 'Verification Request';
    return draftType;
}

function LeaSavedDraft() {
    const navigate = useNavigate();

    // CHANGED — starts empty, filled by a real fetch below instead of mock data
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for filter and search controls
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Walk-in Intake', 'Verification Request'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Draft', 'Incomplete'
    const [sortOption, setSortOption] = useState('Recently Edited'); // 'Recently Edited', 'Oldest First', 'Product Name'
    
    // States for Modals and Toast notifications
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // ADDED — fetches the real combined drafts list on page load
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        fetch(`${API_BASE}/drafts/`, {
            headers: { authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setDrafts(data))
            .catch(() => showToast('Could not load drafts.'))
            .finally(() => setLoading(false));
    }, []);

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

    // CHANGED — actually calls the backend now, using the right
    // endpoint depending on draft_type
    const handleConfirmDelete = async () => {
        if (!draftToDelete) return;

        const token = localStorage.getItem('access_token');
        const endpoint = draftToDelete.draft_type === 'walkin'
            ? `${API_BASE}/drafts/walkin/${draftToDelete.draft_id}`
            : `${API_BASE}/drafts/verification/${draftToDelete.draft_id}`;

        try {
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: { authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to delete draft.');

            setDrafts(drafts.filter((d) => d.draft_id !== draftToDelete.draft_id));
            showToast('Draft deleted successfully');
        } catch (err) {
            showToast(err.message);
        } finally {
            setShowDeleteModal(false);
            setDraftToDelete(null);
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 2000);
    };

    // CHANGED — passes the real draft_id through navigation, so the
    // destination page knows exactly which draft to load
    const handleEditDraft = (draft) => {
        showToast(`Loading draft for ${draft.product_name}...`);
        setTimeout(() => {
            if (draft.draft_type === 'walkin') {
                navigate('/leacidgfolder/lea-new-intake', { state: { draftId: draft.draft_id } });
            } else {
                navigate('/leacidgfolder/lea-verification-request', { state: { draftId: draft.draft_id } });
            }
        }, 1200);
    };

    // Filtering and sorting calculations
    // Filtering and sorting — still done client-side, on the real
    // fetched data now instead of the mock array
    const filteredDrafts = drafts.filter(draft => {
        // Tab / Type filter
        if (activeTab !== 'All' && draft.draft_type !== activeTab) {
            return false;
        }

        // Status filter
        if (statusFilter !== 'All' && draft.draft_status !== statusFilter) {
            return false;
        }

        // Search query filter (EVERY field is checked except save_by)
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const matchesProduct = draft.product_name?.toLowerCase().includes(query) ?? false;
            const matchesCategory = draft.product_category?.toLowerCase().includes(query) ?? false;
            const matchesComplainant = draft.complainant_name?.toLowerCase().includes(query) ?? false;
            const matchesType = GetDraftTypeLabel(draft.draft_type).toLowerCase().includes(query);
            const matchesStatus = draft.draft_status.toLowerCase().includes(query);
            // Formats the date the same readable way it's displayed in the
            // table, so searching "August" or a specific date actually matches
            // what the officer sees on screen
            const matchesDate = new Date(draft.updated_at).toLocaleString().toLowerCase().includes(query);

            if (!matchesProduct && !matchesCategory && !matchesComplainant && !matchesType && !matchesStatus && !matchesDate) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        if (sortOption === 'recently_edited') {
            return new Date(b.updated_at) - new Date(a.updated_at);
        } else if (sortOption === 'oldest_first') {
            return new Date(a.updated_at) - new Date(b.updated_at);
        } else if (sortOption === 'product_name_az') {
            return (a.product_name || '').localeCompare(b.product_name || '');
        }
        return 0;
    });

    return (
        <div className='LeaDashboardMain'>
            <Sidebar sidebarType="LEA" />
            <div className='LeaContentContainer'>
                <TopBar topbarType="LEA" />
                <div className="LeaMainfeed">
                    <div className='LeaHeader'>
                        <div>
                            <p>LEA-CIDG: Saved Drafts</p>
                            <p>SAVED DRAFTS</p>
                        </div>
                    </div>

                    <div className="VerificationTabs" style={{ marginBottom: '20px', width: '100%', maxWidth: '1100px', justifySelf: 'center' }}>
                        <div className='VerificationTabsButton'>
                            <button
                                className={`ButtonTab ${activeTab === 'All' ? 'active' : ''}`}
                                onClick={() => handleTabClick('All')}
                            >
                                All Drafts
                            </button>
                            <button
                                className={`ButtonTab ${activeTab === 'walkin' ? 'active' : ''}`}
                                onClick={() => handleTabClick('walkin')}
                            >
                                Walk-in Intake
                            </button>
                            <button
                                className={`ButtonTab ${activeTab === 'verification' ? 'active' : ''}`}
                                onClick={() => handleTabClick('verification')}
                            >
                                Verification Request
                            </button>
                        </div>
                    </div>

                    <div className="DraftsFilterSection">
                        <div className="DraftsFilterControls">
                            <div className="DraftsFilterLeft">
                                <input
                                    type="text"
                                    className="DraftsSearchInput"
                                    placeholder="Search by Product Name or Product Category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="DraftsFilterRight">
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
                            </div>
                        </div>

                        <div className="DraftsTotalCount">
                            Total Drafts: {filteredDrafts.length}
                        </div>
                    </div>

                    {loading ? (
                        <div className="EmptyStateContainer">
                            <p>Loading drafts...</p>
                        </div>
                    ) : filteredDrafts.length > 0 ? (
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
                                        <tr key={draft.draft_id}>
                                            <td style={{ fontWeight: '600', color: '#13213C' }}>
                                                {GetDraftTypeLabel(draft.draft_type)}
                                            </td>
                                            <td>{draft.product_category}</td>
                                            <td className='ProductName'>{draft.product_name}</td>
                                            <td>{draft.complainant_name}</td>
                                            <td>{new Date(draft.updated_at).toLocaleString()}</td>
                                            <td>{draft.saved_by_name || 'You'}</td>
                                            <td>
                                                <span className={`StatusBadge ${GetDraftStatusClass(draft.draft_status)}`}>
                                                    {draft.draft_status === 'draft' ? 'Draft' : 'Incomplete'}
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
                            Are you sure you want to delete the draft for <strong>{draftToDelete.product_name}</strong>? This action cannot be undone.
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
