import React, { Component } from "react";
import { Form, Button, Card } from "react-bootstrap";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { API, Storage } from "aws-amplify";
import { Dashboard } from "../components/Dashboard";
import Alert from 'react-bootstrap/Alert'
import Accordion from 'react-bootstrap/Accordion'
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import { ModalComponent } from "../components/Modal";
import { AlertComponent } from "../components/AlertComponent";
import config from "../config";
import ListGroup from 'react-bootstrap/ListGroup';
import { s3Upload } from "../libs/awsLib"
import "./EditEvents.css";
import "react-datepicker/dist/react-datepicker.css";

var AWS = require("aws-sdk");


export default class EditEvents extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        newEvent: {},
        createEvent: '',
        eventHeader: '',
        eventBlurb: '',
        show: false,
        showAlert: false,
        success: '',
        imageUrls: '',
      };
      this.handleChange = this.handleChange.bind(this);

      this.handleShow = (e) => {
        this.setState({ 
          [e.target.id]: true,
          isSuccessful: false
         });
      };
  
      this.handleHide = () => {
        this.setState({ show: false });
      };

      this.handleDeleteShow = (e) => {
        this.setState({ showDelete: true });
      };

      this.handleDeleteHide = () => {
        this.setState({ showDelete: false })
      }
      this.handleDismiss = () => { 
        this.setState({ showAlert: false, })
      }
      this.getImageUrl = this.getImageUrl.bind(this);
    }


  componentDidMount = async () => {
      try {
          const convention = await this.getConvention();
          const { events, title, conId} = convention;
          if (events){
            const imageUrls = await this.getImageUrl(events);
            console.log(imageUrls)
            console.log('if events')
            this.setState({
              events: events,
              imageUrls: imageUrls,
              conId: conId,
              title: title
            })
          }
          else {
            this.setState({
              events: null,
              conId: conId,
              title: title,
          })
          console.log(events)
          }
      }
      catch(e){
          alert(e)
      }
  }

  getConvention = () => {
    return API.get("conventions", `/conventions/${this.props.match.params.id}`)
  }

  validateForm() {
    return this.state.eventHeader.length> 0 && this.state.eventBlurb.length > 0;
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
        this.saveQuestion()
        if (this.state.newEvents){
            await this.updateConvention({
                events: this.state.newEvents
            })
        }
        else {
            await this.updateConvention({
                events: this.state.events
            })
        }
    try {
        this.getEventImages()     
    }
    catch(e){
        alert(e)
    }
    console.log('chalupa')

    this.setState({
        isSuccessful: 1,
        showAlert: true,
        successAlert: "Event successfully created.",
        success: 1,
        eventHeader: '',
        eventBlurb: '',
    })

      setTimeout(() => {
        this.setState({
          show: false,
          eventHeader: '',
          eventBlurb: '',
        })
      }, 500);

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false, success: 0, successAlert: "Event was not added.", showAlert: true });
    }
  }

  saveQuestion = async () => {
    console.log(this.state.imageUrls)
    let attachment
    try {
          attachment = this.file
          ? await s3Upload(this.file)
          : null;
        console.log(attachment)
    }
    catch(e){
        alert(e)
    }

    if (this.state.events === null) {
        const events = [];
        const newEvent = {
            eventHeader: this.state.eventHeader,
            eventBlurb: this.state.eventBlurb,
            eventImage: attachment
        }
        events.push(newEvent)
        this.setState({
            newEvents: events,
            events: events
        }, () => console.log(this.state.newEvents))
    }
    else {
        const events = this.state.events;
        const newEvent = {
            eventHeader: this.state.eventHeader, 
            eventBlurb: this.state.eventBlurb,
            eventImage: attachment,
        }
        events.push(newEvent)
        this.setState({
          events: events
        })
        console.log(this.state.events)
        console.log(this.state.imageUrls)
    }

  }

  
  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/updateEvents/${this.props.match.params.id}`, {
      body: convention
    })
  }

  createEvent = (e) => {
      this.handleShow(e)
  }

  editEvent = (event, i) => {
    this.setState({
      editEvent: i,
      eventHeaderEdit: event.eventHeader,
      eventBlurbEdit: event.eventBlurb
    })
  }

  cancelEdit = () => {
    this.setState({
      editEventHeader: '',
      editEventBlurb: '',
      editEvent: '',
    })
  }

  areDifferent = (param1, param2) => {
      if((param1.eventHeader === param2.editEventHeader) && (param1.eventBlurb === param2.editEventHeader)){
          return 'noChange'
      }
      else if ((param1.eventHeader !== param2.editEventHeader) && (param1.eventBlurb === param2.editEventHeader)){
          return 'header'
      }
      else if ((param1.eventHeader == param2.editEventHeader) && (param1.eventBlurb !== param2.editEventHeader)){
        return 'blurb'
    }
  }

  saveEdit = async () => {
    const index = this.state.editEvent
    const events = this.state.events
    const oldEvent = events[index]
    let newEvent = { 
        eventHeader: this.state.editEventHeader,
        eventBlurb: this.state.editEventBlurb
    }
    let event;
    let attachment;

    const diff = this.areDifferent(oldEvent, newEvent)

    try {

        if(this.file){
            attachment = await s3Upload(this.file);
            switch(diff){
                case 'noChange':
                oldEvent.eventImage = attachment
                event = oldEvent
                case 'header':
                event = {
                    eventHeader: this.state.editEventHeader,
                    eventBlurb: oldEvent.eventBlurb,
                    eventImage: attachment
                }
                case 'blurb':
                event = {
                    eventHeader: oldEvent.eventHeader,
                    eventBlurb: this.state.editEventBlurb,
                    eventImage: attachment
                }
                default:
                oldEvent.eventImage = attachment
                event = oldEvent

            }
        }
        else {
            switch(diff){
                case 'noChange':
                event = oldEvent
                case 'header':
                event = {
                    eventHeader: this.state.editEventHeader,
                    eventBlurb: oldEvent.eventBlurb,
                }
                case 'blurb':
                event = {
                    eventHeader: oldEvent.eventHeader,
                    eventBlurb: this.state.editEventBlurb,
                }
                default:
                event = oldEvent

            }  
        }
    }   
    
    catch(e){
        alert(e)
    }

    console.log(event)
    events[index] = event

    try {
      await this.updateConvention({
        events: events
      })

      this.setState({
        editEventHeader: '',
        editEventBlurb: '',
        editEvent: '',
        eventHeaderEdit: '',
        eventBlurbEdit: '',
        successAlert: "Event successfully edited!"
      })
    }
    catch(e) {
      alert(e)
    }
  }

  askToDelete = (i) => {
    this.handleDeleteShow();
    this.setState({
      deleteEvent: i,
    })
  }

  cancelDelete = () => {
    this.handleDeleteHide()
  }

  deleteEvent = async () => {
    const events = this.state.events
    const index = this.state.deleteEvent
    events.splice(index, 1)

    try {
      await this.updateConvention({
        events: events
      })

      this.setState({
        deleteEvent: '',
        showDelete: false,
        successAlert: "Event successfully deleted.",
        showAlert: true,
        success: 1,
        events: events,
      })
    }
    catch(e) {
      alert(e)
    }

  }

  changeOrder = (index, newIndex) => {
    const faq = this.state.events
    const question = faq[index]
    if (index = newIndex) {
      return
    }
    else if (index > newIndex){
      faq.splice(newIndex, 0, question)
      faq.splice((index + 1), 1)
      console.log(faq)
    }
    else {
      faq.splice(newIndex, 0, question)
      faq.splice((index -1), 1)
      console.log(faq)
    }


  }

  getImageUrl = async (events) => {
      console.log('get image url')
      const awsUrl = "https://convention-maker.s3-us-west-1.amazonaws.com/public/"
      const eventArray = events
      const newArray = [];

    for(let i=0;i<eventArray.length;i++){
        if(eventArray[i].eventImage){
            try {
                let imageURL = awsUrl + eventArray[i].eventImage;
                newArray[i] = imageURL
            }
            catch(e){
                console.log(e)
            }
        }
    }
    return newArray
  }

  getEventImages = async () => {
    const awsUrl = "https://convention-maker.s3-us-west-1.amazonaws.com/public/"
    const eventArray = this.state.events
    const eventBoop = [];
    console.log('doing event images')

    if (eventArray) {
        for(let i=0;i<eventArray.length;i++){
            if(eventArray[i].eventImage){
                try {
                    let imageURL = awsUrl + eventArray[i].eventImage;
                    eventBoop[i] = imageURL
                }
                catch(e){
                    console.log(e)
                }
            }
        }
    }
    else {
        let newArray = this.state.newEvents;
        for(let i=0;i<newArray.length;i++){
            if(newArray[i].eventImage){
                try {
                    let imageURL = awsUrl + eventArray[i].eventImage;
                    eventBoop[i] = imageURL
                }
                catch(e){
                    console.log(e)
                }
            }
        }

    }


    this.setState({
        imageUrls: eventBoop,
    })
  }

  mapEvents = () => {
    let events = this.state.events;
    let imageUrls = this.state.imageUrls;
    console.log(events)

    return events.map((event, i) =>
        i === this.state.editEvent ? 
        <Card key={i}>
        <Card.Header>
        <div className="faq-header">
        <div className="faq-header-section"></div>
        <div className="faq-header-section">Event {(i+1)}</div>
        <div className="faq-header-section editOptions">
            <i onClick={this.saveEdit} className="fas fa-save editIcon"></i> 
            <i onClick={this.cancelEdit} className="fas fa-window-close editIcon redIcon"></i>
            </div>
        </div>
        </Card.Header>
        <Card.Body>
        <div className="order-edit">
        <Form.Group controlId="exampleForm.ControlSelect1">
            <Form.Label>Order</Form.Label>
            <Form.Control as="select">
            {events.map((event, b) => 
            <option key={b} value={b}>{b+1}</option>)}
            </Form.Control>
        </Form.Group>
        </div>
        <Form.Group controlId="eventHeaderEdit">
          <Form.Label>Event Header</Form.Label>
          <Form.Control
            placeholder={event.eventHeader}
            onChange={this.handleChange}
            value={this.state.eventHeaderEdit}
            />
          <Form.Text className="text-muted">
            The header for the event, will be in large text above your blurb. 
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventBlurbEdit">
          <Form.Label>Event Blurb</Form.Label>
          <Form.Control
            placeholder={event.eventBlurb}
            onChange={this.handleChange}
            value={this.state.eventBlurbEdit}
            />
          <Form.Text className="text-muted">
            A description of the event. 
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="file">
                {this.state.bannerURL && <img src={this.state.bannerURL} max-width='100%' width='100%'></img>}
                <Form.Control style={{textAlign:"center"}} onChange={this.handleFileChange} type="file" />
                <Form.Text className="text-muted">
                Upload a picture for the event.
            </Form.Text>   
        </Form.Group>         
        </Card.Body>
        </Card>
        :
        <Card key={i}>
        <Card.Header>
        <div className="faq-header">
            <div className="faq-header-section"></div>
            <div className="faq-header-section">Event {(i+1)}</div> 
            <div className="faq-header-section editOptions">
            <i onClick={() => this.editEvent(event, i)} className="fas fa-edit editIcon"></i>
            <i id={"showDelete"} onClick={() => this.askToDelete(i)} className="fas fa-trash-alt editIcon"></i>
            </div>
        </div>
        </Card.Header>
        <Card.Body>
        <Form.Group controlId="query">
          <Form.Label>Event Title</Form.Label>
          <Form.Control
            readOnly
            placeholder="Enter event header"
            onChange={this.handleChange}
            value={event.eventHeader}
            />
          <Form.Text className="text-muted">
            The header for the event, will be in large text above your blurb. 
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="query">
          <Form.Label>Event Blurb</Form.Label>
          <Form.Control
            readOnly
            placeholder="Enter event blurb"
            onChange={this.handleChange}
            value={event.eventBlurb}
            />
          <Form.Text className="text-muted">
            A description of the event. 
          </Form.Text>
        </Form.Group>
        {(event.eventImage) 
          ?
          (<Form.Group>
            <Form.Label className="text-center" style={{display:'inline-block'}}>Event Picture</Form.Label>
            <div className="event-image">
              <img min-height='100px' src={imageUrls[i]}></img>
            </div>
            <Form.Text className="text-muted">
              Event picture. 
            </Form.Text>
          </Form.Group>)
            :
            (<div>
              
            </div>)
          }
        </Card.Body>
        </Card>
        )
        }
  

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  eventsPanel = () => {
    const events = this.state.events;
    console.log(events)

    if(events === undefined){
        return (
            <div>
                {this.state.createEvent && this.newEvent()}
                <div className="loading-icon">
                  <i className="fas fa-circle-notch fa-spin Loading"></i>
                </div>
            </div>
        )
    }
    else if(events === null || events.length === 0){
      return (
        <div>
          {this.state.createEvent && this.newEvent()}
          <div className="loading-icon">
            No events. Add some to advertise your convention.
          </div>
        </div>
      )
    }
    else {
        return (
            <div>
                {this.state.createEvent && this.newEvent()}
                {this.mapEvents()}
            </div>
        )
    }
  }

  render() {
    return (
      <div className="Edit-Convention-Basic">
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href={`/convention/${this.state.conId}`}>
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Events</Breadcrumb.Item>
        </Breadcrumb>
        <div className="dashboard-container-basic">
        <Dashboard conId={this.state.conId}/>
          <div className='mainContainer'>
            <div className="section-header">
              <h3>Events Section</h3>
            </div>
            <div className="alert-section">
                <AlertComponent 
                  success={this.state.success} 
                  successAlert={this.state.successAlert} 
                  handleDismiss={this.handleDismiss} 
                  show={this.state.showAlert}/>
            </div>
            <div className="faq-panel">
              <div className="faq-control"><Button id={"show"} onClick={this.createEvent}><i className="fas fa-plus-circle"></i> Add Event</Button></div>
              {this.state.events !== undefined && this.eventsPanel()}
            </div>
          </div>
          <div className='filler'>
          </div>
        </div>
        <ModalComponent 
          id={"showDelete"} 
          size={"sm"} 
          show={this.state.showDelete} 
          onHide={this.handleDeleteHide}>
          <div className="delete-panel">
            <div>
              Are you sure you want to delete this event?
            </div>
            <div className="delete-panel-buttons">
            <Button variant={"primary"} onClick={this.deleteEvent}>Yes</Button>
            <Button variant={"primary"} onClick={this.cancelDelete}>No</Button>
            </div>
          </div>
        </ModalComponent>
        <ModalComponent 
          id={"show"} 
          size={"lg"} 
          header={"Create Event"} 
          show={this.state.show} 
          onHide={this.handleHide}>
        <Form>
        <Form.Group controlId="eventHeader">
          <Form.Control 
            placeholder="Enter event header."
            onChange={this.handleChange}
            value={this.state.eventHeader}
          />
          <Form.Text className="text-muted">
            Your event's header.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventBlurb">
          <Form.Control 
            placeholder="Enter event blurb."
            onChange={this.handleChange}
            value={this.state.eventBlurb}
          />
          <Form.Text className="text-muted">
            The event's blurb, a short description.
          </Form.Text>
        </Form.Group>
            <Form.Group controlId="file">
              {this.state.bannerURL && <img src={this.state.bannerURL} max-width='100%' width='100%'></img>}
              <Form.Control onChange={this.handleFileChange} type="file" />
              <Form.Text className="text-muted">Upload an image to spice up your event. If no image is uploaded, only the header and blurb will be shown.</Form.Text>
            </Form.Group>
        <LoaderButton
          onSuccess={this.state.isSuccessful}
          onClick={this.handleSubmit}
          block
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Create Event"
          loadingText="Creating…"
        />
        <Form.Text className="text-muted">
          Use events to showcase the biggest draws for your convention.
        </Form.Text>
      </Form>
        </ModalComponent>
      </div>
    );
  }
}