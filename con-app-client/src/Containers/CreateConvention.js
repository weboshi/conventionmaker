import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { API } from "aws-amplify";
import Script from 'react-load-script';
import { s3Upload } from "../libs/awsLib"
import "./CreateConvention.css";
import "react-datepicker/dist/react-datepicker.css";

export default class CreateConvention extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        isLoading: false,
        startDate: new Date(),
        endDate: new Date(),
        title: '',
        headline: '',
        description: '',
        city: '',
        query: ''
      };
      this.handleStartDateChange = this.handleStartDateChange.bind(this);
      this.handleEndDateChange = this.handleEndDateChange.bind(this);
      this.handleScriptLoad = this.handleScriptLoad.bind(this);
      this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
  }

  validateForm() {
    return this.state.title.length > 0 && this.state.headline.length > 0 && this.state.description.length > 0 && this.state.query.length > 0 && this.state.startDate && this.state.endDate;
  }

  handleStartDateChange(date) {
    this.setState({
      startDate: date
    });
  }

  handleEndDateChange(date) {
    this.setState({
      endDate: date
    });
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
  
    this.setState({ isLoading: true });
  
    try {  
      console.log(this.state.query)
      await this.createNote({
        title: this.state.title,
        headline: this.state.headline,
        description: this.state.description,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        eventLocation: this.state.query
      });
      await this.setState({
        isSuccessful: true
      })
      setTimeout(() => {
        this.props.history.push("/")
      }, 1000);
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  createNote(convention) {
    return API.post("conventions", "/conventions", {
      body: convention
    });
  }

  handleScriptLoad() { 
    // Declare Options For Autocomplete 
    var options = { types: [`(cities)`] }; 
    
    // Initialize Google Autocomplete 
    /*global google*/
    this.autocomplete = new google.maps.places.Autocomplete(
                          document.getElementById(`query`),
                          options ); 
    // Fire Event when a suggested name is selected
    this.autocomplete.addListener(`place_changed`,
                                  this.handlePlaceSelect); 
  }

  handlePlaceSelect() {

    // Extract City From Address Object
    let addressObject = this.autocomplete.getPlace();
    let address = addressObject.address_components;

    // Check if address is valid
    if (address) {
      // Set State
      this.setState(
        {
          city: address[0].long_name,
          query: addressObject.formatted_address,
        }
      );
    }
  }

  render() {
    return (
      <div className="Create-Convention">
      <Script url="https://maps.googleapis.com/maps/api/js?key=AIzaSyAdtmzsWcW2cs3bRTm2CNdNyVjfj0wEqmg&libraries=places"          
        onLoad={this.handleScriptLoad}        
      />  
        <Form>
          <Form.Label style={{marginLeft:'auto',marginRight:'auto'}}>Basic Convention Information</Form.Label>
          <Form.Group controlId="title">
            <Form.Label>Name of the Convention</Form.Label>
            <Form.Control 
              placeholder="Enter name"
              onChange={this.handleChange}
              value={this.state.title}
            />
            <Form.Text className="text-muted">
              Your convention's name, people will search for it by this name.
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="headline">
            <Form.Label>Convention Headline</Form.Label>
            <Form.Control 
              placeholder="Enter headline"
              onChange={this.handleChange}
              value={this.state.headline}
              />
            <Form.Text className="text-muted">
              A brief description of your convention. 
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Convention Description</Form.Label>
            <Form.Control 
              as="textarea" 
              placeholder="Enter description"
              onChange={this.handleChange}
              value={this.state.description}
             />
            <Form.Text className="text-muted">
              Describe your convention.
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="query">
            <Form.Label>Convention Location</Form.Label>
            <Form.Control 
              placeholder="Enter City and State"
              onChange={this.handleChange}
              value={this.state.query}
              />
            <Form.Text className="text-muted">
              Your convention's location. 
            </Form.Text>
          </Form.Group>
          <div className="date-picker">
            Start Date 
            <DatePicker
              selected={this.state.startDate}
              onChange={this.handleStartDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              timeCaption="time"
            />
          </div>
          <div className="date-picker">
            End Date 
            <DatePicker
              selected={this.state.endDate}
              onChange={this.handleEndDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              timeCaption="time"
            />
          </div>
          <LoaderButton
            onSuccess={this.state.isSuccessful}
            onClick={this.handleSubmit}
            block
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create Convention"
            loadingText="Creating…"
          />
          <Form.Text className="text-muted">
            Once you create the convention, you will be able to fill out the rest of the details later.
          </Form.Text>
        </Form>
      </div>
    );
  }
}