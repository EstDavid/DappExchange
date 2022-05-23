import Web3 from 'web3';
import Token from '../abis/Token.json';
import Exchange from '../abis/Exchange.json';
import {
    web3Loaded,
    appRequested,
    homepageRequested,
    web3AccountLoaded,
    web3AccountUnloaded,
    tokenLoaded,
    tokenUnloaded,
    exchangeLoaded,
    exchangeUnloaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    balancesLoaded,
    balancesLoading,
    buyOrderMaking,
    sellOrderMaking,
    orderMade
} from './actions';
import { ETHER_ADDRESS } from '../helpers';
import BigNumber from 'bignumber.js';


export const loadWeb3 = async (dispatch) => {
    if(typeof window.ethereum!==undefined){
/*         try {
            await window.ethereum.request({method: 'eth_requestAccounts'});
        }
        catch(error) {
            window.alert('No network selected')
        } */
        const web3 = new Web3(window.ethereum);        
        dispatch(web3Loaded(web3));
        return web3
      } else {
        window.alert('Please install MetaMask')
        window.location.assign("https://metamask.io/")
      }
}

export const launchApp = async (dispatch) => {
    dispatch(appRequested());
}

export const showHomepage = async (dispatch) => {
    dispatch(homepageRequested());
}

export const loadAccount = async (web3, dispatch) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    if(typeof account !== 'undefined' && account !== undefined){
        dispatch(web3AccountLoaded(account))
        return account;
    } else {
        // window.alert('Please login with MetaMask')
        dispatch(web3AccountLoaded(undefined))
        return undefined;
    }
}

export const unloadAccount = async (dispatch) => {
    dispatch(web3AccountUnloaded());
}

export const loadToken = async (web3, networkId, dispatch) => {
    try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
        dispatch(tokenLoaded(token));
        return token;
    }
    catch (error) {
        console.log(`Token contract not deployed to the current network. Please select another network with Metamask.`);
        return null;
    }
}

export const unloadToken = async (dispatch) => {
    dispatch(tokenUnloaded());
}

export const loadExchange = async (web3, networkId, dispatch) => {
    try {
        const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
        dispatch(exchangeLoaded(exchange));
        return exchange;
    }
    catch(error) {
        console.log(`Exchange contract not deployed to the current network. Please select another network with Metamask.`);
    }
    return null;
}

export const unloadExchange = async (dispatch) => {
    dispatch(exchangeUnloaded());
}

export const loadAllOrders = async (exchange, dispatch) => {
    // Fetch cancelled orders with the "Cancel" event stream
    const cancelStream = await exchange.getPastEvents('Cancel', {fromBlock: 'earliest', toBlock: 'latest'});
    // Format cancelled orders
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    // Add cancelled orders to the redux store
    dispatch(cancelledOrdersLoaded(cancelledOrders));

    // Fetch filled orders with the "Trade" event stream
    const tradeStream = await exchange.getPastEvents('Trade', {fromBlock: 'earliest', toBlock: 'latest'});
    // Format filled orders
    const filledOrders = tradeStream.map((event) => event.returnValues)
    // Add filled orders to the redux store
    dispatch(filledOrdersLoaded(filledOrders));

    // Fetch all orders with the "Order" event stream
    const orderStream = await exchange.getPastEvents('Order', {fromBlock: 'earliest', toBlock: 'latest'});
    // Format order stream
    const allOrders = orderStream.map((event) => event.returnValues)
    // Add open orders to the redux store
    dispatch(allOrdersLoaded(allOrders));
}

export const subscribeToEvents = async (exchange, dispatch) => {
    exchange.events.Cancel({}, (error, event) => {
        dispatch(orderCancelled(event.returnValues));
    })
    exchange.events.Trade({}, (error, event) => {
        dispatch(orderFilled(event.returnValues));
        dispatch(balancesLoaded(event.returnValues));
    })
    exchange.events.Deposit({}, (error, event) => {
        dispatch(balancesLoaded(event.returnValues));
    })
    exchange.events.Withdraw({}, (error, event) => {
        dispatch(balancesLoaded(event.returnValues));
    })
    exchange.events.Order({}, (error, event) => {
        dispatch(orderMade(event.returnValues));
    })
}

export const cancelOrder = (dispatch, exchange, order, account) => {
    exchange.methods.cancelOrder(order.id).send({from: account})
    .on('transactionHash', (hash) => {
        dispatch(orderCancelling());
    })
    .on('error', (error) => {
        console.log(error);
        window.alert('There was an error cancelling the order!')
    });
}

export const accountChanged = async (dispatch, web3, exchange, token) => {
    const account = await loadAccount(web3, dispatch);
    if (account !== undefined) {
        dispatch(balancesLoading());
        let exchangeEtherBalance = exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
        let accountEtherBalance = web3.eth.getBalance(account);
        let exchangeTokenBalance = exchange.methods.balanceOf(token.options.address, account).call();
        let accountTokenBalance = token.methods.balanceOf(account).call();
    
        exchangeEtherBalance.then((balanceValue) => {
            dispatch(exchangeEtherBalanceLoaded(balanceValue))
        });
        accountEtherBalance.then((balanceValue) => {
            dispatch(etherBalanceLoaded(balanceValue))
        });
        exchangeTokenBalance.then((balanceValue) => {
            dispatch(exchangeTokenBalanceLoaded(balanceValue))
        });
        accountTokenBalance.then((balanceValue) => {
            dispatch(tokenBalanceLoaded(balanceValue))
        });
        dispatch(balancesLoaded());
    }
}

