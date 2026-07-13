import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react'

const allNotifications = [
    // CIDG notifications
    { 
        id: 1,
        agency: 'lea',
        title: 'New Complaint Logged', 
        message: 'Walk-in intake case #2026-0412 has been successfully created.', 
        time: 'Just now', 
        isRead: false 
    },
    { 
        id: 2,
        agency: 'lea',
        title: 'Verification Approved', 
        message: 'FDA approved the verification request for "Brand A Pharmacy".', 
        time: '2 hours ago', 
        isRead: false 
    },
    { 
        id: 3,
        agency: 'lea',
        title: 'Takedown Request Sent', 
        message: 'Takedown notice forwarded to platforms for verification ID #1049.', 
        time: '1 day ago', 
        isRead: true 
    },
    // FDA notifications
    { 
        id: 4,
        agency: 'fda',
        title: 'New Verification Request', 
        message: 'LEA-CIDG submitted a verification request for product ID #5521.', 
        time: 'Just now', 
        isRead: false 
    },
    { 
        id: 5,
        agency: 'fda',
        title: 'Product Database Updated', 
        message: 'Product database has been updated with 12 new entries.', 
        time: '3 hours ago', 
        isRead: true 
    },
    // Superadmin notifications
    { 
        id: 6,
        agency: 'superadmin',
        title: 'New User Registered', 
        message: 'A new personnel completed registration and is awaiting activation.', 
        time: 'Just now', 
        isRead: false 
    },
    { 
        id: 7,
        agency: 'superadmin',
        title: 'Account Activated', 
        message: 'Personnel account for juan@cidg.gov.ph has been activated.', 
        time: '1 hour ago', 
        isRead: true 
    },
]

