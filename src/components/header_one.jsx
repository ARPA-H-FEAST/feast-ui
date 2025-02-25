import React, { Component } from "react";
//import Navbar from 'navbar-react'
//import { Container} from 'react-containers';
import { Form, FormControl, Container, Button, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { Markup } from 'interweave';


class HeaderOne extends Component {

 


  render() {

    var navbarStyle =  { minHeight:"80px", color:"#ddd"}
    var server = process.env.REACT_APP_SERVER;
    if (server !== "prd"){
      navbarStyle.backgroundImage = 'url("/imglib/watermark.'+server+'.png")';
    }

    // console.log("headerlinks", this.props.initObj);
    var pageId = window.location.href.split("/")[3];
    pageId = (pageId.trim() === "" ? "home" : pageId);
    var sOne = {color:"#ccc", margin:"0 20px 0px 0px"};
    var sTwo = {color:"#aaa", margin:"0 20px 0px 0px"};
    var headerLinks = [];
    for (var i in this.props.initObj.headerlinks){
      var obj = this.props.initObj.headerlinks[i];  
      var s = (obj.id === pageId ? sOne : sTwo);
      headerLinks.push(<Nav.Link id={"link_" +obj.id} key={"link_" +obj.id} href={obj.url} style={{fontWeight:"bold"}} style={s}>{obj.label}</Nav.Link>)
    }

  

    return (
      <Navbar className="globalheader"  variant="dark" expand="lg" 
        style={navbarStyle}
        >
        <Container fluid>
          <Navbar.Brand href={this.props.initObj["webroot"]} className="globalheader_logo">
            <Markup content={this.props.initObj.logo} style={{color:"#ddd"}}/>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-lg-0" navbarScroll style={{fontSize:"22px", margin:"0px 0px 0px 30px"}}>
              {headerLinks}
              <NavDropdown title="About" id="navbarScrollingDropdown"
                style={{display:"none"}}
              >
                <NavDropdown.Item href="/lmsite/static//workflow">Integration Workflow</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action6">
                  Data Version 1.1
                </NavDropdown.Item>
                <NavDropdown.Item href="#action6">
                  Website Version 1.1
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default HeaderOne;
