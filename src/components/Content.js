import React, {Component} from 'react';
import { connect } from 'react-redux';
import { 
    accountSelector,
    contractsLoadedSelector,
    exchangeLoadedSelector,
    tokenLoadedSelector 
} from '../store/selectors';
import { 
    loadWeb3,
    loadAccount,
    loadToken,
    loadExchange,
    loadAllOrders,
    subscribeToEvents,
    accountChanged } from '../store/interactions';
import Trades from './Trades';
import OrderBook from './OrderBook';
import MyTransactions from './MyTransactions';
import PriceChart from './PriceChart';
import Balance from './Balance';
import NewOrder from './NewOrder';

import {dappNetwork, dappNetworkHex} from '../helpers'

const ethereum = window.ethereum;

const metamaskAlert = () => {
    if(typeof ethereum === undefined) {
        return (
            <div className="alert alert-primary" role="alert">
                Please install Metamask
            </div>
    )        
    }
}

const changeNetwork = async () => {
    try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: dappNetworkHex }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xf00',
                  chainName: '...',
                  rpcUrls: ['https://...'] /* ... */,
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }      
}

const accountAlert = (props) => {
    if (ethereum.networkVersion === null) {
        return (
            <div>
                <div className="alert alert-primary" role="alert">
                    Please login with MetaMask
                    <button className="btn btn-primary alert-button" onClick={(event) => {
                        event.preventDefault();
                        ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
                            loadAccount(props.web3, props.dispatch)
                        });
                    }}>Enable Ethereum</button>
                </div>
            </div>
        )
    }
}

const changeNetworkAlert = (props) => {
    if (ethereum.networkVersion !== dappNetwork && props.account !== undefined)
        return (
            <div>
                <div className="alert alert-primary" role="alert">
                    Dapp Network not selected. Please select here
                    <button className="btn btn-primary alert-button" onClick={(event) => {
                        event.preventDefault();
                        changeNetwork();
                    }}>Change network</button>
                </div>
            </div>
        );
}

const tokenAlert = (tokenLoaded) => {
    if (!tokenLoaded) {
        return (
            <div className="alert alert-primary" role="alert">
                Token contract not deployed to the current network
            </div>
        )
    }
}

const exchangeAlert = (exchangeLoaded) => {
    if(!exchangeLoaded) {
        return (
            <div className="alert alert-primary" role="alert">
                Exchange contract not deployed to the current network
            </div>
        )
    }
}

const showAlerts = (props) => {
    return (
        <div>
            <div style={{ height: "8px" }}></div>
            {metamaskAlert(props.web3Loaded)}
            {accountAlert(props)}
            {changeNetworkAlert(props)}
        </div>
    )
}

const showContent = () => {
    return (
        <div className="content">
            <div className="vertical-split">
                <Balance />
                <NewOrder />
            </div>
            <div className="vertical">
                <OrderBook />
            </div>
            <div className="vertical-split">
                <PriceChart />
                <MyTransactions />
            </div>
            <div className="vertical">
                <Trades />
            </div>
        </div>
    )
}

class Content extends Component {
    componentDidMount() {
        this.loadBlockchainData(this.props.dispatch);
      }
      async loadBlockchainData(dispatch) {
        const networkVersion = await ethereum.networkVersion;
        const web3 = await loadWeb3(dispatch);
        if (web3 !== undefined) {
            const networkId = await web3.eth.net.getId();
            await loadAccount(web3, dispatch);

            const token = await loadToken(web3, networkId, dispatch);
            if(!token) {
                window.alert('Token smart contract not detected on the current network. Please select another network with Metamask.');
                return;
            }
            const exchange = await loadExchange(web3, networkId, dispatch);
            if(!exchange) {
            // window.alert('Exchange smart contract not detected on the current network. Please select another network with Metamask.');
            return;
            }
            if(exchange !== undefined) {
                await loadAllOrders(exchange, dispatch);
                await subscribeToEvents(exchange, dispatch);
            } else {
                // window.alert('Exchange is not defined. Please select another network with Metamask.');
            }
            window.ethereum.on('accountsChanged', () => {
                accountChanged(this.props.dispatch, web3, exchange, token);
            });
    
        }
      }
    render() {
        const contentAvailable = 
                                    this.props.contractsLoaded && 
                                    this.props.account !== undefined;
        return (
            <div>
                {contentAvailable ? showContent() : showAlerts(this.props)}
            </div>
        );
    }    
}

function mapStateToProps(state) {
    return {
        account: accountSelector(state),
        contractsLoaded: contractsLoadedSelector(state),
        exchangeLoaded: exchangeLoadedSelector(state),
        tokenLoaded: tokenLoadedSelector(state)
    }
}

export default connect(mapStateToProps)(Content);