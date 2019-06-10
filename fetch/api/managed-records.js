import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

const pageSize = 10

async function retrieve (options = {}) {
  const {
    page = 1,
    colors = []
  } = options

  const url = constructRequestURL(page, colors)

  let body = []

  try {
    let response = await fetch(url)
    body = await response.json()
  } catch (error) {
    console.log('Request failed', error)
  }

  const pageResults = body.slice(0, 10)
  const nextPageResults = body.slice(10)

  const ids = pageResults.map(({id}) => id)

  const open = pageResults.filter(isOpen).map(decorateRecord)

  const closedPrimaryCount = pageResults.filter(
    (record) => isClosed(record) && isPrimary(record.color)
  ).length

  return {
    previousPage: page === 1 ? null : page - 1,
    nextPage: nextPageResults.length === 0 ? null : page + 1,
    ids,
    open,
    closedPrimaryCount
  }
}

export default retrieve;

function isOpen (record) {
  return record.disposition === 'open'
}

function isClosed (record) {
  return record.disposition === 'closed'
}

function isPrimary (color) {
  return ['red', 'yellow', 'blue'].includes(color)
}

function decorateRecord (record) {
  return Object.assign({}, record, {
    isPrimary: isPrimary(record.color)
  })
}

function constructRequestURL (page, colors) {
  return URI(window.path).search({
    // back-end only accepts single-member arrays when we use this key
    'color[]': colors,

    // we peek at first record of next page to determine existence
    limit: pageSize + 1,

    offset: (page - 1) * pageSize
  })
}
