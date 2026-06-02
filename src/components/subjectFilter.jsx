import { ListItemSecondaryAction } from '@material-ui/core'
import { propTypes } from 'react-bootstrap/esm/Image'
import Select from 'react-select'

export default function SubjectFilter({ filterinfo, state, handler, clearFilter, searchHandler }) {

  // console.log("Subject filter: Got state " + JSON.stringify(state))
  // console.log("Subject filter: Got props " + typeof(filterinfo.search_fields))
  
  const searchFields = []
  const radioOptions = []

  const selectionBoxes = false
  const radioBoxes = true

  filterinfo.search_fields.forEach((field, idx) => {
    // console.log("Iterating over " + JSON.stringify(field.name) + ": " + JSON.stringify(field.levels));
    const theseOptions = []
    const radioList = []
    // console.log("Iterating over " + JSON.stringify(field.levels));
    field.levels.forEach((searchString) => {
      theseOptions.push({ "value": searchString, "label": searchString })
    })
    // console.log("Built options: " + JSON.stringify(theseOptions))
    searchFields.push({name: field.name, options: theseOptions})
  })

  var buttonStyle = {display: "block", float: "right", marginRight: "10px", fontSize: "14px"};

  // console.log("Created list: " + JSON.stringify(searchFields))
  return (
    <div style={{ minWidth: "250px" , overflow: "auto"}}>
      <div style={{ flexDirection: 'row', overflowX: "scroll"}}>
        <button 
          style={buttonStyle}
          className="btn btn-outline-secondary"
          onClick={clearFilter}
        >
          Clear selections
        </button>
        <button
          style={buttonStyle}
          className="btn btn-outline-secondary"
          onClick={searchHandler}
        >
          Search
        </button>
        </div>
      <br />
      {/* {selectionBoxes && searchFields.map((sf, index) => {
        return (
          <div key={index}>
            {sf.name}
            <Select 
              name={sf.name} 
              options={sf.options}
              key={sf.name+index}
              isMulti
            />
          </div>)
      })} */}
        { radioBoxes && searchFields.map((sf, index) => {
        return (
        <div key={sf.name+index}>
        <div style={{ fontWeight:"bold", height:40 }} key={index}>{sf.name}</div>
        <div style={{maxHeight:"400px", overflow: "auto"}} >
          { sf.options.map((opt, index2) => {
              // console.log("Iterating over subitem " + JSON.stringify(opt))
              const uniqueId = sf.name + "|" + opt.value
              return (
                <div style={{ overflowX: "scroll", whiteSpace: "nowrap"}} key={index2+"container"} >
                <input
                  type="checkbox"
                  id={uniqueId}
                  value={uniqueId}
                  checked={state.includes(uniqueId) ? true : false}
                  onClick={() => { /** No-op */ }}
                  onChange={() => { handler(uniqueId) }}
                  key={index2+"input"}
                / >
                <label style={{ paddingLeft: "10px"}} key={index2+"label"}>
                  {opt.label}
                </label>
                </div>)
                })
            }
        </div>
      </div>)
      })
    }
    </div>
)}