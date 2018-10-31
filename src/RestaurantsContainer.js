import React, { Component, Fragment } from 'react'
import Button from '@material-ui/core/Button';

const restaurantsUrl = 'http://localhost:1337/restaurants';

const Restaurant = ({ restaurant, handleViewDetails }) => {
  const { address, is_favorite, name, neighborhood, photograph } = restaurant

  return <Fragment>
    <div className='restaurant-container'>
      <div>
        <img className='restaurant-img'
          src={`/img/${photograph}`}
          srcSet={`http://localhost:3000/img/${photograph}-500px.jpg 500w,
            http://localhost:3000/img/${photograph}-1000px.jpg 1000w,
            http://localhost:3000/img/${photograph}-1500px.jpg 1500w`}
          alt='bustling dining room with chandeliers' />
      </div>
      <div className='restaurant-info'>
        <h2>{ name }</h2>
        {/* TODO:  if is_favorite, then show fav, else show not fav */}
        <div className='far fa-smile'>
          <input type='hidden' value='1' />
        </div>
        <p>{ neighborhood }</p>
        <p>{ address }</p>
        <a href='./restaurant.html?id=1'>View Details</a>
        <Button variant='contained' color='primary' onClick={handleViewDetails}>
          View Details
        </Button>
      </div>
    </div>
  </Fragment>
}

export class RestaurantsContainer extends Component {
  constructor(props){
    super(props)
    this.state = {
      restaurants: [],
    }
    this.fetchRestaurants = this.fetchRestaurants.bind(this);
    this.handleViewDetails = this.handleViewDetails.bind(this);
  }
  fetchRestaurants(){
    fetch(restaurantsUrl)
      .then(response => response.json())
      .then(json => this.setState({ restaurants: json }))
  }
  handleViewDetails(e){
    alert('clicked', e.target)
  }
  componentDidMount(){
    this.fetchRestaurants()
  }
  render() {
    const { restaurants } = this.state
    return <div className='restaurants-list'>
      {/* TODO: map over the list of restaurants, and for each, display the <Restaurant /> */}
      {/* <Restaurant restaurants={restaurants} handleViewDetails={this.handleViewDetails}/> */}
      { 
        restaurants.map(r => 
          <Restaurant restaurant={r} handleViewDetails={this.handleViewDetails}/>)
      }
    </div>
  }
}

