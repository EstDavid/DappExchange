import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap';
import App from './components/App';
import configureStore from './store/configureStore';
import * as serviceWorker from './serviceWorker'

$('.dropdown-toggle').dropdown("toggle");

$('.collapse').collapse() 


ReactDOM.render(
  <Provider store={configureStore()}>
      <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister()