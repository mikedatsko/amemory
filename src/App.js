import React, {Component} from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    const iconsList = ['anchor', 'anchor', 'camera', 'camera', 'award', 'award', 'bell', 'bell', 'heart', 'heart', 'sun', 'sun', 'star', 'star', 'umbrella', 'umbrella'];

    this.state = {
      iconsSource: iconsList,
      iconsShuffled: this.getShuffle(iconsList.map(iconName => {
        return {
          name: iconName,
          isSelected: false,
          isVerified: false
        }
      })),
      scorePoints: 0,
      bestScorePoints: 0,
      pointValues: [10, 5, 2, 1],
      timeStart: 0,
      isFirstClick: true,
      isFinished: false,
      isStarted: false
    };
  }

  componentDidMount() {
    window.parent.postMessage('FRAME_LOADED', (new URL(document.location.href)).searchParams.get('host_url') || 'http://jsmeasure.surge.sh');
  }

  startGame(e) {
    this.setState({
      isStarted: true,
      isFirstClick: true,
      isFinished: false,
      timeStart: 0,
      scorePoints: 0,
      iconsShuffled: this.getShuffle(this.state.iconsSource.map(iconName => {
        return {
          name: iconName,
          isSelected: false,
          isVerified: false
        }
      })),
    });
  }

  getShuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  getDuplicates(array) {
    const duplicates = [];

    array
      .sort((a, b) => {
        return a.name > b.name ? 1 : -1;
      })
      .reduce((a, b) => {
        a.name === b.name && !duplicates.includes(a.name) && duplicates.push(a.name);
        return b;
      });

    return duplicates;
  }

  onIconClick(event, icon, i) {
    const iconsRotatedFull = this.state.iconsShuffled.filter(icon_ => icon_.isSelected && !icon_.isVerified);

    if (iconsRotatedFull.length === 2) {
      this.setState({
        iconsShuffled: this.state.iconsShuffled.map(icon_ => {
          if (icon_.isSelected && !icon_.isVerified) {
            icon_.isSelected = false;
          }

          return icon_;
        })
      });
    }

    icon.isSelected = true;
    const iconsRotated = this.state.iconsShuffled.filter(icon_ => icon_.isSelected && !icon_.isVerified);

    if (!iconsRotated) {
      return;
    }

    const iconsDuplicates = this.getDuplicates(iconsRotated);

    if (iconsRotated.length === 2 && iconsDuplicates.length && !this.state.isFirstClick) {
      const timeSpent = Math.floor((new Date().getTime() - this.state.timeStart) / 1000);
      const points = this.state.pointValues[timeSpent < 5
          ? 0
          : timeSpent < 10
            ? 1
            : timeSpent < 20
              ? 2
              : 3
        ];

      this.setState({
        iconsShuffled: this.state.iconsShuffled.map(icon_ => {
          if (iconsDuplicates.includes(icon_.name)) {
            icon_.isVerified = true;
            this.setState({scorePoints: this.state.scorePoints + points});
          }

          return icon_;
        })
      });
    }

    const iconsNotVerified = this.state.iconsShuffled.filter(icon_ => !icon_.isVerified);

    if (this.state.isFirstClick) {
      this.setState({timeStart: new Date().getTime()});
    }

    if (!iconsNotVerified.length) {
      this.setState({isFinished: true});
    }

    this.setState({isFirstClick: false});
  }

  getIconClassName(icon) {
    return [
      'App-icon',
      (icon.isSelected ? 'selected' : ''),
      (icon.isVerified ? 'verified' : '')
    ].join(' ');
  }

  getFinish() {
    return this.state.isFinished
      ? <div className="App-finished">
          <div className="App-finished-title">Win!</div>
          <div className="App-finished-score-title">Your score:</div>
          <div className="App-finished-score">{this.state.scorePoints}</div>
          <button type="button" onClick={(e) => this.setState({isStarted: false})}>
            <span className="icon-chevron-left"></span>
          </button>
          <button type="button" onClick={(e) => this.startGame(e)}>Play again</button>

          <div className="pyro">
            <div className="before">

            </div>
            <div className="after">

            </div>
          </div>
        </div>
      : '';
  }

  getIcons() {
    const icons = [];

    for (let i = 0; i < this.state.iconsShuffled.length; i++) {
      const icon = this.state.iconsShuffled[i];
      const iconClassName = `icon-${icon.name}`;

      icons.push(<span
          key={`icon-${i}`}
          onClick={(e) => this.onIconClick(e, icon, i)}
          className={this.getIconClassName(icon)}
        >
          <span className="App-icon-back"/>
          <span className={'App-icon-front ' + iconClassName}/>
        </span>);
    }

    return <div className="App-field">{icons}</div>;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="App-title">
            <div className="App-logo"></div>
            MEMORY
          </div>
          <div className="App-slogan">Game for brain train</div>
          {this.state.isStarted
            ? <div>
                {this.state.isFinished ? '' : <div className="App-score">Your score: {this.state.scorePoints}</div>}
                {this.state.isFinished ? this.getFinish() : this.getIcons()}
              </div>
            : <div className="App-start">
                <button type="button" onClick={(e) => this.startGame(e)}>Start</button>
              </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
