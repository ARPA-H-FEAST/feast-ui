import React, { Component } from "react";
import Alertdialog from './dialogbox';
import Loadingicon from "./loading_icon";
import * as LocalConfig from "./local_config";
import { Link } from "react-router-dom";
import DoubleArrowOutlinedIcon from '@material-ui/icons/DoubleArrowOutlined';
import { Markup } from 'interweave';
import Nav from "./nav"
import $ from "jquery";


class StaticPage extends Component {
  
  state = {
    tabidx:"sampleview",
    dialog:{
      status:false, 
      msg:""
    }
  };

  

  handleDialogClose = () => {
    var tmpState = this.state;
    tmpState.dialog.status = false;
    this.setState(tmpState);
  }

  componentDidMount() {

    $(document).on('click', '.faqquestion', function (event) {
        event.preventDefault();
        var jqId = "#answer_" + this.id.split("_")[1];
        $(jqId).toggle();
    });

    var reqObj = {pageid:this.props.pageId};
    const requestOptions = { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqObj)
    };
    const svcUrl = LocalConfig.apiHash.dataset_static_content;

    fetch(svcUrl, requestOptions)
      .then((res) => res.json())
      .then(
        (result) => {
          var tmpState = this.state;
          tmpState.response = result;
          tmpState.isLoaded = true;          
          if (tmpState.response.status == 0){
            tmpState.dialog.status = true;
            tmpState.dialog.msg = tmpState.response.error;
          }
          console.log("Request:",svcUrl);
          console.log("AAAA", result);
          this.setState(tmpState);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }


  handleTitleClick = (e) => {

    var tmpState = this.state;
    tmpState.tabidx = e.target.id.split("-")[0];
    this.setState(tmpState);
  };



  render() {

    if (!("response" in this.state)){
      return <Loadingicon/>
    }
    var pageIdLabel = this.props.pageId.toUpperCase();
    var pageCn = ( this.state.dialog.status === true ? "no content found" : this.state.response.record.cn);


	var linkObjList = [
      {"url":this.props.initObj["webroot"], "lbl":"HOME"},
      {"url":this.props.initObj["webroot"] + "/static/" + this.props.pageId, "lbl":pageIdLabel}
   ];

    return (
		<div className="leftblock" style={{width:"100%"}}>
			<Nav linkObjList={linkObjList}/>
			<div className="pagecn" style={{width:"90%", margin:"0px 5% 0px 5%"}}>
        		<Alertdialog dialog={this.state.dialog} onClose={this.handleDialogClose}/>
        		<div className="leftblock" style={{width:"100%", margin:"0px 0px 0px 0px"}}>
          		<Markup content={pageCn}/>
        		</div>
      	</div>
		</div>
    );
  }
}

export default StaticPage;
