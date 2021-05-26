import React from "react";
import openSocket from "socket.io-client";
import logo from './logo.svg';
import './App.css';

let socket;

class App extends React.Component {
  constructor(props) {
    super(props);

    if (!socket) {
      socket = openSocket(`${process.env.REACT_APP_CONSUMER_URL}`);
    }

    this.state = { message: '', timestamp: '', priority: null };
  }

  componentDidMount() {
    const current_this = this;
    socket.on("consumer_push_message", function(data) {
      current_this.setState({ message: data.message, 
                      timestamp: data.timestamp, 
                      priority: data.priority });
      console.log(data);
    })
  }

  componentWillUnmount() {
    socket.disconnect();
    socket = null;
  }

  render() {
    const { message, timestamp, priority } = this.state; 

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            {message} <code>{timestamp}</code> {priority}.
          </p>
        </header>
      </div>
    );
  }
}

export default App;
