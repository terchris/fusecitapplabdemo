const Observable = require('FuseJS/Observable')
const ckan = require('ckan')
const compose = require('node_modules/citapplab/lib/bundle').compose
const datasetItemList = Observable()

const { 
	parsers,
	resource
} = ckan



const getResourceForMaps = (resourceId) => compose(
	resource(resourceId),
	parsers.resourceGetWithValidLocation
)



// Find the correct record in the mapping table
var findDatasetMappingRecord = function(items, f) {
  for (var i=0; i < items.length; i++) {
    var item = items[i];
    console.log("item:", item);
    if (f(item)) return item;
  };
  return null; // how to properly return 
}


// ifAttributeExist tests is attribute exists in the record
var ifAttributeExistInRecord = function(attributeToFind, record) {
    console.log("ifAttributeExistInRecord:function start")
    
    console.log("ifAttributeExistInRecord:", JSON.stringify(record));


    for (var attribute in record) {
        console.log("ifAttributeExistInRecord: Testing:", attribute);

        if ( (attributeToFind.localeCompare(attribute) == 0) ) { // Yes it equal
            console.log("ifAttributeExistInRecord: Found:", attribute);
            return attribute;
        }

    }
    return null; // returns null if the attribute is not found
}


//If the attribute exists in the record in another upper / lower case mix. 
var ifAttributeCaseExistInRecord = function(attributeToFind, record) {

    console.log("ifAttributeCaseExistInRecord:", JSON.stringify(record));

    attributeToFind = attributeToFind.toUpperCase(); // convert to uppercase
    for (var attribute in record) {
        console.log("ifAttributeCaseExistInRecord: Testing:", attribute.toUpperCase());
          if ( attributeToFind.localeCompare(attribute.toUpperCase()) == 0) {// Yes it equal
             console.log("ifAttributeCaseExistInRecord: Found:", attribute);
            return attribute; // returns the attribute if found
          }
    }
    return null; // returns null if the attribute is not found    

}




//If there are aliases for tehe attribute in the record. If so then return it
var ifAttributeAliasInRecord= function(attributeToFind, record) {


    var oflineAttributeAlias = require("oflineAttributeAlias"); // get the usual suspects from file
    console.log("ifAttributeAliasInRecord JSON",JSON.stringify(oflineAttributeAlias));

    //Now get just the aliases for the attribute we are searcing for
   //var arrayOfAliases = findDatasetMappingRecord(record, attributeToFind);

    console.log("attributeToFind -3->",attributeToFind)
    var arrayOfAliases = findDatasetMappingRecord(oflineAttributeAlias, function(x) {return x.name == attributeToFind;});
    //var arrayOfAliases = record[attributeToFind]; //

    console.log("ifAttributeAliasInRecord Array",JSON.stringify(arrayOfAliases));   

    if (arrayOfAliases != null) { // We have a alias array for this attribute

        for (var attribute in record) { // loop trugh the record 
            console.log("ifAttributeAliasInRecord: Testing:", attribute);

            var number = arrayOfAliases.indexOf(attribute); // See if the current attribute is in the array
            if (number !=0) { // Yes the attribute is an alias

                console.log("ifAttributeAliasInRecord: Found:", arrayOfAliases[number] );
                return arrayOfAliases[number];
            }

        }
    }
    return null; // returns null if the attribute is not found

}


//we just pick the first attribute that is not latitude or longitude. (or ID of some sort)
var jutstPickAnAttribute = function(record) {

    // This must be the most dirty code written - how the heck does string/array/json stuff work 


    for (var attribute in record) {
        console.log("jutstPickAnAttribute: Testing:",attribute);
        if ( ('LATITUDE'.localeCompare(nameField.toUpperCase(attribute)) !=0) && ('LONGITUDE'.localeCompare(nameField.toUpperCase(attribute)) && ('_ID'.localeCompare(nameField.toUpperCase(attribute))) !=0) && ('ID'.localeCompare(nameField.toUpperCase(attribute))) !=0) {
            console.log("jutstPickAnAttribute: Found:", attribute );
                return attribute;
        }

    }
        return null; // returns null if the attribute is not found
}






