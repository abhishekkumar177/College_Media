import React from 'react';
import '../styles/main.css'; // Adjust if you want custom styles

const ErrorMessage = ({ message, visible }) => {
  if (!visible || !message) return null;
  return (
    <div className="error-message">
      {message}
    </div>
  );
};

export default ErrorMessage;
