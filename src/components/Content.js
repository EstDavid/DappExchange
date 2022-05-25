import React, {Component, useState} from 'react';
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
    accountChanged, 
    unloadToken,
    unloadExchange,
    unloadAccount} from '../store/interactions';
import Trades from './Trades';
import OrderBook from './OrderBook';
import MyTransactions from './MyTransactions';
import PriceChart from './PriceChart';
import Balance from './Balance';
import NewOrder from './NewOrder';
import {OnboardingButton} from './Onboarding'

import {dappNetwork, dappNetworkHex} from '../helpers'

const ethereum = window.ethereum;

const metamaskAlert = () => {
    return (
        <div>
            <div className="alert alert-primary" role="alert">
                Please install MetaMask in order to access the Dapp
                <OnboardingButton />
            </div>
        </div>
    )
}

const metamaskLoginAlert = () => {
    if (!ethereum.isConnected()) {
        return (
            <div>
                <div className="alert alert-primary" role="alert">
                    Please login with MetaMask
                    <button className="btn btn-primary alert-button" onClick={(event) => {
                        event.preventDefault();
                        ethereum.request({ method: 'eth_requestAccounts' })
                    }}>Login with Metamask</button>
                </div>
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
                  chainId: dappNetworkHex,
                  chainName: 'Rinkeby',
                  rpcUrls: ['https://rinkeby.infura.io/v3/'] /* ... */,
                  nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18
                  },
                  blockExplorerUrls: 'https://rinkeby.etherscan.io'
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

const changeNetworkAlert = (props) => {
    if (ethereum.networkVersion !== dappNetwork)
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

const showAlerts = (props) => {
    return (
        <div>
            {metamaskLoginAlert()}
            {changeNetworkAlert(props)}
        </div>

    )
}

const alerts = (props) => {
    return (
        <div>
            <div style={{ height: "8px" }}></div>
            {ethereum ? showAlerts(props) : metamaskAlert()}
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
        if (typeof ethereum !== 'undefined') {
            this.loadBlockchainData(this.props.dispatch);
        }
    }

    async loadBlockchainData(dispatch) {
        const web3 = await loadWeb3(dispatch);
        window.ethereum.on('chainChanged', async (chainId) => {
            if (chainId === dappNetworkHex) {
                this.loadBlockchainData(this.props.dispatch);
            } else {
                await unloadToken(dispatch);
                await unloadExchange(dispatch);
                // await unloadAccount(dispatch);
                await loadWeb3(dispatch);
            }
        });
        if (web3 !== undefined) {
            const networkId = await web3.eth.net.getId();
            await loadAccount(web3, dispatch);

            const token = await loadToken(web3, networkId, dispatch);
            if (!token) {
                window.alert('Token smart contract not detected on the current network. Please select another network with Metamask.');
                return;
            }
            const exchange = await loadExchange(web3, networkId, dispatch);
            if (!exchange) {
                // window.alert('Exchange smart contract not detected on the current network. Please select another network with Metamask.');
                return;
            }
            if (exchange !== undefined) {
                await loadAllOrders(exchange, dispatch);
                await subscribeToEvents(exchange, dispatch);
            } else {
                // window.alert('Exchange is not defined. Please select another network with Metamask.');
            }
            window.ethereum.on('accountsChanged', async () => {
                await loadAccount(web3, dispatch);
                if (this.props.account === undefined) {
                    await accountChanged(this.props.dispatch, web3, exchange, token);
                } else {
                    await accountChanged(this.props.dispatch, web3, exchange, token);
                }
            });
        }
    }
    render() {
        const contentAvailable =
            this.props.contractsLoaded &&
            this.props.account !== undefined;
        return (
            <div>
                {contentAvailable ? showContent() : alerts(this.props)}
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