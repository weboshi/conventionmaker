import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Form from 'react-bootstrap/Form'
import LoaderButton from "../components/LoaderButton";
import Tab from "react-bootstrap/Form";
import Tabs from "react-bootstrap/Form";
import { s3Upload } from "../libs/awsLib";
import config from "../config";
import "./Notes.css";

export default class Notes extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
        isLoading: null,
        isDeleting: null,
        note: null,
        content: "",
        attachmentURL: null
    };
  }

  async componentDidMount() {
    try {
      let attachmentURL;
      const note = await this.getNote();
      const { title, headline, description, start, end, attachment, conId } = note;
      console.log(conId)

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
        attachmentURL,
        conId
      });
    } catch (e) {
      alert(e);
    }
  }

  getNote() {
    return API.get("conventions", `/conventions/${this.props.match.params.id}`);
  }

  validateForm() {
    return this.state.description.length > 0;
  }
  
  formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }
  
  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
  
  handleFileChange = event => {
    this.file = event.target.files[0];
  }
  
  saveNote(note) {
    return API.put("notes", `/notes/${this.props.match.params.id}`, {
      body: note
    });
  }
  
  handleSubmit = async event => {
    let attachment;
  
    event.preventDefault();
  
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
      return;
    }
  
    this.setState({ isLoading: true });
  
    try {
      if (this.file) {
        attachment = await s3Upload(this.file);
      }
  
      await this.saveNote({
        content: this.state.content,
        attachment: attachment || this.state.note.attachment
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }
  
  deleteNote() {
    return API.del("notes", `/notes/${this.props.match.params.id}`);
  }
  
  handleDelete = async event => {
    event.preventDefault();
  
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );
  
    if (!confirmed) {
      return;
    }
  
    this.setState({ isDeleting: true });
  
    try {
      await this.deleteNote();
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  }
  
  render() {
    return (
      <div className="Notes">
        {this.state.note &&
               <div className="Edit-Convention">
               <Tabs defaultActiveKey="home" transition={false} id="noanim-tab-example">
               <Tab eventKey="home" title="Home">
               <div className='Edit-Convention Header'>
                    <h3>{this.state.title}</h3>
                  <h4>Welcome to your convention dashboard</h4>
                  <h4>Here you can bring your convention to life.</h4>
               </div>
               <div className='Edit-Convention Subheader'>
               To the left you will find the navigation options for editing your convention.
               </div>
               <div className='Edit-Convention Options'>
                   <Link to={`/convention/edit/basic/${this.state.conId}`}>Basic</Link> is where you can edit the fundamental imformation about your convention, which you input when you created it.
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
        }
      </div>
    );
  }
}