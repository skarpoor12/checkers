import React, { Component } from 'react';
import { render } from "react-dom";

var createReactClass = require('create-react-class');

var Square = createReactClass({
    render () {
        var h = this.props.highlights[this.props.rowInd][this.props.colInd];
        var add;
        var king = '';
        if (h === 'h'){
            add = 'h';
        }
        else if (this.props.square.length > 0) {
            add = this.props.square[0];
            king = 'k';
        }
        else{
            add = this.props.square;
        }
        var id = [this.props.rowInd, this.props.colInd];
        if (this.props.square === -1) {
            var canDrag='true';
        }

        return (
            <div className={"square"} key={id} onDragOver={(e)=>this.props.dragOver(e)}
                onDrop={(e)=>this.props.onDrop(e, id)}>
                <div key={id} onDragStart={(e) => this.props.dragStart(e, id)} draggable={canDrag}
                className={h} onMouseLeave={() => this.props.unHighlight(this.props.rowInd, this.props.colInd)} onMouseEnter={() => this.props.handleHover(this.props.rowInd, this.props.colInd)} className={"piece piece-"+add+king}></div>
            </div>
        );
    }
});


var Row = createReactClass({
    /**build row by looping through 8 squares, list is passed from Board**/
    /**rowArr comes from Board**/
    render() {
        return (
            <div className={"row"}>
                {this.props.rowArr.map((square, colInd) => {
                        return(<Square highlights={this.props.highlights} square={square} rowInd={this.props.rowInd} colInd={colInd} unHighlight={this.props.unHighlight} handleHover={this.props.handleHover} dragOver={this.props.dragOver} dragStart={this.props.dragStart} onDrop={this.props.onDrop}/>)
                })
            }
            </div>
        )
    }
});

class Popup extends React.Component {
      render() {
            return (
            <div className='popup'>
            <div className='popup-inner'>
            <h1>{this.props.text}</h1>
            <button onClick={this.props.closePopup}>close me</button>
            </div>
            </div>
    );
    }
}


class Board extends React.Component {
    constructor(props) {
        super(props);
        /**Could use a for loop to initialize, but given it's 8x8 every time, I'll just hard code for the initial state**/
        var canJump = [false, []];
        this.state =  {
        /**how we keep track of pieces, because arrays are nice for indexing**/
        /**values represent directions that they can move, +1 is down, -1 is up**/
         board: [[0, 1, 0, 1, 0, 1, 0, 1],
                       [1, 0, 1, 0, 1, 0, 1, 0],
                       [0, 1, 0, 1, 0, 1, 0, 1],
                       [0, 0, 0, 0, 0, 0, 0, 0],
                       [0, 0, 0, 0, 0, 0, 0, 0],
                       [-1, 0, -1, 0, -1, 0, -1, 0],
                       [0, -1, 0, -1, 0, -1, 0, -1],
                       [-1, 0, -1, 0, -1, 0, -1, 0]],
         highlights: [['','','','','','','','',],
                      ['','','','','','','','',],
                      ['','','','','','','','',],
                      ['','','','','','','','',],
                      ['','','','','','','','',],
                      ['','','','','','','','',],
                      ['','','','','','','','',],
                      ['','','','','','','','',]],
         black: 12,
         white: 12,
         currentPlayer: -1,
         currentPiece: [],
         moves: [],
         victory: "",
         showPopup: false
        };

        this.dragOver=this.dragOver.bind(this);
        this.dragStart=this.dragStart.bind(this);
        this.onDrop=this.onDrop.bind(this);
        this.unHighlight=this.unHighlight.bind(this);

    }

    dragOver(ev) {
        ev.preventDefault();
    }

    dragStart(ev, id) {
        ev.dataTransfer.setData("id", id);
    }

