var {defineSupportCode} = require('cucumber');
var assert = require('assert');

defineSupportCode(function({Given, When, Then}) {
  
  Given('WOOCOMMERCE Product Data', function () {
    return assert.ok( this.json );
  });                                                                                                                                                    
                                                                             
  When('I import the data', function () {
    return assert.ok( this.import(this.json) );
  });                                                                        
  
  Then('I should have categories and products', function () {        
    return assert.ok( this.has('categories') &&  this.has('products') );
  });
  
  Given('I use a {string} as the current product', function (string) {
    this.switchProduct( string );
    // console.log( this.currentProduct );
    return assert.ok( this.currentProduct);
  });
  
  Given('the current stock count is {int}', function (int) {
    return assert.equal( this.currentProduct.stockCount, int );
  });
  
  Given('the current cart count is {int}', function (int) {
    return assert.equal( this.currentProduct.cartCount, int );
  });
  
  Given('the parent {string} has a stock of {int}', function (string, int) {
    var parent = this.getParent(string);
    
    return assert.equal( parent.stockCount, int )
  });
  
  Given('the parent {string} has a cart of {int}', function (string, int) {
    var parent = this.getParent(string);
    
    return assert.equal( parent.cartCount, int )
  });
  
  // Then('I should have a category {string} with a size of {int}', function (string, int) {
  //   return assert.equal( this.catalog.get(string).size, int )
  // });
  
  
  
  Given('the parent {string} has a {string} choice selected as {int}', function (string, string2, int) {
    var parent = this.getParent(string);
    return assert.equal( parent.choices.get(string2).selected, int );
  });
  
  

  Given('I choose a {string} named {string}', function (string, string2) {
    var selection = {};
    selection[string]=string2;
    return assert.ok( this.currentProduct.select(selection) );
  });
  
  Given('I choose a {string} of {int}', function (string, int) {
    var selection = {};
    selection[string]=int;
    return assert.ok( this.currentProduct.select(selection) );
  });
  
  Then('the current product has a {string} choice set to nothing', function (string) {
    return assert.equal( this.currentProduct.choices.get(string).selected, null );
  });

  Then('the current product has a {string} choice selected as {string}', function (string, string2) {
    return assert.equal( this.currentProduct.choices.get(string).selected, string2 );
  });
  
  Then('the current product has a {string} choice selected as {int}', function (string, int) {
    return assert.equal( this.currentProduct.choices.get(string).selected, int );
  });
  
  Then('the current product has a {string} of {string}', function (string, string2) {
    
    return assert.equal( this.currentProduct[string], string2 );
  });
  
  Then('the current product has a {string} of {int}', function (string, int) {
    
    return assert.equal( this.currentProduct[string], int );
  });
  
  Then('the parent {string} has a {string} choice set to nothing', function (string, string2) {
    var parent = this.getParent(string);
    return assert.equal( parent.choices.get(string2).selected, null )
  });

  Given('I select a variation with name {string}', function (string) {
    return assert.ok( this.currentProduct.select( { slipcover: string } ) );
  });
  
  Given('I select a quantity of {int}', function (int) {
    // console.log('QTY_SELECT', this)
    return assert.ok( this.currentProduct.select( {quantity: int } ) );
  });
  
  Then('the current product has a {string} of {string}', function (string, string2) {
    // console.log(this.currentProduct[string].explain ? this.currentProduct[string].explain() : this.currentProduct[string])
    return assert.equal( ''+this.currentProduct.choices.get(string), string2)
  });
  
  When('I have no leg options selected', function () {
    return assert.equal( this.currentProduct.choices.get('leg').selected , null );
  });
  
  When('the current product has a {string} of null', function (string) {
    return assert.equal( this.currentProduct[string] , null );
  });
  
  Then('addToCart returns an error', function () {
    return assert.ok( this.currentProduct.addToCart() instanceof Error );
  });
  
  
  When('I select a bucket with name {string}', function (string) {
    return assert.ok( this.currentProduct.selectBucket( string ) );
  });
  
  Then('addToCart returns true', function () {
    return assert.ok( this.currentProduct.addToCart()  );
  });
  
  
  Given('I have a cart', function () {
    return assert.ok( this.cart );
  });
  
  Then('the cart has items', function () {
    return assert.ok( this.cart.itemCount );
  });
  
  When('I set the first cart item as the current cart item', function () {
    this.currentCartItem = Array.from(this.cart.tokens.values())[0];
    // console.log(this.currentCartItem)
    return assert.ok( this.currentCartItem )
  });
  Given('I set the last cart item as the current cart item', function () {
    var items = Array.from(this.cart.tokens.values());
    this.currentCartItem = items[items.length - 1];
    return assert.ok( this.currentCartItem );
  });
  
  When('I increase the current cart item by {int}', function (int) {
    return assert.ok( this.currentCartItem.incr(int))
  });
  
  When('I decrease the current cart item by {int}', function (int) {
    return assert.ok( this.currentCartItem.decr(int))
  });
  Then('the cart has a {string} of {int}', function (string, int) {
    return assert.equal( this.cart[string], int  )
  });
  Then('the current cart item has a {string} of {int}', function (string, int) {
    return assert.equal( this.currentCartItem[string], int );
  });
  
  Then('the current cart item has a {string} choice of {int}', function (string, int) {
    return assert.equal( this.currentCartItem.choices[string], int );  
  });
  
  When('I remove the current cart item', function () {
    return assert.ok( this.currentCartItem.remove());
  });
  
  
  Then('the current product has a {string} number', function (string) {
    
    return assert.ok( !isNaN(this.currentProduct[string]) );
  });
  
  
  Given('I know that the current product has a base price of ${int}', function (int) {
    return assert.equal( this.currentProduct.basePrice, int );
  });                                                                                                                                                    
                                                                             
  Given('I know that the cheapest leg is {string} at ${int}', function (string, int) {
    return assert.equal( this.currentProduct.choices.get('leg').minRegularPrice, int );
  });                                                                                                                                                    
                                                                             
  Given('I know that the most expensive leg is {string} at ${int}', function (string, int) {
    return assert.equal( this.currentProduct.choices.get('leg').maxRegularPrice, int );
  });                                                                                                                                                    
                                                                             
  Given('I know that the cheapest slipcover is {string} at ${int}', function (string, int) {
    return assert.equal( this.currentProduct.choices.get('slipcover').minRegularPrice, int );
  });                                                                        
  
  Given('I know that the most expensive slipcover is {string} at ${int}', function (string, int) {
    return assert.equal( this.currentProduct.choices.get('slipcover').maxRegularPrice, int );
  });
  
  Then('the current product has a {string} of ${int}', function (string, int) {
    // console.log(`the current product has a ${string} of $${int}`, this.currentProduct[string] == int )
    return assert.equal( this.currentProduct[string], int );
  });
  
  
  Then('the current cart item has a {string} of ${int}', function (string, int) {
    // console.log(`the current cart item has a ${string} of $${int}`, this.currentCartItem[string] == int )
    return assert.equal( this.currentCartItem[string], int)
  });
  

  Then('the cart has a {string} of ${int}', function (string, int) {
     return assert.equal( this.cart[string], int );
  });
  Then('the cart has a {string} of {string}', function (string, string2) {
     return assert.equal( this.cart[string], string2 );
  });
  
  Then('the cart has a {string} of $${int}', function (string, int) {
     return assert.equal( this.cart[string], int );
  });
  
  When('I set the zone to {string}', function (string) {
    return assert.ok( this.cart.setZone(string));
  });
  
  Given('I reset the zone to nothing', function () {
    this.cart.zone = null;
    return assert.equal( this.cart.zone , null);
  });
  
  Then('the cart has a {string} above {int}', function (string, int) {
    return assert.ok( this.cart[string] > int );
  });

  When('I do not provide a postal code', function () {
    return assert.equal( this.cart.shippingZone, 'n/a' );
  });
  
  When('I provide a postal code of {string}', function (string) {
    return assert.ok( this.cart.setZoneFromPostalCode( string ) );
  });
  
  Then('the cart has a {string} of {float}', function (string, float) {
    return assert.equal( this.cart[string] , float );
  });
  
  Then('the cart has a {string} of ${float}', function (string, float) {
    return assert.equal( this.cart[string] , float );
  });
  
  Given('I reset the cart', function () {
    return assert.ok( this.cart.reset() );
  });
  
  Given('a coupon for %{int} off regular products', function (int) {
    return true;
  });
  
  When('the coupon for %{int} is applied', function (int) {
    return assert.ok( this.cart.addCoupon( int/100 ) );
  });
  
  Then('the cart has discounts including {float}', function (float) {
    return assert.ok( ~this.cart.discounts.indexOf( float ) );
  });
  
  
  When('the coupon for %{int} is removed', function (int) {
    return assert.ok( this.cart.removeCoupon( int/100 ) );
  });
  
  Then('the cart has no discounts including {float}', function (float) {
    return assert.ok( !~this.cart.discounts.indexOf( float ) );
  });

  Given('it\'s a VIP user', function () {
    return assert.ok( this.cart.setUserLevel('VIP') );
  });

  Given('it\'s a VVIP user', function () {
    return assert.ok( this.cart.setUserLevel('VVIP') );
  });
  
  Given('it\'s a VVVIP user', function () {
    return assert.ok( this.cart.setUserLevel('VVVIP') );
  });
  
  Given('it\'s a NORMAL user', function () {
    return assert.ok( this.cart.setUserLevel('NORMAL') );
  });
  
  Given('the initial cart total is ${float}', function (float) {
    return true;
  });
  
});
