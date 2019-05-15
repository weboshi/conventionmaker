import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import { Auth } from "aws-amplify";
import "./createconvention.css";
import "react-datepicker/dist/react-datepicker.css";

export default class CreateConvention extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: false,
        startDate: new Date(),
        endDate: new Date(),
        name: '',
        tagline: '',
      };
      this.handleStartDateChange = this.handleStartDateChange.bind(this);
      this.handleEndDateChange = this.handleEndDateChange.bind(this);


  }

  validateForm() {
    return this.state.name.length > 0 && this.state.tagline.length > 0 && this.state.startDate;
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
      await Auth.signIn(this.state.email, this.state.password);
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <div className="Create-Convention">
        <Form>
          <Form.Group controlId="name">
            <Form.Label>Name of the Convention</Form.Label>
            <Form.Control placeholder="Enter name" />
            <Form.Text className="text-muted">
              Your convention's name, people will search for it by this name.
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="headline">
            <Form.Label>Convention Headline</Form.Label>
            <Form.Control placeholder="Enter headline" />
            <Form.Text className="text-muted">
              A brief description of your convention. 
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>Convention Description</Form.Label>
            <Form.Control as="textarea" placeholder="Enter description" />
            <Form.Text className="text-muted">
              Describe your convention.
            </Form.Text>
          </Form.Group>
          <div className="date-picker">
            Start Date 
            <DatePicker
              selected={this.state.startDate}
              onChange={this.handleStartDateChange}
            />
          </div>
          <div className="date-picker">
            End Date 
            <DatePicker
              selected={this.state.endDate}
              onChange={this.handleEndDateChange}
            />
          </div>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
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