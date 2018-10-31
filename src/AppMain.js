import React, { Component, Fragment } from 'react'
import { RestaurantsContainer } from './RestaurantsContainer'

// when it loads, do this...
// fetchNeighborhoods()
// fetchCuisines()
//

/* TODO: Reactify the map?  Maybe we don't have to do that part however. */
class AppMain extends Component {
  render() {
    return <Fragment>
      <section id="map-container">
        <div tabindex="0" id="map" role="application" aria-label="Map with restaurants"></div>
        <div id="app-map"></div>
      </section>

      <section>
        <div class="filter-options">
          <h2>Filter Results</h2>
          <div class="select-container">
            <select
              id="neighborhoods-select"
              name="neighborhoods"
              aria-label="select neighborhood"
              onchange="updateRestaurants()"
            >
              <option value="all">All Areas</option>
            </select>

            <select
              id="cuisines-select"
              name="cuisines"
              aria-label="select type of cuisine"
              onchange="updateRestaurants()"
            >
              <option value="all">All Cuisines</option>
            </select>
          </div>
        </div>

        <ul id="restaurants-list">
          <RestaurantsContainer />
        </ul>
        <ul id="app-restaurants"></ul>
      </section>
    </Fragment>
  }
}

export default AppMain

