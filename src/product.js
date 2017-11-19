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