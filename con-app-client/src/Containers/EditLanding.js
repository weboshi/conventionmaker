import React, { Component } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { Dashboard } from "../components/Dashboard";
import LoaderButton from "../components/LoaderButton";
import { Alert, AlertComponent } from "../components/AlertComponent";
import config from "../config";
import { API, Storage } from "aws-amplify";
import { s3Upload } from "../libs/awsLib"
import "./EditLanding.css";

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

export default class EditLanding extends Component {
  constructor(props) {
    super(props);
    this.state = {
        convention: null,
        showAlert: '',
        successAlert: '',
        isSuccessful: false,
        isLoading: false,
        startDate: new Date(),
        endDate: new Date(),
        header: '',
        blurb: '',
      };

      this.handleImageChange = this.handleImageChange.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleBlurbSubmit = this.handleBlurbSubmit.bind(this);
      this.handleImageSubmit = this.handleImageSubmit.bind(this);
      this.getConvention = this.getConvention.bind(this);
      this.handleEdit = this.handleEdit.bind(this);

  }

    async componentDidMount() {
    try {
      let bannerURL;
      const convention = await this.getConvention();
      console.log(convention)
      const { 
        title,
        conId,
        banner,
        blurb,
        header,
       } = convention;

      if(banner) {
        bannerURL = await Storage.vault.get(banner);
        console.log(bannerURL)
      }

      if(header) {
        this.setState({
          convention,
          title,
          bannerURL,
          header,
          blurb,
          banner,
          conId
        });
      }
      else {
        this.setState({
          conId,
          convention,
          title,
          banner,
          bannerURL,
          header: '',
          blurb: '',
        });
      }

    } catch (e) {
      alert(e);
    }
  }

  // async componentDidMount() {
  //   try {
  //     let bannerURL;
  //     const convention = await this.getConvention();
  //     console.log(convention)
  //     const { 
  //       title,
  //       headline,
  //       description,
  //       startDate,
  //       endDate,
  //       banner,
  //       blurb,
  //       header,
  //       faq,
  //      } = convention;

  //     if (banner) {
  //       bannerURL = await Storage.vault.get(banner);
  //       console.log(bannerURL)
  //     }

  //     if(header) {
  //       this.setState({
  //         convention,
  //         title,
  //         headline,
  //         description,
  //         startDate,
  //         endDate,
  //         bannerURL,
  //         header,
  //         blurb,
  //         banner,
  //         faq
  //       });
  //     }
  //     else {
  //       console.log("Smoop")
  //       this.setState({
  //         convention,
  //         title,
  //         headline,
  //         description,
  //         startDate,
  //         endDate,
  //         banner,
  //         bannerURL,
  //         header: '',
  //         blurb: '',
  //         faq
  //       });
  //     }

  //   } catch (e) {
  //     alert(e);
  //   }
  // }

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

  handleBlurbSubmit = async event => {
    event.preventDefault();

    this.setState({
      isBlurbLoading: true,
    })

    try {
      await this.updateConvention({
        title: this.state.title,
        description: this.state.description,
        headline: this.state.headline,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        faq: this.state.faq,
        banner: this.state.banner,
        header: this.state.header,
        blurb: this.state.blurb,
      })
      this.setState({
        edit: '',
        successAlert: "Successfully Updated",
        showAlert: 1,
        isBlurbLoading: false,
        success: 1,
        convention: {
          ...this.state.convention,
          header: this.state.header,
          blurb: this.state.blurb
        }

      })

    }
    catch(e){
      alert(e)
      this.setState({
        success: 0,

      })
    }
  }
  
  handleImageSubmit = async event => {
    let banner;
  
    event.preventDefault();
  
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
      return;
    }
  
    this.setState({ isLoading: true });
  
