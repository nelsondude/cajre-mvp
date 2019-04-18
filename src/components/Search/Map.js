import React from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import {InfoWindow} from "react-google-maps";

const API_KEY = "AIzaSyBvcyICHXe_ScUzN_RPQcitxOIsDSNNYkE";

const mapStyles = {
  width: '100%',
  height: '500px'
};

class MapContainer extends React.Component {
  state = {
    markers: []
  };

  componentWillMount() {
    this.setState({
      markers: 2
    })
  }

  onMarkerClick = (props, marker, e) => {
    // console.log(marker);
  }

  render() {
    const lat = this.props.hover_item != null ? this.props.markers[this.props.hover_item].latitude : this.props.lat;
    const long = this.props.hover_item != null ? this.props.markers[this.props.hover_item].longitude : this.props.long;

    let markers = this.props.markers.map((marker, i) => {
      return (
        <Marker
          key={i}
          onClick={this.onMarkerClick}
          title={marker.description}
          name={marker.description}
          position={{lat: marker.latitude, lng: marker.longitude}}/>
      )
    });

    return (
      <Map
        google={this.props.google}
        zoom={12}
        style={mapStyles}
        center={{
          lat: lat,
          lng: long,
        }}
        initialCenter={{
          lat: this.props.lat,
          lng: this.props.long,
        }}
      >
        <Marker
          title={'The marker`s title will appear as a tooltip.'}
          name={'Your current location'}>
          <InfoWindow
            visible={true}>
            <div>
              <h1>Click on the map or drag the marker to select location where the incident occurred</h1>
            </div>
          </InfoWindow>
        </Marker>
        {markers}
      </Map>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: API_KEY
})(MapContainer);