import React, { Component } from "react";
import Formeditor from "./form_editor";
import {getLoginOneResponse, getLoginTwoResponse, getLoginThreeResponse, getLoginDirectResponse} from './util';
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import loginFormDirect from "../jsondata/form_login_direct.json";
import { getCookie } from "../utilities/cookies";
import { touchRippleClasses } from "@mui/material";
import NavigationButton from "./navigation_button";

const internal_oauth_auth_url = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/authorize/"
const ms_oauth_auth_url = process.env.REACT_APP_SPA_OAUTH_API_URL + "/authorize/"

const internal_oauth_token_url = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/token/"
const ms_oauth_token_url = process.env.REACT_APP_SPA_OAUTH_API_URL + "/token/"

const ms_oauth_client_id = process.env.REACT_APP_MS_OAUTH_CLIENT_ID
const internal_oauth_client_id = process.env.REACT_APP_FEAST_OAUTH_CLIENT_ID
const redirect_uri = process.env.REACT_APP_ROOT_URL + "/callback/"


async function oidcAuthorize() {
  
  const code_challenge = sessionStorage.getItem('code_challenge')
  const code_verifier = sessionStorage.getItem('code_verifier')

  console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
  console.log("FEAST OAuth: Contacting OAuth server at url", internal_oauth_auth_url)
  const response = await fetch(
    `${internal_oauth_auth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${internal_oauth_client_id}`, {
      // mode: "cors",
      credentials: "include",
      // headers: {"Access-Control-Allow-Origin": "*"},
      headers: {"Access-Control-Allow-Origin": "https://feast.mgpc.biochemistry.gwu.edu"},
      // headers: {"Access-Control-Allow-Origin": "https://login.microsoftonline.com"},
    }
  ).catch((error) => {
    console.log("ERROR: " + error)
    return false 
  })
  // console.log("---> OAuth response: ", response)
  if(response.ok) {
  if (response.url) {
    const url = new URL(response.url)
    // console.log("Found redirect URL: ", url)
    window.location.replace(url)
  }
  else { 
    /* error handling */
    }
  }
}

async function msGwSsoLogin() {
  
  const code_challenge = sessionStorage.getItem('code_challenge')
  const code_verifier = sessionStorage.getItem('code_verifier')

  console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
  console.log("SPA: Contacting OAuth server at url", ms_oauth_auth_url)
  const finalURL = `${ms_oauth_auth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${ms_oauth_client_id}&scope=user.read`
  window.location.replace(finalURL)
}

async function oidcGetToken(callback_code) {

  const code_verifier = sessionStorage.getItem('code_verifier')

  const headers = new Headers({
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
  })

    const res = await fetch(
      `${internal_oauth_token_url}`, {
        credentials: "include",
        headers: headers,
        method: 'POST',
        body: JSON.stringify(
          {
            client_id: internal_oauth_client_id,
            code: callback_code,
            code_verifier: code_verifier,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
          }
        )
      }
    )
    const response = await res.json()

    const credentials = {
      access_token: response.access_token,
      token_type: response.token_type,
      scope: response.scope,
      refresh_token: response.refresh_token,
      id_token: response.id_token,
    }
    
    return credentials
}

async function msGwuGetToken(callback_code) {

  const code_verifier = sessionStorage.getItem('code_verifier')

  const headers = new Headers({
  //   "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-url-encoded",
  })

  const fullURL = `${ms_oauth_token_url}?client_id=${ms_oauth_client_id}&code=${callback_code}&redirect_uri=${redirect_uri}&code_verifier=${code_verifier}&grant_type=authorization_code`

  const res = await fetch(
    // `${oauth_spa_token_url}`, {
    fullURL, {
      // credentials: "include",
      headers: headers,
      method: 'POST',
      mode: 'no-cors',
      // body: JSON.stringify(
      //   {
      //     // scope: "optional space-separated e.g.: 'openid profile'"
      //     client_id: client_id,
      //     code: callback_code,
      //     redirect_uri: redirect_uri,
      //     grant_type: 'authorization_code',
      //     // Per https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-access-token-with-a-certificate-credential
      //     // code verifier should be exactly 43 characters long (!!)
      //     code_verifier: code_verifier,
      //   }
      // )
    }
  )
  const response = await res.json()
  console.log("Got response: " + response)
  // const credentials = {
  //   access_token: response.access_token,
  //   token_type: response.token_type,
  //   scope: response.scope,
  //   refresh_token: response.refresh_token,
  //   id_token: response.id_token,
  // }
  
  // return credentials
}


class Login extends Component {

  state = {
    stage: -1,
    pageid:"login",
    navinfo:{
      login:[
        {id:"home", label: "Home", url: "/"},
        {id:"login", label: "Login", url: "/login"}
      ]
    },
    navparaminfo:{},
    auth_path: "",
    dialog:{
      status:false, 
      msg:""
    },
    redirect: "",
    code: "",
  };

  handleDialogClose = () => {
    this.setState({dialog: {status: false}})
    // var tmpState = this.state;
    // tmpState.dialog.status = false;
    // this.setState(tmpState);
  }

