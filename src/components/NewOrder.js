import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from './Spinner';
import { Tabs, Tab } from 'react-bootstrap';
import BigNumber from 'bignumber.js';
import { 
    makeBuyOrder,
    makeSellOrder
} from '../store/interactions';
import {
    exchangeSelector,
    tokenSelector,
    accountSelector,
    web3Selector,
    buyOrderSelector,
    sellOrderSelector
} from '../store/selectors';
import { 
    buyOrderAmountChanged,
    buyOrderPriceChanged,
    sellOrderAmountChanged,
    sellOrderPriceChanged
 } from '../store/actions';

 const createForm = (type, interaction, actionAmount, actionPrice, props, order) => {
    const {
        dispatch,
        exchange,
        web3,
        account,
        token
    } = props;
    let showTotal = order.amount && order.price;
    return(
        <form onSubmit={(event) => {
            event.preventDefault();
            interaction(dispatch, exchange, token, web3, order, account);
        }}>
            <div className="from-group small">
                <label>{type} Amount (DAPP)</label>
                <div className="input-group">
                    <input 
                    type="text"
                    placeholder={`${type} Amount`}
                    onChange={(e) => dispatch(actionAmount(e.target.value))}
                    className="form-control form-control-sm bg-dark text-white"
                    required
                    />
                </div>
            </div>
            <div className="from-group small">
                <label>{type} Price</label>
                <div className="input-group">
                    <input 
                    type="text"
                    placeholder={`${type} Price`}
                    onChange={(e) => dispatch(actionPrice(e.target.value))}
                    className="form-control form-control-sm bg-dark text-white"
                    required
                    />
                </div>
            </div>
            <button type="submit" className="btn btn-secondary btn-sm btn-block">{type} Order</button>
            {showTotal ? <small>Total: {(new BigNumber(order.amount).times(new BigNumber(order.price))).toString()} ETH</small> : null}
        </form>
    )
}

const showForm = (props) => {
    return(
        <Tabs defaultActiveKey="buy" className="bg-dark text-white">
            <Tab eventKey="buy" title="Buy Token" className="bg-dark">
                {createForm("Buy", makeBuyOrder, buyOrderAmountChanged, buyOrderPriceChanged, props, props.buyOrder)}
            </Tab>
            <Tab eventKey="sell" title="Sell Token" className="bg-dark">
            {createForm("Sell", makeSellOrder, sellOrderAmountChanged, sellOrderPriceChanged, props, props.sellOrder)}
            </Tab>
        </Tabs>
    )
}

class NewOrder extends Component {
    render() {
        return(
            <div className="card bg-dark text-white">
                <div className="card-header">
                    New Order
                </div>
                <div className="card-body">
                    {this.props.showForm ? showForm(this.props) : <Spinner/>}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const buyOrder = buyOrderSelector(state);
    const sellOrder = sellOrderSelector(state);
    return {
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        account: accountSelector(state),
        web3: web3Selector(state),
        buyOrder,
        sellOrder,
        showForm: !buyOrder.making && !sellOrder.making
    }
}

export default connect(mapStateToProps)(NewOrder);