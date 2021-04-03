import { Component } from "react";
import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom";

import Home from "./pages/Home";

import Footer from "./components/Footer";

import './App.css';


class App extends Component {
  componentDidMount() {

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
