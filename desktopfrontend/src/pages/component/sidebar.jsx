import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, //dashboard icon
  User, //user icon
  ClipboardList, //complaints menu icon
  ShieldCheck, //verification request menu icon
  RefreshCw, //status update menu icon
  Database, //product database menu icon
  LogOut, //logout icon
  FileText, // view reports menu icon
  CirclePlus, //new walk in intake menu icon
  Bookmark, // saved draft menu icon
} from "lucide-react";

// Images
import CIDGLogo from '../../images/pnp-cidg.jpg'
import FDALogo from '../../images/FDA.png'



const SuperAdminMenuItems = [
    { label: 'User Management', path: '/superadminfolder/superadmin-user-management' },
    { label: 'Audit Logs', path: '/superadminfolder/superadmin-audit-log' },
]

const FDAMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/fdafolder/fda-dashboard' },
    { icon: FileText, label: 'View Reports', path: '/fdafolder/fda-view-reports' },
    { icon: ShieldCheck, label: 'Verification Request', path: '/fdafolder/fda-verification' },
    { icon: RefreshCw, label: 'Status Update', path: '/fdafolder/fda-status' },
    { icon: Database, label: 'Product Database', path: '/fdafolder/fda-product-db' },
]

const LeaMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/leacidgfolder/lea-dashboard' },
    { icon: CirclePlus, label: 'New Walk-in Intake', path: '/leacidgfolder/lea-new-intake' },
    { icon: ClipboardList, label: 'Walk-in Complaints', path: '/leacidgfolder/lea-walkin-complaints' },
    { icon: ShieldCheck, label: 'Verification Request', path: '/leacidgfolder/lea-verification-request' },
    { icon: Bookmark, label: 'Saved Drafts', path: '/leacidgfolder/lea-saved-draft' },
]

const sidebarStyles = `
/* SuperAdmin Sidebar Styles                  */

.SuperAdminSidebarMain {
  width: 280px;
  height: 100vh;
  background: #1E293B;
  display: flex;
  flex-direction: column;
  position: relative;
}

.SuperAdminSidebarTop {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 20px 10px;
  color: #fdfdfd;
  font-size: small;
  font-weight: 600;
  border-bottom: 1px solid rgba(253, 253, 253, 0.2);
}

.SuperAdminSidebarMenu {
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 4px;
  align-items: center;
  flex: 1;
}

.SuperAdminSidebarMenu .MenuBtn {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.SuperAdminSidebarMenu .MenuBtn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.SuperAdminSidebarMenu .MenuBtn.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.SuperAdminSidebarBottom {
  width: 280px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  padding: 10px;
  color: #fdfdfd;
  border-top: 1px solid rgba(253, 253, 253, 0.2);
  margin-top: auto;
}

.SuperAdminSidebarUser {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  font-size: 13px;
  justify-content: space-between;
}

.SuperAdminSidebarUser p {
  flex: 1;
  margin: 0;
}

.SuperAdminSidebarUser button {
  background: transparent;
  border: none;
  color: #fdfdfd;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  border-radius: 10px;
}

.SuperAdminSidebarUser button:hover {
  color: #ff4d4f;
  background: rgba(255, 255, 255, 0.1);
}

.SuperAdminSidebarMain .logouticon svg {
  width: 16px;
  height: 16px;
}

.SuperAdminSidebarMain .SidebarUserContainer {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #fff;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.SuperAdminSidebarMain .SidebarUserContainer svg {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

/* ========================================== */
/* FDA Sidebar Styles                         */
/* ========================================== */
.FdaSidebarMain {
  width: 280px;
  height: 100vh;
  background: #1B4332;
}

.FdaSidebarTop {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 10px;
  color: #fdfdfd;
  font-size: small;
  border-bottom: 1px solid rgba(253, 253, 253, 0.2);
}

.FdaSidebarTop img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.FdaSidebarMenu {
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 4px;
  align-items: center;
}

.FdaMenuBtn {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.FdaMenuBtn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.FdaMenuBtn.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.FdaSidebarBottom {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 10px;
  color: #fdfdfd;
  font-size: 10px;
  border-top: 1px solid rgba(253, 253, 253, 0.2);
  position: absolute;
  bottom: 0;
  left: 0;
  margin-bottom: 0;
}

.FdasidebarUser {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 10px;
  color: #fdfdfd;
  font-size: 13px;
  border-bottom: rgba(253, 253, 253, 0.2);
}

.FDASidebarUserContainer {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.FDASidebarUserContainer svg {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.FdaSidebarEndSession {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  padding: 7px;
  color: #fdfdfd;
  border-bottom: rgba(253, 253, 253, 0.2);
}

.FdaSidebarBottom button {
  font-size: 11px;
}

.FdaMenuIcons svg {
  width: 21px;
  height: 21px;
}

.FdaLogoutIcon svg {
  width: 21px;
  height: 21px;
}

/* ========================================== */
/* LEA Sidebar Styles                         */
/* ========================================== */
.LeaSidebarMain {
  width: 280px;
  height: 100vh;
  background: #1a1a2e;
}

.LeaSidebarTop {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 10px;
  color: #fdfdfd;
  font-size: small;
  border-bottom: 1px solid rgba(253, 253, 253, 0.2);
}

.LeaSidebarTop img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.LeaSidebarMenu {
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  gap: 4px;
  align-items: center;
}

.LeaSidebarMain .MenuBtn {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.LeaSidebarMain .MenuBtn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.LeaSidebarMain .MenuBtn.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.LeaSidebarBottom {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 10px;
  color: #fdfdfd;
  font-size: 10px;
  border-top: 1px solid rgba(253, 253, 253, 0.2);
  position: absolute;
  bottom: 0;
  left: 0;
  margin-bottom: 0;
}

.LeaSidebarUser {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 10px;
  color: #fdfdfd;
  font-size: 13px;
  border-bottom: rgba(253, 253, 253, 0.2);
}

.LeaSidebarMain .SidebarUserContainer {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 1px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.LeaSidebarMain .SidebarUserContainer svg {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.LeaSidebarEndSession {
  width: 280px;
  height: fit-content;
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  padding: 7px;
  color: #fdfdfd;
  border-bottom: rgba(253, 253, 253, 0.2);
}

.LeaSidebarBottom button {
  font-size: 11px;
}

.LeaSidebarMain .MenuIcons svg {
  width: 21px;
  height: 21px;
}

.LeaSidebarMain .logouticon svg {
  width: 21px;
  height: 21px;
}
`

