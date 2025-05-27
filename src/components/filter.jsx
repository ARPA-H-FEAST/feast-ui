import React, { useState, useEffect, Component } from "react";
import { Markup } from 'interweave';
import { ThreeSixtySharp } from "@material-ui/icons";


export default function Filter(props) {

  var filterInfo = props.filterinfo;
  // TODO: Filtering out the link for access categories that have it is not straightforward, 
  // given this wonky setup for filtering out strings...
  // console.log("---> Filter info: " + JSON.stringify(filterInfo))

  var divList = [];
  var catList = Object.keys(filterInfo).sort()
  // if (catList.indexOf("species") !== -1){
  //     const idx = catList.indexOf("species");
  //     const x = catList.splice(idx, 1);
  //     catList.unshift("species");
  // }

  const handleClick = (event) => {
    props.handleCheckboxAction(event.target.value)
  }

  for (var c in catList) {
    var catName = catList[c];
    // console.log("Handling category: " + catName)
    // var catNameLbl = catName.substr(0,1).toUpperCase() + catName.substr(1);
    // catNameLbl = catNameLbl.replace("_", " ");
    let catNameLbl = catName.replace("_", " ");
    var rList = [];
    var catValues = filterInfo[catName];
    var catValList = Object.keys(catValues).sort();
    //for (var catVal in catValues){
    for (var j in catValList){
      var catVal = catValList[j];
      var count = catValues[catVal]
      var combo = catName + "|" + catVal;
      // console.log("---> Working with 'combo' + " + combo)
      // var catValLbl = catVal.substr(0,1).toUpperCase() + catVal.substr(1);
      var catValLbl = catVal;
      if (catName === "file_type"){
        catValLbl = catVal.toUpperCase();
      }

      var isChecked = (props.filterlist.indexOf(combo) === -1 ? false : true)
      // TODO: Pick up linked category info where possible
      // let hasLink = catVal.link ? catVal.link : false;
      // console.log("Category " + catVal + " has link? : " + hasLink)
      rList.push(
        <tr key={combo} >
          <td valign="top" style={{paddingLeft:"10px"}} key={combo + "-data"} >
            <input
              name="filtervalue" 
              id="filtervalue" 
              type="checkbox"
              checked={isChecked} 
              value={combo} 
              onChange={() => {/* No-op */}}
              onClick={handleClick}
              >
            </input>
          </td>
          <td valign="top" style={{paddingLeft:"10px", fontSize:14}} key={catValLbl} >
            {catValLbl} ({count})
          </td>
        </tr>);
    }
    divList.push(
      <div className="filter_div_two">
        <table style={{padding:"0px 0px 0px 10px"}}>
          <tbody>
            <tr key={catNameLbl}>
              <td colSpan="2" style={{fontWeight:"bold", height:40}}>
                By {catNameLbl}
              </td>
            </tr>
            {rList}
          </tbody>
        </table>
      </div>
    );
  }


  var btnStyle = {display: "block",float: "right",marginRight: "10px",fontSize: "14px"};
  var iconStyle = {display:"none",color:"#555", float:"right", width:"25px",  marginLleft:"3px"};
  var msgStyle = { display: "block", float: "left", fontSize: "12px", margin: "5px 0px 0px 5px"};

  return (
    <div className="leftblock filter_div_one">
        <div id="filtercn" >
          {divList}
        </div>
      <div className="filterbtnscn">
          <button onClick={props.handleFilterReset}
              className="btn btn-outline-secondary" style={btnStyle}>Reset</button>
          {/* <button onClick={this.props.handleFilterApply}
              className="btn btn-outline-secondary" style={btnStyle}>Apply</button> */}
      </div>
    </div>
  );
}

