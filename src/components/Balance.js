import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from './Spinner';
import { Tabs, Tab } from 'react-bootstrap';
import { 
    loadBalances,
    depositEther,
    withdrawEther,
    depositToken,
    withdrawToken
} from '../store/interactions';
import {
    balancesLoadingSelector,
    web3Selector,
    tokenSelector,
    accountSelector,
    exchangeSelector,
    etherBalanceSelector,
    tokenBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    etherDepositAmountSelector,
    etherWithdrawAmountSelector,
    tokenDepositAmountSelector,
    tokenWithdrawAmountSelector
} from '../store/selectors';
import { 
    etherDepositAmountChanged,
    etherWithdrawAmountChanged,
    tokenDepositAmountChanged,
    tokenWithdrawAmountChanged
} from '../store/actions';

const createForm = (name, placeholder, amount, interaction, action, props, token) => {
    const {
        dispatch,
        exchange,
        web3,
        account
    } = props;
    return(
        <form className="row" onSubmit={(event) => {
            event.preventDefault();
            if(token === undefined) {
                interaction(dispatch, exchange, web3, amount, account);
            } else {
                interaction(dispatch, exchange, web3, token, amount, account);
            }
        }}>
            <div className="col-12 col-sm pr-sm-2">
                <input 
                type="text"
                placeholder={`${placeholder}`}
                onChange={(e) => dispatch(action(e.target.value))}
                className="form-control form-control-sm bg-dark text-white"
                required
                />
            </div>
            <div className="col-12 col-sm-auto pl-sm-0">
                <button type="submit" className="btn btn-primary btn-block btn-sm">{name}</button>
            </div>
        </form>
    )

}

const showForm = (props) => {
    const {
        etherBalance,
        tokenBalance,
        exchangeEtherBalance,
        exchangeTokenBalance,
        dispatch,
        web3,
        token,
        account,
        exchange,
        etherDepositAmount,
        etherWithdrawAmount,
        tokenDepositAmount,
        tokenWithdrawAmount,
    } = props;
    return(
        <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
            <Tab eventKey="deposit" title="Deposit" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{etherBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                    </tbody>
                </table>
                {createForm("Deposit", "ETH Amount", etherDepositAmount, depositEther, etherDepositAmountChanged, props)}
                <table className="table table-dark table-sm small">
                    <tbody>
                        <tr>
                            <td>DAPP</td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                    </tbody>
                </table>
                {createForm("Deposit", "Token Amount", tokenDepositAmount, depositToken, tokenDepositAmountChanged, props, token)}
            </Tab>
            <Tab eventKey="whitdraw" title="Withdraw" className="bg-dark">
                <table className="table table-dark table-sm small">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>Wallet</th>
                            <th>Exchange</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ETH</td>
                            <td>{etherBalance}</td>
                            <td>{exchangeEtherBalance}</td>
                        </tr>
                    </tbody>
                </table>
                {createForm("Withdraw", "ETH Amount", etherWithdrawAmount, withdrawEther, etherWithdrawAmountChanged, props)}
                <table className="table table-dark table-sm small">
                    <tbody>
                        <tr>
                            <td>DAPP</td>
                            <td>{tokenBalance}</td>
                            <td>{exchangeTokenBalance}</td>
                        </tr>
                    </tbody>
                </table>
                {createForm("Withdraw", "DAPP Amount", tokenWithdrawAmount, withdrawToken, tokenWithdrawAmountChanged, props, token)}
            </Tab>
        </Tabs>
    )
}

class Balance extends Component {
    componentWillMount() {
        this.loadBlockchainData();
      }
      async loadBlockchainData() {
          const {dispatch, web3, exchange, token, account} = this.props;
          await loadBalances(dispatch, web3, exchange, token, account);
      }

    render() {
        return(
            <div className="card bg-dark text-white">
                <div className="card-header">
                    Balance
                </div>
                <div className="card-body">
                    {this.props.showForm ? showForm(this.props) : <Spinner />}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const balancesLoading = balancesLoadingSelector(state);
    return {
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
        etherDepositAmount: etherDepositAmountSelector(state),
        etherWithdrawAmount: etherWithdrawAmountSelector(state),
        tokenDepositAmount: tokenDepositAmountSelector(state),
        tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
        balancesLoading,
        showForm: !balancesLoading
    }
}

export default connect(mapStateToProps)(Balance);