import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css'

function FDAProductDB(){
    return(
        <div className="FdaDashboardMain">
            <Sidebar sidebarType="FDA" />
            <div className="FdaContentContainer">
                <TopBar />
                <div className="FdaMainFeed">
                    <h2>PRODUCT DATABASE</h2>
                </div>
            </div>
        </div>
    )
}

export default FDAProductDB