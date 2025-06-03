import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
//import { Chart } from "react-google-charts";
import Tableview from "./table";
import {getColumns} from "./columns";
import Nav from "./nav"

import { Link, useLocation } from "react-router-dom";

import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Markup } from 'interweave';
import $ from "jquery";
import {sortReleaseList, downloadFile} from "./util";
import download from "downloadjs";
//import axios from 'axios';

import { useUserStore } from "../store/userStore";



export default function DatasetDetail(props) {

  const [state, setState] = useState({
   	ver:"",
    	fileobjlist:[],
		bco:{},
    	tabidx:"bcoview",
    	dialog:{ status:false, msg:""
    	}    
  })

  const userCredentials = useUserStore((state) => state.userCredentials)
  const userIDTokenValues = useUserStore((state) => state.userIDTokenDetails)
  const storedUserInfo = useUserStore((state) => state.userInfo)
  
  useEffect( () => {
    var rowList = (props.rowList === undefined ? [] : props.rowList);
    var reqObj = { 
      bcoid: props.bcoId 
    };
    fetchPageData(reqObj); 
  }, [])  
	
  if (!userCredentials || !userCredentials.access_token) {
    console.log("No user credentials located, redirecting")
    // This doesn't work yet, but at least renders *something*
    // see https://stackoverflow.com/a/45090151 for a possible workaround
    return <Redirect to='/login' />
  }

  const handleDialogClose = () => {
    setState({...state, dialog: {status: false}});
  }

  const fetchPageData = async (reqObj) => {

		// let access_csrf = localStorage.getItem("access_csrf")
    // console.log("---> Getting details for BCO. reqObj: " + JSON.stringify(reqObj))
    const csrfToken = localStorage.getItem('access_csrf')
		const requestOptions = {
      	method: 'POST',
        credentials: 'include',
      	headers: {
        		'Content-Type': 'application/json',
            // 'Authorization': 'Bearer: ' + accessToken, // XXX FIXME: Django is falling back on session ID here...
        		'X-CSRFToken': csrfToken,
      	},
      	body: JSON.stringify(reqObj),
    	};
		const svcUrl = LocalConfig.apiHash.dataset_detail;
    const response = await fetch(svcUrl, requestOptions)
    if (!response.ok) {
      console.log("---> Data details: " + response.error)
    }
    const result = await response.json()
    // console.log("---> Data View: Got fileobjlist " + JSON.stringify(result.fileobjlist))
    setState(
    {...state,
      response: "success",
      bco: result.bco,
      fileobjlist: result.fileobjlist,
      loaded: true,
    })
  }



 	const handleDownloadFileOld = (e) => {
    	e.preventDefault();
		var fileName = e.target.id;
		var reqObj = {"filename":fileName};
	   downloadFile(reqObj);
 	}

	const handleDownloadFile = (e) => {
      e.preventDefault();
      var fileName = e.target.id;
      var reqObj = {
        "filename": e.target.id,
        "bcoid": props.bcoId,
      };
		
		const access_csrf = localStorage.getItem("access_csrf")
    // TODO: Still using session information rather than OAuth JWT

   	const requestOptions = {
      	method: 'POST',
      	headers: {
         	'Content-Type': 'application/json',
         	'X-CSRFToken': access_csrf,
      	},
      	body: JSON.stringify(reqObj),
      	credentials: 'include'
   	};
   	const svcUrl = LocalConfig.apiHash.dataset_download;
		fetch(svcUrl, requestOptions).then((res) => res.blob()).then( (result) => {
      console.log("---> Downloading file by name " + fileName)
		 		download(new Blob([result]), fileName);
		 	}, 
		 	(error) => { setState({isLoaded: true, dialog: error}) }
		);		


	};




 	const handleDownloadBco = (e) => {
   	e.preventDefault();
    	var buffer = JSON.stringify(state.bco, null, 2);
    	download(new Blob([buffer]), props.bcoId + ".json", "text/plain");
 	}



  const handleTitleClick = (e) => {
    setState({...state, tabidx: e.target.id.split("-")[0]});
  };

if (!("response" in state)){
    return <Loadingicon/>
}
const credentials = userCredentials
// const credentials = localStorage.getItem('userCredentials');
if (!credentials.access_token) {
  console.log("Credentials missing from user info " + JSON.stringify(storedUserInfo))
  window.location.href = props.initObj["webroot"] + "/login";
}



  var tabHash = {};
  tabHash["bcoview"] = {title:"BCO JSON"}
  tabHash.bcoview.cn = (<div style={{fontSize:"14px"}}><pre>{JSON.stringify(state.bco, null, 2)}</pre></div>);
  
var downloadItems = [];
// for (var i in state.fileobjlist){
  // var fileObj = state.fileobjlist[i];
  // var fileName = fileObj["filename"];
  // downloadItems.push(
  //   <li>
  //   <Link id={fileName} to={fileName} bco={state.bco} className="reglink" onClick={handleDownloadFile}>{fileName}</Link>
  //   </li>);
  // }
const downLoadString = (<div>Please email mazumder_lab@gwu.edu to discuss access privileges</div>)
downloadItems.push(downLoadString)

tabHash["downloads"] = {title:"DOWNLOADS",cn:(<ul style={{margin:"20px 0px 100px 20px"}} key="downloads">{downloadItems}</ul>)};

tabHash["query"] = {
  title: "QUERY",
  cn: (<div></div>)
}

var tabTitleList= [];
var tabContentList = [];
for (var tabId in tabHash){
    var activeFlag = (tabId === state.tabidx ? "active" : "" );
    var btnStyle = {width:"100%", fontSize:"15px", color:"#333", border:"1px solid #ccc"};
    btnStyle.color = (activeFlag === "active" ? "#990000" : "#333");
    btnStyle.background = (activeFlag === "active" ? "#fff" : "#eee");
    btnStyle.borderBottom = (activeFlag === "active" ? "1px solid #fff" : "1px solid #ccc");
    tabTitleList.push(
      <li key={"tab-"+tabId} className="nav-item" role="presentation" 
        style={{width:"20%"}}>
        <button className={"nav-link " + activeFlag} 
        id={tabId + "-tab"}  data-bs-toggle="tab" 
        data-bs-target={"#sample_view"} type="button" role="tab" aria-controls={"sample_view-cn"} aria-selected="true"
        style={btnStyle} onClick={handleTitleClick}
        >
          {tabHash[tabId].title}  
        </button>
    </li>
  );
  tabContentList.push(
    <div key={"formcn-"+tabId} 
      className={"tab-pane fade show  leftblock " + activeFlag} 
      id={tabId+"-cn"} role="tabpanel" aria-labelledby={tabId + "-tab"}
      style={{width:"100%",  padding:"20px", background:"#fff"}}>
      {tabHash[tabId].cn}
    </div>
  );
}

var linkObjList = [
  {"url":props.initObj["webroot"] + "/browse", "lbl":"BROWSE"},
  {"url":props.initObj["webroot"] + "/detail/" + props.bcoId, "lbl":props.bcoId}
];
  //<div className="leftblock" style={{width:"100%", margin:"40px 0px 0px 0px"}}> </div>
  return (
    <div className="leftblock" style={{width:"100%"}}>
  <Nav linkObjList={linkObjList}/>
  <div className="pagecn" style={{width:"90%", marginLeft:"5%", marginRight:"5%"}}>
      {/* <Alertdialog dialog={state.dialog} onClose={handleDialogClose}/> */}
      <div className="leftblock" 
        style={{width:"100%", margin:"20px 0px 0px 0px"}}>
        <ul className="nav nav-tabs" id="myTab" role="tablist" key="tabList"
          style={{width:"70%", border:"0px dashed orange"}}>
          {tabTitleList}
        </ul>
        <div className="tab-content" id="myTabContent" 
          style={{width:"100%", margin:"20px 0px 0px 0px"}}>
          {tabContentList}
        </div>
      </div>
    </div>
  </div>
  );
}
