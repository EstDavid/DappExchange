import { should } from 'chai';
import {tokens, ether, EVM_REVERT, ETHER_ADDRESS} from './helpers';

var {default : Web3} = require('web3');

var BN = web3.utils.BN;

const Exchange = artifacts.require('./Exchange');
const Token = artifacts.require('./Token.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
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

        it('emits a "Deposit" event', async() => {
            const log = result.logs[0];
            log.event.should.equal('Deposit');
            const event = log.args;
            event.token.toString().should.equal(ETHER_ADDRESS, 'Ether address is correct');
            event.user.toString().should.equal(user1, 'user is correct');
            event.amount.toString().should.equal(amount.toString(), 'amount is correct');
            event.balance.toString().should.equal(amount.toString(), 'balance is correct');
        });
    });

    describe('withdrawing ether', async () => {
        let result;
        let amount = ether(1);

        beforeEach(async () => {
            // Depositing the Ether first
            await exchange.depositEther({from: user1, value: amount});         
        });

        describe('success', async () => {
            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, {from: user1});
            });

            it('withdraws Ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1);
                balance.toString().should.equal('0');
            });

            it('emits a "Withdraw" event', async() => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw');
                const event = log.args;
                event.token.toString().should.equal(ETHER_ADDRESS, 'Ether address is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0', 'balance is correct');
            });
        });

        describe('failure', () => {
            it('rejects withdraws for insufficient balances', async () => {
                // Don't approve any tokens before depositing
                await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_REVERT);
            }); 
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
            
            it('emits a "Deposit" event', async() => {
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

    describe('withdrawing tokens', () => {
        let result;
        let amount;

        describe('success', () => {
            beforeEach(async () => {
                amount = tokens(10);

                // Deposit tokens first
                await token.approve(exchange.address, amount, {from: user1 });
                await exchange.depositToken(token.address, amount, {from: user1});

                // Withdraw tokens
                result = await exchange.withdrawToken(token.address, amount, {from: user1});
            });

            it('tracks the token withdraw', async () => {
                // Check the exchange token balance
                let balance;
                balance = await token.balanceOf(exchange.address);
                balance.toString().should.equal('0');
            });  
            
            it('emits a "Withdraw" event', async() => {
                const log = result.logs[0];
                log.event.should.equal('Withdraw');
                const event = log.args;
                event.token.toString().should.equal(token.address, 'token is correct');
                event.user.toString().should.equal(user1, 'user is correct');
                event.amount.toString().should.equal(amount.toString(), 'amount is correct');
                event.balance.toString().should.equal('0', 'balance is correct');
            });
        });

        describe('failure', () => {
            it('rejects Ether withdrawals', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            }); 

            it('fails for insufficient balances', async () => {
                // Attempt to withdraw tokens without having made a deposit first
                await exchange.withdrawToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT);
            });  
        });
    });

    describe('checking balances', async () => {
        let amount = tokens(10);
        let balance;

        beforeEach(async () => {
            await token.approve(exchange.address, amount, {from: user1 });
            await exchange.depositToken(token.address, amount, {from: user1});
        }); 

        it('returns the user balance', async () => {
            // Attempt to withdraw tokens without having made a deposit first
            balance = await exchange.balanceOf(token.address, user1);
            balance.toString().should.equal(amount.toString());
        });  
    });

    describe('making orders', async () => {
        let result;
        let amount = ether(1);

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, amount, ETHER_ADDRESS, amount, {from: user1});
        }); 

        it('tracks the newly created order', async () => {
            // Attempt to withdraw tokens without having made a deposit first
            const orderCount = await exchange.orderCount();
            orderCount.toString().should.equal('1');

            const order = await exchange.orders('1');
            order.id.toString().should.equal('1', 'order id is correct');
            order.user.should.equal(user1, 'user is correct');
            order.tokenGet.should.equal(token.address, 'tokenGive is correct');
            order.amountGet.toString().should.equal(amount.toString(), 'amountGet is correct');
            order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
            order.amountGive.toString().should.equal(amount.toString(), 'amountGive is correct');
            order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
        }); 
        
        it('emits an "Order" event', async() => {
            const log = result.logs[0];
            log.event.should.equal('Order');
            const event = log.args;
            event.id.toString().should.equal('1', 'id is correct');
            event.user.toString().should.equal(user1, 'user is correct');
            event.tokenGet.should.equal(token.address, 'tokenGet is correct');
            event.amountGet.toString().should.equal(amount.toString(), 'amountGet is correct');
            event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
            event.amountGive.toString().should.equal(amount.toString(), 'amountGive is correct');
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
        });
    });

    describe('order actions', async () => {
        // describe('order actions', async () => {
        beforeEach(async () => {
            // User1 deposits ether only
            await exchange.depositEther({from: user1, value: ether(5)});
            // Give tokens to user2
            await token.transfer(user2, tokens(100), {from: deployer});
            // User2 deposits tokens only
            await token.approve(exchange.address, tokens(100), {from: user2});
            await exchange.depositToken(token.address, tokens(100), {from: user2});
            // user1 makes an order to buy tokens with Ether
            await exchange.makeOrder(token.address, tokens(2), ETHER_ADDRESS, ether(1), {from: user1});
        });
        // });
        
        describe('filling orders', async () => {
            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    // user2 fills the order
                    result = await exchange.fillOrder('1', {from: user2});
                });

                it('executes the order & charges fees', async () => {
                    let balance;
                    balance = await exchange.balanceOf(token.address, user1);
                    balance.toString().should.equal(tokens(2).toString(), 'user1 received tokens');
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user2);
                    balance.toString().should.equal(ether(1).toString(), 'user2 received ether');
                    balance = await exchange.balanceOf(ETHER_ADDRESS, user1);
                    balance.toString().should.equal(ether(4).toString(), 'user1 Ether deducted');
                    balance = await exchange.balanceOf(token.address, user2);
                    balance.toString().should.equal(tokens(97.8).toString(), 'user2 tokens deducted');
                    balance = await exchange.balanceOf(token.address, feeAccount);
                    balance.toString().should.equal(tokens(0.2).toString(), 'feeAccount received fee');
                });

                it('updates filled orders', async () => {
                    let orderFilled = await exchange.orderFilled('1');
                    orderFilled.should.equal(true); 
                });

                it('emits a "Trade" event', async () => {
                    const log = result.logs[0];
                    log.event.should.equal('Trade');
                    const event = log.args;
                    event.id.toString().should.equal('1', 'id is correct');
                    event.user.should.equal(user1, 'user is correct');
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct');
                    event.amountGet.toString().should.equal(tokens(2).toString(), 'amountGet is correct');
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
                    event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct');
                    event.userFill.should.equal(user2, 'userFill is correct');
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
                });
            });

            describe('failure', async () => {
                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 99999;
                    await exchange.fillOrder(invalidOrderId, {from: user2}).should.be.rejectedWith(EVM_REVERT);                
                });

                it('rejects already filled orders', async () => {
                    // Fill the order
                    await exchange.fillOrder(1, {from: user2}).should.be.fulfilled;
                    // Try again to fill the order
                    await exchange.fillOrder(1, {from: user2}).should.be.rejectedWith(EVM_REVERT);
                });

                it('rejects cancelled orders', async () => {
                    // Cancel the order
                    await exchange.cancelOrder(1, {from: user1}).should.be.fulfilled;
                    // Try again to fill the order
                    await exchange.fillOrder(1, {from: user2}).should.be.rejectedWith(EVM_REVERT);
                });
            });
        });
        
        describe('cancelling orders', async () => {
            let result;

            describe('success', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder(1, {from: user1});
                });

                it('updates cancelled orders', async () => {
                    let orderCancelled = await exchange.orderCancelled(1);
                    orderCancelled.should.equal(true);                
                });

                it('emits a "Cancel" event', async () => {
                    const log = result.logs[0];
                    log.event.should.equal('Cancel');
                    const event = log.args;
                    event.id.toString().should.equal('1', 'id is correct');
                    event.user.should.equal(user1, 'user is correct');
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct');
                    event.amountGet.toString().should.equal(tokens(2).toString(), 'amountGet is correct');
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct');
                    event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct');
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present');
                });
            });

            describe('failure', async () => {
                beforeEach(async () => {
                    result = await exchange.cancelOrder('1', {from: user1});
                });

                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 99999;
                    await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(EVM_REVERT);                
                });

                it('rejects unauthorized transactions', async () => {
                    await exchange.cancelOrder(1, {from: user2}).should.be.rejectedWith(EVM_REVERT);
                });
            });
        });
    });    
});