// shapetools.js
// a library building on matrixtools.js
// 

// a shape object has these members:
// 'name' is the name of the shape and should have
//   CSS information associated with it defining how
//   cells belonging to this shape should be drawn
// 'offsets' is an Array of [x,y] pairs describing
//   the relative positions of pixels in this shape
// 'location' an [x,y] pair that fixes the shape in 
//   the drawable space.  the cell described at [0,0]
//   of 'offsets' will be drawn at [x,y]

shape = {
    name: 'shape_name',
    offsets: [],
    location: []
}


function getAbsCoords(shape) {
    // generate the set of absolute coordinates for the shape
    var coords = [];
    for (var i=0; i<4; i++) {
	x = shape.offsets[i][0] + shape.location[0];
	y = shape.offsets[i][1] + shape.location[1];
	coords[i] = [x,y];
    }
    return coords;
}


function check (shape) {
    // check the absolute location of the shape
    // to ensure that it occurs inside of our drawable space
    var coords = getAbsCoords(shape);
    for (var i=0; i<4; i++) {
	cls = getClass(coords[i][0], coords[i][1]);
	if ( !cls || cls != "empty") {
	    return false;
	}
    }
    return true;
}

function erase(shape) {
    // fill the shape with the background color
    var coords = getAbsCoords(shape);
    for (var i=0; i<4; i++) {
	x = coords[i][0];
	y = coords[i][1];
	setClass("empty", x, y);x
    }
}

function draw(shape) {
    // fill the shape with its foreground color
    var coords = getAbsCoords(shape);
    for (var i=0; i<4; i++) {
	x = coords[i][0];
	y = coords[i][1];
	setClass(shape.name, x, y);
    }
}
 
function move(shape, delta_x, delta_y) {
    // translate the shape laterally
    shape.location[0]+=delta_x;
    shape.location[1]+=delta_y;
    if ( ! check(shape) ) {
	shape.location[0]-=delta_x;
	shape.location[1]-=delta_y;
	return 0;
    }
    return 1;
}

function rotate (shape) {
    // rotate the shape in the global variable 'shape' 90 degrees
    // ensure that all of the offsets of the shape are positive
    //  at the end of the rotation.
  res = []
  var x_shift = 0, y_shift = 0;

  savedOffsets = shape.offsets.slice(0);

  // first, rotate the shape around it's upper left (local 0,0) cell
  for (var i=0; i<4; i++) {
    old_x = shape.offsets[i][0]; old_y = shape.offsets[i][1];
    new_x = old_y; new_y = -old_x;
    if (new_x < x_shift) {
     x_shift = new_x;
    }
    if (new_y < y_shift) {
      y_shift = new_y;
    }  
    shape.offsets[i] = [new_x, new_y];
  }

  // now shift the shape down and right if needed
  for (i=0; i<4; i++) {
    shape.offsets[i][0] += x_shift;
    shape.offsets[i][1] -= y_shift;
  }  

  if ( ! check(shape) ) {
      shape.offsets = savedOffsets;
      return 0;
  }
  return 1;
}


