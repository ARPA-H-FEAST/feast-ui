import React, { useContext, useState, setState, Component } from "react";
import Formeditor from "./form_editor";
import {getLoginOneResponse, getLoginTwoResponse, getLoginThreeResponse, getLoginDirectResponse} from './util';
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import { getCookie } from "../utilities/cookies";
import { touchRippleClasses } from "@mui/material";
import NavigationButton from "./navigation_button";
import { parseJwt } from "../utilities/parseJWT";
import { SignInButtonMS } from "./signInButtonMS";
import { useUserStore } from "../store/userStore";
import { propTypes } from "react-bootstrap/esm/Image";

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
  const gwSsoAuthN = useUserStore((state) => state.msGwSsoLogin)
  const gwSsoTokenExchange = useUserStore((state) => state.msGwuGetToken)
  // Overall credentials
  const previousCredentials = useUserStore((state) => state.userCredentials)

  const handleFeastLogin = async () => {
    await storeLogin()
  }

  const handleDialogClose = () => {
    resetStoreDialog()
  }

  const handleMsGwuSsoLogin = async () => {
    await gwSsoAuthN()
  }

  const handleOidcAuthorize = async () => {
    const response = await oidcAuthorize()
  }

  const handleOIDCCodeExchange = async () => {
    const callback = props.callback ? props.callback.search.split("=")[1] : ""
    await oidcGetToken(callback)
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
  let callback = ""
  
  if (props.callback) {
    // Handle callback
    callback = props.callback.search.split("=")[1]
  }

  // XXX
  // console.log("---> Callback is " + callback)
  // console.log("---> Previous credentials are " + JSON.stringify(previousCredentials))
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
        {storeDialog && <Alertdialog dialog={storeDialog} onClose={handleDialogClose}/>}
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

  return (
    <div>
      <div className="pagecn" style={{background:"#fff"}}>
        {storeDialog && <Alertdialog dialog={storeDialog} onClose={handleDialogClose}/>}
        {cn}
      </div>
    </div>
  );
}
