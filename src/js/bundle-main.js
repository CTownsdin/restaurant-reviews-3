(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      if (request) {
        request.onupgradeneeded = function(event) {
          if (upgradeCallback) {
            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
          }
        };
      }

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

},{}],2:[function(require,module,exports){
let restaurants, neighborhoods, cuisines
let map
let markers = []
const getImageAltText = require('./shared').getImageAltText
const fetchRestaurants = require('./shared').fetchRestaurants
const urlForRestaurant = require('./shared').urlForRestaurant
const mapMarkerForRestaurant = require('./shared').mapMarkerForRestaurant
const fetchRestaurantById = require('./shared').fetchRestaurantById
const getImageSourceSet = require('./shared').getImageSourceSet

function getDatabaseUrl() {
  const port = 10000
  return `http://localhost:${port}/data/restaurants.json`
}

function fetchRestaurantByCuisine(cuisine, callback) {
  fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null)
    } else {
      const results = restaurants.filter(r => r.cuisine_type == cuisine)
      callback(null, results)
    }
  })
}

function fetchRestaurantByNeighborhood(neighborhood, callback) {
  fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null)
    } else {
      const results = restaurants.filter(r => r.neighborhood == neighborhood)
      callback(null, results)
    }
  })
}

function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
  fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null)
    } else {
      let results = restaurants
      if (cuisine != 'all') {
        results = results.filter(r => r.cuisine_type == cuisine)
      }
      if (neighborhood != 'all') {
        results = results.filter(r => r.neighborhood == neighborhood)
      }
      callback(null, results)
    }
  })
}

function fetchNeighborhoods(callback) {
  fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null)
    } else {
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods)
    }
  })
}

function fetchCuisines(callback) {
  fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null)
    } else {
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
      const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
      callback(null, uniqueCuisines)
    }
  })
}

function imageUrlForRestaurant(restaurant) {
  return `/img/${restaurant.photograph}`
}

function registerServiceWorker() {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('../sw.js').then(function(registration) {
    console.log(`SW registration successful with scope: ${registration.scope}`);
  }).catch(function() {
    console.log('Registration failed!');
  });
}

registerServiceWorker() // sw gets registered right here in main.js

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  fetchNeighborhoods()
  fetchCuisines()
})

fetchNeighborhoods = () => {
  fetchRestaurants((error, neighborhoods) => {
    if (error) {
      console.error(error)
    } else {
      self.neighborhoods = neighborhoods
      fillNeighborhoodsHTML()
    }
  })
}

fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select')
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option')
    option.innerHTML = neighborhood
    option.value = neighborhood
    select.append(option)
  })
}

fetchCuisines = () => {
  fetchRestaurants((error, cuisines) => {
    if (error) {
      console.error(error)
    } else {
      self.cuisines = cuisines
      fillCuisinesHTML()
    }
  })
}

fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select')

  cuisines.forEach(cuisine => {
    const option = document.createElement('option')
    option.innerHTML = cuisine
    option.value = cuisine
    select.append(option)
  })
}

