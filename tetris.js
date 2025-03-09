//constants

ROWS=22;
COLS=10;

STATS_BLOCKS = 10;

LEFT='a';
RIGHT='d';
DOWN='s';
ROTATE='w';
PAUSE='p';
DROP=' ';

PIECE_DEFS =
    [
     {
	 name: 'square',
	 offsets : [
		   [0,0], [0,1], [1,0], [1,1]
		    ]
     },
     {
	 name: 'rightEl',
	 offsets: [
		  [0,0],  [0,1], [0,2], [1,2]
		  ]
     },
     {
	 name: 'leftEl',
	 offsets: [
		  [1,0],  [1,1], [1,2], [0,2]
		  ]
     },
     {
	 name: 'rightEs',
	 offsets: [
		  [0,0],  [0,1], [1,1], [1,2]
		  ]
     },
     {
	 name: 'leftEs',
	 offsets: [
		  [1,0], [1,1], [0,1], [0,2]
		  ]
     },
     {
	 name: 'tee',
	 offsets: [
		  [0,1], [1,0], [1,1], [1,2]
		  ]
     },
     {
	 name: 'long',
	 offsets: [
		  [0,0],  [0,1], [0,2], [0,3]
		  ]
     }
     ];

config = {
    row_points : [0, 100, 250, 500, 1000],
    drop_points: 10,
    level_delays: [1000, 800, 640, 510, 400, 320, 240, 200, 180, 160, 140,
		   120, 100, 80, 64, 51, 40, 32, 24, 20, 18, 16, 14, 12, 10]
};


// holds game status
gameStatus = {
    level: 0,
    completed_rows: 0,
    score: 0,
    runstate: 'stop', // 'stop', 'pause', or 'run'
    piece_count : {'square': 0, 'long':0, 'tee':0, 'rightEl':0, 'leftEl':0,
                   'rightEs':0, 'leftEs':0}
};

function statusCalculate(rows, drop) {
    gameStatus.completed_rows += rows;
    gameStatus.level = Math.floor(gameStatus.completed_rows/10);
    gameStatus.score+=config.row_points[rows];
    gameStatus.score+=drop*config.drop_points;
}

function statusDraw(){
    var elScore = document.getElementById('score');
    var elRows = document.getElementById('rows');
    var elLevel = document.getElementById('level');

    elScore.innerHTML = gameStatus.score;
    elRows.innerHTML = gameStatus.completed_rows;
    elLevel.innerHTML = gameStatus.level;
}

function drawPreview(np) {
    setCanvas('preview');

    piece.location = [1,1];
    erase(piece);
    np.location = [1,1];
    draw(np);

    setCanvas('board');
}

function statsCalculate(piece) {
    gameStatus.piece_count[piece]++;
}



// piece manipulation
function newPiece(cls, location) {
    var p = {
    name: cls.name,
    offsets: cls.offsets.slice(0),
    location: location.slice(0)
  }
  return p;
}

function randomPiece() {
    var maxIdx = PIECE_DEFS.length;
    var choiceNum = Math.floor(Math.random()*maxIdx);
    var cls = PIECE_DEFS[choiceNum];
    return newPiece(cls, [0,0]);
}


function nextPiece() {
    piece = next_piece;
    piece.location = [4,0];
    next_piece = randomPiece();
    drawPreview(next_piece);
}
next_piece = randomPiece();


function gameOver() {
    stop();
    hideBoard("Game Over");
}


function lockPiece(drop) {
    // this piece is finished moving
    // lock the piece in place on the board
    // and modify the gameStatus (score, rowcount, level)
    // based on this piece
    draw(piece);
    var rows = checkRows();
    statusCalculate(rows, drop);
    statusDraw();
    statsCalculate(piece);

    nextPiece();
    if ( ! check(piece) ) {
	gameOver();
    }
    draw(piece);
}


function checkRows() {
    // look for full rows and remove them from the puzzle
    // return the number of rows removed
    var full_rows = [];
    var top_row = 0;

    for ( var i=ROWS-1; i>=0; i-- ) {
	var occupied_cells=0;
	for (var j=0; j<COLS; j++) {
	    var cls = getClass(j, i);
	    if ( cls && cls!='empty' ) {
		occupied_cells++;
	    }
	}
	if ( occupied_cells == COLS ) {
	    // this row is full
	    full_rows.push(i);
	} else if ( occupied_cells == 0 ){
	    //if this row is empty, all rows above are, too
	    top_row = i+1;
	    break;
	}

    }

    // the list was built bottom-up. go through top-down
    // or rows will move before we get to them!
    for (var k=full_rows.length-1; k>=0; k--) {
	var row=full_rows[k];
	moveRect([0, top_row], [COLS-1, row-1], [0,1]);
    }

    return full_rows.length;
}

//special event helpers
function pause() {
    switch (gameStatus.runstate) {
    case 'pause':
	gameStatus.runstate = 'run';
	showBoard();
	break;
    case 'run':
	gameStatus.runstate = 'pause';
	hideBoard("Paused");
	break;
    case 'stop':
	//do nothing
	break;
    }
}

function stop() {
    gameStatus.runstate = 'stop';
}


function moveDown() {
    // we need to implement special behavior if a move down fails,
    // so we're wrapping the call to 'move' here

    if ( ! move(piece, 0, 1) ) {
	lockPiece(1);
    }
}

function drop() {
    // move the piece down until it hits something
    var height = 0;
    while ( move(piece, 0, 1) ){
	height++;
    }
    lockPiece(height);
}


function showBoard() {
    var elBoard = document.getElementById('board');
    var elMessage = document.getElementById('menu');
    elMessage.className = 'hidden';
    elMessage.innerHTML = '';
}

function hideBoard(msg) {
    var elBoard = document.getElementById('board');
    var elMessage = document.getElementById('menu');
    elMessage.className = '';
    elMessage.innerHTML = msg;
}

//event handlers
function ticktock() {
	console.log('tick');
    if ( gameStatus.runstate == 'run') {
	erase(piece);
	moveDown();
	draw(piece);
    }
    var delay = config.level_delays[gameStatus.level];
    setTimeout("ticktock()", delay);
}


inHandler = false;
function keypress(e) {
	console.log('key');
    if ( inHandler ) {
	// this is pretty crappy locking, but it seems to work
	return;
    }
    inHandler = true;
    var keycode = e.which;
    var keychar = String.fromCharCode(keycode);
    if (keychar == PAUSE) {
	pause();
    } else if ( gameStatus.runstate != 'run' ) {
	// do nothing
    } else {
	erase(piece);
	switch (keychar) {
	case LEFT:
	    move(piece, -1, 0);
	    break;
	case RIGHT:
	    move(piece, 1,0);
	    break;
	case DOWN:
	    moveDown();
	    break;
	case DROP:
	    drop();
	    break;
	case ROTATE:
	    rotate(piece);
	    break;
	}

	draw(piece);
    }
    inHandler = false;
}

// main hook to start play
function play() {
	console.log('play');
    statusDraw();
    createCanvas('preview', 4, 6);
    //createCanvas('stats', PIECE_DEFS.length, STATS_BLOCKS);
    createCanvas('board', COLS, ROWS);

    gameStatus.runstate = 'run';
    nextPiece();
    ticktock();
}

