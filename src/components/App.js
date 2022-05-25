import React, {Component} from 'react';
import './App.css';
import Navbar from './Navbar';
import Content from './Content';
import DefaultContent from './DefaultContent';

import { connect } from 'react-redux';
import { navigationSelector } from '../store/selectors';

class App extends Component {
  render() {
    return (
      <div>
{/*         <Navbar/>
        {this.props.showApp ? <Content/> : <DefaultContent/>} */}
        </div>
    );
  }
}


function mapStateToProps(state) {
  return {
    showApp: navigationSelector(state)
  }
}

export default connect(mapStateToProps)(App);
