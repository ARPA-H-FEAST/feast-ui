import React, { Component } from "react";
import { Form, FormControl, Container, Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { NavLink } from 'react-router-dom'
import Searchbox from "./search_box";
import Usericon from "./user_icon";
import {getLogoutResponse} from "./util";


class HeaderTwo extends Component {

  handleLogout = () => {  
	getLogoutResponse().then(result => { 
      if (result.status === 1){
        localStorage.removeItem('userCredentials')
        window.location.href = this.props.initObj["webroot"] + "/login";
      } else {
        // Error handling
      }
    });
  }

  routeToLogin = () => {
    window.location.href = this.props.initObj["webroot"] + "/login"
  }

  render() {

    var idList = ["portal", "data", "api", "sparql", "gsa"];
    var pageId = window.location.href.split("/")[3];
    pageId = (pageId.trim() === "" ? "home" : pageId);
    var sTwo = {color:"#333", display:"block", float:"right", margin:"5px 5px 5px 40px", padding:"0px"};
    var sThree = {color:"#333", display:"block", float:"right", margin:"5px 5px 5px 0px",
      textAlign:"right", padding:"0px"};
    var headerLinks = [];
    // console.log("---> Header 2: User info is " + JSON.stringify(this.props.userinfo))
    if (this.props.userinfo !== undefined){
      if (!this.props.userinfo.email) {
      headerLinks.push(
        // None of Nav.Link, NavLink, or Link components are both functional and correct here. Use function calls as a shim
        // not worth fixing until the React version is updated.
        <Nav.Link id={"link_xx"} key={"link_xx"} to="/login" onClick={this.routeToLogin} style={sTwo}> Login
        </Nav.Link>
      );
    } else {
      headerLinks.push(
        <Nav.Link id={"link_xx"} key={"link_xx"} to="/login" onClick={this.handleLogout} style={sThree}>{ this.props.userinfo.email } | Logout
        </Nav.Link>
      );
    }

    headerLinks = headerLinks.reverse();
    var sFour = {width:"50%"};

    // <div className="rightblock" style={sFour}>

    return (
        <Container fluid>
          {headerLinks} 
        </Container>  
    );
    }
  }
} 
export default HeaderTwo;


