import * as React from 'react';
import { Link } from "react-router-dom";


export function getColumns(key, initObj){

  var colDict = {
    browseView:[
		{
        field: 'bcoid',
        headerName: 'BCOID',
        width: 150,
        headerClassName:"dgheader",
        cellClassName:"dgcell"
      },
      {
        field: 'id',
        headerName: 'FILE NAME',
        width: 150,
        headerClassName:"dgheader",
        cellClassName:"dgcell"
      },
		{
        field: 'detail',
        headerName: 'DETAILS',
        width: 750,
        headerClassName:"dgheader",
        cellClassName:"dgcell",
        renderCell: (params) => (
          	<span>
              { params.value.description }
              <Link className="reglink" to={{pathname: initObj["webroot"] + "/detail/" + params.value.bcoid}}>
                 ...view details
              	</Link>
            </span>
        ),
        sortComparator: (v1, v2) => v1.name.localeCompare(v2.name)
      }
    ],
    detailView: (params) => {
      const firstSample = params[0]
      // console.log("===> DetailView called <===\n"+ JSON.stringify(firstSample))
      const headerArray = []
      Object.keys(firstSample).forEach(col => {
        // console.log("Found element " + col);
        headerArray.push({
          field: col,
          headerName: col.toUpperCase(),
          width: 150,
          headerClassName: "dgheader",
          cellClassName: "dgcell",
        })
      });
      return headerArray
    }
  };

  return colDict[key]
}



