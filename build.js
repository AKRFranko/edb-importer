var PedanticCount = require('pedantic-count');
const catMap = new Map();
const typeMap = new Map();
const dataMap = new Map();
const productInstances = new Map();
const bucketInstances = new Map(); 
const cartMap = new WeakMap();
const countersMap = new WeakMap();
const choiceMap  = new WeakMap();

const shippingCosts = new Map();
shippingCosts.set('furniture', { min: 500, below: [ 65, 150, 250 ],above: [ 0, 85, 150 ] })
shippingCosts.set('small-furniture', { min: 500, below: [ 18, 25, 28 ],above: [ 0, 10, 15 ] })
shippingCosts.set('accessories', { min: 50, below: [ 15, 15, 15 ],above: [ 0, 0,0  ] })


class Cart{
  
  constructor( counts, cart ){
    this.tokens = new Map();
    this.products = new Map();
    this.zone = null;
    this.discounts = [];
    this.userLevel=false;
    countersMap.set( this, counts );
  }
  
  setUserLevel( userLevel){
    return  this.userLevel =  userLevel;
  }
  addCoupon( percent ){
    return this.discounts.push(percent);
  }
  
  removeCoupon( percent ){
    return this.discounts = this.discounts.filter( (d)=>{
      return d !== percent;
    });
  }
  
  get discountCost(){
    if( this.itemCost <= 0){
      return 0;
    }
    var userLevelDiscount = !this.userLevel ? 0 : this.userLevel === 'VIP' ? 0.05 : this.userLevel === 'VVIP' ? 0.10 : this.userLevel === 'VVVIP' ? 0.15 : 0;
    return [userLevelDiscount].concat(this.discounts).reduce( (t , d )=>{
      return d === 0 ? t : t + (this.itemCost * -d);
    }, 0);
  }
  
  setZone( string ){
    this.zone = string == 'zone-1' ? 0 : string == 'zone-2' ? 1 : 2;
    return true;
  }
  
  setZoneFromPostalCode( postcode ){
    
    postcode = postcode.toUpperCase().trim();
    
    var zones_table = {
      'zone-1': /^(H..|G1.|M..|K1.|T2.|T3.|T5.|T6.|V5.|V6.|C1A|R2.|R3.|E2.|E1.|E3.|B3.|S7.|S4.|A1.|J4.).+$/,
      'zone-3': /^(J|G|K|L|N|P|T|V|C|R|E|B|S|A|Y|X)0.+$/,
    }
    if(!/^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/.test(postcode)){
      return this.setZone( 'zone-3');
    }
    var found = 'zone-2';
    Object.keys(zones_table).forEach( ( zone )=>{
      var regex = zones_table[zone];
      if(regex.test(postcode)){
        found = zone;
      }
    });
    
    return this.setZone( found );
  }

  get shippingZone(){
    if(this.zone === null){
      return 'n/a';
    }
    return `zone-${this.zone+1}`;
  }
  
  get total(){
    var t =  this.itemCost + this.taxCost + this.shippingCost + this.discountCost;
    if(isNaN(t)) return 'n/a';
    return t;
  }
  get taxCost(){
    if(this.zone === null ){
      return 'n/a';
    }
    return this.itemCost == 0 ? 0 : this.itemCost * 0.15;
  }
  get shippingCost(){
    if(this.zone === null){
      return 'n/a';
    }
    var zone = this.zone;
    var itemCost = this.itemCost;
    var shippingClass = 'accessories';
    this.tokens.forEach( ( cartItem, token )=>{
      var sclass = cartItem.shippingClass;
      // console.log(sclass)
      if(shippingClass == 'accessories' && sclass == 'small-furniture'){
        shippingClass = sclass;
      }
      if(( shippingClass == 'small-furniture'  || shippingClass == 'accessories' )&& sclass == 'furniture'){
        shippingClass = sclass;
      }
    });
    var rules = shippingCosts.get( shippingClass );
    // console.log(currentPrice >= rules.min ? 'above' : 'bellow', currentPrice, rules.min )
    if( itemCost >= rules.min ){
      return rules.above[zone];
    }else{
      return rules.below[zone];
    }
  }
  
  get productCount(){
    return this.products.size;
  }
  
  get itemCount(){
    return this.tokens.size;
  }
  
  hasProduct( id ){
    return this.products.has( typeof id == 'number' ? id : id.id );
  }
  
  
  incrItemQuantity( cartItem, qty ){
    
      cartItem.updateChoices.forEach( (choice, name )=>{
        if(name !== 'quantity'){
          var option = choice.getOption(cartItem.choices[name]);
          if( option instanceof Set ){
            option.forEach( ( o )=>{
              o.incrCartCount( qty );
            })  
          }else{
            option.incrCartCount( qty );  
          }
        }
      });
      cartItem.choices.quantity+=qty;
      return true;
  }
  
