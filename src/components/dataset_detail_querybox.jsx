import { useState } from "react"
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';

export default function DetailQueryBox({ /* handleKeyPress */ handleSearch }) {

    const [state, setState] = useState({})

    const searchExamples = ["sample 1", "sample2", "etc."]

    // console.log("Search box: Recovered filter info is: " + JSON.stringify(filterinfo))

    const handleChange = (e) => {
        if(e.key == "Enter") {
          e.preventDefault()
          handleSearch(e)
        }
    }

    return (
      <div>
        <div className="search_label">Data Query</div>
        <div className="search_paper_wrapper"> 
          {/* elevation="0": Paper component failure */}
            <Paper component="form" className="searchbox_paper">
              <InputBase id="query" className="searchbox_input"  
                defaultValue="Test Query"
                inputProps={{
                    'aria-label': 'Blah blah', 
                    'style': {fontSize: "14px", color:"#777"}
                }}
                // onSubmit={handleSearch}
                onKeyPress={handleChange}
              />          
            <div onClick={handleSearch} className="material-icons search_icon">search</div>
            </Paper>
        </div>
        <div className="search_examples">{searchExamples}</div>
      </div>
    );

}