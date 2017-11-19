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