  decrItemQuantity( cartItem, qty ){
    // console.log('DECR')
    cartItem.updateChoices.forEach( (choice, name )=>{
      if(name !== 'quantity'){
        var option = choice.getOption(cartItem.choices[name]);
        if( option instanceof Set ){
          option.forEach( ( o )=>{
            o.decrCartCount( qty );
          })  
        }else{
          option.decrCartCount( qty );  
        }
      }
    });
    cartItem.choices.quantity-=qty;
    return true;
  }
  
  
  get itemCost(){
    var total = 0.0;
    this.tokens.forEach( ( cartItem, t)=>{
      total += cartItem.itemCost;
    })
    return total;
  }
  
  addItem( product ){
    var it = this;
    var selections = Object.assign({},product.selections);
    var id = product.id;
    var qty = selections.quantity;
    delete selections.quantity;
    
    var data = { id: id, choices: selections, unitPrice: product.currentPrice };
    var token = JSON.stringify( data );
    Object.assign(data.choices, { quantity: 0 } );
    var cartItem = Object.assign( data, { 
      token: token, 
      choices: data.choices,
      shippingClass: product.shippingClass,
      updateChoices: product.choices,
      incr: function ( qty ){
                
              return !!it.incrItemQuantity( cartItem, qty );
            },
      decr: function  ( qty ){
              return !!it.decrItemQuantity( cartItem, qty );
            },
      remove: function( qty ){
                return !!it.removeItem( cartItem );
              }
    } );
    Object.defineProperties( cartItem, {
      minRegularPrice: { get: function(){
        var qty = this.choices.quantity === 0 ? 1 : this.choices.quantity;
        return product.minRegularPrice * qty;
      }},
      maxRegularPrice: { get: function(){
        var qty = this.choices.quantity=== 0 ? 1 : this.choices.quantity;
        return product.maxRegularPrice* qty;
      }},
      minPrice: {get: function(){
        var qty = this.choices.quantity=== 0 ? 1 : this.choices.quantity;
        return product.minPrice* qty;
      }},
      maxPrice: {get: function(){
        var qty = this.choices.quantity=== 0 ? 1 : this.choices.quantity;
        return product.maxPrice* qty;
      }},
      itemCost: {get: function(){
        var qty = this.choices.quantity=== 0 ? 1 : this.choices.quantity;
        return this.unitPrice * qty;
      }}
    });
    if(!this.products.has(id)){
      this.products.set( id, []);
    }
    // Object.assign(cartItem.choices, data.choices, { quantity: 0 });
    this.products.get( id ).push( token );
    this.tokens.set(token, cartItem );
    cartItem.incr( qty );
    // console.log('cart now has %d items', this.tokens.size )
    return this.tokens.get( token );
  }
  
  removeItem( cartItem ){
    cartItem.decr( cartItem.choices.quantity );
    var tokens = this.products.get(cartItem.id);
    var newTokens = tokens.filter( ( t )=>{
                      return t !== cartItem.token;
                    });
    if( newTokens.length == 0){
      this.products.delete( cartItem.id );
    }else{
      this.products.set(cartItem.id, newTokens  );  
    }
    this.tokens.delete(cartItem.token);
    return true;
  }
  
  reset(){
    this.tokens.forEach( ( cartItem )=>{
      this.removeItem(cartItem);
    })
    this.zone = null;
    return true;
  }
  
  
}


class Product{
  constructor( id, counts, cart ){
    this.id = id;
    cartMap.set( this, cart );
    countersMap.set( this, counts );
    var vids = dataMap.get( this.id ).variations;
    if(vids && vids.length){
      vids.forEach( ( vid )=>{
        productInstances.set( vid, new Product.Variation( vid, this, counts ) );
      })  
    }
    Object.defineProperty( this, 'name', { enumerable: true, configurable: true, value: this.name } );
    Object.defineProperty( this, 'description', { enumerable: true, configurable: true, value: this.description } );
    Object.defineProperty( this, 'image', { enumerable: true, configurable: true, value: this.image } );
    Object.defineProperty( this, 'images', { enumerable: true, configurable: true, value: this.images } );
    Object.defineProperty( this, 'type', { enumerable: true, configurable: true, value: this.type } );
    Object.defineProperty( this, 'wireframe', { enumerable: true, configurable: true, value: this.wireframe } );
    Object.defineProperty( this, 'anatomy', { enumerable: true, configurable: true, value: this.anatomy } );
    Object.defineProperty( this, 'why_we_love', { enumerable: true, configurable: true, value: this.why_we_love } );
    // Object.defineProperty( this, 'minRegularPrice', { enumerable: true, configurable: true, value: this.minRegularPrice } );
    // Object.defineProperty( this, 'maxRegularPrice', { enumerable: true, configurable: true, value: this.maxRegularPrice } );
    // Object.defineProperty( this, 'maxSalePrice', { enumerable: true, configurable: true, value: this.maxSalePrice } );
    // Object.defineProperty( this, 'maxSalePrice', { enumerable: true, configurable: true, value: this.maxSalePrice } );
  }
  
