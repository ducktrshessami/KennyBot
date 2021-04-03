import { Component } from "react";
import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import toast from "./utils/toast";

import Home from "./pages/Home";

import Footer from "./components/Footer";

import "materialize-css/dist/css/materialize.min.css";
import './App.css';

class App extends Component {
  componentDidMount() {
    this.handleStatus();
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

  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
          <Footer />
        </Router >
      </div>
    );
  }
}

export default App;
