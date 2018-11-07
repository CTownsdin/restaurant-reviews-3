import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Favorite from '@material-ui/icons/Favorite'
import FavoriteBorder from '@material-ui/icons/FavoriteBorder'
import Paper from '@material-ui/core/Paper';

const restaurantsUrl = 'http://localhost:1337/restaurants'

class Restaurant extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  render() {
    const { address, is_favorite, name, neighborhood, photograph, id } = this.props.restaurant
    let styles = {
      width: '400px',
      height: '500px',
      margin: '2px',
      textAlign: 'center',
    }
    return <Paper elevation={3} style={styles} >
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
          { (is_favorite === 'favorite')
            ? <Favorite onClick={() => alert(`imagine unfavorite ${id}`)}/>
            : <FavoriteBorder onClick={() => alert(`imagine favorite ${id}`)}/>
          }
          <p>{ neighborhood }</p>
          <p>{ address }</p>
          {/* <a href='./restaurant.html?id=1'>View Details</a> TODO: make button work instead of this */}
          <Button variant='contained' color='primary' onClick={() => alert(`imagine handleViewDetails button click`)}>
            View Details
          </Button>
        </div>
      </div>
    </Paper>
  }
}

export class RestaurantsContainer extends Component {
  constructor(props){
    super(props)
    this.state = {
      restaurants: [],
    }
    this.fetchRestaurants = this.fetchRestaurants.bind(this)
    this.handleViewDetails = this.handleViewDetails.bind(this)
    this.favorite = this.favorite.bind(this)
    this.unFavorite = this.unFavorite.bind(this)
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
  favorite(id){
    const favURL = `${restaurantsUrl}/${id}/?is_favorite=favorite`
    fetch(favURL, { method: 'PUT' })
      .then(() => this.fetchRestaurants)
      .catch(err => console.error('Error favoriting restaurant', err))
  }
  unFavorite(id){
    const favURL = `${restaurantsUrl}/${id}/?is_favorite=notFavorite`
    fetch(favURL, { method: 'PUT' })
      .then(() => this.fetchRestaurants)
      .catch(err => console.error('Error unfavoriting restaurant', err))
  }
  render() {
    const { restaurants } = this.state
    let styles = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
    return <div className='restaurants-list' style={styles} >
      {
        restaurants.map((r,i) => 
          <Restaurant key={i} 
            restaurant={r}
            favorite={this.favorite}
            unFavorite={this.unFavorite}
            handleViewDetails={this.handleViewDetails}/>)
      }
    </div>
  }
}

