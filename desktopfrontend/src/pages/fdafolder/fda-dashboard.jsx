import FDASidebar from "./fda-sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css'

function FDADashboard(){
    return(
        <div className="FdaDashboardMain">
            <FDASidebar />
            <div className="FdaContentContainer">
                <TopBar />
                <div className="FdaMainFeed">
                    <h2>FDA DASHBOARD</h2>
                </div>
            </div>
        </div>
    )
}

export default FDADashboard