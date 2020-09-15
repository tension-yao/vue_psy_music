import originJsonp from 'jsonp'

export default function jsonp (url, data, options) {
  const newUrl = url + '?' + reParam(data)
  return new Promise((resolve, reject) => {
    originJsonp(newUrl, options, (err, res) => {
      if (!err) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}

function reParam (data) {
  const arr = []

  for (const [key, val] of Object.entries(data)) {
    arr.push(`${key}=${val}`)
  }

  return arr.join('&')
}
