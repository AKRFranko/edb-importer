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
    if(source === null ){
        return this.variations.reduce( ( t, v )=>{
          t.incr( parseInt(v.stockCount), `include product #${this.id}'s variation #${v.id}'s stockCount of` );
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
