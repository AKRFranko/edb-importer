(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.EDBCatalogBrain = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PedanticCount = require('pedantic-count');

var catMap = new Map();
var typeMap = new Map();
var dataMap = new Map();
var productInstances = new Map();
var bucketInstances = new Map();
var cartMap = new WeakMap();
var countersMap = new WeakMap();
var choiceMap = new WeakMap();
var shippingCosts = new Map();
shippingCosts.set('furniture', {
  min: 500,
  below: [65, 150, 250],
  above: [0, 85, 150]
});
shippingCosts.set('small-furniture', {
  min: 500,
  below: [18, 25, 28],
  above: [0, 10, 15]
});
shippingCosts.set('accessories', {
  min: 50,
  below: [15, 15, 15],
  above: [0, 0, 0]
});

var Cart =
/*#__PURE__*/
function () {
  function Cart(counts, cart) {
    _classCallCheck(this, Cart);

    this.tokens = new Map();
    this.products = new Map();
    this.zone = null;
    this.discounts = [];
    this.userLevel = false;
    countersMap.set(this, counts);
  }

  _createClass(Cart, [{
    key: "setUserLevel",
    value: function setUserLevel(userLevel) {
      return this.userLevel = userLevel;
    }
  }, {
    key: "addCoupon",
    value: function addCoupon(percent) {
      return this.discounts.push(percent);
    }
  }, {
    key: "removeCoupon",
    value: function removeCoupon(percent) {
      return this.discounts = this.discounts.filter(function (d) {
        return d !== percent;
      });
    }
  }, {
    key: "setZone",
    value: function setZone(string) {
      this.zone = string == 'zone-1' ? 0 : string == 'zone-2' ? 1 : 2;
      return true;
    }
  }, {
    key: "setZoneFromPostalCode",
    value: function setZoneFromPostalCode(postcode) {
      postcode = postcode.toUpperCase().trim();
      var zones_table = {
        'zone-1': /^(H..|G1.|M..|K1.|T2.|T3.|T5.|T6.|V5.|V6.|C1A|R2.|R3.|E2.|E1.|E3.|B3.|S7.|S4.|A1.|J4.).+$/,
        'zone-3': /^(J|G|K|L|N|P|T|V|C|R|E|B|S|A|Y|X)0.+$/
      };

      if (!/^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/.test(postcode)) {
        return this.setZone('zone-3');
      }

      var found = 'zone-2';
      Object.keys(zones_table).forEach(function (zone) {
        var regex = zones_table[zone];

        if (regex.test(postcode)) {
          found = zone;
        }
      });
      return this.setZone(found);
    }
  }, {
    key: "hasProduct",
    value: function hasProduct(id) {
      return this.products.has(typeof id == 'number' ? id : id.id);
    }
  }, {
    key: "incrItemQuantity",
    value: function incrItemQuantity(cartItem, qty) {
      cartItem.updateChoices.forEach(function (choice, name) {
        if (name !== 'quantity') {
          var option = choice.getOption(cartItem.choices[name]);

          if (option instanceof Set) {
            option.forEach(function (o) {
              o.incrCartCount(qty);
            });
          } else {
            option.incrCartCount(qty);
          }
        }
      });
      cartItem.choices.quantity += qty;
      return true;
    }
  }, {
    key: "decrItemQuantity",
    value: function decrItemQuantity(cartItem, qty) {
      // console.log('DECR')
      cartItem.updateChoices.forEach(function (choice, name) {
        if (name !== 'quantity') {
          var option = choice.getOption(cartItem.choices[name]);

          if (option instanceof Set) {
            option.forEach(function (o) {
              o.decrCartCount(qty);
            });
          } else {
            option.decrCartCount(qty);
          }
        }
      });
      cartItem.choices.quantity -= qty;
      return true;
    }
  }, {
    key: "addItem",
    value: function addItem(product) {
      var it = this;
      var selections = Object.assign({}, product.selections);
      var id = product.id;
      var qty = selections.quantity;
      delete selections.quantity;
      var data = {
        id: id,
        choices: selections,
        unitPrice: product.currentPrice
      };
      var token = JSON.stringify(data);
      Object.assign(data.choices, {
        quantity: 0
      });
      var cartItem = Object.assign(data, {
        token: token,
        choices: data.choices,
        shippingClass: product.shippingClass,
        updateChoices: product.choices,
        incr: function incr(qty) {
          return !!it.incrItemQuantity(cartItem, qty);
        },
        decr: function decr(qty) {
          return !!it.decrItemQuantity(cartItem, qty);
        },
        remove: function remove(qty) {
          return !!it.removeItem(cartItem);
        }
      });
      Object.defineProperties(cartItem, {
        minRegularPrice: {
          get: function get() {
            var qty = this.choices.quantity === 0 ? 1 : this.choices.quantity;
            return product.minRegularPrice * qty;
          }
        },
        maxRegularPrice: {
          get: function get() {
            var qty = this.choices.quantity === 0 ? 1 : this.choices.quantity;
            return product.maxRegularPrice * qty;
          }
        },
        minPrice: {
          get: function get() {
            var qty = this.choices.quantity === 0 ? 1 : this.choices.quantity;
            return product.minPrice * qty;
          }
        },
        maxPrice: {
          get: function get() {
            var qty = this.choices.quantity === 0 ? 1 : this.choices.quantity;
            return product.maxPrice * qty;
          }
        },
        itemCost: {
          get: function get() {
            var qty = this.choices.quantity === 0 ? 1 : this.choices.quantity;
            return this.unitPrice * qty;
          }
        }
      });

      if (!this.products.has(id)) {
        this.products.set(id, []);
      } // Object.assign(cartItem.choices, data.choices, { quantity: 0 });


      this.products.get(id).push(token);
      this.tokens.set(token, cartItem);
      cartItem.incr(qty); // console.log('cart now has %d items', this.tokens.size )

      return this.tokens.get(token);
    }
  }, {
    key: "removeItem",
    value: function removeItem(cartItem) {
      cartItem.decr(cartItem.choices.quantity);
      var tokens = this.products.get(cartItem.id);
      var newTokens = tokens.filter(function (t) {
        return t !== cartItem.token;
      });

      if (newTokens.length == 0) {
        this.products.delete(cartItem.id);
      } else {
        this.products.set(cartItem.id, newTokens);
      }

      this.tokens.delete(cartItem.token);
      return true;
    }
  }, {
    key: "reset",
    value: function reset() {
      var _this = this;

      this.tokens.forEach(function (cartItem) {
        _this.removeItem(cartItem);
      });
      this.zone = null;
      return true;
    }
  }, {
    key: "discountCost",
    get: function get() {
      var _this2 = this;

      if (this.itemCost <= 0) {
        return 0;
      }

      var userLevelDiscount = !this.userLevel ? 0 : this.userLevel === 'VIP' ? 0.05 : this.userLevel === 'VVIP' ? 0.10 : this.userLevel === 'VVVIP' ? 0.15 : 0;
      return [userLevelDiscount].concat(this.discounts).reduce(function (t, d) {
        return d === 0 ? t : t + _this2.itemCost * -d;
      }, 0);
    }
  }, {
    key: "shippingZone",
    get: function get() {
      if (this.zone === null) {
        return 'n/a';
      }

      return "zone-".concat(this.zone + 1);
    }
  }, {
    key: "total",
    get: function get() {
      var t = this.itemCost + this.taxCost + this.shippingCost + this.discountCost;
      if (isNaN(t)) return 'n/a';
      return t;
    }
  }, {
    key: "taxCost",
    get: function get() {
      if (this.zone === null) {
        return 'n/a';
      }

      return this.itemCost == 0 ? 0 : this.itemCost * 0.15;
    }
  }, {
    key: "shippingCost",
    get: function get() {
      if (this.zone === null) {
        return 'n/a';
      }

      var zone = this.zone;
      var itemCost = this.itemCost;
      var shippingClass = 'accessories';
      this.tokens.forEach(function (cartItem, token) {
        var sclass = cartItem.shippingClass; // console.log(sclass)

        if (shippingClass == 'accessories' && sclass == 'small-furniture') {
          shippingClass = sclass;
        }

        if ((shippingClass == 'small-furniture' || shippingClass == 'accessories') && sclass == 'furniture') {
          shippingClass = sclass;
        }
      });
      var rules = shippingCosts.get(shippingClass); // console.log(currentPrice >= rules.min ? 'above' : 'bellow', currentPrice, rules.min )

      if (itemCost >= rules.min) {
        return rules.above[zone];
      } else {
        return rules.below[zone];
      }
    }
  }, {
    key: "productCount",
    get: function get() {
      return this.products.size;
    }
  }, {
    key: "itemCount",
    get: function get() {
      return this.tokens.size;
    }
  }, {
    key: "itemCost",
    get: function get() {
      var total = 0.0;
      this.tokens.forEach(function (cartItem, t) {
        total += cartItem.itemCost;
      });
      return total;
    }
  }]);

  return Cart;
}();

var Product =
/*#__PURE__*/
function () {
  function Product(id, counts, cart) {
    var _this3 = this;

    _classCallCheck(this, Product);

    this.id = id;
    cartMap.set(this, cart);
    countersMap.set(this, counts);
    var vids = dataMap.get(this.id).variations;

    if (vids && vids.length) {
      vids.forEach(function (vid) {
        productInstances.set(vid, new Product.Variation(vid, _this3, counts));
      });
    }

    Object.defineProperty(this, 'name', {
      enumerable: true,
      configurable: true,
      value: this.name
    });
    Object.defineProperty(this, 'description', {
      enumerable: true,
      configurable: true,
      value: this.description
    });
    Object.defineProperty(this, 'image', {
      enumerable: true,
      configurable: true,
      value: this.image
    });
    Object.defineProperty(this, 'images', {
      enumerable: true,
      configurable: true,
      value: this.images
    });
    Object.defineProperty(this, 'type', {
      enumerable: true,
      configurable: true,
      value: this.type
    });
    Object.defineProperty(this, 'wireframe', {
      enumerable: true,
      configurable: true,
      value: this.wireframe
    });
    Object.defineProperty(this, 'anatomy', {
      enumerable: true,
      configurable: true,
      value: this.anatomy
    });
    Object.defineProperty(this, 'why_we_love', {
      enumerable: true,
      configurable: true,
      value: this.why_we_love
    }); // Object.defineProperty( this, 'minRegularPrice', { enumerable: true, configurable: true, value: this.minRegularPrice } );
    // Object.defineProperty( this, 'maxRegularPrice', { enumerable: true, configurable: true, value: this.maxRegularPrice } );
    // Object.defineProperty( this, 'maxSalePrice', { enumerable: true, configurable: true, value: this.maxSalePrice } );
    // Object.defineProperty( this, 'maxSalePrice', { enumerable: true, configurable: true, value: this.maxSalePrice } );
  }

  _createClass(Product, [{
    key: "hasBucket",
    value: function hasBucket(name) {
      return bucketInstances.has(name);
    }
  }, {
    key: "getBucket",
    value: function getBucket(name) {
      return bucketInstances.get(name);
    }
  }, {
    key: "hasVariation",
    value: function hasVariation(name) {
      var idx = dataMap.get(this.id).variations.findIndex(function (vid) {
        return productInstances.get(vid).name == name;
      });
      return !!~idx;
    }
  }, {
    key: "getVariation",
    value: function getVariation(name) {
      var idx = dataMap.get(this.id).variations.findIndex(function (vid) {
        return productInstances.get(vid).name == name;
      });

      if (~idx) {
        var vid = dataMap.get(this.id).variations[idx];
        return productInstances.get(vid);
      }
    }
  }, {
    key: "shippingClass",
    get: function get() {
      return 'furniture';
    }
  }, {
    key: "name",
    get: function get() {
      return dataMap.get(this.id).name;
    }
  }, {
    key: "description",
    get: function get() {
      return dataMap.get(this.id).description;
    }
  }, {
    key: "why_we_love",
    get: function get() {
      return {
        title: this.meta.why_we_love_title,
        content: this.meta.why_we_love_content
      };
    }
  }, {
    key: "wireframe",
    get: function get() {
      if (!this.meta.wireframe) return {
        src: null,
        colors: []
      };
      return {
        src: this.meta.wireframe.src,
        colors: this.meta.wireframe.colors || []
      };
    }
  }, {
    key: "anatomy",
    get: function get() {
      var enfr = {};

      if (!this.meta.anatomy_en) {
        enfr.en = {
          src: null,
          colors: []
        };
      } else {
        enfr.en = {
          src: this.meta.anatomy_en.src,
          colors: this.meta.anatomy_en.colors || []
        };
      }

      if (!this.meta.anatomy_fr) {
        enfr.fr = {
          src: null,
          colors: []
        };
      } else {
        enfr.fr = {
          src: this.meta.anatomy_fr.src,
          colors: this.meta.anatomy_fr.colors || []
        };
      }

      return enfr;
    }
  }, {
    key: "basePrice",
    get: function get() {
      if (!this.meta.base_price && 1 * this.meta.base_price !== 0) {
        return null;
      }

      return parseInt(this.meta.base_price);
    }
  }, {
    key: "meta",
    get: function get() {
      var meta_box = dataMap.get(this.id).meta_box;

      if (!meta_box) {
        return {};
      }

      return Object.keys(meta_box).reduce(function (keep, key) {
        if (/edb_/.test(key)) {
          keep[key.replace(/edb_/, '')] = meta_box[key];
        } else {
          keep[key.replace(/^_/, '')] = meta_box[key];
        }

        return keep;
      }, {});
    }
  }, {
    key: "image",
    get: function get() {
      var images = dataMap.get(this.id).images;

      if (images.length) {
        return {
          src: images[0].src,
          colors: images[0].colors || []
        };
      }

      return {
        src: null,
        colors: []
      };
    }
  }, {
    key: "images",
    get: function get() {
      var images = dataMap.get(this.id).images;

      if (images.length) {
        return images.slice(1).map(function (img) {
          return {
            src: img.src,
            colors: img.colors || []
          };
        });
      }

      return [];
    }
  }, {
    key: "type",
    get: function get() {
      return typeMap.get(this.id);
    }
  }, {
    key: "minRegularPrice",
    get: function get() {
      var choicePrice = new PedanticCount.LoggingCount(0);

      if (this.choices) {
        this.choices.forEach(function (choice, name) {
          // console.log(choice.minRegularPrice)
          if (name !== 'quantity') {
            choicePrice.incr(choice.minRegularPrice, "add ".concat(choice.name, "'s min regular price of $"));
          }
        });
      }

      if (this.basePrice !== null) {
        choicePrice.incr(this.basePrice, "add the base unit price of $".concat(this.basePrice));
      }

      return choicePrice;
    }
  }, {
    key: "maxRegularPrice",
    get: function get() {
      var choicePrice = new PedanticCount.LoggingCount(0);

      if (this.choices) {
        this.choices.forEach(function (choice, name) {
          if (name !== 'quantity') {
            choicePrice.incr(choice.maxRegularPrice, "add ".concat(choice.name, "'s max regular price of $"));
          }
        });
      }

      if (this.basePrice !== null) {
        choicePrice.incr(this.basePrice, "add the base unit price of $".concat(this.basePrice));
      }

      return choicePrice;
    }
  }, {
    key: "minSalePrice",
    get: function get() {
      var choicePrice = new PedanticCount.LoggingCount(0);

      if (this.choices) {
        this.choices.forEach(function (choice, name) {
          if (name !== 'quantity') {
            choicePrice.incr(choice.minSalePrice, "add ".concat(choice.name, "'s min sale price of $"));
          }
        });
      }

      if (this.basePrice !== null) {
        choicePrice.incr(this.basePrice, "add the base unit price of $".concat(this.basePrice));
      }

      return choicePrice;
    }
  }, {
    key: "maxSalePrice",
    get: function get() {
      var choicePrice = new PedanticCount.LoggingCount(0);

      if (this.choices) {
        this.choices.forEach(function (choice, name) {
          if (name !== 'quantity') {
            choicePrice.incr(choice.maxSalePrice, "add ".concat(choice.name, "'s max sale price of $"));
          }
        });
      }

      if (this.basePrice !== null) {
        choicePrice.incr(this.basePrice, "add the base unit price of $".concat(this.basePrice));
      }

      return choicePrice;
    }
  }, {
    key: "minPrice",
    get: function get() {
      return Math.min(this.minSalePrice, this.minRegularPrice);
    }
  }, {
    key: "maxPrice",
    get: function get() {
      return Math.max(this.maxSalePrice, this.maxRegularPrice);
    }
  }, {
    key: "currentPrice",
    get: function get() {
      var choicePrice = new PedanticCount.LoggingCount(0);

      if (this.choices) {
        this.choices.forEach(function (choice, name) {
          if (name !== 'quantity') {
            if (choice.selectedOption !== null) {
              choicePrice.incr(choice.selectedOption.price, "add ".concat(choice.name, "'s current price of $"));
            } else {
              choicePrice.incr(choice.minPrice, "add ".concat(choice.name, "'s max of $"));
            }
          }
        });
      }

      if (this.basePrice !== null) {
        choicePrice.incr(this.basePrice, "add the base unit price of $".concat(this.basePrice));
      }

      return choicePrice;
    }
  }]);

  return Product;
}();

Product.Variation =
/*#__PURE__*/
function () {
  function _class(id, parent, counts) {
    _classCallCheck(this, _class);

    this.id = id;
    this.parent = parent;
    countersMap.set(this, counts); // productInstances.set(this.id, this );
  }

  _createClass(_class, [{
    key: "select",
    value: function select(qty) {
      return countersMap.get(this).incrCount('selectedCount', this.id, qty, "select a quantity for variation #".concat(this.id, " of"));
    }
  }, {
    key: "unselect",
    value: function unselect(qty) {
      return countersMap.get(this).decrCount('selectedCount', this.id, qty);
    }
  }, {
    key: "incrCartCount",
    value: function incrCartCount(qty) {
      return countersMap.get(this).incrCount('cartCount', this.id, qty, "added to cart a quantity for variation #".concat(this.id, " of"));
    }
  }, {
    key: "decrCartCount",
    value: function decrCartCount(qty) {
      return countersMap.get(this).decrCount('cartCount', this.id, qty, "removed from cart a quantity for variation #".concat(this.id, " of"));
    }
  }, {
    key: "name",
    get: function get() {
      var attr = dataMap.get(this.id).attributes;
      var name = Object.keys(attr).reduce(function (found, k) {
        if (found) return found;
        var a = attr[k];

        if (/edb/.test(k)) {
          found = a.replace(/^edb_/, '').replace(/_/g, '-');
        }

        return found;
      }, false);

      if (!name) {
        return 'Unknown';
      }

      return name;
    }
  }, {
    key: "regularPrice",
    get: function get() {
      return parseFloat(dataMap.get(this.id).display_regular_price);
    }
  }, {
    key: "salePrice",
    get: function get() {
      var disp = dataMap.get(this.id).display_price;
      return disp < this.regularPrice ? disp : null;
    }
  }, {
    key: "price",
    get: function get() {
      return this.salePrice === null ? this.regularPrice : this.salePrice;
    }
  }, {
    key: "selected",
    get: function get() {
      return !!this.isSelected;
    },
    set: function set(bool) {
      var wasSelected = this.isSelected;

      if (wasSelected) {
        this.unselect(this.selectedCount);
      }

      this.isSelected = !!bool;
      return true;
    }
  }, {
    key: "stockCount",
    get: function get() {
      if (this.parent.type == 'bucket') {
        var v = countersMap.get(this).getCount('stockCount', this.id);

        if (v > 0) {
          return 'n/a';
        } else {
          return 0;
        }
      }

      return countersMap.get(this).getCount('stockCount', this.id);
    }
  }, {
    key: "cartCount",
    get: function get() {
      return countersMap.get(this).getCount('cartCount', this.id);
    }
  }, {
    key: "selectedCount",
    get: function get() {
      return countersMap.get(this).getCount('selectedCount', this.id);
    }
  }]);

  return _class;
}();

Product.Choice =
/*#__PURE__*/
function () {
  function _class2(attr, parent) {
    _classCallCheck(this, _class2);

    this.name = attr.name;
    ;
    this.type = attr.variation ? 'variation' : attr.name == 'quantity' ? 'count' : 'bucket';
    this.options = new Map();
    this.selected = null;
    this.parent = parent;

    if (this.type == 'variation') {
      attr.options.reduce(function (opts, name) {
        var value;

        if (parent.hasVariation(name)) {
          value = parent.getVariation(name);
        } else {
          value = name;
        }

        opts.set(name, value);
        return opts;
      }, this.options);
    }

    if (this.type == 'bucket') {
      attr.options.reduce(function (opts, name) {
        var value;

        if (parent.hasBucket(name)) {
          value = parent.getBucket(name);
        } else {
          value = name;
        }

        opts.set(name, value);
        return opts;
      }, this.options);
    }

    if (this.type == 'count') {
      this.options.set('min', 0);
      this.options.set('step', 1);
      this.options.set('max', 100);
      this.selected = new PedanticCount.LoggingCount(0);
    }
  }

  _createClass(_class2, [{
    key: "getOption",
    value: function getOption(name) {
      if (!this.options.has(name)) {
        return null;
      }

      return this.options.get(name);
    }
  }, {
    key: "select",
    value: function select(choice) {
      var _this4 = this;

      if (this.type == 'count') {
        if (isNaN(choice)) throw new Error("Cannot select quantity of \"".concat(choice, "\""));
        this.selected.incr(choice, "increased the quantity choice by ".concat(choice));
        this.parent.choices.forEach(function (parentChoice, name) {
          if (parentChoice !== _this4) {
            if (parentChoice.selected) {
              parentChoice.options.get(parentChoice.selected).select(_this4.selected);
            } else {// console.log('not selected, ignore %s?', name);
            }
          }
        });
      } else {
        this.selected = null;
        this.options.forEach(function (option, name) {
          if (name == choice) {
            _this4.selected = name;
            option.selected = true;
          } else {
            option.selected = false;
          }
        });
      }

      return true;
    }
  }, {
    key: "unselect",
    value: function unselect(choice) {
      if (this.type == 'count') {
        if (isNaN(choice) && arguments.length > 0) {
          throw new Error("Cannot unselect quantity of \"".concat(choice, "\""));
        }

        this.selected.decr(choice, "decreased the quantity choice by ".concat(choice));
      } else {
        var current = this.selectedOption;

        if (current) {
          // console.log('current',current.selected)
          current.selected = false;
        }

        this.selected = null;
      }

      return true;
    }
  }, {
    key: "minRegularPrice",
    get: function get() {
      if (this.type == 'count') {
        return 0;
      }

      var prices = [];
      this.options.forEach(function (option, name) {
        if (!isNaN(option.regularPrice)) {
          prices.push(option.regularPrice);
        } else {
          prices.push(0);
        }
      });
      return Math.min.apply(Math, prices);
    }
  }, {
    key: "maxRegularPrice",
    get: function get() {
      if (this.type == 'count') {
        return 0;
      }

      var prices = [];
      this.options.forEach(function (option, name) {
        if (!isNaN(option.regularPrice)) {
          prices.push(option.regularPrice);
        } else {
          prices.push(0);
        }
      });
      return Math.max.apply(Math, prices);
    }
  }, {
    key: "minSalePrice",
    get: function get() {
      if (this.type == 'count') {
        return 0;
      }

      var prices = [];
      this.options.forEach(function (option, name) {
        if (option.salePrice !== null && !isNaN(option.salePrice)) {
          prices.push(option.salePrice);
        } else {
          prices.push(isNaN(option.regularPrice) ? 0 : option.regularPrice);
        }
      });
      return Math.min.apply(Math, prices);
    }
  }, {
    key: "maxSalePrice",
    get: function get() {
      if (this.type == 'count') {
        return 0;
      }

      var prices = [];
      this.options.forEach(function (option, name) {
        if (option.salePrice !== null && !isNaN(option.salePrice)) {
          prices.push(option.salePrice);
        } else {
          prices.push(isNaN(option.regularPrice) ? 0 : option.regularPrice);
        }
      });
      return Math.max.apply(Math, prices);
    }
  }, {
    key: "minPrice",
    get: function get() {
      return Math.min(this.minSalePrice, this.minRegularPrice);
    }
  }, {
    key: "maxPrice",
    get: function get() {
      return Math.max(this.maxSalePrice, this.maxRegularPrice);
    }
  }, {
    key: "currentPrice",
    get: function get() {
      if (this.type == 'count') {
        return 0;
      }

      var selectedOption = this.selectedOption;

      if (selectedOption === null) {
        return null;
      }

      return selectedOption.price;
    }
  }, {
    key: "selectedOption",
    get: function get() {
      if (this.type == 'count') {
        return this.selected;
      }

      if (this.selected === null) {
        return null;
      }

      return this.getOption(this.selected);
    }
  }]);

  return _class2;
}();

Product.CompositeChoice =
/*#__PURE__*/
function () {
  function _class3(parentChoice, parent) {
    _classCallCheck(this, _class3);

    this.name = parentChoice.name;
    this.type = parentChoice.type;
    this.parent = parent;
    this.parentChoices = new Set(); // this.options = new Map();
    // this.selected = null;
  }

  _createClass(_class3, [{
    key: "getOption",
    value: function getOption(name) {
      if (!this.options.has(name)) {
        return null;
      }

      return this.options.get(name);
    }
  }, {
    key: "select",
    value: function select(choice) {
      this.parentChoices.forEach(function (parentChoice) {
        // console.log('selected choice', choice, 'on parent', parentChoice.parent.id, parentChoice.name )
        parentChoice.select(choice);
      });
      return true;
    }
  }, {
    key: "unselect",
    value: function unselect(choice) {
      this.parentChoices.forEach(function (parentChoice) {
        // console.log('unselected choice', choice, 'on parent', parentChoice.parent.id, parentChoice.name )
        parentChoice.unselect(choice);
      });
      return true;
    }
  }, {
    key: "add",
    value: function add(parentChoice) {
      this.parentChoices.add(parentChoice);
    }
  }, {
    key: "selected",
    get: function get() {
      var selected = null;

      if (this.type == 'count') {
        selected = [];
        this.parentChoices.forEach(function (parentChoice) {
          selected.push(parentChoice.selected);
        });
        return Math.min.apply(Math, selected);
      } else {
        this.parentChoices.forEach(function (parentChoice) {
          if (parentChoice.selected !== null) {
            selected = parentChoice.selected;
          }
        });
      }

      return selected;
    }
  }, {
    key: "selectedOption",
    get: function get() {
      if (this.type == 'count') {
        return this.selected;
      }

      if (this.selected === null) {
        return null;
      }

      return this.getOption(this.selected);
    }
  }, {
    key: "minRegularPrice",
    get: function get() {
      var total = new PedanticCount.LoggingCount(0);
      this.parentChoices.forEach(function (parentChoice) {
        total.incr(parentChoice.minRegularPrice, "add child product #".concat(parentChoice.parent.id, "'s min regular price of $"));
      });
      return total;
    }
  }, {
    key: "maxRegularPrice",
    get: function get() {
      var total = new PedanticCount.LoggingCount(0);
      this.parentChoices.forEach(function (parentChoice) {
        total.incr(parentChoice.maxRegularPrice, "add child product #".concat(parentChoice.parent.id, "'s max regular price of $"));
      });
      return total;
    }
  }, {
    key: "minSalePrice",
    get: function get() {
      var total = new PedanticCount.LoggingCount(0);
      this.parentChoices.forEach(function (parentChoice) {
        total.incr(parentChoice.minSalePrice, "add child product #".concat(parentChoice.parent.id, "'s min sale price of $"));
      });
      return total;
    }
  }, {
    key: "maxSalePrice",
    get: function get() {
      var total = new PedanticCount.LoggingCount(0);
      this.parentChoices.forEach(function (parentChoice) {
        total.incr(parentChoice.maxSalePrice, "add child product #".concat(parentChoice.parent.id, "'s max sale price of $"));
      });
      return total;
    }
  }, {
    key: "options",
    get: function get() {
      var options = new Map();
      this.parentChoices.forEach(function (parentChoice) {
        var parentOptions = parentChoice.options;
        parentOptions.forEach(function (parentOption, name) {
          if (!options.has(name)) {
            options.set(name, new Set());
          }

          options.get(name).add(parentOption);
        });
      });
      return options;
    }
  }]);

  return _class3;
}();

var BaseProduct =
/*#__PURE__*/
function (_Product) {
  _inherits(BaseProduct, _Product);

  function BaseProduct(id, counts, cart) {
    var _this5;

    _classCallCheck(this, BaseProduct);

    _this5 = _possibleConstructorReturn(this, (BaseProduct.__proto__ || Object.getPrototypeOf(BaseProduct)).call(this, id, counts, cart));
    Object.defineProperty(_this5, 'selected', {
      enumerable: true,
      configurable: true,
      value: _this5.selections
    }); // Object.defineProperty(,{ enumerable: true })
    // this.selectedVariation=null;
    // this.selectedBucket=null;

    return _this5;
  }

  _createClass(BaseProduct, [{
    key: "select",
    value: function select() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // console.log('select', this.type, options );
      this.choices.forEach(function (choice, name) {
        if (~Object.keys(options).indexOf(name)) {
          choice.select(options[name]);
        }
      });
      return true;
    }
  }, {
    key: "unselect",
    value: function unselect() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.choices.forEach(function (choice, name) {
        if (~Object.keys(options).indexOf(name)) {
          choice.unselect(options[name]);
        }
      });
      return true;
    }
  }, {
    key: "reset",
    value: function reset() {
      var unsel = Object.assign({}, this.selections, {
        quantity: this.choices.get('quantity').selected
      }); // console.log('reset %d', this.id, unsel );

      this.unselect(unsel);
      return true;
    }
  }, {
    key: "addToCart",
    value: function addToCart() {
      var selectedQty = this.choices.get('quantity').selected;
      if (selectedQty === 0) return new Error('Cannot add to cart, quantity missing');

      if (!this.hasValidSelections) {
        return new Error('Cannot add to cart, selections are missing');
      }

      cartMap.get(this).addItem(this);
      return this.reset();
    }
  }, {
    key: "variations",
    get: function get() {
      return dataMap.get(this.id).variations.map(function (vid) {
        return productInstances.get(vid);
      });
    }
  }, {
    key: "choices",
    get: function get() {
      var _this6 = this;

      if (choiceMap.has(this)) return choiceMap.get(this);
      var attrs = dataMap.get(this.id).attributes;
      if (!attrs) return null;
      var choices = new Map();
      choices.set('quantity', new Product.Choice({
        name: 'quantity'
      }, this));
      attrs.reduce(function (obj, attr) {
        obj.set(attr.name, new Product.Choice(attr, _this6));
        return obj;
      }, choices);
      choiceMap.set(this, choices);
      return choices;
    }
  }, {
    key: "selections",
    get: function get() {
      var _this7 = this;

      return Array.from(this.choices.keys()).reduce(function (o, key) {
        o[key] = _this7.choices.get(key).selected;
        return o;
      }, {});
    }
  }, {
    key: "hasValidSelections",
    get: function get() {
      var selections = this.selections;
      return Object.keys(selections).every(function (key) {
        return key != 'quantity' ? selections[key] !== null : true;
      });
    }
  }, {
    key: "stockCount",
    get: function get() {
      var _this8 = this;

      var selectedOptionStock = null;
      var source = null;
      this.choices.forEach(function (choice, name) {
        if (name !== 'quantity') {
          var selectedOption = choice.selectedOption;

          if (selectedOption) {
            // console.log(selectedOption.stockCount)
            if (selectedOption.stockCount == 'n/a') {
              return selectedOptionStock;
            }

            selectedOptionStock = selectedOption.stockCount;
            source = selectedOption;
          }
        }
      });

      if (selectedOptionStock === null) {
        return this.variations.reduce(function (t, v) {
          t.incr(v.stockCount, "include product #".concat(_this8.id, "'s variation #").concat(v.id, "'s stockCount of"));
          return t;
        }, new PedanticCount.LoggingCount(0));
      } // console.log( 'stockCount(BASE#%s)', this.id, selectedOptionStock, source.parent)


      return selectedOptionStock;
    }
  }, {
    key: "cartCount",
    get: function get() {
      var _this9 = this;

      if (this.selectedVariation) {
        return this.getVariation(this.selectedVariation).cartCount;
      } else {
        return this.variations.reduce(function (t, v) {
          t.incr(v.cartCount, "include product#".concat(_this9.id, " variation#").concat(v.id, " cartCount of"));
          return t;
        }, new PedanticCount.LoggingCount(0));
      }
    }
  }, {
    key: "selectedCount",
    get: function get() {
      var _this10 = this;

      if (this.selectedVariation) {
        return this.getVariation(this.selectedVariation).selectedCount;
      } else {
        return this.variations.reduce(function (t, v) {
          t.incr(v.selectedCount, "include product#".concat(_this10.id, " variation#").concat(v.id, "'s selectedCount of"));
          return t;
        }, new PedanticCount.LoggingCount(0));
      }
    }
  }]);

  return BaseProduct;
}(Product);

