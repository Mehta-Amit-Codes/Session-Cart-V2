class Cart {
  constructor(oldCart = {}) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
  }

  add(item, id) {
    let storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item, qty: 0, price: 0 };
    }
    storedItem.qty += 1;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQty += 1;
    this.totalPrice += storedItem.item.price;
  }

  reduceByOne(id) {
    const storedItem = this.items[id];
    if (!storedItem || storedItem.qty <= 0) {
      return;
    }

    storedItem.qty -= 1;
    storedItem.price -= storedItem.item.price;
    this.totalQty -= 1;
    this.totalPrice -= storedItem.item.price;

    if (storedItem.qty <= 0) {
      delete this.items[id];
    }
  }

  generateArray() {
    return Object.values(this.items);
  }
}

module.exports = Cart;