  get shippingClass(){
    return 'furniture';
  }
  
  get name(){
    return dataMap.get( this.id ).name;
  }
  
  get description(){
    return  dataMap.get( this.id ).description;
  }
  
  get why_we_love(){
    return {
      title: this.meta.why_we_love_title,
      content: this.meta.why_we_love_content,
    }
  }
  
  get wireframe(){
    if(!this.meta.wireframe) return {src: null, colors: [] };
    return {
      src: this.meta.wireframe.src, colors: this.meta.wireframe.colors||[]
    }
  }
  
  get anatomy(){
    var enfr = {};
    if(!this.meta.anatomy_en){
      enfr.en = {src: null, colors: [] };
    }else{
     enfr.en = {src: this.meta.anatomy_en.src, colors: this.meta.anatomy_en.colors||[] }; 
    }
    if(!this.meta.anatomy_fr){
      enfr.fr = {src: null, colors: [] };
    }else{
      enfr.fr = {src: this.meta.anatomy_fr.src, colors: this.meta.anatomy_fr.colors||[] }; 
    }
    return enfr;
  }
  
  get basePrice(){
    if(!this.meta.base_price &&  1*this.meta.base_price !== 0){
      return null;
    }
    return parseInt(this.meta.base_price)
  }

  get meta(){
    var meta_box = dataMap.get( this.id ).meta_box;
    if(!meta_box){
      return {};
    }
    return Object.keys(meta_box).reduce( ( keep, key )=>{
      if(/edb_/.test(key)){
        keep[key.replace(/edb_/,'')] = meta_box[key];
      }else{
        keep[key.replace(/^_/,'')] = meta_box[key];
      }
      return keep;
    }, {} );
    
  }
  
  get image(){
    var images = dataMap.get( this.id ).images;
    if(images.length){
      return { src: images[0].src, colors: images[0].colors||[] };
    }
    return { src: null, colors: [] };
  }
  get images(){
    var images = dataMap.get( this.id ).images;
    if(images.length){
      return images.slice(1).map( ( img )=>{
        return { src: img.src, colors: img.colors||[] };
      })
    }
    return [];
  }
  
  get type(){
    return typeMap.get( this.id );
  }
  
  get minRegularPrice(){
    var choicePrice = new PedanticCount.LoggingCount( 0 );
    if( this.choices){
      this.choices.forEach( ( choice, name )=>{
        // console.log(choice.minRegularPrice)
        if(name !== 'quantity'){
          choicePrice.incr( choice.minRegularPrice, `add ${choice.name}'s min regular price of $`);  
        }
      });
    }
    if( this.basePrice !== null ){
      choicePrice.incr(this.basePrice, `add the base unit price of $${this.basePrice}` ) ;
    }
    return choicePrice;
  }
  
  get maxRegularPrice(){
    var choicePrice = new PedanticCount.LoggingCount(0 );
    if( this.choices){
      this.choices.forEach( ( choice, name )=>{
        if(name !== 'quantity'){
          choicePrice.incr( choice.maxRegularPrice, `add ${choice.name}'s max regular price of $`);  
        }
      });
    }
    if( this.basePrice !== null ){
      choicePrice.incr(this.basePrice, `add the base unit price of $${this.basePrice}` ) ;
    }
    return choicePrice;
  }
  
  get minSalePrice(){
    var choicePrice = new PedanticCount.LoggingCount(0 );
    if( this.choices){
      this.choices.forEach( ( choice, name )=>{
        if(name !== 'quantity'){
          choicePrice.incr( choice.minSalePrice, `add ${choice.name}'s min sale price of $`);  
        }
      });
    }
    if( this.basePrice !== null ){
      choicePrice.incr(this.basePrice, `add the base unit price of $${this.basePrice}` ) ;
    }
    return choicePrice;
  }
  
