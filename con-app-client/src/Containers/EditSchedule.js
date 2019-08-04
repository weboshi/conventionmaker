import React, { Component } from "react";
import { Form, Button, Card } from "react-bootstrap";
import Breadcrumb from 'react-bootstrap/Breadcrumb'
import { Dashboard } from "../components/Dashboard";
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import ScheduleComponent from "../components/ScheduleComponent";
import { ModalComponent } from "../components/Modal";
import { AlertComponent } from "../components/AlertComponent";
import * as dates from 'date-arithmetic'
import config from "../config";
import { API } from "aws-amplify";
import ListGroup from 'react-bootstrap/ListGroup';
import { s3Upload } from "../libs/awsLib"
import "./EditSchedule.css";
import "react-datepicker/dist/react-datepicker.css";
import 'react-big-calendar/lib/css/react-big-calendar.css';

var AWS = require("aws-sdk");


export default class EditSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        title: '',
        show: false,
        showAlert: false,
        success: '',
        eventName: '',
        eventBlurb: '',
        eventLocation: '',
        eventStart: '',
        eventEnd: '',
        showPreview: false,
      };
      this.handleChange = this.handleChange.bind(this);

      this.handleShow = (e) => {
        this.setState({ [e.target.id]: true });
      };
  
      this.handleHide = () => {
        this.setState({ show: false });
      };

      this.handleDeleteShow = (e) => {
        this.setState({ showDelete: true });
      };

      this.showPreview = (e) => {
        const modifiedSchedule = this.modifySchedule(this.state.schedule)
        const range = this.getRange()
        console.log(range)
        this.setState({ 
          showPreview: true,
          schedulePreview: modifiedSchedule,
          range: range
        }, () => console.log(this.state));
      }

      this.closePreview = (e) => {
        this.setState({
          showPreview: false,
        })
      }

      this.handlePreviewHide = (e) => {
        this.setState({showPreview: false});
      }

      this.handleDeleteHide = () => {
        this.setState({ showDelete: false })
      }
      this.handleDismiss = () => { 
        this.setState({ showAlert: false, })
      }
      this.handleStartDateChange = (date) => {
        this.setState({
          eventStart: date
        });
      }
      this.handleEndDateChange = (date) => {
        this.setState({
          eventEnd: date
        });
      }
    }
  
    handleEndDateChange(date) {
      this.setState({
        endDate: date
      });
    }


  componentDidMount = async () => {
      try {
          const convention = await this.getConvention();
          const { title, schedule, startDate, endDate, conId } = convention;

          if(schedule){
            this.setState({
              schedule: schedule,
              title: title,
              startDate: startDate,
              endDate: endDate,
              conId: conId
            })
          }
          else {
            this.setState({
              title: title,
              schedule: null,
              startDate: startDate,
              endDate: endDate,
              conId: conId
            })
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
    return this.state.eventName.length > 0 && this.state.eventBlurb.length > 0 && this.state.eventLocation.length > 0
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  getRange = () => {
    const start = new Date(this.state.startDate)
    const end = new Date(this.state.endDate)
    let days = Math.ceil((((((end - start)/1000)/60)/60)/24))
    
    console.log(days)
    return days
  }

  modifySchedule = () => {
    const schedule = this.state.schedule;
    const modifiedSchedule = [];


    for(let event of schedule) {
      modifiedSchedule.push({
        title: event.eventName,
        blurb: event.eventBlurb,
        location: event.eventLocation,
        start: new Date(event.eventStart),
        end: new Date(event.eventEnd),
      })
    }

    console.log(modifiedSchedule)

    return modifiedSchedule
  }

  handleSubmit = async event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    try {
    await this.saveQuestion()
        if(this.state.newSchedule){
            await this.updateConvention({
                schedule: this.state.newSchedule
            })
            this.setState({
            schedule: this.state.newSchedule
            })
        }
    else {
        await this.updateConvention({
            schedule: this.state.schedule,
          })
          console.log("newfaq" + this.state.newSchedule)

    }

      this.setState({
        isSuccessful: 1,
        showAlert: 1,
        successAlert: "Event successfully created.",
        success: 1,
      })

      setTimeout(() => {
        this.setState({
          show: false,
          question: '',
          answer: '',
          isSuccessful: 0,
        })
      }, 500);

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  saveQuestion = () => {
    console.log("save question" + this.state.schedule)
    const newEvent = {
        eventName: this.state.eventName,
        eventBlurb: this.state.eventBlurb,
        eventLocation: this.state.eventLocation,
        eventStart: this.state.eventStart,
        eventEnd: this.state.eventEnd
    }

    if (this.state.schedule === null) {
        const schedule = [];
        schedule.push(newEvent);

        this.setState({
            newSchedule: schedule
        }, () => console.log(this.state.newSchedule))
    }
    else {
        const schedule = this.state.schedule
        schedule.push(newEvent)
        this.setState({
          schedule: schedule
        })
        console.log(this.state.schedule)
    }
  }

  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/updateSchedule/${this.props.match.params.id}`, {
      body: convention
    })
  }

  createEvent = (e) => {
    console.log(e.target.id)
      this.handleShow(e)
  }

  editEvent = (event, i) => {
    this.setState({
      editEvent: i,
      eventNameEdit: event.eventName,
      eventBlurbEdit: event.eventBlurb,
      eventLocationEdit: event.eventLocation,
      eventStartEdit: event.eventStart,
      eventEndEdit: event.eventEnd,
    })
  }

  cancelEdit = () => {
    this.setState({
        editEvent: '',
        eventNameEdit: '',
        eventBlurbEdit: '',
        eventLocationEdit: '',
        eventStartEdit: '',
        eventEndEdit: '',
    })
  }

  saveEdit = async () => {
    const index = this.state.editEvent;
    const schedule= this.state.schedule;
    const event = {
        eventNameEdit: this.state.eventName,
        eventBlurbEdit: this.state.eventBlurb,
        eventLocationEdit: this.state.eventLocation,
        eventStartEdit: this.state.eventStart,
        eventEndEdit: this.state.eventEnd,
    }

    schedule[index] = event

    try {
      await this.updateConvention({
        schedule: schedule
      })

      this.setState({
        editEvent: '',
        eventNameEdit: '',
        eventBlurbEdit: '',
        eventLocationEdit: '',
        eventStartEdit: '',
        eventEndEdit: '',
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
    const schedule = this.state.schedule;
    const index = this.state.deleteEvent;
    schedule.splice(index, 1)
    console.log(schedule)

    try {
      await this.updateConvention({
        schedule: schedule
      })

      this.setState({
        deleteEvent: '',
        showDelete: 0,
        successAlert: "Event successfully deleted!",
        showAlert: 1,
        success: 1,
      })
    }
    catch(e) {
      alert(e)
    }

  }

  changeOrder = (index, newIndex) => {
    const schedule = this.state.schedule
    const event = schedule[index]
    if (index = newIndex) {
      return
    }
    else if (index > newIndex){
      schedule.splice(newIndex, 0, event)
      schedule.splice((index + 1), 1)
    }
    else {
      schedule.splice(newIndex, 0, event)
      schedule.splice((index -1), 1)
    }
  }

  mapFaq = (schedule) => {
      return schedule.map((event, i) =>
      i === this.state.editEvent ? 
      <Card className="text-center" key={i}>
      <Card.Header>
        <div className="faq-header">
        <div className="faq-header-section"></div>
        <div className="faq-header-section section-label">Event {i+1}</div>
        <div className="faq-header-section editOptions">
          <i onClick={this.saveEdit} className="far fa-save editIcon"></i> 
          <i onClick={this.cancelEdit} className="far fa-window-close editIcon redIcon"></i>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <Form>
        <Form.Group controlId="eventNameEdit">
        <Form.Label>Event Name</Form.Label>
          <Form.Control 
            placeholder="Enter event name"
            onChange={this.handleChange}
            value={this.state.eventNameEdit}
          />
          <Form.Text className="text-muted">
            The name of the event or panel.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventBlurbEdit">
        <Form.Label>Event Blurb</Form.Label>
          <Form.Control 
            placeholder="Enter blurb"
            onChange={this.handleChange}
            value={this.state.eventBlurbEdit}
          />
          <Form.Text className="text-muted">
            A description of the event.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventLocationEdit">
        <Form.Label>Event Location</Form.Label>
          <Form.Control 
            placeholder="Enter location"
            onChange={this.handleChange}
            value={this.state.eventLocationEdit}
          />
          <Form.Text className="text-muted">
            The event's location.
          </Form.Text>
        </Form.Group>
        <div className="date-picker">
            Start Date 
            <DatePicker
              selected={new Date(event.eventStart)}
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
              selected={new Date(event.eventEnd)}
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
          text="Add Event"
          loadingText="Creating…"
        />
        <Form.Text className="text-muted">
          The schedule of events will show your attendees where and when to go to events.
        </Form.Text>
      </Form>
      </Card.Body>
      </Card>
      :
      <Card key={i}>
      <Card.Header>
        <div className="header-faq">
          <div className="faq-header-section"></div>
          <div className="faq-header-section section-label">Event {i+1}</div> 
          <div className="faq-header-section editOptions">
            <i onClick={() => this.editEvent(event, i)} className="fas fa-edit editIcon"></i>
            <i id={"showDelete"} onClick={() => this.askToDelete(i)} className="fas fa-trash-alt editIcon"></i>
          </div>
        </div>
        </Card.Header>
      <Card.Body>
      <Form>
        <Form.Label>Event Name</Form.Label>
        <Form.Group controlId="eventName">
          <Form.Control 
            disabled
            placeholder="Enter event name"
            onChange={this.handleChange}
            value={event.eventName}
          />
          <Form.Text className="text-muted">
            The name of the event or panel.
          </Form.Text>
        </Form.Group>
        <Form.Label>Event Blurb</Form.Label>
        <Form.Group controlId="eventBlurb">
          <Form.Control 
            disabled
            placeholder="Enter blurb"
            onChange={this.handleChange}
            value={event.eventBlurb}
          />
          <Form.Text className="text-muted">
            A description of the event.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventLocation">
        <Form.Label>Event Location</Form.Label>
          <Form.Control
            disabled 
            placeholder="Enter location"
            onChange={this.handleChange}
            value={event.eventLocation}
          />
          <Form.Text className="text-muted">
            The event's location.
          </Form.Text>
        </Form.Group>
        <div className="date-picker">
            Start Date 
            <DatePicker
              disabled
              selected={new Date(event.eventStart)}
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
              disabled
              selected={new Date(event.eventEnd)}
              onChange={this.handleEndDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              timeCaption="time"
            />
          </div>
        <Form.Text className="text-muted">
          The schedule of events will show your attendees where and when to go to events.
        </Form.Text>
      </Form>
      </Card.Body>
      </Card>
    )
  }

  faqPanel = () => {
    const schedule = this.state.schedule
    console.log(schedule)
    if(schedule === undefined) {
        return (
            <div>
                <div className="faq-control"></div>
                {this.state.createEvent && this.newEvent()}
                <div className="loading-icon">
                  <i className="fas fa-circle-notch fa-spin Loading"></i>
                </div>
            </div>
        )
    }
    else if (schedule === null || schedule.length === 0 ) {
      return (
        <div>
            <div className="faq-control"></div>
            {this.state.createEvent && this.newEvent()}
            No events on the schedule, add some to help out attendees.
        </div>
    )}
    else {
        return (
            <div>
                <div className="faq-control"></div>
                {this.state.createEvent && this.newEvent()}
                {this.mapFaq(this.state.schedule)}
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
        <Breadcrumb.Item active>Schedule</Breadcrumb.Item>
      </Breadcrumb>
      <div className="dashboard-container-basic">
        <Dashboard conId={this.state.conId}/>
        <div className="mainContainer">
        <div className="section-header">
            <h3>Schedule Section</h3>
          </div>
        <div className="alert-section">
          <AlertComponent 
            success={this.state.success} 
            successAlert={this.state.successAlert} 
            handleDismiss={this.handleDismiss} 
            alert={this.state.alert} 
            show={this.state.showAlert}/>
        </div>
        <div className="faq-panel">
            <div className="button-panel">
              <Button id={"show"} onClick={this.createEvent}><i className="fas fa-plus-circle"></i> Add Event</Button>
              {!this.state.showPreview && <Button disabled={!this.state.schedule} id={"showPreview"} onClick={this.showPreview}><i className="fas fa-calendar-alt"></i> Preview Schedule</Button>}
              {this.state.showPreview && <Button onClick={this.closePreview}><i className="fas fa-calendar-alt"></i> Close Preview</Button>}
            </div>
            {this.state.showPreview 
            && 
            <div className="preview-schedule">
            {this.state.showPreview && 
              <ScheduleComponent
                style={{marginTop:'20px !important'}}
                range={this.state.range} 
                myEventsList={this.state.schedulePreview}
                date={this.state.startDate}
              />}
            </div>}
            {(!this.state.schedule) && ''}
            {(this.state.showPreview == false) && this.faqPanel()}
          </div>
        </div>
          <div className="filler">
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
        <Form.Group controlId="eventName">
          <Form.Control 
            placeholder="Enter event name"
            onChange={this.handleChange}
            value={this.state.eventName}
          />
          <Form.Text className="text-muted">
            The name of the event or panel.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventBlurb">
          <Form.Control 
            placeholder="Enter blurb"
            onChange={this.handleChange}
            value={this.state.eventBlurb}
          />
          <Form.Text className="text-muted">
            A description of the event.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="eventLocation">
          <Form.Control 
            placeholder="Enter location"
            onChange={this.handleChange}
            value={this.state.eventLocation}
          />
          <Form.Text className="text-muted">
            A description of the event.
          </Form.Text>
        </Form.Group>
        <div className="date-picker">
            Start Date 
            <DatePicker
              selected={this.state.eventStart}
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
              selected={this.state.eventEnd}
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
          text="Add Event"
          loadingText="Creating…"
        />
        <Form.Text className="text-muted">
          The schedule of events will show your attendees where and when to go to events.
        </Form.Text>
      </Form>
        </ModalComponent>
      </div>
    );
  }
}