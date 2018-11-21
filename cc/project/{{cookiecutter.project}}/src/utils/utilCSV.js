import Papa from 'papaparse'

export const parseCSV = (csv, sep='\t') => {
  if(!csv) return []

  let result = Papa.parse(csv, {delimiter: sep})
  
  let columns = result.data[0]
  let data = result.data.slice(1)
  
  let contentDictList = data.map(eachData => {
    let result = columns.reduce((o, col, i) => {
      o[col] = eachData[i]
      return o
    }, {})

    return result
  })

  return contentDictList
}
