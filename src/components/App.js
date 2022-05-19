import React, {Component} from 'react';
import './App.css';
import Navbar from './Navbar';
import Content from './Content';
import DefaultContent from './DefaultContent';

import { connect } from 'react-redux';
import { navigationSelector } from '../store/selectors';

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch);
  }
  async loadBlockchainData(dispatch) {
    // Get a web3 provider

    // const totalSupply = await token.methods.totalSupply().call();
    // console.log("totalSupply", totalSupply);

  }

  render() {
    return (
      <div>
        <Navbar/>
        {this.props.showApp ? <Content/> : <DefaultContent/>}
        </div>
    );
  }
}

//         {this.props.contractsLoaded ? <Content/> : <DefaultContent/>}


function mapStateToProps(state) {
  return {
    showApp: navigationSelector(state)
  }
}

export default connect(mapStateToProps)(App);
