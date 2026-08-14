import React, { useState, useRef, useEffect } from 'react'
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
  UserCog, // admin management icon
  ScrollText, // audit logs icon
  Menu, // hamburger icon (NEW - responsive sidebar)
} from "lucide-react";

// Images
import CIDGLogo from '../../images/pnp-cidg.jpg'
import FDALogo from '../../images/FDA.png'

const SuperAdminMenuItems = [
    { icon: UsersRound, label: 'User Management', path: '/superadminfolder/superadmin-user-management' },
    { icon: UserCog, label: 'Admin Management', path: '/superadminfolder/superadmin-admin-management' },
    { icon: ScrollText, label: 'Audit Logs', path: '/superadminfolder/superadmin-audit-log' },
]

const FDAMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/fdafolder/fda-dashboard' },
    { icon: FileText, label: 'View Reports', path: '/fdafolder/fda-view-reports' },
    { icon: ShieldCheck, label: 'Verification Queue', path: '/fdafolder/fda-verification' },
    { icon: RefreshCw, label: 'Status Update', path: '/fdafolder/fda-status' },
    { icon: Database, label: 'Product Database', path: '/fdafolder/fda-product-db' },
    {icon: Bookmark, label: 'Saved Drafts', path: '/fdafolder/fda-saved-draft'},
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
  width: 250px;
  height: 100vh;
  background: #1a1a2e;
}

