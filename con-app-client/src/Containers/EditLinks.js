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


export default class EditLinks extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        link: '',
        show: false,
        showAlert: false,
        success: '',
        createLink: '',
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
    }


  componentDidMount = async () => {
      try {
          const convention = await this.getConvention();
          const { links, title, conId} = convention;
          if (links){

            console.log('if events')
            this.setState({
              links: links,
              conId: conId,
              title: title
            })
          }
          else {
            this.setState({
              links: null,
              conId: conId,
              title: title,
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
    return this.state.link.length> 0;
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
        if (this.state.newLinks){
            await this.updateConvention({
                links: this.state.newLinks,
            })
        }
        else {
            await this.updateConvention({
                links: this.state.links
            })
        }

    this.setState({
        isSuccessful: 1,
        showAlert: true,
        successAlert: "Link successfully added.",
        success: true,
        link: '',
    })

      setTimeout(() => {
        this.setState({
          isLoading: false,
          show: false,
          link: '',
        })
      }, 500);

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  saveQuestion = async () => {

    if (this.state.links === null) {
        const links = [];
        const newLink = this.state.link
        links.push(newLink)
        this.setState({
            newLinks: links,
            links: links
        }, () => console.log(this.state.newLinks))
    }
    else {
        const links = this.state.links;
        const newLink = this.state.link;
        links.push(newLink)
        this.setState({
          links: links
        })
    }

  }

  
  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/updateLinks/${this.props.match.params.id}`, {
      body: convention
    })
  }

  createLink = (e) => {
      this.handleShow(e)
  }

  editLink = (link, i) => {
    this.setState({
      editLink: i,
      linkEdit: link,
    })
  }

  cancelEdit = () => {
    this.setState({
      editLink: '',
      linkEdit: '',
    })
  }

  areDifferent = (param1, param2) => {
      if((param1.link === param2.linkEdit)){
        return 'noChange'
      }
      else {
        return 'change'
    }
  }

  saveEdit = async () => {
    const index = this.state.editLink
    const links = this.state.links
    const oldLink = links[index];
    let newLink = this.state.linkEdit
    let link = newLink

    const diff = this.areDifferent(oldLink, newLink)

    links[index] = link

    try {
      await this.updateConvention({
        links: links,
      })

      this.setState({

        editLink: '',
        linkEdit: '',
        successAlert: "Link successfully edited!"
      })
    }
    catch(e) {
      alert(e)
    }
  }

  askToDelete = (i) => {
    this.handleDeleteShow();
    this.setState({
      deleteLink: i,
    })
  }

  cancelDelete = () => {
    this.handleDeleteHide()
  }

  deleteLink = async () => {
    const links = this.state.links
    const index = this.state.deleteLink
    links.splice(index, 1)

    try {
      await this.updateConvention({
        links: links
      })

      this.setState({
        deleteLink: '',
        showDelete: false,
        successAlert: "Link successfully deleted.",
        showAlert: true,
        success: 1,
        links: links,
      })
    }
    catch(e) {
      alert(e)
    }

  }

  changeOrder = (index, newIndex) => {
    const links = this.state.links
    const link = links[index]
    if (index = newIndex) {
      return
    }
    else if (index > newIndex){
      links.splice(newIndex, 0, link)
      link.splice((index + 1), 1)
    }
    else {
      link.splice(newIndex, 0, link)
      link.splice((index -1), 1)
    }
  }



  mapLinks = () => {
    let links = this.state.links;

    return links.map((link, i) =>
        i === this.state.editLink ? 
        <Card key={i}>
        <Card.Header>
        <div className="faq-header">
        <div className="faq-header-section"></div>
        <div className="faq-header-section">Link {(i+1)}</div>
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
            {links.map((link, b) => 
            <option key={b} value={b}>{b+1}</option>)}
            </Form.Control>
        </Form.Group>
        </div>
        <Form.Group controlId="linkEdit">
          <Form.Label>Site URL</Form.Label>
          <Form.Control
            placeholder={link}
            onChange={this.handleChange}
            value={this.state.linkEdit}
            />
          <Form.Text className="text-muted">
            The URL of the website.
          </Form.Text>
        </Form.Group>     
        </Card.Body>
        </Card>
        :
        <Card key={i}>
        <Card.Header>
        <div className="faq-header">
            <div className="faq-header-section"></div>
            <div className="faq-header-section">Link {(i+1)}</div> 
            <div className="faq-header-section editOptions">
            <i onClick={() => this.editLink(link, i)} className="fas fa-edit editIcon"></i>
            <i id={"showDelete"} onClick={() => this.askToDelete(i)} className="fas fa-trash-alt editIcon"></i>
            </div>
        </div>
        </Card.Header>
        <Card.Body>
        <Form.Group controlId="query">
          <Form.Label>Site URL</Form.Label>
          <Form.Control
            readOnly
            placeholder="Enter site url."
            onChange={this.handleChange}
            value={link}
            />
          <Form.Text className="text-muted">
            The url of the site.
          </Form.Text>
        </Form.Group>
        </Card.Body>
        </Card>
        )
        }
  

 linksPanel = () => {
    const links = this.state.links;

    if(links === undefined){
        return (
            <div>
                {this.state.createLink && this.newLink()}
                <div className="loading-icon">
                  <i className="fas fa-circle-notch fa-spin Loading"></i>
                </div>
            </div>
        )
    }
    else if(links === null || links.length === 0){
      return (
        <div>
          {this.state.createLink && this.newLink()}
          <div className="loading-icon">
            No links. Add some to help attendees.
          </div>
        </div>
      )
    }
    else {
        return (
            <div>
                {this.state.createLink && this.newLink()}
                {this.mapLinks()}
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
          <Breadcrumb.Item active>Links</Breadcrumb.Item>
        </Breadcrumb>
        <div className="dashboard-container-basic">
        <Dashboard conId={this.state.conId}/>
          <div className='mainContainer'>
            <div className="section-header">
              <h3>Links Section</h3>
            </div>
            <div className="alert-section">
                <AlertComponent 
                  success={this.state.success} 
                  successAlert={this.state.successAlert} 
                  handleDismiss={this.handleDismiss} 
                  show={this.state.showAlert}/>
            </div>
            <div className="faq-panel">
              <div className="faq-control"><Button id={"show"} onClick={this.createLink}><i className="fas fa-plus-circle"></i> Add Link</Button></div>
              {this.state.links !== undefined && this.linksPanel()}
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
              Are you sure you want to delete this link?
            </div>
            <div className="delete-panel-buttons">
            <Button variant={"primary"} onClick={this.deleteLink}>Yes</Button>
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
        <Form.Group controlId="link">
          <Form.Control 
            placeholder="Enter site url."
            onChange={this.handleChange}
            value={this.state.link}
          />
          <Form.Text className="text-muted">
            The url of the site.
          </Form.Text>
        </Form.Group>
        <LoaderButton
          onSuccess={this.state.isSuccessful}
          onClick={this.handleSubmit}
          block
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Create Link"
          loadingText="Creating…"
        />
        <Form.Text className="text-muted">
          Use links to give additional information to attendees.
        </Form.Text>
      </Form>
        </ModalComponent>
      </div>
    );
  }
}