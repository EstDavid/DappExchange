import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.css'
import $ from 'jquery';
import 'bootstrap';
import App from './components/App';
import configureStore from './store/configureStore';

$('.dropdown-toggle').dropdown("toggle");

ReactDOM.render(
  <Provider store={configureStore()}>
      <App />
  </Provider>,
  document.getElementById('root')
);