import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";
import { ButtonToolbar, MenuItem, DropdownButton } from 'react-bootstrap';

class Box extends React.Component {
    selectBox = () => {
        this.props.selectBox( this.props.row, this.props.cols ) 
    }

    render() {
        return(
            <div 
                className={ this.props.boxClass }
                id={ this.props.boxId }
                onClick={ this.selectBox } />
        );
    }
}

class Grid extends React.Component {
    render() {
        const width = ( this.props.cols * 14 ) + 1;
        let rowsArr = [];
        let boxClass = "";

        for( let i = 0; i < this.props.rows; i++ ) {
            for( let j = 0; j < this.props.cols; j++ ) {
                let boxId = i + "_" + j;

                boxClass = this.props.gridFull[i][j] ? "box on" : "box off";

                rowsArr.push(
                    <Box
                        boxClass={ boxClass }
                        key={ boxId }
                        boxId={ boxId }
                        row={ i }
                        cols={ j }
                        selectBox={ this.props.selectBox }
                    />
                );
            }
        }

        return(
            <div className="grid" style={{ width: width }}>
                { rowsArr }
            </div>
        );
    }
}

class Buttons extends React.Component {
    handleSelect = ( evt ) => {
        this.props.gridSize( evt );
    }

    render() {
        return (
            <div className="center">
                <ButtonToolbar>
                    <button className="btn btn-default btn-success" onClick={this.props.playButton}>
                        Play
                    </button>
                    <button className="btn btn-default btn-success" onClick={this.props.pauseButton}>
                        Pause
                    </button>
                    <button className="btn btn-default btn-success" onClick={this.props.slow}>
                        Slow
                    </button>
                    <button className="btn btn-default btn-success" onClick={this.props.fast}>
                        Fast
                    </button>
                    <button className="btn btn-default btn-success" onClick={this.props.clear}>
                        Clear
                    </button>
                    <button className="btn btn-default btn-success" onClick={this.props.seed}>
                        Seed
                    </button>
                    <DropdownButton 
                        title="GridSize"
                        id="size-menu"
                        onSelect={ this.handleSelect }
                        style={{ marginLeft: '10px' }}
                    >
                        <MenuItem eventKey="1">20x10</MenuItem>
                        <MenuItem eventKey="2">50x30</MenuItem>
                        <MenuItem eventKey="3">70x50</MenuItem>
                    </DropdownButton>
                </ButtonToolbar>
            </div>
        );
    }
}

class Main extends React.Component {
    constructor() {
        super();

        this.speed = 100;
        this.rows = 30;
        this.cols = 50;

        this.state = {
            generation: 0,
            gridFull: Array( this.rows ).fill().map( () => Array( this.cols).fill( false ) )
        };
    }

    seed = () => {
        let gridCopy = arrayClone( this.state.gridFull );
        for( let i = 0; i < this.rows; i++ ) {
            for( let j = 0; j < this.cols; j++ ) {
                if( Math.floor(Math.random() * 4 ) === 1 ) {
                    gridCopy[i][j] = true;
                }
            }
        }
        this.setState( {
            gridFull: gridCopy
        } );
    }

    playButton = () => {
        clearInterval( this.intervalId );
        this.intervalId = setInterval( this.play, this.props.speed );
    }

    pauseButton = () => {
        clearInterval( this.intervalId );
    }

    slow = () => {
        this.speed = 100;
        this.playButton();
    }

    fast = () => {
        this.speed = 2000;
        this.playButton(); 
    }

    clear = () => {
        var grid = Array( this.rows ).fill().map( () => Array( this.cols ).fill( false ) );
        this.setState( {
            gridFull: grid,
            generation: 0
        } );
        this.pauseButton();
    }

    gridSize = ( size ) => {
        switch( size ) {
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
                break;
        }
        this.clear();
    }

    play = () => {
        let g = this.state.gridFull;
        let g2 = arrayClone( this.state.gridFull );

        for( let i = 0; i < this.rows; i++ ) {
            for( let j = 0; j < this.cols; j++ ) {
                let count = 0;
                if( i > 0 ) if( g[i-1][j] ) count++;
                if( i > 0 && j > 0 ) if( g[i-1][j-1] ) count++;
                if( i > 0 && j < this.cols - 1 ) if( g[i-1][j+1] ) count++;
                if( j < this.cols - 1 ) if ( g[i][j+1] ) count++;
                if( j > 0 ) if ( g[i][j-1] ) count++;
                if( i < this.rows - 1 ) if( g[i+1][j] ) count++;
                if( i < this.rows - 1 && j > 0 ) if( g[i+1][j-1] ) count++;
                if( i < this.rows - 1 && this.cols - 1) if( g[i+1][j+1] ) count++;
                
                if( g[i][j] && ( count < 2 || count > 3 ) ) g2[i][j] = false;
                if( !g[i][j] && count === 3 ) g2[i][j] = true; 
            }
        }

        this.setState( { 
            gridFull: g2,
            generation: this.state.generation + 1
        } );
    }

    componentDidMount() {
        this.seed();
        this.playButton();
    }

    selectBox = ( row, col ) => {
        let gridCopy = arrayClone( this.state.gridFull );
        gridCopy[row][col] = !gridCopy[row][col];
        this.setState( {
            gridFull: gridCopy
        } );
    }

    render() {
        return(
            <div>
                <h1> Conway's Game Of Life </h1>
                <Buttons 
                    playButton={this.playButton}
                    pauseButton={this.pauseButton}
                    slow={this.slow}
                    fast={this.fast}
                    clear={this.clear}
                    seed={this.seed}
                    gridSize={this.gridSize}
                />
                <Grid 
                    gridFull={ this.state.gridFull }
                    rows={ this.rows }
                    cols={ this.cols }
                    selectBox={ this.selectBox }
                />
                <h2> Generations: { this.state.generation } </h2>
            </div>
        );
    }
}

function arrayClone( arr ) {
    // this is two dimensional array so you need to use this method
    // but if array is one dimension you can just slice it.
    return JSON.parse( JSON.stringify( arr ) );
}

ReactDOM.render(
    <Main />,
    document.getElementById("root")
);