import React, { Component, Fragment } from 'react'
import { RestaurantsContainer } from './RestaurantsContainer'
import DevTools from 'mobx-react-devtools'
import {inject, observer} from 'mobx-react'

// TODO:
// when it loads, do this...
// fetchNeighborhoods()
// fetchCuisines()
//

@inject('restaurantStore')
@observer
class AppMain extends Component {
  componentDidMount() {
    this.props.restaurantStore.fetchRestaurants()
  }
  render() {

    return <Fragment>
      <DevTools />
      <section id="map-container">
        <div tabIndex="0" id="map" role="application" aria-label="Map with restaurants"></div>
        <div id="app-map"></div>
      </section>

      <RestaurantsContainer />
    </Fragment>
  }
}

export default AppMain
