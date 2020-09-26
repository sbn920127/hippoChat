import React, {createRef} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import "./index.scss";
import { AuthProvider } from "../../Auth";
import PrivateRoute from "../../PrivateRoute";
import Header from "../../components/Header";
import LoginPage from "../LoginPage";
import Chat from "../Chat";
import Account from "../Account";
import Members from "../Members";

class App extends React.Component {
  constructor(props) {
    super(props);
    this._header = createRef();
  }
  render() {
    return (
      <AuthProvider>
        <Router>
          <>
            <Header headerRef={this._header}/>
            <Switch>
              <Route exact path="/" component={Members}/>
              <Route exact path="/login" component={LoginPage}/>
              <PrivateRoute exact path="/chat" component={()=> <Chat header={this._header}/>}/>
              <PrivateRoute exact path="/account" component={Account} />
            </Switch>
          </>
        </Router>
      </AuthProvider>
    );
  }
}

export default App;
