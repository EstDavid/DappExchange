import BigNumber from '../..node_modules/bignumber';

const Web3 = require('web3')

const web3 = new Web3("https://mainnet.infura.io/v3/89238cb0262b4847aa384c9e2388f7af");

const BigNumber = require('bignumber.js');

const decimalPlaces = 18;

const noDenomination = 'NoDenomination';

const xo = new BigNumber(123.4567);

console.log(xo.round(3).toString());




const orderAmount = 5;

const orderPrice = 0.00085;

console.log(new BigNumber(orderAmount).times(new BigNumber(orderPrice)).toString());

const amountGive = convertToWei(orderAmount * orderPrice);

console.log(amountGive);


function convertToWei(amount) {
    let initialAmount = new BigNumber(amount.toString());
    initialAmount = initialAmount.round(18)
    console.log(initialAmount.toString());
    
    let amountWei = "";
    amountWei = web3.utils.toWei(initialAmount.toString(), 'ether')
    return amountWei;
}