  get maxSalePrice(){
    var choicePrice = new PedanticCount.LoggingCount(0 );
    if( this.choices){
      this.choices.forEach( ( choice, name )=>{
        if(name !== 'quantity'){
          choicePrice.incr( choice.maxSalePrice, `add ${choice.name}'s max sale price of $`);  
        }
      });
    }
    if( this.basePrice !== null ){
      choicePrice.incr(this.basePrice, `add the base unit price of $${this.basePrice}` ) ;
    }
    return choicePrice;
  }
  
  get minPrice(){
    return  Math.min( this.minSalePrice, this.minRegularPrice );
  }
  
  get maxPrice(){
    return  Math.max( this.maxSalePrice, this.maxRegularPrice );
  }
  
  get currentPrice(){
    var choicePrice = new PedanticCount.LoggingCount(0 );
    if( this.choices){
      this.choices.forEach( ( choice, name )=>{
        if(name !== 'quantity'){
            if(choice.selectedOption !== null){
              choicePrice.incr(choice.selectedOption.price,`add ${choice.name}'s current price of $`)  
            }else{
              choicePrice.incr(choice.minPrice,`add ${choice.name}'s max of $`)  
            }
            
        }
      });
    }
    if( this.basePrice !== null ){
      choicePrice.incr(this.basePrice, `add the base unit price of $${this.basePrice}` ) ;
    }
    return choicePrice;
  }
  
  hasBucket(name){
    return bucketInstances.has(name);
  }
  
  getBucket(name){
    return bucketInstances.get(name);
  }
  
  hasVariation(name){
    var idx = dataMap.get( this.id ).variations.findIndex( ( vid )=>{
      return productInstances.get( vid ).name == name;
    });
    return !!~idx;
  }
  
  getVariation(name){
    var idx = dataMap.get( this.id ).variations.findIndex( ( vid )=>{
      return productInstances.get( vid ).name == name;
    });
    if(~idx){
      var vid = dataMap.get( this.id ).variations[idx];
      return productInstances.get( vid );
    }
  }

}



Product.Variation = class{
  
  constructor( id, parent, counts ){
    this.id = id;
    this.parent = parent;
    countersMap.set( this, counts );
    // productInstances.set(this.id, this );
  }
  
  get name(){
    var attr = dataMap.get( this.id ).attributes;
    var name = Object.keys(attr).reduce( ( found, k )=>{
      if( found ) return found;
      var a = attr[k];
      if(/edb/.test(k)){
        found =  a.replace(/^edb_/,'').replace(/_/g,'-');
      }
      return found;
    }, false );
    if(!name){
      return 'Unknown';
    }
    return name;
  }
  
  get regularPrice(){
    return parseFloat(dataMap.get(this.id).display_regular_price);
  }
  
  get salePrice(){
    var disp = dataMap.get(this.id).display_price;
    return disp < this.regularPrice ? disp : null;
    
  }
  get price(){
    return this.salePrice === null ? this.regularPrice : this.salePrice;
  }
  
  
  get selected(){
    return !!this.isSelected;  
  }
  
  set selected( bool ){
    var wasSelected = this.isSelected;
    if(wasSelected){
      this.unselect( this.selectedCount );
    }
    this.isSelected = !!bool;
    return true;
  }
  
  get stockCount(){
    
    if( this.parent.type == 'bucket'){
      var v = countersMap.get( this ).getCount( 'stockCount', this.id );
      if(v > 0){
        return 'n/a';  
      }else{
        return 0;
      }
      
      
    }
    
    return countersMap.get( this ).getCount( 'stockCount', this.id );
  }
  
  get cartCount(){
    return countersMap.get( this ).getCount( 'cartCount', this.id );
  }
  
  get selectedCount(){
    return countersMap.get( this ).getCount( 'selectedCount', this.id ) ;
  }

  select( qty ){
    return countersMap.get( this ).incrCount( 'selectedCount', this.id, qty, `select a quantity for variation #${this.id} of` );
  }
  
  unselect( qty ){
    return countersMap.get( this ).decrCount( 'selectedCount', this.id, qty );
  }
  
  incrCartCount( qty ){
    return countersMap.get( this ).incrCount( 'cartCount', this.id, qty, `added to cart a quantity for variation #${this.id} of` );
  }
  
  decrCartCount( qty ){
    return countersMap.get( this ).decrCount( 'cartCount', this.id, qty, `removed from cart a quantity for variation #${this.id} of` );
  }
  
  

}

