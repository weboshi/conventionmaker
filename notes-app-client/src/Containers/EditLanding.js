import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib"
import "./EditLanding.css";

export default class EditLanding extends Component {
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
        header: '',
      };
      this.handleStartDateChange = this.handleStartDateChange.bind(this);
      this.handleEndDateChange = this.handleEndDateChange.bind(this);
      this.handleImageChange = this.handleImageChange.bind(this);


  }

  validateForm() {
    return this.state.title.length > 0 && this.state.headline.length > 0 && this.state.description.length > 0 && this.state.startDate && this.state.endDate;
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
      await this.createNote({
        title: this.state.title,
        headline: this.state.headline,
        description: this.state.description,
        startDate: this.state.startDate,
        endDate: this.state.endDate
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

  handleImageChange(event) {
    this.setState({
      file: URL.createObjectURL(event.target.files[0])
    })
  }

  render() {
    return (
      <div className="Create-Convention">
        <div className="section-header">
          <h4>Edit Landing Page</h4>
        </div>
        <Form>
          <Form.Group controlId="file">
            <Form.Label>Convention Banner</Form.Label>
            {this.state.file && <img src={this.state.file} width='800' height='200'></img>}
            <Form.Control onChange={this.handleImageChange} type="file" />
            <Form.Text>Upload an image to be your convention's banner. Should be 700 x 200.</Form.Text>
          </Form.Group>
          <Form.Group controlId="header">
            <Form.Label>Convention Text Header</Form.Label>
            <Form.Control 
              placeholder="Enter name"
              onChange={this.handleChange}
              value={this.state.header}
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