var CompositeProduct =
/*#__PURE__*/
function (_BaseProduct) {
  _inherits(CompositeProduct, _BaseProduct);

  function CompositeProduct() {
    _classCallCheck(this, CompositeProduct);

    return _possibleConstructorReturn(this, (CompositeProduct.__proto__ || Object.getPrototypeOf(CompositeProduct)).apply(this, arguments));
  }

  _createClass(CompositeProduct, [{
    key: "unselect",
    value: function unselect() {
      var _this11 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.choices.forEach(function (choice, name) {
        if (~Object.keys(options).indexOf(name)) {
          var parentChoices = _this11.choices.get(name).parentChoices;

          parentChoices.forEach(function (choice) {
            choice.unselect(options[name]);
          });
        }
      });
      return true;
    } // selectQuantity( qty ){
    //   return this.parents.reduce( ( success, parent )=>{
    //     if(!success) return success;
    //     return parent.selectQuantity( qty );
    //   }, true );
    // }
    // selectVariation( name ){
    //   return this.parents.reduce( ( success, parent )=>{
    //     if(!success) return success;
    //     return parent.selectVariation( name );
    //   }, (this.selectedVariation = name) );
    // }

  }, {
    key: "parents",
    get: function get() {
      var gids = dataMap.get(this.id).meta_box.edb_group_ids;
      var gids = gids.split(',').map(function (s) {
        return parseInt(s.trim());
      });
      return gids.map(function (gid) {
        return productInstances.get(gid);
      });
    }
  }, {
    key: "choices",
    get: function get() {
      var _this12 = this;

      if (choiceMap.has(this)) return choiceMap.get(this);
      var compositeChoices = new Map();
      return this.parents.reduce(function (comps, parent) {
        parent.choices.forEach(function (parentChoice, name) {
          if (!comps.has(name)) {
            comps.set(name, new Product.CompositeChoice(parentChoice, _this12));
          }

          comps.get(name).add(parentChoice);
        });
        return comps;
      }, compositeChoices);
    }
  }, {
    key: "stockCount",
    get: function get() {
      var counts = [];
      this.parents.forEach(function (parent) {
        if (parent.stockCount !== 'n/a') {
          counts.push(parent.stockCount); // console.log('parent[%d].cartCount',parent.id,parent.cartCount)
          // console.log('parent[%d].stockCount',parent.id,parent.stockCount)
        }
      }); // console.log('counts', counts)

      return Math.min.apply(Math, counts);
    }
  }, {
    key: "cartCount",
    get: function get() {
      return Math.min.apply(Math, this.parents.map(function (parent) {
        return parent.cartCount;
      }));
    }
  }, {
    key: "selectedCount",
    get: function get() {
      return this.parents.reduce(function (t, parent) {
        return t + (parent.selectedCount ? 1 : 0);
      }, 0) / this.parents.length;
    }
  }, {
    key: "basePrice",
    get: function get() {
      return this.parents.reduce(function (t, parent) {
        return t + (parent.basePrice === null ? 0 : parent.basePrice);
      }, 0);
    }
  }, {
    key: "minRegularPrice",
    get: function get() {
      var value = this.parents.reduce(function (t, parent) {
        return t + parent.minRegularPrice;
      }, 0); // console.log('minRegularPrice', value)

      return value;
    }
  }, {
    key: "maxRegularPrice",
    get: function get() {
      return this.parents.reduce(function (t, parent) {
        return t + parent.maxRegularPrice;
      }, 0);
    }
  }, {
    key: "minSalePrice",
    get: function get() {
      return this.parents.reduce(function (t, parent) {
        return t + parent.minSalePrice;
      }, 0);
    }
  }, {
    key: "maxSalePrice",
    get: function get() {
      return this.parents.reduce(function (t, parent) {
        return t + parent.maxSalePrice;
      }, 0);
    }
  }, {
    key: "currentPrice",
    get: function get() {
      var _this13 = this;

      return this.parents.reduce(function (choicePrice, parent) {
        if (parent.choices) {
          parent.choices.forEach(function (choice, name) {
            if (name !== 'quantity') {
              var selected = _this13.choices.get(choice.name).selected;

              if (selected !== null) {
                var option = choice.getOption(selected);
                choicePrice.incr(option.price, "add ".concat(name, "'s current price of $"));
              }
            }
          });
        }

        if (parent.basePrice !== null) {
          choicePrice.incr(parent.basePrice, "add the base unit price of $".concat(parent.basePrice));
        }

        return choicePrice;
      }, new PedanticCount.LoggingCount(0));
    }
  }]);

  return CompositeProduct;
}(BaseProduct);

var BucketProduct =
/*#__PURE__*/
function (_BaseProduct2) {
  _inherits(BucketProduct, _BaseProduct2);

  function BucketProduct(id, counts) {
    var _this14;

    _classCallCheck(this, BucketProduct);

    _this14 = _possibleConstructorReturn(this, (BucketProduct.__proto__ || Object.getPrototypeOf(BucketProduct)).call(this, id, counts));
    _this14.selectedVariation = null;

    _this14.variations.forEach(function (v) {
      bucketInstances.set(v.name, v);
    });

    return _this14;
  }

  return BucketProduct;
}(BaseProduct);

var EDBCatalogBrain =
/*#__PURE__*/
function () {
  function EDBCatalogBrain() {
    _classCallCheck(this, EDBCatalogBrain);

    this.counts.createIndex('stockCount');
    this.counts.createVirtual('cartCount', 0);
    this.counts.createVirtual('selectedCount', 0);
    this.counts.link('stockCount', 'selectedCount');
    this.counts.link('stockCount', 'cartCount');
    this.cart = new Cart(this.counts);
  }

  _createClass(EDBCatalogBrain, [{
    key: "getProduct",
    value: function getProduct(id) {
      var type = typeMap.get(id);

      if (productInstances.has(id)) {
        return productInstances.get(id);
      } else {
        switch (type) {
          case 'normal':
            productInstances.set(id, new Product(id, this.counts, this.cart));
            break;

          case 'base':
            productInstances.set(id, new BaseProduct(id, this.counts, this.cart));
            break;

          case 'composite':
            productInstances.set(id, new CompositeProduct(id, this.counts, this.cart));
            break;

          case 'bucket':
            productInstances.set(id, new BucketProduct(id, this.counts, this.cart));
            break;
        }
      }

      return productInstances.get(id);
    }
  }, {
    key: "importVariations",
    value: function importVariations(json) {
      var _this15 = this;

      json.variation_data.forEach(function (v) {
        var id = v.variation_id;
        dataMap.set(id, v);

        _this15.counts.setCount('stockCount', id, v.stock);
      });
    }
  }, {
    key: "importCategories",
    value: function importCategories(json) {
      var cats = json.categories;
      cats.forEach(function (cat) {
        dataMap.set(cat.slug, cat);

        if (!catMap.has(cat.slug)) {
          catMap.set(cat.slug, new Set());
        }

        catMap.get(cat.slug).add(json.id);
      });
    }
  }, {
    key: "importTypes",
    value: function importTypes(json) {
      // console.log(json.meta_box)
      if (json.meta_box && json.meta_box.edb_group_ids) {
        typeMap.set(json.id, 'composite');
        return 'composite';
      } else if (json.meta_box && json.meta_box.edb_bucket_slug) {
        typeMap.set(json.id, 'bucket');
        return 'bucket';
      } else if (json.meta_box && json.meta_box.edb_base_price && json.meta_box.edb_base_price != '') {
        typeMap.set(json.id, 'base');
        return 'base';
      } else {
        typeMap.set(json.id, 'normal');
        return 'normal';
      }
    }
  }, {
    key: "import",
    value: function _import(json) {
      var _this16 = this;

      if (Array.isArray(json)) {
        return json.map(function (item) {
          return _this16.import(item);
        });
      }

      var type = this.importTypes(json);
      this.importCategories(json);

      if (json.variation_data) {
        this.importVariations(json);
      }

      dataMap.set(json.id, json);

      if (type == 'bucket') {
        this.getProduct(json.id);
      }
    }
  }, {
    key: "counts",
    get: function get() {
      return PedanticCount.CountIndex;
    }
  }, {
    key: "categories",
    get: function get() {
      return Array.from(catMap.keys());
    }
  }, {
    key: "catalog",
    get: function get() {
      var _this17 = this;

      return this.categories.reduce(function (mapped, cat) {
        mapped.set(cat, Array.from(catMap.get(cat).values()).reduce(function (map, id) {
          map.set(id, _this17.getProduct(id));
          return map;
        }, new Map()));
        return mapped;
      }, new Map());
    }
  }]);

  return EDBCatalogBrain;
}();

module.exports = EDBCatalogBrain;


},{"pedantic-count":2}],2:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PedanticCount = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return _get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
* @file Count.js
* @author Franko <franko@akr.club>
* @version 0.1
*/

/**
 * History WeakMap for all instances
 * @const histMap
 */
var histMap = new WeakMap();
/**
* Loglines WeakMap for all instances
* @const logMap
*/

var logMap = new WeakMap();
/**
* histories memo
* @const histories
*/

var histories = function histories(object) {
  if (!histMap.has(object)) histMap.set(object, []);
  return histMap.get(object);
};
/**
* loglines memo
* @const loglines
*/


var loglines = function loglines(object) {
  if (!logMap.has(object)) logMap.set(object, []);
  return logMap.get(object);
};

var explanation = function explanation(loglines, history, result, indent) {
  result = result || ['\nScenario: Explain a Count'];
  indent = indent || 0;
  history.forEach(function (n, i) {
    var log = loglines[i];

    if (Array.isArray(log)) {
      var hist = new Array(log.length);
      hist.fill(n);
      indent++;
      return explanation(log, hist, result, indent);
    } else {
      result.push(/^initialize/.test(log) ? 'When I ' + log : 'And I ' + log);
    }
  });
  var space = new Array(indent).fill(' ').join('');
  indent--;
  return result.join('\n' + space + ' ');
};