Product.Choice = class{
  
  constructor( attr, parent ){
    this.name = attr.name;;
    this.type = attr.variation ? 'variation' : attr.name == 'quantity' ? 'count' : 'bucket';
    this.options = new Map();
    this.selected = null;
    this.parent = parent;
    if( this.type == 'variation'){
      attr.options.reduce( ( opts, name )=>{
        var value;
        if(parent.hasVariation(name)){
          value = parent.getVariation( name );  
        }else{
          value = name;
        }
        opts.set(name, value);
        return opts;
      }, this.options );  
    }
    if( this.type == 'bucket'){
      attr.options.reduce( ( opts, name )=>{
        var value;
        if(parent.hasBucket(name)){
          value = parent.getBucket( name );  
        }else{
          value = name;
        }
        opts.set(name, value);
        return opts;
      }, this.options );  
    }
    if( this.type == 'count'){
      this.options.set('min',0);
      this.options.set('step',1);
      this.options.set('max',100);
      this.selected = new PedanticCount.LoggingCount( 0 );
    }
  }
  
  get minRegularPrice(){
    if( this.type == 'count'){
      return 0;
    }
    
    var prices = [];
    this.options.forEach( ( option, name )=>{
      if(!isNaN(option.regularPrice)){
        prices.push( option.regularPrice );  
      }else{
        prices.push( 0 );
      }
    });
    
    return Math.min.apply( Math, prices )  
  }
  
  get maxRegularPrice(){
    if( this.type == 'count'){
      return 0;
    }
    var prices = [];
    this.options.forEach( ( option, name )=>{
      if(!isNaN(option.regularPrice)){
        prices.push( option.regularPrice );  
      }else{
        prices.push( 0 );
      }
    });
    return Math.max.apply( Math, prices )  
  }
  
  get minSalePrice(){
    if( this.type == 'count'){
      return 0;
    }
    var prices = [];
    this.options.forEach( ( option, name )=>{
      if(option.salePrice !== null && !isNaN(option.salePrice)){
        prices.push( option.salePrice );  
      }else{
        prices.push( isNaN(option.regularPrice) ? 0 : option.regularPrice );  
      }
    });
    return Math.min.apply( Math, prices )  
  }
  
  get maxSalePrice(){
    if( this.type == 'count'){
      return 0;
    }
    var prices = [];
    this.options.forEach( ( option, name )=>{
      if(option.salePrice !== null && !isNaN(option.salePrice)){
        prices.push( option.salePrice );  
      }else{
        prices.push( isNaN(option.regularPrice) ? 0 : option.regularPrice );  
      }
    });
    return Math.max.apply( Math, prices )  
  }
  
  get minPrice(){
    return Math.min( this.minSalePrice, this.minRegularPrice );
  }
  
  get maxPrice(){
    return Math.max( this.maxSalePrice, this.maxRegularPrice );
  }
  
  get currentPrice(){
    if( this.type == 'count'){
      return 0;
    }
    var selectedOption = this.selectedOption;
    if(selectedOption === null ){
      return null;
    }
    return selectedOption.price;
  }
  
  getOption( name ){
    if(!this.options.has(name)){
      return null;
    }
    return this.options.get( name );
  }
  
  get selectedOption(){
    if( this.type == 'count'){
      return this.selected;
    }
    if(this.selected === null){
      return null;
    }
    return this.getOption(this.selected);
  }

  select( choice ){
    if( this.type == 'count'){
      if(isNaN(choice)) throw new Error(`Cannot select quantity of "${choice}"`);
      this.selected.incr( choice, `increased the quantity choice by ${choice}` );
      this.parent.choices.forEach( ( parentChoice, name )=>{
        if(parentChoice !== this ){
          if(parentChoice.selected){
            parentChoice.options.get( parentChoice.selected ).select( this.selected );
          }else{
            // console.log('not selected, ignore %s?', name);
          }
        }
      })
    }else{
      this.selected = null;
      this.options.forEach( ( option, name )=>{
        if( name == choice ){
           this.selected = name;
           option.selected = true;
        }else{
          option.selected = false;
        }
      });  
    }
    return true;
  }
  
  unselect( choice ){
    if( this.type =='count'){
      if(isNaN(choice) && arguments.length > 0){
        throw new Error(`Cannot unselect quantity of "${choice}"`);
      }
      this.selected.decr( choice, `decreased the quantity choice by ${choice}` );
    }else{
      var current = this.selectedOption;
      if(current){
        // console.log('current',current.selected)
        current.selected = false;
      }
      this.selected = null;  
    }
    
    return true;
  }
  
}

