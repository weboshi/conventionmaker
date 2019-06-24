import React from "react";
import { Button } from "react-bootstrap";
import "./LoaderButton.css";

export default ({
  isLoading,
  onSuccess,
  text,
  successText = "Success!",
  loadingText,
  className = "",
  disabled = false,
  ...props
}) =>
  <Button
    className={`LoaderButton ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {/* {isLoading && } */}
    {isLoading && !onSuccess && loadingText}
    {!isLoading && !onSuccess && text}
    {onSuccess && successText}
  </Button>