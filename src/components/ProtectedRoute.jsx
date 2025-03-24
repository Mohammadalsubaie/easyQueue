// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  if (!auth.currentUser) {
    return <Navigate to="/" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;