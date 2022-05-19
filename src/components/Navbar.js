import React, {Component} from 'react';
import { connect } from 'react-redux';
import { accountSelector, navigationSelector } from '../store/selectors';
import { 
    launchApp,
    showHomepage
} from '../store/interactions';

const showAccount = (account) => {
    if (account !== null && account !== undefined) {
        return (
            <a
                className="account"
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer">
                {account.substring(0, 4) + "...." + account.substring(account.length - 4, account.length)}
            </a>
        )
    } else {
        return (
            <li><button className="btn btn-success navbar-btn" onClick={(event) => {
                event.preventDefault();
                window.ethereum.request({ method: 'eth_requestAccounts' });
            }}>Connect account</button>
            </li>
        )
    }
}

const connectAccountButton = (account) => {
    if (account === undefined) {
        return (
            <li><button className="btn btn-success navbar-btn" onClick={(event) => {
                event.preventDefault();
                window.ethereum.request({ method: 'eth_requestAccounts' });
            }}>Connect account</button>
            </li>
        )
    }
}

const showNavigationButton = (props) => {
    if (props.showApp) {
        return(
            <ul className="navbar navbar-nav navbar-right" style={{ display: "inline" }}>
                <li><button className="btn btn-warning navbar-btn" onClick={(event) => {
                    event.preventDefault();
                    showHomepage(props.dispatch);
                }}>Back to Homepage</button>
                </li>
                <li className="nav-item">
                {showAccount(props.account)}
                </li>
            </ul>
        )
    } else {
        return(
            <ul className="navbar navbar-nav navbar-right" style={{ display: "inline" }}>
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
            <nav className="navbar navbar-dark" style={{ backgroundColor: "#01B0D3"}}>
                <div className="container-fluid">
                    <div className="navbar-header">
                    <img src="Dolphin_Logo.svg" height="60" alt="Dolhpinance Logo"></img>
                        <a className="navbar-brand" href="/#"><h1>Dol<small>Phinance</small></h1></a>
                        {/* {<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>} */}


                    </div>
                    {/* <ul className="nav navbar-nav">
                        <li className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown">Select Network
                                <span className="caret"></span></button>
                            <ul className="dropdown-menu">
                                <li><a>Rinkeby</a></li>
                                <li><a>Local</a></li>
                            </ul>
                        </li>
                        <li className="btn">
                            <button className="btn btn-secondary" type="button" >Connect wallet
                            </button>
                        </li>

                    </ul> */}
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