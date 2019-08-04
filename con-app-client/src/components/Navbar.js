import React, { Component } from 'react';
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { Link, Element , Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'
import classnames from "classnames";
import './Navbar.css';




export class NavigationBar extends Component {
    constructor(props){
        super(props);
        this.state = {
            theme: null,
            isTop: true,
        }
    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll);
    }
      
    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll = () => {
        const windowH = window.innerHeight;
        const isTop = window.scrollY < windowH - 60;
        if (isTop !== this.state.isTop) {
            this.setState({ isTop })
        }
    };

    render(){
        const { theme } = this.state;
        const { title } = this.props;
        if(!theme){
            return(
                <Navbar style={{backgroundColor:'transparent !important'}} fixed="top" className={classnames("preview-nav", "justify-content-center", {
                    "navbar--hidden": !this.state.isTop
                  })} bg="light" variant="light">
                    <Navbar.Brand href="#home">{title}</Navbar.Brand>
                    <Navbar.Collapse>
                    <Nav className="ml-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#info">
                    <Link activeClass="active" to="details-section" spy={true} offset={-70} smooth={true} duration={500} onSetActive={this.handleSetActive}>
                        Info
                    </Link>
                    </Nav.Link>
                    <Nav.Link href="#events">
                    <Link activeClass="active" to="events-section" spy={true} offset={-70} smooth={true} duration={500} onSetActive={this.handleSetActive}>
                        Events
                    </Link>
                    </Nav.Link>
                    <Nav.Link href="#guests">
                    <Link activeClass="active" to="guests-section" spy={true} offset={-70} smooth={true} duration={500} onSetActive={this.handleSetActive}>
                        Guests
                    </Link>
                    </Nav.Link>
                    <Nav.Link href="#schedule">
                    <Link activeClass="active" to="faq-section" spy={true} offset={-70} smooth={true} duration={500} onSetActive={this.handleSetActive}>
                        FAQ
                    </Link>
                    </Nav.Link>
                    <Nav.Link href="#schedule">
                    <Link activeClass="active" to="schedule-section" spy={true} offset={-70} smooth={true} duration={500} onSetActive={this.handleSetActive}>
                        Schedule
                    </Link>
                    </Nav.Link>
                    <Nav.Link href="#links">
                    <Link activeClass="active" to="links-section" spy={true} offset={-70} smooth={true} duration={500} onSetActive={this.handleSetActive}>
                        Links
                    </Link>
                    </Nav.Link>
                    </Nav>
                    </Navbar.Collapse>
                </Navbar>
            )
        }
        else if (theme === 'light'){
            return(
                <Navbar bg="light" variant="light">
                    <Navbar.Brand href="#home">{title}</Navbar.Brand>
                    <Nav className="mr-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#info">Info</Nav.Link>
                    <Nav.Link href="#events">Events</Nav.Link>
                    <Nav.Link href="#schedule">FAQ</Nav.Link>
                    <Nav.Link href="#schedule">Schedule</Nav.Link>
                    </Nav>
                </Navbar>
            )
        }
        else if (theme === 'dark'){
            return(
                <Navbar bg="dark" variant="dark">
                    <Navbar.Brand href="#home">{title}</Navbar.Brand>
                    <Nav className="mr-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#info">Info</Nav.Link>
                    <Nav.Link href="#events">Events</Nav.Link>
                    <Nav.Link href="#schedule">FAQ</Nav.Link>
                    <Nav.Link href="#schedule">Schedule</Nav.Link>
                    </Nav>
                </Navbar>
            )
        }
        else if (theme === 'blue'){
            return(
                <Navbar bg="primary" variant="light">
                    <Navbar.Brand href="#home">{title}</Navbar.Brand>
                    <Nav className="mr-auto">
                    <Nav.Link href="#home">Home</Nav.Link>
                    <Nav.Link href="#info">Info</Nav.Link>
                    <Nav.Link href="#events">Events</Nav.Link>
                    <Nav.Link href="#schedule">FAQ</Nav.Link>
                    <Nav.Link href="#schedule">Schedule</Nav.Link>
                    </Nav>
                </Navbar>
            )
        }
    }
}
