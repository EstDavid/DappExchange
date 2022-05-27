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
                <li><button className="btn btn-warning navbar-btn" style={{"white-space": "nowrap"}} onClick={(event) => {
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
                    <a className="navbar-brand" href="#" onClick={(event) => {
                        event.preventDefault();
                        showHomepage(this.props.dispatch);
                    }}>
                        <img src="Dolphin_Logo.svg" height="60" alt="Dolphinance Logo" className="d-inline-block align-top"></img>
                        <h2>DolPhinance</h2>
                    </a>
                    <button className="navbar-toggler ml-auto" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
                <div className="collapse navbar-collapse" id="navbarToggler">
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