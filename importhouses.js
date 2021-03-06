var PouchDB = require("pouchdb");

var dbHousesRemote = new PouchDB("https://thathersessallyredernsin:5b391b98ab31e3c53b65c6aaa872698ec8bbdb39@55644244-4beb-4ca8-b177-8ff6d5c3cc0b-bluemix.cloudant.com/housequake"); 

var dbHouses = new PouchDB("dbHouses");

dbHousesRemote.replicate.to(dbHouses);

var fs = require('fs');

function readLines(input) {
  var remaining = '';
  var newdoc = {};
  var i = 1;
  var states = {start : 0, address : 1, parcel : 2, notes : 3}
  var state = states.start;
  var regAddress = new RegExp(/(\d+)\.\s(.*)$/);
  var regParcel = new RegExp(/^(\d+)$/);
  var results;

  function parse(line)
  {
    switch(state) {
      case states.start:
        results = regAddress.exec(line);
        if(results){
          newdoc["number"] = pad(results[1], 7);
          newdoc["address"] = results[2];
          state = states.address;
        }
        break;
      case states.address:
        results = regParcel.exec(line);
        if(results){
          newdoc["parcel"] = line;
          newdoc["notes"] = "";
          state = states.parcel;
        }
        break;
      case states.parcel:
        if(line.trim()=="") {
          state = states.start;
          // console.log(newdoc);
          store(newdoc);
          newdoc = {};
        } else {
          newdoc["notes"] += line;
          state = states.notes;
        }
        break;
      case states.notes:
        if(line.trim()=="") {
          state = states.start;
          // console.log(newdoc);
          store(newdoc);
          newdoc = {};
        } else {
          newdoc["notes"] += line;
          state = states.start;
        }
        break;          
      default:
        // code block
    }    
  }

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      
      parse(line);
      store(newdoc);
      newdoc = {};
      // newdoc = parse(line);
      // store(newdoc, i++);
      index = remaining.indexOf('\n');
    }
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      parse(remaining);
      store(newdoc);
      newdoc = {};
      // console.log("Remaining : " + remaining);
      // console.log(newdoc);
      // parse(remaining);
      // store(newdoc, i++);
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

function store(newHouse){
    newHouse["_id"] = Date.now().toString()+pad(parseInt(newHouse.number),3);
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

var input = fs.createReadStream('data2.txt');
readLines(input);

dbHouses.replicate.to(dbHousesRemote, {batch_size : 5, batch_limit:2});