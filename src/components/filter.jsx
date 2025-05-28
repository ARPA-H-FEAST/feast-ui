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

    for (var j in catValList){

      // Check if the item is a single key: value, or an object (with a count and link)
      var catValKey = catValList[j];
      const catValItem = catValues[catValKey]
      let count = "" 
      let link = null 
      if (typeof(catValItem) == "number") {
        count = catValItem
      } else {
        count = catValItem.count
        link = catValItem.link
      }

      const catValCount = count

      // console.log("Cat val: " + JSON.stringify(catValKey))
      // var count = catValues[catVal]
      var combo = catValKey + "|" + catValCount;
      // console.log("---> Working with 'combo' + " + combo)
      // var catValLbl = catVal.substr(0,1).toUpperCase() + catVal.substr(1);
      var catValLbl = catValKey;
      if (catName === "file_type"){
        catValLbl = catValKey.toUpperCase();
      }

      var isChecked = (props.filterlist.indexOf(combo) === -1 ? false : true)
      // TODO: Pick up linked category info where possible
      // console.log("Category " + catValKey + " has link? : " + link)
      link !== null ?
        rList.push(
          <tr key={combo} >
            <td valign="top" style={{paddingLeft:"10px"}} key={combo + "-data"} >
                {/* <td> */}
                <input
                  name="filtervalue" 
                  id={combo}
                  // target={link}
                  type="checkbox"
                  checked={isChecked} 
                  // value={combo}
                  onChange={() => {/* No-op */}}
                  onClick={handleClick}
                  / >
                <label for={combo} style={{paddingLeft:"10px", fontSize:14}}>{catValLbl} ({catValCount})  <a href={link} target="_blank" >(About data...)</a> </label>
            </td>
          </tr>) : 
        rList.push(
          <tr key={combo} >
            <td valign="top" style={{paddingLeft:"10px"}} key={combo + "-data"} >
              <input
                name="filtervalue" 
                id="filtervalue" 
                type="checkbox"
                checked={isChecked} 
                // value={combo} 
                onChange={() => {/* No-op */}}
                onClick={handleClick}
                >
              </input>
              <label for={combo} style={{paddingLeft:"10px", fontSize:14}}>{catValLbl} ({catValCount})</label>
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

