import { useState } from 'react';
import './lea-css.css';
import LeaSideBar from './lea-sidebar';
import TopBar from '../component/top-bar';



function LeaSavedDraft (){
    return(
        <div className='LeaDashboardMain'>
            <LeaSideBar />
            <div className='LeaContentContainer'>
                <TopBar />
                <div className="LeaMainfeed">
                 
                </div>
            </div>
        </div>
    )
}
export default LeaSavedDraft;
