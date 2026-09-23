import './superadmin-css.css'
import Sidebar from '../component/sidebar'
import TopBar from '../component/top-bar'

function SuperAdminAuditLog() {
    return (
        <div className='SuperadminMainContainer'>
            <Sidebar sidebarType="SUPER_ADMIN" />
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
