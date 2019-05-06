import React from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

const API_KEY = "AIzaSyBvcyICHXe_ScUzN_RPQcitxOIsDSNNYkE";

const mapStyles = {
  width: '100%',
  height: '500px'
};

class MapContainer extends React.Component {
  state = {
    markers: [],
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
  };

  componentWillMount() {
    // this.setState({
    //   markers: 2
    // })
  }

  onMarkerClick = (props, marker, e) => {
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
  }

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  };

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
          name={'Your current location'}
          onClick={this.onMarkerClick}
        >
        </Marker>
        {markers}
        <InfoWindow
          marker={this.state.activeMarker}
          visible={true}>
          <div>
            <h6>{this.state.selectedPlace.name}</h6>
          </div>
        </InfoWindow>
      </Map>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: API_KEY
})(MapContainer);