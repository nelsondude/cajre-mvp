import React from 'react';
import './Search.css'
import {geolocated} from 'react-geolocated';
import Map from './Map';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Searchbar from './Searchbar';

class Search extends React.Component {
  state = {
    search_input: "",
    suggestions: [],
    hover_item: null
  };

  handleChange = (event) => {
    this.setState({search_input: event.target.value});
  };

  handleSuggestions = (suggestions) => {
    this.setState({suggestions})
  };

  handleHoverChange = (index) => {
    this.setState({hover_item: index})
  }

  render() {
    return (
      <div className={"Search"}>
        <Row>
          <Col sm={4}>
            <Searchbar
              handleSuggestions={this.handleSuggestions}
              handleHover={this.handleHoverChange}
            />
          </Col>
          <Col sm={8}>
            {!this.props.isGeolocationAvailable ? <div>No support</div>
              : !this.props.isGeolocationEnabled
                ? <div>Geo location not enabled</div>
                : this.props.coords ?
                    <Map
                      markers={this.state.suggestions}
                      hover_item={this.state.hover_item}
                      lat={this.props.coords.latitude}
                      long={this.props.coords.longitude} />
                  : <div>Loading data ...</div>}
          </Col>
        </Row>
      </div>
    )
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(Search);