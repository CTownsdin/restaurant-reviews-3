import React, { Component, Fragment } from 'react'
import { RestaurantsContainer } from './RestaurantsContainer'
import DevTools from 'mobx-react-devtools'
import {inject, observer} from 'mobx-react'

// when it loads, do this...
// fetchNeighborhoods()
// fetchCuisines()
//

/* TODO: Reactify the map?  Maybe we don't have to do that part however. */
// We can inject the restaurantStore in to <AppMain /> thanks to the provider
@inject('restaurantStore')
@observer
class AppMain extends Component {

  componentDidMount() {
    this.props.restaurantStore.fetchRestaurants()
  }

  render() {
    const { restaurantStore } = this.props

    return <Fragment>
      <DevTools />
      <section id="map-container">
        <div tabIndex="0" id="map" role="application" aria-label="Map with restaurants"></div>
        <div id="app-map"></div>
      </section>

      <section>
        <div className="filter-options">
          <h2>Filter Results</h2>
          <div className="select-container">
            <select
              id="neighborhoods-select"
              name="neighborhoods"
              aria-label="select neighborhood"
              // onChange="updateRestaurants()" TODO: FIXME:
            >
              <option value="all">All Areas</option>
            </select>

            <select
              id="cuisines-select"
              name="cuisines"
              aria-label="select type of cuisine"
              // onChange="updateRestaurants()" TODO: FIXME:
            >
              <option value="all">All Cuisines</option>
            </select>
          </div>
        </div>
    
        <br/>
        <br/>
        <h2>There are {restaurantStore.restaurantsCount} restaurants</h2>

        <ul id="restaurants-list">
          <RestaurantsContainer />
        </ul>
        <ul id="app-restaurants"></ul>
      </section>
    </Fragment>
  }
}

export default AppMain

