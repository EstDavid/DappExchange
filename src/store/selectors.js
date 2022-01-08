import { get } from 'lodash';
import { createSelector } from 'reselect';
import { ETHER_ADDRESS, RED, GREEN, tokens, ether} from '../helpers';
import moment from 'moment';

const account = state => get(state, 'web3.account');
export const accountSelector = createSelector(account, a => a);

const tokenLoaded = state => get(state, 'token.loaded', false);
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl);

const exchangeLoaded = state => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el);

const exchange = state => get(state, 'exchange.contract', false);
export const exchangeSelector = createSelector(exchange, exc => exc);

export const contractsLoadedSelector = createSelector(
    tokenLoaded,
    exchangeLoaded,
    (tl, el) => (tl && el)
);

const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false);
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded);

const filledOrders = state => get(state, 'exchange.filledOrders.data', []);
export const filledOrdersSelector = createSelector(
    filledOrders,
    (orders) => {
        // Sort orders by date asceding for price comparison
        orders = orders.sort((a,b) => a.timestamp - b.timestamp);
        // Decorate the orders
        orders = decorateFilledOrders(orders);

        // Sorts orders by timestamp
        orders = orders.sort((a,b) => b.timestamp - a.timestamp);
        return orders;
    }
)

const decorateFilledOrders = (orders) => {
    let previousOrder = orders[0];
    return(
        orders.map((order) => {
            order  = decorateOrder(order);
            order = decorateFilledOrder(order, previousOrder);
            previousOrder = order // Update the previous order once it's decorated
            return order;
        })
    )
}

const decorateOrder = (order) => {
    let etherAmount;
    let tokenAmount;
    // if tokenGive
    if(order.tokenGive == ETHER_ADDRESS) {
        etherAmount = order.amountGive;
        tokenAmount = order.amountGet;
    } else {
        etherAmount = order.amountGet;
        tokenAmount = order.amountGive;
    }

    // Calculat token price to 5 decimal places
    const precision = 100000;
    let tokenPrice = (etherAmount / tokenAmount);
    tokenPrice = Math.round(tokenPrice * precision) / precision;

    return({
        ...order,
        etherAmount: ether(etherAmount),
        tokenAmount: tokens(tokenAmount),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a D/M')
    })
}

const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    });
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    // Show green price if only on order exists
    if(previousOrder.id === orderId) {
        return GREEN;
    }
    // Show green price if order price higher than previous order
    // Show red price if order price lower than previous order
    if(previousOrder.tokenPrice <= tokenPrice) {
        return GREEN; // Success
    } else {
        return RED; // Danger
    }
}