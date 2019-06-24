import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import { Link, withRouter } from "react-router-dom";
import { API } from "aws-amplify";
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { Auth } from "aws-amplify";
import "./EditConvention.css";
import "react-datepicker/dist/react-datepicker.css";

export default class CreateConvention extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    async componentDidMount() {
        try {
          let attachmentURL;
          const note = await this.getConvention();
          const { title, headline, description, start, end, attachment } = note;
    
          if (attachment) {
            attachmentURL = await Storage.vault.get(attachment);
          }
    
          this.setState({
            note,
            title,
            headline,
            description,
            start,
            end,
            attachmentURL
          });
        } catch (e) {
          alert(e);
        }
      }
      
      getConvention() {
        return API.get("conventions", `/conventions/${this.props.match.params.id}`);
      }



    render() {
        return (
            <div className="Edit-Convention">
            <Tabs defaultActiveKey="home" transition={false} id="noanim-tab-example">
            <Tab eventKey="home" title="Home">
            <div className='Edit-Convention Header'>
                <h4>Welcome to your convention dashboard! Here you can bring your convention to life.</h4>
            </div>
            <div className='Edit-Convention Subheader'>
            To the left you will find the navigation options for editing your convention.
            </div>
            <div className='Edit-Convention Options'>
                <Link to="/convention/edit/basic">Basic</Link> is where you can edit the fundamental information about your convention, which you input when you created it.
            </div>
            <div className='Edit-Convention Options'>
                <Link to="/convention/edit/basic">Schedule</Link> lets you create your convention's schedule with time, duration and location.
            </div>
            <div className='Edit-Convention Options'>
                <Link to="/convention/edit/basic">Events</Link> is where you can create your pages for your convention's events.
            </div>
            <div className='Edit-Convention Options'>
                <Link to="/convention/edit/basic">Landing</Link> is what users will first see when visiting your convention page. Use this to advertise what makes your convention special.
            </div>
            <div className='Edit-Convention Options'>
                <Link to="/convention/edit/basic">F.A.Q.</Link> is a page for frequently asked questions. 
            </div>
            <div className='Edit-Convention Options'>
                <Link to="/convention/edit/basic">Publish</Link> Once you have completed your convention, make sure to publish it so users can see it.
            </div>
            </Tab>
            <Tab eventKey="profile" title="Profile">
            </Tab>
            <Tab eventKey="contact" title="Contact" disabled>
            </Tab>
            </Tabs>
            </div>
    )
    }
    }