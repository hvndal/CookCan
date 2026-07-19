import { registerRootComponent } from 'expo';
import App from './App';

// Mock the expo module
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

// Mock the App component
jest.mock('./App', () => {
  const React = require('react');
  return () => React.createElement('App');
});

describe('index.ts', () => {
  it('calls registerRootComponent with the App component', () => {
    // Require index.ts to execute the top-level code
    require('./index');

    // Verify that registerRootComponent was called with the App component
    expect(registerRootComponent).toHaveBeenCalledTimes(1);
    expect(registerRootComponent).toHaveBeenCalledWith(App);
  });
});
