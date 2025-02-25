import React, { Component } from "react";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';


class Nav extends Component {
  render() {
    var navLinks = [];
    for (var i in this.props.linkObjList){
		var linkObj = this.props.linkObjList[i];
      navLinks.push(
      	<Link to={linkObj["url"]} className="reglink">{linkObj["lbl"]}</Link>
		);
		if (i < this.props.linkObjList.length - 1){
			navLinks.push(<span>&nbsp;/&nbsp;</span>)
		}
    }

    return (
       	<div className="leftblock navcn">
          <DoubleArrowOutlinedIcon style={{color:"#2358C2", fontSize:"17px" }}/>
        		&nbsp; 
				{navLinks}
			</div>
    );
  }
}

export default Nav;





