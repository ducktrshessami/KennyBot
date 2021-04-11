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

import Footer from "./components/Footer";

import "materialize-css/dist/css/materialize.min.css";
import "./App.css";
import "./Discord.css";

class App extends Component {
  state = {}

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
    API.getUser()
      .then(user => {
        if (user) {
          this.setState({
            user: user
          });
        }
      });
  }

  render() {
    return (
      <div className="App dbnb-bg white-text">
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/disclaimer" component={Disclaimer} />
            <Route path="/" component={Home} />
          </Switch>
          <Footer />
        </Router >
      </div>
    );
  }
}

export default App;
