import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import "./Dashboard.css"

export class Dashboard extends Component { 
    constructor(props){
        super(props); 
        this.state = {

        };
    }

    render(){
        const { conId } = this.props;
        return(
            <nav className="convention-dashboard">
                <div className="convention-dashboard-links">
                <ul>
                    <li><NavLink to={`/convention/${conId}`} activeClassName="selected">Dashboard</NavLink></li>
                    <li><NavLink to={`/convention/edit/basic/${conId}`} activeClassName="selected">Basic</NavLink></li>
                    <li><NavLink to={`/convention/edit/guests/${conId}`} activeClassName="selected">Guests</NavLink></li>
                    <li><NavLink to={`/convention/edit/events/${conId}`} activeClassName="selected">Events</NavLink></li>
                    <li><NavLink to={`/convention/edit/landing/${conId}`} activeClassName="selected">Landing</NavLink></li>
                    <li><NavLink to={`/convention/edit/faq/${conId}`} activeClassName="selected">F.A.Q.</NavLink></li>
                    <li><NavLink to={`/convention/edit/schedule/${conId}`} activeClassName="selected">Schedule</NavLink></li>
                    <li><NavLink to={`/convention/edit/links/${conId}`} activeClassName="selected">Links</NavLink></li>
                    <li><NavLink to={`/convention/publish/${conId}`} activeClassName="selected">Publish</NavLink></li>
                    <li><NavLink to={`/convention/delete/${conId}`} activeClassName="selected">Delete</NavLink></li>
                </ul>
                </div>
            </nav>
        )
    }

}