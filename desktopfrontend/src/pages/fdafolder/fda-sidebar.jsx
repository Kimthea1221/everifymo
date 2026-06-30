import './fda-css.css'
import { useNavigate, useLocation } from 'react-router-dom'
import ImgDashboard from '../../images/dashboard_img.png'
import ImgReports from '../../images/report_img.png'
import ImgVerification from '../../images/verification_img.png'
import ImgStatus from '../../images/update_img.png'
import ImgProductdb from '../../images/db_img.png'
import ImgLogout from '../../images/logout_img.png'
import ImgUser from '../../images/sample_user_img.png'
import FDALogo from '../../images/FDA.png'


const FDAMenuItems=[
    {icon: ImgDashboard, label: 'Dashboard', path: '/fdafolder/fda-dashboard'},
    {icon: ImgReports, label: 'View Reports', path:'/fdafolder/fda-view-reports'},
    {icon: ImgVerification, label: 'Verification Request', path:'/fdafolder/fda-verification'},
    {icon: ImgStatus, label: 'Status Update', path:'/fdafolder/fda-status'},
    {icon: ImgProductdb, label: 'Product Database', path:'/fdafolder/fda-product-db'},
]

function FDASidebar(){
    const navigate = useNavigate()
    const location = useLocation()

    return(
        <div className='FdaSidebarMain'>
            <div className='FdaSidebarTop'>
                <div><img src={FDALogo} alt="" /></div>
                <p>FDA Workspace</p>
            </div>
            <div className='FdaSidebarMenu'>
                {FDAMenuItems.map((item) => (
                    <button
                        key={item.path}
                        className={`FdaMenuBtn ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}>
                            <span className='FdaMenuIcons'><img src={item.icon} alt="" /></span>
                            <span className='FdaMenuLabels'>{item.label}</span>
                    </button>
                ))}
            </div>
            <div className='FdaSidebarBottom'>
                <div className='FdasidebarUser'>
                    <div className='FDASidebarUserContainer'><img src={ImgUser} alt="" /></div>
                    <p>Admin</p>
                </div>
                <div className='FdaSidebarEndSession'>
                    <button className='FdaMenuBtn'><span className='FdaLogoutIcon'><img src={ImgLogout} alt="" /></span>End Session</button>
                </div>
            </div>

        </div>
    )
}
export default FDASidebar