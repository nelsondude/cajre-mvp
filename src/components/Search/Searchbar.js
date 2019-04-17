import React from 'react';
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var formattedSuggestion = function formattedSuggestion(structured_formatting) {
  return {
    mainText: structured_formatting.main_text,
    secondaryText: structured_formatting.secondary_text
  };
};

class Searchbar extends React.Component {
  state = {
    suggestions: []
  }
  constructor(props) {
    super(props);

    if (!window.google) {
      throw new Error('[react-places-autocomplete]: Google Maps JavaScript API library must be loaded. See: https://github.com/kenny-hibino/react-places-autocomplete#load-google-library');
    }

    if (!window.google.maps.places) {
      throw new Error('[react-places-autocomplete]: Google Maps Places library must be loaded. Please add `libraries=places` to the src URL. See: https://github.com/kenny-hibino/react-places-autocomplete#load-google-library');
    }
    this.autocompleteService = new window.google.maps.places.AutocompleteService();
  }

  componentDidMount() {
    this.autocompleteService.getPlacePredictions(_extends({}, {}, {
      input: "urgentcare"
    }), this.autocompleteCallback);
  }


  autocompleteCallback = (predictions, status) => {
    this.setState({
      suggestions: predictions.map(function (p, idx) {
        return {
          id: p.id,
          description: p.description,
          placeId: p.place_id,
          active: false,
          index: idx,
          formattedSuggestion: formattedSuggestion(p.structured_formatting),
          matchedSubstrings: p.matched_substrings,
          terms: p.terms,
          types: p.types
        };
      })
    }, () => {
      let promises = this.state.suggestions.map((sug, i) =>
        geocodeByAddress(this.state.suggestions[i].description, i));
      Promise
        .all(promises)
        .then( (result) => {
          let locations = [];
          result.forEach((res, _) => {
            locations.push(getLatLng(res[0]));
          });
          Promise
            .all(locations)
            .then(res => {
              let suggestions = [...this.state.suggestions];
              res.forEach(({lat, lng}, i) => {
                suggestions[i] = {
                  ...suggestions[i],
                  latitude: lat,
                  longitude: lng
                }
              });
              this.setState({suggestions})
            })
        })
        .catch( (err) => {
          console.log(err)
        });
    });
  };


  render() {
    return (
      <div>
        <h1>Urgent Care Facilities</h1>
        <ul>
          {this.state.suggestions.map((sug, _) => {
            return (
              <li>{sug.description}</li>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default Searchbar;