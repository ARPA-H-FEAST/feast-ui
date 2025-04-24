import React, { useContext } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../configs/authConfig";

/**
 * Renders a drop down button with child buttons for logging in with a popup or redirect
 * Taken from MS MSAL software under MIT license
 */
export const SignInButtonMS = () => {
    const { instance } = useMsal();

    // const userStore = 

    const handleLogin = () => {
            console.log("===> Clicked!")
            instance.loginRedirect(loginRequest).catch(e => {
                console.log(e);
            });
    }
    return (
        <button 
            className="btn btn-outline-secondary" 
            onClick={() => handleLogin()}>
                Login via GW (SSO)
        </button>
    )
}