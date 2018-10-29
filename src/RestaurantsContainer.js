import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button';

const Restaurant = (props) => (
  <Fragment>
    <div class="restaurant-container">
      <div>
        <img class="restaurant-img"
          src="/img/1"
          srcset="http://localhost:3000/img/1-500px.jpg 500w,
            http://localhost:3000/img/1-1000px.jpg 1000w,
            http://localhost:3000/img/1-1500px.jpg 1500w"
          alt="bustling dining room with chandeliers" />
      </div>
      <div class="restaurant-info">
        <h2>Mission Chinese Food</h2>
        <div class="far fa-smile">
          <input type="hidden" value="1" />
        </div>
        <p>Manhattan</p>
        <p>171 E Broadway, New York, NY 10002</p>
        <a href="./restaurant.html?id=1">View Details</a>
        <Button variant="contained" color="primary">
          View Details
        </Button>
      </div>
    </div>
  </Fragment>
)

export class RestaurantsContainer extends Component {
  render() {
    return (
      <Fragment>
        <h1>Imagine A Restaurants List Here</h1>
        <Restaurant />
      </Fragment>
    )
  }
}

