// desktopfrontend/src/pages/component/all-notifications.jsx
import React, { useState, useMemo } from 'react';
import { 
  CheckCheck, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  ClipboardList, 
  UserCheck, 
  ShieldAlert, 
  Database, 
  FileText, 
  Activity, 
  Bell, 
  Clock, 
  CheckCircle2
} from 'lucide-react';
import Sidebar from './sidebar';
import TopBar from './top-bar';

// Load layouts for the respective workspaces
import '../fdafolder/fda-css.css';
import '../leacidgfolder/lea-css.css';
import '../superadminfolder/superadmin-css.css';

/**
 * Helper function to determine the authenticated user's role/agency consistently across workspaces.
 */
const getAuthenticatedUserRole = () => {
  const rawAgency = (
    localStorage.getItem('agency') || 
    localStorage.getItem('role') || 
    'FDA'
  ).toString().trim().toUpperCase();

  if (rawAgency.includes('SUPER')) {
    return 'SUPERADMIN';
  }
  if (rawAgency === 'LEA' || rawAgency === 'CIDG' || rawAgency.includes('LEA') || rawAgency.includes('CIDG')) {
    return 'LEA';
  }
  return 'FDA';
};

/**
 * Realistic Mock Notifications for EverifyMo application.
 */
const INITIAL_NOTIFICATIONS = [
  // --- TODAY ---
  {
    id: 'notif-1',
    title: 'New Consumer Walk-in Complaint Filed',
    message: 'Complaint Reference #CMP-2026-0891 filed regarding suspected unregistered health supplement sold in retail pharmacy.',
    time: '15 minutes ago',
    dateStr: 'Today at 11:20 AM',
    group: 'today',
    isRead: false,
    category: 'Complaint',
    iconType: 'complaint'
  },
  {
    id: 'notif-2',
    title: 'FDA Public Health Advisory Issued',
    message: 'Advisory #2026-042 published for immediate dissemination: Batch verification required on counterfeit cosmetic product lines.',
    time: '1 hour ago',
    dateStr: 'Today at 10:35 AM',
    group: 'today',
    isRead: false,
    category: 'Advisory',
    iconType: 'advisory'
  },
  {
    id: 'notif-3',
    title: 'Verification Request Status Confirmed',
    message: 'LEA-CIDG confirmed physical inspection on Target Entity in Manila District for Case #VER-2026-0182.',
    time: '3 hours ago',
    dateStr: 'Today at 8:45 AM',
    group: 'today',
    isRead: false,
    category: 'Verification',
    iconType: 'verification'
  },
  {
    id: 'notif-4',
    title: 'Browser Extension Report Forwarded',
    message: 'Automated complaint #EXT-2026-1049 submitted from browser extension with seller URL details and digital storefront evidence.',
    time: '5 hours ago',
    dateStr: 'Today at 6:30 AM',
    group: 'today',
    isRead: true,
    category: 'Extension',
    iconType: 'report'
  },

  // --- YESTERDAY ---
  {
    id: 'notif-5',
    title: 'Personnel Account Activated',
    message: 'Investigator M. Santos completed email verification and successfully joined the FDA Inspection Division.',
    time: 'Yesterday',
    dateStr: 'Yesterday at 4:30 PM',
    group: 'yesterday',
    isRead: false,
    category: 'Personnel',
    iconType: 'user'
  },
  {
    id: 'notif-6',
    title: 'Joint Takedown Operation Update',
    message: 'Operation Phase 2 initiated for counterfeit medicine distribution warehouse in Northern Luzon Sector.',
    time: 'Yesterday',
    dateStr: 'Yesterday at 1:15 PM',
    group: 'yesterday',
    isRead: false,
    category: 'Operation',
    iconType: 'takedown'
  },
  {
    id: 'notif-7',
    title: 'Security Alert: Failed Login Threshold Exceeded',
    message: 'Multiple failed authentication attempts detected from IP 192.168.1.104. Session temporarily restricted for audit analysis.',
    time: 'Yesterday',
    dateStr: 'Yesterday at 9:05 AM',
    group: 'yesterday',
    isRead: true,
    category: 'Audit Log',
    iconType: 'audit'
  },

  // --- PREVIOUS 7 DAYS ---
  {
    id: 'notif-8',
    title: 'Registered Product Database Updated',
    message: '14 new registered pharmaceutical products and verification certificates were added to the FDA central directory.',
    time: '3 days ago',
    dateStr: 'Aug 29, 2026 at 2:40 PM',
    group: 'previous_7_days',
    isRead: true,
    category: 'Database',
    iconType: 'database'
  },
  {
    id: 'notif-9',
    title: 'Superadmin Invitation Accepted',
    message: 'Invitation for CIDG Regional Unit Administrator has been accepted and authorized in the administrative registry.',
    time: '4 days ago',
    dateStr: 'Aug 28, 2026 at 11:10 AM',
    group: 'previous_7_days',
    isRead: true,
    category: 'Personnel',
    iconType: 'user'
  },
  {
    id: 'notif-10',
    title: 'Monthly Enforcement Report Generated',
    message: 'Monthly analytics and inter-agency takedown summary for August 2026 is ready for review and export.',
    time: '5 days ago',
    dateStr: 'Aug 27, 2026 at 5:00 PM',
    group: 'previous_7_days',
    isRead: true,
    category: 'Report',
    iconType: 'report'
  },
  {
    id: 'notif-11',
    title: 'Case Verification Status: Action Required',
    message: 'Supplementary laboratory analysis report requested for Walk-in Case #CMP-2026-0740 before disposition.',
    time: '6 days ago',
    dateStr: 'Aug 26, 2026 at 10:15 AM',
    group: 'previous_7_days',
    isRead: true,
    category: 'Verification',
    iconType: 'verification'
  },

  // --- OLDER ---
  {
    id: 'notif-12',
    title: 'Case File #CF-2026-041 Marked Closed',
    message: 'Physical takedown and legal resolution concluded. Final disposition report submitted to FDA regulatory legal unit.',
    time: 'Aug 20, 2026',
    dateStr: 'Aug 20, 2026 at 3:20 PM',
    group: 'older',
    isRead: true,
    category: 'Complaint',
    iconType: 'complaint'
  },
  {
    id: 'notif-13',
    title: 'Scheduled System Backup Completed',
    message: 'Automated encrypted database snapshot and inter-agency audit archive synchronization completed successfully.',
    time: 'Aug 15, 2026',
    dateStr: 'Aug 15, 2026 at 2:00 AM',
    group: 'older',
    isRead: true,
    category: 'System',
    iconType: 'system'
  },
  {
    id: 'notif-14',
    title: 'Inter-Agency Security Policy Enforced',
    message: 'Two-factor authentication and role re-verification requirements applied across all active personnel sessions.',
    time: 'Aug 08, 2026',
    dateStr: 'Aug 08, 2026 at 9:00 AM',
    group: 'older',
    isRead: true,
    category: 'Audit Log',
    iconType: 'audit'
  }
];

