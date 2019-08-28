import React, { Component } from "react";
import ListGroup from 'react-bootstrap/ListGroup'
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import { Dashboard } from "../components/Dashboard";
import moment from "moment";
import "./HomePage.css";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      conventions: []
    };
  }

  async componentDidMount() {
  
    try {
      const conventions = await this.conventions();

      this.setState({ conventions });
    } catch (e) {
      alert(e);
    }
  
    this.setState({ isLoading: false });
  }
  
  conventions() {
    return API.get("conventions", "/public-conventions");
  }
 

  formatDate = (date) => {
    let dateMonth = new Date(date);
    
    return moment(dateMonth).format('MMMM D, YYYY');  
  }

  formatMonth = date => {
      let dateMonth = new Date(date);
      return moment(dateMonth).format('MMM');
  }

  redirectUrl = id => {
    console.log('boop')
    console.log(id)
    console.log(typeof(id))
    window.open(`/view/${id}`, "blank_")
  }
  renderConventionsList = () => {
    const conventions = this.state.conventions;
    return conventions.map(
      (convention, i) =>
          // <LinkContainer
          //     key={convention.conId}
          //     to={`/convention/preview/${convention.conId}`}
          //   >
              <ListGroup.Item action onClick={() => this.redirectUrl(convention.conventionId)} key={i}>
                <div className="convention-panel">
                    <div className="date-panel">
                        <p>{(new Date(convention.startDate)).getDate()}</p>
                        <p>{(this.formatMonth(convention.startDate))}</p>
                    </div>
                    <div className="right-panel">
                      <div className="information-panel">
                          <p>{convention.title.trim().split("\n")[0]}</p>
                          {/* {"Created: " + new Date(convention.createdAt).toLocaleString()} */}
                          <p>{this.formatDate(convention.startDate)} - {this.formatDate(convention.endDate)}</p>
                          <p>{convention.eventLocation}</p>
                      </div>
                      <div className="picture-panel" style={{backgroundImage:`url(https://convention-maker.s3-us-west-1.amazonaws.com/public/${convention.banner})`}}>
                      </div>
                    </div>
                </div>
              </ListGroup.Item>
            // </LinkContainer>
    );
  }


  renderNotes() {
    return (
      <div className="notes">
        <h3>Your Conventions</h3>
        <ListGroup>
          {!this.state.isLoading && this.renderNotesList(this.state.notes)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home container">
        <div className="welcome">
          <h2>Welcome to Convention Maker</h2>
          <p>
            Welcome to Convention Maker, where you can create landing pages for your convention and look for upcoming conventions.
          </p>
        </div>
        <h3 className="page-header">Upcoming Conventions</h3>
        <div className="convention-list">
            {this.state.isLoading ? 
            <div className="homepage-loading">
              <i className="fas fa-circle-notch fa-spin"></i>
            </div>
            : this.renderConventionsList()}
        </div>
      </div>
    );
  }
}