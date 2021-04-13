import { Component } from "react";
import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import toast from "./utils/toast";
import API from "./utils/API";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";
import Disclaimer from "./pages/Disclaimer";
import Server from "./pages/Server";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import "materialize-css/dist/css/materialize.min.css";
import "./App.css";
import "./Discord.css";

class App extends Component {
  state = {
    ready: false,
    guilds: []
  }

  componentDidMount() {
    this.handleStatus();
    this.getAuth();
  }

  handleStatus() {
    let params = new URLSearchParams(window.location.search);
    let status = params.get("status");
    switch (status) {
      case "0": toast("Success!"); break;
      case "1": toast("You gotta log in bro", 1); break;
      case "2": toast("Failed to authorize", 1); break;
      default:
    }
  }

  getAuth() {
    Promise.all([API.getUser(), API.getUserGuilds()])
      .then(([user, guilds]) => {
        let newState = { ready: true };
        if (user && guilds) {
          newState.user = user;
          newState.guilds = guilds;
        }
        this.setState(newState);
      })
      .catch(console.error);
  }

  render() {
    return (
      <div className="App dbnb-bg white-text">
        <Router>
          {this.state.user ? <Navbar /> : undefined}
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/dashboard" render={() => <Dashboard {...this.state} />} />
            <Route path="/disclaimer" component={Disclaimer} />
            <Route path="/server" render={() => <Server {...this.state} />} />
            <Route path="/" render={() => <Home {...this.state} />} />
          </Switch>
          <Footer user={this.state.user} />
        </Router >
      </div>
    );
  }
}

export default App;
