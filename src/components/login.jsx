import React, { useContext, useState, setState, Component } from "react";
import Formeditor from "./form_editor";
import {getLoginOneResponse, getLoginTwoResponse, getLoginThreeResponse, getLoginDirectResponse} from './util';
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
// import loginFormDirect from "../jsondata/form_login_direct.json";
import { getCookie } from "../utilities/cookies";
import { touchRippleClasses } from "@mui/material";
import NavigationButton from "./navigation_button";
import { parseJwt } from "../utilities/parseJWT";
import { SignInButtonMS } from "./signInButtonMS";
import { useUserStore } from "../store/userStore";
import { propTypes } from "react-bootstrap/esm/Image";

// const internal_oauth_auth_url = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/authorize/"
// const ms_oauth_auth_url = process.env.REACT_APP_SSO_OAUTH_API_URL + "/authorize/"

// const internal_oauth_token_url = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/token/"
// const ms_oauth_token_url = process.env.REACT_APP_SSO_OAUTH_API_URL + "/token/"

// const ms_oauth_client_id = process.env.REACT_APP_MS_OAUTH_CLIENT_ID
// const internal_oauth_client_id = process.env.REACT_APP_FEAST_OAUTH_CLIENT_ID
// const redirect_uri = process.env.REACT_APP_ROOT_URL + "/callback/"

// TODO: See SO for correct method of state management:
// https://stackoverflow.com/questions/62525452/passing-state-vs-using-context-in-react-hooks

/* 10 Apr 25 - Begin class conversion to functional components 
* ```
State management is not supported in class-based components:
src/components/login.jsx
  Line 279:19:  React Hook "useContext" cannot be called in a class component.
* ```
*/
// async function oidcAuthorize() {
  
//   const code_challenge = sessionStorage.getItem('code_challenge')
//   const code_verifier = sessionStorage.getItem('code_verifier')

//   console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
//   console.log("FEAST OAuth: Contacting OAuth server at url: ", internal_oauth_auth_url)
//   console.log("FEAST OAuth: Using client ID: ", internal_oauth_client_id)
//   const response = await fetch(
//     `${internal_oauth_auth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${internal_oauth_client_id}`, {
//       // mode: "cors",
//       credentials: "include",
//       // headers: {"X-CSRFToken": "*"},
//       // headers: {"Access-Control-Allow-Origin": "https://feast.mgpc.biochemistry.gwu.edu"},
//       // headers: {"Access-Control-Allow-Origin": "https://login.microsoftonline.com"},
//     }
//   ).catch((error) => {
//     console.log("ERROR: " + error)
//     return false 
//   })
//   // console.log("---> OAuth response: ", response)
//   if(response.ok) {
//   if (response.url) {
//     const url = new URL(response.url)
//     // console.log("Found redirect URL: ", url)
//     window.location.replace(url)
//   }
//   else { 
//     /* error handling */
//     }
//   }
// }

// async function msGwSsoLogin() {
  
//   // const code_challenge = sessionStorage.getItem('code_challenge')
//   // const code_verifier = sessionStorage.getItem('code_verifier')

//   // console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
//   // console.log("SSO: Contacting OAuth server at url", ms_oauth_auth_url)
//   // const finalURL = `${ms_oauth_auth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${ms_oauth_client_id}&scope=user.read`
//   // window.location.replace(finalURL)

// }

// async function oidcGetToken(callback_code) {

//   const code_verifier = sessionStorage.getItem('code_verifier')

//   const headers = new Headers({
//     "Cache-Control": "no-cache",
//     "Content-Type": "application/json",
//   })

//     const res = await fetch(
//       `${internal_oauth_token_url}`, {
//         credentials: "include",
//         headers: headers,
//         method: 'POST',
//         body: JSON.stringify(
//           {
//             client_id: internal_oauth_client_id,
//             code: callback_code,
//             code_verifier: code_verifier,
//             redirect_uri: redirect_uri,
//             grant_type: 'authorization_code',
//           }
//         )
//       }
//     )
//     const response = await res.json()

