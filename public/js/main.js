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
