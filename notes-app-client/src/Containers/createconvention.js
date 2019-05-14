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
        name: '',
        tagline: '',
      };
      this.handleDateChange = this.handleDateChange.bind(this);

  }

  validateForm() {
    return this.state.name.length > 0 && this.state.tagline.length > 0 && this.state.startDate;
  }

  handleDateChange(date) {
    this.setState({
      startDate: date
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


</Form>;
      </div>
    );
  }
}