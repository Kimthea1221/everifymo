import './superadmin-css.css'
import { useNavigate, useLocation } from 'react-router-dom'
import ImgLogout from '../../images/logout_img.png'
import ImgUser from '../../images/sample_user_img.png'

const SuperAdminMenuItems=[
    {label: 'User Management', path:'/superadminfolder/superadmin-user-management'},
    {label: 'Audit Logs', path: '/superadminfolder/superadmin-audit-log'},
]

function SuperAdminSidebar(){
    const navigate = useNavigate()
    const location = useLocation()
    return(
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
                        <img src={ImgUser} alt="User image" />
                    </div>
                    <p>Admin</p>
                    <button>
                        <span className='logouticon'><img src={ImgLogout} alt="" /></span>End Session
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SuperAdminSidebar;