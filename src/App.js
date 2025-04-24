import React, { useState, useEffect, useContext, useRef, Component } from "react";

import DatasetBrowse from "./components/dataset_browse";
import DatasetDetail from "./components/dataset_detail";
// import RecordList from "./components/record_list";
import StaticPage from "./components/static_page";
// import HistoryList from "./components/history_list";
// import HistoryDetail from "./components/history_detail";
// import CurationPage from "./components/curation_page";
import Alertdialog from './components/dialogbox';
import Loadingicon from "./components/loading_icon";
import * as LocalConfig from "./components/local_config";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import HeaderOne from "./components/header_one";
import HeaderTwo from "./components/header_two";
import Footer from "./components/footer";
import Login from "./components/login";
import FHIRInterface from "./components/fhir_interface";
import { parseJwt } from "./utilities/parseJWT";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import { Button } from "react-bootstrap";
import { useUserStore } from "./store/userStore";
import { appConfig } from "./configs/app_initial_config";

import { useIsAuthenticated } from "@azure/msal-react";

async function pingUserInfo() {
  const credentials = JSON.parse(localStorage.getItem('userCredentials'))
  if (!credentials || !credentials.access_token) {
    console.log("No user information located - are you logged in?")
    return
  }
  const targetURL = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/userinfo/"
  console.log("Attempting userinfo endpoint: " + targetURL)
  console.log("Using credentials: Bearer " + credentials.access_token)
  const response = await fetch(targetURL, {
    headers: {
      "Authorization": "Bearer " + credentials.access_token
    }
  })
  if (!response.ok) {
    console.log("---> Response: Not OK!")
  }
  const result = await response.json()
  console.log("---> Got USERINFO response " + JSON.stringify(result))
}

async function userRefreshToken() {
  /* XXX // TODO
  We must craft a useful URL, per example here: https://stackoverflow.com/a/27751200
  However, that requires state from "login", both static (e.g. client ID) and dynamic
  (e.g. code_verifier) content. Can use `localStorage` short term but that's not ideal
  */
  const credentials = JSON.parse(localStorage.getItem('userCredentials'))
  if (!credentials || !credentials.refresh_token) {
    console.log("No user information located - are you logged in?")
    return
  }
  const targetURL = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/token/"
  console.log("Attempting userinfo endpoint: " + targetURL)
  console.log("Using credentials: Bearer " + credentials.access_token)
  const response = await fetch(targetURL, {
    method: 'POST',
    headers: {
      "Authorization": "Bearer " + credentials.access_token
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      // XXXX
    })
  })
  if (!response.ok) {
    console.log("---> Response: Not OK!")
  }
  const result = await response.json()
  console.log("---> Got USERINFO response " + JSON.stringify(result))
}