    onDrop(ev, newId) {
        var rowId = newId[0];
        var colId = newId[1];
        var tempBoard = [];

        /**moves contains the possible moves that dragged object can go to**/
        /**if drop is one of these moves, then we let the drop happen**/
        this.state.moves.map((move, i) => {
            if (move[0]===rowId && move[1]===colId) {
                tempBoard = this.handleClick(rowId, colId, this.state.currentPiece);
                this.aimove(tempBoard);
            }
        });

    }
    updateStats(board, currentPlayer) {
        /**decrease 1 from opponent**/
        if (currentPlayer===-1) {
            var change = this.state.black-1;
            this.setState({black: change});
        }
        else {
            var change = this.state.white-1;
            this.setState({white: change});
        }
    }

    unHighlight() {
        //unhighlight everything
        var tempHigh = Array.from(this.state.highlights);
        this.state.moves.map((loc, ind) => {
            tempHigh[loc[0]][loc[1]] = '';
        });

        this.setState({highlights: tempHigh});
    }

    handleHover(rowInd, colInd) {
        var tempHigh = Array.from(this.state.highlights);
        if (this.state.board[rowInd][colInd] === this.state.currentPlayer){
            this.state.moves.map((loc, ind) => {
                tempHigh[loc[0]][loc[1]] = '';
            });

            var local_moves = this.findMoves(rowInd, colInd, this.state.board);

            local_moves.map((loc, ind) => {
                tempHigh[loc[0]][loc[1]] = 'h';
            });

            this.setState({currentPiece: [rowInd, colInd]})
            this.setState({moves: local_moves});
            this.setState({highlights: tempHigh});

        }
    }

    aimove(tempBoard) {
        /**if you can make a jump, make a jump**/
        var possible = []
        var rowId;
        var colId;
        this.setState({currentPlayer: 1});
        var currentpiece = []

        for (let i=0; i<this.state.board.length; i++) {
            for (let j=0; j<this.state.board[i].length; j++) {
                if (tempBoard[i][j]===1) {
                    possible = this.findMoves(i, j, tempBoard);
                    if (this.canJump[0]) {
                        currentpiece = [i, j]
                        this.handleClick(this.canJump[1][0], this.canJump[1][1], currentpiece);
                        return true;
                    }
                }
            }
        }

        function getRandomInt(max) {
          return Math.floor(Math.random() * Math.floor(max));
        }

        /**otherwise, choose a random piece and move**/
        var i;
        var j;
        while (true) {
            i = getRandomInt(8);
            j = getRandomInt(8);
            if (this.state.board[i][j]===1) {
                    possible = this.findMoves(i, j, tempBoard)
                    if (possible.length > 0){
                        currentpiece = [i,j];

                        this.handleClick(possible[0][0], possible[0][1], currentpiece);
                        return true;
                    }
                }
        }


    }

    winDetection() {
        var message = "Game is ongoing";
        if (this.state.white<1) {
            message = "Computer won! Better luck next time...";
        }
        else if (this.state.black<1) {
            message = "Nice work! You outsmarted the AI!";
        }
        return message;
    }

    handleClick(rowInd, colInd, current) {
        /**if this is a highlighted cell that we are moving too**/
        var value = this.state.board[current[0]][current[1]];
        var tempBoard = Array.from(this.state.board);
        var tempHigh = Array.from(this.state.highlights);


        /**check if it's a King**/
        if ((rowInd===0 && value===-1) ||  (rowInd===0 && value===-1)){
            tempBoard[rowInd][colInd] = [value, -1*value];
        }
        else {
            tempBoard[rowInd][colInd] = value;
        }
        tempBoard[current[0]][current[1]] = 0;

        //make all deletes
        tempBoard[current[0]][current[1]] = 0;

        //make a deletion if we made a jump
        var jump = false;
        if (current[1]-colInd===-2) {
            var rem_row = current[0]+value;
            var rem_col = colInd-1;
            tempBoard[rem_row][rem_col] = 0;
            jump=true;
        }

        else if (current[1]-colInd===2) {
            var rem_row = current[0]+value;
            var rem_col = colInd+1;
            tempBoard[rem_row][rem_col] = 0;
            jump = true;
        }

        this.unHighlight();

        /**triggers render**/
        this.setState({currentPlayer: value*-1});
        this.setState({board: tempBoard});


        if (jump) {
            this.updateStats(this.state.board, value);
        }

        this.winDetection();

        return (tempBoard);

    }