  handleLoginDirect = () => {
    getLoginDirectResponse(loginFormDirect).then(result => {
      if (result.status === 0){
        // console.log("===> Handling login, result was " + JSON.stringify(result))
        var tmpState = this.state;
        tmpState.dialog.status = true;
        tmpState.dialog.msg = <div><ul> {result.errorlist} </ul></div>;
        this.setState(tmpState);
        return;
      }
      // console.log("===> Handling login, result was " + JSON.stringify(result))
      localStorage.setItem("access_csrf", getCookie('csrftoken'));
      // console.log("---> Got CSRF token " + localStorage.getItem("access_csrf"))
      this.setState({stage: 2})
      this.props.loginHandler(result)
    });
  }

  async handleMsGwuSsoLogin() {
    alert("GWU SSO Options coming soon!")
    return
    // NB: This response works
    // const response = await msGwSsoLogin()
  }

  async oidcAuthorize() {
    const response = await oidcAuthorize()
  }

  parseOIDCCallback = () => {
    return this.props.callback.search.split("=")[1]
  }

  handleOIDCCodeExchange = async () => {
    const credentials = await oidcGetToken(this.state.oidcCallbackCode)
    if (!credentials) {
      // Error handling
    }
    this.setState({stage: 4})
    this.props.onCodeExchange(credentials)
  }

  handleMsGwuTokenExchange = async () => {
    alert("GWU SSO Options coming soon!")
    return
    // TODO: This response gets a cryptic "400: Bad Request" error from the server
    // The request is crafted per MS documentation here: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-access-token-with-a-client_secret
    // Further development is blocked until Dhina 2/ GW IT responds
    // const credentials = await msGwuGetToken(this.state.oidcCallbackCode)
    // this.setState({stage: 4})
    // this.props.onCodeExchange(credentials)
  }

  render() {

    // window.history.pushState({}, null, this.props.initObj["webroot"] + "/login");

    if (this.props.userinfo.msg) {  // TODO: Does `msg` ever appear when a user is logged in?
      // console.log("---> Entering LOGIN: userinfo is\n" + JSON.stringify(this.props.userinfo))
      this.state.stage = 1 // user is not logged in
    } 
    if (this.props.userinfo.isAuthenticated) {
      this.state.stage = 2 // user is logged in
    }
    
    if (this.props.callback) {
      // console.log("Called back with code: " + JSON.stringify(this.props.callback))
      this.state.stage = 3
      this.state.oidcCallbackCode = this.parseOIDCCallback()
    } // user has authorized at OAuth server

    const previousCredentials = localStorage.getItem('userCredentials')

    if (previousCredentials !== null) {
      // console.log("---> Found credentials:\n", this.props.userinfo.credentials)
      this.state.stage = 4
    } // authorization code has been exchanged for final credentials

    var cn = "";
    if (this.state.stage === 1){
      cn = (
        <div className="leftblock" style={{width:"100%"}}>
          Stage: { this.state.stage }<br />
          User Info: { JSON.stringify(this.props.userinfo) }<br />
          <div key={"login_form_one"} className="leftblock " 
            style={{width:"40%", margin:"40px 0px 5px 5%"}}>
			   Please login to your account. If you do not have an account, please contact mazumder_lab@gwu.edu<br/><br/>
				Email Address<br/>
            <input maxLength={320} id={"email"} type={"text"} className={"form-control loginform"}
               placeholder={""}/>
			   <br/>
				Password<br/>
			   <input maxLength={64} id={"password"} type={"password"} className={"form-control loginform"}
                placeholder={""}/>
			 </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.handleLoginDirect}>Login via FEAST</button>
            <button className="btn btn-outline-secondary" onClick={this.handleMsGwuSsoLogin}>Login via GW (SPA)</button>
          </div>
        </div>
      );
    }
    else if (this.state.stage === 2){
      cn = (
        <div>
          <div className="leftblock" style={{width:"100%"}}>
          Stage: { this.state.stage }<br />
          User Info: { JSON.stringify(this.props.userinfo) }
          Please click the button below to Authorize SMART actions within the FEAST ecosystem 
          </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.oidcAuthorize}>OIDC Authorize</button>
            <button className="btn btn-outline-secondary" onClick={this.handleMsGwuSsoLogin}>Login via GW (SPA)</button>
          </div>
        </div>
      )
    }
    else if (this.state.stage === 3){
      cn = (
        <div>
          <div className="leftblock" style={{width:"100%"}}>
          Stage: { this.state.stage }<br />
          Callback code: { this.state.oidcCallbackCode }<br />
          Credentials: { previousCredentials } // Should be null
          Please click to complete authentication and authorization
          </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.handleOIDCCodeExchange}>OIDC Exchange Code</button>
            <button className="btn btn-outline-secondary" onClick={this.handleMsGwuTokenExchange}>MS GWU Get token</button>
          </div>
        </div>
      )
    }
    else if (this.state.stage === 4){
      cn = (
        <div>
          <div className="leftblock" style={{width:"100%"}}>
          Stage: { this.state.stage }<br />
          Callback code: { this.props.userinfo.oidcCallback } // Should be null now!<br />
          Credentials: { previousCredentials } // Complete credentials
          Click below for access to GW-FEAST
          </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            {/* XXX testing-ui/dsviewer hardcoding */}
            <NavigationButton target="/gw-feast/browse/" text="Browse available files"></NavigationButton>
          </div>
        </div>
      )
    }
    else if (this.state.stage === -1){
      cn =  (<Loadingicon/>);
    }

    return (
      <div>
        <div className="pagecn" style={{background:"#fff"}}>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
          {cn}
        </div>
      </div>
  );
  }
}
    
export default Login;

