import React, {Component} from 'react';
import { connect } from 'react-redux';
import { accountSelector, navigationSelector } from '../store/selectors';
import { 
    launchApp,
    showHomepage,
    loadWeb3,
    loadAccount
} from '../store/interactions';

const showAccount = (props) => {
    const {account, dispatch} = props;
    if (account !== undefined) {
        return (
            <a
                className="account"
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer">
                {account.substring(0, 4) + "...." + account.substring(account.length - 4, account.length)}
            </a>
        )
    } else if (window.ethereum) {
        return (
            <li><button className="btn btn-success navbar-btn" onClick={(event) => {
                event.preventDefault();
                window.ethereum.request({ method: 'eth_requestAccounts' }).then(async () => {
                    const web3 = await loadWeb3(dispatch);
                    await loadAccount(web3, dispatch)
                });
            }}>Connect account</button>
            </li>
        )
    }
}

const showNavigationButton = (props) => {
    if (props.showApp) {
        return(
            <ul className="nav navbar-nav navbar-expand-sm" style={{ display: "inline" }}>
                <li className="nav-item">
                {showAccount(props)}
                </li>
            </ul>
        )
    } else {
        return(
            <ul className="nav navbar-nav navbar-expand-sm" style={{ display: "inline" }}>
                <li><button className="btn btn-warning navbar-btn" onClick={(event) => {
                    event.preventDefault();
                    launchApp(props.dispatch);
                }}>Launch App</button>
                </li>
            </ul>
        )  
    }
}

class Navbar extends Component {
    render() {
        return (
            <nav className="nav navbar navbar-expand-sm navbar-dark" style={{ backgroundColor: "#01B0D3" }}>
                <div className="container-fluid">
                    <div className="navbar-header">
                        <img src="Dolphin_Logo.svg" height="60" alt="Dolphinance Logo"></img>
                        <a className="navbar-brand" href="/#" onClick={(event) => {
                            event.preventDefault();
                            showHomepage(this.props.dispatch);
                        }}><h1>DolPhinance</h1></a>
                    </div>
                    {showNavigationButton(this.props)}
                </div>
            </nav>
        )
    }
}

function mapStateToProps(state) {
    return {
        showApp: navigationSelector(state),
        account: accountSelector(state)
    }
}

export default connect(mapStateToProps)(Navbar);