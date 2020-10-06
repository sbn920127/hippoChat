import React, {useEffect, useState} from "react";
import { AuthContext, ChatContext, ContextCombined } from "./Context";
import { auth } from "./firebaseAPI";

const ProvideCombinedContext = props => {
  const [currentUser, setCurrentUser] = useState(null);
  const [padding, setPending] = useState(true);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setPending(false);
    })
  }, []);
  console.log(currentUser);

  if (padding) {
    return <>Loading...</>
  }

  return (
    <AuthContext.Consumer>
      {({ currentUser }) => {
        console.log(currentUser, "pro");
        return (<ChatContext.Consumer>
          {({currentChatId, setCurrentChatId}) => (
            <ContextCombined.Provider value={{currentUser, currentChatId, setCurrentChatId}}>
              {props.children}
            </ContextCombined.Provider>
          )}
        </ChatContext.Consumer>)
      }}
    </AuthContext.Consumer>
  )
}

export default ProvideCombinedContext;
