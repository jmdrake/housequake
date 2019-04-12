var PouchDB = require("pouchdb");

var dbHousesRemote = new PouchDB("https://thathersessallyredernsin:5b391b98ab31e3c53b65c6aaa872698ec8bbdb39@55644244-4beb-4ca8-b177-8ff6d5c3cc0b-bluemix.cloudant.com/houselist"); 

var dbHouses = new PouchDB("dbHouses");

var fs = require('fs');

function readLines(input) {
  var remaining = '';
  var newdoc;
  var i = 1;

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      newdoc = parse(line);
      store(newdoc, i++);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      parse(remaining);
      store(newdoc, i++);
    }
  });
}

function parse(data) {
  var record = data.split("Parcel");
  console.log('Line: ' + data);
  var doc = {};
  doc["address"] = record[0];
  doc["notes"] = record[1];
  return(doc);
}

function store(newHouse, i){
    newHouse["number"] = i;
    newHouse["_id"] = Date.now().toString()+pad(i,3);
    dbHouses.put(newHouse).then(function(response){
        dbHouses.get(response.id).then(function(newDoc){
            console.log(newDoc)
        })
    }).catch(function (err) {
        console.log(err)
    });    
}

function pad(n, l){
  var s=n.toString(); 
  var slen = s.length; 
  for(var i = 0; i<l-slen; i++) 
    s = "0" + s; 
  return s
}

var input = fs.createReadStream('data.txt');
readLines(input);

dbHouses.replicate.to(dbHousesRemote, {batch_size : 5, batch_limit:2});