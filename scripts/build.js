var fs = require('fs');
const Concat = require('concat-with-sourcemaps');
var concat = new Concat( true, 'build.js', '\n');
var files = [
  'head.js',
  'cart.js',
  'product.js',
  'base.product.js',
  'composite.product.js',
  'bucket.product.js',
  'main.js'
];

// var combined = sourceMap.combine.create('build.js')
files.forEach( ( f )=>{
  var content = fs.readFileSync(process.cwd() + '/src/' + f,'utf8');
  concat.add(`src/${f}`, content );
});

fs.writeFileSync(process.cwd()+'/build.js',  concat.content);
fs.writeFileSync(process.cwd()+'/build.js.map',  concat.sourceMap);




// var offset = { line: 2 };
// var base64 = combine
//   .create('bundle.js')
//   .addFile(fooFile, offset)
//   .addFile(barFile, { line: offset.line + 8 })
//   .base64();
 
// var sm = convert.fromBase64(base64).toObject();
// console.log(sm);