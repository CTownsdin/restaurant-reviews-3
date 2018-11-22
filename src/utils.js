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

function imageUrlForRestaurant(restaurant) {
  return `/img/${restaurant.photograph}`
}

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

