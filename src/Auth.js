import React, { useEffect, useState } from "react";
import { auth } from "./firebaseAPI";

export const AuthContext = React.createContext();

class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    this.setCurrentChatId = this.setCurrentChatId.bind(this);
    this.state = {
      currentUser: null,
      currentChatId: null,
      padding: true,
      changeChatId: this.setCurrentChatId
    };
  }
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      this.setState({
        currentUser: user,
        padding: false
      })
    })
  }
  setCurrentChatId(id) {
    this.setState({
      currentChatId: id
    });
  }
  render() {
    if (this.state.padding) {
      return <>Loading...</>
    }

    return (
      <AuthContext.Provider
        value={this.state}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

export default AuthProvider;
