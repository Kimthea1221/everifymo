import './lea-css.css'
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';

function LeaDashboard(){
  return(
    <div className='LeaDashboardMain'>
       <Sidebar sidebarType="LEA" />
       <div className='LeaContentContainer'>
          <TopBar />
          <div className='LeaMainfeed'>
            <h2>LEA DASHBOARD</h2>
          </div>
       </div>
    </div>
  );
}

export default LeaDashboard