function TopBar() {
    const navigate = useNavigate();
    
    // Retrieve agency role
    const agency = localStorage.getItem('agency') || 'lea'
    const normalizedAgency = agency.toLowerCase();
    console.log("TopBar - retrieved agency value from localStorage:", agency, "normalized:", normalizedAgency);

    // Dropdown states
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Refs for clicking outside
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const [notifications, setNotifications] = useState(
        allNotifications.filter(n => n.agency === normalizedAgency)
    )

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleProfileClick = () => {
        setIsProfileOpen(false);
        navigate('/profile-setting');
    };

    const handleLogoutClick = () => {
        setIsProfileOpen(false);
        
        /* 
          BACKEND INTEGRATION:
          Clear user session token, reset auth cookies, and call logout endpoint:
          
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch(err) {
            console.error("Logout API call failed:", err);
          }
          
          localStorage.removeItem('token');
          sessionStorage.clear();
        */
        console.log("Ending personnel session. Redirecting to login...");
        navigate('/login');
    };

    return (
        <>
            <style>{`
                .TopbarContainer {
                    height: 60px;
                    background: #FDFDFD;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 0 24px;
                    border-bottom: 1.5px solid #EDEDED;
                    position: relative;
                    flex-shrink: 0;
                    gap: 20px;
                    box-sizing: border-box;
                }

                .TopbarActions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                /* Notification Trigger */
                .TopbarNotifWrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .TopbarBox {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                    background: #FDFDFD;
                    border: 1.5px solid #EDEDED;
                    color: #1F2937;
                    position: relative;
                }

                .TopbarBox:hover {
                    background: #EDEDED;
                    color: #13213C;
                    transform: translateY(-1px);
                }

                .TopbarBox svg {
                    width: 20px;
                    height: 20px;
                }

                /* Profile Trigger */
                .TopbarProfileWrapper {
                    position: relative;
                }

                .TopbarProfileBox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    padding: 6px 12px;
                    border-radius: 20px;
                    border: 1.5px solid #EDEDED;
                    background: #FDFDFD;
                    transition: all 0.2s ease;
                    user-select: none;
                }

                .TopbarProfileBox:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                }

                .TopbarAvatarCircle {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    color: #FDFDFD;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    border: 1px solid rgba(253, 253, 253, 0.2);
                }

                .TopbarAvatarCircle.agency-fda {
                    background: #1B4332; /* FDA Green */
                }

                .TopbarAvatarCircle.agency-lea {
                    background: #13213C; /* LEA Navy/Blue */
                }

                .TopbarAvatarCircle.agency-superadmin {
                    background: linear-gradient(135deg, #0D9488 0%, #0f766e 100%); /* SuperAdmin Teal */
                }

                .TopbarAvatarCircle svg {
                    width: 14px;
                    height: 14px;
                }

                .TopbarUsername {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: #1F2937;
                }

                .TopbarChevron {
                    color: #94a3b8;
                    transition: transform 0.2s ease;
                }

                .TopbarChevron.open {
                    transform: rotate(180deg);
                    color: #13213C;
                }

                /* Dropdown Banners */
                .TopbarDropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 320px;
                    max-height: 400px;
                    background: #FDFDFD;
                    border: 1.5px solid #EDEDED;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: TopbarDropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .TopbarProfileDropdown {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    width: 200px;
                    background: #FDFDFD;
                    border: 1.5px solid #EDEDED;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    padding: 6px;
                    overflow: hidden;
                    animation: TopbarDropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes TopbarDropdownFade {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .TopNotifTitle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    border-bottom: 1px solid #EDEDED;
                }

                .TopNotifTitle h5 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: #13213C;
                }

                .MarkAllReadBtn {
                    background: none;
                    border: none;
                    color: #13213C;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                }

                .MarkAllReadBtn:hover {
                    background: rgba(252, 163, 17, 0.1);
                    color: #D97706;
                }

                .NotifList {
                    overflow-y: auto;
                    flex: 1;
                }

                .NotifItem {
                    display: flex;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 1px solid #f4f4f4;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    position: relative;
                    align-items: flex-start;
                    text-align: left;
                }

                .NotifItem:hover {
                    background-color: #f8fafc;
                }

                .NotifItem.unread {
                    background-color: rgba(252, 163, 17, 0.05);
                }

                .NotifItem.unread:hover {
                    background-color: rgba(252, 163, 17, 0.1);
                }

                .NotifBadgeDot {
                    width: 7px;
                    height: 7px;
                    background-color: #FCA311;
                    border-radius: 50%;
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                }

                .NotifContent {
                    flex: 1;
                    padding-right: 12px;
                }

                .NotifItemTitle {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1F2937;
                    margin-bottom: 4px;
                }

                .NotifItemMsg {
                    font-size: 11.5px;
                    color: #4b5563;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .NotifItemTime {
                    font-size: 10.5px;
                    color: #9ca3af;
                }

                .EmptyNotif {
                    padding: 32px 16px;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 13px;
                }

                .BellBadge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    background: #b91c1c;
                    color: white;
                    font-size: 9px;
                    font-weight: 700;
                    border-radius: 10px;
                    padding: 1px 4px;
                    min-width: 14px;
                    height: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1.5px solid #FDFDFD;
                }

                /* Dropdown Items styling */
                .TopbarDropdownItem {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 10px 12px;
                    border: none;
                    background: transparent;
                    color: #1F2937;
                    font-size: 13px;
                    font-weight: 550;
                    text-align: left;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.15s ease;
                    font-family: inherit;
                }

                .TopbarDropdownItem:hover {
                    background: #f1f5f9;
                    color: #13213C;
                }

                .TopbarDropdownItem svg {
                    color: #64748b;
                    transition: color 0.15s ease;
                }

                .TopbarDropdownItem:hover svg {
                    color: #13213C;
                }

                .TopbarDropdownItemLogout:hover {
                    background: rgba(185, 28, 28, 0.08);
                    color: #b91c1c;
                }

                .TopbarDropdownItemLogout:hover svg {
                    color: #b91c1c;
                }
            `}</style>

            <div className='TopbarContainer'>
                <div className='TopbarActions'>
                    
                    {/* Profile Dropdown wrapper */}
                    <div className='TopbarProfileWrapper' ref={profileRef}>
                        <div className='TopbarProfileBox' onClick={() => setIsProfileOpen(!isProfileOpen)}>
                            <div className={`TopbarAvatarCircle ${
                                normalizedAgency === 'fda' 
                                    ? 'agency-fda' 
                                    : normalizedAgency === 'superadmin' 
                                        ? 'agency-superadmin' 
                                        : 'agency-lea'
                            }`}>
                                <User />
                            </div>
                            <span className='TopbarUsername'>Admin</span>
                            <ChevronDown size={14} className={`TopbarChevron ${isProfileOpen ? 'open' : ''}`} />
                        </div>

                        {isProfileOpen && (
                            <div className='TopbarProfileDropdown'>
                                {normalizedAgency !== 'superadmin' && (
                                    <button className='TopbarDropdownItem' onClick={handleProfileClick}>
                                        <Settings size={16} />
                                        <span>Profile Settings</span>
                                    </button>
                                )}
                                <button className='TopbarDropdownItem TopbarDropdownItemLogout' onClick={handleLogoutClick}>
                                    <LogOut size={16} />
                                    <span>End Session</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notification wrapper */}
                    <div className='TopbarNotifWrapper' ref={notifRef}>
                        <div className='TopbarBox' onClick={() => setIsNotifOpen(!isNotifOpen)}>
                            <Bell/>
                            {unreadCount > 0 && <span className='BellBadge'>{unreadCount}</span>}
                        </div>

                        {isNotifOpen && (
                            <div className='TopbarDropdown'>
                                <div className='TopNotifTitle'>
                                    <h5>Notifications</h5>
                                    {unreadCount > 0 && (
                                        <button className='MarkAllReadBtn' onClick={handleMarkAllAsRead}>
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                                <div className='NotifList'>
                                    {notifications.length === 0 ? (
                                        <div className='EmptyNotif'>No notifications</div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div 
                                                key={notif.id} 
                                                className={`NotifItem ${notif.isRead ? '' : 'unread'}`}
                                                onClick={() => handleNotificationClick(notif.id)}
                                            >
                                                <div className='NotifContent'>
                                                    <div className='NotifItemTitle'>{notif.title}</div>
                                                    <div className='NotifItemMsg'>{notif.message}</div>
                                                    <div className='NotifItemTime'>{notif.time}</div>
                                                </div>
                                                {!notif.isRead && <div className='NotifBadgeDot'></div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    )
}

export default TopBar;