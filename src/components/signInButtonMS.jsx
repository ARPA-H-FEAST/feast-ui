import React, { useContext } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../configs/authConfig";

/**
 * Renders a drop down button with child buttons for logging in with a popup or redirect
 * Taken from MS MSAL software under MIT license
 */
export const SignInButtonMS = () => {
    const { instance } = useMsal();

    const handleLogin = async () => {
            console.log("===> Clicked!")
            // await instance.loginRedirect(loginRequest).catch(e => {
            //     console.log(e);
            // });
            // await instance.acquireTokenRedirect(loginRequest).catch(e => {
            //     console.log(e);
            // });
            const response = await instance.loginRedirect(loginRequest).catch(e => {
                console.log(e);
            });
            console.log("===> Instance has returned. Response was " + JSON.stringify(response) + " ...")
    }
    return (
        <button 
            className="btn btn-outline-secondary" 
            onClick={() => handleLogin()}>
                Login via GW (SSO)
        </button>
    )
}