.LeaSidebarTop {
  width: 250px;
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

/* ========================================================== */
/* RESPONSIVE SIDEBAR STYLES (NEW - shared across all workspaces) */
/* ========================================================== */

.SidebarOverlay {
  display: none;
}

.SidebarMobileTrigger {
  display: none;
}

.SidebarHamburgerBtn {
  display: none;
  width: 100%;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 0;
  color: #ffffff;
  border-bottom: 1px solid rgba(253, 253, 253, 0.15);
}
  .SidebarMobileTrigger.IsOpen {
  color: #ffffff;
}

.SidebarHamburgerBtn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* All sidebars smooth transition for width/collapse */
.SuperAdminSidebarMain,
.FdaSidebarMain,
.LeaSidebarMain {
  transition: width 0.25s ease, transform 0.28s ease;
}

/* TABLET: 768px - 1199px -> icon-only collapse */
@media (max-width: 1199px) and (min-width: 768px) {
  .SuperAdminSidebarMain,
  .FdaSidebarMain,
  .LeaSidebarMain {
    width: 76px;
    overflow: visible;
  }

  .SuperAdminSidebarTop,
  .FdaSidebarTop,
  .LeaSidebarTop {
    width: 76px;
    flex-direction: column;
    padding: 14px 6px;
  }

  .SuperAdminSidebarTop p,
  .FdaSidebarTop p,
  .LeaSidebarTop p {
    display: none;
  }

  .FdaSidebarTop img,
  .LeaSidebarTop img {
    width: 32px;
    height: 32px;
  }

  .SidebarHamburgerBtn {
    display: flex;
  }

  .SuperAdminSidebarMenu .MenuLabels,
  .FdaSidebarMenu .FdaMenuLabels,
  .LeaSidebarMain .MenuLabels {
    display: none;
  }

  .SuperAdminSidebarMenu .MenuBtn,
  .FdaSidebarMenu .FdaMenuBtn,
  .LeaSidebarMain .MenuBtn {
    justify-content: center;
    padding: 12px 0;
    position: relative;
  }

  /* keyboard + hover accessible tooltip */
  .SuperAdminSidebarMenu .MenuBtn[data-tooltip]:hover::after,
  .SuperAdminSidebarMenu .MenuBtn[data-tooltip]:focus-visible::after,
  .FdaSidebarMenu .FdaMenuBtn[data-tooltip]:hover::after,
  .FdaSidebarMenu .FdaMenuBtn[data-tooltip]:focus-visible::after,
  .LeaSidebarMain .MenuBtn[data-tooltip]:hover::after,
  .LeaSidebarMain .MenuBtn[data-tooltip]:focus-visible::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 10px;
    background: #111827;
    color: #ffffff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    z-index: 50;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  }

  /* Temporary expand via hamburger (overlay, doesn't shift layout) */
  .SuperAdminSidebarMain.MenuOpen,
  .FdaSidebarMain.MenuOpen,
  .LeaSidebarMain.MenuOpen {
    width: 280px;
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 100;
    box-shadow: 4px 0 16px rgba(0,0,0,0.25);
  }

  .SuperAdminSidebarMain.MenuOpen .SuperAdminSidebarTop,
  .FdaSidebarMain.MenuOpen .FdaSidebarTop,
  .LeaSidebarMain.MenuOpen .LeaSidebarTop {
    width: 280px;
    flex-direction: row;
    padding: 20px 10px;
  }

  .SuperAdminSidebarMain.MenuOpen .SuperAdminSidebarTop p,
  .FdaSidebarMain.MenuOpen .FdaSidebarTop p,
  .LeaSidebarMain.MenuOpen .LeaSidebarTop p {
    display: block;
  }

  .FdaSidebarMain.MenuOpen .FdaSidebarTop img,
  .LeaSidebarMain.MenuOpen .LeaSidebarTop img {
    width: 50px;
    height: 50px;
  }

  .SuperAdminSidebarMain.MenuOpen .MenuLabels,
  .FdaSidebarMain.MenuOpen .FdaMenuLabels,
  .LeaSidebarMain.MenuOpen .MenuLabels {
    display: inline;
  }

  .SuperAdminSidebarMain.MenuOpen .MenuBtn,
  .FdaSidebarMain.MenuOpen .FdaMenuBtn,
  .LeaSidebarMain.MenuOpen .MenuBtn {
    justify-content: flex-start;
    padding: 12px 16px;
  }

  .SuperAdminSidebarMain.MenuOpen .MenuBtn[data-tooltip]:hover::after,
  .FdaSidebarMain.MenuOpen .FdaMenuBtn[data-tooltip]:hover::after,
  .LeaSidebarMain.MenuOpen .MenuBtn[data-tooltip]:hover::after {
    content: none;
  }
}

/* MOBILE: below 768px -> off-canvas drawer */
@media (max-width: 767px) {
  .SidebarMobileTrigger {
    display: flex;
    position: fixed;
    top: 14px;
    left: 14px;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    background: none;
  color: #111827;
    border: none;
    cursor: pointer;
    z-index: 120;
  }

  .SuperAdminSidebarMain,
  .FdaSidebarMain,
  .LeaSidebarMain {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 110;
  }

  .SuperAdminSidebarMain.MenuOpen,
  .FdaSidebarMain.MenuOpen,
  .LeaSidebarMain.MenuOpen {
    transform: translateX(0); 
  }

  .SuperAdminSidebarTop,
  .FdaSidebarTop,
  .LeaSidebarTop {
    width: 280px;
  }

  .SidebarHamburgerBtn {
    display: none;
  }

  .SidebarOverlay.MenuOpen {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 105;
  }
}
`

function Sidebar({ sidebarType, role, agency }) {
    const navigate = useNavigate()
    const location = useLocation()
    const sidebarRef = useRef(null)

    // NEW: controls tablet temporary expand AND mobile off-canvas open (same state, CSS decides the visual meaning per breakpoint)
    const [menuOpen, setMenuOpen] = useState(false)

    // NEW: close the expanded/drawer sidebar when clicking outside it (ignores clicks on the toggle buttons themselves)
    useEffect(() => {
        function handleClickOutside(e) {
            if (!menuOpen) return
            if (sidebarRef.current && sidebarRef.current.contains(e.target)) return
            if (e.target.closest && e.target.closest('.SidebarMobileTrigger, .SidebarHamburgerBtn')) return
            setMenuOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [menuOpen])

    // NEW: auto-close the expanded/drawer sidebar after navigating
    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    function toggleMenu() {
        setMenuOpen((prev) => !prev)
    }

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
                <button
                    className={`SidebarMobileTrigger ${menuOpen ? 'IsOpen' : ''}`}
                    aria-label={menuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
                    onClick={toggleMenu}
                >
                    <Menu size={20} />
                </button>
                <div
                    className={`SidebarOverlay ${menuOpen ? 'MenuOpen' : ''}`}
                    onClick={() => setMenuOpen(false)}
                />
                <div className={`SuperAdminSidebarMain ${menuOpen ? 'MenuOpen' : ''}`} ref={sidebarRef}>
                    <div className='SuperAdminSidebarTop'>
                        <p>ICMDA: Superadmin Workspace</p>
                    </div>
                    <button
                        className='SidebarHamburgerBtn'
                        aria-label={menuOpen ? 'Collapse menu' : 'Expand menu'}
                        onClick={toggleMenu}
                    >
                        <Menu size={20} />
                    </button>
                    <div className='SuperAdminSidebarMenu'>
                        {SuperAdminMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.path}
                                    className={`MenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    data-tooltip={item.label}
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
              <button
                    className={`SidebarMobileTrigger ${menuOpen ? 'IsOpen' : ''}`}
                    aria-label={menuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
                    onClick={toggleMenu}
                >
                    <Menu size={20} />
                </button>
                <div
                    className={`SidebarOverlay ${menuOpen ? 'MenuOpen' : ''}`}
                    onClick={() => setMenuOpen(false)}
                />
                <div className={`FdaSidebarMain ${menuOpen ? 'MenuOpen' : ''}`} ref={sidebarRef}>
                    <div className='FdaSidebarTop'>
                        <div><img src={FDALogo} alt="" /></div>
                        <p>FDA Workspace</p>
                    </div>
                    <button
                        className='SidebarHamburgerBtn'
                        aria-label={menuOpen ? 'Collapse menu' : 'Expand menu'}
                        onClick={toggleMenu}
                    >
                        <Menu size={20} />
                    </button>
                    <div className='FdaSidebarMenu'>
                        {FDAMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.path}
                                    className={`FdaMenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    data-tooltip={item.label}>
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
          <button
                    className={`SidebarMobileTrigger ${menuOpen ? 'IsOpen' : ''}`}
                    aria-label={menuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
                    onClick={toggleMenu}
                >
                    <Menu size={20} />
                </button>
                <div
                    className={`SidebarOverlay ${menuOpen ? 'MenuOpen' : ''}`}
                    onClick={() => setMenuOpen(false)}
                />
                <div className={`LeaSidebarMain ${menuOpen ? 'MenuOpen' : ''}`} ref={sidebarRef}>
                    <div className='LeaSidebarTop'>
                        <div><img src={CIDGLogo} alt="CIDG LOGO" /></div>
                        <p>LEA-CIDG Workspace</p>
                    </div>
                    <button
                        className='SidebarHamburgerBtn'
                        aria-label={menuOpen ? 'Collapse menu' : 'Expand menu'}
                        onClick={toggleMenu}
                    >
                        <Menu size={20} />
                    </button>
                    <div className='LeaSidebarMenu'>
                        {LeaMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.path}
                                    className={`MenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => navigate(item.path)}
                                    data-tooltip={item.label}>
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