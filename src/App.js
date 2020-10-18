import React from 'react';
import './App.scss';
import Board from './Board.js';
import { render } from "react-dom";

/**runner class**/
class App extends React.Component{
    render() {
        return (
            <Board />
        );
    }
}

export default App;
