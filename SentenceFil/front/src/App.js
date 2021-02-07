import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Fill from './Fill'

function App() {
  let backend = 'http://sentenceful.cafe24.com:44400';

  return (
    <Router>
      <Switch>
        <Route path="/phrases">
          <Fill 
            backend={backend}
            filling="phrases"
          />
        </Route>
        <Route path="/sentences">
          <Fill
            backend={backend}
            filling="sentences"
          />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
