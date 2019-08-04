import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { Dashboard } from "../components/Dashboard";
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import { API, Storage } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { AlertComponent } from '../components/AlertComponent';
import Script from 'react-load-script';
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
        startDate: '',
        endDate: '',
        title: '',
        headline: '',
        description: '',
        city: '',
        query: '',
      };
      this.handleStartDateChange = this.handleStartDateChange.bind(this);
      this.handleEndDateChange = this.handleEndDateChange.bind(this);
      this.renderForm = this.renderForm.bind(this);
      this.handleEdit = this.handleEdit.bind(this);
      this.handleCancel = this.handleCancel.bind(this);
      this.handleDismiss = () => { 
        this.setState({ showAlert: false, });
      }
      this.handleScriptLoad = this.handleScriptLoad.bind(this);
      this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
      this.editLocation = () => {
        this.setState({ editing: 'query'});
      }
  }

  componentDidMount = async () => {
    try {
      const convention = await this.getConvention();
      const { title, headline, description, eventLocation, startDate, endDate, conId } = convention;

      this.setState({
        convention,
        title,
        headline,
        description,
        conId,
        query: eventLocation,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })

    }
    catch(e) {
      alert(e)
    }
  }

  handleSubmit = async () => {
    this.setState({ isLoading: true });

    try {
      await this.updateConvention({
        title: this.state.title,
        headline: this.state.headline,
        description: this.state.description,
        startDate: this.state.startDate,
        endDate: this.state.endDate
      })
      this.setState({
        success: 1,
        successAlert: "Successfully updated.",
        showAlert: 1,
        isLoading: false,
        editing: '',
      })
    }
    catch(e) {
      alert(e)
      this.setState({
        success : 0,
        successAlert: e,
        showAlert: 1,
        isLoading: false,
        editing: '',
      })
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
    return (this.state.title.length > 0 && (this.state.title !== this.state.convention.title)) ||
      (this.state.description.length > 0 && (this.state.description !== this.state.convention.description)) ||
      (this.state.headline.length > 0 && (this.state.headline !== this.state.convention.headline)) ||
      (this.state.startDate && (this.state.startDate !== this.state.convention.startDate)) ||
      (this.state.endDate && (this.state.endDate !== this.state.convention.endDate))
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

  handleEdit = (e) => {
      this.setState({
          editing: e.target.id
      })
  }

  handleCancel = (e) => {
      this.setState({
          editing: '',
      })
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

  renderForm = () => {
    let currentEdit = this.state.editing
    return (
      <div className="form-container">
        <Form>
          <Script url="https://maps.googleapis.com/maps/api/js?key=AIzaSyAdtmzsWcW2cs3bRTm2CNdNyVjfj0wEqmg&libraries=places"          
          onLoad={this.handleScriptLoad}        
        />
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
        value={this.state.description}
        onChange={this.handleChange}/>
      <Form.Text className="text-muted">
        Describe your convention.
      </Form.Text>
    </Form.Group>)}
    {(currentEdit === "query") ?
    (
      <Form.Group controlId="query">
      <Form.Label>Convention Location <CancelFormButton onClick={this.handleCancel}/></Form.Label>
      <Form.Control 
        placeholder="Enter City and State"
        onChange={this.handleChange}
        value={this.state.query}
        />
      <Form.Text className="text-muted">
        Your convention's location. 
      </Form.Text>
    </Form.Group>
    )
    :
    (
      <Form.Group controlId="query">
      <Form.Label>Convention Location <EditFormButton onClick={this.editLocation}/></Form.Label>
      <Form.Control
        readOnly
        placeholder="Enter City and State"
        onChange={this.handleChange}
        value={this.state.query}
        />
      <Form.Text className="text-muted">
        Your convention's location. 
      </Form.Text>
    </Form.Group>
    )}
    {(currentEdit === "date") ?
      (<Form.Group>
        <Form.Label>Convention Date <CancelFormButton id='date' onClick={this.handleCancel}/></Form.Label>
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
      </div></Form.Group>)
      :
      (<Form.Group>
        <Form.Label>Convention Date <EditFormButton id='date' onClick={this.handleEdit}/></Form.Label>
          <div className="date-picker">
            Start Date 
            <DatePicker
            disabled
            selected={this.state.startDate}
            onChange={this.handleStartDateChange}
            />
            </div>
            <div className="date-picker">
            End Date 
            <DatePicker
                disabled
                selected={this.state.endDate}
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
            loadingText="Updating…"
            onClick={this.handleSubmit}
        />
    </Form>
    </div>
    )
  }

  render() {
    return (
      <div className="Edit-Convention-Basic">
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item href={`/convention/${this.state.conId}`}>
          Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Basic Details</Breadcrumb.Item>
      </Breadcrumb>
        <Script url="https://maps.googleapis.com/maps/api/js?key=AIzaSyAdtmzsWcW2cs3bRTm2CNdNyVjfj0wEqmg&libraries=places"          
          onLoad={this.handleScriptLoad}        
        />
        <div className="dashboard-container-basic">
          <Dashboard conId={this.state.conId}/>
          <div className="mainContainer">
          <h3 style={{textAlign:'center'}}>Basic Details</h3>
          <div className="alert-section">
          <AlertComponent  
              success={this.state.success} 
              successAlert={this.state.successAlert} 
              handleDismiss={this.handleDismiss} 
              show={this.state.showAlert}>
          </AlertComponent>
          </div>
          {this.renderForm()}
          </div>
          <div className="filler">
          </div>
        </div>
      </div>
    );
  }
}