const GROUP_METADATA = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'previous_7_days', label: 'Previous 7 days' },
  { key: 'older', label: 'Older' }
];

function getNotificationIcon(type) {
  switch (type) {
    case 'complaint':
      return <ClipboardList size={16} />;
    case 'advisory':
      return <AlertTriangle size={16} />;
    case 'verification':
      return <ShieldCheck size={16} />;
    case 'user':
      return <UserCheck size={16} />;
    case 'takedown':
      return <Activity size={16} />;
    case 'audit':
      return <ShieldAlert size={16} />;
    case 'database':
      return <Database size={16} />;
    case 'report':
      return <FileText size={16} />;
    case 'system':
    default:
      return <Bell size={16} />;
  }
}

function getCategoryTheme(type) {
  switch (type) {
    case 'complaint':
      return { bg: 'rgba(234, 88, 12, 0.1)', color: '#C2410C', badge: 'bg-orange' };
    case 'advisory':
      return { bg: 'rgba(220, 38, 38, 0.1)', color: '#DC2626', badge: 'bg-red' };
    case 'verification':
      return { bg: 'rgba(13, 148, 136, 0.12)', color: '#0D9488', badge: 'bg-teal' };
    case 'user':
      return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563EB', badge: 'bg-blue' };
    case 'takedown':
      return { bg: 'rgba(217, 119, 6, 0.12)', color: '#B45309', badge: 'bg-amber' };
    case 'audit':
      return { bg: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', badge: 'bg-purple' };
    case 'database':
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', badge: 'bg-green' };
    case 'report':
      return { bg: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', badge: 'bg-indigo' };
    case 'system':
    default:
      return { bg: 'rgba(100, 116, 139, 0.12)', color: '#475569', badge: 'bg-slate' };
  }
}

export default function AllNotifications() {
  const currentRole = getAuthenticatedUserRole();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'read'

  // Workspace Layout configuration matching existing FDA / LEA / Superadmin dashboards
  const layoutConfig = useMemo(() => {
    switch (currentRole) {
      case 'SUPERADMIN':
        return {
          sidebarType: 'SUPER_ADMIN',
          mainContainerClass: 'SuperadminMainContainer',
          contentContainerClass: 'SuperadminContentContainer',
          mainFeedClass: 'SuperadminMainfeed',
        };
      case 'LEA':
        return {
          sidebarType: 'LEA',
          mainContainerClass: 'LeaDashboardMain',
          contentContainerClass: 'LeaContentContainer',
          mainFeedClass: 'LeaMainfeed',
        };
      case 'FDA':
      default:
        return {
          sidebarType: 'FDA',
          mainContainerClass: 'FdaDashboardMain',
          contentContainerClass: 'FdaContentContainer',
          mainFeedClass: 'FdaMainFeed',
        };
    }
  }, [currentRole]);

  // Counts
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    if (activeFilter === 'read') {
      return notifications.filter(n => n.isRead);
    }
    return notifications;
  }, [notifications, activeFilter]);

  // Group filtered notifications by section
  const groupedNotifications = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      previous_7_days: [],
      older: []
    };

    filteredNotifications.forEach(notif => {
      if (groups[notif.group]) {
        groups[notif.group].push(notif);
      } else {
        groups.older.push(notif);
      }
    });

    return groups;
  }, [filteredNotifications]);

  // Handlers
  const handleToggleRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: !n.isRead } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const agencyClass = `agency-${currentRole.toLowerCase()}`;

  return (
    <>
      <style>{`
        /* Page Level Styles */
        .NotifPageWrapper {
          max-width: 1040px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Tabs / Filter Bar Row */
        .NotifFilterBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .NotifFilterTabs {
          display: flex;
          align-items: center;
          background: #EBEFF5;
          padding: 4px;
          border-radius: 10px;
          gap: 4px;
        }

        .NotifFilterTabBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 20px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: #64748B;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          user-select: none;
        }

        .NotifFilterTabBtn:hover:not(.active) {
          color: #1E293B;
          background: rgba(255, 255, 255, 0.6);
        }

        /* Agency-specific active tab highlight colors */
        .NotifFilterTabBtn.active.agency-fda {
          background: #1B4332;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(27, 67, 50, 0.25);
        }

        .NotifFilterTabBtn.active.agency-lea {
          background: #13213C;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(19, 33, 60, 0.25);
        }

        .NotifFilterTabBtn.active.agency-superadmin {
          background: #0D9488;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
        }

        .NotifSummaryText {
          font-size: 13px;
          color: #64748B;
          font-weight: 500;
        }

        /* Actions sub-bar: Mark all as read on the left */
        .NotifActionsSubBar {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 4px;
        }

        .NotifMarkAllBtn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #475569;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .NotifMarkAllBtn:hover:not(:disabled) {
          background: #F8FAFC;
          border-color: #CBD5E1;
          color: #1E293B;
        }

        .NotifMarkAllBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Time-based Sections */
        .NotifSectionsContainer {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .NotifGroupSection {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .NotifGroupHeader {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 2px;
        }

        .NotifGroupTitle {
          font-size: 13.5px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .NotifGroupCount {
          font-size: 11px;
          font-weight: 600;
          color: #94A3B8;
          background: #E2E8F0;
          padding: 2px 7px;
          border-radius: 12px;
        }

        .NotifGroupDivider {
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }

        /* Single Continuous Closed Container per Group (matches top-bar dropdown modal) */
        .NotifGroupCard {
          background: #FFFFFF;
          border: 1.5px solid #EDEDED;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }

        /* Continuous Row inside Container (reusing top-bar modal item structure and colors) */
        .NotifRowItem {
          display: flex;
          gap: 14px;
          padding: 14px 18px;
          border-bottom: 1px solid #f4f4f4;
          cursor: pointer;
          transition: background-color 0.2s ease;
          position: relative;
          align-items: flex-start;
          text-align: left;
        }

        .NotifRowItem:last-child {
          border-bottom: none;
        }

        .NotifRowItem:hover {
          background-color: #f8fafc;
        }

        /* Exact unread background color from top-bar.jsx modal: rgba(252, 163, 17, 0.05) */
        .NotifRowItem.unread {
          background-color: rgba(252, 163, 17, 0.05);
        }

        .NotifRowItem.unread:hover {
          background-color: rgba(252, 163, 17, 0.1);
        }

        .NotifRowIconBox {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .NotifContent {
          flex: 1;
          min-width: 0;
          padding-right: 28px;
        }

        .NotifItemTitle {
          font-size: 13.5px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .NotifRowItem.unread .NotifItemTitle {
          font-weight: 700;
          color: #111827;
        }

        .NotifCategoryTag {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 5px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .NotifCategoryTag.bg-orange { background: rgba(234, 88, 12, 0.1); color: #C2410C; }
        .NotifCategoryTag.bg-red { background: rgba(220, 38, 38, 0.1); color: #DC2626; }
        .NotifCategoryTag.bg-teal { background: rgba(13, 148, 136, 0.12); color: #0D9488; }
        .NotifCategoryTag.bg-blue { background: rgba(59, 130, 246, 0.1); color: #2563EB; }
        .NotifCategoryTag.bg-amber { background: rgba(217, 119, 6, 0.12); color: #B45309; }
        .NotifCategoryTag.bg-purple { background: rgba(124, 58, 237, 0.1); color: #7C3AED; }
        .NotifCategoryTag.bg-green { background: rgba(16, 185, 129, 0.12); color: #059669; }
        .NotifCategoryTag.bg-indigo { background: rgba(79, 70, 229, 0.1); color: #4F46E5; }
        .NotifCategoryTag.bg-slate { background: rgba(100, 116, 139, 0.12); color: #475569; }

        .NotifItemMsg {
          font-size: 12.5px;
          color: #4b5563;
          margin-bottom: 6px;
          line-height: 1.45;
        }

        .NotifItemTime {
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Exact unread dot badge from top-bar.jsx modal: #FCA311 */
        .NotifBadgeDot {
          width: 8px;
          height: 8px;
          background-color: #FCA311;
          border-radius: 50%;
          position: absolute;
          right: 18px;
          top: 20px;
        }

        .NotifRowActionBtn {
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
        }

        .NotifRowActionBtn:hover {
          background: #F1F5F9;
          color: #475569;
        }

        /* Empty State */
        .NotifEmptyState {
          background: #FFFFFF;
          border: 1.5px dashed #CBD5E1;
          border-radius: 14px;
          padding: 56px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 12px;
        }

        .NotifEmptyIcon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #F1F5F9;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .NotifEmptyTitle {
          font-size: 16px;
          font-weight: 700;
          color: #1E293B;
          margin: 0;
        }

        .NotifEmptyDesc {
          font-size: 13.5px;
          color: #64748B;
          max-width: 360px;
          margin: 0;
          line-height: 1.5;
        }

        /* Responsive Breakpoints */
        @media (max-width: 640px) {
          .NotifFilterBar {
            flex-direction: column;
            align-items: flex-start;
          }
          .NotifFilterTabs {
            width: 100%;
          }
          .NotifFilterTabBtn {
            flex: 1;
            justify-content: center;
            padding: 7px 10px;
          }
          .NotifRowItem {
            padding: 12px 14px;
            gap: 10px;
          }
          .NotifRowIconBox {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>

      <div className={layoutConfig.mainContainerClass}>
        <Sidebar sidebarType={layoutConfig.sidebarType} />

        <div className={layoutConfig.contentContainerClass}>
          <TopBar topbarType={layoutConfig.sidebarType} />

          <div className={layoutConfig.mainFeedClass}>
            <div className="NotifPageWrapper">

              {/* Filter Tabs & Summary Row */}
              <div className="NotifFilterBar">
                <div className="NotifFilterTabs">
                  <button
                    type="button"
                    className={`NotifFilterTabBtn ${agencyClass} ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All
                  </button>

                  <button
                    type="button"
                    className={`NotifFilterTabBtn ${agencyClass} ${activeFilter === 'unread' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('unread')}
                  >
                    Unread
                  </button>

                  <button
                    type="button"
                    className={`NotifFilterTabBtn ${agencyClass} ${activeFilter === 'read' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('read')}
                  >
                    Read
                  </button>
                </div>

                <div className="NotifSummaryText">
                  Showing {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
                </div>
              </div>

              {/* Actions Sub-bar: Mark all as read on the left */}
              <div className="NotifActionsSubBar">
                <button
                  type="button"
                  className="NotifMarkAllBtn"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck size={14} />
                  <span>Mark all as read</span>
                </button>
              </div>

              {/* Notification Groups */}
              {filteredNotifications.length === 0 ? (
                <div className="NotifEmptyState">
                  <div className="NotifEmptyIcon">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="NotifEmptyTitle">No notifications found</h3>
                  <p className="NotifEmptyDesc">
                    {activeFilter === 'unread'
                      ? "You're all caught up! There are no unread notifications at this time."
                      : activeFilter === 'read'
                      ? 'You have no read notifications in your history yet.'
                      : 'There are currently no notifications to display.'}
                  </p>
                </div>
              ) : (
                <div className="NotifSectionsContainer">
                  {GROUP_METADATA.map((groupMeta) => {
                    const groupItems = groupedNotifications[groupMeta.key] || [];
                    if (groupItems.length === 0) return null;

                    return (
                      <div key={groupMeta.key} className="NotifGroupSection">
                        <div className="NotifGroupHeader">
                          <h2 className="NotifGroupTitle">{groupMeta.label}</h2>
                          <span className="NotifGroupCount">{groupItems.length}</span>
                          <div className="NotifGroupDivider" />
                        </div>

                        {/* Continuous Closed Container per Group */}
                        <div className="NotifGroupCard">
                          {groupItems.map((notif) => {
                            const theme = getCategoryTheme(notif.iconType);
                            const IconComp = getNotificationIcon(notif.iconType);

                            return (
                              <div
                                key={notif.id}
                                className={`NotifRowItem ${notif.isRead ? '' : 'unread'}`}
                                onClick={() => handleToggleRead(notif.id)}
                                title="Click to toggle read / unread"
                              >
                                <div
                                  className="NotifRowIconBox"
                                  style={{ background: theme.bg, color: theme.color }}
                                >
                                  {IconComp}
                                </div>

                                <div className="NotifContent">
                                  <div className="NotifItemTitle">
                                    <span>{notif.title}</span>
                                    <span className={`NotifCategoryTag ${theme.badge}`}>
                                      {notif.category}
                                    </span>
                                  </div>

                                  <div className="NotifItemMsg">{notif.message}</div>

                                  <div className="NotifItemTime">
                                    <Clock size={11} />
                                    <span>{notif.dateStr}</span>
                                    <button
                                      type="button"
                                      className="NotifRowActionBtn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleRead(notif.id);
                                      }}
                                    >
                                      {notif.isRead ? (
                                        <>
                                          <Check size={12} />
                                          <span>Mark unread</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCheck size={12} />
                                          <span>Mark read</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {!notif.isRead && <div className="NotifBadgeDot" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
