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


export default class EditGuests extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        newGuest: {},
        createGuest: '',
        guestName: '',
        guestBlurb: '',
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
          const { guests, title, conId} = convention;
          if (guests){
            const imageUrls = await this.getImageUrl(guests);
            console.log(imageUrls)
            console.log('if events')
            this.setState({
              guests: guests,
              imageUrls: imageUrls,
              conId: conId,
              title: title
            })
          }
          else {
            this.setState({
              guests: null,
              conId: conId,
              title: title,
          })
          console.log(guests)
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
    return this.state.guestName.length> 0 && this.state.guestBlurb.length > 0;
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
        await this.saveQuestion()
        if (this.state.newGuests){
            await this.updateConvention({
                guests: this.state.newGuests
            })
        }
        else {
            await this.updateConvention({
                guests: this.state.guests
            })
        }
    try {
        await this.getEventImages()     
    }
    catch(e){
        alert(e)
    }

    this.setState({
        isSuccessful: 1,
        showAlert: true,
        successAlert: "Guest successfully created.",
        success: true,
        guestName: '',
        guestBlurb: '',
    })

      setTimeout(() => {
        this.setState({
          show: false,
          guestName: '',
          guestBlurb: '',
        })
      }, 500);

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  saveQuestion = async () => {
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

    if (this.state.guests === null) {
        const guests = [];
        const newGuest = {
            guestName: this.state.guestName,
            guestBlurb: this.state.guestBlurb,
            guestImage: attachment
        }
        guests.push(newGuest)
        this.setState({
            newGuests: guests,
            guests: guests
        }, () => console.log(this.state.newGuests))
    }
    else {
        const guests = this.state.guests;
        const newGuest = {
            guestName: this.state.guestName, 
            guestBlurb: this.state.guestBlurb,
            guestImage: attachment,
        }
        guests.push(newGuest)
        this.setState({
          guests: guests
        })
    }

  }

  
  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/updateGuests/${this.props.match.params.id}`, {
      body: convention
    })
  }

  createGuest = (e) => {
      this.handleShow(e)
  }

  editGuest = (guest, i) => {
    this.setState({
      editGuest: i,
      guestNameEdit: guest.guestName,
      guestBlurbEdit: guest.guestBlurb
    })
  }

  cancelEdit = () => {
    this.setState({
      editGuestName: '',
      editGuestBlurb: '',
      editGuest: '',
    })
  }

  areDifferent = (param1, param2) => {
      if((param1.guestName === param2.editGuestName) && (param1.guestBlurb === param2.editGuestBlurb)){
          return 'noChange'
      }
      else if ((param1.guestName !== param2.editGuestName) && (param1.guestBlurb === param2.editGuestBlurb)){
          return 'header'
      }
      else if ((param1.guestName == param2.editGuestName) && (param1.guestBlurb !== param2.editGuestBlurb)){
        return 'blurb'
    }
  }

  saveEdit = async () => {
    const index = this.state.editGuest
    const guests = this.state.guests
    const oldGuest = guests[index]
    let newGuest = { 
        guestName: this.state.editGuestName,
        guestBlurb: this.state.editGuestBlurb
    }
    let guest;
    let attachment;

    const diff = this.areDifferent(oldGuest, newGuest)

    try {
        if(this.file){
            attachment = await s3Upload(this.file);
            switch(diff){
                case 'noChange':
                oldGuest.guestImage = attachment
                guest = oldGuest
                case 'header':
                guest = {
                    guestName: this.state.editGuestName,
                    guestBlurb: oldGuest.guestBlurb,
                    guestImage: attachment
                }
                case 'blurb':
                guest = {
                    guestName: oldGuest.guestName,
                    guestBlurb: this.state.editGuestBlurb,
                    guestImage: attachment
                }
                default:
                oldGuest.guestImage = attachment
                guest = oldGuest

            }
        }
        else {
            switch(diff){
                case 'noChange':
                guest = oldGuest
                case 'header':
                guest = {
                    guestName: this.state.editGuestName,
                    guestBlurb: oldGuest.guestBlurb,
                }
                case 'blurb':
                guest = {
                    guestName: oldGuest.guestName,
                    guestBlurb: this.state.editGuestBlurb     
                }
                default:
                guest = oldGuest

            }  
        }
    }   
    
    catch(e){
        alert(e)
    }

    console.log(guest)
    guests[index] = guest

    try {
      await this.updateConvention({
        guests: guests,
      })

      this.setState({
        editGuestName: '',
        editGuestBlurb: '',
        editGuest: '',
        guestNameEdit: '',
        guestBlurbEdit: '',
        successAlert: "Guest successfully edited!"
      })
    }
    catch(e) {
      alert(e)
    }
  }

  askToDelete = (i) => {
    this.handleDeleteShow();
    this.setState({
      deleteGuest: i,
    })
  }

  cancelDelete = () => {
    this.handleDeleteHide()
  }

  deleteGuest = async () => {
    const guests = this.state.guests
    const index = this.state.deleteGuest
    guests.splice(index, 1)

    try {
      await this.updateConvention({
        guests: guests
      })

      this.setState({
        deleteGuest: '',
        showDelete: false,
        successAlert: "Guest successfully deleted.",
        showAlert: true,
        success: 1,
        guests: guests,
      })
    }
    catch(e) {
      alert(e)
    }

  }

  changeOrder = (index, newIndex) => {
    const guests = this.state.guests
    const guest = guests[index]
    if (index = newIndex) {
      return
    }
    else if (index > newIndex){
      guests.splice(newIndex, 0, guest)
      guests.splice((index + 1), 1)
    }
    else {
      guests.splice(newIndex, 0, guest)
      guests.splice((index -1), 1)
      console.log(guests)
    }


  }

  getImageUrl = async (guests) => {
      console.log('get image url')
      const guestArray = guests
      const newArray = [];

    for(let i=0;i<guestArray.length;i++){
        if(guestArray[i].guestImage){
            try {
                console.log(guestArray[i].guestImage)
                let imageURL
                imageURL = await Storage.vault.get(guests[i].guestImage);
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
    const guestArray = this.state.guests
    const eventBoop = [];
    console.log('doing event images')

    if (guestArray) {
        for(let i=0;i<guestArray.length;i++){
            if(guestArray[i].guestImage){
                try {
                    console.log(guestArray[i].guestImage)
                    let imageURL
                    imageURL = await Storage.vault.get(guestArray[i].guestImage);
                    eventBoop[i] = imageURL
                }
                catch(e){
                    console.log(e)
                }
            }
        }
    }
    else {
        let newArray = this.state.newGuests;
        for(let i=0;i<newArray.length;i++){
            if(newArray[i].guestImage){
                try {
                    console.log(newArray[i].guestImage)
                    let imageURL
                    imageURL = await Storage.vault.get(newArray[i].guestImage);
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

  mapGuests = () => {
    let guests = this.state.guests;
    let imageUrls = this.state.imageUrls;
    console.log(guests)

    return guests.map((guest, i) =>
        i === this.state.editGuest ? 
        <Card key={i}>
        <Card.Header>
        <div className="faq-header">
        <div className="faq-header-section"></div>
        <div className="faq-header-section">Guest {(i+1)}</div>
        <div className="faq-header-section editOptions">
            <i title="Click to save" onClick={this.saveEdit} className="fas fa-save editIcon"></i> 
            <i title="Cancel edit" onClick={this.cancelEdit} className="fas fa-window-close editIcon redIcon"></i>
            </div>
        </div>
        </Card.Header>
        <Card.Body>
        <div className="order-edit">
        <Form.Group controlId="exampleForm.ControlSelect1">
            <Form.Label>Order</Form.Label>
            <Form.Control as="select">
            {guests.map((guest, b) => 
            <option key={b} value={b}>{b+1}</option>)}
            </Form.Control>
        </Form.Group>
        </div>
        <Form.Group controlId="guestNameEdit">
          <Form.Label>Guest Name</Form.Label>
          <Form.Control
            placeholder={guest.guestName}
            onChange={this.handleChange}
            value={this.state.guestNameEdit}
            />
          <Form.Text className="text-muted">
            The name of the guest.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="guestBlurbEdit">
          <Form.Label>Guest Blurb</Form.Label>
          <Form.Control
            as="textarea"
            placeholder={guest.guestBlurb}
            onChange={this.handleChange}
            value={this.state.guestBlurbEdit}
            />
          <Form.Text className="text-muted">
            A description of the guest. 
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="file">
                <div className="event-image">{guest.guestImage && <img min-height='100px' src={imageUrls[i]}></img>}</div>
                <Form.Control style={{textAlign:"center"}} onChange={this.handleFileChange} type="file" />
                <Form.Text className="text-muted">
                Upload a picture for the guest.
            </Form.Text>   
        </Form.Group>         
        </Card.Body>
        </Card>
        :
        <Card key={i}>
        <Card.Header>
        <div className="faq-header">
            <div className="faq-header-section"></div>
            <div className="faq-header-section">Guest {(i+1)}</div> 
            <div className="faq-header-section editOptions">
            <i onClick={() => this.editGuest(guest, i)} className="fas fa-edit editIcon"></i>
            <i id={"showDelete"} onClick={() => this.askToDelete(i)} className="fas fa-trash-alt editIcon"></i>
            </div>
        </div>
        </Card.Header>
        <Card.Body>
        <Form.Group controlId="query">
          <Form.Label>Guest Name</Form.Label>
          <Form.Control
            readOnly
            placeholder="Enter guest name"
            onChange={this.handleChange}
            value={guest.guestName}
            />
          <Form.Text className="text-muted">
            The name of the guest.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="query">
          <Form.Label>Guest Blurb</Form.Label>
          <Form.Control
            as="textarea"
            readOnly
            placeholder="Enter guest blurb"
            onChange={this.handleChange}
            value={guest.guestBlurb}
            />
          <Form.Text className="text-muted">
            A description of the guest.
          </Form.Text>
        </Form.Group>
        {(guest.guestImage) 
          ?
          (<Form.Group>
            <Form.Label className="text-center" style={{display:'inline-block'}}>Guest Picture</Form.Label>
            <div className="event-image">
              <img min-height='100px' src={imageUrls[i]}></img>
            </div>
          </Form.Group>)
            :
            (<div>
              No image.
            </div>)
          }
        </Card.Body>
        </Card>
        )
        }
  

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

 guestsPanel = () => {
    const guests = this.state.guests;

    if(guests === undefined){
        return (
            <div>
                {this.state.createGuest && this.newGuest()}
                <div className="loading-icon">
                  <i className="fas fa-circle-notch fa-spin Loading"></i>
                </div>
            </div>
        )
    }
    else if(guests === null || guests.length === 0){
      return (
        <div>
          {this.state.createGuest && this.newGuest()}
          <div className="loading-icon">
            No guests. Add some to inform attendees.
          </div>
        </div>
      )
    }
    else {
        return (
            <div>
                {this.state.createGuest && this.newGuest()}
                {this.mapGuests()}
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
          <Breadcrumb.Item active>Guests</Breadcrumb.Item>
        </Breadcrumb>
        <div className="dashboard-container-basic">
        <Dashboard conId={this.state.conId}/>
          <div className='mainContainer'>
            <div className="section-header">
              <h3>Guests Section</h3>
            </div>
            <div className="alert-section">
                <AlertComponent 
                  success={this.state.success} 
                  successAlert={this.state.successAlert} 
                  handleDismiss={this.handleDismiss} 
                  show={this.state.showAlert}/>
            </div>
            <div className="faq-panel">
              <div className="faq-control"><Button id={"show"} onClick={this.createGuest}><i className="fas fa-plus-circle"></i> Add Guest</Button></div>
              {this.state.guests !== undefined && this.guestsPanel()}
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
              Are you sure you want to delete this guest?
            </div>
            <div className="delete-panel-buttons">
            <Button variant={"primary"} onClick={this.deleteGuest}>Yes</Button>
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
        <Form.Group controlId="guestName">
          <Form.Control 
            placeholder="Enter guest name."
            onChange={this.handleChange}
            value={this.state.guestName}
          />
          <Form.Text className="text-muted">
            Your guest's name.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="guestBlurb">
          <Form.Control
            as="textarea" 
            placeholder="Enter guest blurb."
            onChange={this.handleChange}
            value={this.state.guestBlurb}
          />
          <Form.Text className="text-muted">
            The guest's blurb, a short description.
          </Form.Text>
        </Form.Group>
            <Form.Group controlId="file">
              {this.state.bannerURL && <img src={this.state.bannerURL} max-width='100%' width='100%'></img>}
              <Form.Control onChange={this.handleFileChange} type="file" />
              <Form.Text className="text-muted">Upload an image for your guest. If no image is uploaded, a placeholder will be shown.</Form.Text>
            </Form.Group>
        <LoaderButton
          onSuccess={this.state.isSuccessful}
          onClick={this.handleSubmit}
          block
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Create Guest"
          loadingText="Creating…"
        />
        <Form.Text className="text-muted">
          Use guests to showcase the biggest draws for your convention.
        </Form.Text>
      </Form>
        </ModalComponent>
      </div>
    );
  }
}