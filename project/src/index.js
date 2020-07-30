import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { ButtonToolbar, Dropdown, DropdownButton } from "react-bootstrap";

class Box extends React.Component {
  selectBox = () => {
    this.props.selectBox(this.props.row, this.props.col);
  };
  render() {
    return (
      <div
        className={this.props.boxClass}
        id={this.props.id}
        onClick={this.selectBox}
      />
    );
  }
}

class Grid extends React.Component {
  render() {
    let width = this.props.cols * 14;
    var rowsArr = [];

    var boxClass = "";
    for (var i = 0; i < this.props.rows; i++) {
      for (var j = 0; j < this.props.cols; j++) {
        let boxId = i + "_" + j;

        boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
        rowsArr.push(
          <Box
            boxClass={boxClass}
            key={boxId}
            boxId={boxId}
            row={i}
            col={j}
            selectBox={this.props.selectBox}
          />
        );
      }
    }

    return (
      <div className='grid' style={{ width: width }}>
        {rowsArr}
      </div>
    );
  }
}

class Buttons extends React.Component {
  handleSelect = (evt) => {
    this.props.gridSize(evt);
  };

  render() {
    return (
      <div className='center'>
        <ButtonToolbar>
          <button className='btn btn-default' onClick={this.props.startButton}>
            Start
          </button>
          <button className='btn btn-default' onClick={this.props.stopButton}>
            Stop
          </button>
          <button className='btn btn-default' onClick={this.props.slow}>
            Slow
          </button>
          <button className='btn btn-default' onClick={this.props.clear}>
            Clear
          </button>
          <button className='btn btn-default' onClick={this.props.seed}>
            Seed
          </button>
          <DropdownButton
            title='Grid Size'
            id='size-menu'
            onSelect={this.handleSelect}>
            <Dropdown.Item eventKey='1'>20x10</Dropdown.Item>
            <Dropdown.Item eventKey='2'>50x30</Dropdown.Item>
            <Dropdown.Item eventKey='3'>70x50</Dropdown.Item>
          </DropdownButton>
        </ButtonToolbar>
      </div>
    );
  }
}

class Main extends React.Component {
  constructor() {
    super();
    this.speed = 150;
    this.rows = 30;
    this.cols = 50;

    this.state = {
      //  in gen 0 there's a 50 x 30 grid with all cells turned off to start
      generation: 0,
      gridFull: Array(this.rows)
        .fill()
        .map(() => Array(this.cols).fill(false)),
    };
  }

  // Method for changing state onClick
  selectBox = (row, col) => {
    let gridCopy = arrayClone(this.state.gridFull);
    gridCopy[row][col] = !gridCopy[row][col];
    this.setState({
      gridFull: gridCopy,
    });
  };

  // Method for seeding or beginning with random filled in boxes
  seed = () => {
    let gridCopy = arrayClone(this.state.gridFull);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // randomly chosen boxes function
        // 1/4 chance of each box starting turned on
        if (Math.floor(Math.random() * 4) === 1) {
          gridCopy[i][j] = true;
        }
      }
    }
    this.setState({
      gridFull: gridCopy,
    });
  };

  startButton = () => {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.start, this.speed);
  };

  stopButton = () => {
    clearInterval(this.intervalId);
  };

  slow = () => {
    this.speed = 1000;
    this.startButton();
  };

  clear = () => {
    var grid = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
    clearInterval(this.intervalId);
    this.setState({
      gridFull: grid,
      generation: 0,
    });
  };

  gridSize = (size) => {
    switch (size) {
      case "1":
        this.cols = 20;
        this.rows = 10;
        break;
      case "2":
        this.cols = 50;
        this.rows = 30;
        break;
      default:
        this.cols = 70;
        this.rows = 50;
    }
    this.clear();
  };

  start = () => {
    let g = this.state.gridFull;
    let g2 = arrayClone(this.state.gridFull);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let count = 0; // number of neighbors a cell has
        // 8 possible neighbors being checked
        if (i > 0) if (g[i - 1][j]) count++;
        if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
        if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
        if (j < this.cols - 1) if (g[i][j + 1]) count++;
        if (j > 0) if (g[i][j - 1]) count++;
        if (i < this.rows - 1) if (g[i + 1][j]) count++;
        if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
        if (i < this.rows - 1 && j < this.cols - 1)
          if (g[i + 1][j + 1]) count++;
        // if alive and less than 2 or more than 3 neighbors it dies
        if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
        // if dead cell has exactly 3 neighbors it's born
        if (!g[i][j] && count === 3) g2[i][j] = true;
      }
    }
    this.setState({
      gridFull: g2,
      generation: this.state.generation + 1,
    });
  };

  componentDidMount() {
    this.seed();
    this.startButton();
  }

  render() {
    return (
      <div id='body'>
        <span id='rules' title='rules'>
          R*U*L*E*S
          <ol>
            1. Any live cell with fewer than two live neighbours dies, as if by
            underpopulation.
          </ol>
          <ol>
            2. Any live cell with two or three live neighbours lives on to the
            next generation.
          </ol>
          <ol>
            3. Any live cell with more than three live neighbours dies, as if by
            overpopulation.
          </ol>
          <ol>
            4. Any dead cell with exactly three live neighbours becomes a live
            cell, as if by reproduction.
          </ol>
        </span>

        <h1>The Game of Life</h1>
        <Buttons
          startButton={this.startButton}
          stopButton={this.stopButton}
          slow={this.slow}
          clear={this.clear}
          seed={this.seed}
          gridSize={this.gridSize}
        />
        <Grid
          gridFull={this.state.gridFull}
          rows={this.rows}
          cols={this.cols}
          selectBox={this.selectBox}
        />
        <h4>Generations: {this.state.generation}</h4>
      </div>
    );
  }
}

function arrayClone(arr) {
  return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(
  <React.StrictMode>
    <Main />,
  </React.StrictMode>,
  document.getElementById("root")
);
