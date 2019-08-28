import React, { Component } from "react";
import ListGroup from 'react-bootstrap/ListGroup'
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import { Dashboard } from "../components/Dashboard";
import "./home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      notes: []
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }
  
    try {
      const notes = await this.notes();
      this.setState({ notes });
    } catch (e) {
      alert(e);
    }
  
    this.setState({ isLoading: false });
  }
  
  notes() {
    return API.get("conventions", "/conventions");
  }

  renderNotesList(conventions) {
    return [{}].concat(conventions).map(
      (convention, i) =>
        i !== 0
          ? <LinkContainer
              key={convention.conId}
              to={`/convention/${convention.conId}`}
            >
              <ListGroup.Item action>
                <p className="note-header">{convention.title.trim().split("\n")[0]}</p>
                {"Created: " + new Date(convention.createdAt).toLocaleString()}
              </ListGroup.Item>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/convention/new"
            >
              <ListGroup.Item action>
                <h5>
                  <b>{"\uFF0B"}</b> Create a new Convention
                </h5>
              </ListGroup.Item>
            </LinkContainer>
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Convention Maker</h1>
        <p>Use Convention Maker to create a landing page for your convention, complete with schedule, pages and notifications.</p>
      </div>
    );
  }

  renderNotes() {
    return (
      <div className="notes">
        <h3>Your Convention Dashboard</h3>
        <ListGroup>
          {!this.state.isLoading && this.renderNotesList(this.state.notes)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home container">
        {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
      </div>
    );
  }
}