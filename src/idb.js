import idb from 'idb'

var dbPromise = idb.open('test', 1, function(upgradeDb){
  var myStore = upgradeDb.createObjectStore('myStore')
  myStore.put('value', 'key')
})

