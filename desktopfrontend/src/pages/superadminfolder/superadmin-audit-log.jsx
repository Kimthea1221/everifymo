import './superadmin-css.css'
import SuperadminSidebar from './superadmin-sidebar'
import TopBar from '../component/top-bar'

function SuperAdminAuditLog() {
    return (
        <div className='SuperadminMainContainer'>
            <SuperadminSidebar />
            <div className='SuperadminContentContainer'>
                <TopBar />
                <div className='SuperadminMainfeed'>
                    <h2>Audit Logs</h2>
                    <p>Audit logs will be displayed here.</p>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminAuditLog
