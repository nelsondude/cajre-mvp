import React from 'react';
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import CancelIcon from '@material-ui/icons/Cancel';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import classNames from 'classnames';
import Select from 'react-select';
import data from './data';


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var formattedSuggestion = function formattedSuggestion(structured_formatting) {
  return {
    mainText: structured_formatting.main_text,
    secondaryText: structured_formatting.secondary_text
  };
};

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
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
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  Placeholder,
};

class Searchbar extends React.Component {
  state = {
    suggestions: [],
    expanded: null,
    single: null,
    multi: null
  };

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

  handleChangeInput = name => value => {
    this.setState({
      [name]: value,
    });
  };


  render() {
    const { classes, theme } = this.props;
    const { expanded } = this.state;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div>
        <div className={classes.root}>
          <Select
            classes={classes}
            styles={selectStyles}
            options={data.treatments.map((el) => {
              return {
                "label": el.toProperCase()
              }
            })}
            components={components}
            value={this.state.single}
            onChange={this.handleChangeInput('single')}
            placeholder="Search a country (start with a)"
            isClearable
          />
        </div>
        <br/>
        <br/>
        <h1>Urgent Care Facilities Near Me</h1>
        <br/>
        <br/>
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

export default withStyles(styles, { withTheme: true })(Searchbar);