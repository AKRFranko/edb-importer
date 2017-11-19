var fs = require('fs');
var files = [
  'head.js',
  'cart.js',
  'product.js',
  'base.product.js',
  'composite.product.js',
  'bucket.product.js',
  'main.js'
];
var contents = [];

files.forEach( ( f )=>{
  var content = fs.readFileSync(process.cwd() + '/src/' + f,'utf8');
  contents.push(content);
});

fs.writeFileSync(process.cwd()+'/index.js',  contents.join("\n"));

