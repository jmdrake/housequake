var modelHouse = {
    number : "",
    address : "",
    descripton : "",
    price : "",
    status : "",
    estimaterent : "",
    estimatevalue : "",
    pictures : [],
    repairs : [],
    tenant : null
};

var modelRepair = {
    description : "",
    datenoted : "",
    bids : [
        {
            contractor : "",
            materialcost : "",
            laborcost : "",
            datesubmitted : ""
        }
    ],
    datecompleted:"",
    finalcost :""
};

var modelTenant = {
    name : "",
    phone : "",
    email : "",
    leasestartdate : "",
    leaseenddate : "",
    rentpayments : [{
        datedue : "",
        datereceived : "",
        amount : "",
        latefee : "",
    }]
}