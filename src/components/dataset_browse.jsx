import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom";
import Searchbox from "./search_box";
import Filter from "./filter";
import { filterObjectList } from './util';
import * as LocalConfig from "./local_config";
import Loadingicon from "./loading_icon";
import Alertdialog from './dialogbox';
import $ from "jquery";
import Tableview from "./table";
import { getColumns } from "./columns";
import { Markup } from 'interweave';
import { Card, CardContent } from "@mui/material";

import { useUserStore } from "../store/userStore";
import { type } from "@testing-library/user-event/dist/type";

export default function DatasetBrowse(props) {  
  
  const [state, setState] = useState({
      filterlist: [],
      objlist:[],
      statobj:{},
      pageIdx:1,
      pageBatchSize:5,
      pageStartIdx:1,
      pageEndIdx:5,
      listid:"",
      isLoaded:false,
      searchquery:"",
      dialog:{
        status:false, 
        msg:""
      }
    })

const userCredentials = useUserStore((state) => state.userCredentials)
const userIDTokenValues = useUserStore((state) => state.userIDTokenDetails)
const storedUserInfo = useUserStore((state) => state.userInfo)

useEffect(() => {
  console.log("********* MOUNT TRIGGERED *********")
  const queryParameters = new URLSearchParams(window.location.search);
  var searchQuery = (queryParameters.get("query") === null ? "" : queryParameters.get("query"))
  setState({searchquery: searchQuery});
  updateData("");
  }, [])

  // useEffect(() => {
  //   console.log("->>> State updated...? " + JSON.stringify(state.filterlist))
  // }, [state.filterlist])

const updateData = async (searchQuery) => {

  const access_csrf = localStorage.getItem("access_csrf")
  // const credentials = JSON.parse(localStorage.getItem('userCredentials'))
  // const id_token_values = JSON.parse(localStorage.getItem('userIDTokenValues'))
  if (!userCredentials || !userCredentials.access_token) {
    console.log("No user credentials located, redirecting")
    // This doesn't work yet, but at least renders *something*
    // see https://stackoverflow.com/a/45090151 for a possible workaround
    return <Redirect to='/login' />
  }
  // XXX console.log("---> ID Tokens: " + userIDTokenValues + " (credentials: " + JSON.stringify(userCredentials) + ")")
  const auth_url = userIDTokenValues.iss + "/userinfo/"

  var reqObj = { "query": searchQuery };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': access_csrf,
      'Authorization': 'Bearer: ' + credentials.access_token,
      'Iss-Oauth': auth_url,  // This address confirms login state on the backend
    },
    body: JSON.stringify(reqObj),
    credentials: 'include'
  };
  const svcUrl = LocalConfig.apiHash.dataset_search;
  const response = await fetch(svcUrl, requestOptions)
  if (!response.ok) {
    // Error handling
    console.log("Error on data collection")
  }
  const result = await response.json()
  // TODO: Per this log line, each access_category correctly recieves "name" and
  // "link". `filterObjectList` strips the useful information before the `Filter`
  // component can render a link, however.
  // console.log("Got objlist: " + JSON.stringify(result.recordlist))
  setState({...state, objlist: result.recordlist, statobj: result.stats})
  }

  const handleDialogClose = () => {
    // var tmpState = state;
    // tmpState.dialog.status = false;
    // setState(tmpState);
    console.log("TODO ...")
  }

  const handleKeyPress = (e) => {
    if(e.key === "Enter"){
      e.preventDefault();
      handleSearch();
    }
  }


  const handleSearch = () => {
    const searchQuery = ($("#query").val() === undefined ? state.searchquery : $("#query").val());
      updateData(searchQuery)
  }

  const handleFilterReset = () => {
    $('input[name="filtervalue"]:checkbox').prop("checked", false);
    setState({...state, filterlist: [] });
  };

  const handleCheckboxAction = (combo) => {
      if (!state.filterlist.includes(combo)){
        setState({ ...state, filterlist: [...state.filterlist, combo] });
      } else {
        setState({ ...state, filterlist: state.filterlist.filter((currentItem) => {
          return combo !== currentItem
        })})
      }
    }

  const handleFilterIcon = () => {
      $(".filterboxwrapper").toggle();
  };


  const credentials = userCredentials
  // const credentials = localStorage.getItem('userCredentials');
  if (!credentials.access_token) {
    console.log("Credentials missing from user info " + JSON.stringify(storedUserInfo))
    window.location.href = props.initObj["webroot"] + "/login";
  }
  // console.log("Rendering file list. User info is\n" + JSON.stringify(props.userInfo))

  var filObjOne = filterObjectList(state.objlist, state.filterlist);
  var passedObjList = filObjOne.passedobjlist;
  var passedCount = passedObjList.length;
  //var filterInfo = filObjOne.filterinfo;

  var filObjTwo = filterObjectList(passedObjList, []);
  var filterInfo = filObjTwo.filterinfo;

  var batchSize = 20;
  var pageCount = parseInt(passedObjList.length / batchSize) + 1;
  const len = state.objlist ? state.objlist.length : 0
  pageCount = (len > 0 ? pageCount : 0);

  var startIdx = batchSize * (parseInt(state.pageIdx) - 1) + 1;
  var endIdx = startIdx + batchSize;
  endIdx = (endIdx > passedCount ? passedCount : endIdx);

  var filterHideFlag = "block";

  var tmpList = [];
  for (var i in state.filterlist) {
    // console.log("Iterating over i: " + JSON.stringify(i) + " - " + JSON.stringify(state.filterlist[i]))
    var h = "<b>" + state.filterlist[i].split("|")[1] + "</b>";
    tmpList.push(h);
  }
  var resultSummary = ""
  // XXX console.log("State obj: " + JSON.stringify(passedObjList))
  if (state.statobj && "total" in state.statobj) {
    resultSummary = "<b>" + state.statobj.total + "</b> items found";
    if (tmpList.length > 0) {
      resultSummary += ", <b>" + passedObjList.length + "</b> shown after filters: ";
      resultSummary += "'" + tmpList.join("', '") + "'"
    }
    //resultSummary += ".";
  } else {
    resultSummary += "<b> No </b> items found"
  }

  var tableId = "tableone";
  var idField = "filename";
  var tableCols = getColumns(tableId, props.initObj);
  var tableRows = [];
  // console.log("---> Building table. Total file count: " + passedObjList.length)
  for (var i in passedObjList){
      var obj = passedObjList[i];
      var o = {};
      // console.log("Exploring tableCol object: " + JSON.stringify(obj))
    for (var j in tableCols){
      // XXX console.log("tableCols indexed item? ---> " + JSON.stringify(tableCols[j]))
      var f = (tableCols[j]["field"] === "id" ? idField : tableCols[j]["field"])
      // XXX console.log("Pulled 'f' value: " + JSON.stringify(f))
      o[tableCols[j]["field"]] = obj[f]
    }
    o["detail"] =  { "bcoid": obj["bcoid"], "description": obj["usability_domain"]};
    for(const idx in obj["files_represented"]) {
      // Deep copies to provide unique rows per filename
      const clonedObject = JSON.parse(JSON.stringify(o))
      const fileName = obj["files_represented"][idx]
      // console.log("---> Found file name " + fileName)
      clonedObject["id"] = fileName
      tableRows.push(clonedObject)
    }
  }

  if (!state.objlist) {
    return (
      <div>
          {/* <Alertdialog dialog={state.dialog} onClose={handleDialogClose} /> */}
      <div className="searchboxwrapper">
              <Searchbox initObj={props.initObj} 
                  searchquery={state.searchquery}
                  onSearch={handleSearch} 
                  onKeyPress={handleKeyPress}
              />
          </div>
          
          <div className="material-icons rightblock filtericoncn" onClick={handleFilterIcon}>tune</div>
          <div className="statscn"> 
        <Markup content={resultSummary}/> 
          </div>
          <div className="searchresultscn">
              <Tableview cols={tableCols} rows={tableRows} />
          </div>
      </div>
  )
  }

  // XXX
  // console.log("Initialized - with filter info: " + JSON.stringify(filterInfo))

  return (
    <div>
      {/* <Alertdialog dialog={state.dialog} onClose={handleDialogClose} /> */}
      <div className="searchboxwrapper">
        <Searchbox initObj={props.initObj}
          searchquery={state.searchquery}
          onSearch={handleSearch}
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="material-icons rightblock filtericoncn" onClick={handleFilterIcon}>tune</div>
      <div className="statscn">
        <Markup content={resultSummary} />
      </div>
      <div className="filterboxwrapper">
        <Filter
          filterinfo={filterInfo}
          filterlist={state.filterlist}
          resultcount={state.objlist.length}
          resultSummary={resultSummary}
          handleCheckboxAction={handleCheckboxAction}
          handleFilterReset={handleFilterReset}
        />
      </div>
      <div className="searchresultscn">
        <Tableview cols={tableCols} rows={tableRows} />
      </div>
    </div>
  );
}
