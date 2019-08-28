import React, { Component } from 'react';
import Form from "react-bootstrap/Form";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Dashboard } from "../components/Dashboard";
import { AlertComponent } from "../components/AlertComponent";
import LoaderButton from "../components/LoaderButton";
import { API } from 'aws-amplify';
import "./Delete.css";

export default class DeletePage extends Component {
    constructor(props){
        super(props);
            this.state = {
                deleteConfirm: '',
                isDeleting: null
            };
    }

    componentDidMount = async () => {
        try {
            const convention = await this.getConvention()
            const {
                title,
                conId
            } = convention;

            this.setState({
                convention,
                title,
                conId
            })
        }
        catch(e){
            console.log(e)
        }
    }

    getConvention = () => {
        return API.get("conventions", `/conventions/${this.props.match.params.id}`)
    }

    deleteConvention = () => {
        return API.del("conventions", `/conventions/${this.props.match.params.id}`)
    }

    handleDelete = async event => {
        event.preventDefault();
      
        const confirmed = window.confirm(
          "Are you sure you want to delete this convention?"
        );
      
        if (!confirmed) {
          return;
        }
      
        this.setState({ isDeleting: true });
      
        try {
          await this.deleteConvention();
          this.props.history.push("/dashboard");
        } catch (e) {
          alert(e);
          this.setState({ isDeleting: false });
        }
      }

    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        })
    }

    renderForm(){
        return (
            <div className="delete-form">
                <Form>
                    <Form.Group controlId="deleteConfirm">
                        <Form.Label>Your convention's title: <strong>{this.state.title}</strong></Form.Label>
                            <Form.Control 
                            placeholder="Enter convention title to confirm deletion."
                            onChange={this.handleChange}
                            value={this.state.deleteConfirm}
                            />
                        <Form.Text className="text-muted">
                        You must type the convention title exactly.
                        </Form.Text>
                    </Form.Group>
                    {(this.state.title === this.state.deleteConfirm) ? 
                        <LoaderButton text={"Delete Convention"} 
                            onClick={this.handleDelete} 
                            isLoading={this.state.isDeleting}
                            variant="danger"
                            loadingText="Deleting..."/>
                        :
                        <LoaderButton text={"Delete Convention"} disabled/>
                    }
                </Form>
            </div>)
    }

    render() {
        return(
            <div className="Edit-Convention-Basic">
                <Breadcrumb>
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item href={`/convention/${this.state.conId}`}>
                        Dashboard
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>Delete</Breadcrumb.Item>
                </Breadcrumb>
                <div className="dashboard-container-basic">
                    <Dashboard conId={this.state.conId}/>
                    <div className="mainContainer">
                    <h3 style={{textAlign:'center'}}>Delete Convention</h3>
                    <div className="alert-section">
                    <AlertComponent  
                        success={this.state.success} 
                        successAlert={this.state.successAlert} 
                        handleDismiss={this.handleDismiss} 
                        show={this.state.showAlert}>
                    </AlertComponent>
                    </div>
                    <div className="delete-container">
                        Delete your form by typing in the title of your convention. The convention cannot be recovered after deletion.
                        {this.renderForm()}
                    </div>
                    </div>
                    <div className="filler">
                    </div>
                </div>
            </div>
        )
    }
}