function Sidebar({ sidebarType, role, agency }) {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine type to render
    let type = sidebarType
    if (!type) {
        const normalizedRole = (role || '').toUpperCase()
        const normalizedAgency = (agency || '').toUpperCase()
        if (normalizedRole === 'SUPER_ADMIN' || normalizedRole === 'SUPERADMIN') {
            type = 'SUPER_ADMIN'
        } else if (normalizedRole === 'FDA' || normalizedAgency === 'FDA') {
            type = 'FDA'
        } else if (normalizedRole === 'LEA' || normalizedAgency === 'LEA' || normalizedAgency === 'CIDG') {
            type = 'LEA'
        }
    }

    const renderStyles = () => (
        <style dangerouslySetInnerHTML={{ __html: sidebarStyles }} />
    )

    if (type === 'SUPER_ADMIN') {
        return (
            <>
                {renderStyles()}
                <div className='SuperAdminSidebarMain'>
                    <div className='SuperAdminSidebarTop'>
                        <p>ICMDA: Superadmin Workspace</p>
                    </div>
                    <div className='SuperAdminSidebarMenu'>
                        {SuperAdminMenuItems.map((item) => (
                            <button
                                key={item.path}
                                className={`MenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <span className='MenuLabels'>{item.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className='SuperAdminSidebarBottom'>
                        <div className='SuperAdminSidebarUser'>
                            <div className='SidebarUserContainer'>
                                <User />
                            </div>
                            <p>Admin</p>
                            <button>
                                <span className='logouticon'><LogOut /></span>End Session
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (type === 'FDA') {
        return (
            <>
                {renderStyles()}
                <div className='FdaSidebarMain'>
                    <div className='FdaSidebarTop'>
                        <div><img src={FDALogo} alt="" /></div>
                        <p>FDA Workspace</p>
                    </div>
                    <div className='FdaSidebarMenu'>
                        {FDAMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.path}
                                    className={`FdaMenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}>
                                    <span className='FdaMenuIcons'><Icon /></span>
                                    <span className='FdaMenuLabels'>{item.label}</span>
                                </button>
                            )
                        })}
                    </div>
                    <div className='FdaSidebarBottom'>
                        <div className='FdasidebarUser'>
                            <div className='FDASidebarUserContainer'><User /></div>
                            <p>Admin</p>
                        </div>
                        <div className='FdaSidebarEndSession'>
                            <button className='FdaMenuBtn'><span className='FdaLogoutIcon'><LogOut /></span>End Session</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (type === 'LEA') {
        return (
            <>
                {renderStyles()}
                <div className='LeaSidebarMain'>
                    <div className='LeaSidebarTop'>
                        <div><img src={CIDGLogo} alt="CIDG LOGO" /></div>
                        <p>LEA-CIDG Workspace</p>
                    </div>
                    <div className='LeaSidebarMenu'>
                        {LeaMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.path}
                                    className={`MenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}>
                                    <span className='MenuIcons'><Icon /></span>
                                    <span className='MenuLabels'>{item.label}</span>
                                </button>
                            )
                        })}
                    </div>
                    <div className='LeaSidebarBottom'>
                        <div className='LeaSidebarUser'>
                            <div className='SidebarUserContainer'><User /></div>
                            <p>Admin</p>
                        </div>
                        <div className='LeaSidebarEndSession'><button className='MenuBtn'><span className='logouticon'><LogOut /></span>End Session</button></div>
                    </div>
                </div>
            </>
        )
    }

    return null
}

export default Sidebar
