import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";

function FDAViewReports(){
    return(
        <div className="FdaDashboardMain">
            <Sidebar sidebarType="FDA" />
            <div className="FdaContentContainer">
                <TopBar />
                <div className="FdaMainFeed">
                    <h2>VIEW REPORTS</h2>
                </div>
            </div>
        </div>
    )
}

export default FDAViewReports