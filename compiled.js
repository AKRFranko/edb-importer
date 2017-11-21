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

      if (source === null) {
        return this.variations.reduce(function (t, v) {
          t.incr(parseInt(v.stockCount), "include product #".concat(_this8.id, "'s variation #").concat(v.id, "'s stockCount of"));
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

//# sourceMappingURL=compiled.js.map