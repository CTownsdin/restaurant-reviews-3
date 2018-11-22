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
      margin: '4px',
      textAlign: 'center',
    }

    return <Paper elevation={4} style={styles} >
      <div className='restaurant-container'>
        <div>
          <img className='restaurant-img'
            src={`/img/${photograph}`}
            srcSet={`http://localhost:3000/img/${photograph}-500px.jpg 500w,
              http://localhost:3000/img/${photograph}-1000px.jpg 1000w,
              http://localhost:3000/img/${photograph}-1500px.jpg 1500w`}
            alt='bustling dining room with chandeliers' />
            {/* TODO: Fix alt text! */}
        </div>
        <div className='restaurant-info'>
          <h2>{name}</h2>
          {(is_favorite === 'favorite')
            ? <Favorite onClick={() => alert(`imagine unfavorite ${id}`)} />
            : <FavoriteBorder onClick={() => alert(`imagine favorite ${id}`)} />
          }
          <p>{neighborhood}</p>
          <p>{address}</p>
          <Button variant='contained' color='primary'>
            <a href={`http://localhost:3000/restaurant.html?id=${id}`}>View Details</a>
          </Button>
        </div>
      </div>
    </Paper>
  }
}