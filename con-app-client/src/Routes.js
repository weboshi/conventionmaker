import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./Containers/home";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import NotFound from "./Containers/NotFound";
import Login from './Containers/Login';
import Signup from './Containers/Signup';
import AppliedRoute from "./components/AppliedRoute";
import NewNote from "./Containers/NewNote";
import Notes from "./Containers/Notes";
import CreateConvention from "./Containers/CreateConvention";
import EditConvention from "./Containers/EditConvention";
import EditBasic from "./Containers/EditBasic";
import Convention from "./Containers/Convention";
import EditFaq from "./Containers/EditFaq";
import EditLanding from "./Containers/EditLanding";
import EditEvents from "./Containers/EditEvents";
import EditSchedule from "./Containers/EditSchedule";
import EditGuests from "./Containers/EditGuests";
import EditLinks from "./Containers/EditLinks";
import PublishConvention from"./Containers/Publish";
import PreviewConvention from "./Containers/Preview";
import HomePage from "./Containers/HomePage";

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
    <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
    <AuthenticatedRoute path="/notes/new" exact component={NewNote} props={childProps} />
    <AuthenticatedRoute path="/notes/:id" exact component={Notes} props={childProps} />
    <AuthenticatedRoute path="/convention/new" exact component={CreateConvention} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/:id" exact component={EditConvention} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/basic/:id" exact component={EditBasic} props={childProps} />
    <AuthenticatedRoute path="/convention/:id" exact component={Convention} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/faq/:id" exact component={EditFaq} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/landing/:id" exact component={EditLanding} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/events/:id" exact component={EditEvents} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/schedule/:id" exact component={EditSchedule} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/guests/:id" exact component={EditGuests} props={childProps} />
    <AuthenticatedRoute path="/convention/edit/links/:id" exact component={EditLinks} props={childProps} />
    <AuthenticatedRoute path="/convention/publish/:id" exact component={PublishConvention} props={childProps} />
    <AuthenticatedRoute path="/convention/preview/:id" exact component={PreviewConvention} props={childProps} />
    <AuthenticatedRoute path="/home" exact component={HomePage} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>