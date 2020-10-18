import React, { Component } from 'react';
import { render } from "react-dom";

var createReactClass = require('create-react-class');

var Square = createReactClass({
    render () {
        var h = this.props.highlights[this.props.rowInd][this.props.colInd];
        var add;
        if (h === 'h'){
            add = 'h';
        }
        else{
            add = this.props.square;
        }
        return (
            <div className={"square"}>
                <div className={h} onClick={() => this.props.handleClick(this.props.rowInd, this.props.colInd)} className={"piece piece-"+add}></div>
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
                        return(<Square highlights={this.props.highlights} square={square} rowInd={this.props.rowInd} colInd={colInd} handleClick={this.props.handleClick}/>)
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
         black: 12,
         white: 12,
         currentPlayer: -1,
         currentPiece: [],
         moves: [],
        };

        this.findMoves = this.findMoves.bind(this);
        this.updateStats = this.updateStats.bind(this);
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

    handleClick(rowInd, colInd) {
        /**if this is a highlighted cell that we are moving too**/
        var tempBoard = Array.from(this.state.board);
        var tempHigh = Array.from(this.state.highlights);

        if (this.state.highlights[rowInd][colInd] === 'h') {
            tempBoard[this.state.currentPiece[0]][this.state.currentPiece[1]] = 0
            tempBoard[rowInd][colInd] = this.state.currentPlayer;

            //make all deletes
            tempBoard[this.state.currentPiece[0]][this.state.currentPiece[1]] = 0;

            //make a deletion if we made a jump
            var jump = false;
            if (this.state.currentPiece[1]-colInd===-2) {
                var rem_row = this.state.currentPiece[0]+this.state.currentPlayer;
                var rem_col = colInd-1;
                tempBoard[rem_row][rem_col] = 0;
                jump=true;
            }

            else if (this.state.currentPiece[1]-colInd===2) {
                var rem_row = this.state.currentPiece[0]+this.state.currentPlayer;
                var rem_col = colInd+1;
                tempBoard[rem_row][rem_col] = 0;
                jump = true;
            }

            //unhighlight everything
            this.state.moves.map((loc, ind) => {
                tempHigh[loc[0]][loc[1]] = '';
            });


            this.setState({currentPlayer: this.state.currentPlayer*-1});
            this.setState({board: tempBoard});
            this.setState({highlights: tempHigh});

            if (jump) {
                this.updateStats(this.state.board, this.state.currentPlayer);
            }
        }
        /**handles case if we are highlighting**/
        else if (this.state.board[rowInd][colInd] === this.state.currentPlayer){
            this.state.moves.map((loc, ind) => {
                tempHigh[loc[0]][loc[1]] = '';
            });

            var local_moves = this.findMoves(rowInd, colInd);

            local_moves.map((loc, ind) => {
                tempHigh[loc[0]][loc[1]] = 'h';
            });

            this.setState({currentPiece: [rowInd, colInd]})
            this.setState({moves: local_moves});
            this.setState({highlights: tempHigh});

        }
    }

    findMoves(rowInd, colInd) {
         var dir = this.state.board[rowInd][colInd];
         var moves = [];

         if (dir === 0) {
            return (false);
         };

         /**find empty squares*/
         /**for loop or hard code, but since we're only checking 2 squares max on each side, I will just use conditionals to find the squares instead of a for loop**/
         if (-1<rowInd+dir && rowInd+dir<8) {
            if (colInd-1>-1) {
                if (this.state.board[rowInd+dir][colInd-1]!==dir) {
                     var left=[rowInd+dir, colInd-1];

                     /**but if this spot is taken by opponent, check if we have a jump case**/
                     if(this.state.board[left[0]][left[1]]===dir*-1 && (left[0]+dir<8 && -1<left[0]+dir) && (-1<left[1]-1) && this.state.board[left[0]+dir][colInd-1]===0) {
                        left = [rowInd+2*dir, colInd-2];
                     }
                     if (this.state.board[left[0]][left[1]]===0) {
                        moves.push(left);
                     }

                }
            }

            if (colInd+1<8) {
                if (this.state.board[rowInd+dir][colInd+1]!==dir) {
                     var right=[rowInd+dir, colInd+1];

                     /**but if this spot is taken by opponent, check if we have a jump case**/
                     if(this.state.board[right[0]][right[1]]===dir*-1 && (right[0]+dir<8 && -1<right[0]+dir) && (-1<right[1]+1) && this.state.board[right[0]+dir][colInd+1]===0) {
                        right = [rowInd+2*dir, colInd+2];
                     }
                     if (this.state.board[right[0]][right[1]]===0) {
                        moves.push(right);
                     }
                }
            }
         }

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
                    return(<Row highlights={this.state.highlights} handleClick={this.handleClick.bind(this)} rowInd={ind} rowArr={row}/>);
                })
                }
                <h3>White: {this.state.white}</h3>
                <h3>Black: {this.state.black}</h3>
            </div>
        );
    }
}

export default Board;