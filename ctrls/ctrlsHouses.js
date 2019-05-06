var dbHousesRemote = new PouchDB("https://thathersessallyredernsin:5b391b98ab31e3c53b65c6aaa872698ec8bbdb39@55644244-4beb-4ca8-b177-8ff6d5c3cc0b-bluemix.cloudant.com/housequake"); 

var dbHouses = new PouchDB("dbHouses");

dbHousesRemote.replicate.to(dbHouses).on("complete", function(){
    dbHouses.createIndex({
      index: {fields: ['number']}
    }).then(function(res){
        console.log(res)
    }).catch(function(err){
        console.log(err)
    });    
    PouchDB.sync(dbHousesRemote, dbHouses, {live:true, retry: true});
})

function ctrlsHousesGetHouseList(callback){
    var results = [];
	dbHouses.find({
	  selector: {
		number: {$gte: null}
	  },
	  sort: ['number']
	}).then(function(res){
        callback(res.docs);
	}).catch(function(err){
		callback(err)
	});
}

function ctrlsHousesAddHouse(number, address, notes, image, callback) {
    var newHouse = {};
    newHouse["_id"] = Date.now().toString()+pad(number,3);    
    newHouse["number"] = pad(number, 7);
    newHouse["address"] = address;
    newHouse["notes"] = notes;
    if(image != null) {
        // https://pouchdb.com/guides/attachments.html
        newHouse["_attachments"] = {
          filename: {
            type: image.type,
            data: image
          }            
        }
    }
    dbHouses.put(newHouse).then(function(response){
        dbHouses.get(response.id).then(function(newDoc){
            callback(newDoc)
        })
    }).catch(function (err) {
        callback(err)
    });
}

function ctrlsHousesGetHouse(id, callback){
    dbHouses.get(id).then(function(doc){
        callback(doc)
    }).catch(function (err) {
        callback(err)
    });
}


function ctrlsHousesUpdateHouse(doc, image){
    if(image != null) {
        // https://pouchdb.com/guides/attachments.html
        doc["_attachments"] = {
          filename: {
            type: image.type,
            data: image
          }            
        }
    }
    dbHouses.put(doc).then(function(res){
        console.log(res)
    }).catch(function(err){
        console.log(err)
    });
}

function ctrlsHousesDeleteHouse(house) {
    dbHouses.remove(house).catch(function(err){console.log(err)});
}

function pad(n, l){
  var s=n.toString(); 
  var slen = s.length; 
  for(var i = 0; i<l-slen; i++) 
    s = "0" + s; 
  return s
}