import * as React from 'react';
import { Link } from "react-router-dom";


export function getColumns(key, initObj){

  var colDict = {
    tableone:[
      {
        field: 'id',
        headerName: 'FILE NAME',
        width: 400,
        headerClassName:"dgheader",
        cellClassName:"dgcell"
      },
		{
        field: 'bcoid',
        headerName: 'BCOID',
        width: 150,
        headerClassName:"dgheader",
        cellClassName:"dgcell"
      },
		{
        field: 'detail',
        headerName: 'DETAILS',
        width: 500,
        headerClassName:"dgheader",
        cellClassName:"dgcell",
        renderCell: (params) => (
          	<span>
            	<Link className="reglink" to={{pathname: initObj["webroot"] + "/detail/" + params.value.bcoid}}>
               	{params.value.label}
              	</Link>
            </span>
        ),
        sortComparator: (v1, v2) => v1.name.localeCompare(v2.name)
      }
    ],
    tabletwo:[

    ]
  };

  return colDict[key]
}



