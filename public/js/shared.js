// const idb = require('idb');

// function getImageAltText(image) {
//   const altTexts = {
//     '1': 'bustling dining room with chandeliers',
//     '2': 'mozzarella cheese pizza with bubbly crust',
//     '3': 'dining room styled with wooden and lots of stainless steel',
//     '4': 'artistic photo of brick building shot from the corner exterior sidewalk',
//     '5': 'cook smiles while overlooking a busy cozy scene',
//     '6': 'a rustic dining room in a converted warehouse, with a large US flag decoration',
//     '7': 'black and white photo of concrete textured frontage of Superiority Burger joint',
//     '8': 'building with awning and sign above says the DUTCH',
//     '9': 'people casually eating and drinking water, beer, and wine, some browse on cellphones',
//     '10': 'modern white and chrome styled eating bar and seating area'
//   }
//   return altTexts[image.src.split('/').pop()];
// }


// function fetchRestaurants(callback) {
//   fetch('http://localhost:1337/restaurants')
//     .then(res => res.json())
//     .then(restaurants => {
//       pushAllRestaurantsIntoIndexedDB(restaurants)
//       return restaurants;
//     })
//     .then(restaurants => callback(null, restaurants))
//     .catch(err => callback(err, null))
// }


// function pushAllRestaurantsIntoIndexedDB(restaurants){
//   var dbPromise = idb.open('restaurantReviews', 1, function(upgradeDb) {
//     upgradeDb.createObjectStore('restaurants', { keyPath: 'id' })
//   });

//   dbPromise.then((db) => {
//     var tx = db.transaction('restaurants', 'readwrite');
//     var restaurantsStore = tx.objectStore('restaurants');
  
//     restaurants.forEach((restaurant) => restaurantsStore.put(restaurant));
//     return tx.complete;
//   }).then(function() {
//     console.log('Restaurants added');
//   });
// }

// function urlForRestaurant(restaurant) {
//   return `./restaurant.html?id=${restaurant.id}`
// }

// function mapMarkerForRestaurant(restaurant, map) {
//   const marker = new google.maps.Marker({
//     position: restaurant.latlng,
//     title: restaurant.name,
//     url: urlForRestaurant(restaurant),
//     map: map,
//     animation: google.maps.Animation.DROP,
//   })
//   return marker
// }

// function fetchRestaurantById(id, callback) {
//   fetchRestaurants((error, restaurants) => {
//     if (error) {
//       callback(error, null)
//     } else {
//       const restaurant = restaurants.find(r => r.id == id)
//       if (restaurant) {
//         callback(null, restaurant)
//       } else {
//         callback('Restaurant does not exist', null)
//       }
//     }
//   })
// }

// /*
// * Given an image, return a srcset for it.
// * like: srcset="/img/1-500px.jpg 500w, /img/1-1000px.jpg 1000w, /img/1-1500px.jpg 1500w"
// */
// function getImageSourceSet(image) {
//   const src = image.src.split('.')[0]
//   return `${src}-500px.jpg 500w, ${src}-1000px.jpg 1000w, ${src}-1500px.jpg 1500w`
// }

// module.exports = {
//   getImageAltText,
//   fetchRestaurants,
//   urlForRestaurant,
//   mapMarkerForRestaurant,
//   fetchRestaurantById,
//   getImageSourceSet
// }