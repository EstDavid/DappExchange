import React, {Component} from 'react';
import {OnboardingButton} from './Onboarding';
import SocialMedia from './SocialMedia';
import { launchApp,} from '../store/interactions';
import { connect } from 'react-redux';
import { navigationSelector } from '../store/selectors';

class DefaultContent extends Component {
    render() {
        return (
            <div>
                <div className="homepage container-fluid">
                    <div className="page-header container">
                        <div className="row gx-20">
                            <div className="col-sm-6">
                                <img className="img" src="Dolphin_Mesh.svg" alt="DolPhinance Mesh" style={{ height: "220px" }}></img>
                            </div>
                            <div className="col-sm-6">
                                <div className="text-center homepage-text">
                                    <h1>Welcome to flowy Phinance</h1>
                                    <h3>Launch the DolPhinance decentralized exchange and start trading the DLP token</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: "10px" }}></div>
                    <div className="container text-center">
                        <div className="row g-0">
                            <div className="col sm-4">
                                <div className="card bg-dark text-white homepage-card">
                                    <div className="card-header homepage-card-header">
                                        <h1>What is Dolphinance</h1>
                                    </div>
                                    <div className="card-body homepage-card-body">
                                        <p className="card-text">Dolphinance is an exchange Dapp based on the capstone project from the
                                            <a href="https://www.dappuniversity.com/"
                                                target="_blank"
                                                rel="noreferrer noopener"> Dapp University </a>
                                            Blockchain Developer Bootcamp
                                        </p>
                                        <p>
                                            The Dapp is deployed on the Rinkeby network</p>
                                        <p>Check out on Etherscan the
                                            <a href="https://rinkeby.etherscan.io/address/0x6723e472b9de9b329f344aa6c8dc80e67db92de8"
                                                target="_blank"
                                                rel="noreferrer noopener"> smart contract </a>
                                            governing the Dolphinance Dapp
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col sm-4">
                                <div className="card bg-dark text-white homepage-card">
                                    <div className="card-header homepage-card-header">
                                        <h1>Fully operational</h1>
                                    </div>
                                    <div className="card-body homepage-card-body">
                                        <p className="card-text"><span role="img" aria-label="dolphin">&#x1F42C; </span>
                                        Buy and sell DLP token with ETH by placing limit orders or filling the existing ones
                                        </p>
                                        <p className="card-text"><span role="img" aria-label="Money bag">&#x1F4B0; </span>Make deposits and withdrawals on the exchange</p>
                                        <p className="card-text"><span role="img" aria-label="dolphin">&#x1F4C8; </span>Track the price of the DLP token</p>
                                        <p className="card-text"><span role="img" aria-label="stop">&#x1F6D1; </span>Cancel your open orders at any time</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col sm-4">
                                <div className="card bg-dark text-white homepage-card">
                                    <div className="card-header homepage-card-header">
                                        <h1>Get started</h1>
                                    </div>
                                    <div className="card-body homepage-card-body">
                                        <p className="card-text"><span role="img" aria-label="check mark">&#x2611; </span>Get Metamask
                                            <OnboardingButton /></p>
                                        <p className="card-text"><span role="img" aria-label="check mark">&#x2611; </span>Switch to the Rinkeby network on your Metamask</p>
                                        <p className="card-text"><span role="img" aria-label="question mark">&#x2754; </span>First time on Rinkeby Network? You can get Rinkeby ETH
                                            <a href="https://rinkebyfaucet.com/"
                                                target="_blank"
                                                rel="noreferrer noopener"> here </a>
                                            or
                                            <a href="https://faucet.rinkeby.io/"
                                                target="_blank"
                                                rel="noreferrer noopener"> here</a></p>
                                        <p className="card-text"><span role="img" aria-label="check mark">&#x2611; </span>
                                            <button className="btn btn-warning btn-sm" style={{"marginLeft":"10px"}} onClick={(event) => {
                                                event.preventDefault();
                                                launchApp(this.props.dispatch);
                                            }}>Launch App</button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <SocialMedia />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showApp: navigationSelector(state),
    }
}

export default connect(mapStateToProps)(DefaultContent);