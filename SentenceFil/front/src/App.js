import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Fill from './Fill'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/phrase">
         <Fill filling="phrase"/>
        </Route>
        <Route path="/sentence">
         <Fill filling="sentence"/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
