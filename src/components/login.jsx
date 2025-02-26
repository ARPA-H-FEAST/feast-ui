import React, { Component } from "react";
import Formeditor from "./form_editor";
import {getLoginOneResponse, getLoginTwoResponse, getLoginThreeResponse, getLoginDirectResponse} from './util';
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import loginFormDirect from "../jsondata/form_login_direct.json";
import { getCookie } from "../utilities/cookies";
import { touchRippleClasses } from "@mui/material";
import NavigationButton from "./navigation_button";
const oauth_url = process.env.REACT_APP_OAUTH_API_URL + "/authorize/"
const oauth_token_url = process.env.REACT_APP_OAUTH_API_URL + "/token/"
const gw_sso_client_id = "3dbf0ec5-29ed-4f2d-91ee-277def159782"
const internal_client_id = "Qi1bQKA6hJwUSb0RoMv4GapAgmNEgEr8fk2JLP7W"
// const redirect_uri = "https://feast.mgpc.biochemistry.gwu.edu/gw-feast/callback/"
const redirect_uri = "https://feast.mgpc.biochemistry.gwu.edu/gw-feast/"


async function oidcAuthorize() {
  
  const code_challenge = sessionStorage.getItem('code_challenge')
  const code_verifier = sessionStorage.getItem('code_verifier')

  console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
  console.log("Contacting OAuth server at url", oauth_url)
  const response = await fetch(
    `${oauth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${internal_client_id}`, {
      // mode: "cors",
      credentials: "include",
      // headers: {"Access-Control-Allow-Origin": "*"},
      // headers: {"Access-Control-Allow-Origin": "https://feast.mgpc.biochemistry.gwu.edu"},
      headers: {"Access-Control-Allow-Origin": "*"},
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
  }
}

async function oidcGetToken(callback_code) {

  const code_verifier = sessionStorage.getItem('code_verifier')

  const headers = new Headers({
    "Cache-Control": "no-cache",
    "Content-Type": "application/json",
  })

    const res = await fetch(
      `${oauth_token_url}`, {
        headers: headers,
        method: 'POST',
        body: JSON.stringify(
          {
            client_id: internal_client_id,
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

  render() {

    // console.log("---> Entering LOGIN: userinfo is\n" + JSON.stringify(this.props.userinfo))

    // window.history.pushState({}, null, this.props.initObj["webroot"] + "/login");

    if (this.props.userinfo.msg) {  // TODO: Does `msg` ever appear when a user is logged in?
      console.log("---> Entering LOGIN: userinfo is\n" + JSON.stringify(this.props.userinfo))
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
			   Please login to your account. If you do not have an account, please contact ... <br/><br/>
				Email Address<br/>
            <input maxLength={320} id={"email"} type={"text"} className={"form-control loginform"}
               placeholder={""}/>
			   <br/>
				Password<br/>
			   <input maxLength={64} id={"password"} type={"password"} className={"form-control loginform"}
                placeholder={""}/>
			 </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.handleLoginDirect}>Login </button>
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
          </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.oidcAuthorize}>OIDC Authorize</button>
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
          </div>
          <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
            <button className="btn btn-outline-secondary" onClick={this.handleOIDCCodeExchange}>OIDC Exchange Code</button>
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

