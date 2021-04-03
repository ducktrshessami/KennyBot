import {
  HashRouter as Router,
  Route,
  Switch
} from "react-router-dom";

import Home from "./pages/Home";
import './App.css';

function handleSearchCode(search) {
  let params = new URLSearchParams(search);
  let code = params.get("code");
  if (code) {
    // handle auth
    params.delete("code");
    window.location.search = params.toString();
  }
}

function App() {
  handleSearchCode(window.location.search);
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
