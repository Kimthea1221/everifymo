import { useRef, useState, useEffect } from 'react'
import ImgNotif from '../../images/notification_img.png'

const allNotifications = [
    // CIDG notifications
    { 
        id: 1,
        agency: 'cidg',
        title: 'New Complaint Logged', 
        message: 'Walk-in intake case #2026-0412 has been successfully created.', 
        time: 'Just now', 
        isRead: false 
    },
    { 
        id: 2,
        agency: 'cidg',
        title: 'Verification Approved', 
        message: 'FDA approved the verification request for "Brand A Pharmacy".', 
        time: '2 hours ago', 
        isRead: false 
    },
    { 
        id: 3,
        agency: 'cidg',
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
    const agency = localStorage.getItem('agency') || 'cidg'
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef(null);

    const [notifications, setNotifications] = useState(
        allNotifications.filter(n => n.agency === agency)
    )

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsOpen(false);
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

    return (
        <>
            <style>{`
                .TopbarContainer {
                    height: 50px;
                    background: #FDFDFD;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding: 0 32px;
                    border-bottom: 1px solid #d8d8d8;
                    position: relative;
                    flex-shrink: 0;
                }

                .TopbarBox {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    position: relative;
                }

                .TopbarBox img {
                    width: 24px;
                    height: 24px;
                    object-fit: contain;
                    transition: transform 0.2s ease;
                }

                .TopbarBox img:hover {
                    transform: scale(1.1);
                }

                .ModalNotification {
                    position: absolute;
                    top: 100%;
                    right: 32px;
                    width: 340px;
                    max-height: 400px;
                    background: #FDFDFD;
                    border: 1px solid #d8d8d8;
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    overflow: hidden;
                }

                .TopNotifTitle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid #EDEDED;
                }

                .TopNotifTitle h5 {
                    margin: 0;
                    font-size: 15px;
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
                    background: rgba(252, 163, 17, 0.12);
                    color: #FCA311;
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
                    background-color: #f5f5f5;
                }

                .NotifItem.unread {
                    background-color: rgba(252, 163, 17, 0.08);
                }

                .NotifItem.unread:hover {
                    background-color: rgba(252, 163, 17, 0.15);
                }

                .NotifBadgeDot {
                    width: 8px;
                    height: 8px;
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
                    color: #030303;
                    margin-bottom: 4px;
                }

                .NotifItemMsg {
                    font-size: 12px;
                    color: #555;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .NotifItemTime {
                    font-size: 11px;
                    color: #999;
                }

                .EmptyNotif {
                    padding: 32px 16px;
                    text-align: center;
                    color: #888;
                    font-size: 13px;
                }

                .BellBadge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: #ff4d4f;
                    color: white;
                    font-size: 9px;
                    font-weight: 700;
                    border-radius: 10px;
                    padding: 1px 5px;
                    min-width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1.5px solid #FDFDFD;
                }
            `}</style>

            <div className='TopbarContainer' ref={modalRef}>
                <div className='TopbarBox' onClick={() => setIsOpen(!isOpen)}>
                    <img src={ImgNotif} alt="Notifications" />
                    {unreadCount > 0 && <span className='BellBadge'>{unreadCount}</span>}
                </div>

                {isOpen && (
                    <div className='ModalNotification'>
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
        </>
    )
}

export default TopBar;