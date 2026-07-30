import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, //dashboard icon
  ClipboardList, //complaints menu icon
  ShieldCheck, //verification request menu icon
  RefreshCw, //status update menu icon
  Database, //product database menu icon
  FileText, // view reports menu icon
  CirclePlus, //new walk in intake menu icon
  Bookmark, // saved draft menu icon
  UsersRound, // user management icon
  ScrollText, // audit logs icon
} from "lucide-react";

// Images
import CIDGLogo from '../../images/pnp-cidg.jpg'
import FDALogo from '../../images/FDA.png'

const SuperAdminMenuItems = [
    { icon: UsersRound, label: 'User Management', path: '/superadminfolder/superadmin-user-management' },
    { icon: ScrollText, label: 'Audit Logs', path: '/superadminfolder/superadmin-audit-log' },
]

const FDAMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/fdafolder/fda-dashboard' },
    { icon: FileText, label: 'View Reports', path: '/fdafolder/fda-view-reports' },
    { icon: ShieldCheck, label: 'Verification Queue', path: '/fdafolder/fda-verification' },
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
/* SuperAdmin Sidebar Styles*/

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

.FdaMenuIcons svg {
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

.LeaSidebarMain .MenuIcons svg {
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

    //added this for end session button to redirect to login page

    async function handleLogout() {
    const refreshToken = localStorage.getItem('refresh_token');

        try {
            if (refreshToken) {
                await fetch('http://127.0.0.1:8000/auth/token/revoke', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });
            }
        } catch (err) {
            console.error('Failed to revoke session:', err);
            // proceed with logout locally even if the server call fails
        }

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        if (type === 'SUPER_ADMIN') {
            navigate('/');
        } else {
            navigate('/login');
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
                        {SuperAdminMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.path}
                                    className={`MenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                >
                                    <span className='MenuIcons'>{Icon && <Icon />}</span>
                                    <span className='MenuLabels'>{item.label}</span>
                                </button>
                            )
                        })}
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
                </div>
            </>
        )
    }

    return null
}

export default Sidebar