    findMoves(rowInd, colInd, tempBoard) {

         var dir = this.state.board[rowInd][colInd];
         if (dir.length === 2) {
            dir = dir[0];
         }
         var moves = [];

         if (dir === 0) {
            return (false);
         };


         /**find empty squares*/
         /**for loop or hard code, but since we're only checking 2 squares max on each side, I will just use conditionals to find the squares instead of a for loop**/
         if (-1<rowInd+dir && rowInd+dir<8) {
            this.canJump = [false, []];
            if (colInd-1>-1) {
                if (tempBoard[rowInd+dir][colInd-1]!==dir) {
                     var left=[rowInd+dir, colInd-1];

                     /**but if this spot is taken by opponent, check if we have a jump case**/
                     if(tempBoard[left[0]][left[1]]===dir*-1 && (left[0]+dir<8 && -1<left[0]+dir) && (-1<left[1]-1) && tempBoard[left[0]+dir][colInd-1]===0) {
                        left = [rowInd+2*dir, colInd-2];
                        if (tempBoard[left[0]][left[1]]===0){
                            this.canJump = [true, left];
                            moves.push(left);
                        }

                     }
                     else if (tempBoard[left[0]][left[1]]===0) {
                        moves.push(left);
                     }

                }
            }

            if (colInd+1<8) {
                if (tempBoard[rowInd+dir][colInd+1]!==dir) {
                     var right=[rowInd+dir, colInd+1];

                     /**but if this spot is taken by opponent, check if we have a jump case**/
                     if(tempBoard[right[0]][right[1]]===dir*-1 && (right[0]+dir<8 && -1<right[0]+dir) && (-1<right[1]+1) && tempBoard[right[0]+dir][colInd+1]===0) {
                        right = [rowInd+2*dir, colInd+2];
                        if (tempBoard[right[0]][right[1]]===0){
                            this.canJump = [true, right];
                            moves.push(right);
                        }

                     }
                     else if (tempBoard[right[0]][right[1]]===0) {
                        moves.push(right);
                     }
                }
            }
         }

         if (dir.length === 2) {
            moves.push(this.findMoves(rowInd, colInd, tempBoard));
         }

         return(moves);
    }

    togglePopup() {
        this.setState({
             showPopup: !this.state.showPopup
        });
    }

    /**build the entire board, which is a bunch of rows**/
    render() {
        var rowInd;
        var rowArr;
        var message = this.winDetection();



        return(
            <div className="container">
                {
                this.state.board.map((row, ind) => {
                    //dragOver(ev), dragStart(ev, id), onDrop(ev)
                    return(<Row highlights={this.state.highlights} unHighlight={this.unHighlight.bind(this)} dragOver={this.dragOver.bind(this)} dragStart={this.dragStart.bind(this)} onDrop={this.onDrop.bind(this)} handleHover={this.handleHover.bind(this)} rowInd={ind} rowArr={row}/>);
                })
                }
                <button onClick={this.togglePopup.bind(this)}>Instructions</button>
                {this.state.showPopup ?
                    <Popup
                              text="Hover on a checker to see possible moves. Drag your piece to make your move. Wait for the evil AI to make its move. Once you or the AI has captured all enemy checkers, a victory message will display below! Good luck!"
                              closePopup={this.togglePopup.bind(this)}
                    />
                    : null
                    }
                <h3>{message}</h3>
                <h3>White: {this.state.white}</h3>
                <h3>Black: {this.state.black}</h3>

            </div>
        );
    }
}

export default Board;