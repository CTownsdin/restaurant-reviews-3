import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Favorite from '@material-ui/icons/Favorite'
import FavoriteBorder from '@material-ui/icons/FavoriteBorder'
import Paper from '@material-ui/core/Paper';

export class Restaurant extends Component {
  getImageAltText = (id) => {
    const altTexts = {
      '1': 'bustling dining room with chandeliers',
      '2': 'mozzarella cheese pizza with bubbly crust',
      '3': 'dining room styled with wooden and lots of stainless steel',
      '4': 'artistic photo of brick building shot from the corner exterior sidewalk',
      '5': 'cook smiles while overlooking a busy cozy scene',
      '6': 'a rustic dining room in a converted warehouse, with a large US flag decoration',
      '7': 'black and white photo of concrete textured frontage of Superiority Burger joint',
      '8': 'building with awning and sign above says the DUTCH',
      '9': 'people casually eating and drinking water, beer, and wine, some browse on cellphones',
      '10': 'modern white and chrome styled eating bar and seating area'
    }
    return altTexts[String(id)];
  }
  handleToggleFav = (id, toggleTo) => {
    const url = `http://localhost:1337/restaurants/${id}/?is_favorite=${toggleTo}`;
    fetch(url, { method: 'PUT'})
    // TODO: splic the fix into state ?? // Did the view update?
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
            alt={this.getImageAltText(id)} />
        </div>
        <div className='restaurant-info'>
          <h2>{name}</h2>
          {(Boolean(is_favorite) === true)
            ? <Favorite onClick={() => this.handleToggleFav(id, false)} />
            : <FavoriteBorder onClick={() => this.handleToggleFav(id, true)} />
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