Product.CompositeChoice = class{
  
  constructor( parentChoice, parent ){
    this.name = parentChoice.name;
    this.type = parentChoice.type;
    this.parent = parent;
    this.parentChoices = new Set();
    // this.options = new Map();
    // this.selected = null;
     
  }
  get selected(){
    var selected = null;
    if(this.type == 'count'){
      selected = [];
      this.parentChoices.forEach( ( parentChoice )=>{
          selected.push(parentChoice.selected);
      });
      return Math.min.apply(Math,selected);
    }else{
      this.parentChoices.forEach( ( parentChoice )=>{
        if( parentChoice.selected !== null ){
          selected = parentChoice.selected;
        }
      });  
    }
    
    return selected;
  }
  
  getOption( name ){
    if(!this.options.has(name)){
      return null;
    }
    return this.options.get( name );
  }
  
  get selectedOption(){
    if( this.type == 'count'){
      return this.selected;
    }
    if(this.selected === null){
      return null;
    }
    return this.getOption(this.selected);
  }
  
  get minRegularPrice(){
    var total = new PedanticCount.LoggingCount( 0 );
    this.parentChoices.forEach( ( parentChoice )=>{
      total.incr( parentChoice.minRegularPrice, `add child product #${parentChoice.parent.id}'s min regular price of $`);
    })
    return total;
  }
  get maxRegularPrice(){
    var total = new PedanticCount.LoggingCount( 0 );
    this.parentChoices.forEach( ( parentChoice )=>{
      total.incr( parentChoice.maxRegularPrice, `add child product #${parentChoice.parent.id}'s max regular price of $`);
    })
    return total;
  }
  
  get minSalePrice(){
    var total = new PedanticCount.LoggingCount( 0 );
    this.parentChoices.forEach( ( parentChoice )=>{
      total.incr( parentChoice.minSalePrice, `add child product #${parentChoice.parent.id}'s min sale price of $`);
    })
    return total;
  }
  
  get maxSalePrice(){
    var total = new PedanticCount.LoggingCount( 0 );
    this.parentChoices.forEach( ( parentChoice )=>{
      total.incr( parentChoice.maxSalePrice, `add child product #${parentChoice.parent.id}'s max sale price of $`);
    })
    return total;
  }
  

  
  get options(){
    var options = new Map();
    this.parentChoices.forEach( ( parentChoice )=>{
      var parentOptions = parentChoice.options;
      parentOptions.forEach( ( parentOption, name )=>{
        if(!options.has(name)){
          options.set( name, new Set() );
        }
        options.get(name).add( parentOption );
      });
    });
    return options;
  }
  
  select( choice ){
    
    this.parentChoices.forEach( ( parentChoice )=>{
      // console.log('selected choice', choice, 'on parent', parentChoice.parent.id, parentChoice.name )
      parentChoice.select( choice );
    });
    return true;
  }
  
  unselect( choice ){
    
    this.parentChoices.forEach( ( parentChoice )=>{
      // console.log('unselected choice', choice, 'on parent', parentChoice.parent.id, parentChoice.name )
      parentChoice.unselect( choice );
    });
    return true;
  }
  
  add( parentChoice ){
    this.parentChoices.add( parentChoice );
  }
  
  
}
class BaseProduct extends Product{
  
  constructor( id, counts, cart ){
    super( id, counts, cart );
    
    Object.defineProperty( this, 'selected', { enumerable: true, configurable: true, value: this.selections } );
    // Object.defineProperty(,{ enumerable: true })
    // this.selectedVariation=null;
    // this.selectedBucket=null;
  }
  
  get variations(){
    return dataMap.get( this.id ).variations.map( ( vid )=>{
      return productInstances.get( vid );
    });
  }
  
  get choices(){
    if(choiceMap.has(this)) return choiceMap.get(this);
    var attrs = dataMap.get( this.id ).attributes;
    if(!attrs) return null;
    var choices = new Map();
    choices.set( 'quantity', new Product.Choice( { name: 'quantity' }, this ) );
    attrs.reduce( ( obj, attr )=>{
      obj.set( attr.name, new Product.Choice( attr, this ) );
      return obj;
    }, choices );
    choiceMap.set(this, choices );
    return choices;
  }
  
  get selections(){
    return Array.from(this.choices.keys()).reduce( ( o, key )=>{
      o[key] = this.choices.get(key).selected;
      return o;
    }, {} )
  }
  
 
  get hasValidSelections(){
    var selections = this.selections;
    return Object.keys( selections ).every( ( key )=>{
      return key != 'quantity' ?  selections[key] !== null : true;
    });
  }
 
  
  get stockCount(){
    var selectedOptionStock = null;
    var source = null;
    this.choices.forEach( ( choice, name )=>{
      if(name !== 'quantity'){
        var selectedOption = choice.selectedOption;
        if(selectedOption){
          // console.log(selectedOption.stockCount)
          if(selectedOption.stockCount == 'n/a'){
            return selectedOptionStock;
          }
          selectedOptionStock = selectedOption.stockCount;
          source = selectedOption;
        }
      }
    });
    if(selectedOptionStock === null ){
        return this.variations.reduce( ( t, v )=>{
          t.incr( v.stockCount, `include product #${this.id}'s variation #${v.id}'s stockCount of` );
          return t;
        },new PedanticCount.LoggingCount( 0 ) );  
    }
    // console.log( 'stockCount(BASE#%s)', this.id, selectedOptionStock, source.parent)
    return selectedOptionStock;
  }
  
