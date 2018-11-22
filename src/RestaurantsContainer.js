import React, { Component } from 'react'
import { Restaurant } from './Restaurant'

const restaurantsUrl = 'http://localhost:1337/restaurants'


export class RestaurantsContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      restaurants: [],
      selectedRestaurants: [],
      selectedArea: 'all',
      selectedCuisine: 'all',
    }
  }
  handleAreaSelection = (e) => {
    const { restaurants, selectedCuisine } = this.state
    const newAreaSelection = e.target.value
    let filtered = restaurants
    if (selectedCuisine !== 'all') {
      filtered = restaurants.filter(r => r.cuisine_type === selectedCuisine)
    }
    if (newAreaSelection !== 'all') {
      filtered = filtered.filter(r => r.neighborhood === newAreaSelection)
    }
    if ((selectedCuisine === 'all') && (newAreaSelection === 'all')) {
      filtered = restaurants
    }
    this.setState({ selectedRestaurants: filtered, selectedArea: newAreaSelection })
  }
  handleCuisineSelection = (e) => {
    const { restaurants, selectedArea } = this.state
    const newCuisineSelection = e.target.value
    let filtered = restaurants
    if (selectedArea !== 'all') {
      filtered = restaurants.filter(r => r.neighborhood === selectedArea)
    }
    if (newCuisineSelection !== 'all') {
      filtered = filtered.filter(r => r.cuisine_type === newCuisineSelection)
    }
    if ((selectedArea === 'all') && (newCuisineSelection === 'all')) {
      filtered = restaurants
    }
    this.setState({ selectedRestaurants: filtered, selectedCuisine: newCuisineSelection })
  }
  fetchRestaurants = () => {
    fetch(restaurantsUrl)
      .then(response => response.json())
      .then(json => this.setState({
        restaurants: json,
        selectedRestaurants: json
      }))
  }
  componentDidMount() {
    this.fetchRestaurants()
  }
  render() {
    const { selectedRestaurants } = this.state
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
            onChange={this.handleCuisineSelection}
          >
            <option value="all">All Cuisines</option>
            <option value="Pizza">Pizza</option>
            <option value="American">American</option>
            <option value="Asian">Asian</option>
            <option value="Mexican">Mexican</option>
          </select>
        </div>
      </div>

      <br />

      <ul id="restaurants-list">
        <div className='restaurants-list' style={styles} >
          {selectedRestaurants.map((r, i) =>
            <Restaurant key={i} restaurant={r} />
          )}
        </div>
      </ul>

    </section>

  }
}

