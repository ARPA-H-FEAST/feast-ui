import React, { Component } from "react";
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



class DatasetDetail extends Component {
	state = {
   	ver:"",
    	fileobjlist:[],
		bco:{},
    	tabidx:"bcoview",
    	dialog:{ status:false, msg:""
    	}
  	};

  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }



  componentDidMount() {
    var rowList = (this.props.rowList === undefined ? [] : this.props.rowList);
    var reqObj = { 
      bcoid:this.props.bcoId 
    };
    this.fetchPageData(reqObj); 
  }



  fetchPageData = async (reqObj) => {

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
    this.setState({
      response: "success",
      bco: result.bco,
      fileobjlist: result.fileobjlist,
      loaded: true,
    })
  }



 	handleDownloadFileOld = (e) => {
    	e.preventDefault();
		var fileName = e.target.id;
		var reqObj = {"filename":fileName};
	   downloadFile(reqObj);
 	}

	handleDownloadFile = (e) => {
      e.preventDefault();
      var fileName = e.target.id;
      var reqObj = {
        "filename": e.target.id,
        "bcoid": this.props.bcoId,
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
		 	(error) => { this.setState({isLoaded: true,error,}); }
		);		


	};




 	handleDownloadBco = (e) => {
   	e.preventDefault();
    	var buffer = JSON.stringify(this.state.bco, null, 2);
    	download(new Blob([buffer]), this.props.bcoId + ".json", "text/plain");
 	}



  handleTitleClick = (e) => {

    var tmpState = this.state;
    tmpState.tabidx = e.target.id.split("-")[0];
    this.setState(tmpState);
  };






  render() {

    
	if (!("response" in this.state)){
      return <Loadingicon/>
	}
	if ("msg" in this.props.userInfo){
		//alert("msg in userinfo: forwarding");
		window.location.href = this.props.initObj["webroot"] + "/login";
	}


 
    var tabHash = {};
    tabHash["bcoview"] = {title:"BCO JSON"}
    tabHash.bcoview.cn = (<div style={{fontSize:"14px"}}><pre>{JSON.stringify(this.state.bco, null, 2)}</pre></div>);
    
	var downloadItems = [];
	for (var i in this.state.fileobjlist){
		var fileObj = this.state.fileobjlist[i];
    var fileName = fileObj["filename"];
		downloadItems.push(
			<li>
			<Link id={fileName} to={fileName} bco={this.state.bco} className="reglink" onClick={this.handleDownloadFile}>{fileName}</Link>
			</li>);
  	}

	tabHash["downloads"] = {title:"DOWNLOADS",cn:(<ul style={{margin:"20px 0px 100px 20px"}}>{downloadItems}</ul>)};

    var tabTitleList= [];
    var tabContentList = [];
    for (var tabId in tabHash){
        var activeFlag = (tabId === this.state.tabidx ? "active" : "" );
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
            style={btnStyle} onClick={this.handleTitleClick}
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
		{"url":this.props.initObj["webroot"] + "/browse", "lbl":"BROWSE"},
		{"url":this.props.initObj["webroot"] + "/detail/" + this.props.bcoId, "lbl":this.props.bcoId}
	];
   //<div className="leftblock" style={{width:"100%", margin:"40px 0px 0px 0px"}}> </div>
   return (
      <div className="leftblock" style={{width:"100%"}}>
		<Nav linkObjList={linkObjList}/>
		<div className="pagecn" style={{width:"90%", marginLeft:"5%", marginRight:"5%"}}>
        <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
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
}

export default DatasetDetail;
