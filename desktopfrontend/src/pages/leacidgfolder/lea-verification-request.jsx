import { useState } from 'react';
import './lea-css.css'
import LeaSideBar from './lea-sidebar'
import TopBar from '../component/top-bar'
import WaitingICon from '../../images/waiting_img.png'
import ReminderBtnIcon from '../../images/reminder_img.png'
import ComposeRequestIcon from '../../images/compose_img.png'
import ConfirmReturnIcon from '../../images/confirmreturn_img.png'
import UnregisteredIcon from '../../images/unregistered_img.png'

function LeaVerificationRequest(){
    
    //FOR BUTTON TABS ON VERIFICATION REQUEST
    const [activeTab, setActiveTab] = useState('Ready to Send');
    const tabs = ['Ready to Send', 'Awaiting FDA', 'FDA Response'];
    const handleTabClick =(tabName)=>{
        if (activeTab === tabName) return;

        if(!document.startViewTransition){
            setActiveTab(tabName);
            return;
        }
        document.startViewTransition(()=>{
            setActiveTab(tabName);
        })

    }

    return(
        <div className='LeaDashboardMain'>
            <LeaSideBar />
            <div className='LeaContentContainer'>
                <TopBar />
                <div className='LeaMainfeed'>
                <div className='LeaHeader'>
                    <div>
                        <p>LEA-CIDG: VERIFICATION REQUEST</p>
                        <p>SEND & TRACK FDA VERIFICATION REQUEST</p>
                    </div>
                </div>
                <div>
                    <div className="VerificationContainer">
                    
                        <div className="VerificationTabs">
                            <div className='VerificationTabsButton'>
                                {tabs.map((tabName)=>(
                                    <button key={tabName} className={`ButtonTab ${activeTab === tabName ?  'active' : ''}`} onClick={() => handleTabClick(tabName)}>{tabName}</button>
                                ))}
                            </div>
                        </div>

                        <div className='VerificationTabContent ReadySendButtonContent'>
                            {activeTab === 'Ready to Send' && 
                            <div className="VerificationContent">
                                {/* LEFT PANEL */}
                                <div className="ReadytoSendQueue">
                                    <div className="ReadytoSendHeader">
                                        <p>Walk-in cases awaiting your request</p>
                                        <span>1</span> {/*walk in cases count need backend*/}
                                    </div>

                                    <div className="QueueCard ActiveQueueCard" id=''>
                                        <div className='QueueLabels'>
                                            <h4>HerbalSlim Capsules</h4>
                                            <p>NatureFit Labs</p>
                                            <small>
                                                ICM-2025-00185 · 2026-05-17 10:42
                                            </small>
                                        </div>
                                        
                                        <div className="QueueTag">
                                            <span>Walk-in</span>
                                        </div>

                                        
                                    </div>

                                </div>

                                {/* RIGHT PANEL */}
                                <div className="VerificationDetails">
                                    <div className="VerificationCard">
                                        <div>
                                            <small>ICM-2025-00185</small>
                                            <h2>HerbalSlim Capsules</h2>
                                            <p>NatureFit Labs</p>

                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    <p>M. Reyes</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    <p>Supplement</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    <p>2026-05-17 10:42</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    <p>Walk-in Intake</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="VerificationRequestCard">
                                            <div className="CaseInfoTitle">
                                                <img src={ComposeRequestIcon} alt="icon for verification request" /><h2>Compose verification request to FDA</h2>
                                            </div>
                                            <p>
                                                Ask FDA to confirm whether the product or manufacturer is
                                                registered. Your intake evidence is attached automatically.
                                            </p>

                                            <div className="VerificationRow">
                                                <div>
                                                    <label>Product code (if known)</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Barcode / lot number"
                                                    />
                                                </div>

                                                <div>
                                                    <label>Priority</label>
                                                    <select>
                                                        <option>Standard (48 hours)</option>
                                                        <option>Urgent (24 hours)</option>
                                                        <option>Critical</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="VerificationNotes">
                                                <label>Notes to FDA verifier</label>

                                                <textarea
                                                    rows="5"
                                                    placeholder="Enter notes for FDA verification..."
                                                    defaultValue="Complainant alleges the product was sold without FDA markings. Please confirm registration status of product and manufacturer."
                                                ></textarea>
                                            </div>

                                
                                            <div className="AttachedFiles">
                                                <h4>Auto-attached from intake</h4>
                                                <p>
                                                    LEA_intake_form_signed.pdf ·
                                                    consumer_id_redacted.jpg ·
                                                    product_photo_front.jpg ·
                                                    purchase_receipt.pdf
                                                </p>
                                            </div>
                            
                                            <div className="VerificationActions">
                                                <button className="DraftButton">
                                                    Save Draft
                                                </button>
                                                <button className="SendReqBtn">
                                                    Send Request to FDA
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>}

                            {/* */}
                            {activeTab === 'Awaiting FDA' && 
                            <div className='VerificationContent AwaitingButtonContent'>
                                {/* LEFT PANEL */}
                                <div className="AwaitingFDAQueue">
                                    <div className="AwaitingHeader">
                                        <p>Request Pending FDA Review</p>
                                        <span>1</span> {/*walk in cases count need backend*/}
                                    </div>

                                    <div className="QueueCard ActiveQueueCard" id=''>
                                        <div>
                                            <h4>HerbalSlim Capsules</h4>
                                            <p>NatureFit Labs</p>
                                            <small>
                                                ICM-2025-00185 · 2026-05-17 10:42
                                            </small>
                                        </div>
                    
                                        <div className="QueueTag">
                                            <span>Walk-in</span>
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT PANEL */}
                                <div className="VerificationDetails">
                                    <div className="VerificationCard">
                                        <div>
                                            <small>ICM-2025-00185</small>
                                            <h2>HerbalSlim Capsules</h2>
                                            <p>NatureFit Labs</p>

                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    <p>M. Reyes</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    <p>Supplement</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    <p>2026-05-17 10:42</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    <p>Walk-in Intake</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='UpdateForResponse'>
                                            <div className='StatusTitle'>
                                                <div className='TitleHolder'>
                                                    <div className='WaitingIconBox'><img src={WaitingICon} alt="icon for waiting response" /></div>
                                                    <div><h3>Awaiting FDA Response</h3></div>
                                                </div>
                                                <p>Request sent 2026-05-18 08:10. FDA verifier will respond with a digital confirmation of registration status.</p>
                                            </div>
                                            <div className='ButtonsForResponse'>
                                                <button className='SendReminderBtn'>
                                                    <img src={ReminderBtnIcon} alt="" />
                                                    <p>Send Reminder</p>
                                                </button>
                                                <button className='RecallRequestBtn'>Recall Request</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                            </div>}

                            {activeTab === 'FDA Response' && 
                            <div className='VerificationContent FDAResponseButtonContent'>
                                {/* LEFT PANEL */}
                                <div className="FDAResponseQueue">
                                    <div className="FDAResponseHeader">
                                        <p>Request Pending FDA Review</p>
                                        <span>1</span> {/*walk in cases count need backend*/}
                                    </div>

                                    <div className="QueueCard ActiveQueueCard" id=''>
                                        <div>
                                            <h4>HerbalSlim Capsules</h4>
                                            <p>NatureFit Labs</p>
                                            <small>
                                                ICM-2025-00185 · 2026-05-17 10:42
                                            </small>
                                        </div>
                                        <div className="ResponseQueueTag">
                                            <span>Unregistered</span>
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT PANEL */}
                                <div className='VerificationDetails'>
                                   <div className='VerificationCard'>
                                        <div>
                                        <small>ICM-2025-00185</small>
                                        <h2>HerbalSlim Capsules</h2>
                                        <p>NatureFit Labs</p>

                                            <div className="CaseInfoGrid">
                                                <div>
                                                    <label>Complainant</label>
                                                    <p>M. Reyes</p>
                                                </div>

                                                <div>
                                                    <label>Cetegory</label>
                                                    <p>Supplement</p>
                                                </div>

                                                <div>
                                                    <label>Logged</label>
                                                    <p>2026-05-17 10:42</p>
                                                </div>

                                                <div>
                                                    <label>Source</label>
                                                    <p>Walk-in Intake</p>
                                                </div>
                                            </div>
                                    </div>

                                        <div className='ConfirmationReturned'>
                                                <div className='ConfirmationReturnedBox'>
                                                    <img src={ConfirmReturnIcon} alt="icon for FDA digital confirmation received" />
                                                    <div className='StatementReturn'>
                                                        <h3>FDA digital confirmation received</h3>
                                                        <p>Returned 2026-05-17 16:02 · sent 2026-05-17 14:33</p>
                                                    </div> 
                                                </div>
                                                <div className='ResponseBox'>
                                                    <div className='ResponseStatus'>
                                                        <img src={UnregisteredIcon} alt="Unregistered icon" />
                                                        <h4>Unregistered — not in FDA registry</h4>
                                                    </div>
                                                    <p className='ReasonDetail'>No CPR or LTO found for manufacturer. Recommend takedown coordination.</p>
                                                </div>
                                                <div className='ResponseUpdateBox'>
                                                    <h6>Field operation status update</h6>
                                                    <textarea name="" id="" placeholder="Operation conducted at seller's address on 2026-05-18. Product siezed, takedown notice served."></textarea>
                                                </div>
                                                <div className='ResponseBtn'>
                                                    <button>Marked takedown initiated</button>
                                                </div>
                                                

                                        </div>
                                   </div>

                                </div>
                            </div>}

                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
export default LeaVerificationRequest