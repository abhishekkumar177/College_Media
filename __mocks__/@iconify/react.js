const React = require('react');

// Simple mock Icon component for tests
function Icon(props) {
  return React.createElement('span', { 'data-testid': 'iconify-icon', ...props });
}

module.exports = { Icon };