var BaseCount =
/*#__PURE__*/
function () {
  _createClass(BaseCount, null, [{
    key: "__defineProperty",
    value: function __defineProperty(obj, name, instance, logging) {
      Object.defineProperty(obj, name, {
        enumerable: true,
        value: instance
      });

      if (!obj.__countProperties__) {
        Object.defineProperty(obj, '__countProperties__', {
          enumerable: false,
          writeable: true,
          value: {}
        });
      }

      Object.defineProperty(obj.__countProperties__, name, {
        enumerable: true,
        get: function get() {
          return instance;
        }
      });
      Object.defineProperty(obj, name + 'History', {
        get: function get() {
          return instance.history;
        }
      });

      if (logging) {
        Object.defineProperty(obj, name + 'Log', {
          get: function get() {
            return instance.log;
          }
        });
        Object.defineProperty(obj, name + 'Explanation', {
          get: function get() {
            return instance.explain().replace(/Explain a Count/g, 'Explain a Count named ' + name);
          }
        });
        var oldExplain = obj.explainCounts;

        obj.explainCounts = function () {
          var previous = oldExplain ? oldExplain.call(obj) : null;
          var bunch = previous ? [previous] : [];
          Object.keys(obj.__countProperties__).forEach(function (name) {
            bunch.push(obj[name + 'Explanation']);
          });
          return bunch.join("\n");
        };
      }
    }
  }, {
    key: "defineProperty",
    value: function defineProperty(obj, name, init, strict, logging) {
      var clazz = BaseCount;

      if (logging) {
        clazz = LoggingCount;
      } else if (strict) {
        clazz = StrictCount;
      }

      var instance = new clazz(init);

      if (typeof Object.getPrototypeOf(obj) == 'function') {
        BaseCount.__defineProperty(obj.prototype, name, instance, logging);
      } else {
        BaseCount.__defineProperty(obj, name, instance, logging);
      }

      return obj;
    }
    /**
    * Represents a Count.
    * @constructor
    * @param {number} initial - The initial value
    */

  }]);

  function BaseCount(initial) {
    _classCallCheck(this, BaseCount);

    if (isNaN(initial)) {
      this.set(0);
    } else {
      this.set(initial);
    }
  }
  /**
  * Returns the numeric value of the count
  * @returns {number} The sum of the historical changes
  */


  _createClass(BaseCount, [{
    key: "valueOf",
    value: function valueOf() {
      return Number(histories(this).reduce(function (t, n) {
        return t + n;
      }, 0));
    }
    /**
    * Returns the array of values used to calculate the result.
    * @returns {array} The values for all changes
    */

  }, {
    key: "get",

    /**
    * Returns the numeric value of the count
    * @returns {number} The sum of the historical changes
    */
    value: function get() {
      return 1 * this;
    }
    /**
    * Adds a new value to the history
    * @param {number} value - An integer
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "set",
    value: function set(v) {
      var _this = this;

      if (isNaN(v)) {
        return this.valueOf;
      }

      if (typeof v.history !== 'undefined') {
        v.history.forEach(function (v) {
          _this.set(v);
        });
      } else {
        histories(this).push(v);
      }

      return this.valueOf;
    }
    /**
    * Adds a new value incrementation the history
    * @param {number} value - A non-negative integer
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "incr",
    value: function incr(n) {
      if (isNaN(n)) {
        n = 0;
      }

      if (n < 0) {
        n = Math.abs(n);
      }

      return this.set(n);
    }
    /**
    * Adds a new value decrementation the history
    * @param {number} value - A non-negative integer
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "decr",
    value: function decr(n) {
      if (isNaN(n)) {
        n = 0;
      }

      if (n < 0) {
        n = Math.abs(n);
      }

      return this.set(-1 * n);
    }
    /**
    * Returns the history to the first value set.
    * @returns {number} The sum of the historical changes (the initial value) 
    */

  }, {
    key: "reset",
    value: function reset() {
      var h = histories(this);
      var first = h.shift();
      h.splice(0, h.length);
      h.push(first);
      return this.get();
    }
  }, {
    key: "history",
    get: function get() {
      return Array.from(histories(this));
    }
    /**
    * Returns the length of the history
    * @returns {array} The values for all changes
    */

  }, {
    key: "length",
    get: function get() {
      return histories(this).length;
    }
  }]);

  return BaseCount;
}();

