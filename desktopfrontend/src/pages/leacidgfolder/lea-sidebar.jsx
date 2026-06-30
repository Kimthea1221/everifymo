import './lea-css.css'
import CIDGLogo from '../../images/pnp-cidg.jpg'
import ImgDashboard from '../../images/dashboard_img.png'
import ImgComplaints from '../../images/complaints_img.png'
import ImgIntake from '../../images/intake_img.png'
import ImgVerification from '../../images/verification_img.png'
import ImgLogout from '../../images/logout_img.png'
import ImgSaved from '../../images/saved_img.png'
import ImgUser from '../../images/sample_user_img.png'
import { useNavigate, useLocation } from 'react-router-dom'

const LeaMenuItems=[
    {icon: ImgDashboard, label: 'Dashboard', path:'/leacidgfolder/lea-dashboard'},
    {icon:ImgIntake, label: 'New Walk-in Intake', path: '/leacidgfolder/lea-new-intake'},
    {icon:ImgComplaints, label: 'Walk-in Complaints', path: '/leacidgfolder/lea-walkin-complaints'},
    {icon:ImgVerification, label: 'Verification Request', path: '/leacidgfolder/lea-verification-request'},
    {icon: ImgSaved, label: 'Saved Drafts', path: '/leacidgfolder/lea-saved-draft'},
]
function LeaSideBar(){
    const navigate = useNavigate()
    const location = useLocation()
    return(
        <div className='LeaSidebarMain'>
            <div className='LeaSidebarTop'>
                <div><img src={CIDGLogo} alt="CIDG LOGO" /></div>
                <p>LEA-CIDG Workspace</p>
            </div>
            <div className='LeaSidebarMenu'>
                {LeaMenuItems.map((item) => (
                    <button
                        key={item.path}
                        className={`MenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}>
                            <span className='MenuIcons'><img src={item.icon} alt="menu icons" /></span>
                            <span className='MenuLabels'>{item.label}</span>
                    </button>
                    ))}
            </div>
            <div className='LeaSidebarBottom'>
                <div className='LeaSidebarUser'>
                    <div className='SidebarUserContainer'><img src={ImgUser} alt="User image" /></div>
                    <p>Admin</p>
                </div>
                <div className='LeaSidebarEndSession'><button className='MenuBtn'><span className='logouticon'><img src={ImgLogout} alt="" /></span>End Session</button></div>
            </div>
        </div>
    )            
}

export default LeaSideBar