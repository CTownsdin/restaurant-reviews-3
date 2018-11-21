import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Favorite from '@material-ui/icons/Favorite'
import FavoriteBorder from '@material-ui/icons/FavoriteBorder'
import Paper from '@material-ui/core/Paper';

export class Restaurant extends Component {
  constructor(props) {
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
          <h2>{name}</h2>
          {(is_favorite === 'favorite')
            ? <Favorite onClick={() => alert(`imagine unfavorite ${id}`)} />
            : <FavoriteBorder onClick={() => alert(`imagine favorite ${id}`)} />
          }
          <p>{neighborhood}</p>
          <p>{address}</p>
          {/* <a href='./restaurant.html?id=1'>View Details</a> TODO: make button work instead of this */}
          <Button variant='contained' color='primary' onClick={() => alert(`imagine handleViewDetails button click`)}>
            View Details
          </Button>
        </div>
      </div>
    </Paper>
  }
}