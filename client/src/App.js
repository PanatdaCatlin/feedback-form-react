import React, { Component } from "react";
import "./App.css";
import { Route } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import Home from "./Home";
import Attribution from "./Attribution";
import Integrity from "./Integrity";
import Filter from "./Filter";
import axios from "axios";
import Login from "./Login";
import Feedback from "./Feedback";

class App extends Component {
  constructor(props) {
    super(props);
    this.handleAuth = this.handleAuth.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.state = {
      loggedIn: false
    };
  }
  handleLogin = async (usr, pas) => {
    const numTries = this.state.numTries + 1;
    if (numTries > 5) {
      this.setState({
        isLoading: true,
        message: "Too Many Attempts - Contact aditya@wheelhousedmg.com"
      });
    } else {
      try {
        const res = await axios.post("/api/v1/users/login", {
          username: usr,
          password: pas
        });
        this.setState({
          isLoading: false,
          loggedIn: true,
          numTries: numTries,
          status: true,
          message: `Welcome back ${res.data.user.username}`
        });
        this.setState({
          isLoading: false,
          loggedIn: true,
          numTries: numTries,
          status: true,
          message: `Welcome back Panatda Tester`
        });
      } catch (e) {
        this.setState({
          isLoading: false,
          numTries: numTries,
          stats: false,
          message: "Incorrect Username or Password"
        });
      }
    }
  };
  componentWillMount() {
    this.isLoggedIn().then(res => {
      if (res === true) {
        this.setState({ loggedIn: true });
      } else {
        this.setState({ loggedIn: false });
      }
    });
  }
  async isLoggedIn() {
    try {
      const auth = await axios.post("/api/v1/users/status");
      return auth.status === 200;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  handleAuth() {
    if (this.state.loggedIn) {
      try {
        axios.post("/api/v1/users/logout").then(res => {
          this.setState({ loggedIn: false });
        });
      } catch (e) {
        console.log(e.message);
        alert(
          e.message +
            "\nPlease contact aditya@wheelhousedmg.com if this issue persists"
        );
      }
    } else {
      alert("uh oh");
    }
  }

  render() {
    return (
      <div>
        {this.state.loggedIn ? (
          <div className="App">
            <Header
              loggedIn={this.state.loggedIn}
              handleAuth={this.handleAuth}
            />
            <Route path="/" component={Home} exact />
            <Route
              path="/tools/attribution"
              render={() => <Attribution loggedIn={this.state.loggedIn} />}
              exact
            />
            <Route
              path="/tools/integrity"
              render={() => <Integrity loggedIn={this.state.loggedIn} />}
              exact
            />
            <Route
              path="/tools/filter"
              render={() => <Filter loggedIn={this.state.loggedIn} />}
              exact
            />
            <Route
              path="/feedback"
              render={() => <Feedback loggedIn={this.state.loggedIn} />}
              exact
            />
            <Footer />
          </div>
        ) : (
          <Login
            handleLogin={this.handleLogin}
            numTries={this.state.numTries}
            message={this.state.message}
            status={this.state.status}
            isLoading={this.state.isLoading}
          />
        )}
      </div>
    );
  }
}

export default App;