var replaceDatasetFields = function(myresourceid, inputDataset) {


    //First see if there is a "name" attribute in the record
    
    var firstRecord = inputDataset[0];
    //console.log(JSON.stringify(firstRecord));

    
console.log("debugger replaceDatasetFields");
debugger; //breakpoint 


    var isNameField = ifAttributeExistInRecord("name", firstRecord);
    console.log("replaceDatasetFields", isNameField);
    if ( null == isNameField )  {   //There is not a "name" field - lets deal with it

        //First check if  theere is a uppercase variant of the name field 
        var nameInCase = ifAttributeCaseExistInRecord("name", firstRecord); 
        if (nameInCase != null) {  // Great. There is a "name" field. It is just in a different case
            nameInCase = "\"" + nameInCase + "\":"; //easy to fix
            inputDataset = JSON.parse(JSON.stringify(inputDataset).split(nameInCase).join('"name":')); //change the attribute in the dataset

        } else { //Still have to see if we can find a way to fix "name" attribute

            // Lets see if there is a mapping for this spesiffic dataset 

            var tecMappings = require("tecmappings"); //Get the mapping table that is used to change field names
            //console.log(JSON.stringify(tecMappings));

            datasetMappingRecord = findDatasetMappingRecord(tecMappings, function(x) {return x.resource_id == myresourceid;}); // TODO: this must be placed outside along with the find function

            if (datasetMappingRecord != null) { //There is a mapping for this dataset. Go ahead and change the fields
                console.log("Det var en mapping for name i dette datasettet");
                var nameField = "\"" + datasetMappingRecord.nameField + "\":";
                var descriptionField = "\"" + datasetMappingRecord.descriptionField  + "\":";
                
                //Then replacing the Namefield 
                inputDataset = JSON.parse(JSON.stringify(inputDataset).split(nameField).join('"name":'));
                inputDataset = JSON.parse(JSON.stringify(inputDataset).split(descriptionField).join('"description":'));       
                console.log("replaceDatasetFields: Replaced name and description so that its visible when clicking on a map pin");
            } else { //see if there is a field in the record that has a fieldname that is an alias of name
                var attributeAlias = ifAttributeAliasInRecord("name", firstRecord); // Is there a alias for "name" in one of the attributes 
                if (attributeAlias =! null){
                    attributeAlias = "\"" + attributeAlias  + "\":";
                    //Then replacing the Namefield 
                    inputDataset = JSON.parse(JSON.stringify(inputDataset).split(attributeAlias).join('"name":'));
                    console.log("replaceDatasetFields: Renamed a alias fielad to name so that its visible when clicking on a map pin");
                } else { // shit. now we just pick the first field that is not latitude or longitude. (or ID of some sort)


                        var pickedAttribute = jutstPickAnAttribute(firstRecord); 
                        if (pickedAttribute =! null){
                            pickedAttribute = "\"" + pickedAttribute  + "\":";
                            //Then replacing the Namefield 
                            inputDataset = JSON.parse(JSON.stringify(inputDataset).split(pickedAttribute).join('"name":'));
                            console.log("replaceDatasetFields: Just picked an attribute and renamed it to name so that its visible when clicking on a map pin");
                        } else { //even more shit. This dataset just contains latitude / longitude
                            // how do we add a attribute named name to the dataset and then number it?
                            console.log("replaceDatasetFields: This dataset just contains latitude / longitude. ");

                        }


                }



            }
        }

    }

    return inputDataset;
}









this.onParameterChanged((param) => { //if the user has selected another dataset 

    if (1==1) {
        // we are fetching data from the server


        // This code fetches data from the ckan server
    	getResourceForMaps(param.resources[0].id)()
    		.then((response) => {
        		myresourceid = param.resources[0].id; //The id of the dataset
                datasetItemList.replaceAll(replaceDatasetFields(myresourceid, response));  

    		})
    		.catch((error) => {
    			console.log(error.message)
    		})

    }
    else { //we are fatching data from a local file for debugging

        var oflineDataset = require("oflineDataset"); //Get the demo dataset from disk
        console.log("OflineDataset- NILU dataset");


        myresourceid ="ff7ad62e-e837-41cb-8e6b-fb4dc8af6adc" //The id of the dataset on file is NILU
        datasetItemList.replaceAll(replaceDatasetFields(myresourceid, oflineDataset));  


      
    }


})


const goBack = () => {
	router.goBack()
}
module.exports = {
	goBack,
	datasetItemList
}