//     const credentials = {
//       access_token: response.access_token,
//       token_type: response.token_type,
//       scope: response.scope,
//       refresh_token: response.refresh_token,
//       id_token: response.id_token,
//     }
    
//     return credentials
// }

// async function msGwuGetToken(callback_code) {

//   const code_verifier = sessionStorage.getItem('code_verifier')

//   const headers = new Headers({
//   //   "Cache-Control": "no-cache",
//     "Content-Type": "application/x-www-form-url-encoded",
//   })

//   const fullURL = `${ms_oauth_token_url}?client_id=${ms_oauth_client_id}&code=${callback_code}&redirect_uri=${redirect_uri}&code_verifier=${code_verifier}&grant_type=authorization_code`

//   const res = await fetch(
//     // `${oauth_sso_token_url}`, {
//     fullURL, {
//       // credentials: "include",
//       headers: headers,
//       method: 'POST',
//       mode: 'no-cors',
//       // body: JSON.stringify(
//       //   {
//       //     // scope: "optional space-separated e.g.: 'openid profile'"
//       //     client_id: client_id,
//       //     code: callback_code,
//       //     redirect_uri: redirect_uri,
//       //     grant_type: 'authorization_code',
//       //     // Per https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-access-token-with-a-certificate-credential
//       //     // code verifier should be exactly 43 characters long (!!)
//       //     code_verifier: code_verifier,
//       //   }
//       // )
//     }
//   )
//   const response = await res.json()
//   console.log("Got response: " + response)
//   // const credentials = {
//   //   access_token: response.access_token,
//   //   token_type: response.token_type,
//   //   scope: response.scope,
//   //   refresh_token: response.refresh_token,
//   //   id_token: response.id_token,
//   // }
  
//   // return credentials
// }


