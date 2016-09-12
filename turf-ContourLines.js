function calculateTIN() {
	// generate some random point data
	var vertices = turf.random('points', 30, {
		bbox: [-10, 20, 10, 40]
	});
	//var vertices=turf.featureCollection(points);
	//console.log(JSON.stringify(vertices));
	//=points
	// add a random property to each point between 0 and 9
	for (var i = 0; i < vertices.features.length; i++) {
		vertices.features[i].properties.z = ~~(Math.random() * 9);
	}

	var min=vertices.features[0];
	for(var i = 1; i < vertices.features.length; i++){
		min=(min.properties.z<vertices.features[i].properties.z)?min:vertices.features[i];
	}
	//console.log("lowest point "+JSON.stringify(min));

	var max=vertices.features[0];
	for(var i = 1; i < vertices.features.length; i++){
		max=(max.properties.z>vertices.features[i].properties.z)?max:vertices.features[i];
	}
	//console.log("highest point "+JSON.stringify(max));

	var tin = turf.tin(vertices, 'z');
			
	

	//=tin
	//console.log(JSON.stringify(contourLines));
	//console.log(JSON.stringify(tin));
	return [tin, min, max];
}

function generateContourLines(tin, min, max){
	var z=min.properties.z;
	var verticesContourLines={};
	var contourLines={};
	while(z<=max.properties.z){
		var sameLevelPoints=[];
		for( var i =0; i < tin.features.length; i++){
			var edges=tin.features[i].properties;
			var coords;
			if((z>=edges.a && z<=edges.b) || (z<=edges.a && z>=edges.b)){
				coords=getCoordsForZ(z, tin.features[i].geometry.coordinates[0][0], tin.features[i].geometry.coordinates[0][1], edges.a, edges.b);
				sameLevelPoints.push(turf.point(coords, {"z": z}));
			}
			if((z>=edges.b && z<=edges.c) || (z<=edges.b && z>=edges.c)){
				coords=getCoordsForZ(z, tin.features[i].geometry.coordinates[0][1], tin.features[i].geometry.coordinates[0][2], edges.b, edges.c);
				sameLevelPoints.push(turf.point(coords, {"z": z}));
			}
			if((z>=edges.c && z<=edges.a) || (z<=edges.c && z>=edges.a)){
				coords=getCoordsForZ(z, tin.features[i].geometry.coordinates[0][2], tin.features[i].geometry.coordinates[0][3], edges.c, edges.a);
				sameLevelPoints.push(turf.point(coords, {"z": z}));
			}
		}
		verticesContourLines[z]=sameLevelPoints;
		//console.log(JSON.stringify(sameLevelPoints));
		var coordContourLines=[];
		for(var i=0; i<sameLevelPoints.length ; i++){
			coordContourLines.push(sameLevelPoints[i].geometry.coordinates);
		}
		contourLines[z]=turf.lineString(coordContourLines, {"z" : z});
		z+=2;
	}

	return contourLines;
}

function getCoordsForZ(z, vertex1, vertex2, zmin, zmax){
	var ratioZ=(z-zmin)/(zmax-zmin);
	var coords=[];
	coords[0]=ratioZ*(vertex2[0]-vertex1[0])+vertex1[0];
	coords[1]=ratioZ*(vertex2[1]-vertex1[1])+vertex1[1];
	return coords;
}