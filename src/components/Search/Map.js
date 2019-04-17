import React from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

const API_KEY = "AIzaSyBvcyICHXe_ScUzN_RPQcitxOIsDSNNYkE";
const MAP_URL = `https://maps.googleapis.com/maps/api/js?v=3.exp&key=${API_KEY}&libraries=places,geometry,drawing`;

const mapStyles = {
  width: '100%',
  height: '500px'
};

class MapContainer extends React.Component {
  componentDidMount() {

  }

  render() {
    return (
      <Map
        google={this.props.google}
        zoom={14}
        style={mapStyles}
        initialCenter={{
          lat: this.props.lat,
          lng: this.props.long
        }}
      >
        <Marker
          title={'The marker`s title will appear as a tooltip.'}
          name={'Your current location'}/>
      </Map>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: API_KEY
})(MapContainer);