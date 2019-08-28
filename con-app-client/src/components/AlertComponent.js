import React from 'react';
import Alert from 'react-bootstrap/Alert'
import Fade from 'react-bootstrap/Fade'



export const AlertComponent = (props) => {
    if (props.success === 1) {
      return (
        <Alert show={props.show} variant="success" dismissible onClose={props.handleDismiss}>
            <p className="alert-p">
              {props.successAlert}
            </p>
        </Alert>
      )
    }
    
    else if (props.success === 0) {
      return (
      <Alert show={props.show} variant="danger" onClose={props.handleDismiss} dismissible>
            <p className="alert-p">
              {props.errorAlert}
            </p>
        </Alert>
      )
    }
  
    else {
      return null
    }
  }