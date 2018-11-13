import { action, observable, computed } from "mobx"

class RestaurantStore {
  @observable restaurants = []
  
  // ACTIONS
  @action addRestaurant = (restaurant) => {
    this.restaurants.push(restaurant)
  }

  @action fetchRestaurants = () => {
    const url = 'http://localhost:1337/restaurants'
    fetch(url).then(data => data.json())
      .then(json => this.restaurants = json)
      .catch(err => console.log('err fetching restaurants', err))
  }

  @computed get restaurantsCount() {
    return this.restaurants.length
  }
}

const restaurantStore = new RestaurantStore()
export default restaurantStore