export const fillOrder = async (dispatch, web3, exchange, token, order, account) => {
    exchange.methods.fillOrder(order.id).send({from: account})
    .on('transactionHash', (hash) => {
        dispatch(orderFilling());
        dispatch(balancesLoading())
    })
    .on('receipt', (receipt) => {
        let exchangeEtherBalance = exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
        let accountEtherBalance = web3.eth.getBalance(account);
        let exchangeTokenBalance = exchange.methods.balanceOf(token.options.address, account).call();
        let accountTokenBalance = token.methods.balanceOf(account).call();

        exchangeEtherBalance.then((balanceValue) => {
            dispatch(exchangeEtherBalanceLoaded(balanceValue))
        })
        accountEtherBalance.then((balanceValue) => {
            dispatch(etherBalanceLoaded(balanceValue))
        })
        exchangeTokenBalance.then((balanceValue) => {
            dispatch(exchangeTokenBalanceLoaded(balanceValue))
        })
        accountTokenBalance.then((balanceValue) => {
            dispatch(tokenBalanceLoaded(balanceValue))
        })
    })
    .on('error', (error) => {
        console.log(error);
        window.alert('There was an error filling the order!')
    });
}

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
    // Ether balance in wallet
    const etherBalance = await web3.eth.getBalance(account);
    dispatch(etherBalanceLoaded(etherBalance));

    // Token balance in wallet
    const tokenBalance = await token.methods.balanceOf(account).call();
    dispatch(tokenBalanceLoaded(tokenBalance));

    // Ether balance in exchange
    const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
    dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance));

    // Token balance in exchange
    const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call();
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance));

    // Trigger all balances loaded
    dispatch(balancesLoaded());
}

export const depositEther = (dispatch, exchange, web3, amount, account) => {
    exchange.methods.depositEther().send({from: account, value: web3.utils.toWei(amount, 'ether')})
    .on('transactionHash', (hash) => {
        dispatch(balancesLoading())
    })
    .on('receipt', (receipt) => {
        let exchangeEtherBalance = exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
        let accountEtherBalance = web3.eth.getBalance(account);
        exchangeEtherBalance.then((balanceValue) => {
            dispatch(exchangeEtherBalanceLoaded(balanceValue))
        })
        accountEtherBalance.then((balanceValue) => {
            dispatch(etherBalanceLoaded(balanceValue))
        })
    })
    .on('error', (error) => {
        console.error(error);
        window.alert('There was an error with the deposit');
    });
}

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
    exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({from: account})
    .on('transactionHash', (receipt) => {
        dispatch(balancesLoading())
    })
    .on('receipt', (receipt) => {
        let exchangeEtherBalance = exchange.methods.balanceOf(ETHER_ADDRESS, account).call();
        let accountEtherBalance = web3.eth.getBalance(account);
        exchangeEtherBalance.then((balanceValue) => {
            dispatch(exchangeEtherBalanceLoaded(balanceValue))
        })
        accountEtherBalance.then((balanceValue) => {
            dispatch(etherBalanceLoaded(balanceValue))
    })
    })
    .on('error', (error) => {
        console.error(error);
        window.alert('There was an error with the withdraw');
    });
}

export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether');
    token.methods.approve(exchange.options.address, amount).send({from: account})
    .on('receipt', (receipt) => {
        exchange.methods.depositToken(token.options.address, amount).send({from: account})
        .on('transactionHash', (receipt) => {
            dispatch(balancesLoading())
        })
        .on('receipt', (receipt) => {
            let exchangeTokenBalance = exchange.methods.balanceOf(token.options.address, account).call();
            let accountTokenBalance = token.methods.balanceOf(account).call();
            exchangeTokenBalance.then((balanceValue) => {
                dispatch(exchangeTokenBalanceLoaded(balanceValue))
            })
            accountTokenBalance.then((balanceValue) => {
                dispatch(tokenBalanceLoaded(balanceValue))
            })
        })    
        .on('error', (error) => {
            console.error('error', error);
            window.alert('There was an error with the deposit 1');
        });   
    })
    .on('error', (error) => {
        console.error(error);
        window.alert('There was an error with the deposit 2');
    });   
}

export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
    exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({from: account})
    .on('transactionHash', (receipt) => {
        dispatch(balancesLoading())
    })
    .on('receipt', (receipt) => {
        let exchangeTokenBalance = exchange.methods.balanceOf(token.options.address, account).call();
        let accountTokenBalance = token.methods.balanceOf(account).call();
        exchangeTokenBalance.then((balanceValue) => {
            dispatch(exchangeTokenBalanceLoaded(balanceValue))
        })
        accountTokenBalance.then((balanceValue) => {
            dispatch(tokenBalanceLoaded(balanceValue))
        })
    })    
    .on('error', (error) => {
        console.error(error);
        window.alert('There was an error with the withdraw');
    });
}

export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
    const tokenGet = token.options.address;
    const amountGet = web3.utils.toWei(order.amount, 'ether');
    const tokenGive = ETHER_ADDRESS;
    const amountGive = web3.utils.toWei((new BigNumber(order.amount).times(new BigNumber(order.price))).toString(), 'ether');

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: account})
    .on('transactionHash', (hash) => {
        dispatch(buyOrderMaking());
    })
    .on('error', (error) => {
        console.error(error);
        window.alert('There was an error making the buy order');
    })
}

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
    const tokenGet = ETHER_ADDRESS;
    const amountGet = web3.utils.toWei((new BigNumber(order.amount).times(new BigNumber(order.price))).toString(), 'ether');
    const tokenGive = token.options.address;
    const amountGive = web3.utils.toWei(order.amount, 'ether');

    exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({from: account})
    .on('transactionHash', (hash) => {
        dispatch(sellOrderMaking());
    })
    .on('error', (error) => {
        console.error(error);
        window.alert('There was an error making the sell order');
    })
}