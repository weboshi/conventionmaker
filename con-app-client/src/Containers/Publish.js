import React, { Component } from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Card from "react-bootstrap/Card";
import { Dashboard } from "../components/Dashboard";
import LoaderButton from "../components/LoaderButton";
import { Alert, AlertComponent } from "../components/AlertComponent";
import config from "../config";
import { API, Storage } from "aws-amplify";
import { s3Upload } from "../libs/awsLib"
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import "./Publish.css";

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

export default class PublishConvention extends Component {
  constructor(props) {
    super(props);
    this.state = {
        convention: null,
        showAlert: '',
        successAlert: '',
        isSuccessful: false,
        isLoading: false,
        readyToPublish: null,
        alreadyPublished: 0,
        conventionId: "",
        tags: [],
      };

      this.handleChange = this.handleChange.bind(this);
      this.getConvention = this.getConvention.bind(this);
      this.mapCheckButtons = this.mapCheckButtons.bind(this);

  }

    async componentDidMount() {
    try {
        const convention = await this.getConvention();
        console.log(convention)
        const {
            conventionId,
            conId,
            banner, 
            blurb, 
            description, 
            endDate, 
            eventLocation, 
            events, 
            faq, 
            header, 
            headline, 
            schedule, 
            startDate,
            guests,
            links, 
            title,
            published
        } = convention;


        this.setState({
            conventionId,
            guests,
            links,
            conId,
            banner, 
            blurb, 
            description, 
            endDate, 
            eventLocation, 
            events, 
            faq, 
            header, 
            headline, 
            schedule, 
            startDate, 
            title,
            alreadyPublished: published
        });
    
        this.checkSections()

    } catch (e) {
      alert(e);
    }
  }

  publishConvention = async () => {
    let publish = this.state.published;

    this.setState({
        isLoading: true
    })

    try {
        await this.updateConvention({
            published: publish
        })

        this.setState({
            published: 1,
            isSuccessful: true,
        })
    }
    catch(e){
        alert(e)
    }
  }

  updateConvention (convention) {
    return API.put("conventions", `/conventions/updatePublish/${this.props.match.params.id}`, {
        body: convention
    })
  }

  getConvention() {
    return API.get("conventions", `/conventions/${this.props.match.params.id}`);
  }