export const App = (props) => {

  const storedUserInfo = useUserStore((state) => state.userInfo)
  const updateUserInfo = useUserStore((state) => state.setUserInfo)
  const storeGetUserInfo = useUserStore((state) => state.getUserInfo)
  const storeIsLoaded = useUserStore((state) => state.isLoaded)
  const storeDialog = useUserStore((state) => state.dialog)
  const resetStoreDialog = useUserStore((state) => state.removeDialog)

  // const handleUpdateUserInfo = (updatedUserInfo) => {
  //   console.log("---> Updating state? With arg " + JSON.stringify(updatedUserInfo))
  //   updateUserInfo(updatedUserInfo)
  // }

  // const [state, updateState] = useState({
  //   dialog:{
  //     status:false, 
  //     msg:""
  //   },
  //   userinfo: {},
  //   isLoaded: false,
  // })

  const handleDialogClose = () => {
    // updateState({dialog: {status: false}})
    resetStoreDialog()
  }

  useEffect(() => {
    // Notes on useEffect: https://stackoverflow.com/a/54655508
		getUserInfo();
  }, [])

  const handleSearch = async () => {
    // TODO
  }

  const handleKeyPress = () => {
    // TODO
  }

  const getUserInfo = async () => {
    storeGetUserInfo()
    // console.log("---> Getting user information <----")
    // console.log("---> Current state is " + JSON.stringify(storedUserInfo))
    // const requestOptions = {
    //   method: 'GET',
    //   credentials: 'include'
    // };
    // const svcUrl = LocalConfig.apiHash.user_info;
    // console.log("---> Contacting login server at " + svcUrl)
    // const res = await fetch(svcUrl, requestOptions)
    // const response = await res.json()
    // console.log("got response " + JSON.stringify(response))
    // handleUpdateUserInfo(response)
    // console.log("---> Revised state is " + JSON.stringify(storedUserInfo))
    // updateState({ isLoaded: true })
      // .then((res) => res.json())
      // .then((result) => {
      //     console.log("Userinfo\n", JSON.stringify(result));
      //     updateState({userinfo: result, isLoaded: true})
      //     useUserStore((state) => state.setUserInfo(result))
      //     if (result.status === 0 || !result.isAuthenticated){
      //       // Delete expired credentials if the server didn't ack with logged in info
      //       localStorage.removeItem('userCredentials')
      //     } else {
      //       // Carry on?
      //     }
      //   }).catch((error) => {
      //   console.log("===> ERROR: " + JSON.stringify(error))
      //   // updateState({isLoaded: false, dialog: {msg: error}})
      //   // console.log("===> State is now: " + JSON.stringify(state))
      // })
      const retrievedInfo = storedUserInfo
      if (retrievedInfo == {}) {
        // Error handling
      } else {
        // XXX console.log("---> APP: Found store information " + JSON.stringify(retrievedInfo))
      }
  }

  // const updateUserInfo = (newInformation) => {
  //   // let tmpState = this.state
  //   // tmpState.userinfo = newInformation
  //   updateState({userinfo: newInformation})
  // }

  const forceUpdate = () => {
    console.log("Fooled you!")
  }

  // const handlePingUserInfo = async () => {
  //   await pingUserInfo()
  // }

  // const storeCredentials = (credentials) => {
  //   // XXX This should not be at the App level any longer
  //   localStorage.setItem('userCredentials', JSON.stringify(credentials))
  //   const idTokenValues = parseJwt(credentials.id_token)
  //   // console.log("---> Found ID Token values " + JSON.stringify(idTokenValues))
  //   localStorage.setItem('userIDTokenValues', JSON.stringify(idTokenValues))
  //   localStorage.setItem('access_token', JSON.stringify(credentials.access_token))
  //   // TODO
  //   localStorage.setItem('refresh_token', JSON.stringify(credentials.refresh_token))
  //   // XXX this.forceUpdate()
  //  }

   const rerenderApp = () => {
    getUserInfo()
    forceUpdate()
   }


  // XXX console.log("---> Rendering APP <---")

  const credentials = JSON.parse(localStorage.getItem('userCredentials'))
  if (credentials !== null) {
    // console.log("Found CREDENTIALS:\n", JSON.stringify(credentials))
    // for (const key in credentials) {
    //   console.log(key + ": " + credentials[key])
    // }
    // console.table(["Current state", this.state])
  } else {
    // Pass ?
    // console.log("Empty credentials: " + credentials)
  }

  if (!storeIsLoaded){
  const dialog = {
    status: true, 
    msg: "Error contacting login server. Please contact admin at mazumder_lab@gwu.edu",
    closeButtonMsg: "Attempt reload?",
    noticeString: "Fatal error!"
    }
    return <Alertdialog dialog={dialog} onClose={rerenderApp} />
  }	

  var app_ver = process.env.REACT_APP_APP_VERSION;
  // var data_ver = this.state.response.record.dataversion;

  //<div className="versioncn">APP v-{app_ver} &nbsp; |&nbsp; Data v-{data_ver}</div>
  var moduleTitle = "xxx";
//  var app_ver = "xx";

// TODO: Webroot captures URLs here
const config = appConfig()

var initObj = config;
let webRoot = initObj["webroot"];
// console.log("InitObj", initObj);

if (webRoot === "/dsviewer") {
  webRoot = "/gw-feast"
  initObj["webroot"] = "/gw-feast"
  // updateState({response: {record: {webroot: "/gw-feast"}}})
}
// NB: Reinstate this button between header two and the router for easy global access to user state in the console
//   <div>
//   <button className="btn btn-outline-secondary" onClick={this.handlePingUserInfo}>Ping User Info</button>
// </div>
  // XXX const storedUserInfo = useUserStore.getState().userInfo

  return (
    <div>
      <div style={{display: 'fluid'}}>
      { storeDialog && <Alertdialog dialog={storeDialog} onClose={handleDialogClose} /> }
      <HeaderOne onSearch={handleSearch} onKeyPress={handleKeyPress} initObj={initObj} />
      <HeaderTwo
        moduleTitle={moduleTitle}
        appVer={app_ver}
        initObj={initObj}
        // userinfo={currentUserInfo}
      />
      </div>
  {/* <div className="versioncn" style={{display: 'fluid'}}>
    
  </div> */}
    <Router>
      <Switch>
    <Route
          path={webRoot + "/login"} 
          render={(props) => (
            // <Login initObj={initObj} userinfo={state.userinfo} onCodeExchange={storeCredentials} loginHandler={this.updateUserInfo} />
            <Login initObj={initObj} />
          )}
        />
    <Route
          path={"/login"} 
          render={(props) => (
            // <Login initObj={initObj} userinfo={state.userinfo} onCodeExchange={storeCredentials} loginHandler={this.updateUserInfo} />
            <Login initObj={initObj} />
          )}
        />
    <Route 
      path={webRoot + '/fhir-interface'}
      render={(props) => (
        <div className="fhirInterface">
          {/* <FHIRInterface userinfo={storedUserInfo} /> */}
          <FHIRInterface />
        </div>
      )}
    />
          <Route
          path={webRoot + "/callback"}
          render={(props) => (
            // <Login initObj={initObj} userinfo={state.userinfo} callback={props.location} onCodeExchange={storeCredentials} loginHandler={updateUserInfo} />
            <Login initObj={initObj} callback={props.location} />
          )}
          />
        <Route
          path={webRoot + "/static/:pageId"}
          render={(props) => (
            <StaticPage pageId={props.match.params.pageId}  initObj={initObj}/>
          )}
          />
          <Route
              exact
              path={webRoot + "/browse"}
              render={(props) => (
                // <DatasetBrowse  initObj={initObj} userInfo={storedUserInfo}/>
                <DatasetBrowse initObj={initObj} />
              )}
          />
          <Route
              exact
              path={webRoot + "/detail/:bcoId"}
              render={(props) => (
                // <DatasetDetail  initObj={initObj} userInfo={storedUserInfo} bcoId={props.match.params.bcoId}/>
                <DatasetDetail  initObj={initObj} bcoId={props.match.params.bcoId}/>
              )}
          />
          <Route
              path={webRoot}
              render={(props) => (
            // <Login initObj={initObj} userinfo={state.userinfo} onCodeExchange={storeCredentials} loginHandler={updateUserInfo} />
            <Login initObj={initObj} />
            // <DatasetBrowse  initObj={initObj} userInfo={this.state.userinfo}/>
              )}
          />
      <Route
              path={webRoot +  "/"}
              render={(props) => (
                // <Login initObj={initObj} userinfo={state.userinfo} onCodeExchange={storeCredentials} loginHandler={updateUserInfo} />
                <Login initObj={initObj} />
            // <DatasetBrowse  initObj={initObj} userInfo={this.state.userinfo}/>
              )}
          />
          <Redirect from={"*"} to={"/gw-feast/login/"} />
        </Switch>
      </Router>
      <Footer initObj={initObj}/>
</div>
);


}

// export default App;
