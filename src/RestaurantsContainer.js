import React, { Component } from 'react'
import { Restaurant } from './Restaurant'

const restaurantsUrl = 'http://localhost:1337/restaurants'


export class RestaurantsContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      restaurants: [],
    }
    this.fetchRestaurants = this.fetchRestaurants.bind(this)
    this.handleViewDetails = this.handleViewDetails.bind(this)
    this.favorite = this.favorite.bind(this)
    this.unFavorite = this.unFavorite.bind(this)
  }
  fetchRestaurants() {
    fetch(restaurantsUrl)
      .then(response => response.json())
      .then(json => this.setState({ restaurants: json }))
  }
  handleViewDetails(e) {
    alert('clicked', e.target)
  }
  componentDidMount() {
    this.fetchRestaurants()
  }
  favorite(id) {
    const favURL = `${restaurantsUrl}/${id}/?is_favorite=favorite`
    fetch(favURL, { method: 'PUT' })
      .then(() => this.fetchRestaurants)
      .catch(err => console.error('Error favoriting restaurant', err))
  }
  unFavorite(id) {
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
    return <section>
      <div className="filter-options">
        <h2>Filter Results</h2>
        <div className="select-container">
          <select
            id="neighborhoods-select"
            name="neighborhoods"
            aria-label="select neighborhood"
            onChange={this.handleAreaSelection}
          >
            <option value="all">All Areas</option>
            <option value="Manhattan">Manhattan</option>
            <option value="Brooklyn">Brooklyn</option>
            <option value="Queens">Queens</option>
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

      <br />

      <ul id="restaurants-list">
        <div className='restaurants-list' style={styles} >
          {restaurants.map((r, i) =>
            <Restaurant key={i}
              restaurant={r}
              favorite={this.favorite}
              unFavorite={this.unFavorite}
              handleViewDetails={this.handleViewDetails} />
          )}
        </div>
      </ul>

    </section>

  }
}

