import React from 'react';
import './Game.css';

// piece of the board, identifiable by a number
function Square (props) {
  return (
    <button className='square' onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  
  renderRows(numberOfRows, numberOfCols) {
    let maxColumnValue = numberOfCols;
    let initColumnValue = 0;
    let rows = [];
    //add minus 1 since positions start at 0
    for (let i = 0; i < numberOfRows; i++) {
      const squares = []
      for (let key = initColumnValue; key < maxColumnValue; key++) {
        squares.push((this.renderSquare(key)));
      }
      rows.push(
        (<div key={i} className='board-row'>{squares}</div>)
      )
      initColumnValue += numberOfCols;
      maxColumnValue += numberOfCols;
    }
    return rows;
  }
  
  // initial state of entire board
  render() {
    return (
      <div>
        {this.renderRows(this.props.numberOfRows, this.props.numberOfCols)}
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    const numberOfRows = 3;
    const numberOfCols = 3;
    this.state = {
      history: [{
        squares: Array(numberOfCols*numberOfRows).fill(null),
        position: '',
      }],
      stepNumber: 0,
      xIsNext: true,
      numberOfRows: numberOfRows,
      numberOfCols: numberOfCols,
      order: 'DOWN'
    }
  }

  player() {
    return this.state.xIsNext ? 'X' : 'O';
  }

  toggledOrder() {
    return this.state.order === 'DOWN' ? 'UP' : 'DOWN';
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.player();
    this.setState({
      // concat doesn't mutate original array
      history: history.concat([{
        squares: squares,
        position: evaluatePosition(
          i, this.state.numberOfRows, this.state.numberOfCols),
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const position = history[move].position;
      const desc = move ?
        `Go to move # ${move}, you played at position: ${position}` :
        'Go to game start';
      const isCurrentMove = move === stepNumber;
      return (
        <li key={move}>
          <button 
            className={isCurrentMove ? 'bold_button' : null} 
            onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const toggleOrderButton = (
      <button onClick={() => this.setState({order: this.toggledOrder()})}>
        {this.state.order}
      </button>
    );

    // maintain status unless there's a winner
    let status = winner ? 
      `Winner: ${winner}` :
      `Next player: ${this.player()}`;

    return (
      <div className='game'>
        <div className='game-board'>
          <Board 
            numberOfRows={this.state.numberOfRows}
            numberOfCols={this.state.numberOfCols}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className='game-info'>
          <div>{status}</div>
          <div>{toggleOrderButton}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    )
  }
}

export default Game;

function calculateWinner(squares) {
  // the lines represent possible winning combinations
  const lines = [
    // horizontal wins
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // vertical wins
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagonal wins
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// calculateDraw(squares) {
// }

/**
 * check what position of item is in matrix as though evaluating an array
 * e.g. [null,'X', null, null,'O', null, null, null, null]
 * given numberOfRows = 3, and numberOfCols = 3 and a flatPosition of 1
 * therefore the X has a position of '1, 0' or col 1, row 0
 * 
 * @param {*} flatPosition position in 1x1 array 
 * @param {*} numberOfRows how wide would array be if it was a matrix
 * @param {*} numberOfCols how tall would array be if it was a matrix
 */
const evaluatePosition = (flatPosition, numberOfRows, numberOfCols) => {
  const matrix = Array(numberOfRows).fill(null).map(
    () => Array(numberOfCols).fill(0)
  );
  const total = numberOfCols*numberOfRows;
  if (flatPosition > total) {
    return;
  }
  let row = 0;
  let col = 0;
  for (const array of matrix) {
    for (let index = 0; index < array.length; index++) {
      if (flatPosition === 0) {
        return [col, row];
      }
      flatPosition--;
      col++;
      // restrict col from being greater than numberOfCols
      if(col > (numberOfCols-1)) {
        col = 0;
      } 
    }
    row++;
  }
}