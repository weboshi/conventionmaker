import React, { Component } from "react";
import { Form, Button, Card } from "react-bootstrap";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Dashboard } from "../components/Dashboard";
import Alert from 'react-bootstrap/Alert'
import Accordion from 'react-bootstrap/Accordion'
import DatePicker from "react-datepicker";
import LoaderButton from "../components/LoaderButton";
import { ModalComponent } from "../components/Modal";
import { AlertComponent } from "../components/AlertComponent";
import config from "../config";
import { API } from "aws-amplify";
import ListGroup from 'react-bootstrap/ListGroup';
import { s3Upload } from "../libs/awsLib"
import "./EditFaq.css";
import "react-datepicker/dist/react-datepicker.css";

var AWS = require("aws-sdk");


export default class CreateConvention extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isSuccessful: false,
        title: '',
        newQuestion: {},
        createQuestion: '',
        question: '',
        answer: '',
        show: false,
        showAlert: false,
        success: '',
      };
      this.handleChange = this.handleChange.bind(this);

      this.handleShow = (e) => {
        this.setState({ [e.target.id]: true,
        isSuccessful: false });
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
      this.handleDismiss = () => 
        this.setState({ showAlert: false, })
    }


  

  componentDidMount = async () => {
      try {
          const convention = await this.getConvention();
          const { faq, title, conId } = convention;
          console.log(convention)
          console.log(faq)
          if(faq){
            this.setState({
              faq: faq,
              title: title,
              conId: conId
          })
          }
          else {
            this.setState({
              faq: null,
              title: title,
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
    return this.state.question.length > 0 && this.state.answer.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();
  
    this.setState({ 
      isLoading: true });

    try {
    await this.saveQuestion()
    if(this.state.newFaq){
        await this.updateConvention({
          faq: this.state.newFaq
          })
        this.setState({
          faq: this.state.newFaq
        })
    }
    else {
        await this.updateConvention({
            faq: this.state.faq
          })
          console.log(this.state.newFaq)
    }

      this.setState({
        isSuccessful: true,
        showAlert: true,
        successAlert: "Question successfully created.",
        success: true,
      })

      setTimeout(() => {
        this.setState({
          show: false,
          question: '',
          answer: '',
        })
      }, 500);

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  saveQuestion = () => {
    if (this.state.faq === null) {
        const faq = [];
        const newQuestion = {
            question: this.state.question,
            answer: this.state.answer,
        }
        faq.push(newQuestion)
        this.setState({
            newFaq: faq
        }, () => console.log(this.state.newFaq))
    }
    else {
        const faq = this.state.faq
        const question = this.state.question
        const answer = this.state.answer
        const newQuestion = {question: question, answer: answer}
        faq.push(newQuestion)
        this.setState({
          faq: faq
        })
        console.log(this.state.faq)
    }

  }

  
  updateConvention = (convention) => {
    return API.put("conventions", `/conventions/updateFaq/${this.props.match.params.id}`, {
      body: convention
    })
  }

  createQuestion = (e) => {
    console.log(e.target.id)
      this.handleShow(e)
  }

  editQuestion = (question, i) => {
    this.setState({
      editQuestion: i,
      questionEdit: question.question,
      answerEdit: question.answer,
    })
  }

  cancelEdit = () => {
    this.setState({
      editQuestion: '',
      questionEdit: '',
      answerEdit: '',
    })
  }

  saveEdit = async () => {
    const index = this.state.editQuestion
    const faq = this.state.faq
    const question = {
      question: this.state.questionEdit,
      answer: this.state.answerEdit,
    }

    faq[index] = question

    try {
      await this.updateConvention({
        faq: this.state.faq
      })

      this.setState({
        editQuestion: '',
        questionEdit: '',
        answerEdit: '',
        successAlert: "Question successfully edited!"
      })
    }
    catch(e) {
      alert(e)
    }
  }

  askToDelete = (i) => {
    this.handleDeleteShow();
    this.setState({
      deleteQuestion: i,
    })
  }

  cancelDelete = () => {
    this.handleDeleteHide()
  }

  deleteQuestion = async () => {
    const faq = this.state.faq
    const index = this.state.deleteQuestion
    faq.splice(index, 1)
    console.log(faq)

    try {
      await this.updateConvention({
        faq: faq
      })

      this.setState({
        deleteQuestion: '',
        showDelete: 0,
        successAlert: "Question successfully deleted!"
      })
    }
    catch(e) {
      alert(e)
    }

  }

  changeOrder = (index, newIndex) => {
    const faq = this.state.faq
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

  mapFaq = (faq) => {
      return faq.map((question, i) =>
      i === this.state.editQuestion ? 
      <Card>
      <Card.Header>
        <div className="faq-header">
        <div className="faq-header-section"></div>
        <div className="faq-header-section">Question {(i+1)}</div>
        <div className="faq-header-section editOptions">
          <i title="Click to save" onClick={this.saveEdit} className="far fa-save editIcon"></i> 
          <i title="Cancel edit" onClick={this.cancelEdit} className="far fa-window-close editIcon redIcon"></i>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="order-edit">
        <Form.Group controlId="exampleForm.ControlSelect1">
          <Form.Label>Order</Form.Label>
          <Form.Control as="select">
            {faq.map((question, b) => 
            <option key={b} value={b}>{b+1}</option>)}
          </Form.Control>
        </Form.Group>
        </div>
        <Card.Body>
        <Form.Group controlId="questionEdit">
        <Form.Label>Question</Form.Label>
          <Form.Control
            placeholder="Enter question"
            onChange={this.handleChange}
            value={this.state.questionEdit}
          />
          <Form.Text className="text-muted">
            The frequently asked question.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="answerEdit">
        <Form.Label>Answer</Form.Label>
          <Form.Control
            placeholder="Enter answer"
            onChange={this.handleChange}
            value={this.state.answerEdit}
          />
          <Form.Text className="text-muted">
            The frequently asked question's answer.
          </Form.Text>
        </Form.Group>
        </Card.Body>

      </Card.Body>
      </Card>
      :
      <Card key={i}>
      <Card.Header>
        <div className="header-faq">
          <div className="faq-header-section"></div>
          <div className="faq-header-section">Question {(i+1)}</div> 
          <div className="faq-header-section editOptions">
            <i onClick={() => this.editQuestion(question, i)} className="fas fa-edit editIcon"></i>
            <i id={"showDelete"} onClick={() => this.askToDelete(i)} className="fas fa-trash-alt editIcon"></i>
          </div>
        </div>
        </Card.Header>
      <Card.Body>
        <Form.Group controlId="question">
        <Form.Label>Question</Form.Label>
          <Form.Control
            readOnly 
            placeholder="Enter question"
            onChange={this.handleChange}
            value={question.question}
          />
          <Form.Text className="text-muted">
            The frequently asked question.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="answer">
        <Form.Label>Answer</Form.Label>
          <Form.Control
            readOnly 
            placeholder="Enter answer"
            onChange={this.handleChange}
            value={question.answer}
          />
          <Form.Text className="text-muted">
            The frequently asked question's answer.
          </Form.Text>
        </Form.Group>
        </Card.Body>
      </Card>
    )
  }

  faqPanel = () => {
      const faq = this.state.faq
    if(faq === undefined) {
        return (
          <div>
            {this.state.createQuestion && this.newQuestion()}
            <div className="loading-icon">
              <i className="fas fa-circle-notch fa-spin Loading"></i>
            </div>
          </div>
        )
    }
    else if(faq === null || faq.length === 0) {
        return (
            <div>
                {this.state.createQuestion && this.newQuestion()}
                <div className="loading-icon">
                  No FAQ questions. Add a few to help out attendees.
                </div>
            </div>
        )
    }
    else {
        return (
            <div>
                {this.state.createQuestion && this.newQuestion()}
                {this.mapFaq(this.state.faq)}
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
          <Breadcrumb.Item active>F.A.Q.</Breadcrumb.Item>
        </Breadcrumb>
        <div className="dashboard-container-basic">
          <Dashboard conId={this.state.conId}/>
          <div className="mainContainer">
            <div className="section-header">
              <h3>FAQ Section</h3>
            </div>
            <div className="alert-section">
            <AlertComponent 
              success={this.state.success} 
              successAlert={this.state.successAlert} 
              handleDismiss={this.handleDismiss} 
              alert={this.state.alert} 
              show={this.state.showAlert}/>
            </div>
            <div className="faq-panel"><div className="faq-control">
              <Button id={"show"} onClick={this.createQuestion}><i className="fas fa-plus-circle"></i> Add Question</Button>
            </div>
              {this.state.faq === undefined ? '' : this.faqPanel()}
            </div>
          </div>
          <div className="filler"></div>
        </div>
        <ModalComponent 
          id={"showDelete"} 
          size={"sm"} 
          show={this.state.showDelete} 
          onHide={this.handleDeleteHide}>
          <div className="delete-panel">
            <div>
              Are you sure you want to delete this question?
            </div>
            <div className="delete-panel-buttons">
            <Button variant={"primary"} onClick={this.deleteQuestion}>Yes</Button>
            <Button variant={"primary"} onClick={this.cancelDelete}>No</Button>
            </div>
          </div>
        </ModalComponent>
        <ModalComponent 
          id={"show"} 
          size={"lg"} 
          header={"Create Question"} 
          show={this.state.show} 
          onHide={this.handleHide}>
        <Form>
        <Form.Group controlId="question">
          <Form.Control 
            placeholder="Enter question"
            onChange={this.handleChange}
            value={this.state.question}
          />
          <Form.Text className="text-muted">
            The frequently asked question.
          </Form.Text>
        </Form.Group>
        <Form.Group controlId="answer">
          <Form.Control 
            placeholder="Enter answer"
            onChange={this.handleChange}
            value={this.state.answer}
          />
          <Form.Text className="text-muted">
            The frequently asked question's answer.
          </Form.Text>
        </Form.Group>
        <LoaderButton
          onSuccess={this.state.isSuccessful}
          onClick={this.handleSubmit}
          block
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Add Question"
          loadingText="Creating…"
        />
        <Form.Text className="text-muted">
          These questions will help your attendees with basic information.
        </Form.Text>
      </Form>
        </ModalComponent>
      </div>
    );
  }
}