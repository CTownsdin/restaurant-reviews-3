import React from 'react'
import ReactDOM from 'react-dom'
import AppMain from './AppMain'

import restaurantStore from './stores/RestaurantStore'
import { Provider } from 'mobx-react'

const Root = (
  <Provider restaurantStore={restaurantStore}>
    <AppMain />
  </Provider>
)

ReactDOM.render(Root, document.getElementById('main-content'))
