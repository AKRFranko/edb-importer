var {defineSupportCode} = require('cucumber');
const EDBCatalogBrain = require( process.cwd() + '/index.js' );
const Mocks = require( process.cwd() + '/features/data/mocks.json' );
const brain = new EDBCatalogBrain();

var currentProduct = null;
const productNames = new Map();
var dataImported  = false;
productNames.set( 'MARITIME OTTOMAN', 0);
productNames.set( 'MARITIME 3P', 5 );
productNames.set( 'MARITIME RAF', 13 );

function CustomWorld() {
  
    Object.defineProperty( this, 'currentProduct', {
      get: ()=>{
        return currentProduct;
      }
    });
    
    Object.defineProperty( this, 'json', {
      get: ()=>{
        return Mocks;
      }
    });
    
    Object.defineProperty( this, 'cart', {
      get: ()=>{
        return brain.cart;
      }
    });
    
    Object.defineProperty( this, 'catalog', {
      value: brain.catalog
    });
    

    
    this.has = function( p   ){
      return brain[p] !== 'undefined' && brain[p] !== null;  
    }
    
    this.import = function(json){
      if(!dataImported){
        dataImported = true;
        return brain.import(json);  
      }
      return json;
    }
    
    this.render = function( thing ){
      return brain.render(thing);
    }
    
    this.switchProduct = function( idOrName ){
      
      var id = idOrName;
      if(isNaN(parseInt(idOrName))){
        id = productNames.get( idOrName );
      }
      if(currentProduct !== null){
        currentProduct.reset();
      }
      
      currentProduct = brain.getProduct( id );
      
      return currentProduct;
    }
    
    this.getParent = function( name ){
      var id = productNames.get( name );
      return brain.getProduct( id );
    }
    
    
}

defineSupportCode(function({setWorldConstructor}) {
  setWorldConstructor(CustomWorld)
});