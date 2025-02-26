import React, { Component } from "react";
import { Redirect } from "react-router-dom/cjs/react-router-dom";
import Searchbox from "./search_box";
import Filter from "./filter";
import { filterObjectList} from './util';
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
		//alert("in dataset_browse");
		const queryParameters = new URLSearchParams(window.location.search);
      var searchQuery = (queryParameters.get("query") === null ? "" : queryParameters.get("query"))
      var tmpState = this.state;
      tmpState.searchquery = searchQuery;
      this.setState(tmpState);
		this.updateData("");

   }


  
	updateData(searchQuery) {
 
	const access_csrf = localStorage.getItem("access_csrf")
    const credentials = JSON.parse(localStorage.getItem('userCredentials'))
    const id_token_values = JSON.parse(localStorage.getItem('userIDTokenValues'))

    const auth_url = id_token_values.iss

    if (!credentials || !credentials.access_token) {
        console.log("No user credentials located, redirecting")
        // This doesn't work yet, but at least renders *something*
        // see https://stackoverflow.com/a/45090151 for a possible workaround
        return <Redirect to='/login' />
    }

   	var reqObj = {"query":searchQuery};
		const requestOptions = {
      	method: 'POST',
      	headers: {
        		'Content-Type': 'application/json',
        		'X-CSRFToken': access_csrf,
                'Authorization': 'Bearer: ' + credentials.access_token,
                'Iss-Oauth': JSON.stringify(auth_url),  // This address + "/userinfo/" can confirm login state on the backend
      	},
      	body: JSON.stringify(reqObj),
      	credentials: 'include'
		};
		//alert(JSON.stringify(reqObj));
        // console.log("Found Authorization Bearer token: " + credentials.access_token)
  		const svcUrl = LocalConfig.apiHash.dataset_search;
   	fetch(svcUrl, requestOptions)
      	.then((res) => res.json())
      	.then(
        		(result) => {
            console.log("RRR:", result);
            var tmpState = this.state;
            tmpState.isLoaded = true;          
            if (result.status === 0){
                tmpState.dialog.status = true;
                tmpState.dialog.msg = result.error;
            }
            tmpState.objlist = result.recordlist;
            tmpState.statobj = result.stats;
            // console.log("Got response " + JSON.stringify(result.recordlist))
            // console.log("Got stats " + JSON.stringify(result.stats))
            this.setState(tmpState);
            //console.log("Request:",svcUrl);
        },
        (error) => {
          // console.log("Error on load: " + error)
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
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
        $('input[name="filtervalue"]:checkbox:checked').prop("checked", false);
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
        var pageCount = parseInt(passedObjList.length/batchSize) + 1;
        pageCount = (this.state.objlist.length > 0 ? pageCount : 0);

        var startIdx = batchSize * (parseInt(this.state.pageIdx) - 1) + 1;
        var endIdx = startIdx + batchSize;
        endIdx = (endIdx > passedCount ? passedCount : endIdx);

        var filterHideFlag = "block";

        var tmpList = [];
        for (var i in this.state.filterlist){
            var h = "<b>" + this.state.filterlist[i].split("|")[1] + "</b>";
            tmpList.push(h);
        }
        var resultSummary = ""
        if ("total" in this.state.statobj){
            resultSummary = "<b>" + this.state.statobj.total + "</b> files found";
            if (tmpList.length > 0){
                resultSummary += ", <b>" + passedObjList.length + "</b> shown after filters: ";
                resultSummary += tmpList.join("', '")
            }
            //resultSummary += ".";
        }

        var tableId = "tableone";
        var idField = "filename";
        var tableCols = getColumns(tableId, this.props.initObj);
        var tableRows = [];
        for (var i in passedObjList){
            var obj = passedObjList[i];
            var o = {};
            for (var j in tableCols){
                var f = (tableCols[j]["field"] === "id" ? idField : tableCols[j]["field"])
                o[tableCols[j]["field"]] = obj[f]
            }
            o["detail"] =  {"bcoid":obj["bcoid"], "label":"view details"};
				tableRows.push(o)
        }




        return (
            <div>
                <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
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
                <div className="filterboxwrapper">
                    <Filter
                        filterinfo={filterInfo}
                        filterlist={this.state.filterlist}
                        resultcount={this.state.objlist.length}
                        resultSummary={resultSummary}
                        handleFilterApply = {this.handleFilterApply}
                    />
                </div>
                <div className="searchresultscn">
                    <Tableview cols={tableCols} rows={tableRows}/>
                </div>
            </div>
        );
    }
}

export default DatasetBrowse;