var StrictCount =
/*#__PURE__*/
function (_BaseCount) {
  _inherits(StrictCount, _BaseCount);

  /**
  * Represents a Strict Count.
  * @constructor
  * @param {number} initial - The initial value (required)
  */
  function StrictCount(initial) {
    _classCallCheck(this, StrictCount);

    if (isNaN(initial)) throw new ReferenceError('Cannot initialize without numeric value');
    return _possibleConstructorReturn(this, (StrictCount.__proto__ || Object.getPrototypeOf(StrictCount)).call(this, initial));
  }
  /**
  * Adds a new value incrementation the history
  * @param {number} value - A non-negative integer (required)
  * @returns {number} The sum of the historical changes
  */


  _createClass(StrictCount, [{
    key: "incr",
    value: function incr(n) {
      if (isNaN(n)) throw new ReferenceError('Cannot set non-numeric value');
      if (n < 0) throw new ReferenceError('Cannot increment by negative value');
      return _get(StrictCount.prototype.__proto__ || Object.getPrototypeOf(StrictCount.prototype), "incr", this).call(this, n);
    }
    /**
    * Adds a new value decrementation the history
    * @param {number} value - A non-negative integer (required)
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "decr",
    value: function decr(n) {
      if (isNaN(n)) throw new ReferenceError('Cannot set non-numeric value');
      if (n < 0) throw new ReferenceError('Cannot decrement by negative value');
      return _get(StrictCount.prototype.__proto__ || Object.getPrototypeOf(StrictCount.prototype), "decr", this).call(this, n);
    }
    /**
    * Adds a new value to the history
    * @param {number} value - An integer (required)
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "set",
    value: function set(v) {
      if (isNaN(v)) throw new ReferenceError('Cannot set non-numeric value');
      return _get(StrictCount.prototype.__proto__ || Object.getPrototypeOf(StrictCount.prototype), "set", this).call(this, v);
    }
  }]);

  return StrictCount;
}(BaseCount);

var LoggingCount =
/*#__PURE__*/
function (_StrictCount) {
  _inherits(LoggingCount, _StrictCount);

  function LoggingCount() {
    _classCallCheck(this, LoggingCount);

    return _possibleConstructorReturn(this, (LoggingCount.__proto__ || Object.getPrototypeOf(LoggingCount)).apply(this, arguments));
  }

  _createClass(LoggingCount, [{
    key: "__defaultMessage",
    value: function __defaultMessage(v, message) {
      var prefix = this.length === 1 ? 'initialize to' : message ? message : v < 0 ? 'decrement by' : 'increment by';
      return [prefix, Math.abs(v)].join(' ');
    }
    /**
    * Adds a new value to the history
    * @param {number} value - An integer (required)
    * @param {string} message - A message associated with this modification (required)
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "set",
    value: function set(v, message, fn) {
      var _this2 = this;

      // fn = fn || 'set';
      var result = _get(LoggingCount.prototype.__proto__ || Object.getPrototypeOf(LoggingCount.prototype), "set", this).call(this, v);

      message = this.__defaultMessage(v, message);

      if (typeof v.log != 'undefined') {
        v.log.forEach(function (l, i) {
          loglines(_this2).push(l);
        });
      } else {
        loglines(this).push(message);
      }

      return result;
    }
    /**
    * Adds a new value incrementation the history
    * @param {number} value - A non-negative integer (required)
    * @param {string} message - A message associated with this modification (required)
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "incr",
    value: function incr(v, message) {
      return this.set(v, message);
    }
    /**
    * Adds a new value decrementation the history
    * @param {number} value - A non-negative integer (required)
    * @param {string} message - A message associated with this modification (required)
    * @returns {number} The sum of the historical changes
    */

  }, {
    key: "decr",
    value: function decr(v, message) {
      return this.set(-1 * Math.abs(v), message);
    }
    /**
    * Returns log of messages associated with value changes.
    * @returns {mixed} an array of messages or message arrays
    */

  }, {
    key: "reset",

    /**
    * Returns the history to the first value set, sets the first log entry as the entire log and adds a "reset" message
    * @returns {number} The sum of the historical changes (the initial value) 
    */
    value: function reset() {
      _get(LoggingCount.prototype.__proto__ || Object.getPrototypeOf(LoggingCount.prototype), "reset", this).call(this);

      var initial = histories(this)[0];
      var l = loglines(this);
      var first = Array.from(l);
      first.push('reset to ' + initial);
      l.splice(0, l.length);
      l.push(first);
      return this.get();
    }
  }, {
    key: "explain",
    value: function explain() {
      var explained = explanation(loglines(this), histories(this));

      if (/Then the value equals \d/.test(explained)) {
        return explained;
      }

      var total = this.get();
      var space = explained.split('\n').pop().replace(/^(\s+).+/, "$1");
      return explained + "\n".concat(space, "Then the value equals ").concat(total);
    }
  }, {
    key: "log",
    get: function get() {
      return Array.from(loglines(this));
    }
  }]);

  return LoggingCount;
}(StrictCount);
/**
 * Index Map
 * @const indexMap
 */


var indexMap = new Map();
var indexLinks = new Map();
var virtMap = new Map();

var CountIndex =
/*#__PURE__*/
function () {
  _createClass(CountIndex, null, [{
    key: "clear",
    value: function clear() {
      indexMap.clear();
      indexLinks.clear();
      virtMap.clear();
      return true;
    }
  }, {
    key: "clearIndex",
    value: function clearIndex(name) {
      indexMap.delete(name);
      indexLinks.delete(name);
      virtMap.delete(name);
      return true;
    }
  }, {
    key: "createIndex",
    value: function createIndex(name) {
      if (!this.map.has(name)) {
        var idMap = new Map();
        idMap.set('ids', new Map());
        this.map.set(name, idMap);
      }

      return new CountIndex(name);
    }
  }, {
    key: "createVirtual",
    value: function createVirtual(name, defaultValue) {
      if (!this.map.has(name)) {
        var idMap = new Map();
        idMap.set('ids', new Map());
        this.map.set(name, idMap);
      }

      virtMap.set(name, defaultValue);
      return new CountIndex(name);
    }
  }, {
    key: "index",
    value: function index(name) {
      return this.map.get(name);
    }
  }, {
    key: "exists",
    value: function exists(name) {
      return this.map.has(name);
    }
  }, {
    key: "getIds",
    value: function getIds(name) {
      if (!this.exists(name)) return [];
      return Array.from(this.index(name).get('ids').keys());
    }
  }, {
    key: "getCounts",
    value: function getCounts(name) {
      if (!this.exists(name)) return [];
      return Array.from(this.index(name).get('ids').values());
    }
  }, {
    key: "getTotal",
    value: function getTotal(name) {
      return this.getCounts(name).reduce(function (t, c) {
        return t + c;
      }, 0);
    }
  }, {
    key: "hasCount",
    value: function hasCount(name, id) {
      return this.map.has(name) && this.index(name).has('ids') && this.index(name).get('ids').has(id);
    }
  }, {
    key: "getCount",
    value: function getCount(name, id) {
      var _this3 = this;

      if (!this.hasCount(name, id)) {
        if (virtMap.has(name)) return virtMap.get(name);
        throw new ReferenceError('No index for "#' + id + '" @ "' + name + '".');
      }

      var count = this.map.get(name).get('ids').get(id);

      if (!indexLinks.has(name)) {
        return count;
      }

      var links = Array.from(indexLinks.get(name).values());
      return links.reduce(function (t, l) {
        return t - _this3.getCount(l, id);
      }, count); // console.log('lnk', linkName)
      // var linkCount = this.getCount(linkName, id );
      // return count - linkCount;
    }
  }, {
    key: "setCount",
    value: function setCount(name, id, value) {
      if (this.hasCount(name, id)) {
        throw new ReferenceError('Initial Count can only me set once for "#' + id + '" @ "' + name + '".');
      } else {
        return this.map.get(name).get('ids').set(id, new LoggingCount(value));
      }
    }
  }, {
    key: "incrCount",
    value: function incrCount(name, id, n) {
      if (!this.hasCount(name, id)) {
        if (virtMap.has(name)) {
          this.setCount(name, id, virtMap.get(name));
          return this.incrCount(name, id, n);
        }

        throw new ReferenceError('No count for id "' + id + '".');
      } else {
        return this.map.get(name).get('ids').get(id).incr(n);
      }
    }
  }, {
    key: "decrCount",
    value: function decrCount(name, id, n) {
      if (!this.hasCount(name, id)) {
        if (virtMap.has(name)) {
          this.setCount(name, id, virtMap.get(name));
          return this.decrCount(name, id, n);
        }

        throw new ReferenceError('No count for id "' + id + '".');
      } else {
        return this.map.get(name).get('ids').get(id).decr(n);
      }
    }
  }, {
    key: "resetCount",
    value: function resetCount(name, id) {
      if (!this.hasCount(name, id)) {
        return true; // throw new ReferenceError('No count for id "'+id+'".');
      } else {
        return this.map.get(name).get('ids').get(id).reset();
      }
    }
  }, {
    key: "getHistory",
    value: function getHistory(name, id) {
      if (!this.hasCount(name, id)) {
        throw new ReferenceError('No history for id "' + id + '".');
      } else {
        return this.map.get(name).get('ids').get(id).history;
      }
    }
  }, {
    key: "getLog",
    value: function getLog(name, id) {
      if (!this.hasCount(name, id)) {
        throw new ReferenceError('No log for id "' + id + '".');
      } else {
        return this.map.get(name).get('ids').get(id).log;
      }
    }
  }, {
    key: "explain",
    value: function explain(name, id) {
      if (!this.hasCount(name, id)) {
        throw new ReferenceError('No explanation for id "' + id + '".');
      } else {
        return this.map.get(name).get('ids').get(id).explain().replace('Scenario: Explain a Count', "Scenario: Explain " + name + " for the id " + id);
      }
    }
  }, {
    key: "link",
    value: function link(a, b) {
      if (!indexLinks.has(a)) {
        indexLinks.set(a, new Set());
      }

      indexLinks.get(a).add(b);
      return true;
    }
  }, {
    key: "map",
    get: function get() {
      return indexMap;
    }
  }]);

  function CountIndex(name) {
    _classCallCheck(this, CountIndex);

    this.name = name;
  }

  _createClass(CountIndex, [{
    key: "set",
    value: function set(id, initialCount) {
      return CountIndex.setCount(this.name, id, initialCount);
    }
  }, {
    key: "get",
    value: function get(id) {
      return CountIndex.getCount(this.name, id);
    }
  }, {
    key: "incr",
    value: function incr(id, n) {
      return CountIndex.incrCount(this.name, id, n);
    }
  }, {
    key: "decr",
    value: function decr(id, n) {
      return CountIndex.decrCount(this.name, id, n);
    }
  }, {
    key: "history",
    value: function history(id) {
      return CountIndex.getHistory(this.name, id);
    }
  }, {
    key: "log",
    value: function log(id) {
      return CountIndex.getLog(this.name, id);
    }
  }, {
    key: "explain",
    value: function explain(id) {
      return CountIndex.explain(this.name, id);
    }
  }, {
    key: "link",
    value: function link(name) {
      CountIndex.link(this.name, name);
      return true;
    }
  }, {
    key: "ids",
    get: function get() {
      return CountIndex.getIds(this.name);
    }
  }, {
    key: "counts",
    get: function get() {
      return CountIndex.getCounts(this.name);
    }
  }]);

  return CountIndex;
}();

var VirtualIndex =
/*#__PURE__*/
function (_CountIndex) {
  _inherits(VirtualIndex, _CountIndex);

  function VirtualIndex(name) {
    var _this4;

    _classCallCheck(this, VirtualIndex);

    _this4 = _possibleConstructorReturn(this, (VirtualIndex.__proto__ || Object.getPrototypeOf(VirtualIndex)).call(this, name));
    _this4.virtual = true;
    return _this4;
  }

  return VirtualIndex;
}(CountIndex);

module.exports = {
  CountIndex: CountIndex,
  Count: BaseCount,
  StrictCount: StrictCount,
  LoggingCount: LoggingCount
};


},{}]},{},[1])(1)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2hvbWUvZnJhbmtvLy5ucG0tcGFja2FnZXMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb21waWxlZC5qcyIsIi4uLy4uL2hvbWUvZnJhbmtvLy5ucG0tcGFja2FnZXMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcGVkYW50aWMtY291bnQvbm9kZV9tb2R1bGVzL3BlZGFudGljLWNvdW50L2NvbXBpbGVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNuREE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHsgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9OyB9IGVsc2UgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07IH0gcmV0dXJuIF90eXBlb2Yob2JqKTsgfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmIChjYWxsICYmIChfdHlwZW9mKGNhbGwpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7IHJldHVybiBjYWxsOyB9IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbnZhciBQZWRhbnRpY0NvdW50ID0gcmVxdWlyZSgncGVkYW50aWMtY291bnQnKTtcblxudmFyIGNhdE1hcCA9IG5ldyBNYXAoKTtcbnZhciB0eXBlTWFwID0gbmV3IE1hcCgpO1xudmFyIGRhdGFNYXAgPSBuZXcgTWFwKCk7XG52YXIgcHJvZHVjdEluc3RhbmNlcyA9IG5ldyBNYXAoKTtcbnZhciBidWNrZXRJbnN0YW5jZXMgPSBuZXcgTWFwKCk7XG52YXIgY2FydE1hcCA9IG5ldyBXZWFrTWFwKCk7XG52YXIgY291bnRlcnNNYXAgPSBuZXcgV2Vha01hcCgpO1xudmFyIGNob2ljZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG52YXIgc2hpcHBpbmdDb3N0cyA9IG5ldyBNYXAoKTtcbnNoaXBwaW5nQ29zdHMuc2V0KCdmdXJuaXR1cmUnLCB7XG4gIG1pbjogNTAwLFxuICBiZWxvdzogWzY1LCAxNTAsIDI1MF0sXG4gIGFib3ZlOiBbMCwgODUsIDE1MF1cbn0pO1xuc2hpcHBpbmdDb3N0cy5zZXQoJ3NtYWxsLWZ1cm5pdHVyZScsIHtcbiAgbWluOiA1MDAsXG4gIGJlbG93OiBbMTgsIDI1LCAyOF0sXG4gIGFib3ZlOiBbMCwgMTAsIDE1XVxufSk7XG5zaGlwcGluZ0Nvc3RzLnNldCgnYWNjZXNzb3JpZXMnLCB7XG4gIG1pbjogNTAsXG4gIGJlbG93OiBbMTUsIDE1LCAxNV0sXG4gIGFib3ZlOiBbMCwgMCwgMF1cbn0pO1xuXG52YXIgQ2FydCA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENhcnQoY291bnRzLCBjYXJ0KSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhcnQpO1xuXG4gICAgdGhpcy50b2tlbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5wcm9kdWN0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLnpvbmUgPSBudWxsO1xuICAgIHRoaXMuZGlzY291bnRzID0gW107XG4gICAgdGhpcy51c2VyTGV2ZWwgPSBmYWxzZTtcbiAgICBjb3VudGVyc01hcC5zZXQodGhpcywgY291bnRzKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhDYXJ0LCBbe1xuICAgIGtleTogXCJzZXRVc2VyTGV2ZWxcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0VXNlckxldmVsKHVzZXJMZXZlbCkge1xuICAgICAgcmV0dXJuIHRoaXMudXNlckxldmVsID0gdXNlckxldmVsO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJhZGRDb3Vwb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkQ291cG9uKHBlcmNlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2NvdW50cy5wdXNoKHBlcmNlbnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVDb3Vwb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlQ291cG9uKHBlcmNlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc2NvdW50cyA9IHRoaXMuZGlzY291bnRzLmZpbHRlcihmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gZCAhPT0gcGVyY2VudDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZXRab25lXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFpvbmUoc3RyaW5nKSB7XG4gICAgICB0aGlzLnpvbmUgPSBzdHJpbmcgPT0gJ3pvbmUtMScgPyAwIDogc3RyaW5nID09ICd6b25lLTInID8gMSA6IDI7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2V0Wm9uZUZyb21Qb3N0YWxDb2RlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFpvbmVGcm9tUG9zdGFsQ29kZShwb3N0Y29kZSkge1xuICAgICAgcG9zdGNvZGUgPSBwb3N0Y29kZS50b1VwcGVyQ2FzZSgpLnRyaW0oKTtcbiAgICAgIHZhciB6b25lc190YWJsZSA9IHtcbiAgICAgICAgJ3pvbmUtMSc6IC9eKEguLnxHMS58TS4ufEsxLnxUMi58VDMufFQ1LnxUNi58VjUufFY2LnxDMUF8UjIufFIzLnxFMi58RTEufEUzLnxCMy58UzcufFM0LnxBMS58SjQuKS4rJC8sXG4gICAgICAgICd6b25lLTMnOiAvXihKfEd8S3xMfE58UHxUfFZ8Q3xSfEV8QnxTfEF8WXxYKTAuKyQvXG4gICAgICB9O1xuXG4gICAgICBpZiAoIS9eKFthLXpBLVpdXFxkW2EtekEtWl1cXHM/XFxkW2EtekEtWl1cXGQpJC8udGVzdChwb3N0Y29kZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0Wm9uZSgnem9uZS0zJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBmb3VuZCA9ICd6b25lLTInO1xuICAgICAgT2JqZWN0LmtleXMoem9uZXNfdGFibGUpLmZvckVhY2goZnVuY3Rpb24gKHpvbmUpIHtcbiAgICAgICAgdmFyIHJlZ2V4ID0gem9uZXNfdGFibGVbem9uZV07XG5cbiAgICAgICAgaWYgKHJlZ2V4LnRlc3QocG9zdGNvZGUpKSB7XG4gICAgICAgICAgZm91bmQgPSB6b25lO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnNldFpvbmUoZm91bmQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYXNQcm9kdWN0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhc1Byb2R1Y3QoaWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb2R1Y3RzLmhhcyh0eXBlb2YgaWQgPT0gJ251bWJlcicgPyBpZCA6IGlkLmlkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaW5jckl0ZW1RdWFudGl0eVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbmNySXRlbVF1YW50aXR5KGNhcnRJdGVtLCBxdHkpIHtcbiAgICAgIGNhcnRJdGVtLnVwZGF0ZUNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lICE9PSAncXVhbnRpdHknKSB7XG4gICAgICAgICAgdmFyIG9wdGlvbiA9IGNob2ljZS5nZXRPcHRpb24oY2FydEl0ZW0uY2hvaWNlc1tuYW1lXSk7XG5cbiAgICAgICAgICBpZiAob3B0aW9uIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICAgICBvcHRpb24uZm9yRWFjaChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICBvLmluY3JDYXJ0Q291bnQocXR5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcHRpb24uaW5jckNhcnRDb3VudChxdHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjYXJ0SXRlbS5jaG9pY2VzLnF1YW50aXR5ICs9IHF0eTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJkZWNySXRlbVF1YW50aXR5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlY3JJdGVtUXVhbnRpdHkoY2FydEl0ZW0sIHF0eSkge1xuICAgICAgLy8gY29uc29sZS5sb2coJ0RFQ1InKVxuICAgICAgY2FydEl0ZW0udXBkYXRlQ2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUgIT09ICdxdWFudGl0eScpIHtcbiAgICAgICAgICB2YXIgb3B0aW9uID0gY2hvaWNlLmdldE9wdGlvbihjYXJ0SXRlbS5jaG9pY2VzW25hbWVdKTtcblxuICAgICAgICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBTZXQpIHtcbiAgICAgICAgICAgIG9wdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgICAgICAgIG8uZGVjckNhcnRDb3VudChxdHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvbi5kZWNyQ2FydENvdW50KHF0eSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNhcnRJdGVtLmNob2ljZXMucXVhbnRpdHkgLT0gcXR5O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImFkZEl0ZW1cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkSXRlbShwcm9kdWN0KSB7XG4gICAgICB2YXIgaXQgPSB0aGlzO1xuICAgICAgdmFyIHNlbGVjdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9kdWN0LnNlbGVjdGlvbnMpO1xuICAgICAgdmFyIGlkID0gcHJvZHVjdC5pZDtcbiAgICAgIHZhciBxdHkgPSBzZWxlY3Rpb25zLnF1YW50aXR5O1xuICAgICAgZGVsZXRlIHNlbGVjdGlvbnMucXVhbnRpdHk7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgaWQ6IGlkLFxuICAgICAgICBjaG9pY2VzOiBzZWxlY3Rpb25zLFxuICAgICAgICB1bml0UHJpY2U6IHByb2R1Y3QuY3VycmVudFByaWNlXG4gICAgICB9O1xuICAgICAgdmFyIHRva2VuID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgICBPYmplY3QuYXNzaWduKGRhdGEuY2hvaWNlcywge1xuICAgICAgICBxdWFudGl0eTogMFxuICAgICAgfSk7XG4gICAgICB2YXIgY2FydEl0ZW0gPSBPYmplY3QuYXNzaWduKGRhdGEsIHtcbiAgICAgICAgdG9rZW46IHRva2VuLFxuICAgICAgICBjaG9pY2VzOiBkYXRhLmNob2ljZXMsXG4gICAgICAgIHNoaXBwaW5nQ2xhc3M6IHByb2R1Y3Quc2hpcHBpbmdDbGFzcyxcbiAgICAgICAgdXBkYXRlQ2hvaWNlczogcHJvZHVjdC5jaG9pY2VzLFxuICAgICAgICBpbmNyOiBmdW5jdGlvbiBpbmNyKHF0eSkge1xuICAgICAgICAgIHJldHVybiAhIWl0LmluY3JJdGVtUXVhbnRpdHkoY2FydEl0ZW0sIHF0eSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlY3I6IGZ1bmN0aW9uIGRlY3IocXR5KSB7XG4gICAgICAgICAgcmV0dXJuICEhaXQuZGVjckl0ZW1RdWFudGl0eShjYXJ0SXRlbSwgcXR5KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUocXR5KSB7XG4gICAgICAgICAgcmV0dXJuICEhaXQucmVtb3ZlSXRlbShjYXJ0SXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoY2FydEl0ZW0sIHtcbiAgICAgICAgbWluUmVndWxhclByaWNlOiB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICB2YXIgcXR5ID0gdGhpcy5jaG9pY2VzLnF1YW50aXR5ID09PSAwID8gMSA6IHRoaXMuY2hvaWNlcy5xdWFudGl0eTtcbiAgICAgICAgICAgIHJldHVybiBwcm9kdWN0Lm1pblJlZ3VsYXJQcmljZSAqIHF0eTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1heFJlZ3VsYXJQcmljZToge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgdmFyIHF0eSA9IHRoaXMuY2hvaWNlcy5xdWFudGl0eSA9PT0gMCA/IDEgOiB0aGlzLmNob2ljZXMucXVhbnRpdHk7XG4gICAgICAgICAgICByZXR1cm4gcHJvZHVjdC5tYXhSZWd1bGFyUHJpY2UgKiBxdHk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtaW5QcmljZToge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgdmFyIHF0eSA9IHRoaXMuY2hvaWNlcy5xdWFudGl0eSA9PT0gMCA/IDEgOiB0aGlzLmNob2ljZXMucXVhbnRpdHk7XG4gICAgICAgICAgICByZXR1cm4gcHJvZHVjdC5taW5QcmljZSAqIHF0eTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1heFByaWNlOiB7XG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICB2YXIgcXR5ID0gdGhpcy5jaG9pY2VzLnF1YW50aXR5ID09PSAwID8gMSA6IHRoaXMuY2hvaWNlcy5xdWFudGl0eTtcbiAgICAgICAgICAgIHJldHVybiBwcm9kdWN0Lm1heFByaWNlICogcXR5O1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaXRlbUNvc3Q6IHtcbiAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgIHZhciBxdHkgPSB0aGlzLmNob2ljZXMucXVhbnRpdHkgPT09IDAgPyAxIDogdGhpcy5jaG9pY2VzLnF1YW50aXR5O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudW5pdFByaWNlICogcXR5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICghdGhpcy5wcm9kdWN0cy5oYXMoaWQpKSB7XG4gICAgICAgIHRoaXMucHJvZHVjdHMuc2V0KGlkLCBbXSk7XG4gICAgICB9IC8vIE9iamVjdC5hc3NpZ24oY2FydEl0ZW0uY2hvaWNlcywgZGF0YS5jaG9pY2VzLCB7IHF1YW50aXR5OiAwIH0pO1xuXG5cbiAgICAgIHRoaXMucHJvZHVjdHMuZ2V0KGlkKS5wdXNoKHRva2VuKTtcbiAgICAgIHRoaXMudG9rZW5zLnNldCh0b2tlbiwgY2FydEl0ZW0pO1xuICAgICAgY2FydEl0ZW0uaW5jcihxdHkpOyAvLyBjb25zb2xlLmxvZygnY2FydCBub3cgaGFzICVkIGl0ZW1zJywgdGhpcy50b2tlbnMuc2l6ZSApXG5cbiAgICAgIHJldHVybiB0aGlzLnRva2Vucy5nZXQodG9rZW4pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZW1vdmVJdGVtXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUl0ZW0oY2FydEl0ZW0pIHtcbiAgICAgIGNhcnRJdGVtLmRlY3IoY2FydEl0ZW0uY2hvaWNlcy5xdWFudGl0eSk7XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy5wcm9kdWN0cy5nZXQoY2FydEl0ZW0uaWQpO1xuICAgICAgdmFyIG5ld1Rva2VucyA9IHRva2Vucy5maWx0ZXIoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuIHQgIT09IGNhcnRJdGVtLnRva2VuO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChuZXdUb2tlbnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdGhpcy5wcm9kdWN0cy5kZWxldGUoY2FydEl0ZW0uaWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm9kdWN0cy5zZXQoY2FydEl0ZW0uaWQsIG5ld1Rva2Vucyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG9rZW5zLmRlbGV0ZShjYXJ0SXRlbS50b2tlbik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVzZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB0aGlzLnRva2Vucy5mb3JFYWNoKGZ1bmN0aW9uIChjYXJ0SXRlbSkge1xuICAgICAgICBfdGhpcy5yZW1vdmVJdGVtKGNhcnRJdGVtKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy56b25lID0gbnVsbDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJkaXNjb3VudENvc3RcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5pdGVtQ29zdCA8PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgdXNlckxldmVsRGlzY291bnQgPSAhdGhpcy51c2VyTGV2ZWwgPyAwIDogdGhpcy51c2VyTGV2ZWwgPT09ICdWSVAnID8gMC4wNSA6IHRoaXMudXNlckxldmVsID09PSAnVlZJUCcgPyAwLjEwIDogdGhpcy51c2VyTGV2ZWwgPT09ICdWVlZJUCcgPyAwLjE1IDogMDtcbiAgICAgIHJldHVybiBbdXNlckxldmVsRGlzY291bnRdLmNvbmNhdCh0aGlzLmRpc2NvdW50cykucmVkdWNlKGZ1bmN0aW9uICh0LCBkKSB7XG4gICAgICAgIHJldHVybiBkID09PSAwID8gdCA6IHQgKyBfdGhpczIuaXRlbUNvc3QgKiAtZDtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzaGlwcGluZ1pvbmVcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLnpvbmUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICduL2EnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gXCJ6b25lLVwiLmNvbmNhdCh0aGlzLnpvbmUgKyAxKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidG90YWxcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciB0ID0gdGhpcy5pdGVtQ29zdCArIHRoaXMudGF4Q29zdCArIHRoaXMuc2hpcHBpbmdDb3N0ICsgdGhpcy5kaXNjb3VudENvc3Q7XG4gICAgICBpZiAoaXNOYU4odCkpIHJldHVybiAnbi9hJztcbiAgICAgIHJldHVybiB0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ0YXhDb3N0XCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy56b25lID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAnbi9hJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuaXRlbUNvc3QgPT0gMCA/IDAgOiB0aGlzLml0ZW1Db3N0ICogMC4xNTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2hpcHBpbmdDb3N0XCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy56b25lID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAnbi9hJztcbiAgICAgIH1cblxuICAgICAgdmFyIHpvbmUgPSB0aGlzLnpvbmU7XG4gICAgICB2YXIgaXRlbUNvc3QgPSB0aGlzLml0ZW1Db3N0O1xuICAgICAgdmFyIHNoaXBwaW5nQ2xhc3MgPSAnYWNjZXNzb3JpZXMnO1xuICAgICAgdGhpcy50b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAoY2FydEl0ZW0sIHRva2VuKSB7XG4gICAgICAgIHZhciBzY2xhc3MgPSBjYXJ0SXRlbS5zaGlwcGluZ0NsYXNzOyAvLyBjb25zb2xlLmxvZyhzY2xhc3MpXG5cbiAgICAgICAgaWYgKHNoaXBwaW5nQ2xhc3MgPT0gJ2FjY2Vzc29yaWVzJyAmJiBzY2xhc3MgPT0gJ3NtYWxsLWZ1cm5pdHVyZScpIHtcbiAgICAgICAgICBzaGlwcGluZ0NsYXNzID0gc2NsYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChzaGlwcGluZ0NsYXNzID09ICdzbWFsbC1mdXJuaXR1cmUnIHx8IHNoaXBwaW5nQ2xhc3MgPT0gJ2FjY2Vzc29yaWVzJykgJiYgc2NsYXNzID09ICdmdXJuaXR1cmUnKSB7XG4gICAgICAgICAgc2hpcHBpbmdDbGFzcyA9IHNjbGFzcztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB2YXIgcnVsZXMgPSBzaGlwcGluZ0Nvc3RzLmdldChzaGlwcGluZ0NsYXNzKTsgLy8gY29uc29sZS5sb2coY3VycmVudFByaWNlID49IHJ1bGVzLm1pbiA/ICdhYm92ZScgOiAnYmVsbG93JywgY3VycmVudFByaWNlLCBydWxlcy5taW4gKVxuXG4gICAgICBpZiAoaXRlbUNvc3QgPj0gcnVsZXMubWluKSB7XG4gICAgICAgIHJldHVybiBydWxlcy5hYm92ZVt6b25lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBydWxlcy5iZWxvd1t6b25lXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicHJvZHVjdENvdW50XCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9kdWN0cy5zaXplO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpdGVtQ291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnRva2Vucy5zaXplO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpdGVtQ29zdFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHRvdGFsID0gMC4wO1xuICAgICAgdGhpcy50b2tlbnMuZm9yRWFjaChmdW5jdGlvbiAoY2FydEl0ZW0sIHQpIHtcbiAgICAgICAgdG90YWwgKz0gY2FydEl0ZW0uaXRlbUNvc3Q7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0b3RhbDtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ2FydDtcbn0oKTtcblxudmFyIFByb2R1Y3QgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBQcm9kdWN0KGlkLCBjb3VudHMsIGNhcnQpIHtcbiAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBQcm9kdWN0KTtcblxuICAgIHRoaXMuaWQgPSBpZDtcbiAgICBjYXJ0TWFwLnNldCh0aGlzLCBjYXJ0KTtcbiAgICBjb3VudGVyc01hcC5zZXQodGhpcywgY291bnRzKTtcbiAgICB2YXIgdmlkcyA9IGRhdGFNYXAuZ2V0KHRoaXMuaWQpLnZhcmlhdGlvbnM7XG5cbiAgICBpZiAodmlkcyAmJiB2aWRzLmxlbmd0aCkge1xuICAgICAgdmlkcy5mb3JFYWNoKGZ1bmN0aW9uICh2aWQpIHtcbiAgICAgICAgcHJvZHVjdEluc3RhbmNlcy5zZXQodmlkLCBuZXcgUHJvZHVjdC5WYXJpYXRpb24odmlkLCBfdGhpczMsIGNvdW50cykpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICduYW1lJywge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0aGlzLm5hbWVcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2Rlc2NyaXB0aW9uJywge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0aGlzLmRlc2NyaXB0aW9uXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpbWFnZScsIHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogdGhpcy5pbWFnZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaW1hZ2VzJywge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0aGlzLmltYWdlc1xuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndHlwZScsIHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogdGhpcy50eXBlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd3aXJlZnJhbWUnLCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IHRoaXMud2lyZWZyYW1lXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdhbmF0b215Jywge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0aGlzLmFuYXRvbXlcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3doeV93ZV9sb3ZlJywge1xuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHZhbHVlOiB0aGlzLndoeV93ZV9sb3ZlXG4gICAgfSk7IC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21pblJlZ3VsYXJQcmljZScsIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcy5taW5SZWd1bGFyUHJpY2UgfSApO1xuICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heFJlZ3VsYXJQcmljZScsIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcy5tYXhSZWd1bGFyUHJpY2UgfSApO1xuICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heFNhbGVQcmljZScsIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcy5tYXhTYWxlUHJpY2UgfSApO1xuICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcywgJ21heFNhbGVQcmljZScsIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcy5tYXhTYWxlUHJpY2UgfSApO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFByb2R1Y3QsIFt7XG4gICAga2V5OiBcImhhc0J1Y2tldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNCdWNrZXQobmFtZSkge1xuICAgICAgcmV0dXJuIGJ1Y2tldEluc3RhbmNlcy5oYXMobmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldEJ1Y2tldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRCdWNrZXQobmFtZSkge1xuICAgICAgcmV0dXJuIGJ1Y2tldEluc3RhbmNlcy5nZXQobmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImhhc1ZhcmlhdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNWYXJpYXRpb24obmFtZSkge1xuICAgICAgdmFyIGlkeCA9IGRhdGFNYXAuZ2V0KHRoaXMuaWQpLnZhcmlhdGlvbnMuZmluZEluZGV4KGZ1bmN0aW9uICh2aWQpIHtcbiAgICAgICAgcmV0dXJuIHByb2R1Y3RJbnN0YW5jZXMuZ2V0KHZpZCkubmFtZSA9PSBuYW1lO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gISF+aWR4O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRWYXJpYXRpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VmFyaWF0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBpZHggPSBkYXRhTWFwLmdldCh0aGlzLmlkKS52YXJpYXRpb25zLmZpbmRJbmRleChmdW5jdGlvbiAodmlkKSB7XG4gICAgICAgIHJldHVybiBwcm9kdWN0SW5zdGFuY2VzLmdldCh2aWQpLm5hbWUgPT0gbmFtZTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAofmlkeCkge1xuICAgICAgICB2YXIgdmlkID0gZGF0YU1hcC5nZXQodGhpcy5pZCkudmFyaWF0aW9uc1tpZHhdO1xuICAgICAgICByZXR1cm4gcHJvZHVjdEluc3RhbmNlcy5nZXQodmlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2hpcHBpbmdDbGFzc1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuICdmdXJuaXR1cmUnO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJuYW1lXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gZGF0YU1hcC5nZXQodGhpcy5pZCkubmFtZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzY3JpcHRpb25cIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBkYXRhTWFwLmdldCh0aGlzLmlkKS5kZXNjcmlwdGlvbjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwid2h5X3dlX2xvdmVcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRpdGxlOiB0aGlzLm1ldGEud2h5X3dlX2xvdmVfdGl0bGUsXG4gICAgICAgIGNvbnRlbnQ6IHRoaXMubWV0YS53aHlfd2VfbG92ZV9jb250ZW50XG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ3aXJlZnJhbWVcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICghdGhpcy5tZXRhLndpcmVmcmFtZSkgcmV0dXJuIHtcbiAgICAgICAgc3JjOiBudWxsLFxuICAgICAgICBjb2xvcnM6IFtdXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3JjOiB0aGlzLm1ldGEud2lyZWZyYW1lLnNyYyxcbiAgICAgICAgY29sb3JzOiB0aGlzLm1ldGEud2lyZWZyYW1lLmNvbG9ycyB8fCBbXVxuICAgICAgfTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYW5hdG9teVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGVuZnIgPSB7fTtcblxuICAgICAgaWYgKCF0aGlzLm1ldGEuYW5hdG9teV9lbikge1xuICAgICAgICBlbmZyLmVuID0ge1xuICAgICAgICAgIHNyYzogbnVsbCxcbiAgICAgICAgICBjb2xvcnM6IFtdXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbmZyLmVuID0ge1xuICAgICAgICAgIHNyYzogdGhpcy5tZXRhLmFuYXRvbXlfZW4uc3JjLFxuICAgICAgICAgIGNvbG9yczogdGhpcy5tZXRhLmFuYXRvbXlfZW4uY29sb3JzIHx8IFtdXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5tZXRhLmFuYXRvbXlfZnIpIHtcbiAgICAgICAgZW5mci5mciA9IHtcbiAgICAgICAgICBzcmM6IG51bGwsXG4gICAgICAgICAgY29sb3JzOiBbXVxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5mci5mciA9IHtcbiAgICAgICAgICBzcmM6IHRoaXMubWV0YS5hbmF0b215X2ZyLnNyYyxcbiAgICAgICAgICBjb2xvcnM6IHRoaXMubWV0YS5hbmF0b215X2ZyLmNvbG9ycyB8fCBbXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZW5mcjtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYmFzZVByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAoIXRoaXMubWV0YS5iYXNlX3ByaWNlICYmIDEgKiB0aGlzLm1ldGEuYmFzZV9wcmljZSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMubWV0YS5iYXNlX3ByaWNlKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWV0YVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIG1ldGFfYm94ID0gZGF0YU1hcC5nZXQodGhpcy5pZCkubWV0YV9ib3g7XG5cbiAgICAgIGlmICghbWV0YV9ib3gpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMobWV0YV9ib3gpLnJlZHVjZShmdW5jdGlvbiAoa2VlcCwga2V5KSB7XG4gICAgICAgIGlmICgvZWRiXy8udGVzdChrZXkpKSB7XG4gICAgICAgICAga2VlcFtrZXkucmVwbGFjZSgvZWRiXy8sICcnKV0gPSBtZXRhX2JveFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGtlZXBba2V5LnJlcGxhY2UoL15fLywgJycpXSA9IG1ldGFfYm94W2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ga2VlcDtcbiAgICAgIH0sIHt9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaW1hZ2VcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBpbWFnZXMgPSBkYXRhTWFwLmdldCh0aGlzLmlkKS5pbWFnZXM7XG5cbiAgICAgIGlmIChpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3JjOiBpbWFnZXNbMF0uc3JjLFxuICAgICAgICAgIGNvbG9yczogaW1hZ2VzWzBdLmNvbG9ycyB8fCBbXVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzcmM6IG51bGwsXG4gICAgICAgIGNvbG9yczogW11cbiAgICAgIH07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImltYWdlc1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGltYWdlcyA9IGRhdGFNYXAuZ2V0KHRoaXMuaWQpLmltYWdlcztcblxuICAgICAgaWYgKGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGltYWdlcy5zbGljZSgxKS5tYXAoZnVuY3Rpb24gKGltZykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzcmM6IGltZy5zcmMsXG4gICAgICAgICAgICBjb2xvcnM6IGltZy5jb2xvcnMgfHwgW11cbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ0eXBlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdHlwZU1hcC5nZXQodGhpcy5pZCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1pblJlZ3VsYXJQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGNob2ljZVByaWNlID0gbmV3IFBlZGFudGljQ291bnQuTG9nZ2luZ0NvdW50KDApO1xuXG4gICAgICBpZiAodGhpcy5jaG9pY2VzKSB7XG4gICAgICAgIHRoaXMuY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjaG9pY2UubWluUmVndWxhclByaWNlKVxuICAgICAgICAgIGlmIChuYW1lICE9PSAncXVhbnRpdHknKSB7XG4gICAgICAgICAgICBjaG9pY2VQcmljZS5pbmNyKGNob2ljZS5taW5SZWd1bGFyUHJpY2UsIFwiYWRkIFwiLmNvbmNhdChjaG9pY2UubmFtZSwgXCIncyBtaW4gcmVndWxhciBwcmljZSBvZiAkXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5iYXNlUHJpY2UgIT09IG51bGwpIHtcbiAgICAgICAgY2hvaWNlUHJpY2UuaW5jcih0aGlzLmJhc2VQcmljZSwgXCJhZGQgdGhlIGJhc2UgdW5pdCBwcmljZSBvZiAkXCIuY29uY2F0KHRoaXMuYmFzZVByaWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VQcmljZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWF4UmVndWxhclByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgY2hvaWNlUHJpY2UgPSBuZXcgUGVkYW50aWNDb3VudC5Mb2dnaW5nQ291bnQoMCk7XG5cbiAgICAgIGlmICh0aGlzLmNob2ljZXMpIHtcbiAgICAgICAgdGhpcy5jaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgbmFtZSkge1xuICAgICAgICAgIGlmIChuYW1lICE9PSAncXVhbnRpdHknKSB7XG4gICAgICAgICAgICBjaG9pY2VQcmljZS5pbmNyKGNob2ljZS5tYXhSZWd1bGFyUHJpY2UsIFwiYWRkIFwiLmNvbmNhdChjaG9pY2UubmFtZSwgXCIncyBtYXggcmVndWxhciBwcmljZSBvZiAkXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5iYXNlUHJpY2UgIT09IG51bGwpIHtcbiAgICAgICAgY2hvaWNlUHJpY2UuaW5jcih0aGlzLmJhc2VQcmljZSwgXCJhZGQgdGhlIGJhc2UgdW5pdCBwcmljZSBvZiAkXCIuY29uY2F0KHRoaXMuYmFzZVByaWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VQcmljZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWluU2FsZVByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgY2hvaWNlUHJpY2UgPSBuZXcgUGVkYW50aWNDb3VudC5Mb2dnaW5nQ291bnQoMCk7XG5cbiAgICAgIGlmICh0aGlzLmNob2ljZXMpIHtcbiAgICAgICAgdGhpcy5jaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgbmFtZSkge1xuICAgICAgICAgIGlmIChuYW1lICE9PSAncXVhbnRpdHknKSB7XG4gICAgICAgICAgICBjaG9pY2VQcmljZS5pbmNyKGNob2ljZS5taW5TYWxlUHJpY2UsIFwiYWRkIFwiLmNvbmNhdChjaG9pY2UubmFtZSwgXCIncyBtaW4gc2FsZSBwcmljZSBvZiAkXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5iYXNlUHJpY2UgIT09IG51bGwpIHtcbiAgICAgICAgY2hvaWNlUHJpY2UuaW5jcih0aGlzLmJhc2VQcmljZSwgXCJhZGQgdGhlIGJhc2UgdW5pdCBwcmljZSBvZiAkXCIuY29uY2F0KHRoaXMuYmFzZVByaWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VQcmljZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWF4U2FsZVByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgY2hvaWNlUHJpY2UgPSBuZXcgUGVkYW50aWNDb3VudC5Mb2dnaW5nQ291bnQoMCk7XG5cbiAgICAgIGlmICh0aGlzLmNob2ljZXMpIHtcbiAgICAgICAgdGhpcy5jaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgbmFtZSkge1xuICAgICAgICAgIGlmIChuYW1lICE9PSAncXVhbnRpdHknKSB7XG4gICAgICAgICAgICBjaG9pY2VQcmljZS5pbmNyKGNob2ljZS5tYXhTYWxlUHJpY2UsIFwiYWRkIFwiLmNvbmNhdChjaG9pY2UubmFtZSwgXCIncyBtYXggc2FsZSBwcmljZSBvZiAkXCIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5iYXNlUHJpY2UgIT09IG51bGwpIHtcbiAgICAgICAgY2hvaWNlUHJpY2UuaW5jcih0aGlzLmJhc2VQcmljZSwgXCJhZGQgdGhlIGJhc2UgdW5pdCBwcmljZSBvZiAkXCIuY29uY2F0KHRoaXMuYmFzZVByaWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VQcmljZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWluUHJpY2VcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbih0aGlzLm1pblNhbGVQcmljZSwgdGhpcy5taW5SZWd1bGFyUHJpY2UpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJtYXhQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMubWF4U2FsZVByaWNlLCB0aGlzLm1heFJlZ3VsYXJQcmljZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImN1cnJlbnRQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGNob2ljZVByaWNlID0gbmV3IFBlZGFudGljQ291bnQuTG9nZ2luZ0NvdW50KDApO1xuXG4gICAgICBpZiAodGhpcy5jaG9pY2VzKSB7XG4gICAgICAgIHRoaXMuY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgICBpZiAobmFtZSAhPT0gJ3F1YW50aXR5Jykge1xuICAgICAgICAgICAgaWYgKGNob2ljZS5zZWxlY3RlZE9wdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBjaG9pY2VQcmljZS5pbmNyKGNob2ljZS5zZWxlY3RlZE9wdGlvbi5wcmljZSwgXCJhZGQgXCIuY29uY2F0KGNob2ljZS5uYW1lLCBcIidzIGN1cnJlbnQgcHJpY2Ugb2YgJFwiKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjaG9pY2VQcmljZS5pbmNyKGNob2ljZS5taW5QcmljZSwgXCJhZGQgXCIuY29uY2F0KGNob2ljZS5uYW1lLCBcIidzIG1heCBvZiAkXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5iYXNlUHJpY2UgIT09IG51bGwpIHtcbiAgICAgICAgY2hvaWNlUHJpY2UuaW5jcih0aGlzLmJhc2VQcmljZSwgXCJhZGQgdGhlIGJhc2UgdW5pdCBwcmljZSBvZiAkXCIuY29uY2F0KHRoaXMuYmFzZVByaWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9pY2VQcmljZTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUHJvZHVjdDtcbn0oKTtcblxuUHJvZHVjdC5WYXJpYXRpb24gPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBfY2xhc3MoaWQsIHBhcmVudCwgY291bnRzKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIF9jbGFzcyk7XG5cbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgY291bnRlcnNNYXAuc2V0KHRoaXMsIGNvdW50cyk7IC8vIHByb2R1Y3RJbnN0YW5jZXMuc2V0KHRoaXMuaWQsIHRoaXMgKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhfY2xhc3MsIFt7XG4gICAga2V5OiBcInNlbGVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3QocXR5KSB7XG4gICAgICByZXR1cm4gY291bnRlcnNNYXAuZ2V0KHRoaXMpLmluY3JDb3VudCgnc2VsZWN0ZWRDb3VudCcsIHRoaXMuaWQsIHF0eSwgXCJzZWxlY3QgYSBxdWFudGl0eSBmb3IgdmFyaWF0aW9uICNcIi5jb25jYXQodGhpcy5pZCwgXCIgb2ZcIikpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ1bnNlbGVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bnNlbGVjdChxdHkpIHtcbiAgICAgIHJldHVybiBjb3VudGVyc01hcC5nZXQodGhpcykuZGVjckNvdW50KCdzZWxlY3RlZENvdW50JywgdGhpcy5pZCwgcXR5KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaW5jckNhcnRDb3VudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbmNyQ2FydENvdW50KHF0eSkge1xuICAgICAgcmV0dXJuIGNvdW50ZXJzTWFwLmdldCh0aGlzKS5pbmNyQ291bnQoJ2NhcnRDb3VudCcsIHRoaXMuaWQsIHF0eSwgXCJhZGRlZCB0byBjYXJ0IGEgcXVhbnRpdHkgZm9yIHZhcmlhdGlvbiAjXCIuY29uY2F0KHRoaXMuaWQsIFwiIG9mXCIpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZGVjckNhcnRDb3VudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWNyQ2FydENvdW50KHF0eSkge1xuICAgICAgcmV0dXJuIGNvdW50ZXJzTWFwLmdldCh0aGlzKS5kZWNyQ291bnQoJ2NhcnRDb3VudCcsIHRoaXMuaWQsIHF0eSwgXCJyZW1vdmVkIGZyb20gY2FydCBhIHF1YW50aXR5IGZvciB2YXJpYXRpb24gI1wiLmNvbmNhdCh0aGlzLmlkLCBcIiBvZlwiKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm5hbWVcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBhdHRyID0gZGF0YU1hcC5nZXQodGhpcy5pZCkuYXR0cmlidXRlcztcbiAgICAgIHZhciBuYW1lID0gT2JqZWN0LmtleXMoYXR0cikucmVkdWNlKGZ1bmN0aW9uIChmb3VuZCwgaykge1xuICAgICAgICBpZiAoZm91bmQpIHJldHVybiBmb3VuZDtcbiAgICAgICAgdmFyIGEgPSBhdHRyW2tdO1xuXG4gICAgICAgIGlmICgvZWRiLy50ZXN0KGspKSB7XG4gICAgICAgICAgZm91bmQgPSBhLnJlcGxhY2UoL15lZGJfLywgJycpLnJlcGxhY2UoL18vZywgJy0nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3VuZDtcbiAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHJldHVybiAnVW5rbm93bic7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZWd1bGFyUHJpY2VcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGRhdGFNYXAuZ2V0KHRoaXMuaWQpLmRpc3BsYXlfcmVndWxhcl9wcmljZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNhbGVQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGRpc3AgPSBkYXRhTWFwLmdldCh0aGlzLmlkKS5kaXNwbGF5X3ByaWNlO1xuICAgICAgcmV0dXJuIGRpc3AgPCB0aGlzLnJlZ3VsYXJQcmljZSA/IGRpc3AgOiBudWxsO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJwcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2FsZVByaWNlID09PSBudWxsID8gdGhpcy5yZWd1bGFyUHJpY2UgOiB0aGlzLnNhbGVQcmljZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0ZWRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiAhIXRoaXMuaXNTZWxlY3RlZDtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGJvb2wpIHtcbiAgICAgIHZhciB3YXNTZWxlY3RlZCA9IHRoaXMuaXNTZWxlY3RlZDtcblxuICAgICAgaWYgKHdhc1NlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMudW5zZWxlY3QodGhpcy5zZWxlY3RlZENvdW50KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc1NlbGVjdGVkID0gISFib29sO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInN0b2NrQ291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLnBhcmVudC50eXBlID09ICdidWNrZXQnKSB7XG4gICAgICAgIHZhciB2ID0gY291bnRlcnNNYXAuZ2V0KHRoaXMpLmdldENvdW50KCdzdG9ja0NvdW50JywgdGhpcy5pZCk7XG5cbiAgICAgICAgaWYgKHYgPiAwKSB7XG4gICAgICAgICAgcmV0dXJuICduL2EnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb3VudGVyc01hcC5nZXQodGhpcykuZ2V0Q291bnQoJ3N0b2NrQ291bnQnLCB0aGlzLmlkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2FydENvdW50XCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gY291bnRlcnNNYXAuZ2V0KHRoaXMpLmdldENvdW50KCdjYXJ0Q291bnQnLCB0aGlzLmlkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0ZWRDb3VudFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIGNvdW50ZXJzTWFwLmdldCh0aGlzKS5nZXRDb3VudCgnc2VsZWN0ZWRDb3VudCcsIHRoaXMuaWQpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBfY2xhc3M7XG59KCk7XG5cblByb2R1Y3QuQ2hvaWNlID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gX2NsYXNzMihhdHRyLCBwYXJlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgX2NsYXNzMik7XG5cbiAgICB0aGlzLm5hbWUgPSBhdHRyLm5hbWU7XG4gICAgO1xuICAgIHRoaXMudHlwZSA9IGF0dHIudmFyaWF0aW9uID8gJ3ZhcmlhdGlvbicgOiBhdHRyLm5hbWUgPT0gJ3F1YW50aXR5JyA/ICdjb3VudCcgOiAnYnVja2V0JztcbiAgICB0aGlzLm9wdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICBpZiAodGhpcy50eXBlID09ICd2YXJpYXRpb24nKSB7XG4gICAgICBhdHRyLm9wdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChvcHRzLCBuYW1lKSB7XG4gICAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgICBpZiAocGFyZW50Lmhhc1ZhcmlhdGlvbihuYW1lKSkge1xuICAgICAgICAgIHZhbHVlID0gcGFyZW50LmdldFZhcmlhdGlvbihuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgICAgfSwgdGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50eXBlID09ICdidWNrZXQnKSB7XG4gICAgICBhdHRyLm9wdGlvbnMucmVkdWNlKGZ1bmN0aW9uIChvcHRzLCBuYW1lKSB7XG4gICAgICAgIHZhciB2YWx1ZTtcblxuICAgICAgICBpZiAocGFyZW50Lmhhc0J1Y2tldChuYW1lKSkge1xuICAgICAgICAgIHZhbHVlID0gcGFyZW50LmdldEJ1Y2tldChuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWx1ZSA9IG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgICAgfSwgdGhpcy5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50eXBlID09ICdjb3VudCcpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5zZXQoJ21pbicsIDApO1xuICAgICAgdGhpcy5vcHRpb25zLnNldCgnc3RlcCcsIDEpO1xuICAgICAgdGhpcy5vcHRpb25zLnNldCgnbWF4JywgMTAwKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWQgPSBuZXcgUGVkYW50aWNDb3VudC5Mb2dnaW5nQ291bnQoMCk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKF9jbGFzczIsIFt7XG4gICAga2V5OiBcImdldE9wdGlvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRPcHRpb24obmFtZSkge1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaGFzKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmdldChuYW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdChjaG9pY2UpIHtcbiAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy50eXBlID09ICdjb3VudCcpIHtcbiAgICAgICAgaWYgKGlzTmFOKGNob2ljZSkpIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZWxlY3QgcXVhbnRpdHkgb2YgXFxcIlwiLmNvbmNhdChjaG9pY2UsIFwiXFxcIlwiKSk7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWQuaW5jcihjaG9pY2UsIFwiaW5jcmVhc2VkIHRoZSBxdWFudGl0eSBjaG9pY2UgYnkgXCIuY29uY2F0KGNob2ljZSkpO1xuICAgICAgICB0aGlzLnBhcmVudC5jaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSwgbmFtZSkge1xuICAgICAgICAgIGlmIChwYXJlbnRDaG9pY2UgIT09IF90aGlzNCkge1xuICAgICAgICAgICAgaWYgKHBhcmVudENob2ljZS5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICBwYXJlbnRDaG9pY2Uub3B0aW9ucy5nZXQocGFyZW50Q2hvaWNlLnNlbGVjdGVkKS5zZWxlY3QoX3RoaXM0LnNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0gZWxzZSB7Ly8gY29uc29sZS5sb2coJ25vdCBzZWxlY3RlZCwgaWdub3JlICVzPycsIG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgbmFtZSkge1xuICAgICAgICAgIGlmIChuYW1lID09IGNob2ljZSkge1xuICAgICAgICAgICAgX3RoaXM0LnNlbGVjdGVkID0gbmFtZTtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ1bnNlbGVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1bnNlbGVjdChjaG9pY2UpIHtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT0gJ2NvdW50Jykge1xuICAgICAgICBpZiAoaXNOYU4oY2hvaWNlKSAmJiBhcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB1bnNlbGVjdCBxdWFudGl0eSBvZiBcXFwiXCIuY29uY2F0KGNob2ljZSwgXCJcXFwiXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQuZGVjcihjaG9pY2UsIFwiZGVjcmVhc2VkIHRoZSBxdWFudGl0eSBjaG9pY2UgYnkgXCIuY29uY2F0KGNob2ljZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLnNlbGVjdGVkT3B0aW9uO1xuXG4gICAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2N1cnJlbnQnLGN1cnJlbnQuc2VsZWN0ZWQpXG4gICAgICAgICAgY3VycmVudC5zZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJtaW5SZWd1bGFyUHJpY2VcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT0gJ2NvdW50Jykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHByaWNlcyA9IFtdO1xuICAgICAgdGhpcy5vcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9wdGlvbiwgbmFtZSkge1xuICAgICAgICBpZiAoIWlzTmFOKG9wdGlvbi5yZWd1bGFyUHJpY2UpKSB7XG4gICAgICAgICAgcHJpY2VzLnB1c2gob3B0aW9uLnJlZ3VsYXJQcmljZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJpY2VzLnB1c2goMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIHByaWNlcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1heFJlZ3VsYXJQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PSAnY291bnQnKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJpY2VzID0gW107XG4gICAgICB0aGlzLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uLCBuYW1lKSB7XG4gICAgICAgIGlmICghaXNOYU4ob3B0aW9uLnJlZ3VsYXJQcmljZSkpIHtcbiAgICAgICAgICBwcmljZXMucHVzaChvcHRpb24ucmVndWxhclByaWNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcmljZXMucHVzaCgwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoTWF0aCwgcHJpY2VzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWluU2FsZVByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy50eXBlID09ICdjb3VudCcpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcmljZXMgPSBbXTtcbiAgICAgIHRoaXMub3B0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24sIG5hbWUpIHtcbiAgICAgICAgaWYgKG9wdGlvbi5zYWxlUHJpY2UgIT09IG51bGwgJiYgIWlzTmFOKG9wdGlvbi5zYWxlUHJpY2UpKSB7XG4gICAgICAgICAgcHJpY2VzLnB1c2gob3B0aW9uLnNhbGVQcmljZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJpY2VzLnB1c2goaXNOYU4ob3B0aW9uLnJlZ3VsYXJQcmljZSkgPyAwIDogb3B0aW9uLnJlZ3VsYXJQcmljZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIHByaWNlcyk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1heFNhbGVQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PSAnY291bnQnKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJpY2VzID0gW107XG4gICAgICB0aGlzLm9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob3B0aW9uLCBuYW1lKSB7XG4gICAgICAgIGlmIChvcHRpb24uc2FsZVByaWNlICE9PSBudWxsICYmICFpc05hTihvcHRpb24uc2FsZVByaWNlKSkge1xuICAgICAgICAgIHByaWNlcy5wdXNoKG9wdGlvbi5zYWxlUHJpY2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByaWNlcy5wdXNoKGlzTmFOKG9wdGlvbi5yZWd1bGFyUHJpY2UpID8gMCA6IG9wdGlvbi5yZWd1bGFyUHJpY2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBwcmljZXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJtaW5QcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIE1hdGgubWluKHRoaXMubWluU2FsZVByaWNlLCB0aGlzLm1pblJlZ3VsYXJQcmljZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1heFByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5tYXhTYWxlUHJpY2UsIHRoaXMubWF4UmVndWxhclByaWNlKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY3VycmVudFByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy50eXBlID09ICdjb3VudCcpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHZhciBzZWxlY3RlZE9wdGlvbiA9IHRoaXMuc2VsZWN0ZWRPcHRpb247XG5cbiAgICAgIGlmIChzZWxlY3RlZE9wdGlvbiA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGVjdGVkT3B0aW9uLnByaWNlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZWxlY3RlZE9wdGlvblwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PSAnY291bnQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5zZWxlY3RlZCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0T3B0aW9uKHRoaXMuc2VsZWN0ZWQpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBfY2xhc3MyO1xufSgpO1xuXG5Qcm9kdWN0LkNvbXBvc2l0ZUNob2ljZSA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIF9jbGFzczMocGFyZW50Q2hvaWNlLCBwYXJlbnQpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgX2NsYXNzMyk7XG5cbiAgICB0aGlzLm5hbWUgPSBwYXJlbnRDaG9pY2UubmFtZTtcbiAgICB0aGlzLnR5cGUgPSBwYXJlbnRDaG9pY2UudHlwZTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB0aGlzLnBhcmVudENob2ljZXMgPSBuZXcgU2V0KCk7IC8vIHRoaXMub3B0aW9ucyA9IG5ldyBNYXAoKTtcbiAgICAvLyB0aGlzLnNlbGVjdGVkID0gbnVsbDtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhfY2xhc3MzLCBbe1xuICAgIGtleTogXCJnZXRPcHRpb25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0T3B0aW9uKG5hbWUpIHtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLmhhcyhuYW1lKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5nZXQobmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZWxlY3QoY2hvaWNlKSB7XG4gICAgICB0aGlzLnBhcmVudENob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAocGFyZW50Q2hvaWNlKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzZWxlY3RlZCBjaG9pY2UnLCBjaG9pY2UsICdvbiBwYXJlbnQnLCBwYXJlbnRDaG9pY2UucGFyZW50LmlkLCBwYXJlbnRDaG9pY2UubmFtZSApXG4gICAgICAgIHBhcmVudENob2ljZS5zZWxlY3QoY2hvaWNlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInVuc2VsZWN0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVuc2VsZWN0KGNob2ljZSkge1xuICAgICAgdGhpcy5wYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygndW5zZWxlY3RlZCBjaG9pY2UnLCBjaG9pY2UsICdvbiBwYXJlbnQnLCBwYXJlbnRDaG9pY2UucGFyZW50LmlkLCBwYXJlbnRDaG9pY2UubmFtZSApXG4gICAgICAgIHBhcmVudENob2ljZS51bnNlbGVjdChjaG9pY2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWRkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZChwYXJlbnRDaG9pY2UpIHtcbiAgICAgIHRoaXMucGFyZW50Q2hvaWNlcy5hZGQocGFyZW50Q2hvaWNlKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2VsZWN0ZWRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBzZWxlY3RlZCA9IG51bGw7XG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT0gJ2NvdW50Jykge1xuICAgICAgICBzZWxlY3RlZCA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudENob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAocGFyZW50Q2hvaWNlKSB7XG4gICAgICAgICAgc2VsZWN0ZWQucHVzaChwYXJlbnRDaG9pY2Uuc2VsZWN0ZWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIHNlbGVjdGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGFyZW50Q2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJlbnRDaG9pY2UpIHtcbiAgICAgICAgICBpZiAocGFyZW50Q2hvaWNlLnNlbGVjdGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IHBhcmVudENob2ljZS5zZWxlY3RlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZWN0ZWQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdGVkT3B0aW9uXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBpZiAodGhpcy50eXBlID09ICdjb3VudCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnNlbGVjdGVkID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24odGhpcy5zZWxlY3RlZCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1pblJlZ3VsYXJQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHRvdGFsID0gbmV3IFBlZGFudGljQ291bnQuTG9nZ2luZ0NvdW50KDApO1xuICAgICAgdGhpcy5wYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSkge1xuICAgICAgICB0b3RhbC5pbmNyKHBhcmVudENob2ljZS5taW5SZWd1bGFyUHJpY2UsIFwiYWRkIGNoaWxkIHByb2R1Y3QgI1wiLmNvbmNhdChwYXJlbnRDaG9pY2UucGFyZW50LmlkLCBcIidzIG1pbiByZWd1bGFyIHByaWNlIG9mICRcIikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdG90YWw7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1heFJlZ3VsYXJQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHRvdGFsID0gbmV3IFBlZGFudGljQ291bnQuTG9nZ2luZ0NvdW50KDApO1xuICAgICAgdGhpcy5wYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSkge1xuICAgICAgICB0b3RhbC5pbmNyKHBhcmVudENob2ljZS5tYXhSZWd1bGFyUHJpY2UsIFwiYWRkIGNoaWxkIHByb2R1Y3QgI1wiLmNvbmNhdChwYXJlbnRDaG9pY2UucGFyZW50LmlkLCBcIidzIG1heCByZWd1bGFyIHByaWNlIG9mICRcIikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdG90YWw7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1pblNhbGVQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHRvdGFsID0gbmV3IFBlZGFudGljQ291bnQuTG9nZ2luZ0NvdW50KDApO1xuICAgICAgdGhpcy5wYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSkge1xuICAgICAgICB0b3RhbC5pbmNyKHBhcmVudENob2ljZS5taW5TYWxlUHJpY2UsIFwiYWRkIGNoaWxkIHByb2R1Y3QgI1wiLmNvbmNhdChwYXJlbnRDaG9pY2UucGFyZW50LmlkLCBcIidzIG1pbiBzYWxlIHByaWNlIG9mICRcIikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdG90YWw7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1heFNhbGVQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHRvdGFsID0gbmV3IFBlZGFudGljQ291bnQuTG9nZ2luZ0NvdW50KDApO1xuICAgICAgdGhpcy5wYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSkge1xuICAgICAgICB0b3RhbC5pbmNyKHBhcmVudENob2ljZS5tYXhTYWxlUHJpY2UsIFwiYWRkIGNoaWxkIHByb2R1Y3QgI1wiLmNvbmNhdChwYXJlbnRDaG9pY2UucGFyZW50LmlkLCBcIidzIG1heCBzYWxlIHByaWNlIG9mICRcIikpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdG90YWw7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm9wdGlvbnNcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5wYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudENob2ljZSkge1xuICAgICAgICB2YXIgcGFyZW50T3B0aW9ucyA9IHBhcmVudENob2ljZS5vcHRpb25zO1xuICAgICAgICBwYXJlbnRPcHRpb25zLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudE9wdGlvbiwgbmFtZSkge1xuICAgICAgICAgIGlmICghb3B0aW9ucy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuc2V0KG5hbWUsIG5ldyBTZXQoKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb3B0aW9ucy5nZXQobmFtZSkuYWRkKHBhcmVudE9wdGlvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gX2NsYXNzMztcbn0oKTtcblxudmFyIEJhc2VQcm9kdWN0ID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfUHJvZHVjdCkge1xuICBfaW5oZXJpdHMoQmFzZVByb2R1Y3QsIF9Qcm9kdWN0KTtcblxuICBmdW5jdGlvbiBCYXNlUHJvZHVjdChpZCwgY291bnRzLCBjYXJ0KSB7XG4gICAgdmFyIF90aGlzNTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCYXNlUHJvZHVjdCk7XG5cbiAgICBfdGhpczUgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoQmFzZVByb2R1Y3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihCYXNlUHJvZHVjdCkpLmNhbGwodGhpcywgaWQsIGNvdW50cywgY2FydCkpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfdGhpczUsICdzZWxlY3RlZCcsIHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogX3RoaXM1LnNlbGVjdGlvbnNcbiAgICB9KTsgLy8gT2JqZWN0LmRlZmluZVByb3BlcnR5KCx7IGVudW1lcmFibGU6IHRydWUgfSlcbiAgICAvLyB0aGlzLnNlbGVjdGVkVmFyaWF0aW9uPW51bGw7XG4gICAgLy8gdGhpcy5zZWxlY3RlZEJ1Y2tldD1udWxsO1xuXG4gICAgcmV0dXJuIF90aGlzNTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhCYXNlUHJvZHVjdCwgW3tcbiAgICBrZXk6IFwic2VsZWN0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbGVjdCgpIHtcbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzZWxlY3QnLCB0aGlzLnR5cGUsIG9wdGlvbnMgKTtcbiAgICAgIHRoaXMuY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgaWYgKH5PYmplY3Qua2V5cyhvcHRpb25zKS5pbmRleE9mKG5hbWUpKSB7XG4gICAgICAgICAgY2hvaWNlLnNlbGVjdChvcHRpb25zW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidW5zZWxlY3RcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zZWxlY3QoKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLmNob2ljZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hvaWNlLCBuYW1lKSB7XG4gICAgICAgIGlmICh+T2JqZWN0LmtleXMob3B0aW9ucykuaW5kZXhPZihuYW1lKSkge1xuICAgICAgICAgIGNob2ljZS51bnNlbGVjdChvcHRpb25zW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVzZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICB2YXIgdW5zZWwgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnNlbGVjdGlvbnMsIHtcbiAgICAgICAgcXVhbnRpdHk6IHRoaXMuY2hvaWNlcy5nZXQoJ3F1YW50aXR5Jykuc2VsZWN0ZWRcbiAgICAgIH0pOyAvLyBjb25zb2xlLmxvZygncmVzZXQgJWQnLCB0aGlzLmlkLCB1bnNlbCApO1xuXG4gICAgICB0aGlzLnVuc2VsZWN0KHVuc2VsKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJhZGRUb0NhcnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVG9DYXJ0KCkge1xuICAgICAgdmFyIHNlbGVjdGVkUXR5ID0gdGhpcy5jaG9pY2VzLmdldCgncXVhbnRpdHknKS5zZWxlY3RlZDtcbiAgICAgIGlmIChzZWxlY3RlZFF0eSA9PT0gMCkgcmV0dXJuIG5ldyBFcnJvcignQ2Fubm90IGFkZCB0byBjYXJ0LCBxdWFudGl0eSBtaXNzaW5nJyk7XG5cbiAgICAgIGlmICghdGhpcy5oYXNWYWxpZFNlbGVjdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignQ2Fubm90IGFkZCB0byBjYXJ0LCBzZWxlY3Rpb25zIGFyZSBtaXNzaW5nJyk7XG4gICAgICB9XG5cbiAgICAgIGNhcnRNYXAuZ2V0KHRoaXMpLmFkZEl0ZW0odGhpcyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNldCgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ2YXJpYXRpb25zXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gZGF0YU1hcC5nZXQodGhpcy5pZCkudmFyaWF0aW9ucy5tYXAoZnVuY3Rpb24gKHZpZCkge1xuICAgICAgICByZXR1cm4gcHJvZHVjdEluc3RhbmNlcy5nZXQodmlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjaG9pY2VzXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgaWYgKGNob2ljZU1hcC5oYXModGhpcykpIHJldHVybiBjaG9pY2VNYXAuZ2V0KHRoaXMpO1xuICAgICAgdmFyIGF0dHJzID0gZGF0YU1hcC5nZXQodGhpcy5pZCkuYXR0cmlidXRlcztcbiAgICAgIGlmICghYXR0cnMpIHJldHVybiBudWxsO1xuICAgICAgdmFyIGNob2ljZXMgPSBuZXcgTWFwKCk7XG4gICAgICBjaG9pY2VzLnNldCgncXVhbnRpdHknLCBuZXcgUHJvZHVjdC5DaG9pY2Uoe1xuICAgICAgICBuYW1lOiAncXVhbnRpdHknXG4gICAgICB9LCB0aGlzKSk7XG4gICAgICBhdHRycy5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgYXR0cikge1xuICAgICAgICBvYmouc2V0KGF0dHIubmFtZSwgbmV3IFByb2R1Y3QuQ2hvaWNlKGF0dHIsIF90aGlzNikpO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSwgY2hvaWNlcyk7XG4gICAgICBjaG9pY2VNYXAuc2V0KHRoaXMsIGNob2ljZXMpO1xuICAgICAgcmV0dXJuIGNob2ljZXM7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdGlvbnNcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNob2ljZXMua2V5cygpKS5yZWR1Y2UoZnVuY3Rpb24gKG8sIGtleSkge1xuICAgICAgICBvW2tleV0gPSBfdGhpczcuY2hvaWNlcy5nZXQoa2V5KS5zZWxlY3RlZDtcbiAgICAgICAgcmV0dXJuIG87XG4gICAgICB9LCB7fSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImhhc1ZhbGlkU2VsZWN0aW9uc1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHNlbGVjdGlvbnMgPSB0aGlzLnNlbGVjdGlvbnM7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoc2VsZWN0aW9ucykuZXZlcnkoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5ICE9ICdxdWFudGl0eScgPyBzZWxlY3Rpb25zW2tleV0gIT09IG51bGwgOiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInN0b2NrQ291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczggPSB0aGlzO1xuXG4gICAgICB2YXIgc2VsZWN0ZWRPcHRpb25TdG9jayA9IG51bGw7XG4gICAgICB2YXIgc291cmNlID0gbnVsbDtcbiAgICAgIHRoaXMuY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUgIT09ICdxdWFudGl0eScpIHtcbiAgICAgICAgICB2YXIgc2VsZWN0ZWRPcHRpb24gPSBjaG9pY2Uuc2VsZWN0ZWRPcHRpb247XG5cbiAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdGVkT3B0aW9uLnN0b2NrQ291bnQpXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24uc3RvY2tDb3VudCA9PSAnbi9hJykge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRPcHRpb25TdG9jaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZWN0ZWRPcHRpb25TdG9jayA9IHNlbGVjdGVkT3B0aW9uLnN0b2NrQ291bnQ7XG4gICAgICAgICAgICBzb3VyY2UgPSBzZWxlY3RlZE9wdGlvbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoc2VsZWN0ZWRPcHRpb25TdG9jayA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYXRpb25zLnJlZHVjZShmdW5jdGlvbiAodCwgdikge1xuICAgICAgICAgIHQuaW5jcih2LnN0b2NrQ291bnQsIFwiaW5jbHVkZSBwcm9kdWN0ICNcIi5jb25jYXQoX3RoaXM4LmlkLCBcIidzIHZhcmlhdGlvbiAjXCIpLmNvbmNhdCh2LmlkLCBcIidzIHN0b2NrQ291bnQgb2ZcIikpO1xuICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9LCBuZXcgUGVkYW50aWNDb3VudC5Mb2dnaW5nQ291bnQoMCkpO1xuICAgICAgfSAvLyBjb25zb2xlLmxvZyggJ3N0b2NrQ291bnQoQkFTRSMlcyknLCB0aGlzLmlkLCBzZWxlY3RlZE9wdGlvblN0b2NrLCBzb3VyY2UucGFyZW50KVxuXG5cbiAgICAgIHJldHVybiBzZWxlY3RlZE9wdGlvblN0b2NrO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYXJ0Q291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczkgPSB0aGlzO1xuXG4gICAgICBpZiAodGhpcy5zZWxlY3RlZFZhcmlhdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWYXJpYXRpb24odGhpcy5zZWxlY3RlZFZhcmlhdGlvbikuY2FydENvdW50O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFyaWF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24gKHQsIHYpIHtcbiAgICAgICAgICB0LmluY3Iodi5jYXJ0Q291bnQsIFwiaW5jbHVkZSBwcm9kdWN0I1wiLmNvbmNhdChfdGhpczkuaWQsIFwiIHZhcmlhdGlvbiNcIikuY29uY2F0KHYuaWQsIFwiIGNhcnRDb3VudCBvZlwiKSk7XG4gICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH0sIG5ldyBQZWRhbnRpY0NvdW50LkxvZ2dpbmdDb3VudCgwKSk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdGVkQ291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczEwID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRWYXJpYXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFyaWF0aW9uKHRoaXMuc2VsZWN0ZWRWYXJpYXRpb24pLnNlbGVjdGVkQ291bnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy52YXJpYXRpb25zLnJlZHVjZShmdW5jdGlvbiAodCwgdikge1xuICAgICAgICAgIHQuaW5jcih2LnNlbGVjdGVkQ291bnQsIFwiaW5jbHVkZSBwcm9kdWN0I1wiLmNvbmNhdChfdGhpczEwLmlkLCBcIiB2YXJpYXRpb24jXCIpLmNvbmNhdCh2LmlkLCBcIidzIHNlbGVjdGVkQ291bnQgb2ZcIikpO1xuICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9LCBuZXcgUGVkYW50aWNDb3VudC5Mb2dnaW5nQ291bnQoMCkpO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBCYXNlUHJvZHVjdDtcbn0oUHJvZHVjdCk7XG5cbnZhciBDb21wb3NpdGVQcm9kdWN0ID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfQmFzZVByb2R1Y3QpIHtcbiAgX2luaGVyaXRzKENvbXBvc2l0ZVByb2R1Y3QsIF9CYXNlUHJvZHVjdCk7XG5cbiAgZnVuY3Rpb24gQ29tcG9zaXRlUHJvZHVjdCgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29tcG9zaXRlUHJvZHVjdCk7XG5cbiAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKENvbXBvc2l0ZVByb2R1Y3QuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihDb21wb3NpdGVQcm9kdWN0KSkuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoQ29tcG9zaXRlUHJvZHVjdCwgW3tcbiAgICBrZXk6IFwidW5zZWxlY3RcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdW5zZWxlY3QoKSB7XG4gICAgICB2YXIgX3RoaXMxMSA9IHRoaXM7XG5cbiAgICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgaWYgKH5PYmplY3Qua2V5cyhvcHRpb25zKS5pbmRleE9mKG5hbWUpKSB7XG4gICAgICAgICAgdmFyIHBhcmVudENob2ljZXMgPSBfdGhpczExLmNob2ljZXMuZ2V0KG5hbWUpLnBhcmVudENob2ljZXM7XG5cbiAgICAgICAgICBwYXJlbnRDaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSkge1xuICAgICAgICAgICAgY2hvaWNlLnVuc2VsZWN0KG9wdGlvbnNbbmFtZV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gLy8gc2VsZWN0UXVhbnRpdHkoIHF0eSApe1xuICAgIC8vICAgcmV0dXJuIHRoaXMucGFyZW50cy5yZWR1Y2UoICggc3VjY2VzcywgcGFyZW50ICk9PntcbiAgICAvLyAgICAgaWYoIXN1Y2Nlc3MpIHJldHVybiBzdWNjZXNzO1xuICAgIC8vICAgICByZXR1cm4gcGFyZW50LnNlbGVjdFF1YW50aXR5KCBxdHkgKTtcbiAgICAvLyAgIH0sIHRydWUgKTtcbiAgICAvLyB9XG4gICAgLy8gc2VsZWN0VmFyaWF0aW9uKCBuYW1lICl7XG4gICAgLy8gICByZXR1cm4gdGhpcy5wYXJlbnRzLnJlZHVjZSggKCBzdWNjZXNzLCBwYXJlbnQgKT0+e1xuICAgIC8vICAgICBpZighc3VjY2VzcykgcmV0dXJuIHN1Y2Nlc3M7XG4gICAgLy8gICAgIHJldHVybiBwYXJlbnQuc2VsZWN0VmFyaWF0aW9uKCBuYW1lICk7XG4gICAgLy8gICB9LCAodGhpcy5zZWxlY3RlZFZhcmlhdGlvbiA9IG5hbWUpICk7XG4gICAgLy8gfVxuXG4gIH0sIHtcbiAgICBrZXk6IFwicGFyZW50c1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGdpZHMgPSBkYXRhTWFwLmdldCh0aGlzLmlkKS5tZXRhX2JveC5lZGJfZ3JvdXBfaWRzO1xuICAgICAgdmFyIGdpZHMgPSBnaWRzLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUludChzLnRyaW0oKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBnaWRzLm1hcChmdW5jdGlvbiAoZ2lkKSB7XG4gICAgICAgIHJldHVybiBwcm9kdWN0SW5zdGFuY2VzLmdldChnaWQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNob2ljZXNcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczEyID0gdGhpcztcblxuICAgICAgaWYgKGNob2ljZU1hcC5oYXModGhpcykpIHJldHVybiBjaG9pY2VNYXAuZ2V0KHRoaXMpO1xuICAgICAgdmFyIGNvbXBvc2l0ZUNob2ljZXMgPSBuZXcgTWFwKCk7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRzLnJlZHVjZShmdW5jdGlvbiAoY29tcHMsIHBhcmVudCkge1xuICAgICAgICBwYXJlbnQuY2hvaWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJlbnRDaG9pY2UsIG5hbWUpIHtcbiAgICAgICAgICBpZiAoIWNvbXBzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgY29tcHMuc2V0KG5hbWUsIG5ldyBQcm9kdWN0LkNvbXBvc2l0ZUNob2ljZShwYXJlbnRDaG9pY2UsIF90aGlzMTIpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb21wcy5nZXQobmFtZSkuYWRkKHBhcmVudENob2ljZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY29tcHM7XG4gICAgICB9LCBjb21wb3NpdGVDaG9pY2VzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic3RvY2tDb3VudFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGNvdW50cyA9IFtdO1xuICAgICAgdGhpcy5wYXJlbnRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICBpZiAocGFyZW50LnN0b2NrQ291bnQgIT09ICduL2EnKSB7XG4gICAgICAgICAgY291bnRzLnB1c2gocGFyZW50LnN0b2NrQ291bnQpOyAvLyBjb25zb2xlLmxvZygncGFyZW50WyVkXS5jYXJ0Q291bnQnLHBhcmVudC5pZCxwYXJlbnQuY2FydENvdW50KVxuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdwYXJlbnRbJWRdLnN0b2NrQ291bnQnLHBhcmVudC5pZCxwYXJlbnQuc3RvY2tDb3VudClcbiAgICAgICAgfVxuICAgICAgfSk7IC8vIGNvbnNvbGUubG9nKCdjb3VudHMnLCBjb3VudHMpXG5cbiAgICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCBjb3VudHMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYXJ0Q291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbi5hcHBseShNYXRoLCB0aGlzLnBhcmVudHMubWFwKGZ1bmN0aW9uIChwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudC5jYXJ0Q291bnQ7XG4gICAgICB9KSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbGVjdGVkQ291bnRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudHMucmVkdWNlKGZ1bmN0aW9uICh0LCBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIHQgKyAocGFyZW50LnNlbGVjdGVkQ291bnQgPyAxIDogMCk7XG4gICAgICB9LCAwKSAvIHRoaXMucGFyZW50cy5sZW5ndGg7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImJhc2VQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50cy5yZWR1Y2UoZnVuY3Rpb24gKHQsIHBhcmVudCkge1xuICAgICAgICByZXR1cm4gdCArIChwYXJlbnQuYmFzZVByaWNlID09PSBudWxsID8gMCA6IHBhcmVudC5iYXNlUHJpY2UpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1pblJlZ3VsYXJQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wYXJlbnRzLnJlZHVjZShmdW5jdGlvbiAodCwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0ICsgcGFyZW50Lm1pblJlZ3VsYXJQcmljZTtcbiAgICAgIH0sIDApOyAvLyBjb25zb2xlLmxvZygnbWluUmVndWxhclByaWNlJywgdmFsdWUpXG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWF4UmVndWxhclByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRzLnJlZHVjZShmdW5jdGlvbiAodCwgcGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0ICsgcGFyZW50Lm1heFJlZ3VsYXJQcmljZTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJtaW5TYWxlUHJpY2VcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcmVudHMucmVkdWNlKGZ1bmN0aW9uICh0LCBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIHQgKyBwYXJlbnQubWluU2FsZVByaWNlO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1heFNhbGVQcmljZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyZW50cy5yZWR1Y2UoZnVuY3Rpb24gKHQsIHBhcmVudCkge1xuICAgICAgICByZXR1cm4gdCArIHBhcmVudC5tYXhTYWxlUHJpY2U7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY3VycmVudFByaWNlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgX3RoaXMxMyA9IHRoaXM7XG5cbiAgICAgIHJldHVybiB0aGlzLnBhcmVudHMucmVkdWNlKGZ1bmN0aW9uIChjaG9pY2VQcmljZSwgcGFyZW50KSB7XG4gICAgICAgIGlmIChwYXJlbnQuY2hvaWNlcykge1xuICAgICAgICAgIHBhcmVudC5jaG9pY2VzLmZvckVhY2goZnVuY3Rpb24gKGNob2ljZSwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKG5hbWUgIT09ICdxdWFudGl0eScpIHtcbiAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gX3RoaXMxMy5jaG9pY2VzLmdldChjaG9pY2UubmFtZSkuc2VsZWN0ZWQ7XG5cbiAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGNob2ljZS5nZXRPcHRpb24oc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIGNob2ljZVByaWNlLmluY3Iob3B0aW9uLnByaWNlLCBcImFkZCBcIi5jb25jYXQobmFtZSwgXCIncyBjdXJyZW50IHByaWNlIG9mICRcIikpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyZW50LmJhc2VQcmljZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGNob2ljZVByaWNlLmluY3IocGFyZW50LmJhc2VQcmljZSwgXCJhZGQgdGhlIGJhc2UgdW5pdCBwcmljZSBvZiAkXCIuY29uY2F0KHBhcmVudC5iYXNlUHJpY2UpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaG9pY2VQcmljZTtcbiAgICAgIH0sIG5ldyBQZWRhbnRpY0NvdW50LkxvZ2dpbmdDb3VudCgwKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENvbXBvc2l0ZVByb2R1Y3Q7XG59KEJhc2VQcm9kdWN0KTtcblxudmFyIEJ1Y2tldFByb2R1Y3QgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9CYXNlUHJvZHVjdDIpIHtcbiAgX2luaGVyaXRzKEJ1Y2tldFByb2R1Y3QsIF9CYXNlUHJvZHVjdDIpO1xuXG4gIGZ1bmN0aW9uIEJ1Y2tldFByb2R1Y3QoaWQsIGNvdW50cykge1xuICAgIHZhciBfdGhpczE0O1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJ1Y2tldFByb2R1Y3QpO1xuXG4gICAgX3RoaXMxNCA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChCdWNrZXRQcm9kdWN0Ll9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQnVja2V0UHJvZHVjdCkpLmNhbGwodGhpcywgaWQsIGNvdW50cykpO1xuICAgIF90aGlzMTQuc2VsZWN0ZWRWYXJpYXRpb24gPSBudWxsO1xuXG4gICAgX3RoaXMxNC52YXJpYXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgIGJ1Y2tldEluc3RhbmNlcy5zZXQodi5uYW1lLCB2KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfdGhpczE0O1xuICB9XG5cbiAgcmV0dXJuIEJ1Y2tldFByb2R1Y3Q7XG59KEJhc2VQcm9kdWN0KTtcblxudmFyIEVEQkNhdGFsb2dCcmFpbiA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEVEQkNhdGFsb2dCcmFpbigpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRURCQ2F0YWxvZ0JyYWluKTtcblxuICAgIHRoaXMuY291bnRzLmNyZWF0ZUluZGV4KCdzdG9ja0NvdW50Jyk7XG4gICAgdGhpcy5jb3VudHMuY3JlYXRlVmlydHVhbCgnY2FydENvdW50JywgMCk7XG4gICAgdGhpcy5jb3VudHMuY3JlYXRlVmlydHVhbCgnc2VsZWN0ZWRDb3VudCcsIDApO1xuICAgIHRoaXMuY291bnRzLmxpbmsoJ3N0b2NrQ291bnQnLCAnc2VsZWN0ZWRDb3VudCcpO1xuICAgIHRoaXMuY291bnRzLmxpbmsoJ3N0b2NrQ291bnQnLCAnY2FydENvdW50Jyk7XG4gICAgdGhpcy5jYXJ0ID0gbmV3IENhcnQodGhpcy5jb3VudHMpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEVEQkNhdGFsb2dCcmFpbiwgW3tcbiAgICBrZXk6IFwiZ2V0UHJvZHVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRQcm9kdWN0KGlkKSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVNYXAuZ2V0KGlkKTtcblxuICAgICAgaWYgKHByb2R1Y3RJbnN0YW5jZXMuaGFzKGlkKSkge1xuICAgICAgICByZXR1cm4gcHJvZHVjdEluc3RhbmNlcy5nZXQoaWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgY2FzZSAnbm9ybWFsJzpcbiAgICAgICAgICAgIHByb2R1Y3RJbnN0YW5jZXMuc2V0KGlkLCBuZXcgUHJvZHVjdChpZCwgdGhpcy5jb3VudHMsIHRoaXMuY2FydCkpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdiYXNlJzpcbiAgICAgICAgICAgIHByb2R1Y3RJbnN0YW5jZXMuc2V0KGlkLCBuZXcgQmFzZVByb2R1Y3QoaWQsIHRoaXMuY291bnRzLCB0aGlzLmNhcnQpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnY29tcG9zaXRlJzpcbiAgICAgICAgICAgIHByb2R1Y3RJbnN0YW5jZXMuc2V0KGlkLCBuZXcgQ29tcG9zaXRlUHJvZHVjdChpZCwgdGhpcy5jb3VudHMsIHRoaXMuY2FydCkpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdidWNrZXQnOlxuICAgICAgICAgICAgcHJvZHVjdEluc3RhbmNlcy5zZXQoaWQsIG5ldyBCdWNrZXRQcm9kdWN0KGlkLCB0aGlzLmNvdW50cywgdGhpcy5jYXJ0KSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvZHVjdEluc3RhbmNlcy5nZXQoaWQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpbXBvcnRWYXJpYXRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGltcG9ydFZhcmlhdGlvbnMoanNvbikge1xuICAgICAgdmFyIF90aGlzMTUgPSB0aGlzO1xuXG4gICAgICBqc29uLnZhcmlhdGlvbl9kYXRhLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFyIGlkID0gdi52YXJpYXRpb25faWQ7XG4gICAgICAgIGRhdGFNYXAuc2V0KGlkLCB2KTtcblxuICAgICAgICBfdGhpczE1LmNvdW50cy5zZXRDb3VudCgnc3RvY2tDb3VudCcsIGlkLCB2LnN0b2NrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpbXBvcnRDYXRlZ29yaWVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGltcG9ydENhdGVnb3JpZXMoanNvbikge1xuICAgICAgdmFyIGNhdHMgPSBqc29uLmNhdGVnb3JpZXM7XG4gICAgICBjYXRzLmZvckVhY2goZnVuY3Rpb24gKGNhdCkge1xuICAgICAgICBkYXRhTWFwLnNldChjYXQuc2x1ZywgY2F0KTtcblxuICAgICAgICBpZiAoIWNhdE1hcC5oYXMoY2F0LnNsdWcpKSB7XG4gICAgICAgICAgY2F0TWFwLnNldChjYXQuc2x1ZywgbmV3IFNldCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhdE1hcC5nZXQoY2F0LnNsdWcpLmFkZChqc29uLmlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpbXBvcnRUeXBlc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbXBvcnRUeXBlcyhqc29uKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhqc29uLm1ldGFfYm94KVxuICAgICAgaWYgKGpzb24ubWV0YV9ib3ggJiYganNvbi5tZXRhX2JveC5lZGJfZ3JvdXBfaWRzKSB7XG4gICAgICAgIHR5cGVNYXAuc2V0KGpzb24uaWQsICdjb21wb3NpdGUnKTtcbiAgICAgICAgcmV0dXJuICdjb21wb3NpdGUnO1xuICAgICAgfSBlbHNlIGlmIChqc29uLm1ldGFfYm94ICYmIGpzb24ubWV0YV9ib3guZWRiX2J1Y2tldF9zbHVnKSB7XG4gICAgICAgIHR5cGVNYXAuc2V0KGpzb24uaWQsICdidWNrZXQnKTtcbiAgICAgICAgcmV0dXJuICdidWNrZXQnO1xuICAgICAgfSBlbHNlIGlmIChqc29uLm1ldGFfYm94ICYmIGpzb24ubWV0YV9ib3guZWRiX2Jhc2VfcHJpY2UgJiYganNvbi5tZXRhX2JveC5lZGJfYmFzZV9wcmljZSAhPSAnJykge1xuICAgICAgICB0eXBlTWFwLnNldChqc29uLmlkLCAnYmFzZScpO1xuICAgICAgICByZXR1cm4gJ2Jhc2UnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHlwZU1hcC5zZXQoanNvbi5pZCwgJ25vcm1hbCcpO1xuICAgICAgICByZXR1cm4gJ25vcm1hbCc7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImltcG9ydFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfaW1wb3J0KGpzb24pIHtcbiAgICAgIHZhciBfdGhpczE2ID0gdGhpcztcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoanNvbikpIHtcbiAgICAgICAgcmV0dXJuIGpzb24ubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMTYuaW1wb3J0KGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHR5cGUgPSB0aGlzLmltcG9ydFR5cGVzKGpzb24pO1xuICAgICAgdGhpcy5pbXBvcnRDYXRlZ29yaWVzKGpzb24pO1xuXG4gICAgICBpZiAoanNvbi52YXJpYXRpb25fZGF0YSkge1xuICAgICAgICB0aGlzLmltcG9ydFZhcmlhdGlvbnMoanNvbik7XG4gICAgICB9XG5cbiAgICAgIGRhdGFNYXAuc2V0KGpzb24uaWQsIGpzb24pO1xuXG4gICAgICBpZiAodHlwZSA9PSAnYnVja2V0Jykge1xuICAgICAgICB0aGlzLmdldFByb2R1Y3QoanNvbi5pZCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNvdW50c1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIFBlZGFudGljQ291bnQuQ291bnRJbmRleDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2F0ZWdvcmllc1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20oY2F0TWFwLmtleXMoKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNhdGFsb2dcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBfdGhpczE3ID0gdGhpcztcblxuICAgICAgcmV0dXJuIHRoaXMuY2F0ZWdvcmllcy5yZWR1Y2UoZnVuY3Rpb24gKG1hcHBlZCwgY2F0KSB7XG4gICAgICAgIG1hcHBlZC5zZXQoY2F0LCBBcnJheS5mcm9tKGNhdE1hcC5nZXQoY2F0KS52YWx1ZXMoKSkucmVkdWNlKGZ1bmN0aW9uIChtYXAsIGlkKSB7XG4gICAgICAgICAgbWFwLnNldChpZCwgX3RoaXMxNy5nZXRQcm9kdWN0KGlkKSk7XG4gICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwgbmV3IE1hcCgpKSk7XG4gICAgICAgIHJldHVybiBtYXBwZWQ7XG4gICAgICB9LCBuZXcgTWFwKCkpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFREJDYXRhbG9nQnJhaW47XG59KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gRURCQ2F0YWxvZ0JyYWluO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21waWxlZC5qcy5tYXAiLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKGNhbGwgJiYgKF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHsgcmV0dXJuIGNhbGw7IH0gaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gc2VsZjsgfVxuXG5mdW5jdGlvbiBfZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyByZXR1cm4gX2dldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7IH0gfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbi8qKlxuKiBAZmlsZSBDb3VudC5qc1xuKiBAYXV0aG9yIEZyYW5rbyA8ZnJhbmtvQGFrci5jbHViPlxuKiBAdmVyc2lvbiAwLjFcbiovXG5cbi8qKlxuICogSGlzdG9yeSBXZWFrTWFwIGZvciBhbGwgaW5zdGFuY2VzXG4gKiBAY29uc3QgaGlzdE1hcFxuICovXG52YXIgaGlzdE1hcCA9IG5ldyBXZWFrTWFwKCk7XG4vKipcbiogTG9nbGluZXMgV2Vha01hcCBmb3IgYWxsIGluc3RhbmNlc1xuKiBAY29uc3QgbG9nTWFwXG4qL1xuXG52YXIgbG9nTWFwID0gbmV3IFdlYWtNYXAoKTtcbi8qKlxuKiBoaXN0b3JpZXMgbWVtb1xuKiBAY29uc3QgaGlzdG9yaWVzXG4qL1xuXG52YXIgaGlzdG9yaWVzID0gZnVuY3Rpb24gaGlzdG9yaWVzKG9iamVjdCkge1xuICBpZiAoIWhpc3RNYXAuaGFzKG9iamVjdCkpIGhpc3RNYXAuc2V0KG9iamVjdCwgW10pO1xuICByZXR1cm4gaGlzdE1hcC5nZXQob2JqZWN0KTtcbn07XG4vKipcbiogbG9nbGluZXMgbWVtb1xuKiBAY29uc3QgbG9nbGluZXNcbiovXG5cblxudmFyIGxvZ2xpbmVzID0gZnVuY3Rpb24gbG9nbGluZXMob2JqZWN0KSB7XG4gIGlmICghbG9nTWFwLmhhcyhvYmplY3QpKSBsb2dNYXAuc2V0KG9iamVjdCwgW10pO1xuICByZXR1cm4gbG9nTWFwLmdldChvYmplY3QpO1xufTtcblxudmFyIGV4cGxhbmF0aW9uID0gZnVuY3Rpb24gZXhwbGFuYXRpb24obG9nbGluZXMsIGhpc3RvcnksIHJlc3VsdCwgaW5kZW50KSB7XG4gIHJlc3VsdCA9IHJlc3VsdCB8fCBbJ1xcblNjZW5hcmlvOiBFeHBsYWluIGEgQ291bnQnXTtcbiAgaW5kZW50ID0gaW5kZW50IHx8IDA7XG4gIGhpc3RvcnkuZm9yRWFjaChmdW5jdGlvbiAobiwgaSkge1xuICAgIHZhciBsb2cgPSBsb2dsaW5lc1tpXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGxvZykpIHtcbiAgICAgIHZhciBoaXN0ID0gbmV3IEFycmF5KGxvZy5sZW5ndGgpO1xuICAgICAgaGlzdC5maWxsKG4pO1xuICAgICAgaW5kZW50Kys7XG4gICAgICByZXR1cm4gZXhwbGFuYXRpb24obG9nLCBoaXN0LCByZXN1bHQsIGluZGVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wdXNoKC9eaW5pdGlhbGl6ZS8udGVzdChsb2cpID8gJ1doZW4gSSAnICsgbG9nIDogJ0FuZCBJICcgKyBsb2cpO1xuICAgIH1cbiAgfSk7XG4gIHZhciBzcGFjZSA9IG5ldyBBcnJheShpbmRlbnQpLmZpbGwoJyAnKS5qb2luKCcnKTtcbiAgaW5kZW50LS07XG4gIHJldHVybiByZXN1bHQuam9pbignXFxuJyArIHNwYWNlICsgJyAnKTtcbn07XG5cbnZhciBCYXNlQ291bnQgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBfY3JlYXRlQ2xhc3MoQmFzZUNvdW50LCBudWxsLCBbe1xuICAgIGtleTogXCJfX2RlZmluZVByb3BlcnR5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9fZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCBpbnN0YW5jZSwgbG9nZ2luZykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICB2YWx1ZTogaW5zdGFuY2VcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIW9iai5fX2NvdW50UHJvcGVydGllc19fKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosICdfX2NvdW50UHJvcGVydGllc19fJywge1xuICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgIHdyaXRlYWJsZTogdHJ1ZSxcbiAgICAgICAgICB2YWx1ZToge31cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmouX19jb3VudFByb3BlcnRpZXNfXywgbmFtZSwge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSArICdIaXN0b3J5Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gaW5zdGFuY2UuaGlzdG9yeTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChsb2dnaW5nKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUgKyAnTG9nJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLmxvZztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lICsgJ0V4cGxhbmF0aW9uJywge1xuICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlLmV4cGxhaW4oKS5yZXBsYWNlKC9FeHBsYWluIGEgQ291bnQvZywgJ0V4cGxhaW4gYSBDb3VudCBuYW1lZCAnICsgbmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIG9sZEV4cGxhaW4gPSBvYmouZXhwbGFpbkNvdW50cztcblxuICAgICAgICBvYmouZXhwbGFpbkNvdW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgcHJldmlvdXMgPSBvbGRFeHBsYWluID8gb2xkRXhwbGFpbi5jYWxsKG9iaikgOiBudWxsO1xuICAgICAgICAgIHZhciBidW5jaCA9IHByZXZpb3VzID8gW3ByZXZpb3VzXSA6IFtdO1xuICAgICAgICAgIE9iamVjdC5rZXlzKG9iai5fX2NvdW50UHJvcGVydGllc19fKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICBidW5jaC5wdXNoKG9ialtuYW1lICsgJ0V4cGxhbmF0aW9uJ10pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBidW5jaC5qb2luKFwiXFxuXCIpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJkZWZpbmVQcm9wZXJ0eVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIGluaXQsIHN0cmljdCwgbG9nZ2luZykge1xuICAgICAgdmFyIGNsYXp6ID0gQmFzZUNvdW50O1xuXG4gICAgICBpZiAobG9nZ2luZykge1xuICAgICAgICBjbGF6eiA9IExvZ2dpbmdDb3VudDtcbiAgICAgIH0gZWxzZSBpZiAoc3RyaWN0KSB7XG4gICAgICAgIGNsYXp6ID0gU3RyaWN0Q291bnQ7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBjbGF6eihpbml0KTtcblxuICAgICAgaWYgKHR5cGVvZiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIEJhc2VDb3VudC5fX2RlZmluZVByb3BlcnR5KG9iai5wcm90b3R5cGUsIG5hbWUsIGluc3RhbmNlLCBsb2dnaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEJhc2VDb3VudC5fX2RlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwgaW5zdGFuY2UsIGxvZ2dpbmcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICAvKipcbiAgICAqIFJlcHJlc2VudHMgYSBDb3VudC5cbiAgICAqIEBjb25zdHJ1Y3RvclxuICAgICogQHBhcmFtIHtudW1iZXJ9IGluaXRpYWwgLSBUaGUgaW5pdGlhbCB2YWx1ZVxuICAgICovXG5cbiAgfV0pO1xuXG4gIGZ1bmN0aW9uIEJhc2VDb3VudChpbml0aWFsKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJhc2VDb3VudCk7XG5cbiAgICBpZiAoaXNOYU4oaW5pdGlhbCkpIHtcbiAgICAgIHRoaXMuc2V0KDApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldChpbml0aWFsKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgbnVtZXJpYyB2YWx1ZSBvZiB0aGUgY291bnRcbiAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc3VtIG9mIHRoZSBoaXN0b3JpY2FsIGNoYW5nZXNcbiAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhCYXNlQ291bnQsIFt7XG4gICAga2V5OiBcInZhbHVlT2ZcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWVPZigpIHtcbiAgICAgIHJldHVybiBOdW1iZXIoaGlzdG9yaWVzKHRoaXMpLnJlZHVjZShmdW5jdGlvbiAodCwgbikge1xuICAgICAgICByZXR1cm4gdCArIG47XG4gICAgICB9LCAwKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgYXJyYXkgb2YgdmFsdWVzIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSByZXN1bHQuXG4gICAgKiBAcmV0dXJucyB7YXJyYXl9IFRoZSB2YWx1ZXMgZm9yIGFsbCBjaGFuZ2VzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImdldFwiLFxuXG4gICAgLyoqXG4gICAgKiBSZXR1cm5zIHRoZSBudW1lcmljIHZhbHVlIG9mIHRoZSBjb3VudFxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHN1bSBvZiB0aGUgaGlzdG9yaWNhbCBjaGFuZ2VzXG4gICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIDEgKiB0aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEFkZHMgYSBuZXcgdmFsdWUgdG8gdGhlIGhpc3RvcnlcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIEFuIGludGVnZXJcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzdW0gb2YgdGhlIGhpc3RvcmljYWwgY2hhbmdlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmIChpc05hTih2KSkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZU9mO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHYuaGlzdG9yeSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdi5oaXN0b3J5LmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICBfdGhpcy5zZXQodik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yaWVzKHRoaXMpLnB1c2godik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnZhbHVlT2Y7XG4gICAgfVxuICAgIC8qKlxuICAgICogQWRkcyBhIG5ldyB2YWx1ZSBpbmNyZW1lbnRhdGlvbiB0aGUgaGlzdG9yeVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gQSBub24tbmVnYXRpdmUgaW50ZWdlclxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHN1bSBvZiB0aGUgaGlzdG9yaWNhbCBjaGFuZ2VzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluY3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5jcihuKSB7XG4gICAgICBpZiAoaXNOYU4obikpIHtcbiAgICAgICAgbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChuIDwgMCkge1xuICAgICAgICBuID0gTWF0aC5hYnMobik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnNldChuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBBZGRzIGEgbmV3IHZhbHVlIGRlY3JlbWVudGF0aW9uIHRoZSBoaXN0b3J5XG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBBIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyXG4gICAgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgc3VtIG9mIHRoZSBoaXN0b3JpY2FsIGNoYW5nZXNcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVjclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWNyKG4pIHtcbiAgICAgIGlmIChpc05hTihuKSkge1xuICAgICAgICBuID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKG4gPCAwKSB7XG4gICAgICAgIG4gPSBNYXRoLmFicyhuKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuc2V0KC0xICogbik7XG4gICAgfVxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgaGlzdG9yeSB0byB0aGUgZmlyc3QgdmFsdWUgc2V0LlxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHN1bSBvZiB0aGUgaGlzdG9yaWNhbCBjaGFuZ2VzICh0aGUgaW5pdGlhbCB2YWx1ZSkgXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInJlc2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgdmFyIGggPSBoaXN0b3JpZXModGhpcyk7XG4gICAgICB2YXIgZmlyc3QgPSBoLnNoaWZ0KCk7XG4gICAgICBoLnNwbGljZSgwLCBoLmxlbmd0aCk7XG4gICAgICBoLnB1c2goZmlyc3QpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImhpc3RvcnlcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKGhpc3Rvcmllcyh0aGlzKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICogUmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBoaXN0b3J5XG4gICAgKiBAcmV0dXJucyB7YXJyYXl9IFRoZSB2YWx1ZXMgZm9yIGFsbCBjaGFuZ2VzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImxlbmd0aFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIGhpc3Rvcmllcyh0aGlzKS5sZW5ndGg7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEJhc2VDb3VudDtcbn0oKTtcblxudmFyIFN0cmljdENvdW50ID1cbi8qI19fUFVSRV9fKi9cbmZ1bmN0aW9uIChfQmFzZUNvdW50KSB7XG4gIF9pbmhlcml0cyhTdHJpY3RDb3VudCwgX0Jhc2VDb3VudCk7XG5cbiAgLyoqXG4gICogUmVwcmVzZW50cyBhIFN0cmljdCBDb3VudC5cbiAgKiBAY29uc3RydWN0b3JcbiAgKiBAcGFyYW0ge251bWJlcn0gaW5pdGlhbCAtIFRoZSBpbml0aWFsIHZhbHVlIChyZXF1aXJlZClcbiAgKi9cbiAgZnVuY3Rpb24gU3RyaWN0Q291bnQoaW5pdGlhbCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBTdHJpY3RDb3VudCk7XG5cbiAgICBpZiAoaXNOYU4oaW5pdGlhbCkpIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignQ2Fubm90IGluaXRpYWxpemUgd2l0aG91dCBudW1lcmljIHZhbHVlJyk7XG4gICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChTdHJpY3RDb3VudC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFN0cmljdENvdW50KSkuY2FsbCh0aGlzLCBpbml0aWFsKSk7XG4gIH1cbiAgLyoqXG4gICogQWRkcyBhIG5ldyB2YWx1ZSBpbmNyZW1lbnRhdGlvbiB0aGUgaGlzdG9yeVxuICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIEEgbm9uLW5lZ2F0aXZlIGludGVnZXIgKHJlcXVpcmVkKVxuICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzdW0gb2YgdGhlIGhpc3RvcmljYWwgY2hhbmdlc1xuICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKFN0cmljdENvdW50LCBbe1xuICAgIGtleTogXCJpbmNyXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluY3Iobikge1xuICAgICAgaWYgKGlzTmFOKG4pKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0Nhbm5vdCBzZXQgbm9uLW51bWVyaWMgdmFsdWUnKTtcbiAgICAgIGlmIChuIDwgMCkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdDYW5ub3QgaW5jcmVtZW50IGJ5IG5lZ2F0aXZlIHZhbHVlJyk7XG4gICAgICByZXR1cm4gX2dldChTdHJpY3RDb3VudC5wcm90b3R5cGUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTdHJpY3RDb3VudC5wcm90b3R5cGUpLCBcImluY3JcIiwgdGhpcykuY2FsbCh0aGlzLCBuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBBZGRzIGEgbmV3IHZhbHVlIGRlY3JlbWVudGF0aW9uIHRoZSBoaXN0b3J5XG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBBIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyIChyZXF1aXJlZClcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzdW0gb2YgdGhlIGhpc3RvcmljYWwgY2hhbmdlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZWNyXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlY3Iobikge1xuICAgICAgaWYgKGlzTmFOKG4pKSB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0Nhbm5vdCBzZXQgbm9uLW51bWVyaWMgdmFsdWUnKTtcbiAgICAgIGlmIChuIDwgMCkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdDYW5ub3QgZGVjcmVtZW50IGJ5IG5lZ2F0aXZlIHZhbHVlJyk7XG4gICAgICByZXR1cm4gX2dldChTdHJpY3RDb3VudC5wcm90b3R5cGUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTdHJpY3RDb3VudC5wcm90b3R5cGUpLCBcImRlY3JcIiwgdGhpcykuY2FsbCh0aGlzLCBuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBBZGRzIGEgbmV3IHZhbHVlIHRvIHRoZSBoaXN0b3J5XG4gICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBBbiBpbnRlZ2VyIChyZXF1aXJlZClcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzdW0gb2YgdGhlIGhpc3RvcmljYWwgY2hhbmdlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0KHYpIHtcbiAgICAgIGlmIChpc05hTih2KSkgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdDYW5ub3Qgc2V0IG5vbi1udW1lcmljIHZhbHVlJyk7XG4gICAgICByZXR1cm4gX2dldChTdHJpY3RDb3VudC5wcm90b3R5cGUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihTdHJpY3RDb3VudC5wcm90b3R5cGUpLCBcInNldFwiLCB0aGlzKS5jYWxsKHRoaXMsIHYpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBTdHJpY3RDb3VudDtcbn0oQmFzZUNvdW50KTtcblxudmFyIExvZ2dpbmdDb3VudCA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoX1N0cmljdENvdW50KSB7XG4gIF9pbmhlcml0cyhMb2dnaW5nQ291bnQsIF9TdHJpY3RDb3VudCk7XG5cbiAgZnVuY3Rpb24gTG9nZ2luZ0NvdW50KCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBMb2dnaW5nQ291bnQpO1xuXG4gICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChMb2dnaW5nQ291bnQuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihMb2dnaW5nQ291bnQpKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhMb2dnaW5nQ291bnQsIFt7XG4gICAga2V5OiBcIl9fZGVmYXVsdE1lc3NhZ2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX19kZWZhdWx0TWVzc2FnZSh2LCBtZXNzYWdlKSB7XG4gICAgICB2YXIgcHJlZml4ID0gdGhpcy5sZW5ndGggPT09IDEgPyAnaW5pdGlhbGl6ZSB0bycgOiBtZXNzYWdlID8gbWVzc2FnZSA6IHYgPCAwID8gJ2RlY3JlbWVudCBieScgOiAnaW5jcmVtZW50IGJ5JztcbiAgICAgIHJldHVybiBbcHJlZml4LCBNYXRoLmFicyh2KV0uam9pbignICcpO1xuICAgIH1cbiAgICAvKipcbiAgICAqIEFkZHMgYSBuZXcgdmFsdWUgdG8gdGhlIGhpc3RvcnlcbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIEFuIGludGVnZXIgKHJlcXVpcmVkKVxuICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBBIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIHRoaXMgbW9kaWZpY2F0aW9uIChyZXF1aXJlZClcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzdW0gb2YgdGhlIGhpc3RvcmljYWwgY2hhbmdlc1xuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0KHYsIG1lc3NhZ2UsIGZuKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgLy8gZm4gPSBmbiB8fCAnc2V0JztcbiAgICAgIHZhciByZXN1bHQgPSBfZ2V0KExvZ2dpbmdDb3VudC5wcm90b3R5cGUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihMb2dnaW5nQ291bnQucHJvdG90eXBlKSwgXCJzZXRcIiwgdGhpcykuY2FsbCh0aGlzLCB2KTtcblxuICAgICAgbWVzc2FnZSA9IHRoaXMuX19kZWZhdWx0TWVzc2FnZSh2LCBtZXNzYWdlKTtcblxuICAgICAgaWYgKHR5cGVvZiB2LmxvZyAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICB2LmxvZy5mb3JFYWNoKGZ1bmN0aW9uIChsLCBpKSB7XG4gICAgICAgICAgbG9nbGluZXMoX3RoaXMyKS5wdXNoKGwpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2xpbmVzKHRoaXMpLnB1c2gobWVzc2FnZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIC8qKlxuICAgICogQWRkcyBhIG5ldyB2YWx1ZSBpbmNyZW1lbnRhdGlvbiB0aGUgaGlzdG9yeVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gQSBub24tbmVnYXRpdmUgaW50ZWdlciAocmVxdWlyZWQpXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEEgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBtb2RpZmljYXRpb24gKHJlcXVpcmVkKVxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHN1bSBvZiB0aGUgaGlzdG9yaWNhbCBjaGFuZ2VzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluY3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5jcih2LCBtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXQodiwgbWVzc2FnZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICogQWRkcyBhIG5ldyB2YWx1ZSBkZWNyZW1lbnRhdGlvbiB0aGUgaGlzdG9yeVxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gQSBub24tbmVnYXRpdmUgaW50ZWdlciAocmVxdWlyZWQpXG4gICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAtIEEgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBtb2RpZmljYXRpb24gKHJlcXVpcmVkKVxuICAgICogQHJldHVybnMge251bWJlcn0gVGhlIHN1bSBvZiB0aGUgaGlzdG9yaWNhbCBjaGFuZ2VzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlY3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVjcih2LCBtZXNzYWdlKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXQoLTEgKiBNYXRoLmFicyh2KSwgbWVzc2FnZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICogUmV0dXJucyBsb2cgb2YgbWVzc2FnZXMgYXNzb2NpYXRlZCB3aXRoIHZhbHVlIGNoYW5nZXMuXG4gICAgKiBAcmV0dXJucyB7bWl4ZWR9IGFuIGFycmF5IG9mIG1lc3NhZ2VzIG9yIG1lc3NhZ2UgYXJyYXlzXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInJlc2V0XCIsXG5cbiAgICAvKipcbiAgICAqIFJldHVybnMgdGhlIGhpc3RvcnkgdG8gdGhlIGZpcnN0IHZhbHVlIHNldCwgc2V0cyB0aGUgZmlyc3QgbG9nIGVudHJ5IGFzIHRoZSBlbnRpcmUgbG9nIGFuZCBhZGRzIGEgXCJyZXNldFwiIG1lc3NhZ2VcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFRoZSBzdW0gb2YgdGhlIGhpc3RvcmljYWwgY2hhbmdlcyAodGhlIGluaXRpYWwgdmFsdWUpIFxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgX2dldChMb2dnaW5nQ291bnQucHJvdG90eXBlLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTG9nZ2luZ0NvdW50LnByb3RvdHlwZSksIFwicmVzZXRcIiwgdGhpcykuY2FsbCh0aGlzKTtcblxuICAgICAgdmFyIGluaXRpYWwgPSBoaXN0b3JpZXModGhpcylbMF07XG4gICAgICB2YXIgbCA9IGxvZ2xpbmVzKHRoaXMpO1xuICAgICAgdmFyIGZpcnN0ID0gQXJyYXkuZnJvbShsKTtcbiAgICAgIGZpcnN0LnB1c2goJ3Jlc2V0IHRvICcgKyBpbml0aWFsKTtcbiAgICAgIGwuc3BsaWNlKDAsIGwubGVuZ3RoKTtcbiAgICAgIGwucHVzaChmaXJzdCk7XG4gICAgICByZXR1cm4gdGhpcy5nZXQoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZXhwbGFpblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBleHBsYWluKCkge1xuICAgICAgdmFyIGV4cGxhaW5lZCA9IGV4cGxhbmF0aW9uKGxvZ2xpbmVzKHRoaXMpLCBoaXN0b3JpZXModGhpcykpO1xuXG4gICAgICBpZiAoL1RoZW4gdGhlIHZhbHVlIGVxdWFscyBcXGQvLnRlc3QoZXhwbGFpbmVkKSkge1xuICAgICAgICByZXR1cm4gZXhwbGFpbmVkO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG90YWwgPSB0aGlzLmdldCgpO1xuICAgICAgdmFyIHNwYWNlID0gZXhwbGFpbmVkLnNwbGl0KCdcXG4nKS5wb3AoKS5yZXBsYWNlKC9eKFxccyspLisvLCBcIiQxXCIpO1xuICAgICAgcmV0dXJuIGV4cGxhaW5lZCArIFwiXFxuXCIuY29uY2F0KHNwYWNlLCBcIlRoZW4gdGhlIHZhbHVlIGVxdWFscyBcIikuY29uY2F0KHRvdGFsKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibG9nXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShsb2dsaW5lcyh0aGlzKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIExvZ2dpbmdDb3VudDtcbn0oU3RyaWN0Q291bnQpO1xuLyoqXG4gKiBJbmRleCBNYXBcbiAqIEBjb25zdCBpbmRleE1hcFxuICovXG5cblxudmFyIGluZGV4TWFwID0gbmV3IE1hcCgpO1xudmFyIGluZGV4TGlua3MgPSBuZXcgTWFwKCk7XG52YXIgdmlydE1hcCA9IG5ldyBNYXAoKTtcblxudmFyIENvdW50SW5kZXggPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBfY3JlYXRlQ2xhc3MoQ291bnRJbmRleCwgbnVsbCwgW3tcbiAgICBrZXk6IFwiY2xlYXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXIoKSB7XG4gICAgICBpbmRleE1hcC5jbGVhcigpO1xuICAgICAgaW5kZXhMaW5rcy5jbGVhcigpO1xuICAgICAgdmlydE1hcC5jbGVhcigpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNsZWFySW5kZXhcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xlYXJJbmRleChuYW1lKSB7XG4gICAgICBpbmRleE1hcC5kZWxldGUobmFtZSk7XG4gICAgICBpbmRleExpbmtzLmRlbGV0ZShuYW1lKTtcbiAgICAgIHZpcnRNYXAuZGVsZXRlKG5hbWUpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNyZWF0ZUluZGV4XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZUluZGV4KG5hbWUpIHtcbiAgICAgIGlmICghdGhpcy5tYXAuaGFzKG5hbWUpKSB7XG4gICAgICAgIHZhciBpZE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgaWRNYXAuc2V0KCdpZHMnLCBuZXcgTWFwKCkpO1xuICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSwgaWRNYXApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IENvdW50SW5kZXgobmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNyZWF0ZVZpcnR1YWxcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlVmlydHVhbChuYW1lLCBkZWZhdWx0VmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5tYXAuaGFzKG5hbWUpKSB7XG4gICAgICAgIHZhciBpZE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgaWRNYXAuc2V0KCdpZHMnLCBuZXcgTWFwKCkpO1xuICAgICAgICB0aGlzLm1hcC5zZXQobmFtZSwgaWRNYXApO1xuICAgICAgfVxuXG4gICAgICB2aXJ0TWFwLnNldChuYW1lLCBkZWZhdWx0VmFsdWUpO1xuICAgICAgcmV0dXJuIG5ldyBDb3VudEluZGV4KG5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpbmRleFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbmRleChuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KG5hbWUpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJleGlzdHNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZXhpc3RzKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcC5oYXMobmFtZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldElkc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRJZHMobmFtZSkge1xuICAgICAgaWYgKCF0aGlzLmV4aXN0cyhuYW1lKSkgcmV0dXJuIFtdO1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5pbmRleChuYW1lKS5nZXQoJ2lkcycpLmtleXMoKSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldENvdW50c1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDb3VudHMobmFtZSkge1xuICAgICAgaWYgKCF0aGlzLmV4aXN0cyhuYW1lKSkgcmV0dXJuIFtdO1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5pbmRleChuYW1lKS5nZXQoJ2lkcycpLnZhbHVlcygpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0VG90YWxcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VG90YWwobmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q291bnRzKG5hbWUpLnJlZHVjZShmdW5jdGlvbiAodCwgYykge1xuICAgICAgICByZXR1cm4gdCArIGM7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFzQ291bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFzQ291bnQobmFtZSwgaWQpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcC5oYXMobmFtZSkgJiYgdGhpcy5pbmRleChuYW1lKS5oYXMoJ2lkcycpICYmIHRoaXMuaW5kZXgobmFtZSkuZ2V0KCdpZHMnKS5oYXMoaWQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRDb3VudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDb3VudChuYW1lLCBpZCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIGlmICghdGhpcy5oYXNDb3VudChuYW1lLCBpZCkpIHtcbiAgICAgICAgaWYgKHZpcnRNYXAuaGFzKG5hbWUpKSByZXR1cm4gdmlydE1hcC5nZXQobmFtZSk7XG4gICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignTm8gaW5kZXggZm9yIFwiIycgKyBpZCArICdcIiBAIFwiJyArIG5hbWUgKyAnXCIuJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBjb3VudCA9IHRoaXMubWFwLmdldChuYW1lKS5nZXQoJ2lkcycpLmdldChpZCk7XG5cbiAgICAgIGlmICghaW5kZXhMaW5rcy5oYXMobmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfVxuXG4gICAgICB2YXIgbGlua3MgPSBBcnJheS5mcm9tKGluZGV4TGlua3MuZ2V0KG5hbWUpLnZhbHVlcygpKTtcbiAgICAgIHJldHVybiBsaW5rcy5yZWR1Y2UoZnVuY3Rpb24gKHQsIGwpIHtcbiAgICAgICAgcmV0dXJuIHQgLSBfdGhpczMuZ2V0Q291bnQobCwgaWQpO1xuICAgICAgfSwgY291bnQpOyAvLyBjb25zb2xlLmxvZygnbG5rJywgbGlua05hbWUpXG4gICAgICAvLyB2YXIgbGlua0NvdW50ID0gdGhpcy5nZXRDb3VudChsaW5rTmFtZSwgaWQgKTtcbiAgICAgIC8vIHJldHVybiBjb3VudCAtIGxpbmtDb3VudDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2V0Q291bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0Q291bnQobmFtZSwgaWQsIHZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5oYXNDb3VudChuYW1lLCBpZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdJbml0aWFsIENvdW50IGNhbiBvbmx5IG1lIHNldCBvbmNlIGZvciBcIiMnICsgaWQgKyAnXCIgQCBcIicgKyBuYW1lICsgJ1wiLicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmdldChuYW1lKS5nZXQoJ2lkcycpLnNldChpZCwgbmV3IExvZ2dpbmdDb3VudCh2YWx1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJpbmNyQ291bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaW5jckNvdW50KG5hbWUsIGlkLCBuKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzQ291bnQobmFtZSwgaWQpKSB7XG4gICAgICAgIGlmICh2aXJ0TWFwLmhhcyhuYW1lKSkge1xuICAgICAgICAgIHRoaXMuc2V0Q291bnQobmFtZSwgaWQsIHZpcnRNYXAuZ2V0KG5hbWUpKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pbmNyQ291bnQobmFtZSwgaWQsIG4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdObyBjb3VudCBmb3IgaWQgXCInICsgaWQgKyAnXCIuJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KG5hbWUpLmdldCgnaWRzJykuZ2V0KGlkKS5pbmNyKG4pO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJkZWNyQ291bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVjckNvdW50KG5hbWUsIGlkLCBuKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzQ291bnQobmFtZSwgaWQpKSB7XG4gICAgICAgIGlmICh2aXJ0TWFwLmhhcyhuYW1lKSkge1xuICAgICAgICAgIHRoaXMuc2V0Q291bnQobmFtZSwgaWQsIHZpcnRNYXAuZ2V0KG5hbWUpKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kZWNyQ291bnQobmFtZSwgaWQsIG4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdObyBjb3VudCBmb3IgaWQgXCInICsgaWQgKyAnXCIuJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KG5hbWUpLmdldCgnaWRzJykuZ2V0KGlkKS5kZWNyKG4pO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZXNldENvdW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlc2V0Q291bnQobmFtZSwgaWQpIHtcbiAgICAgIGlmICghdGhpcy5oYXNDb3VudChuYW1lLCBpZCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignTm8gY291bnQgZm9yIGlkIFwiJytpZCsnXCIuJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KG5hbWUpLmdldCgnaWRzJykuZ2V0KGlkKS5yZXNldCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRIaXN0b3J5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEhpc3RvcnkobmFtZSwgaWQpIHtcbiAgICAgIGlmICghdGhpcy5oYXNDb3VudChuYW1lLCBpZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdObyBoaXN0b3J5IGZvciBpZCBcIicgKyBpZCArICdcIi4nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5nZXQobmFtZSkuZ2V0KCdpZHMnKS5nZXQoaWQpLmhpc3Rvcnk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldExvZ1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRMb2cobmFtZSwgaWQpIHtcbiAgICAgIGlmICghdGhpcy5oYXNDb3VudChuYW1lLCBpZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdObyBsb2cgZm9yIGlkIFwiJyArIGlkICsgJ1wiLicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmdldChuYW1lKS5nZXQoJ2lkcycpLmdldChpZCkubG9nO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJleHBsYWluXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGV4cGxhaW4obmFtZSwgaWQpIHtcbiAgICAgIGlmICghdGhpcy5oYXNDb3VudChuYW1lLCBpZCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdObyBleHBsYW5hdGlvbiBmb3IgaWQgXCInICsgaWQgKyAnXCIuJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KG5hbWUpLmdldCgnaWRzJykuZ2V0KGlkKS5leHBsYWluKCkucmVwbGFjZSgnU2NlbmFyaW86IEV4cGxhaW4gYSBDb3VudCcsIFwiU2NlbmFyaW86IEV4cGxhaW4gXCIgKyBuYW1lICsgXCIgZm9yIHRoZSBpZCBcIiArIGlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibGlua1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaW5rKGEsIGIpIHtcbiAgICAgIGlmICghaW5kZXhMaW5rcy5oYXMoYSkpIHtcbiAgICAgICAgaW5kZXhMaW5rcy5zZXQoYSwgbmV3IFNldCgpKTtcbiAgICAgIH1cblxuICAgICAgaW5kZXhMaW5rcy5nZXQoYSkuYWRkKGIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1hcFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIGluZGV4TWFwO1xuICAgIH1cbiAgfV0pO1xuXG4gIGZ1bmN0aW9uIENvdW50SW5kZXgobmFtZSkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDb3VudEluZGV4KTtcblxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoQ291bnRJbmRleCwgW3tcbiAgICBrZXk6IFwic2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldChpZCwgaW5pdGlhbENvdW50KSB7XG4gICAgICByZXR1cm4gQ291bnRJbmRleC5zZXRDb3VudCh0aGlzLm5hbWUsIGlkLCBpbml0aWFsQ291bnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0KGlkKSB7XG4gICAgICByZXR1cm4gQ291bnRJbmRleC5nZXRDb3VudCh0aGlzLm5hbWUsIGlkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaW5jclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbmNyKGlkLCBuKSB7XG4gICAgICByZXR1cm4gQ291bnRJbmRleC5pbmNyQ291bnQodGhpcy5uYW1lLCBpZCwgbik7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImRlY3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVjcihpZCwgbikge1xuICAgICAgcmV0dXJuIENvdW50SW5kZXguZGVjckNvdW50KHRoaXMubmFtZSwgaWQsIG4pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoaXN0b3J5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhpc3RvcnkoaWQpIHtcbiAgICAgIHJldHVybiBDb3VudEluZGV4LmdldEhpc3RvcnkodGhpcy5uYW1lLCBpZCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImxvZ1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsb2coaWQpIHtcbiAgICAgIHJldHVybiBDb3VudEluZGV4LmdldExvZyh0aGlzLm5hbWUsIGlkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZXhwbGFpblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBleHBsYWluKGlkKSB7XG4gICAgICByZXR1cm4gQ291bnRJbmRleC5leHBsYWluKHRoaXMubmFtZSwgaWQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJsaW5rXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxpbmsobmFtZSkge1xuICAgICAgQ291bnRJbmRleC5saW5rKHRoaXMubmFtZSwgbmFtZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaWRzXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQ291bnRJbmRleC5nZXRJZHModGhpcy5uYW1lKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY291bnRzXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQ291bnRJbmRleC5nZXRDb3VudHModGhpcy5uYW1lKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQ291bnRJbmRleDtcbn0oKTtcblxudmFyIFZpcnR1YWxJbmRleCA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoX0NvdW50SW5kZXgpIHtcbiAgX2luaGVyaXRzKFZpcnR1YWxJbmRleCwgX0NvdW50SW5kZXgpO1xuXG4gIGZ1bmN0aW9uIFZpcnR1YWxJbmRleChuYW1lKSB7XG4gICAgdmFyIF90aGlzNDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBWaXJ0dWFsSW5kZXgpO1xuXG4gICAgX3RoaXM0ID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKFZpcnR1YWxJbmRleC5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKFZpcnR1YWxJbmRleCkpLmNhbGwodGhpcywgbmFtZSkpO1xuICAgIF90aGlzNC52aXJ0dWFsID0gdHJ1ZTtcbiAgICByZXR1cm4gX3RoaXM0O1xuICB9XG5cbiAgcmV0dXJuIFZpcnR1YWxJbmRleDtcbn0oQ291bnRJbmRleCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBDb3VudEluZGV4OiBDb3VudEluZGV4LFxuICBDb3VudDogQmFzZUNvdW50LFxuICBTdHJpY3RDb3VudDogU3RyaWN0Q291bnQsXG4gIExvZ2dpbmdDb3VudDogTG9nZ2luZ0NvdW50XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb21waWxlZC5qcy5tYXAiXX0=
