import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter } from "react-router-dom";
import { generatePKCE } from "./utilities/pkce";
// import userStore from './store/userStore';
// import { createContext, useContext } from 'react';
// import { createStore, useStore } from 'zustand'

// import { useUserStore, userStoreContext} from './store/userStore'

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './configs/authConfig';

generatePKCE()

// const userStore = createStore((set) => ({
//   authorized: false,
//   authProvider: null,
// }))

// const userStoreContext = createContext()
// const UserStore = useContext(userStoreContext)

const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize()

ReactDOM.render(
  <BrowserRouter>
    {/* <userStoreContext.Provider value={userStore}> */}
      <MsalProvider instance={msalInstance} >
        <App />
      </MsalProvider>
    {/* </userStoreContext.Provider> */}
  </BrowserRouter>,
  document.getElementById('root')
)

// ReactDOM.render(
//   <BrowserRouter>
//    <App />
//   </BrowserRouter>,
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
