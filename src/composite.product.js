

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