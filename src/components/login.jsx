import React, { useContext, useState, setState, Component } from "react";
import Formeditor from "./form_editor";
import {getLoginOneResponse, getLoginTwoResponse, getLoginThreeResponse, getLoginDirectResponse} from './util';
import Alertdialog from './dialogbox';
import * as LocalConfig from "./local_config";

import Loadingicon from "./loading_icon";
import { getCookie } from "../utilities/cookies";
import { touchRippleClasses } from "@mui/material";
import NavigationButton from "./navigation_button";
import { parseJwt } from "../utilities/parseJWT";
import { SignInButtonMS } from "./signInButtonMS";
import { useUserStore } from "../store/userStore";
import { propTypes } from "react-bootstrap/esm/Image";

import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../configs/authConfig";
import { callMsGraph } from "../utilities/graph";

// TODO: See SO for correct method of state management:
// https://stackoverflow.com/questions/62525452/passing-state-vs-using-context-in-react-hooks

/* 10 Apr 25 - Begin class conversion to functional components 
* ```
State management is not supported in class-based components:
src/components/login.jsx
  Line 279:19:  React Hook "useContext" cannot be called in a class component.
* ```
*/

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
  const gwSsoAuthentication = useUserStore((state) => state.handleMSSsoAuth)
  const gwSsoTokenExchange = useUserStore((state) => state.msGwuGetToken)
  // Overall credentials
  const previousCredentials = useUserStore((state) => state.userCredentials)
  const isAuthorized = useUserStore((state) => state.authorized)

  const isMSAuthenticated = useIsAuthenticated()

  const { instance, accounts } = useMsal()
  const [ graphData, setGraphData ] = useState(null)


  const requestProfileData = async () => {
  
    console.log("Called request for user data")
    console.log("Accounts is: " + JSON.stringify(accounts))

    // instance.acquireTokenSilent({
    //   ...loginRequest,
    //   account: accounts[0],
    // }).then((response) => {
    //   callMsGraph(response.accessToken).then((response) => setGraphData(response))
    // })
    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    })
    console.log("Caught a response: " +JSON.stringify(response))
    callMsGraph(response.accessToken).then((response) => setGraphData(response))
  }

  const handleMsGwuSsoLogin = async () => {
    console.log("Called request for user data")

    // This works ...
    const tokenResponse = await instance.acquireTokenPopup(loginRequest)
    console.log("Got email response: " + JSON.stringify(Object.keys(tokenResponse)))
    
    console.log("Got ISS response: " + JSON.stringify(tokenResponse.idTokenClaims.iss))
    // console.log("Got access_token response: " + JSON.stringify(tokenResponse.accessToken))
    console.log("Got audience response: " + JSON.stringify(tokenResponse.idTokenClaims.aud))
    console.log("Got email response: " + tokenResponse.account.username)
    console.log("Got authority response: " + tokenResponse.account.authorityType)
    console.log("Got account info keys: " + JSON.stringify(Object.keys(tokenResponse.account)))
    // gwSsoAuthentication(response)
    // ...but these don't ...?(!?) - maybe due to the React Router?
    // Maybe see here(?) for patching: (YMMV) 
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/performance.md
    // const response = await instance.acquireTokenRedirect(loginRequest)
    // const response = await instance.loginRedirect(loginRequest)
    /**
     * (As of 25 Apr: "@azure/msal-browser": "^4.8.0","@azure/msal-react": "^3.0.7")
     * Buggy as all get out ...
     */
    // TODO: Record state in the store with MS authorization signature
    // console.log("Credentials are now: " + JSON.stringify(storedUserInfo))
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        todo: 'todo',
        tp: true,
        iss: tokenResponse.idTokenClaims.iss,
        email: tokenResponse.account.username,
        access_token: tokenResponse.accessToken,
      }),
      credentials: 'include',
    }
    
    const serviceURL = LocalConfig.apiHash.user_login_direct
    const response = await fetch(serviceURL, requestOptions)

    localStorage.setItem("access_csrf", getCookie('csrftoken'))
    console.log("---> Got CSRF token " + localStorage.getItem("access_csrf"))

    if (!response.ok) {
      // Error handling
      console.log("---> MS Authentication error: something something")
      return
    }
    const userInfo = await response.json()
    // Handle new login
    console.log("Got login information: " + JSON.stringify(userInfo))
    updateStoredUserInfo(userInfo)
  }

  const getMSAccounts = () => {
    const revisedAccounts = instance.getAllAccounts()
    console.log("Got revised account info: " + JSON.stringify(revisedAccounts))
  }

  const handleFeastLogin = async () => {
    await storeLogin()
  }

  const handleDialogClose = () => {
    resetStoreDialog()
  }

  const handleOidcAuthorize = async () => {
    const response = await oidcAuthorize()
  }

  const handleOIDCCodeExchange = async () => {
    // const callback = props.callback ? props.callback.search.split("=")[1] : ""
    await oidcGetToken(props.callback)
  }

  const handleMsGwuTokenExchange = async () => {
    await gwSsoTokenExchange()
  }

  const renderFullCredentials = () => {

    return JSON.stringify(previousCredentials)

    // TODO: Clean up the displayed data...?

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

  const loginStage = storeLoginStage
  
  // TODO - Auto redirect
  // if (props.callback) {
  //   handleOIDCCodeExchange()
  // }

  // XXX
  // console.log("---> Callback is " + callback)
  // console.log("---> Previous credentials are " + JSON.stringify(previousCredentials))
  var cn = "";
  if (isAuthorized) {
    cn = (
      <div>
        <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        Callback code: { props.callback } // Should be null now!<br />
        {/* Credentials: { renderFullCredentials() } // Complete credentials<br /> */}
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
        {/* {storeDialog && <Alertdialog dialog={storeDialog} onClose={handleDialogClose}/>} */}
        {cn}
      </div>
      </div>
    )
  }

  if (loginStage === 1){
    cn = (
      <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        {/* User Info: { JSON.stringify(storedUserInfo) }<br /> */}
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
          <button className="btn btn-outline-secondary" onClick={handleMsGwuSsoLogin}>Login via GW (SSO)</button>
          {/* <SignInButtonMS /> */}
          <button className="btn btn-outline-secondary" onClick={getMSAccounts}>Report MS Accounts</button>
        </div>
      </div>
    );
  }
  else if (loginStage === 2 && props.callback){
    cn = (
      <div>
        <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        Callback code: { props.callback }<br />
        {/* Credentials: { JSON.stringify(previousCredentials) } // Should be null<br /> */}
        Please click to authorize activity<br />
        </div>
        <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
          <button className="btn btn-outline-secondary" onClick={handleOIDCCodeExchange}>OIDC Exchange Code</button>
          {/* <button className="btn btn-outline-secondary" onClick={this.handleMsGwuTokenExchange}>GWU Get token</button> */}
        </div>
      </div>
    )}
  else if (loginStage === 2){
    cn = (
      <div>
        <div className="leftblock" style={{width:"100%"}}>
        Stage: { loginStage }<br />
        {/* User Info: { JSON.stringify(storedUserInfo) }<br /> */}
        Please click the button below to Authorize SMART actions within the FEAST ecosystem<br />
        </div>
        <div key={"login_btn_one"} className="leftblock " style={{width:"80%", margin:"10px 0px 0px 5%"}}>
          <button className="btn btn-outline-secondary" onClick={handleOidcAuthorize}>OIDC Authorize</button>
          {/* <button className="btn btn-outline-secondary" onClick={handleMsGwuSsoLogin}>Login via GW (SSO)</button> */}
        </div>
      </div>
    )
  }
  else if (loginStage === -1){
    cn =  (<Loadingicon/>);
  }

  return (
    <div>
      <div className="pagecn" style={{background:"#fff"}}>
        {/* {storeDialog && <Alertdialog dialog={storeDialog} onClose={handleDialogClose}/>} */}
        {cn}
      </div>
    </div>
  );
}
