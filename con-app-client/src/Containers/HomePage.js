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
      let conventionImages = await this.getImageUrl(conventions);

      this.setState({ conventions, conventionImages });
    } catch (e) {
      alert(e);
    }
  
    this.setState({ isLoading: false });
  }
  
  conventions() {
    return API.get("conventions", "/conventions");
  }

  getImageUrl = async (events) => {
    const guestArray = events
    const newArray = [];

    for(let i=0;i<guestArray.length;i++){
        if(guestArray[i].banner){
            try {
                let imageURL
                imageURL = await Storage.vault.get(events[i].banner);
                newArray[i] = imageURL
            }
            catch(e){
                console.log(e)
            }
        }
    }
    return newArray
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
    window.open(`/convention/preview/${id}`, "blank_")
  }
  renderConventionsList = () => {
    const conventions = this.state.conventions;
    const conventionImages = this.state.conventionImages;
    return conventions.map(
      (convention, i) =>
          // <LinkContainer
          //     key={convention.conId}
          //     to={`/convention/preview/${convention.conId}`}
          //   >
              <ListGroup.Item action onClick={() => this.redirectUrl(convention.conId)} key={i}>
                <div className="convention-panel">
                    <div className="date-panel">
                        <p>{(new Date(convention.startDate)).getDate()}</p>
                        <p>{(this.formatMonth(convention.startDate))}</p>
                    </div>
                    <div className="information-panel">
                        <p>{convention.title.trim().split("\n")[0]}</p>
                        {/* {"Created: " + new Date(convention.createdAt).toLocaleString()} */}
                        <p>{this.formatDate(convention.startDate)} - {this.formatDate(convention.endDate)}</p>
                        <p>{convention.eventLocation}</p>
                    </div>
                    {convention.banner ? 

                    <div className="picture-panel" style={{backgroundImage:`url(${conventionImages[i]})`}}>
                    </div>
                    :
                    <div className="picture-panel">
                    </div>
                    }
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
        <h3 className="page-header">Upcoming Conventions</h3>
        <div className="convention-list">
            {this.state.isLoading ? <i className="fas fa-circle-notch fa-spin"></i>
            : this.renderConventionsList()}
        </div>
      </div>
    );
  }
}