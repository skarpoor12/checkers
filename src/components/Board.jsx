import React, { Component } from 'react';
import { render } from "react-dom";

var createReactClass = require('create-react-class');

var Square = createReactClass({
    render () {
        var highlight = this.props.highlights[this.props.rowInd][this.props.colInd];
        return (
            <div className={"square square-"+this.props.colInd}>
                <div className={"highlight-"+{highlight}} onClick={() => this.handleClick(this.props.rowInd, this.props.colInd)} className={"piece-"+this.props.square}></div>
            </div>
        );
    }
});


var Row = createReactClass({
    /**build row by looping through 8 squares, list is passed from Board**/
    /**rowArr comes from Board**/
    render() {
        return (
            <div className={"row row-"+this.props.rowInd}>
                {this.props.rowArr.map((square, colInd) => {
                        return(<Square highlights={this.props.highlights} square={square} rowInd={this.props.rowInd} colInd={colInd}/>)
                })
               }
            </div>
        )
    }
});

class Board extends React.Component {
    constructor(props) {
        super(props);
        /**Could use a for loop to initialize, but given it's 8x8 every time, I'll just hard code for the initial state**/
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
         currentPlayer: -1,
         currentPiece: [],
         moves: []
        };
        this.handleClick = this.handleClick.bind(this);
        this.findMoves = this.findMoves.bind(this);
    }

    handleClick(rowInd, colInd) {
        /**if this is a highlighted cell that we are moving too**/
        if (this.state.highlights[rowInd][colInd] === 'm' || this.state.highlights[rowInd][colInd] === 'j') {
            this.state.board[this.state.currentPiece[0]][this.state.currentPiece[1]] = 0;
            this.state.board[rowInd][colInd] = this.state.currentPlayer;

            //make all deletes
            this.state.board[this.state.currentPiece[0]][this.state.currentPiece[1]] = 0;
            //make a deletion if we made a jump
            if (colInd-this.state.currentPiece[1]===-2) {
                var rem_row = rowInd+this.state.currentPlayer;
                var rem_col = colInd+1;
                this.state.board[rem_row][rem_col] = 0
            }
            else if (colInd-this.state.currentPiece[1]===2) {
                var rem_row = rowInd+this.state.currentPlayer;
                var rem_col = colInd-1;
                this.state.board[rem_row][rem_col] = 0
            }

            //unhighlight everything
            this.state.moves.map((loc, ind) => {
                this.state.highlights[loc[0]][loc[1]] = '';
            });


            this.state.currentPlayer = this.state.currentPlayer*-1;
        }
        /**handles case if we are highlighting**/
        else if (this.state.board[rowInd][colInd] === this.state.currentPlayer){
            this.state.moves = this.findMoves(rowInd, colInd);

            this.state.moves.map((loc, ind) => {
                this.state.highlights[loc[0]][loc[1]] = 'h';
            });

            this.state.currentPiece.push(rowInd);
            this.state.currentPiece.push(colInd);
        }
    }

    findMoves(rowInd, colInd) {
         var dir = this.board[rowInd][colInd];
         var moves = [];

         if (dir === 0) {
            return (false);
         };
         /**just find empty squares*/
         if (0<=rowInd+dir<8) {
            if (colInd-1>0) {
                var left = [rowInd+dir, colInd-1];
            }
            if (colInd+1<8) {
                var right = [rowInd+dir, colInd+1];
            }
         }

         if (this.board[left[0]][left[1]]!==0 && 0<=left[0]+dir<8 && 0<=left[1]-1<8) {
            if (this.board[left[0]][left[1]]===dir*-1 && this.board[left[0]+dir][left[1]-1]===0) {
                left = [left[0]+dir, left[1]-1];
            };
         };
         moves.push(left);

         if (this.board[right[0]][right[1]]!==0 && 0<=right[0]+dir<8 && 0<=right[1]+1<8) {
            if (this.board[right[0]][right[1]]===dir*-1 && this.board[right[0]+dir][right[1]+1]===0) {
                right = [right[0]+dir, right[1]+1];
            }
         };
         moves.push(right);

         return(moves);
    }

    /**build the entire board, which is a bunch of rows**/
    render() {
        var rowInd;
        var rowArr;

        return(
            <div className="container">
                {
                this.state.board.map((row, ind) => {
                    return(<Row highlights={this.state.highlights} rowInd={ind} rowArr={row}/>);
                })
                }
            </div>
        );
    }
}

export default Board;