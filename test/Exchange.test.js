import {tokens, ether, EVM_REVERT, ETHER_ADDRESS} from './helpers';

var {default : Web3} = require('web3');

var BN = web3.utils.BN;

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Exchange', ([deployer, feeAccount, user1]) => {
    let token;
    let exchange;
    const feePercent = 10;

    beforeEach(async () => {
        // Deploy token
        token = await Token.new();
        // Fetch Exchange from Blockchain
        exchange = await Exchange.new(feeAccount, feePercent); // It deploys a new copy of the Exchange contract to the Blockchain
        // Transfer tokens to user1
        await token.transfer(user1, tokens(100), {from: deployer});
    });
    
    describe('deployment', () => {
        it('tracks the fee account', async () => {
            // Read fee account here
            const result = await exchange.feeAccount();
            // Check the fee account
            result.should.equal(feeAccount);
        });

        it('tracks the fee percent', async () => {
            // Read fee percent
            const result = await exchange.feePercent();
            // The token name is Tic Tac Token
            result.toString().should.equal(feePercent.toString());
        });
    });

    describe('fallback', async () => {
        it('reverts when Ether is sent', async () => {
            await exchange.sendTransaction({from: user1, value: 1}).should.be.rejectedWith(EVM_REVERT); 
        });
    });

    describe('depositing ether', async () => {
        let result;
        let amount;

        beforeEach(async () => {
            amount = ether(1);
            result = await exchange.depositEther({from: user1, value: amount});         
        });

        it('tracks the Ether deposit', async () => {
            let balance;
            balance = await exchange.tokens(ETHER_ADDRESS, user1);
            balance.toString().should.equal(amount.toString());   
        });

        it('emits a Deposit event', async() => {
            const log = result.logs[0];
            log.event.should.equal('Deposit');
            const event = log.args;
            event.token.toString().should.equal(ETHER_ADDRESS, 'Ether address is correct');
            event.user.toString().should.equal(user1, 'user is correct');
            event.amount.toString().should.equal(amount.toString(), 'amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'balance is correct');
        });
    });

    describe('depositing tokens', () => {
        let result;
        let amount;

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10);
                await token.approve(exchange.address, amount, {from: user1 });
                result = await exchange.depositToken(token.address, amount, {from: user1});
            });

            it('tracks the token deposit', async () => {
                // Check the exchange token balance
                let balance;
                balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal(amount.toString());
                // Check tokens on exchange
                balance = await exchange.tokens(token.address, user1);
                balance.toString().should.equal(amount.toString());
            });  
            
            it('emits a Deposit event', async() => {
                const log = result.logs[0];
                log.event.should.equal('Deposit');
                const event = log.args;
                event.token.toString().should.equal(token.address, 'token is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal(amount.toString(), 'balance is correct');
            });
        });

        describe('failure', () => {
            it('rejects Ether deposits', async () => {
                // Don't approve any tokens before depositing
                await exchange.depositToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            }); 

            it('fails when no tokens are approved', async () => {
                // Don't approve any tokens before depositing
                await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            });  
        });
    });
});