    try {
      if (this.file) {
        banner = await s3Upload(this.file);
        console.log(banner)
      }
  
      await this.updateConvention({
        title: this.state.title,
        description: this.state.description,
        headline: this.state.headline,
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        faq: this.state.faq,
        header: this.state.header,
        blurb: this.state.blurb, 
        banner: banner || this.state.convention.banner
      });
      this.setState({
        successAlert: "Image Successfully Added.",
        showAlert: 1,
        isLoading: false,
        success: 1,
      })
    }
    catch(e) {
      this.setState({
        showAlert: 1,
        isLoading: false,
        success: 0,
        errorAlert: "Image Upload Failed."
      })
    }
  }

  handleCancel = () => {
    this.setState({
      edit: '',
    })
  }

  handleEdit = (e) => {
    this.setState({
      edit: e.target.id
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

  handleImageChange(event) {
    this.file = event.target.files[0];
    this.setState({
      bannerURL: URL.createObjectURL(event.target.files[0]),
    })
  }

  renderForm = () => {
    const edit = this.state.edit;
    return (
    <Form>
    {edit === "header"
    ?
    <Form.Group controlId="header">
      <Form.Label>Convention Text Header <CancelFormButton id='header' onClick={this.handleCancel}/></Form.Label>
      <Form.Control
        placeholder="Enter header"
        onChange={this.handleChange}
        value={this.state.header}
      />
      <Form.Text className="text-muted">
        Large form text that is the first thing visitors will see on the page.
      </Form.Text>
    </Form.Group>
    :
    <Form.Group controlId="header">
      <Form.Label>Convention Text Header <EditFormButton id='header' onClick={this.handleEdit}/></Form.Label>
      <Form.Control
        readOnly 
        placeholder="Enter header"
        onChange={this.handleChange}
        value={this.state.header}
      />
      <Form.Text className="text-muted">
        Large form text that is the first thing visitors will see on the page.
      </Form.Text>
    </Form.Group>
    }
    {edit === "blurb" 
    ?
    <Form.Group controlId="blurb">
    <Form.Label>Convention Blurb <CancelFormButton id='blurb' onClick={this.handleCancel}/></Form.Label>
    <Form.Control
      as="textarea" 
      placeholder="Enter blurb"
      onChange={this.handleChange}
      value={this.state.blurb}
      />
    <Form.Text className="text-muted">
      This blurb will be under the header, put a few sentences to draw people in. 
    </Form.Text>
    </Form.Group>
    :
    <Form.Group controlId="blurb">
    <Form.Label>Convention Blurb <EditFormButton id='blurb' onClick={this.handleEdit}/></Form.Label>
    <Form.Control
      readOnly
      as="textarea" 
      placeholder="Enter blurb"
      onChange={this.handleChange}
      value={this.state.blurb}
      />
    <Form.Text className="text-muted">
      This blurb will be under the header, put a few sentences to draw people in. 
    </Form.Text>
    </Form.Group>
    }
    <LoaderButton
      onSuccess={this.state.isSuccessful}
      onClick={this.handleBlurbSubmit}
      block
      disabled={!this.validateForm()}
      type="submit"
      isLoading={this.state.isLoading}
      text="Save Header and Blurb"
      loadingText="Creating…"
    />
    <Form.Text className="text-muted">
      Upload your header and blurb.
    </Form.Text>
    </Form>
    )
  }

  renderFirstForm = () => {
    return (
    <Form>
      <Form.Group controlId="header">
        <Form.Label>Convention Text Header</Form.Label>
        <Form.Control 
          placeholder="Enter header"
          onChange={this.handleChange}
          value={this.state.header}
        />
        <Form.Text className="text-muted">
          Large form text that is the first thing visitors will see on the page.
        </Form.Text>
      </Form.Group>
      <Form.Group controlId="blurb">
        <Form.Label>Convention Blurb</Form.Label>
        <Form.Control
          as="textarea" 
          placeholder="Enter blurb"
          onChange={this.handleChange}
          value={this.state.blurb}
          />
        <Form.Text className="text-muted">
          This blurb will be under the header, put a few sentences to draw people in. 
        </Form.Text>
      </Form.Group>
      <LoaderButton
        onSuccess={this.state.isSuccessful}
        onClick={this.handleBlurbSubmit}
        block
        disabled={!this.validateForm()}
        type="submit"
        isLoading={this.state.isBlurbLoading}
        text="Save Header and Blurb"
        loadingText="Creating…"
      />
    <Form.Text className="text-muted">
      Upload your header and blurb.
    </Form.Text>
    </Form>
    )
  }

  render() {
    return (
      <div className="Edit-Convention-Basic">
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href={`/convention/${this.state.conId}`}>
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Landing</Breadcrumb.Item>
        </Breadcrumb>
        <div className="dashboard-container-basic">
          <Dashboard conId={this.state.conId}/>
          <div className="mainContainer">
            <div className="section-header">
              <h3>Edit Landing Page</h3>
            </div>
            <div className="alert-section">
            <AlertComponent  
              success={this.state.success} 
              successAlert={this.state.successAlert} 
              handleDismiss={this.handleDismiss} 
              show={this.state.showAlert}>
            </AlertComponent>
          </div>
          <div className='form-panel-container'>
          <div className="form-panel">
          <div className="form-panel-label">
            <h4>Landing Banner</h4>
          </div>
          <Form>
            <Form.Group controlId="file">
              <Form.Label>Convention Banner</Form.Label>
              {this.state.bannerURL && <img src={this.state.bannerURL} max-width='100%' width='100%'></img>}
              <Form.Control onChange={this.handleImageChange} type="file" />
              <Form.Text className="text-muted">Upload an image to be your convention's banner. Should be 700 x 200.</Form.Text>
            </Form.Group>
            <LoaderButton
                onSuccess={this.state.isSuccessful}
                onClick={this.handleImageSubmit}
                block
                disabled={!this.file}
                type="submit"
                isLoading={this.state.isLoading}
                text="Upload Banner"
                loadingText="Creating…"
              />
            <Form.Text className="text-muted">
              Upload your convention's banner.
            </Form.Text>
          </Form>
          </div>
          </div>
        <div className="form-panel-container">
        <div className="form-panel">
          <div className="form-panel-label">
            <h4>Landing Header and Blurb</h4>
          </div>
          {(this.state.convention !== null) ? this.renderForm() : this.renderFirstForm()}
        </div>
        </div>
        </div>
        <div className="filler">
        </div>
        </div>
      </div>
    );
  }
}