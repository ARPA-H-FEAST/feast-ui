import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Markup } from 'interweave';
import { Link } from "react-router-dom";
import $ from "jquery";


class CurationPage extends Component {

  state = {
    ver:"",
    curation:{},
    dialog:{
      status:false,
      msg:""
    }
  };


  
  componentDidMount() {
    var reqObj = {};
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    var docId = this.props.docId;
    var svcUrl = LocalConfig.apiHash.dataset_curation + "/" + docId ;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
          this.setState(tmpState);
          console.log("Ajax response:", result);
        },
        (error) => {this.setState({ isLoaded: true, error,});}
      );
  }

  
  handleSubmit = (e) => {
     e.preventDefault();

     var reqObj = {"entity":e.target.id, "docid":this.props.docId, "curation":e.target.value};
     const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqObj)
     };

     var svcUrl = LocalConfig.apiHash.dataset_savecuration;
     fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.curation = result;
	  tmpState.isLoaded = true;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = result.error;
          }
          this.setState(tmpState);
          window.location.reload();
	  console.log("Ajax response:", result);
        },
        (error) => {this.setState({ isLoaded: true, error,});}
     );
  } 




  render() {

   if (!("response" in this.state)){
      return <Loadingicon/>
   }
   var recordObj = (this.state.response !== undefined ? this.state.response.record : {});

   var navStyle = {width:"100%", margin:"10px 0px 10px 0px", fontSize:"17px", borderBottom:"1px solid #ccc"}

   var sitesObj = {}
   for (var i in recordObj["sitelist"]){
        var obj = recordObj["sitelist"][i];
        var ent =  obj["entity"];
        var site = obj["combo"].split("|")[1] + "|" + obj["combo"].split("|")[2] + "|" + obj["combo"].split("|")[3];
	if (!(ent in sitesObj)){
       	    sitesObj[ent] = {"status":"fail", "sites":{}, "curation":obj["curation"]};
        } 
	if (obj["setname"].indexOf("_pass") !== -1){
           sitesObj[ent]["status"] = "pass";
	   if (obj["setname"].indexOf("_reported") !== -1){
           	sitesObj[ent]["sites"][site] = obj["setname"]
           }
	}
   }
   var sitesCnOne = [];
   var sitesCnTwo = [];
   for (var ent in sitesObj){
	var siteLbl = ent.split("|")[2];
	var annList = [];
	for (var site in sitesObj[ent]["sites"]){
	    annList.push(<li>{site} --> already reported</li>);
	}
	var curation = sitesObj[ent]["curation"];
	var selector = (
	   <select className="form-select" id={ent} style={{width:"200px"}} onChange={this.handleSubmit}>
	   	<option value={""}>--select</option>
		<option value={"glycosylated"} selected={"glycosylated" == curation}>glycosylated</option>
                <option value={"not_glycosylated"} selected={"not_glycosylated" == curation}>not glycosylated</option>
                <option value={"not_sure"} selected={"not_sure" == curation}>not sure</option>
            </select>
	);
	if (sitesObj[ent]["status"] === "pass" && annList.length === 0){
		sitesCnOne.push(<li key={siteLbl} style={{margin:"0px 0px 20px 0px"}} >
	      		<b> {siteLbl} </b> 
	      		{selector}
		</li>);
	}
	else if(sitesObj[ent]["status"] === "pass"){
		sitesCnTwo.push(<li key={siteLbl} style={{margin:"0px 0px 20px 0px"}} >
                        <b> {siteLbl} </b>
                        <ul>{annList}</ul>
                </li>);
	}

   }
   var sss = JSON.stringify(sitesObj, null, 2);


   var absCn = ""
   for (var i in recordObj["abstract_lines"]){
	var obj = recordObj["abstract_lines"][i];
        var sent = obj["sentence"];
	var flag = false;
	var newSent = "";
	var openFlag = false;
	for (var pos =0; pos < sent.length; pos++){
	   for (var j in obj["sitelist"]){
	      var s = parseInt(obj["sitelist"][j].split("-")[0]);
	      var e = parseInt(obj["sitelist"][j].split("-")[1]);
	      if (s === pos) { openFlag = true; newSent += "<span style='color:red;font-weight:bold;'>";}
	      if (e === pos) { openFlag = false; newSent += "</span>";}
	      flag = true;
           } 
           for (var j in obj["glycolist"]){
              var s = parseInt(obj["glycolist"][j].split("-")[0]);
              var e = parseInt(obj["glycolist"][j].split("-")[1]);
              if (s === pos) { openFlag = true; newSent += "<span style='color:red;font-weight:bold;'>";}
              if (e === pos) { openFlag = false; newSent += "</span>";}
              flag = true;
	   }
           newSent += sent[pos];
        }
	if (openFlag === true) {newSent += "</span>";}
        absCn += (flag === true ? "<br><br>" + newSent + ".<br><br>" : newSent + ". ");
    }   

   var sOne = {width:"60%", background:"#fff", margin:"20px 0px 0px 0px", padding:"15px",border:"1px dashed #eee"};
   var sTwo = {width:"38%",  margin:"20px 0px 0px 10px", padding:"15px"};


   return (
	<div className="leftblock" style={{width:"96%", margin:"0px 2% 0px 2%"}}>
    	   
	   <div className="leftblock" style={navStyle}>
              <DoubleArrowOutlinedIcon style={{color:"#2358C2", fontSize:"17px" }}/> &nbsp;
              <Link to="/lmsite/" className="reglink">HOME </Link> &nbsp; / &nbsp;
              <Link to={"/lmsite/LMS_0000002/recordlist"} className="reglink">LMS_0000002</Link> &nbsp; / &nbsp;
	      <Link to={"/lmsite/curation/"+this.props.docId} className="reglink">{this.props.docId}</Link>
           </div>
	   
       	   <div className="leftblock" style={sOne}>
               <Markup content={absCn}/>
           </div>
           <div className="leftblock" style={sTwo}>
              <ul>{sitesCnOne}</ul>
	      <ul>{sitesCnTwo}</ul>
           </div>
 
       </div>
    );
  }
}
export default CurationPage;

