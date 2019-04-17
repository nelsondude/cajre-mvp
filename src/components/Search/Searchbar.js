import React from 'react';
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var formattedSuggestion = function formattedSuggestion(structured_formatting) {
  return {
    mainText: structured_formatting.main_text,
    secondaryText: structured_formatting.secondary_text
  };
};

const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
});

class Searchbar extends React.Component {
  state = {
    suggestions: [],
    expanded: null
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
        geocodeByAddress(sug.description, i));
      Promise
        .all(promises)
        .then( (result) => {
          let locations = result.map((res, _) => (getLatLng(res[0])));
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
              this.props.handleSuggestions([...suggestions]);
            })
        })
        .catch( (err) => {
          console.log(err)
        });
    });
  };

  mouseEnter = (i) => {
    this.setState({hover_item: i});
    this.props.handleHover(i);
  };

  mouseLeave = () => {
    this.setState({hover_item: null});
    this.props.handleHover(null);
  };


  handleChange = (panel, i) => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
    this.setState({hover_item: expanded ? i : null});
    this.props.handleHover(expanded ? i : null);
  };


  render() {
    const { classes } = this.props;
    const { expanded } = this.state;

    return (
      <div>
        <h1>Urgent Care Facilities</h1>
        {this.state.suggestions.map((sug, i) => {
          return (
            <ExpansionPanel key={i} expanded={expanded === `panel${i}`} onChange={this.handleChange(`panel${i}`, i)}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography>{sug.description}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Typography>
                  Price information about the current urgent care center for the <b>searched</b> treatment.
                  {/*<li key={i} onMouseEnter={() => this.mouseEnter(i)}*/}
                  {/*    onMouseLeave={this.mouseLeave}>{sug.description}</li>*/}
                </Typography>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )
        })}
      </div>
    )
  }
}

export default withStyles(styles)(Searchbar);