  get cartCount(){
    if(this.selectedVariation){
     
      return this.getVariation(this.selectedVariation).cartCount;
    }else{
      return this.variations.reduce( ( t, v )=>{
        t.incr( v.cartCount, `include product#${this.id} variation#${v.id} cartCount of` );
        return t;
      },new PedanticCount.LoggingCount( 0 ) );
    }
  }
  
  get selectedCount(){
    
   if(this.selectedVariation){
       return this.getVariation(this.selectedVariation).selectedCount;
   }else{
      return this.variations.reduce( ( t, v )=>{
         t.incr( v.selectedCount, `include product#${this.id} variation#${v.id}'s selectedCount of` );
        return t;
      }, new PedanticCount.LoggingCount( 0 ) );
   }

  }
  
  


  select( options = {} ){
    // console.log('select', this.type, options );
    this.choices.forEach( ( choice, name )=>{
      if(~Object.keys(options).indexOf(name)){
        choice.select( options[name] );
      }
    });
    return true;
  }
  
  unselect( options = {} ){
    
    
    this.choices.forEach( ( choice, name )=>{
      if(~Object.keys(options).indexOf(name)){
        
        choice.unselect( options[name] );
      }
    });
    return true;
  }
  
  reset(){
    
    var unsel = Object.assign( {}, this.selections, {quantity: this.choices.get('quantity').selected } );
    // console.log('reset %d', this.id, unsel );
    this.unselect( unsel);
    return true;
  }
  
  addToCart(){
    var selectedQty = this.choices.get('quantity').selected;
    if(selectedQty === 0 ) return new Error('Cannot add to cart, quantity missing');
    if( !this.hasValidSelections ){
      return new Error('Cannot add to cart, selections are missing');
    }
    
    
    
    cartMap.get(this).addItem( this );
    return this.reset();
    
        
  }

  
  
}



class CompositeProduct extends BaseProduct{
  
  get parents(){
    var gids = dataMap.get( this.id ).meta_box.edb_group_ids;
    var gids = gids.split(',').map((s)=>{ return parseInt(s.trim())  });
    return gids.map( ( gid )=>{
      
      return productInstances.get( gid );
    });
  }
  
  get choices(){
    if(choiceMap.has(this)) return choiceMap.get(this);
    var compositeChoices = new Map();
    return this.parents.reduce( ( comps, parent )=>{
      parent.choices.forEach( ( parentChoice, name )=>{
        if(!comps.has(name)){
          comps.set( name, new Product.CompositeChoice( parentChoice , this ) );
        }
        comps.get(name).add( parentChoice );  
        
      });
      return comps;
    }, compositeChoices );
  }
  
  get stockCount(){
    var counts = [];
    this.parents.forEach( ( parent)=>{
      if(parent.stockCount !== 'n/a'){
        counts.push( parent.stockCount );
        // console.log('parent[%d].cartCount',parent.id,parent.cartCount)
        // console.log('parent[%d].stockCount',parent.id,parent.stockCount)
      }
    });
    // console.log('counts', counts)
    return Math.min.apply( Math, counts);
  }
  
  get cartCount(){
    return Math.min.apply( Math, this.parents.map( (parent)=>{
      return parent.cartCount;
    }));
  }
  
  get selectedCount(){
    return this.parents.reduce( ( t, parent)=>{
      return t + (parent.selectedCount ? 1 : 0);
    },0)/this.parents.length ;
  }
  
  get basePrice(){
    return this.parents.reduce( (t, parent )=>{
      return t + ( parent.basePrice === null ? 0 : parent.basePrice);
    },0)
  }
  
  get minRegularPrice(){
    
    var value =  this.parents.reduce( (t, parent )=>{
      return t + parent.minRegularPrice;
    },0)
    // console.log('minRegularPrice', value)
    return value;
  }
  
  get maxRegularPrice(){
    return this.parents.reduce( (t, parent )=>{
      return t + parent.maxRegularPrice;
    },0)
  }
  
  get minSalePrice(){
    return this.parents.reduce( (t, parent )=>{
      return t + parent.minSalePrice;
    },0)
  }
  
