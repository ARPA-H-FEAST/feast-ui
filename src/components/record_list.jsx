import { useLocation } from "react-router-dom";
import DatasetDetail from "./dataset_detail";

export default function RecordList (props) {
  const location = useLocation();


  var rowList = [];
  if (location.state !== undefined){
      if (location.state.rowlist !== undefined){
        rowList = location.state.rowlist;
      }
  }

  return (
     <DatasetDetail bcoId={props.bcoId}  initObj={props.initObj} rowList={rowList}/>
  );
};