export default function Login(props) {

  // User information
  const storedUserInfo = useUserStore((state) => state.userInfo)
  const updateStoredUserInfo = useUserStore((state) => state.setUserInfo)
  // Callback info
  const currentCallback = useUserStore((state) => state.callback)
  const setCallback = useUserStore((state) => state.setCallback)
  // Dialog from server
  const storeDialog = useUserStore((state) => state.dialog)
  const resetStoreDialog = useUserStore((state) => state.removeDialog)
  // Stage of login progress
  const storeLoginStage = useUserStore((state) => state.loginStage)
  // FEAST-mediated login functions
  const storeLogin = useUserStore((state) => state.login)
  const oidcAuthorize = useUserStore((state) => state.oidcAuthorize)
  const oidcGetToken = useUserStore((state) => state.oidcGetToken)
  // GW SSO AuthN/Z options
  const gwSsoAuthN = useUserStore((state) => state.msGwSsoLogin)
  const gwSsoTokenExchange = useUserStore((state) => state.msGwuGetToken)
  // Overall credentials
  const previousCredentials = useUserStore((state) => state.userCredentials)

  // const handleUpdateCallback = (newCallback) => {
  //   updateCallback(newCallback)
  // }

  // const handleUpdateUserInfo = (newUserInfo) => {
  //   updateStoredUserInfo(newUserInfo)
  // }

  // const [myState, updateMyState] = useState({
  //   stage: 1,
  //   pageid:"login",
  //   navinfo:{
  //     login:[
  //       {id:"home", label: "Home", url: "/"},
  //       {id:"login", label: "Login", url: "/login"}
  //     ]
  //   },
  //   navparaminfo:{},
  //   auth_path: "",
  //   dialog:{
  //     status:false, 
  //     msg:""
  //   },
  //   redirect: "",
  //   code: "",
  // });

  const handleFeastLogin = async () => {
    await storeLogin()
  }

  const handleDialogClose = () => {
    // updateMyState(...myState, {dialog: {status: false}})
    resetStoreDialog()
    // var tmpState = this.state;
    // tmpState.dialog.status = false;
    // this.setState(tmpState);
  }

  // const handleLoginDirect = async () => {
  //   const result = await getLoginDirectResponse(loginFormDirect)
  //   if (result.status === 0){
  //     // console.log("===> Handling login, result was " + JSON.stringify(result))
  //     // var tmpState = this.state;
  //     // tmpState.dialog.status = true;
  //     // tmpState.dialog.msg = <div><ul> {result.errorlist} </ul></div>;
  //     updateMyState(...myState.dialog, {dialog: {msg: `<div><ul> {${result.errorlist}} </ul></div>`}});
  //     return;
  //   }
  //   console.log("===> Handling login, result was " + JSON.stringify(result))
  //   localStorage.setItem("access_csrf", getCookie('csrftoken'));
  //   console.log("---> Got CSRF token " + localStorage.getItem("access_csrf"))
  //   updateMyState(...myState, {stage: 2})
  //   // XXX? handleUpdateUserInfo(result)
  //   // XXX props.loginHandler(result)
  //   }

  const handleMsGwuSsoLogin = async () => {
    // alert("GWU SSO Options coming soon!")
    // return
    // XXX Needs attention, but we want a running demo!
    // NB: This response works (in that it tries contacting the MS server...)
    // const response = await msGwSsoLogin()
    await gwSsoAuthN()
  }

  const handleOidcAuthorize = async () => {
    const response = await oidcAuthorize()
  }

  // const parseOIDCCallback = () => {
  //   console.log("--- Current callback is " + currentCallback)
  //   return "ABCDEFG"
  //   // return currentCallback.search.split("=")[1]
  // }

  const handleOIDCCodeExchange = async () => {
    const callback = props.callback ? props.callback.search.split("=")[1] : ""
    await oidcGetToken(callback)
    // const credentials = await oidcGetToken(myState.oidcCallbackCode)
    // if (!credentials) {
    //   // Error handling
    // }
    // updateMyState(...myState, {stage: 4})
    // XXX props.onCodeExchange(credentials)
  }

  const handleMsGwuTokenExchange = async () => {
    // alert("GWU SSO Options coming soon!")
    // return
    // TODO: This response gets a cryptic "400: Bad Request" error from the server
    // The request is crafted per MS documentation here: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow#request-an-access-token-with-a-client_secret
    // Further development is blocked until Dhina 2/ GW IT responds
    // const credentials = await msGwuGetToken(myState.oidcCallbackCode)
    // updateMyState(myState, {stage: 4})
    await gwSsoTokenExchange()
    // XXX props.onCodeExchange(credentials)
  }

  const renderFullCredentials = () => {

    return JSON.stringify(previousCredentials)

    // const tokenValues = JSON.parse(localStorage.getItem('userIDTokenValues'))
    // const expirationTime = new Date(tokenValues['exp'] * 1000)
    // const formattedDate = expirationTime.toLocaleString()
    // return JSON.stringify({
    //   access_token: JSON.parse(localStorage.getItem('access_token')),
    //   idTokenFields: tokenValues,
    //   refreshToken: JSON.parse(localStorage.getItem('refresh_token')),
    //   expiration: "Expires: " + formattedDate.toString(),
      // fullCredentials: JSON.parse(localStorage.getItem('userCredentials')),
    // })

  }

  // window.history.pushState({}, null, props.initObj["webroot"] + "/login");

  // const storedUserInfo = {isAuthenticated: "farts"} // useUserStore.getState().userInfo
  // TODO - Pick up with these two lines ...
  // const storedUserInfo = {foo: "bar"} // useUserStore.getState().userInfo
  // const storedUserInfo = useUserStore.getState().userInfo
  
  // updateMyState({...myState})

  const loginStage = storeLoginStage
  let callback = ""
  // console.log("---> Found USER STAGE " + loginStage)
  
  if (props.callback) {
    // Handle callback
    callback = props.callback.search.split("=")[1]
    // setCallback(callback)
    // console.log("---> Found callback: " + callback)
  }

  // if (storedUserInfo.msg) {  // TODO: Does `msg` ever appear when a user is logged in?
    // console.log("---> Entering LOGIN: Userinfo is\n" + JSON.stringify(storedUserInfo))
    // updateMyState({...myState, stage: 1}) // user is not logged in
  // } 
  // if (storedUserInfo.isAuthenticated) {
    // updateMyState({...myState, stage: 2}) // user is logged in
  // }
  
  // if (currentCallback && !(currentCallback == "NULL")) {
    // console.log("Called back with code: " + JSON.stringify(props.callback))
    // updateState({stage: 3, oidcCallbackCode: parseOIDCCallback()})
    // updateMyState({...myState, stage: 3})
    // console.log("+++ Should we see something here? " + JSON.stringify(parseOIDCCallback()))
    // handleUpdateCallback(parseOIDCCallback())
  // } // user has authorized at OAuth server

  // const previousCredentials = localStorage.getItem('userCredentials')

  if (previousCredentials != {}) {
    // console.log("---> Found credentials:\n", props.userinfo.credentials)
    // updateMyState(...myState, {stage: 4})
  } // authorization code has been exchanged for final credentials

  // const store = useContext(userStoreContext)

  // updateState({...state, stage: -1})

/*
      <div className="leftblock" style={{width:"100%"}}>
        Stage: { state.stage }<br />
        User Info: { JSON.stringify(storedUserInfo) }<br />
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
          <button className="btn btn-outline-secondary" onClick={handleLoginDirect}>Login via FEAST</button>
          <SignInButtonMS />
        </div>
      </div>
*/
/*
      <div className="leftblock" style={{width: "100%"}}>
        Hello, world
      </div>
*/
  // XXX
  // console.log("---> Callback is " + callback)
  console.log("---> Previous credentials are " + JSON.stringify(previousCredentials))
  var cn = "";
  if (previousCredentials.access_token) {
    cn = (
      <div>
        <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        Callback code: { callback } // Should be null now!<br />
        Credentials: { renderFullCredentials() } // Complete credentials<br />
        Click below for access to GW-FEAST
        </div>
        <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
          {/* XXX testing-ui/dsviewer hardcoding */}
          <NavigationButton target="/gw-feast/browse/" text="Browse available files"></NavigationButton>
        </div>
      </div>
    )
    return ( 
      <div>
      <div className="pagecn" style={{background:"#fff"}}>
        <Alertdialog dialog={storeDialog} onClose={handleDialogClose}/>
        {cn}
      </div>
      </div>
    )
  }

  if (loginStage === 1){
    cn = (
      <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        User Info: { JSON.stringify(storedUserInfo) }<br />
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
          <button className="btn btn-outline-secondary" onClick={handleFeastLogin}>Login via FEAST</button>
          <SignInButtonMS />
        </div>
      </div>
    );
  }
  else if (loginStage === 2 && callback == ""){
    cn = (
      <div>
        <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        User Info: { JSON.stringify(storedUserInfo) }<br />
        Please click the button below to Authorize SMART actions within the FEAST ecosystem<br />
        </div>
        <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
          <button className="btn btn-outline-secondary" onClick={handleOidcAuthorize}>OIDC Authorize</button>
          <button className="btn btn-outline-secondary" onClick={handleMsGwuSsoLogin}>Login via GW (SSO)</button>
        </div>
      </div>
    )
  }
  else if (loginStage === 2 && callback != ""){
    cn = (
      <div>
        <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        Callback code: { callback }<br />
        Credentials: { JSON.stringify(previousCredentials) } // Should be null<br />
        Please click to complete authentication and authorization<br />
        </div>
        <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
          <button className="btn btn-outline-secondary" onClick={handleOIDCCodeExchange}>OIDC Exchange Code</button>
          {/* <button className="btn btn-outline-secondary" onClick={this.handleMsGwuTokenExchange}>GWU Get token</button> */}
        </div>
      </div>
    )
  }

  else if (loginStage === -1){
    cn =  (<Loadingicon/>);
  }
  // XXX
  // console.log("===> Login: Rendered? Stage: " + loginStage + " <===")
  // console.log("===> Login: All state: " + JSON.stringify(myState) + " <===")
  // console.log(`===> Current user info is ${JSON.stringify(storedUserInfo)}`)

  return (
    <div>
      <div className="pagecn" style={{background:"#fff"}}>
        <Alertdialog dialog={storeDialog} onClose={handleDialogClose}/>
        {cn}
      </div>
    </div>
  );
}

    
// export default Login;

