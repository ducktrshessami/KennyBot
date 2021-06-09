import { Component, createRef, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch
} from "react-router-dom";
import API from "./utils/API";
import Loader from "./pages/Loader";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Status from "./components/Status";
import "materialize-css/dist/css/materialize.min.css";
import "./App.css";
import "./Discord.css";
import "./Kenny.css";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Logout = lazy(() => import("./pages/Logout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Server = lazy(() => import("./pages/Server"));
const Audit = lazy(() => import("./pages/Audit"));

class App extends Component {
  ref = createRef();
  state = {
    ready: false,
    guilds: []
  }

  componentDidMount() {
    this.getAuth();
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
      <div className="App dbnb-bg white-text" ref={this.ref}>
        <Router>
          <Status />
          {this.state.user ? <Navbar /> : undefined}
          <Suspense fallback={<Loader />}>
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/logout" component={Logout} />
              <Route path="/dashboard" render={() => <Dashboard {...this.state} />} />
              <Route path="/disclaimer" component={Disclaimer} />
              <Route path="/server" render={() => <Server {...this.state} />} appRef={this.ref} />
              <Route path="/audit" render={() => <Audit {...this.state} appRef={this.ref} />} />
              <Route path="/" render={() => <Home {...this.state} />} />
            </Switch>
          </Suspense>
          <Footer user={this.state.user} />
        </Router >
      </div>
    );
  }
}

export default App;
