import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './list';
import './card';

const App = () => (
  <Router>
    <div className="app">
      <Link to="/">Home</Link>
      <Switch>
        <Route path="/" exact component={List} />
        <Route path="/cards/:listId" component={Card} />
      </Switch>
    </div>
  </Router>
);

export default App;