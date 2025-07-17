import { ListItemSecondaryAction } from '@material-ui/core'
import { propTypes } from 'react-bootstrap/esm/Image'
import Select from 'react-select'

export default function SubjectFilter({ filterinfo, state, handler }) {

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

  // console.log("Created list: " + JSON.stringify(searchFields))
  return (
    <div>
      {selectionBoxes && searchFields.map((sf, idx) => {
        return (
          <div>
            {sf.name}
            <Select 
              name={sf.name} 
              options={sf.options}
              isMulti
            />
          </div>)
      })}
      <br />
        {radioBoxes && searchFields.map((sf, idx) => {
        return (
        <div>
          {sf.name}
            {sf.options.map((opt, idx2) => {
              // console.log("Iterating over subitem " + JSON.stringify(opt))
              return (
                <div>
                <input
                  type="checkbox"
                  id={sf.name + opt.value}
                  value={sf.name + opt.value}
                  checked={state.includes(sf.name + opt.value) ? true : false}
                  onClick={() => { /** No-op */ }}
                  onChange={() => { handler(sf.name + opt.value) }}
                / >
                <label>
                  {opt.label}
                </label>
                </div>)
                })
          }
        </div>)
      })}
    </div>
  )

}