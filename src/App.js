import React, { Component } from "react";

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

import { appConfig } from "./configs/app_initial_config";

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

class App extends Component {

      state = {
        dialog:{
          status:false, 
          msg:""
        },
        userinfo: {},
      };

  handleDialogClose = () => {
    this.setState({dialog: {status: false}})
  }

  componentDidMount() {
		this.getUserInfo();
  }

	getUserInfo () {
    // console.log("---> Getting user information <----")
    // const access_csrf = localStorage.getItem("access_csrf")
    const requestOptions = {
      method: 'GET',
      // headers: {
      //   'Content-Type': 'application/json',
      //   'X-CSRF-TOKEN': access_csrf,
      // },
      // body: JSON.stringify({}),
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.user_info;
    // console.log("---> Contacting login server at " + svcUrl)
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          // console.log("userinfo\n", result);
			//  var tmpState = this.state;
          this.setState({userinfo: result, isLoaded: true})
          // tmpState.userinfo = result;
          // tmpState.isLoaded = true;
          if (result.status === 0){
            this.setState({dialog: {status: true}})
            // tmpState.dialog.status = true;
            // tmpState.dialog.msg = tmpState.response.error;
          }
          // this.setState(tmpState);
          // console.log("---> Exiting user info. Result was " + JSON.stringify(result))
        },
      ).catch((error) => {
        console.log("===> ERROR: " + JSON.stringify(error))
        this.setState(
          {isLoaded: false, dialog: {msg: error}}
      );
        console.log(JSON.stringify(this.state))
      })
  }

  updateUserInfo = (newInformation) => {
    // let tmpState = this.state
    // tmpState.userinfo = newInformation
    this.setState({userinfo: newInformation})
  }

  async handlePingUserInfo() {
    await pingUserInfo()
  }

  storeCredentials = (credentials) => {
    localStorage.setItem('userCredentials', JSON.stringify(credentials))
    const idTokenValues = parseJwt(credentials.id_token)
    // console.log("---> Found ID Token values " + JSON.stringify(idTokenValues))
    localStorage.setItem('userIDTokenValues', JSON.stringify(idTokenValues))
    localStorage.setItem('access_token', JSON.stringify(credentials.access_token))
    // TODO
    localStorage.setItem('refresh_token', JSON.stringify(credentials.refresh_token))
    this.forceUpdate()
   }

   rerenderApp = () => {
    this.getUserInfo()
    this.forceUpdate()
   }

  render() {

    console.log("---> Rendering APP <---")

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

	 if (!this.state.isLoaded){
    const dialog = {
      status: true, 
      msg: "Error contacting login server. Please contact admin at mazumder_lab@gwu.edu",
      closeButtonMsg: "Attempt reload?",
      noticeString: "Fatal error!"
    }
		return <Alertdialog dialog={dialog} onClose={this.rerenderApp} />
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
    this.state.response.record["webroot"] = "/gw-feast"
  }
// NB: Reinstate this button between header two and the router for easy global access to user state in the console
//   <div>
//   <button className="btn btn-outline-secondary" onClick={this.handlePingUserInfo}>Ping User Info</button>
// </div>

   return (
      <div>
        <div style={{display: 'fluid'}}>
        <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose} />
        <HeaderOne onSearch={this.handleSearch} onKeyPress={this.handleKeyPress} initObj={initObj} />
        <HeaderTwo
       		moduleTitle={moduleTitle}
        		appVer={app_ver}
        		initObj={initObj}
        		userinfo={this.state.userinfo}
      	/>
        </div>
		{/* <div className="versioncn" style={{display: 'fluid'}}>
			
		</div> */}
      <Router>
        <Switch>
			<Route
            path={webRoot + "/login"} 
            render={(props) => (
              <Login initObj={initObj} userinfo={this.state.userinfo} onCodeExchange={this.storeCredentials} loginHandler={this.updateUserInfo} />
            )}
          />
			<Route
            path={"/login"} 
            render={(props) => (
              <Login initObj={initObj} userinfo={this.state.userinfo} onCodeExchange={this.storeCredentials} loginHandler={this.updateUserInfo} />
            )}
          />
      <Route 
        path={webRoot + '/fhir-interface'}
        render={(props) => (
          <div className="fhirInterface">
            <FHIRInterface userinfo={this.state.userinfo} />
          </div>
        )}
      />
           <Route
            path={webRoot + "/callback"}
            render={(props) => (
              <Login initObj={initObj} userinfo={this.state.userinfo} callback={props.location} onCodeExchange={this.storeCredentials} loginHandler={this.updateUserInfo} />
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
                 <DatasetBrowse  initObj={initObj} userInfo={this.state.userinfo}/>
               )}
           />
           <Route
               exact
               path={webRoot + "/detail/:bcoId"}
               render={(props) => (
                 <DatasetDetail  initObj={initObj} userInfo={this.state.userinfo} bcoId={props.match.params.bcoId}/>
               )}
           />
           <Route
               path={webRoot}
               render={(props) => (
              <Login initObj={initObj} userinfo={this.state.userinfo} onCodeExchange={this.storeCredentials} loginHandler={this.updateUserInfo} />
              // <DatasetBrowse  initObj={initObj} userInfo={this.state.userinfo}/>
               )}
           />
			  <Route
               path={webRoot +  "/"}
               render={(props) => (
              <Login initObj={initObj} userinfo={this.state.userinfo} onCodeExchange={this.storeCredentials} loginHandler={this.updateUserInfo} />
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
}

export default App;
