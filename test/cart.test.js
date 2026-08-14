const test = require('node:test');
const assert = require('node:assert/strict');

const Cart = require('../models/cart');

test('Cart.add() adds a new item and updates totals', () => {
  const cart = new Cart({});
  cart.add({ price: 10 }, 'p1');

  assert.equal(cart.items.p1.qty, 1);
  assert.equal(cart.totalQty, 1);
  assert.equal(cart.totalPrice, 10);
});

test('Cart.add() increments quantity for an existing item', () => {
  const cart = new Cart({});
  cart.add({ price: 10 }, 'p1');
  cart.add({ price: 10 }, 'p1');

  assert.equal(cart.items.p1.qty, 2);
  assert.equal(cart.totalQty, 2);
  assert.equal(cart.totalPrice, 20);
});

test('Cart.reduceByOne() decrements quantity and removes item at zero', () => {
  const cart = new Cart({});
  cart.add({ price: 10 }, 'p1');
  cart.add({ price: 10 }, 'p1');

  cart.reduceByOne('p1');
  assert.equal(cart.items.p1.qty, 1);
  assert.equal(cart.totalQty, 1);
  assert.equal(cart.totalPrice, 10);

  cart.reduceByOne('p1');
  assert.equal(cart.items.p1, undefined);
  assert.equal(cart.totalQty, 0);
  assert.equal(cart.totalPrice, 0);
});

test('Cart.reduceByOne() is a no-op for an unknown item id', () => {
  const cart = new Cart({});
  cart.reduceByOne('does-not-exist');

  assert.equal(cart.totalQty, 0);
  assert.equal(cart.totalPrice, 0);
});

test('Cart.generateArray() returns all stored items', () => {
  const cart = new Cart({});
  cart.add({ price: 5 }, 'a');
  cart.add({ price: 7 }, 'b');

  const arr = cart.generateArray();
  assert.equal(arr.length, 2);
});
