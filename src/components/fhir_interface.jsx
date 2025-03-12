import React, { Component } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom";
import Searchbox from "./search_box";
import Filter from "./filter";
import { filterObjectList } from './util';
import * as LocalConfig from "./local_config";
import Loadingicon from "./loading_icon";
import Alertdialog from './dialogbox';
import $ from "jquery";
import Tableview from "./table";
import {getColumns} from "./columns";
import { Markup } from 'interweave';

import ReactJsonView from '@microlink/react-json-view';

class FHIRInterface extends Component {  
  
  state = {
	  filterlist: [],
    objlist:[],
    statobj:{},
    pageIdx:1,
    pageBatchSize:5,
    pageStartIdx:1,
    pageEndIdx:5,
    listid:"",
    endpoints: [],
    isLoaded:false,
    searchquery:"",
    jsonObjects: {},
    dialog:{
      status:false, 
      msg:""
    },
  };

  componentDidMount = () => {
    console.log("---> FHIR Attempting to render ....")
    this.getFHIREndpoints()
   }

  postFHIRData() {
    alert("TBD");
  }
  
  clearData = () => {
    this.setState({jsonObjects: {}})
  }

  getFHIREndpoints = async () => {
    console.log("---> Collecting FHIR endpoints")
    const endpointURL = LocalConfig.apiHash.fhir_endpoint + "endpoints/"
    const response = await fetch(endpointURL, {
      method: "GET",
    })
    if (!response.ok) {
      console.log("---> SOMETHING WENT WRONG <---")
    } else {
      const endpoints = await response.json()
      console.log("---> Collected endpoints: " + JSON.stringify(endpoints))
      this.setState({endpoints: endpoints})
    }
  }

	getFHIRResponse = async () => {
 
    const access_csrf = localStorage.getItem("access_csrf")
    const credentials = JSON.parse(localStorage.getItem('userCredentials'))
    const id_token_values = JSON.parse(localStorage.getItem('userIDTokenValues'))
    const auth_url = id_token_values.iss + "/userinfo/"
    if (!credentials || !credentials.access_token) {
        console.log("No user credentials located, redirecting")
        // This doesn't work yet, but at least renders *something*
        // see https://stackoverflow.com/a/45090151 for a possible workaround
        return <Redirect to='/login' />
    }
    // console.log("---> Authorization: Bearer: " + credentials.access_token)
    // console.log("---> Authorization API endpoint: " + auth_url)
    const queryString = "query/?q=Patient"
    const requestOptions = {
        method: 'GET',
        // headers: {
        // 		'Content-Type': 'application/json',
        // 		'X-CSRFToken': access_csrf,
        //     'Authorization': 'Bearer: ' + credentials.access_token,
        //     'Iss-Oauth': auth_url,  // This address confirms login state on the backend
        // },
        // body: JSON.stringify({}),
        credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.fhir_endpoint + queryString;
    try {
      const response = await fetch(svcUrl, requestOptions)
      if(!response.ok) {
        // Error handling
      }
      const jsonResponse = await response.json()
      console.log("---> Button: Got response " + jsonResponse)
      console.log("State started as: " + this.state.jsonObjects)
      this.setState({jsonObjects: jsonResponse}, () => {
        console.log("---> Changing state to ", jsonResponse)
      })
      console.log("State is now: " + this.state.jsonObjects)
    } catch {
      // More error handling
    }
  }

    render() {

		  if("msg" in this.props.userinfo){  // TODO: Is "msg" ever included with successful user login?
        // Redirect to "login" if user isn't logged in upon arrival
        return <Redirect to="/login" />
    	}
      // TODO vs XXX
      const credentials = localStorage.getItem('userCredentials');
      if (credentials === null) {
        console.log("Credentials missing from user info " + JSON.stringify(this.props.userinfo))
        window.location.href = this.props.initObj["webroot"] + "/login";
      }
      console.log("---> Rendering FHIR interface <---")
      return (
        <div>
        <div style={
          {display: 'flex', justifyContent: 'center'}
          }>
          {/* <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose} /> */}
          {/* <div className="material-icons rightblock filtericoncn" onClick={this.handleFilterIcon}>tune</div> */}
          <button className="btn btn-outline-secondary" onClick={this.getFHIRResponse}>Query FHIR for user sample</button>
          <button className="btn btn-outline-secondary" onClick={this.postFHIRData}>Upload JSON (TODO)</button>
          <button className="btn btn-outline-secondary" onClick={this.clearData}>Clear JSON Field</button>
          </div>
          <div style={
            {display: 'flex', minHeight: '300px'}
          }>
            <ReactJsonView src={this.state.jsonObjects} theme='summerfruit:inverted' />
          </div>
        {/* <div className="statscn">
					  <Markup content={resultSummary}/> 
              </div>
              div className="filterboxwrapper">
                <Filter
                  filterinfo={filterInfo}
                  filterlist={this.state.filterlist}
                  resultcount={this.state.objlist.length}
                  resultSummary={resultSummary}
                  handleFilterApply = {this.handleFilterApply}
                />
              </div>
              <div className="searchresultscn">
                <Tableview cols={tableCols} rows={tableRows} />
              </div> */}
        </div>
        

      );
    }
}

export default FHIRInterface;
