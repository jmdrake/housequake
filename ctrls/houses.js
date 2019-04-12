var dbHouses = new PouchDB("https://thathersessallyredernsin:5b391b98ab31e3c53b65c6aaa872698ec8bbdb39@55644244-4beb-4ca8-b177-8ff6d5c3cc0b-bluemix.cloudant.com/houselist"); 

function ctrlsHousesGetHouseList(callback){
    var results = [];
    dbHouses.allDocs({include_docs:true}).then(function(res){
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

function ctrlsHousesAddHouse(number, address, callback) {
    var newHouse = modelHouse;
    newHouse["number"] = number;
    newHouse["address"] = address;
    newHouse["_id"] = Date.now().toString();
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

