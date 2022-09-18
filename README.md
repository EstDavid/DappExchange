# About Dolphinance dApp Exchange
The Dolphinance dApp is an order book exchange which allows withdrawal and deposit operations of both ETH and the native DLP token. It also allows creating, filling and cancelling limit orders to trade between the two coins. 

The exchange is based on the Capstone Project from the [Dapp University Bootcamp](https://www.dappuniversity.com/bootcamp)

# Frontend
The frontend of the exchange has been created using ReactJS, Redux and Bootstrap. It consists of 3 basic elements:
- Welcome page with the exchange logo and info about the project
- Exchange page with all the functionality for interaction with the exchange and order info display
- Metamask Onboarding button for managing interaction between the user's wallet and the dApp

## Metamask Onboarding
Some parts of the [Metamask Onboarding Library](https://docs.metamask.io/guide/onboarding-library.html) and recommended process are used for managing the interaction with the user's wallet.
The web app detects whether the Metamask extension is installed in the browser. It then checks if there is an account connected and if not, it allows the user to click on the Onboarding button to connect their account. It also checks that the network configured in Metamask is the same as the one where the Exchange smart contracts are. If the correct network is not selected, it allows the user to change the network automatically.

# Backend
## Token smart contract
The token smart contract follows the ERC-20 standard. The total supply of the token is 1000000 units which can be expressed in up to 18 decimals.

The contract address on the Rinkeby test network is [0x664c8fCF50A588D3208c729362685EA911522198](https://rinkeby.etherscan.io/address/0x664c8fcf50a588d3208c729362685ea911522198)


## Exchange smart contract
The exchange smart contract address on the Rinkeby test network is [0x6723E472b9DE9b329F344aa6c8DC80e67DB92De8](https://rinkeby.etherscan.io/address/0x6723E472b9DE9b329F344aa6c8DC80e67DB92De8)

The contract includes the following main functions,  variables and events.

### Deposit and withdraw functions:
+ `depositEther` &rarr; Deposits Eth from the user's wallet to the exchange
+ `withdrawEther` &rarr; Allows the user to withdraw Eth from their exchange balance to their wallet
+ `depositToken` &rarr; Deposits DLP token from the user's to the exchange
+ `withdrawToken` &rarr; Allows the user to withdraw units of DLP token from their exchange balance to their own wallet

### Order functions:
+ `makeOrder` &rarr; Creates an order to exchange the DLP token for ETH or viceversa
+ `cancelOrder` &rarr; Cancels an existing order if msg.sender is the original user who created it
+ `fillOrder` &rarr; Fills an open order

### Variables
+ `_Order` &rarr; This struct stores essential order information, such as address of the user creating the order, addresses of the two tokens involved in the order, the quantities of each (thus making the price for the order) and the timestamp
+ `feeAccount` &rarr; Address of the account that receives the exchange fees
+ `feePercent` &rarr; Fee percentage that the exchange receives for transactions

### Events
+ `Order` &rarr; Event fired when an order is created. It includes basic data about the order
+ `Cancel` &rarr; Fired when an order is cancelled
+ `Trade` &rarr; Fired when an order is filled. It includes the basic data about the order and the address of the user filling the order