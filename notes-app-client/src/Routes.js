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


export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
    <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
    <AuthenticatedRoute path="/notes/new" exact component={NewNote} props={childProps} />
    <AuthenticatedRoute path="/notes/:id" exact component={Notes} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;