import { createContext, useContext, useRef } from 'react';
import { createStore, useStore, create } from 'zustand'
import { shallow } from 'zustand/shallow'

import * as LocalConfig from "../components/local_config"
import loginFormDirect from "../jsondata/form_login_direct.json"
import { getLoginDirectResponse } from '../components/util'
import { getCookie } from '../utilities/cookies'
import { parseJwt } from '../utilities/parseJWT'

const internal_oauth_auth_url = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/authorize/"
const ms_oauth_auth_url = process.env.REACT_APP_SSO_OAUTH_API_URL + "/authorize/"

const internal_oauth_token_url = process.env.REACT_APP_INTERNAL_OAUTH_API_URL + "/token/"
const ms_oauth_token_url = process.env.REACT_APP_SSO_OAUTH_API_URL + "/token/"

const ms_oauth_client_id = process.env.REACT_APP_MS_OAUTH_CLIENT_ID
const internal_oauth_client_id = process.env.REACT_APP_FEAST_OAUTH_CLIENT_ID
const redirect_uri = process.env.REACT_APP_ROOT_URL + "/callback/"

export const useUserStore = create((set, get) => ({
  
  // Basic variables
  authorized: false,
  authProvider: null,
  userInfo: {},
  userCredentials: {},
  userIDTokenDetails: {},
  // callback: "",
  dialog: "",
  isLoaded: false,
  loginStage: -1,

  /*** Function handlers ***/
  // Initial user information - ping the `whoami` endpoint
  getUserInfo: async () => {
    // console.log("---> Current state is " + JSON.stringify(this.userInfo))
    const requestOptions = {
      method: 'GET',
      credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.user_info;
    // console.log("---> Contacting login server at " + svcUrl)
    const res = await fetch(svcUrl, requestOptions)
    const response = await res.json()
    console.log("---> STORE: Got response " + JSON.stringify(response))
    set({userInfo: response, isLoaded: true})
    if (response.email) {
      set({loginStage: 2})  // Logged in, but not authorized yet
    } else if (response.msg) {
      set({loginStage: 1})  // Not logged in
    }
    // console.log("---> Revised state is " + JSON.stringify(this.userInfo))
  },
  // Basic, FEAST-mediated login
  login: async () => {
    const result = await getLoginDirectResponse(loginFormDirect)
    if (result.status === 0){
      console.log("===> Handling login, result was " + JSON.stringify(result))
      set({dialog: {msg: `<div><ul> {${result.errorlist}} </ul></div>`}});
      return;
    }
    console.log("===> Handling login, result was " + JSON.stringify(result))
    localStorage.setItem("access_csrf", getCookie('csrftoken'));
    console.log("---> Got CSRF token " + localStorage.getItem("access_csrf"))
    set({userInfo: result, loginStage: 2})
  },
  // FEAST-mediated authorization
  oidcAuthorize: async () => {
  
    const code_challenge = sessionStorage.getItem('code_challenge')
    const code_verifier = sessionStorage.getItem('code_verifier')
  
    console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
    console.log("FEAST OAuth: Contacting OAuth server at url: ", internal_oauth_auth_url)
    console.log("FEAST OAuth: Using client ID: ", internal_oauth_client_id)
    const response = await fetch(
      `${internal_oauth_auth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${internal_oauth_client_id}`, {
        // mode: "cors",
        credentials: "include",
        // headers: {"X-CSRFToken": "*"},
        // headers: {"Access-Control-Allow-Origin": "https://feast.mgpc.biochemistry.gwu.edu"},
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
  },
  // FEAST-mediated callback code exchange for token
  oidcGetToken: async (callback) => {

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
              code: callback,
              code_verifier: code_verifier,
              redirect_uri: redirect_uri,
              grant_type: 'authorization_code',
            }
          )
        }
      )
      const response = await res.json()
  
      // XXX console.log("Token Exchange: Got details - " + JSON.stringify(parseJwt(response.id_token)))

      const IdTokenInfo = parseJwt(response.id_token)

      set({
        userCredentials: {
          access_token: response.access_token,
          token_type: response.token_type,
          scope: response.scope,
          refresh_token: response.refresh_token,
          id_token: response.id_token,
        },
        userIDTokenDetails: parseJwt(response.id_token)
      })
  },
  // MS/GW SSO Authentication option
  msGwSsoLogin: async () => {
  
    // const code_challenge = sessionStorage.getItem('code_challenge')
    // const code_verifier = sessionStorage.getItem('code_verifier')
  
    // console.log("---> PKCE:\nChallenge: %s\nVerifier: %s", code_challenge, code_verifier)
    // console.log("SSO: Contacting OAuth server at url", ms_oauth_auth_url)
    // const finalURL = `${ms_oauth_auth_url}?response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&redirect_uri=${redirect_uri}&client_id=${ms_oauth_client_id}&scope=user.read`
    // window.location.replace(finalURL)
  
  },
  // MS/GW SSO Auth option (TODO)
  msGwuGetToken: async (callback) => {

    const code_verifier = sessionStorage.getItem('code_verifier')
  
    const headers = new Headers({
    //   "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-url-encoded",
    })
  
    const fullURL = `${ms_oauth_token_url}?client_id=${ms_oauth_client_id}&code=${callback}&redirect_uri=${redirect_uri}&code_verifier=${code_verifier}&grant_type=authorization_code`
  
    const res = await fetch(
      // `${oauth_sso_token_url}`, {
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
  },
  /**** ****/
  onAuthorize: (provider) => set((state) => ({
      authorized: true,
      provider: provider,
      })),
  setUserInfo: (newInfo) => set((state) => ({
      userInfo: newInfo,
  })),
  setCallback: (newCallback) => set((state) => ({
      callback: newCallback,
      // loginStage: 3,
  })),
  removeDialog: () => set((state) => ({dialog: ""})),
  })
)
