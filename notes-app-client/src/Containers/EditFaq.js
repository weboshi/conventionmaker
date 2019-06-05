import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib"
import "./createconvention.css";
import "react-datepicker/dist/react-datepicker.css";

var AWS = require("aws-sdk");
var DynamoDB = new AWS.DynamoDB.DocumentClient();

export default class CreateConvention extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        title: '',
        faq: [],
        newQuestion: {
            question: '',
            answer: '',
        },
      };
  }

  validateForm() {
    return this.state.title.length > 0 && this.state.headline.length > 0 && this.state.description.length > 0 && this.state.startDate && this.state.endDate;
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
      await this.updateConvention({
        faq: this.state.faq
      });
      await this.setState({
        isSuccessful: true
      })
      setTimeout(() => {
        window.location.reload()
      }, 1000);
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  saveQuestion = () => {
    const faq = this.state.faq
    const newQuestion = this.state.newQuestion
    faq.push(newQuestion)
    this.setState({
      faq: this.state.faq
    })
  }

  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/${this.props.match.params.id}`, {
      body: convention
    })
  }

  render() {
    return (
      <div className="Create-Convention">
        <Form>
          <Form.Group controlId="newQuestion">
            <Form.Label>New F.A.Q. Question</Form.Label>
            <Form.Control 
              placeholder="Enter name"
              onChange={this.handleChange}
              value={this.state.newQuestion.question}
            />
            <Form.Text className="text-muted">
              The frequently asked question.
            </Form.Text>
          </Form.Group>
          <Form.Group controlId="newQuestion">
            <Form.Control 
              placeholder="Enter name"
              onChange={this.handleChange}
              value={this.state.newQuestion.answer}
            />
            <Form.Text className="text-muted">
              The frequently asked question's answer.
            </Form.Text>
          </Form.Group>
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
            These questions will help your attendees!
          </Form.Text>
        </Form>
      </div>
    );
  }
}