  validateForm() {
    return this.state.header.length > 0 && this.state.blurb.length > 0 && ((this.state.header !== this.state.convention.header) || (this.state.blurb !== this.state.convention.blurb))
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/updateLanding/${this.props.match.params.id}`, {
      body: convention
    })
  }

  checkSections = () => {

    let ready = 1;
    const errors = [];
    const basic = {
        name: "Basic",
        title: this.state.title,
        headline: this.state.headline,
        description: this.state.description,
        eventLocation: this.state.eventLocation,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        ready: 1,
    }
    const events = {
        name: "Events",
        events: this.state.events,
        ready: 1,
    }
    const faq = {
        name: "FAQ",
        faq: this.state.faq,
        ready: 1,
    }
    const schedule = {
        name: "Schedule",
        schedule: this.state.schedule,
        ready: 1,
    };
    const landing = {
        name: "Landing",
        banner: this.state.banner,
        header: this.state.header,
        blurb: this.state.blurb,
        ready: 1,
    };
    const guests = {
      name: "Guests",
      guests: this.state.guests,
      ready: 1
    };
    const links = {
      name: "Links",
      links: this.state.links,
      ready: 1
    };

    const arrayCheck = [basic, events, faq, schedule, landing, guests, links]

    for (let i=0;i<arrayCheck.length;i++){
        for (let property in arrayCheck[i]){
            if(arrayCheck[i][property] === null || undefined ){
                arrayCheck[i].ready = 0
                ready = 0
                if (!errors.includes(arrayCheck[i].name)){
                    errors.push(arrayCheck[i].name)
                } 
                
            }
        }
    }


    this.setState({
        publishCheck: arrayCheck,
        readyToPublish: ready,
        errors: errors,
    })

  }
  
  handleDismiss = () => {
    this.setState({
      showAlert: 0,
      successAlert: '',
      errorAlert: '',
      success: null,

    })
  }

  renderPreCheck = () => {
      const readyToPublish = this.state.readyToPublish;
      console.log(readyToPublish)
      if(readyToPublish === null){
          return (
            <div className='precheck-section'>
                <Button variant="outline-secondary">Basic <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Guests <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Events <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Landing <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Schedule <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">FAQ <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Links <i className="fas fa-cog fa-spin"></i></Button>
            </div>
          )

      }
      else{
          return(
          <div className='precheck-section'>
            {this.mapCheckButtons()}
          </div>
          )
        }
  }

  mapCheckButtons = () => {
      const publishCheck = this.state.publishCheck;
      console.log(publishCheck)
      console.log('map check')
      return publishCheck.map((section, i) => 
            section.ready === 1 ? 
            <Button key={i} variant="success">{section.name} <i className="fas fa-check"></i></Button>
            :             
            <Button style={{color:'white'}} variant="warning">{section.name} <i className="fas fa-exclamation-triangle"></i></Button>
          
      )
  }

  publishWarning = () => {
      const readyToPublish = this.state.readyToPublish;
      const errors = this.state.errors;
      const mapErrors = (array) => {
        let string = array.toString();
        let newString = string.replace(/,/g, ", ")
        return newString
      }

      if (readyToPublish === 1)
      return (
        <div>
          <div className="publish-ready">
              You are ready to publish your convention! Press the preview button to make your final checks, then publish your convention by pressing the publish button.
          </div>
          <div className="publish-check">
            <Button onClick={this.showPreview}><i className="far fa-eye"></i> Preview</Button>
          </div>
        </div>
      )
      else {
          return (
          <div>
            <div className="publish-fix">
                Your convention cannot be published yet. Please fix the following 
                {errors.length === 1 ? ` section: ${errors[0]}.` : ` sections: ${mapErrors(errors)}.`}
            </div>
            <div className="publish-check">
              <Button disabled><i className="far fa-eye"></i>Preview</Button>
            </div>
          </div>
        )
      }
  }

  publishButton = () => {
    const readyToPublish = this.state.readyToPublish;
    const alreadyPublished = this.state.alreadyPublished;
    console.log(alreadyPublished)
    console.log(readyToPublish)
    if (readyToPublish === null){
        return (
            <div className="checking-publish-button">
              <div className="flex-publish">
                <span className="publish-message-checking"><i className="fas fa-spinner fa-pulse"></i> Checking publish status...</span>
                  <LoaderButton variant="outline-secondary" isLoading={this.state.isLoading} onSuccess={this.state.isSuccessful} text={'Publish'} size={'lg'} />
              </div>
            </div>

        )
    }
    else if (readyToPublish === 1 && !alreadyPublished && this.state.conventionId.length > 0){
      return (
          <div className="publish-button">
            <div className="flex-publish">
              <div className="publish-message"><i className="fas fa-check"></i> All systems go! You are ready to publish.</div>
              <LoaderButton 
              isLoading={this.state.isLoading} 
              onSuccess={this.state.successful}
              text={'Publish'}
              size={'lg'}
              onClick={this.handlePublish}
          />
            </div>
      </div>
      )
    }
    else if (readyToPublish === 1 && !alreadyPublished){
      return (
        <div className="fail-publish-button">
          <div className="flex-publish">
            <div className="publish-messaage"><i className="fas fa-check"></i> Please enter a convention identifier to publish.</div>
              <LoaderButton
                variant="warning"
                disabled 
                isLoading={this.state.isLoading} 
                onSuccess={this.state.successful}
                text={'Publish'}
                size={'lg'}
                onClick={this.handlePublish}
              />
          </div>
        </div>
      )
    }

    else if (readyToPublish === 0){
        return (
            <div className="fail-publish-button">
                <span className="fail-publish-message">Not ready to be published.</span><LoaderButton variant="warning" disabled={true} text={'Publish'} size={'lg'} warning={true}/>
            </div>
        )
    }
  }

  publicPublish = (convention) => { 
    return API.post("conventions", "/public-conventions", {
      body: convention
  });
  }

  publicUnpublish = () => {
    return API.del("conventions", `/public-conventions/${this.state.conventionId}`)
  }

  updatePublished = () => {
    return API.post("conventions", "/updatePublished", {
      body: {
        conventionTags: this.state.tags,
        conventionCategory: this.state.conventionCategory,
        conventionId: this.state.conventionId,
        published: 1
      }
    });
  }

  publishConventionFinal = async () => {
    let convention = {
        conventionId: this.state.conventionId,
        conventionCategory: 'Frances',
        title: this.state.title,
        headline: this.state.headline,
        description: this.state.description,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        banner: this.state.banner,
        blurb: this.state.blurb,
        eventLocation: this.state.eventLocation,
        events: this.state.events,
        faq: this.state.faq,
        header: this.state.header,
        schedule: this.state.schedule,
        guests: this.state.guests,
        links: this.state.links
    }
    try {
      let boop = await this.updatePublished()
      return boop
    }
    catch(e){
      console.log(e)
    }
  }

  handlePublish = async () => {
    let convention = {
      conventionId: this.state.conventionId,
      conventionCategory: 'Frances',
      title: this.state.title,
      headline: this.state.headline,
      description: this.state.description,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      banner: this.state.banner,
      blurb: this.state.blurb,
      eventLocation: this.state.eventLocation,
      events: this.state.events,
      faq: this.state.faq,
      header: this.state.header,
      schedule: this.state.schedule,
      guests: this.state.guests,
      links: this.state.links,
      conventionTags: this.state.tags,
  }
    console.log('zoops')
    this.setState({
      isLoading: true,
    })
    try {
      await this.publicPublish(convention)
      await this.updatePublished()

      this.setState({
        success: 1,
        successAlert: "Your convention has been published!",
        showAlert: true,
        isSuccessful: true,
        isLoading: false,
      })
      console.log('success')
    }
    catch(e){
      console.log(e)
      this.setState({
        success: 0,
        errorAlert: "Error publishing convention.",
        showAlert: true,
        isSuccessful: false,
        isLoading: false
      })
    }
  }

  showPreview = () => {
    window.open(`/convention/preview/${this.state.conId}`, "_blank")
  }

  inputConventionId = () => {
    const readyToPublish = this.state.readyToPublish;
    const published = this.state.published;
    console.log(published)

    if(published === 1){
      return(
        <Form.Group controlId="conventionId">
          <Form.Label>This is your convention's identifier.</Form.Label>
          <Form.Control
            readOnly
            placeholder="Enter convention identifier."
            onChange={this.handleChange}
            value={this.state.conventionId}
            />
          <Form.Text className="text-muted">
            This will form the back end of the url for your site, please refrain from using capitals or spaces. An example is apple-convention-2019.
          </Form.Text>
      </Form.Group>
      )
    }
    else if (!readyToPublish){
      return(
        <Form.Group controlId="conventionId">
          <Form.Label>Enter a Convention Identifier, it will be used in the convention's url.</Form.Label>
          <Form.Control
            readOnly
            placeholder="Enter convention identifier."
            onChange={this.handleChange}
            value={this.state.conventionId}
            />
          <Form.Text className="text-muted">
            This will form the back end of the url for your site, please refrain from using capitals or spaces. An example is apple-convention-2019.
          </Form.Text>
      </Form.Group>
      )
    }
    else {
      return(
        <Form.Group controlId="conventionId">
          <Form.Label>Enter a Convention Identifier, it will be used in the convention's url.</Form.Label>
          <Form.Control
            placeholder="Enter convention identifier."
            onChange={this.handleChange}
            value={this.state.conventionId}
            />
          <Form.Text className="text-muted">
            This will form the back end of the url for your site, please refrain from using capitals or spaces. An example is apple-convention-2019.
          </Form.Text>
        </Form.Group>
      )
    }
  }

  unpublishConvention = () => {
    return API.put("conventions", "/conventions/updatePublished", {
      body: {
        conventionTags: this.state.tags,
        conventionCategory: this.state.conventionCategory,
        conventionId: null,
        published: 0
      }
    })
  }

  handleUnpublish = async () => {
    try {
      await this.unpublishConvention();
      await this.publicUnpublish();

      this.setState({
        isSuccessful: true,
        success: 1,
        showAlert: true,
        isLoading: false,
        successAlert: "Successfully unpublished convention."

      })

    }
    catch(e){
      console.log(e);
      this.setState({
        isSuccessful: false,
        success: 0,
        showAlert: true,
        isLoading: false,
        successAlert: "An error occurred when trying to unpublish convention."
      })
    }
  }

  isConventionPublished = () => {
    const isPublished = this.state.isPublished;

    if(this.state.isPublished === 1){
      return(
        <div>
          Your convention has been published! It can be viewed at: <a href={`/view/${this.state.conventionId}`} to="_blank"></a>

          If you wish to unpublish your convention, so it will not be public, press the unpublish button. You may lose your current convention identifier.

          <LoaderButton onClick={this.handleUnpublish} onSuccess={this.state.isSuccessful} isLoading={this.state.isLoading} />
        </div>
      )
    }
  }

  handleTagsChange = (tags) => {
    console.log(tags)
    this.setState({
      tags: tags
    })
  }

  render() {
    return (
      <div className="Edit-Convention-Basic">
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href={`/convention/${this.state.conId}`}>
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Publish</Breadcrumb.Item>
        </Breadcrumb>
        <div className="dashboard-container-basic">
          <Dashboard conId={this.state.conId}/>
          <div className="mainContainer">
            <div className="section-header">
              <h3>Publish</h3>
            </div>
            <div className="alert-section">
            <AlertComponent  
              success={this.state.success} 
              successAlert={this.state.successAlert}
              errorAlert={this.state.errorAlert} 
              handleDismiss={this.handleDismiss} 
              show={this.state.showAlert}>
            </AlertComponent>
          </div>
          {this.state.isPublished ? this.isConventionPublished() : (
          <div>
          <div className="publish">
            <p>
            Publishing means making your convention available for viewing in a site format and searchable through the list of conventions. Before you can publish your convention, you must choose a convention id and complete all of the sections.
            </p>
          </div>
          <div className="publish-check">
            {this.renderPreCheck()}
          </div>
          <div className="publish-identity">
            {this.inputConventionId()}
          </div>
          <div className="publish-middle">
            {this.state.errors ? this.publishWarning() : 
          <div className="publish-check">
              <Button disabled><i className="far fa-eye"></i>Preview</Button>
          </div>
          }
          </div>
          <div className="publish-end">
          {this.publishButton()}
          </div>
          </div>

          )}
            
        </div>
            <div className="filler">
            </div>
        </div>
      </div>
    );
  }
}