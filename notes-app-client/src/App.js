import React, { Component, Fragment } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Auth } from "aws-amplify";
import { Link, withRouter } from "react-router-dom";
import Nav from 'react-bootstrap/Nav'
// import { Nav, Navbar, NavItem } from "react-bootstrap";
import Routes from "./Routes";
import Navbar from 'react-bootstrap/Navbar'
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true
    };
  }

  async componentDidMount() {
    try {
      await Auth.currentSession();
      this.userHasAuthenticated(true);
    }
    catch(e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }
  
    this.setState({ isAuthenticating: false });
  }

  handleLogout = async event => {
    await Auth.signOut();
  
    this.userHasAuthenticated(false);
  
    this.props.history.push("/login");
  }
  
  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  }

render() {
  const childProps = {
    isAuthenticated: this.state.isAuthenticated,
    userHasAuthenticated: this.userHasAuthenticated
  };

  return (
    !this.state.isAuthenticating &&
    <div className="App container">
      <Navbar bg="light" expand="lg">
          <Navbar.Brand>
            <LinkContainer to="/"><Nav.Link>Convention Maker</Nav.Link></LinkContainer>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            {this.state.isAuthenticated
              ? <Nav.Link onClick={this.handleLogout}>Logout</Nav.Link>
              : <Fragment>
                  <LinkContainer to="/signup">
                    <Nav.Link>Signup</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Nav.Link>Login</Nav.Link>
                  </LinkContainer>
                </Fragment>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes childProps={childProps} />
    </div>
  );
}
}

export default withRouter(App);