import React from 'react';
import "./Footer.css";

export const Footer = ({name, location, start, end}) => {
    const startD = new Date(start).toLocaleDateString();
    const endD = new Date(end).toLocaleDateString();
    return(
        <footer className="main-footer">
            {name && <span>{location}</span>}
            {location && <span>{name} <i className="far fa-copyright"></i></span>}
            {start && <span>{startD}-{endD}</span>}
            <a href="/">ConventionMaker</a>
        </footer>
    )
}