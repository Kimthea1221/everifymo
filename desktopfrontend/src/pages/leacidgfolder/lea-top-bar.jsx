import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import ImgNotif from '../../images/notification_img.png'
import './lea-css.css'

function TopBar(){
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef(null);

    // Dummy notifications state (ready for API backend integration)
    const [notifications, setNotifications] = useState([
        { 
            id: 1, 
            title: 'New Complaint Logged', 
            message: 'Walk-in intake case #2026-0412 has been successfully created.', 
            time: 'Just now', 
            isRead: false 
        },
        { 
            id: 2, 
            title: 'Verification Approved', 
            message: 'FDA approved the verification request for "Brand A Pharmacy".', 
            time: '2 hours ago', 
            isRead: false 
        },
        { 
            id: 3, 
            title: 'Takedown Request Sent', 
            message: 'Takedown notice forwarded to platforms for verification ID #1049.', 
            time: '1 day ago', 
            isRead: true 
        }
    ]);

    // Close notifications modal when clicking outside
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

    return(
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
    )
}
export default TopBar