DEBUG=false;

// table manipulation functions
function setCanvas(canvas_id) {
    g_canvas_id = canvas_id;
}

function getCanvas(canvas_id) {
    return g_canvas_id;
}

function cellId(c, r) {
    canvas_id = getCanvas();
    return canvas_id + c + ',' + r;
}
    
function setClass(cls, x, y) {
    var id = cellId(x,y);
    var el = document.getElementById(id);
    if ( ! el ) {
	alert('setClass for empty element at '+id);
	return null;
    }
    el.className = "cell " + cls;
}

function getClass(x, y) {
    var id = cellId(x,y);
    var el = document.getElementById(id);
    if ( ! el ) {
	//alert("no cell at "+id);
	return null;
    }
    var cls = el.className.split(' ');
    if (cls[0] != 'cell' ) {
	//alert("bad cell class: "+cls[0]);
	return null;
    }
    return cls[1];
}

function createCanvas(canvas_id, cols, rows) {
  var r, c;
  var elBoard = document.getElementById(canvas_id);
  var sBoard = '<table id="'+canvas_id+'_canvas" class="canvas">\n';
  
  setCanvas(canvas_id);

  for (r=0; r<rows; r++) {
    sBoard += "<tr>\n";
    for (c=0; c<cols; c++) {    
      id = cellId(c,r);
      if ( DEBUG ) {
	  sBoard += "<td id='"+id+"' class='cell empty'>"+c+","+r+"</td>\n";
      } else {
	  sBoard += "<td id='"+id+"' class='cell empty'></td>\n";
      }
    }
    sBoard += "</tr>\n";
  }
  sBoard += "</table>\n";

  elBoard.innerHTML= sBoard;
}

function moveRect(top_left, bottom_right, translation) {
    var left = top_left[0];
    var top = top_left[1];
    var right = bottom_right[0];
    var bottom = bottom_right[1];
    var delta_x = translation[0];
    var delta_y = translation[1];
    
    var clipboard = [];

    //build a copy of the affected cells
    // and erase the source area
    for (var x=left; x<=right; x++) {
	clipboard[x-left] = [];
	for (var y=top; y<=bottom; y++) {
	    clipboard[x-left][y-top] = getClass(x, y);
	    setClass('empty', x, y);
	}
    }
    // write the cells to the destination area
    for (var x=0; x<=right-left; x++) {
	for (var y=0; y<=bottom-top; y++) {
	    cls = clipboard[x][y];
	    setClass(cls, x+left+delta_x, y+top+delta_y);
	}
    }
}


function matrixtestsetup() {
    createCanvas(10,10);

    setClass('square', 1,1);
    setClass('square', 2,1);
    setClass('square', 1,2);
    setClass('square', 2,2);
}

function matrixtestrun() {
    moveRect([1,1], [2,2], [4,3]);
}