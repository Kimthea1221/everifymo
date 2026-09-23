import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css'

function FDAStatus(){
    return(
        <div className="FdaDashboardMain">
            <Sidebar sidebarType="FDA" />
            <div className="FdaContentContainer">
                <TopBar />
                <div className="FdaMainFeed">
                    <h2>STATUS UPDATE</h2>
                </div>
            </div>
        </div>
    )
}

export default FDAStatus