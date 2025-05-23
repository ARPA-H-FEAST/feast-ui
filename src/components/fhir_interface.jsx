import React, { useEffect, useState } from "react";
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
import { useUserStore } from "../store/userStore"

import ReactJsonView from '@microlink/react-json-view'

export default function FHIRInterface(props) {  
  
  const userCredentials = useUserStore((state) => state.userCredentials)
  const userIDTokenValues = useUserStore((state) => state.userIDTokenValues)
  const userAuthorized = useUserStore((state) => state.authorized)

  const [state, setState] = useState({
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
  })

  useEffect(() => {
    console.log("---> FHIR Attempting to render ....")
    getFHIREndpoints()
   }, [])

  const postFHIRData = () => {
    alert("TBD");
  }
  
  const clearData = () => {
    setState({jsonObjects: {}})
  }

  const getFHIREndpoints = async () => {
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
      setState({endpoints: endpoints})
    }
  }

	const getFHIRResponse = async () => {
 
    const access_csrf = localStorage.getItem("access_csrf")
    if (!userCredentials || !userCredentials.access_token) {
        console.log("No user credentials located, redirecting")
        // This doesn't work yet, but at least renders *something*
        // see https://stackoverflow.com/a/45090151 for a possible workaround
        return <Redirect to='/login' />
    }
    // console.log("---> Authorization: Bearer: " + credentials.access_token)
    // console.log("---> Authorization API endpoint: " + auth_url)
    const queryString = "fhir-query/?q=Patient"
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
      // console.log("---> Button: Got response " + jsonResponse)
      // console.log("State started as: " + state.jsonObjects)
      setState({jsonObjects: jsonResponse})
    } catch {
      // More error handling
    }
  }

    // TODO vs XXX
    const credentials = userCredentials
    if (!credentials.access_token) {
      console.log("Credentials missing from user info " + JSON.stringify(props.userinfo))
      window.location.href = props.initObj["webroot"] + "/login";
    }
    console.log("---> Rendering FHIR interface <---")
    console.log("Credentials were: " + JSON.stringify(credentials))
    return (
      <div>
      <div style={
        {display: 'flex', justifyContent: 'center'}
        }>
        {/* <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose} /> */}
        {/* <div className="material-icons rightblock filtericoncn" onClick={this.handleFilterIcon}>tune</div> */}
        <button className="btn btn-outline-secondary" onClick={getFHIRResponse}>Query FHIR for user sample</button>
        <button className="btn btn-outline-secondary" onClick={postFHIRData}>Upload JSON (TODO)</button>
        <button className="btn btn-outline-secondary" onClick={clearData}>Clear JSON Field</button>
        </div>
        <div style={
          {display: 'flex', minHeight: '300px'}
        }>
          <ReactJsonView src={state.jsonObjects} theme='summerfruit:inverted' />
        </div>
      </div>
      

    );
}
