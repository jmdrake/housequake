var dbHouses = new PouchDB("https://thathersessallyredernsin:5b391b98ab31e3c53b65c6aaa872698ec8bbdb39@55644244-4beb-4ca8-b177-8ff6d5c3cc0b-bluemix.cloudant.com/houselist"); 

dbHouse.createIndex({
  index: {fields: ['number']}
});


function ctrlsHousesGetHouseList(callback){
    var results = [];
	dbHouses.find({
	  selector: {
		name: {$gte: null}
	  },
	  sort: ['name']
	}).then(function(res){
        if(res) {
            for(var i=0; i<res.rows.length; i++) {
                results.push(res.rows[i].doc);
            }
        }
        callback(results);
	}).catch(function(err){
		callback(err)
	});
}

function ctrlsHousesAddHouse(number, address, image, callback) {
    var newHouse = {};
    newHouse["_id"] = Date.now().toString()+pad(number,3);    
    newHouse["number"] = number;
    newHouse["address"] = address;
    newHouse["notes"] = {};
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

function ctrlsHousesUpdateHouse(doc){
    dbHouses.put(doc).catch(function(err){console.log(err)});
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