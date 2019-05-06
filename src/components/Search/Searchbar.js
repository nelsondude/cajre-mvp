import React from 'react';
import {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from "@material-ui/core/TextField";
import Paper from '@material-ui/core/Paper';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import Select from 'react-select';
import data from './data';
import Switch from '@material-ui/core/Switch';
import {_extends, formatter, shuffle, formattedSuggestion} from "./utils"
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import * as _ from 'lodash';


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
  table: {
    width: '100%'
  },
  ul: {
    padding: 0
  }
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

const getTreatments = () => {
  let treatments = shuffle(data.treatments.slice()).slice(0, 8);
  return treatments.map((treatment, i) => {
    return {
      name: treatment.toProperCase(),
      cost: Math.random() * 1000
    }
  })
};


class Searchbar extends React.Component {
  state = {
    suggestions: [],
    expanded: null,
    single: null,
    multi: null,
    switch_checked: false
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
      input: "urgent care"
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
          types: p.types,
          treatments: getTreatments()
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

  // this.props.handleHover(expanded ? i : null);
  // this.setState({hover_item: expanded ? i : null});

  handleChangeInput = name => value => {
    this.setState({
      [name]: value,
    });
  };

  handleSwitch = (event, checked) => {
    this.setState({switch_checked: checked});
  };

  getBenefits = (index) => {
    if (index === 0) {
      return ['No <b>$200</b> deductible', '<b>$50</b> Amazon Gift Card']
    } else if (index === 1) {
      return ['No <b>$200</b> deductible']
    } else if (index === 2) {
      return ['Only pay <b>50%</b> of deductible', '<b>$25</b> Amazon Gift Card']
    } else {
      return []
    }
  };


  render() {
    const { classes, theme } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    const sorted_treatments = _.filter(
      _.sortBy(
        _.flattenDeep(
          this.state.suggestions.map((sug, index) => {
            return sug.treatments.map((treatment, j) => {
              return {index, treatment}
            })
          })), [o => (
          o.treatment.cost  // sort by the cost
        )]), o => (
        o.treatment.name.match(new RegExp(this.state.single ? `^${this.state.single.label}$` : '', 'i'))  // filter by the selected disease
      ));

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
            placeholder="&nbsp;&nbsp;Search for your condition"
            isClearable
          />
        </div>
        <br/>
        <span>Show All Results</span>
        <Switch checked={this.state.switch_checked} onChange={this.handleSwitch}/>
        <br/>
        <h1>Urgent Care Facilities Near Me</h1>
        <br/>
        <br/>
        <Paper>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Treatment</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Benefits If Chosen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted_treatments.map((o, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {o.treatment.name}
                  </TableCell>
                  <TableCell>{this.state.suggestions[o.index].terms[0].value}</TableCell>
                  <TableCell>{formatter.format(o.treatment.cost)}</TableCell>
                  <TableCell>
                    {this.getBenefits(i).length > 0 ?
                      <ul className={classes.ul}>
                        {this.getBenefits(i).map(b => <li dangerouslySetInnerHTML={{__html: b}}/>)}
                      </ul> : 'No benefits available.'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(Searchbar);