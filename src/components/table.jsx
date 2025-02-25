import * as React from 'react';
import { Link } from "react-router-dom";
import Box from '@mui/material/Box';
import Typography from "@material-ui/core/Typography";
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';


export default function Tableview(props) {


  const [sortModel, setSortModel] = React.useState([
    {
      field: 'scan_id',
      sort: 'asc',
    },
  ]); 

 
  var boxStyle = {
      height: 1000, width: '100%',  background:"#fff"
  };


  //initialState={{pagination: { paginationModel: {pageSize: 100,},},}}
  //pageSizeOptions={[10, 50, 100]}
  console.log("cols-2",props.cols);
  console.log("rows-2",props.rows);
  return (
    <Box sx={boxStyle}>
      <DataGrid sx={{ m: 2 }} 
        rows={props.rows}
        columns={props.cols}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        initialState={{pagination: { paginationModel: {pageSize: 100,},},}}
        pageSizeOptions={[10, 50, 100]}
        disableRowSelectionOnClick
        enableColumnAutosize={true}
        getRowHeight={() => 'auto'}  
    />
    </Box>
  );
}

