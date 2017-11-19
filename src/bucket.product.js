class BucketProduct extends BaseProduct{
  constructor( id, counts ){
    super( id, counts );
    this.selectedVariation=null;
    this.variations.forEach( ( v )=>{
      bucketInstances.set(v.name,v);
    });
  }
  
}