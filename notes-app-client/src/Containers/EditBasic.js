import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { API, Storage } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { Auth } from "aws-amplify";
import "./EditBasic.css";
import "react-datepicker/dist/react-datepicker.css";

const EditFormButton = ({id, onClick}) => {
    return (
        <div className='EditFormButton'>
            <i className="fas fa-edit" id={id} onClick={onClick}></i>
        </div>
    )
}

const CancelFormButton = (props) => {
    return (
    <div className="CancelFormButton">
        <i className="fas fa-window-close" id={props.id} onClick={props.onClick}></i>
    </div>
    )
}

export default class CreateConvention extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoading: false,
        start: '',
        end: '',
        title: '',
        headline: '',
        description: '',
      };
      this.handleStartDateChange = this.handleStartDateChange.bind(this);
      this.handleEndDateChange = this.handleEndDateChange.bind(this);
      this.renderForm = this.renderForm.bind(this);
      this.handleEdit = this.handleEdit.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount = async () => {
    try {
      const convention = await this.getConvention();
      const { title, headline, description, start, end } = convention;
      console.log(start)

      this.setState({
        title,
        headline,
        description,
        start: new Date(start),
        end: new Date(end),
      })

    }
    catch(e) {
      alert(e)
    }
  }

  saveNote(note) {
    return API.put("notes", `/notes/${this.props.match.params.id}`, {
      body: note
    });
  }

  handleSubmit = async () => {
    this.setState({ isLoading: true });

    try {
      await this.updateConvention({
        title: this.state.title,
        headline: this.state.headline,
        description: this.state.description,
        start: this.state.start,
        end: this.state.end
      })
      window.location.reload()
    }
    catch(e) {
      alert(e)
    }
  }

  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/${this.props.match.params.id}`, {
      body: convention
    })
  }

  getConvention = () => {
    return API.get("conventions", `/conventions/${this.props.match.params.id}`)
  }

  validateForm() {
    return this.state.title.length > 0 && this.state.headline.length > 0 && this.state.start;
  }

  handleStartDateChange(date) {
    this.setState({
      start: date
    });
  }

  handleEndDateChange(date) {
    this.setState({
      end: date
    });
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleEdit = (e) => {
      console.log(e.currentTarget)
      console.log(e.target.id)
      this.setState({
          editing: e.target.id
      })
  }

  handleCancel = (e) => {
      this.setState({
          editing: '',
      })
  }

  renderForm = () => {
    let currentEdit = this.state.editing
    return (
        <Form>
        {/* Name */}
        {(currentEdit === "title") ?
        <Form.Group controlId="title">
            <Form.Label>Name of the Convention <CancelFormButton id='title' onClick={this.handleCancel}/></Form.Label>
            <Form.Control 
                placeholder="Enter name" 
                value={this.state.title}
                onChange={this.handleChange}/>
            <Form.Text className="text-muted">
            Your convention's name, people will search for it by this name.
            </Form.Text>
        </Form.Group>
        :
        <Form.Group controlId="title">
        <Form.Label>Name of the Convention <EditFormButton id='title' onClick={this.handleEdit}/></Form.Label>
        <div>
        <Form.Control
            readOnly 
            placeholder="Enter name" 
            value={this.state.title}
            onChange={this.handleChange}/>
        </div>
        <Form.Text className="text-muted">
          Your convention's name, people will search for it by this name.
        </Form.Text>
        </Form.Group>}
      {/* Headline */}
      {(currentEdit === "headline") ?
      <Form.Group controlId="headline">
        <Form.Label>Convention Headline <CancelFormButton id='headline' onClick={this.handleCancel}/></Form.Label>
        <Form.Control placeholder="Enter headline"
            placeholder="Enter headline" 
            value={this.state.headline}
            onChange={this.handleChange} />
        <Form.Text className="text-muted">
          A brief description of your convention. 
        </Form.Text>
      </Form.Group>
      :
      <Form.Group controlId="headline">
      <Form.Label>Convention Headline <EditFormButton id='headline' onClick={this.handleEdit}/></Form.Label>
      <Form.Control placeholder="Enter headline"
        readOnly
        placeholder="Enter headline" 
        value={this.state.headline}
        onChange={this.handleChange} />
      <Form.Text className="text-muted">
        A brief description of your convention. 
      </Form.Text>
    </Form.Group>}

    {/*Description Section*/}
    {(currentEdit === "description") ?
      (<Form.Group controlId="description">
        <Form.Label>Convention Description <CancelFormButton onClick={this.handleCancel}/></Form.Label>
        <Form.Control 
            as="textarea" 
            placeholder="Enter description" 
            readOnly 
            placeholder="Enter description" 
            value={this.state.description}
            onChange={this.handleChange}/>
        <Form.Text className="text-muted">
          Describe your convention.
        </Form.Text>
      </Form.Group>)
      :
      (<Form.Group controlId="description">
      <Form.Label>Convention Description <EditFormButton id='description' onClick={this.handleEdit}/></Form.Label>
      <Form.Control
        readOnly 
        as="textarea" 
        placeholder="Enter description" 
        placeholder="Enter description" 
        value={this.state.description}
        onChange={this.handleChange}/>
      <Form.Text className="text-muted">
        Describe your convention.
      </Form.Text>
    </Form.Group>)}
    {(currentEdit === "date") ?
      (<Form.Group>
        <div className="date-picker">
        Start Date 
        <DatePicker
            selected={this.state.start}
            onChange={this.handleStartDateChange}
        />
      </div>
      <div className="date-picker">
        End Date 
        <DatePicker
            selected={this.state.end}
            onChange={this.handleEndDateChange}
        />
      </div></Form.Group>)
      :
      (<Form.Group>
        <Form.Label>Convention Date <EditFormButton id='date' onClick={this.handleEdit}/></Form.Label>
          <div className="date-picker">
            Start Date 
            <DatePicker
            disabled
            selected={this.state.start}
            onChange={this.handleStartDateChange}
            />
            </div>
            <div className="date-picker">
            End Date 
            <DatePicker
                disabled
                selected={this.state.end}
                onChange={this.handleEndDateChange}
            />
            </div>
        </Form.Group>)}
        <LoaderButton
            block
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Submit Changes"
            loadingText="Creating…"
            onClick={this.handleSubmit}
        />
    </Form>
    )
  }

  render() {
    return (
      <div className="Edit-Convention-Basic">
            <h2 style={{textAlign:'center'}}>Basic Details</h2>
            {this.renderForm()}
      </div>
    );
  }
}