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
  warning,
  ready,
  checking,
  ...props
}) =>
  <Button
    className={`LoaderButton ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {/* {isLoading && } */}
    {(isLoading && !onSuccess) && loadingText}
    {(isLoading && onSuccess) && successText }
    {!isLoading && !onSuccess && text}
    {warning && <span> <i className="fas fa-exclamation-triangle"></i></span>}
    {ready && <i class="fas fa-upload"></i>}
    {checking && <i className="fas fa-cog fa-spin"></i>}
  </Button>