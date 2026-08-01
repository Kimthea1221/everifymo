import './lea-css.css'
import Sidebar from '../component/sidebar'
import TopBar from '../component/top-bar'

import { useState, useEffect } from 'react' // ADDED useEffect: runs code on page load
import { useLocation, useNavigate } from 'react-router-dom' // ADDED: read nav data + redirect

// ADDED — backend URL in one place, so it's easy to update later
const API_BASE = 'http://127.0.0.1:8000'

function LeaNewIntake() {
    const location = useLocation()  // ADDED
    const navigate = useNavigate()  // ADDED

    // ADDED — draftId passed in from Saved Drafts "Edit Draft" click.
    // null = brand new intake, no draft involved.
    const editingDraftId = location.state?.draftId ?? null

    const [files, setFiles] = useState([])

    // ADDED — files already saved on the draft (from backend), separate
    // from `files` (new uploads picked just now)
    const [existingAttachments, setExistingAttachments] = useState([])
    // ADDED — old attachment IDs the officer removed, sent to backend on save
    const [attachmentIdsToRemove, setAttachmentIdsToRemove] = useState([])

    const [loading, setLoading] = useState(false)  // ADDED — disables buttons mid-request

    // ADDED — replaces errorMessage. { message, type: 'error' | 'success' }
    const [toast, setToast] = useState(null)

    // ADDED — one state var per field. Original inputs had none of these
    // (uncontrolled), so React couldn't read or pre-fill them.
    const [fullName, setFullName] = useState('')
    const [contactNumber, setContactNumber] = useState('')
    const [email, setEmail] = useState('')
    const [idType, setIdType] = useState('')
    const [address, setAddress] = useState('')
    const [productName, setProductName] = useState('')
    const [manufacturer, setManufacturer] = useState('')
    const [productCategory, setProductCategory] = useState('')
    const [placeOfPurchase, setPlaceOfPurchase] = useState('')
    const [dateOfPurchase, setDateOfPurchase] = useState('')
    const [amountPaid, setAmountPaid] = useState('')
    const [natureOfComplaint, setNatureOfComplaint] = useState('')

    // ADDED — shows a toast for 3 seconds then auto-clears
    const showToast = (message, type = 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // ADDED — on page load, if editing a draft, fetch it and fill every field
    useEffect(() => {
        if (!editingDraftId) return  // brand new intake — nothing to fetch

        const token = localStorage.getItem('access_token')
        setLoading(true)

        fetch(`${API_BASE}/drafts/walkin/${editingDraftId}`, {
            headers: { authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                // ?? '' = use backend value, or empty string if null/missing
                setFullName(data.full_name ?? '')
                setContactNumber(data.contact_number ?? '')
                setEmail(data.email ?? '')
                setIdType(data.id_type ?? '')
                setAddress(data.address ?? '')
                setProductName(data.product_name ?? '')
                setManufacturer(data.manufacturer ?? '')
                setProductCategory(data.product_category ?? '')
                setPlaceOfPurchase(data.place_of_purchase ?? '')
                setDateOfPurchase(data.date_of_purchase ?? '')
                setAmountPaid(data.amount_paid ?? '')
                setNatureOfComplaint(data.nature_of_complaint ?? '')
                // NOTE: existingAttachments not set here yet — endpoint
                // doesn't return file data yet, flagged separately below
            })
            .catch(() => setErrorMessage('Could not load this draft.'))
            .finally(() => setLoading(false))
    }, [editingDraftId])  // re-run only if editingDraftId changes

    // UNCHANGED
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles([...files, ...Array.from(e.target.files)])
            e.target.value = ""
        }
    }

    // UNCHANGED
    const handleRemoveFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove))
    }

    // ADDED — same idea as handleRemoveFile, but for already-saved files
    const handleRemoveExistingAttachment = (attachmentId) => {
        setExistingAttachments(existingAttachments.filter((a) => a.attachment_id !== attachmentId))
        setAttachmentIdsToRemove([...attachmentIdsToRemove, attachmentId])
    }


    // ADDED — shared by Save-as-Draft and Log-Complaint-Direct, since
    // both send the same fields, just to different URLs
    const buildFormData = () => {
        const formData = new FormData()
        formData.append('full_name', fullName)
        formData.append('contact_number', contactNumber)
        formData.append('email', email)
        formData.append('id_type', idType)
        formData.append('address', address)
        formData.append('product_name', productName)
        formData.append('manufacturer', manufacturer)
        formData.append('product_category', productCategory)
        formData.append('place_of_purchase', placeOfPurchase)
        formData.append('date_of_purchase', dateOfPurchase)
        formData.append('amount_paid', amountPaid)
        formData.append('nature_of_complaint', natureOfComplaint)
        files.forEach((file) => formData.append('files', file))
        return formData
    }

    // ADDED — turns FastAPI's 422 error shape into a readable sentence.
    // FastAPI sends back { detail: [{ loc: [...], msg: "...", ... }, ...] }
    // for validation errors — this reads that array and builds a plain
    // message instead of showing raw JSON or a vague generic string.
    const parseBackendError = async (res) => {
        try {
            const errorData = await res.json()
            if (Array.isArray(errorData.detail)) {
                return errorData.detail.map((e) => e.msg).join(', ')
            }
            return errorData.detail || 'Something went wrong. Please try again.'
        } catch {
            return 'Something went wrong. Please try again.'
        }
    }
    
    // ADDED — POST if new draft, PUT if editing an existing one
    const handleSaveAsDraft = async () => {
        setLoading(true)
        // setErrorMessage('')
        const token = localStorage.getItem('access_token')
        const formData = buildFormData()

        if (editingDraftId) {
            attachmentIdsToRemove.forEach((id) => formData.append('remove_attachment_ids', id))
        }

        const url = editingDraftId
            ? `${API_BASE}/drafts/walkin/${editingDraftId}`
            : `${API_BASE}/drafts/walkin/`
        const method = editingDraftId ? 'PUT' : 'POST'

        try {
            const res = await fetch(url, {
                method,
                headers: { authorization: `Bearer ${token}` },
                body: formData,
            })
            if (!res.ok) {
                showToast(await parseBackendError(res))
                return
            }
            showToast('Draft saved successfully.', 'success')
            navigate('/leacidgfolder/lea-saved-draft')
        } catch (err) {
            showToast(err.message)
        } finally {
            setLoading(false)
        }
    }


    // ADDED — submit endpoint if editing a draft, direct-create endpoint if not
    const handleLogComplaint = async (e) => {
        e.preventDefault()
        
        if (!editingDraftId && files.length === 0) {
        showToast('Please attach at least one file.')
        return
        }

        setLoading(true)
        const token = localStorage.getItem('access_token')

        try {
            let res
            if (editingDraftId) {
                // finishing a draft needs no body — backend already has everything
                res = await fetch(`${API_BASE}/drafts/walkin/${editingDraftId}/submit`, {
                    method: 'POST',
                    headers: { authorization: `Bearer ${token}` },
                })
            } else {
                const formData = buildFormData()
                res = await fetch(`${API_BASE}/complaints/walkin/`, {
                    method: 'POST',
                    headers: { authorization: `Bearer ${token}` },
                    body: formData,
                })
            }

            if (!res.ok) {
                showToast(await parseBackendError(res))
                return
            }
            showToast('Complaint logged successfully.', 'success')
            navigate('/leacidgfolder/lea-walkin-complaints')
        } catch (err) {
            showToast(err.message)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className='LeaDashboardMain'>
            <Sidebar sidebarType="LEA" />
            <div className='LeaContentContainer'>
                <TopBar topbarType="LEA" />
                <div className='LeaMainfeed'>
                    <div className='LeaHeader'>
                        <div>
                            <p>LEA-CIDG: Intake</p>
                            <p>LOG A NEW WALK-IN COMPLAINT</p>
                        </div>
                    </div>

                    <div className='FormForWalkin'>
                       {/* CHANGED — real onSubmit, fires only when "Log Complaint" is clicked */}
                        <form onSubmit={handleLogComplaint}>
                            <div className='FormSection'>
                                <h3>COMPLAINANT DETAILS</h3>
                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Full Name (OPTIONAL)</label>
                                        <input type="text" placeholder='Ex. Juan Dela cruz' 
                                        value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="">Contact (OPTIONAL)</label>
                                        <input type="text" placeholder='Ex. 09XXXXXXXXX'
                                            value={contactNumber}
                                            onChange={(e) => {
                                                const digitsOnly = e.target.value.replace(/\D/g, '')  // strip anything that's not 0-9
                                                setContactNumber(digitsOnly.slice(0, 11))  // cap at 11 characters
                                            }} />
                                    </div>
                                </div>
                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Email (OPTIONAL)</label>
                                        <input type="text" placeholder='consumer@gmail.com' 
                                        value={email} onChange={(e) => setEmail(e.target.value)}/>
                                    </div>

                                    <div>
                                        <label htmlFor="">ID Presented (OPTIONAL)</label>
                                        {/* ADDED real option values matching backend's IdType enum */}
                                        <select value={idType} onChange={(e) => setIdType(e.target.value)}>
                                            <option value="">Select ID Type</option>
                                            <option value="philsys">PhilSys</option>
                                            <option value="passport">Passport</option>
                                            <option value="drivers_license">Driver's License</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>  
                                </div>

                                <label htmlFor="">Address (OPTIONAL)</label>
                                <input type="text" placeholder='Ex. Florida' 
                                    value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>

                            <div className='FormSection'>
                                <h3>REPORTED PRODUCT</h3>
                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Product Name</label>
                                        <input type="text" placeholder='Ex. Herbal Slim' required
                                        value={productName} onChange={(e) => setProductName(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="">Manufacturer/Seller</label>
                                        <input type="text" placeholder='Ex. Naturefit labs' required
                                        value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
                                    </div>

                                </div>
                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Category</label>
                                        <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} required > 
                                            <option value="">Select Category</option>
                                            <option value="Food">Food</option>
                                            <option value="Cosmetics">Cosmetics</option>
                                            <option value="Drugs">Drugs</option>
                                            <option value=" Devices">Radiation and Health Devices</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="">Place of Purchase</label>
                                        <input type="text" placeholder='Public market, online seller etc.' required
                                        value={placeOfPurchase} onChange={(e) => setPlaceOfPurchase(e.target.value)} />
                                    </div>
                                </div>

                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Date of Purchase</label>
                                        <input type="date" placeholder='' required
                                        value={dateOfPurchase} onChange={(e) => setDateOfPurchase(e.target.value)} />
                                    </div>
                                    <div>
                                        <label htmlFor="">Amount Paid (OPTIONAL)</label>
                                        <input type="number" placeholder='500.00' 
                                        step="0.01" // Allows decimal values up to 2 decimal places
                                        min="0" // Optional: Prevents negative amounts
                                        value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
                                    </div>

                                </div>
                            </div>

                            <div className='FormSection'>
                                <h3>Complainant Statement</h3>
                                <label htmlFor="">Nature Of Complaint</label>
                                <textarea rows='5' placeholder='Statement of the complainant.' required
                                value={natureOfComplaint} onChange={(e) => setNatureOfComplaint(e.target.value)}></textarea>
                            </div>

                            <div className='FormSectionAttach'>
                                <h3>Evidence & Attachment</h3>
                                <p>Upload all the photos, receipts, ID Copy, and any supporting documents.</p>
                                <div className='UploadArea'>
                                    <input
                                        type="file"
                                        id="evidenceUpload"
                                        multiple
                                        accept=".jpg,.jpeg,.png,.pdf,.docx"
                                        onChange={handleFileChange}
                                        hidden
                                    />

                                    <label htmlFor="evidenceUpload" className="UploadBox">
                                        <div className="UploadContent">
                                            <span className="UploadIcon">☁</span>
                                            <h4>Drop files or click to upload</h4>
                                            <p> PDF, JPG, PNG · Max 25 MB each</p>
                                        </div>
                                    </label>

                                    {/* ADDED — shows already-saved files when editing a draft */}
                                    {existingAttachments.length > 0 && (
                                        <div className="UploadedFiles">
                                            {existingAttachments.map((attachment) => (
                                                <div key={attachment.attachment_id} className="FileItem">
                                                    <span>📄 {attachment.file_name}</span>
                                                    <button type="button" className="BtnRemoveFile"
                                                        onClick={() => handleRemoveExistingAttachment(attachment.attachment_id)}>
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {files.length > 0 && (
                                        <div className="UploadedFiles">

                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="FileItem"
                                                >
                                                    <span>📄 {file.name}</span>
                                                    <button
                                                        type="button"
                                                        className="BtnRemoveFile"
                                                        onClick={() => handleRemoveFile(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}

                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <button type="button" className='CancelButton' onClick={() => navigate(-1)}>Cancel</button>
                                {/* CHANGED — back to type="button", no required check applies here */}
                                <button type="button" className='DraftButton' disabled={loading} onClick={handleSaveAsDraft}>
                                    {loading ? 'Saving...' : 'Save as Draft'}
                                </button>
                                {/* CHANGED — real type="submit", triggers handleLogComplaint via form onSubmit */}
                                <button type="submit" className='LogButton' disabled={loading}>
                                    {loading ? 'Submitting...' : 'Log Complaint & Queue for FDA'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            {/* ADDED — toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '30px', right: '30px',
                    background: toast.type === 'error' ? '#cc0000' : '#1B2746',
                    color: '#fff', padding: '14px 24px', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}
export default LeaNewIntake