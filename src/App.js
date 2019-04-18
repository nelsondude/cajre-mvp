import React, { Component } from 'react';
import './App.css';
import Search from 'components/Search/Search';
import Container from "react-bootstrap/Container";
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
