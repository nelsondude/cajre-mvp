import React, { Component } from 'react';
import './App.css';
import Search from 'components/Search/Search';
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/es/FormControl";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


class App extends Component {
  render() {
    return (
      <div className="App">
        <Container>
          <Row>
            <Col>
              <Search/>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
