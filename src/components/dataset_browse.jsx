import React, { Component } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom";
import Searchbox from "./search_box";
import Filter from "./filter";
import { filterObjectList } from './util';
import * as LocalConfig from "./local_config";
import Loadingicon from "./loading_icon";
import Alertdialog from './dialogbox';
import $ from "jquery";
import Tableview from "./table";
import {getColumns} from "./columns";
import { Markup } from 'interweave';


class DatasetBrowse extends Component {  
  
  state = {
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
  };

  componentDidMount() {
		const queryParameters = new URLSearchParams(window.location.search);
    var searchQuery = (queryParameters.get("query") === null ? "" : queryParameters.get("query"))
    this.setState({searchquery: searchQuery});
		this.updateData("");
   }


  
	updateData(searchQuery) {
 
    const access_csrf = localStorage.getItem("access_csrf")
    const credentials = JSON.parse(localStorage.getItem('userCredentials'))
    const id_token_values = JSON.parse(localStorage.getItem('userIDTokenValues'))
    if (!credentials || !credentials.access_token) {
      console.log("No user credentials located, redirecting")
      // This doesn't work yet, but at least renders *something*
      // see https://stackoverflow.com/a/45090151 for a possible workaround
      return <Redirect to='/login' />
    }
    const auth_url = id_token_values.iss + "/userinfo/"

    // console.log("---> Authorization: Bearer: " + credentials.access_token)
    // console.log("---> Authorization API endpoint: " + auth_url)
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
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          // console.log("RRR:", result);
    // var tmpState = this.state;
    // tmpState.isLoaded = true;          
          if (result.status !== 0) {
            // Set 'success' to zero
            // Error handling here
            this.setState({
              dialog: { status: true, msg: result.msg },
              objlist: []
            })
          }
          this.setState({
            objlist: result.recordlist,
            statobj: result.stats
          })
        },
      )
      .catch((error) => {
        console.log("Error on load: " + error)
        this.setState(
          {
            isLoaded: false,
            dialog: { msg: error, status: false }
          })
      }
      )
  }


  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  
  	handleKeyPress = (e) => {
   	if(e.key === "Enter"){
      	e.preventDefault();
      	this.handleSearch();
    	}
  	}
 

	handleSearch = () => {
		var searchQuery = ($("#query").val() === undefined ? this.state.searchquery : $("#query").val());
    	this.updateData(searchQuery)
    }



    handleFilterReset = () => {
        $('input[name="filtervalue"]:checkbox').prop("checked", false);
        this.setState({ filterlist: [] });
    };

    handleFilterApply = () => {
        var tmpList = $('input[name="filtervalue"]:checkbox:checked')
            .map(function () {return $(this).val();}).get(); // <----
        this.setState({ filterlist: tmpList });
    };

    handleFilterIcon = () => {
        $(".filterboxwrapper").toggle();
    };


    render() {

        // if (this.state.isLoaded === false){
        //      return <Loadingicon/>
        // }
		  if ("msg" in this.props.userInfo){  // TODO: Is "msg" ever included with successful user login?
            // Redirect to "login" if user isn't logged in upon arrival
            return <Redirect to="/login" />
    	  }
          const credentials = localStorage.getItem('userCredentials');
          if (credentials === null) {
            console.log("Credentials missing from user info " + JSON.stringify(this.props.userInfo))
            window.location.href = this.props.initObj["webroot"] + "/login";
          }
        // console.log("Rendering file list. User info is\n" + JSON.stringify(this.props.userInfo))

		  var filObjOne = filterObjectList(this.state.objlist, this.state.filterlist);
      var passedObjList = filObjOne.passedobjlist;
      var passedCount = passedObjList.length;
      //var filterInfo = filObjOne.filterinfo;

      var filObjTwo = filterObjectList(passedObjList, []);
      var filterInfo = filObjTwo.filterinfo;

      var batchSize = 20;
      var pageCount = parseInt(passedObjList.length / batchSize) + 1;
      const len = this.state.objlist ? this.state.objlist.length : 0
      pageCount = (len > 0 ? pageCount : 0);

      var startIdx = batchSize * (parseInt(this.state.pageIdx) - 1) + 1;
      var endIdx = startIdx + batchSize;
      endIdx = (endIdx > passedCount ? passedCount : endIdx);

      var filterHideFlag = "block";

      var tmpList = [];
      for (var i in this.state.filterlist) {
        var h = "<b>" + this.state.filterlist[i].split("|")[1] + "</b>";
        tmpList.push(h);
      }
      var resultSummary = ""
      // XXX console.log("State obj: " + JSON.stringify(passedObjList))
      if (this.state.statobj && "total" in this.state.statobj) {
        resultSummary = "<b>" + this.state.statobj.total + "</b> files found";
        if (tmpList.length > 0) {
          resultSummary += ", <b>" + passedObjList.length + "</b> shown after filters: ";
          resultSummary += "'" + tmpList.join("', '") + "'"
        }
        //resultSummary += ".";
      } else {
        resultSummary += "<b> No </b> files found"
      }

        var tableId = "tableone";
        var idField = "filename";
        var tableCols = getColumns(tableId, this.props.initObj);
        var tableRows = [];
        // XXX console.log("---> Building table. Total file count: " + passedObjList.length)
        for (var i in passedObjList){
            var obj = passedObjList[i];
            var o = {};
            // XXX console.log("Exploring tableCol object: " + JSON.stringify(obj))
          for (var j in tableCols){
            // XXX console.log("tableCols indexed item? ---> " + JSON.stringify(tableCols[j]))
            var f = (tableCols[j]["field"] === "id" ? idField : tableCols[j]["field"])
            // XXX console.log("Pulled 'f' value: " + JSON.stringify(f))
            o[tableCols[j]["field"]] = obj[f]
          }
          o["id"] = obj["file_represented"]
          o["detail"] =  {"bcoid":obj["bcoid"]};
				  tableRows.push(o)
        }

        if (!this.state.objlist) {
          return (
            <div>
                <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose} />
					 <div className="searchboxwrapper">
                    <Searchbox initObj={this.props.initObj} 
                        searchquery={this.state.searchquery}
                        onSearch={this.handleSearch} 
                        onKeyPress={this.handleKeyPress}
                    />
                </div>
               
                <div className="material-icons rightblock filtericoncn" onClick={this.handleFilterIcon}>tune</div>
                <div className="statscn"> 
						  <Markup content={resultSummary}/> 
                </div>
                <div className="searchresultscn">
                    <Tableview cols={tableCols} rows={tableRows} />
                </div>
            </div>
        )
        }

      return (
        <div>
          <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose} />
          <div className="searchboxwrapper">
            <Searchbox initObj={this.props.initObj}
              searchquery={this.state.searchquery}
              onSearch={this.handleSearch}
              onKeyPress={this.handleKeyPress}
            />
          </div>

          <div className="material-icons rightblock filtericoncn" onClick={this.handleFilterIcon}>tune</div>
          <div className="statscn">
            <Markup content={resultSummary} />
          </div>
          <div className="filterboxwrapper">
            <Filter
              filterinfo={filterInfo}
              filterlist={this.state.filterlist}
              resultcount={this.state.objlist.length}
              resultSummary={resultSummary}
              handleFilterApply={this.handleFilterApply}
              handleFilterReset={this.handleFilterReset}
            />
          </div>
          <div className="searchresultscn">
            <Tableview cols={tableCols} rows={tableRows} />
          </div>
        </div>
      );
    }
}

export default DatasetBrowse;
