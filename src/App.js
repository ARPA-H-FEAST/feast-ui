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
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

class App extends Component {

      state = {
        dialog:{
          status:false, 
          msg:""
        },
        userinfo: {},
      };

  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  componentDidMount() {
    this.getInit();
		this.getUserInfo();
  }

  getInit() {
    const requestOptions = {
      method: 'GET',
    };
  
    const svcUrl = LocalConfig.apiHash.init_info;
    console.log("---> Getting initial information " + svcUrl)
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log("Ajax response:", JSON.stringify(result));
			 var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;
          if (tmpState.response.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          this.setState(tmpState);
        },
        (error) => {this.setState({ isLoaded: true, error,});}
      );
  }


	getUserInfo () {
    console.log("---> Getting user information <----")
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
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log("userinfo\n", result);
			 var tmpState = this.state;
          tmpState.userinfo = result;
          tmpState.isLoaded = true;
          if (result.status === 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          this.setState(tmpState);
          console.log("---> Exiting user info. Result was " + JSON.stringify(result))
        },
        (error) => {
          this.setState({isLoaded: true,error,});
        }
      );
  }

  updateUserInfo = (newInformation) => {
    let tmpState = this.state
    tmpState.userinfo = newInformation
    this.setState(tmpState)
  }

  storeCredentials = (credentials) => {
    localStorage.setItem('userCredentials', JSON.stringify(credentials))
    this.forceUpdate()
   }

  render() {
    if (!("response" in this.state)){
      return <Loadingicon/>
    }

   const credentials = localStorage.getItem('userCredentials')
   if (credentials !== null) {
    console.log("Found CREDENTIALS:\n", credentials)
    // console.table(["Current state", this.state])
   } else {
    console.log("Empty credentials: " + credentials)
   }

	 if (this.state.userinfo === undefined){
		return <Loadingicon/>
	 }	

    var app_ver = process.env.REACT_APP_APP_VERSION;
    // var data_ver = this.state.response.record.dataversion;

    //<div className="versioncn">APP v-{app_ver} &nbsp; |&nbsp; Data v-{data_ver}</div>
    var moduleTitle = "xxx";
	//  var app_ver = "xx";

  // TODO: Webroot captures URLs here
	var initObj = this.state.response.record;
	let webRoot = initObj["webroot"];
	// console.log("InitObj", initObj);

  if (webRoot === "/dsviewer") {
    webRoot = "/gw-feast"
    initObj["webroot"] = "/gw-feast"
    this.state.response.record["webroot"] = "/gw-feast"
  }

   return (
      <div>
      <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
      <HeaderOne onSearch={this.handleSearch} onKeyPress={this.handleKeyPress} initObj={initObj}/>
		<div className="versioncn">
			<HeaderTwo
       		moduleTitle={moduleTitle}
        		appVer={app_ver}
        		initObj={initObj}
        		userinfo={this.state.userinfo}
      	/>
		</div>
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
                 <DatasetBrowse  initObj={initObj} userInfo={this.state.userinfo}/>
               )}
           />
			  <Route
               path={webRoot +  "/"}
               render={(props) => (
                 <DatasetBrowse  initObj={initObj} userInfo={this.state.userinfo}/>
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
