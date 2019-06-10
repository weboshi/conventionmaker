import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

export class ModalComponent extends Component {
    render() {
      if(this.props.header) {
        return (
            <Modal
              {...this.props}
              size={this.props.size}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                  {this.props.header}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {this.props.children}
              </Modal.Body>
            </Modal>
          );    
      }
          
      else {
        return (
            <Modal
              {...this.props}
              size={this.props.size}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Body>
                {this.props.children}
              </Modal.Body>
            </Modal>
          );

      }
    }  
      
}
  