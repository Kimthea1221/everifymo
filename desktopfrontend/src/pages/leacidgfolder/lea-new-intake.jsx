import './lea-css.css'
import LeaSideBar from './lea-sidebar'
import TopBar from '../component/top-bar'
import { useState } from 'react'


function LeaNewIntake(){
    const [files, setFiles] = useState([])

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles([...files, ...Array.from(e.target.files)])
            e.target.value = ""
        }
    }

    const handleRemoveFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove))
    }

    return(
        <div className='LeaDashboardMain'>
            <LeaSideBar />
            <div className='LeaContentContainer'>
                <TopBar />
                <div className='LeaMainfeed'>
                    <div className='LeaHeader'>
                        <div>
                            <p>LEA-CIDG: Intake</p>
                            <p>LOG A NEW WALK-IN COMPLAINT</p>
                        </div>
                    </div>
                <div className='FormForWalkin'>
                    <form className=''>
                        <div className='FormSection'>
                            <h3>COMPLAINANT DETAILS</h3>
                            <div className='col'>
                                <div>
                                    <label htmlFor="">Full Name</label>
                                    <input type="text"placeholder='Ex. Juan Dela cruz' />
                                </div>
                                <div>
                                    <label htmlFor="">Contact</label>
                                    <input type="text"placeholder='Ex. 09XXXXXXXXX' />
                                </div>
                            </div>
                            <div className='col'>
                                <div>
                                    <label htmlFor="">Email (OPTIONAL)</label>
                                    <input type="text"placeholder='consumer@gmail.com' />
                                </div>
                                
                                <div>
                                     <label htmlFor="">ID Presented</label>
                                    <select name="selectid" id="">
                                        <option value="">Select ID Type</option>
                                        <option value="">PhilSys</option>
                                        <option value="">Passport</option>
                                        <option value="">Driver's License</option>
                                        <option value="">Other</option>
                                    </select>
                                </div>
                               
                            </div>
                          
                                <label htmlFor="">Address (OPTIONAL)</label>
                                <input type="text"placeholder='Ex. Florida' />
                            
                        </div>

                        <div className='FormSection'>
                                <h3>REPORTED PRODUCT</h3>
                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Product Name</label>
                                        <input type="text"placeholder='Ex. Herbal Slim' />
                                    </div>
                                    <div>
                                        <label htmlFor="">Manufacturer/Seller</label>
                                        <input type="text"placeholder='Ex. Naturefit labs' />
                                    </div>
                                    
                                </div>
                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Category</label>
                                        <select name="selectid" id="">
                                            <option value="">Select Category</option>
                                            <option value="">Food</option>
                                            <option value="">Cosmetics</option>
                                            <option value="">Medical Devices</option>
                                            <option value="">Biological Products</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="">Place of Purchase</label>
                                        <input type="text"placeholder='Public market, online seller etc.' />
                                    </div>
                                </div>

                                <div className='col'>
                                    <div>
                                        <label htmlFor="">Date of Purchase</label>
                                        <input type="date"placeholder='' />
                                    </div>
                                    <div>
                                        <label htmlFor="">Amount Paid (OPTIONAL)</label>
                                        <input type="text"placeholder='500 Pesos' />    
                                    </div>
                                    
                                </div>
                        </div>

                        <div className='FormSection'>
                                <h3>Complainant Statement</h3>
                                <label htmlFor="">Nature Of Complaint</label>
                                <textarea type="text" rows='5' placeholder='Statement of the complainant.'></textarea>      
                        </div>

                        <div className='FormSectionAttach'>
                                <h3>Evidence & Attachment</h3>
                                <p>Upload all the photos, receipts, ID Copy, and any supporting documents.</p>
                                    <div className='UploadArea'>
                                        <input
                                            type="file"
                                            id="evidenceUpload"
                                            multiple
                                            accept=".jpg,.jpeg,.png,.pdf"
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
                            <button className='CancelButton'>Cancel</button>
                            <button className='DraftButton'>Save as Draft</button>
                            <button className='LogButton'>Log Complaint & Queue for FDA</button>
                        </div>
                        
                    </form>
                </div>
            </div>
            </div>
        </div>
    )
}
export default LeaNewIntake