/**
 * Initialize Google map, called from HTML, in api key string
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501,
  }
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false,
  })
  updateRestaurants()
}

updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select')
  const nSelect = document.getElementById('neighborhoods-select')

  const cIndex = cSelect.selectedIndex
  const nIndex = nSelect.selectedIndex

  const cuisine = cSelect[cIndex].value
  const neighborhood = nSelect[nIndex].value

  fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) {
      console.error(error)
    } else {
      resetRestaurants(restaurants)
      fillRestaurantsHTML()
    }
  })
}

resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = []
  const ul = document.getElementById('restaurants-list')
  ul.innerHTML = ''

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove())
  }
  self.markers = []
  self.restaurants = restaurants
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list')
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant))
  })
  addMarkersToMap()
}

// when we createRestaurantHTML, then we have the restaurant id, thusly
// "id": 1,
createRestaurantHTML = restaurant => {
  const li = document.createElement('li')

  const inputId = document.createElement('input')
  inputId.setAttribute('type', 'hidden');
  inputId.setAttribute('value', restaurant.id);

  const restaurantContainerDiv = document.createElement('div')
  restaurantContainerDiv.classList.add('restaurant-container')

  const topDiv = document.createElement('div')
  const image = document.createElement('img')
  image.className = 'restaurant-img'
  image.src = imageUrlForRestaurant(restaurant)
  image.srcset = getImageSourceSet(image)
  image.alt = getImageAltText(image)

  topDiv.append(image)

  const name = document.createElement('h2')
  name.innerHTML = restaurant.name

  const fav = document.createElement('div')
  console.log(`IS_FAVORITE IS: ${restaurant.id} ${restaurant.is_favorite}`);
  if (restaurant.is_favorite) {
    fav.removeAttribute("class", "far fa-angry")
    fav.setAttribute("class", "far fa-smile")
  } else {
    fav.removeAttribute("class", "far fa-smile")
    fav.setAttribute("class", "far fa-angry")
  }
  fav.onclick = handleClickFav;
  fav.appendChild(inputId)

  restaurantContainerDiv.append(topDiv)

  const bottomDiv = document.createElement('div')
  const neighborhood = document.createElement('p')
  neighborhood.innerHTML = restaurant.neighborhood

  const address = document.createElement('p')
  address.innerHTML = restaurant.address
  
  const viewDetails = document.createElement('a')
  viewDetails.innerHTML = 'View Details'
  viewDetails.href = urlForRestaurant(restaurant)

  bottomDiv.append(name)
  bottomDiv.append(fav)
  bottomDiv.append(neighborhood)
  bottomDiv.append(address)
  bottomDiv.append(viewDetails)
  bottomDiv.classList.add('restaurant-info')

  restaurantContainerDiv.append(bottomDiv)

  li.append(restaurantContainerDiv)
  return li
}

// Later, export this whole thing to shared, and reuse on main and restaurants.
handleClickFav = (e) => {
  const restaurantId = e.toElement.children[0].value

  if (e.toElement.classList[0] === "fas"){
    e.toElement.classList.replace("fas", "far")
    setFavorite(restaurantId, true)
  }
  else if (e.toElement.classList[0] === "far"){
    e.toElement.classList.replace("far", "fas")
    setFavorite(restaurantId, false)
  }
  fillRestaurantsHTML()
}

setFavorite = (restaurantId, isFav) => {
  const url = `http://localhost:1337/restaurants/${restaurantId}/?is_favorite=${isFav}`;
  console.log('setFav', isFav)
  console.log('url', url)
  fetch(url, {
    method: 'PUT'
  }).then(res => res.json)
  .then(json => console.log('setFav res json...', JSON.stringify(json, null, 2)))
  .catch(err => console.error('Error setting fav...', err));
}

addMarkersToMap = (restaurants = self.restaurants) => {
  console.log('adding markers to map');
  restaurants.forEach(restaurant => {
    const marker = mapMarkerForRestaurant(restaurant, self.map)
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    })
    self.markers.push(marker)
  })
}

},{"./shared":3}],3:[function(require,module,exports){
const idb = require('idb');

function getImageAltText(image) {
  const altTexts = {
    '1': 'bustling dining room with chandeliers',
    '2': 'mozzarella cheese pizza with bubbly crust',
    '3': 'dining room styled with wooden and lots of stainless steel',
    '4': 'artistic photo of brick building shot from the corner exterior sidewalk',
    '5': 'cook smiles while overlooking a busy cozy scene',
    '6': 'a rustic dining room in a converted warehouse, with a large US flag decoration',
    '7': 'black and white photo of concrete textured frontage of Superiority Burger joint',
    '8': 'building with awning and sign above says the DUTCH',
    '9': 'people casually eating and drinking water, beer, and wine, some browse on cellphones',
    '10': 'modern white and chrome styled eating bar and seating area'
  }
  return altTexts[image.src.split('/').pop()];
}

function fetchRestaurants(callback) {
  fetch('http://localhost:1337/restaurants')
    .then(res => res.json())
    .then(restaurants => {
      pushAllRestaurantsIntoIndexedDB(restaurants)
      return restaurants;
    })
    .then(restaurants => callback(null, restaurants))
    .catch(err => callback(err, null))
}

function pushAllRestaurantsIntoIndexedDB(restaurants){
  var dbPromise = idb.open('restaurantReviews', 1, function(upgradeDb) {
    upgradeDb.createObjectStore('restaurants', { keyPath: 'id' })
  });

  dbPromise.then((db) => {
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantsStore = tx.objectStore('restaurants');
  
    restaurants.forEach((restaurant) => restaurantsStore.put(restaurant));
    return tx.complete;
  }).then(function() {
    console.log('Restaurants added');
  });
}

function urlForRestaurant(restaurant) {
  return `./restaurant.html?id=${restaurant.id}`
}

function mapMarkerForRestaurant(restaurant, map) {
  const marker = new google.maps.Marker({
    position: restaurant.latlng,
    title: restaurant.name,
    url: urlForRestaurant(restaurant),
    map: map,
    animation: google.maps.Animation.DROP,
  })
  return marker
}

function fetchRestaurantById(id, callback) {
  fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null)
    } else {
      const restaurant = restaurants.find(r => r.id == id)
      if (restaurant) {
        callback(null, restaurant)
      } else {
        callback('Restaurant does not exist', null)
      }
    }
  })
}

/*
* Given an image, return a srcset for it.
* like: srcset="/img/1-500px.jpg 500w, /img/1-1000px.jpg 1000w, /img/1-1500px.jpg 1500w"
*/
function getImageSourceSet(image) {
  const src = image.src.split('.')[0]
  return `${src}-500px.jpg 500w, ${src}-1000px.jpg 1000w, ${src}-1500px.jpg 1500w`
}

module.exports = {
  getImageAltText,
  fetchRestaurants,
  urlForRestaurant,
  mapMarkerForRestaurant,
  fetchRestaurantById,
  getImageSourceSet
}
},{"idb":1}]},{},[2]);
