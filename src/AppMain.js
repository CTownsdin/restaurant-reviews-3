import React, { Component, Fragment } from 'react'
import { RestaurantsContainer } from './RestaurantsContainer'

class AppMain extends Component {
  render() {

    return <Fragment>
      <section id="map-container">
        <div tabIndex="0" id="map" role="application" aria-label="Map with restaurants"></div>
        <div id="app-map"></div>
      </section>

      <RestaurantsContainer />
    </Fragment>
  }
}

export default AppMain
