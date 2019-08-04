import React, { Component } from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Dashboard } from "../components/Dashboard";
import LoaderButton from "../components/LoaderButton";
import { Alert, AlertComponent } from "../components/AlertComponent";
import config from "../config";
import { API, Storage } from "aws-amplify";
import { s3Upload } from "../libs/awsLib"
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
        readyToPublish: null
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
            title
        } = convention;


        this.setState({
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
            title
        });
    
        this.checkSections()

    } catch (e) {
      alert(e);
    }
  }

  publishConvention = async () => {
    let publish = this.state.publish

    this.setState({
        isLoading: true
    })

    try {
        await this.updateConvention({
            publish: publish
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
    }

    const arrayCheck = [basic, events, faq, schedule, landing]

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
                <Button variant="outline-secondary">Schedule <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Events <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">Landing <i className="fas fa-cog fa-spin"></i></Button>
                <Button variant="outline-secondary">FAQ <i className="fas fa-cog fa-spin"></i></Button>
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
    if (readyToPublish === null){
        return (
            <div className="publish-button">
                <span className="publish-message"><i class="fas fa-spinner fa-pulse"></i></span>
                <Button size={'lg'} variant="outline-secondary">Publish <i className="fas fa-cog fa-spin"></i></Button>
            </div>

        )
    }
    else if (readyToPublish === 1){
        return (
            <div className="publish-button">
              <div className="flex-publish">
                <div className="publish-message"><i className="fas fa-check"></i> All systems go! You are ready to publish.</div>
                <LoaderButton 
                isLoading={this.state.isLoading} 
                isSuccessful={this.state.successful}
                text={'Publish'}
                size={'lg'}
                onClick={this.publishConvention}
            />
              </div>
        </div>
        )
    }
    else if (readyToPublish === 0){
        return (
            <div className="publish-button">
                <span className="publish-message">Not ready to be published.</span><LoaderButton variant="warning" disabled={true} text={'Publish'} size={'lg'} warning={true}/>
            </div>
        )
    }
  }

  showPreview = () => {
    window.open(`/convention/preview/${this.state.conId}`, "_blank")
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
              handleDismiss={this.handleDismiss} 
              show={this.state.showAlert}>
            </AlertComponent>
          </div>
            <div className="publish">
                <p>
                Publishing means making your convention available for viewing in a site format and searchable through the list of conventions. Before you can publish your convention, all of the sections must be completed.
                </p>
            </div>
            <div className="publish-check">
                {this.renderPreCheck()}
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
            <div className="filler">
            </div>
        </div>
      </div>
    );
  }
}