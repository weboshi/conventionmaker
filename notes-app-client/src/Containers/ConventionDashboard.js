import React, { Component } from "react";
import ListGroup from 'react-bootstrap/ListGroup'
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
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
    return API.get("notes", "/notes");
  }

  renderNotesList(notes) {
    return [{}].concat(notes).map(
      (note, i) =>
        i !== 0
          ? <LinkContainer
              key={note.noteId}
              to={`/notes/${note.noteId}`}
            >
              <ListGroup.Item action>
                <p className="note-header">{note.content.trim().split("\n")[0]}</p>
                {"Created: " + new Date(note.createdAt).toLocaleString()}
              </ListGroup.Item>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/notes/new"
            >
              <ListGroup.Item action>
                <h4>
                  <b>{"\uFF0B"}</b> Create a new note
                </h4>
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
        <h1>Your Notes</h1>
        <ListGroup>
          {!this.state.isLoading && this.renderNotesList(this.state.notes)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
      </div>
    );
  }
}