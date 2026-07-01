import './lea-css.css'
import LeaSideBar from './lea-sidebar';
import TopBar from '../component/top-bar';

function LeaDashboard(){
  return(
    <div className='LeaDashboardMain'>
       <LeaSideBar />
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
