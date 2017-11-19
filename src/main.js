

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