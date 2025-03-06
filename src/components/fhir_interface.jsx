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


class FHIRInterface extends Component {  
  
  // state = {
	//   filterlist: [],
  //   objlist:[],
  //   statobj:{},
  //   pageIdx:1,
  //   pageBatchSize:5,
  //   pageStartIdx:1,
  //   pageEndIdx:5,
  //   listid:"",
  //   isLoaded:false,
  //   searchquery:"",
  //   dialog:{
  //     status:false, 
  //     msg:""
  //   }
  // };

  // componentDidMount() {
  //   console.log("---> FHIR Attempting to render ....")
  //  }

  postFHIRData() {
    alert("TBD");
  }
  
	getFHIRResponse() {
 
    const access_csrf = localStorage.getItem("access_csrf")
    const credentials = JSON.parse(localStorage.getItem('userCredentials'))
    const id_token_values = JSON.parse(localStorage.getItem('userIDTokenValues'))
    const auth_url = id_token_values.iss + "/userinfo/"
    if (!credentials || !credentials.access_token) {
        console.log("No user credentials located, redirecting")
        // This doesn't work yet, but at least renders *something*
        // see https://stackoverflow.com/a/45090151 for a possible workaround
        return <Redirect to='/login' />
    }
    console.log("---> Authorization: Bearer: " + credentials.access_token)
    console.log("---> Authorization API endpoint: " + auth_url)
    const requestOptions = {
        method: 'GET',
        // headers: {
        // 		'Content-Type': 'application/json',
        // 		'X-CSRFToken': access_csrf,
        //     'Authorization': 'Bearer: ' + credentials.access_token,
        //     'Iss-Oauth': auth_url,  // This address confirms login state on the backend
        // },
        body: JSON.stringify({}),
        credentials: 'include'
    };
    const svcUrl = LocalConfig.apiHash.fhir_endpoint;
    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log("---> Button: Got response " + JSON.stringify(result))
          if (result.status === 0){
            this.setState({
              dialog: {status: true, msg: result.msg},
              objlist: []
            })
          }
          this.setState({objlist: result.recordlist, statobj: result.stats})
      },
      )
      .catch((error) => {
        console.log("Error on load: " + error)
        this.setState(
          {
            isLoaded: false,
            dialog: {msg: error, status: false}
          })}
        )
    }


  // handleDialogClose = () => {
  //   var tmpState = this.state;
  //   tmpState.dialog.status = false;
  //   this.setState(tmpState);
  // }

  
  // 	handleKeyPress = (e) => {
  //  	if(e.key === "Enter"){
  //     	e.preventDefault();
  //     	this.handleSearch();
  //   	}
  // 	}
 

	// handleSearch = () => {
	// 	var searchQuery = ($("#query").val() === undefined ? this.state.searchquery : $("#query").val());
  //   	this.updateData(searchQuery)
  //   }



  //   handleFilterReset = () => {
  //       $('input[name="filtervalue"]:checkbox:checked').prop("checked", false);
  //       this.setState({ filterlist: [] });
  //   };

  //   handleFilterApply = () => {
  //       var tmpList = $('input[name="filtervalue"]:checkbox:checked')
  //           .map(function () {return $(this).val();}).get(); // <----
  //       this.setState({ filterlist: tmpList });
  //   };

  //   handleFilterIcon = () => {
  //       $(".filterboxwrapper").toggle();
  //   };
  
    render() {

        // if (this.state.isLoaded === false){
        //      return <Loadingicon/>
        // }
		  // if("msg" in this.props.userInfo){  // TODO: Is "msg" ever included with successful user login?
      //   // Redirect to "login" if user isn't logged in upon arrival
      //   return <Redirect to="/login" />
    	// }
      // TODO vs XXX
      // const credentials = localStorage.getItem('userCredentials');
      // if (credentials === null) {
      //   console.log("Credentials missing from user info " + JSON.stringify(this.props.userInfo))
      //   window.location.href = this.props.initObj["webroot"] + "/login";
      // }
      console.log("---> Rendering FHIR interface <---")
      return (
        <div>
          {/* <Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose} /> */}
          {/* <div className="material-icons rightblock filtericoncn" onClick={this.handleFilterIcon}>tune</div> */}
          Hello, World!
          <button className="btn btn-outline-secondary" onClick={this.getFHIRResponse}>Query FHIR for user sample</button>
          <button className="btn btn-outline-secondary" onClick={this.postFHIRData}>Upload JSON (TODO)</button>
          {/* <div className="statscn">
					  <Markup content={resultSummary}/> 
              </div>
              div className="filterboxwrapper">
                <Filter
                  filterinfo={filterInfo}
                  filterlist={this.state.filterlist}
                  resultcount={this.state.objlist.length}
                  resultSummary={resultSummary}
                  handleFilterApply = {this.handleFilterApply}
                />
              </div>
              <div className="searchresultscn">
                <Tableview cols={tableCols} rows={tableRows} />
              </div> */}
          </div>
      );
    }
}

export default FHIRInterface;
