const Observable = require('FuseJS/Observable')
const ckan = require('ckan')
const compose = require('node_modules/citapplab/lib/bundle').compose
const {
	limit, 
	packages,
	tag
} = ckan

const datasetList = Observable()

const getPackagesWithTag = compose(
	packages,
	limit(100),
	tag('Kart')
)
    

if (1==0) {
	getPackagesWithTag()
		.then((response) => {
			datasetList.replaceAll(response)
		})
		.catch((error) => {
			console.log(error.message)
		})
}
else { // we are using the simulator

	var oflineDatasetList = require("oflineDatasetList"); //Get the data from file - for simpler debuging
	datasetList.replaceAll(oflineDatasetList)
	console.log("oflineDatasetList");
}



const showMapList = (argument) => {
	console.log("showMapList");
	router.push('mapListView', argument.data)
}

const showMapView = (argument) => {
	console.log("showMapView");
	router.push('mapView', argument.data)
}


module.exports = { 
	datasetList,
	showMapList,
	showMapView
}