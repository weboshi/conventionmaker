import React, { Component } from "react";
import Nav from 'react-bootstrap/Nav'
import ScheduleComponent from "../components/ScheduleComponent";
import * as Scroll from 'react-scroll';
import { Link, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'
import { Form } from "react-bootstrap";
import { NavigationBar } from "../components/Navbar";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Dashboard } from "../components/Dashboard";
import LoaderButton from "../components/LoaderButton";
import { Alert, AlertComponent } from "../components/AlertComponent";
import config from "../config";
import { API, Storage } from "aws-amplify";
import { s3Upload } from "../libs/awsLib"
import BlankProfilePic from "../images/blankprofilepicture.png"
import "./Preview.css";

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
    //   this.renderGuests = this.renderGuests.bind(this);

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
            title,
            guests,
            links
        } = convention;

        const imageUrls = await this.getImageUrl(events);
        const guestImages = await this.getGuestImageUrl(guests);
        const modifiedSchedule = this.modifySchedule(schedule);
        console.log(modifiedSchedule)
        const range = this.getRange(startDate, endDate)
        let bannerURL = await Storage.vault.get(banner);
        let start = new Date(startDate).toDateString();
        let end = new Date(endDate).toDateString();

        this.setState({
            links,
            guestImages,
            guests,
            imageUrls,
            conId,
            bannerURL, 
            blurb, 
            description, 
            endDate,
            eventLocation, 
            events, 
            faq, 
            header, 
            headline, 
            schedule: modifiedSchedule,
            startDate,
            start,
            end,
            title,
            range,
            modifiedSchedule
        });
        console.log(this.state)

    } catch (e) {
      alert(e);
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

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  modifySchedule = (schedule) => {
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
    console.log(schedule)
    console.log(modifiedSchedule)

    return modifiedSchedule
  }

  renderEvents = () => {
      const events = this.state.events;
      const images = this.state.imageUrls
      return events.map((event, i) =>
        event.eventImage ? 
        <div className="preview-eventPanelImage" key={i}>
            <div className="inlineBlock">
                <img width={'80%'} height={'auto'} src={images[i]}></img>
            </div>
            <div className="event-div">
                <h3>{event.eventHeader}</h3>
                <p>{event.eventBlurb}</p>
            </div>
        </div>
        :
        <div className="preview-eventPanel" key={i}>
            <h3>{event.eventHeader}</h3>
                {event.eventBlurb}
        </div>
      )
  }

    getImageUrl = async (events) => {
        console.log('get image url')
        const guestArray = events
        const newArray = [];

        for(let i=0;i<guestArray.length;i++){
            if(guestArray[i].eventImage){
                try {
                    console.log(guestArray[i].eventImage)
                    let imageURL
                    imageURL = await Storage.vault.get(events[i].eventImage);
                    newArray[i] = imageURL
                }
                catch(e){
                    console.log(e)
                }
            }
        }
        return newArray
    }

    getGuestImageUrl = async (guests) => {
        console.log('get image url')
        const guestArray = guests
        const newArray = [];

        for(let i=0;i<guestArray.length;i++){
            if(guestArray[i].guestImage){
                try {
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

    mapFaq = () => {
        const faq = this.state.faq;
        return faq.map((qna, i) => 
            <div className="preview-faq-panel" key={i}>
                <h3>{qna.question}</h3>
                <h4>{qna.answer}</h4>
            </div>
        )
    }

    getRange = (startD, endD) => {
        const start = new Date(startD)
        const end = new Date(endD)
        console.log(start)
        let days = Math.ceil((((((end - start)/1000)/60)/60)/24))
        
        console.log(days)
        return days
      }

    renderGuests = () => {
        const guestImages = this.state.guestImages;
        const guests = this.state.guests;
        return guests.map((guest, i) => 
            <div className="guest-profile" key={i}>
                {guest.guestImage ? 
                <div className="guest-picture" style={{backgroundImage:`url(${guestImages[i]}`}}>
                </div> 
                : 
                <div className="guest-picture" style={{backgroundImage:`url(${BlankProfilePic})`}}>
                </div>
                }

                <div className="guest-name">
                    {guest.guestName}
                </div>
                <div className="guest-blurb">
                    {guest.guestBlurb}
                </div>
            </div>
        )
    }

    mapLinks = () => {
        const links = this.state.links;
        const modifiedLinks = [];

        links.forEach((link, i) => {
            let linkString = link.toString();
            if(linkString.includes('instagram')){
                modifiedLinks.push({link: link, icon: 'instagram'})
            }
            else if(linkString.includes('twitter')){
                modifiedLinks.push({link: link, icon: 'twitter'})
            }
            else if(linkString.includes('facebook')){
                modifiedLinks.push({link: link, icon: 'facebook'})
            }
            else {
                modifiedLinks.push({link: link, icon: 'none'})
            }
        })
        console.log(modifiedLinks)


        return modifiedLinks.map((link, i) =>
            <div className="link-panel" key={i}>
                <div className="link">
                {(link.icon === 'instagram') 
                ? <a href={link.link}><i className="fab fa-instagram"></i> {link.link}</a>
                : (link.icon === 'twitter') 
                ? <a href={link.link}><i className="fab fa-twitter"></i> {link.link}</a>
                : (link.icon === 'facebook') 
                ? <a href={link.link}><i className="fab fa-facebook-f"></i> {link.link}</a>
                : 
                <a href={link.link}>{link.link}</a>
                }                 
                </div>
            </div>
        )
    }


  render() {
    return (
        <div>
        <div className="preview-convention-header">
            <NavigationBar title={this.state.title} theme={this.state.theme}/>
        </div>
        <div className="preview-convention-basic">
        <div style={{backgroundImage: `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url(${this.state.bannerURL})`}} className="landing preview">
            <div className="banner">
                {/* <img src={this.state.bannerURL}/> */}
            </div>
            <div className="landing-header">
                <h1>{this.state.header}</h1>
            </div>
            <div className="landing-blurb">
                {this.state.blurb}
            </div>
        </div>
        <div className="basic preview-section" id="details-section">
            <div className="section-header-preview">
                <div className="section-head"><h1><i className="fas fa-info-circle"></i> INFORMATION</h1></div>
            </div>
            <div className="details">
                <ul>
                    <li>{this.state.title}</li>
                    <li>{this.state.headline}</li>
                    <li>{this.state.description}</li>
                    <li>{this.state.eventLocation}</li>
                    <li>{this.state.start}</li>
                    <li>{this.state.end}</li>
                </ul>
            </div>
        </div>
        <div className="events preview-section" id="events-section">
            <div className="section-header-preview">
                <div className="section-head"><h1><i className="fas fa-child"></i> EVENTS</h1>
                </div>
            </div>
            <div className="events">
                    {this.state.events && this.renderEvents()}
            </div>
        </div>
        <div className="guests preview-section" id="guests-section">
            <div className="section-header-preview">
                <div className="section-head"><h1><i className="fas fa-user-circle"></i> GUESTS</h1>
                </div>
            </div>
            <div className="guests">
                {this.state.guests && this.renderGuests()}
            </div>
        </div>
        <div className="faq preview-section" id="faq-section">
            <div className="section-header-preview">
                <div className="section-head"><h1><i className="fas fa-question-circle"></i> FREQUENTLY ASKED QUESTIONS</h1>
                </div>
            </div>
            <div className="faq">
                    {this.state.faq && this.mapFaq()}
            </div>
        </div>
        <div className="schedule preview-section" id="schedule-section">
            <div className="section-header-preview">
                <div className="section-head"><h1><i className="far fa-calendar-alt"></i> SCHEDULE</h1>
                </div>
            </div>
            <div className="schedule">
                {this.state.modifiedSchedule && <ScheduleComponent range={this.state.range} myEventsList={this.state.modifiedSchedule} date={this.state.startDate}/>}
            </div>
        </div>
        <div className="links preview-section" id="links-section">
            <div className="section-header-preview">
                <div className="section-head"><h1><i className="fas fa-share-alt"></i> LINKS</h1>
                </div>
            </div>
            <div className="links">
                {this.state.links && this.mapLinks()}
            </div>
        </div>
      </div>
      </div>
    );
  }
}