  get maxSalePrice(){
    return this.parents.reduce( (t, parent )=>{
      return t + parent.maxSalePrice;
    },0)
  }
  
  get currentPrice(){
    return this.parents.reduce( (choicePrice, parent )=>{
        if( parent.choices){
          parent.choices.forEach( ( choice, name )=>{
            if(name !== 'quantity'){
              var selected = this.choices.get(choice.name).selected;
              if(selected !== null){
                var option = choice.getOption(selected);
                choicePrice.incr(option.price,`add ${name}'s current price of $`)  
              }
                
            }
          });
        }
        if( parent.basePrice !== null ){
          choicePrice.incr(parent.basePrice, `add the base unit price of $${parent.basePrice}` ) ;
        }
        return choicePrice;
      
      
    },new PedanticCount.LoggingCount(0 ) );
  }
  
  
  
  unselect( options = {} ){
    this.choices.forEach( ( choice, name )=>{
      if(~Object.keys(options).indexOf(name)){
        var parentChoices = this.choices.get(name).parentChoices;
        parentChoices.forEach( ( choice )=>{
          choice.unselect( options[name] );
        })
      }
    });
    return true;

  }
  // selectQuantity( qty ){
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
}
class BucketProduct extends BaseProduct{
  constructor( id, counts ){
    super( id, counts );
    this.selectedVariation=null;
    this.variations.forEach( ( v )=>{
      bucketInstances.set(v.name,v);
    });
  }
  
}


class EDBCatalogBrain{
  
  constructor(){
    this.counts.createIndex('stockCount');
    this.counts.createVirtual('cartCount', 0);
    this.counts.createVirtual('selectedCount', 0);
    
    this.counts.link('stockCount','selectedCount');
    this.counts.link('stockCount','cartCount');
    this.cart = new Cart( this.counts );
    
  }
  
  
  
  get counts(){
    return PedanticCount.CountIndex;
  }
  
  get categories(){
    return Array.from( catMap.keys() );
  }
  
  get catalog(){
    return this.categories.reduce( ( mapped, cat )=>{
      mapped.set(cat, Array.from(catMap.get(cat).values()).reduce( ( map, id )=>{
        map.set(id,this.getProduct( id ));
        return map;
      }, new Map() ));
      return mapped;
    }, new Map() );
  }
  
  
  
  getProduct( id ){
      var type = typeMap.get(id);
      if(productInstances.has(id)){
        return productInstances.get(id);
      }else{
        switch( type ){
          case 'normal':
            productInstances.set(id, new Product( id, this.counts, this.cart ) );
          break;
          case 'base':
            productInstances.set(id, new BaseProduct( id, this.counts, this.cart ) );
          break;
          case 'composite':
            productInstances.set(id, new CompositeProduct( id, this.counts, this.cart ) );
          break;
          case 'bucket':
            productInstances.set(id, new BucketProduct( id, this.counts,this.cart ) );
          break;
        }
      }
      return productInstances.get(id);
  }
  
  importVariations(json){
    
    json.variation_data.forEach( ( v )=>{
      var id = v.variation_id;
      dataMap.set( id, v );
      this.counts.setCount( 'stockCount', id, v.stock );
    });
    
  }
  
  importCategories( json ){
    
    let cats = json.categories;
    cats.forEach( ( cat )=>{
      dataMap.set( cat.slug, cat );
      if(!catMap.has(cat.slug)){
        catMap.set(cat.slug, new Set() );
      }
      catMap.get(cat.slug).add( json.id );
    });
    
  }
  
  importTypes( json ){
    // console.log(json.meta_box)
    if( json.meta_box && json.meta_box.edb_group_ids){
      typeMap.set( json.id, 'composite');
      return 'composite';
    }else if( json.meta_box && json.meta_box.edb_bucket_slug){
      typeMap.set( json.id, 'bucket');
      return 'bucket';
    }else if( json.meta_box && json.meta_box.edb_base_price && json.meta_box.edb_base_price != ''){
      typeMap.set( json.id, 'base');
      return 'base';
    }else{
      typeMap.set( json.id, 'normal');
      return 'normal';
    }
    
  }
  
  
  
  import( json ){
    if(Array.isArray(json)){
      return json.map( ( item )=>{
        return this.import( item );
      })
    }
    var type = this.importTypes( json );
    this.importCategories( json );
    if(json.variation_data){
      this.importVariations( json );  
    }
    dataMap.set( json.id, json );
    if(type == 'bucket' ){
      this.getProduct( json.id );
    }
    
  }
  
}
module.exports = EDBCatalogBrain;