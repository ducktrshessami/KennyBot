import { Component } from "react";
import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom";

import Home from "./pages/Home";
import './App.css';


class App extends Component {
  componentDidMount() {
    
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router >
    );
  }
}

export default App;
