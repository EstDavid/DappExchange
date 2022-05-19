import React, {Component} from 'react';

class DefaultContent extends Component {
    render() {
        return (
            <div className="homepage">
                <div className="page-header container">
                    <div className="row gx-20">
                        <div className="col-sm-6">
                            <img className="img" src="Dolphin_Mesh.svg" alt="Dolhpinance Mesh" style={{ height: "260px" }}></img>
                        </div>
                        <div className="col-sm-6">
                            <div className="text-center homepage-text">
                                <h1>Welcome to finance that flows</h1>
                                <p>Some text that represents ""...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{height: "10px"}}></div>
                <div className="container text-center">
                    <div className="row g-0">
                        <div className="col sm-4">
                            <div className="card bg-dark text-white homepage-card">
                                <div className="card-header homepage-card-header">
                                    <h1>What is Dolphinance</h1>
                                </div>
                                <div className="card-body homepage-card-body">
                            <p className="card-text">Dolphinance is an exchange Dapp deployed on the Rinkeby network.
                                    You can find the smart contract corresponding to the exchange Dapp
                                    <a href="https://rinkeby.etherscan.io/address/0x6723e472b9de9b329f344aa6c8dc80e67db92de8" 
                                    target="_blank"
                                    rel="noreferrer noopener"> here</a>
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
                                        <p className="card-text">Buy and sell DPN token with ETH by placing limit orders or filling them
                                            Cancel your open orders
                                            Make deposits and withdrawals on the exchange
                                            Track the price of the DPN token
                                        </p>
                                    </div>
                            </div>
                        </div>
                        <div className="col sm-4">
                        <div className="card bg-dark text-white homepage-card">
                                <div className="card-header homepage-card-header">
                                    <h1>Get started</h1>
                                </div>
                                <div className="card-body homepage-card-body">
                                    <p className="card-text">Get Metamask
                                        Configure the Rinkeby network on your Metamask
                                        Launch App
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }    
}

export default (DefaultContent);