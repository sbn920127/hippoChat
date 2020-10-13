import React from "react";
import "./index.scss";
import ChatList from "../../components/ChatList";
import ChatSpace from "../../components/ChatSpace";
import { AuthContext } from "../../Auth";
import {db} from "../../firebaseAPI";
import firebase from "firebase";

class Chat extends React.Component{
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.users = db.collection('users');
    this.userChats = db.collection('userChats');
    this.chats = db.collection('chats');
    this.chatMessages = db.collection('chatMessages');
    this.msgListener = [];

    this.state = {
      padding: true,
      mobile: null,
      chatListClass: '',
      chatSpaceClass: '',
      headerHeight: null,
      current: {
        chat: {},
        members: [],
        dialogue: []
      },
      chats: []
    };

    this.IsMobile = this.IsMobile.bind(this);
    this.WindowResize = this.WindowResize.bind(this);
    this.showChatList = this.showChatList.bind(this);
    this.showChatSpace = this.showChatSpace.bind(this);
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
    this.HandleChangeChatId = this.HandleChangeChatId.bind(this);
    this.GetChats = this.GetChats.bind(this);
    this.SetCurrentChat = this.SetCurrentChat.bind(this);
    this.GetCurrentUsers = this.GetCurrentUsers.bind(this);
    this.GetCurrentMessages = this.GetCurrentMessages.bind(this);
    this.AddMessages = this.AddMessages.bind(this);
    this.GetMessages = this.GetMessages.bind(this);
  }
  componentDidMount() {
    this.IsMobile();
    this.GetChats().then(state => {
      if (state) {
        this.GetMessages();
        this.HandleChangeChatId();
      } else {
        this.setState({
          padding: false
        }, () => {
          this.UpdateDimensions();
        });
      }
    });
    window.addEventListener('resize', this.WindowResize);
  }
  shouldComponentUpdate(nextProps, nextState) {
    // const { currentChatId } = this.context;

    // if (nextState.chats.length > 0 && !currentChatId) {
    //   this.HandleChangeChatId();
    // }

    return true;
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.WindowResize);
  }
  UpdateDimensions() {
    this.setState({
      headerHeight: this.props.header.current.clientHeight
    })
  }
  IsMobile() {
    const mql = window.matchMedia('(max-width: 700px');
    this.setState({
      mobile: mql.matches
    }, function () {
      if (this.state.mobile) {
        this.setState({
          chatListClass: 'active'
        });
      } else {
        this.setState({
          chatListClass: '',
          chatSpaceClass: ''
        });
      }
    });
  }
  WindowResize() {
    this.IsMobile();
  }
  showChatList() {
    this.setState({
      chatListClass: 'ready',
      chatSpaceClass: 'active'
    }, function () {
      setTimeout(() => {
        this.setState({
          chatListClass: 'ready go',
          chatSpaceClass: 'active go'
        }, function () {
          setTimeout(() => {
            this.setState({
              chatListClass: 'active',
              chatSpaceClass: ''
            });
          }, 600);
        })
      }, 50)
    });
  }
  showChatSpace() {
    this.setState({
      chatListClass: 'active',
      chatSpaceClass: 'ready'
    }, function () {
      setTimeout(() => {
        this.setState({
          chatListClass: 'active go',
          chatSpaceClass: 'ready go'
        }, function () {
          setTimeout(() => {
            this.setState({
              chatListClass: '',
              chatSpaceClass: 'active'
            });
          }, 600);
        })
      }, 50)
    })
  }
  HandleChangeChatId(chat_id) {
    const { currentChatId, changeChatId } = this.context;
    let chatId;

    if (!chat_id && currentChatId) {
      chatId = currentChatId;
    } else if (chat_id) {
      chatId = chat_id;
    } else {
      chatId = this.state.chats[0].id;
    }

    if (chatId !== currentChatId) {
      changeChatId(chatId);
    }


    console.log(2,chatId !== currentChatId, chatId, currentChatId);



    this.setState({
      current: {
        chat: {},
        members: [],
        dialogue: []
      },
    }, async function () {
      await this.SetCurrentChat(chatId);
      await this.GetCurrentMessages(chatId);

      this.setState({
        padding: false
      }, () => {
        console.log(2.3);
        this.showChatSpace();
        this.UpdateDimensions();
      });
    });
  }
  GetChats() {
    const { currentUser } = this.context;
    const then = this;
    const chats = [];

    if (this.chatsListener) {
      this.chatsListener();
      this.chatsListener = null;
    }
    console.log(1);

    return new Promise(resolve => {
      this.chatsListener = this.chats.where("members", "array-contains", currentUser.uid)
        .onSnapshot(async function (snapshot) {
          const docChanges = snapshot.docChanges();
          console.log(1.1);

          if (docChanges.length > 0) {
            for (const i in docChanges) {
              const change = docChanges[i];
              const chatId = change.doc.id;
              const chatData = change.doc.data();
              const chat = {
                ...chatData,
                id: chatId
              };

              if (change.type === 'added') {
                // 如果是 1by1 狀態，取得 chat 對象資料
                if (chatData.members.length == 2) {
                  const targetId = chatData.members.filter(person => person !== currentUser.uid)[0];
                  const target = await then.users.doc(targetId).get()
                    .then(userDoc => {
                      return userDoc.data();
                    });

                  chat.name = target.nickname;
                  chat.avatar = target.avatar.url;
                }

                chats.push(chat);

                // 依最後訊息排序
                if (chats.length > 1) chats.sort((a, b) => b.last_msg_id - a.last_msg_id);
              }

              if (change.type === 'modified') {
                chats.forEach(item => {
                  if (item.id === chat.id) {
                    item.unread = chat.unread
                  }
                });
              }
            }
            then.setState({
              chats
            }, () => {
              resolve(true);
              // then.GetMessages();
              // then.HandleChangeChatId();
              // then.GetMessages();
            });
          } else {
            resolve(false);
            // setTimeout(() => {
            //   then.setState({
            //     padding: false
            //   }, () => {
            //     then.UpdateDimensions();
            //   })
            // }, 1000);
          }
        });
    });


  }
  GetMessages() {
    const then = this;
    const chats =[...this.state.chats];


    if (this.msgListener.length > 0) {
      this.msgListener.forEach(item => {
        item();
      });
      this.msgListener.length = 0;
    }

    for (const i in chats) {
      const chatId = chats[i].id.toString();
      // let unread = 0;
      let last_msg = "",
          last_msg_id = "";
      const chatMessages = this.chatMessages.doc(chatId).collection('messages');

      // 每個 chat 的訊息
      this.msgListener[i] = chatMessages.orderBy("created", "desc").limit(1)
        .onSnapshot(async function (snapshot) {
          const docChanges = snapshot.docChanges();

          for (const index in docChanges) {
            const change = docChanges[index];
            const id = change.doc.id;
            const msgData = change.doc.data();
            const msg = {
              ...msgData,
              id
            };

            if (change.type === "added") {
              // 更新 chat 未讀總計
              // if (msgData.sentBy !== currentUser.uid && !msg.readed) {
              //   unread++;
              // }

              // 更新 最新訊息
              last_msg = msg.text;
              last_msg_id = msg.id;
            }

            // if (change.type === "modified") {
            //   unread = 0;
            // }
          }

          then.chats.doc(chatId).update({
            // unread: unread,
            last_msg: last_msg,
            last_msg_id: last_msg_id
          }).then(() => {
            then.setState(prevState => {
              const chats = prevState.chats;
              const index = chats.findIndex(chat => chat.id === chatId);
              chats[index] = {
                ...chats[index],
                // unread: unread,
                last_msg: last_msg,
                last_msg_id: last_msg_id
              };

              chats.sort((a, b) => b.last_msg_id - a.last_msg_id);
              return {
                chats: chats
              }
            });
          });
      });
    }
  }
  SetCurrentChat(id) {
    const chat = this.state.chats.filter(chat => {
      return chat.id === id
    })[0];

    this.setState(state => ({
      current: {
        ...state.current,
        chat: chat
      }
    }), () => {
      console.log(3, this.state.current);
      this.GetCurrentUsers(this.state.current.chat.members);
    });
  }
  GetCurrentMessages(chatId) {
    const then = this;
    const { currentUser, currentChatId } = this.context;
    const chatMessages = this.chatMessages.doc(chatId.toString()).collection("messages");
    const _messages = [];

    if (this.currentMsgListener) {
      this.currentMsgListener();
      this.currentMsgListener = null;
    }
    console.log(44);

    this.currentMsgListener = chatMessages.orderBy("created", "desc")
      .onSnapshot(function (snapshot) {
        const docChanges = snapshot.docChanges();

        for (const index in docChanges) {
          const change = docChanges[index];
          const msgId = change.doc.id;
          const msgData = change.doc.data();

          if (change.type === 'added') {
            // 更新 message 未讀 => 已讀
            if (msgData.sentBy !== currentUser.uid && !msgData.readed) {
              chatMessages.doc(msgId).update({
                readed: true
              });
              then.chats.doc(currentChatId).update({
                ["unread." + currentUser.uid]: 0
              });
            }
            _messages.push({
              ...msgData,
              id: msgId
            });
          }

          if (change.type === "modified") {
            const i = _messages.findIndex(msg => msg.id == msgId);
            _messages[i] = {
              ...msgData,
              id: msgId
            };
          }
        }
        _messages.sort((a, b) => b.id - a.id);

        then.setState(prevState => ({
          current: {
            ...prevState.current,
            dialogue: _messages
          }
        }));
    });

  }
  async GetCurrentUsers(users) {
    const _users = [];

    for (const i in users) {
      await this.users.doc(users[i]).get()
        .then(userDoc => {
          _users.push({
            ...userDoc.data(),
            id: userDoc.id
          });
        });
    }

    this.setState(prevState => ({
      current: {
        ...prevState.current,
        members: _users
      }
    }));
  }
  AddMessages(dialog) {
    const { currentUser,  currentChatId } = this.context;
    const msgId = Date.now().toString();
    const target = this.state.current.members.filter(person => person.id !== currentUser.uid)[0];

    this.chatMessages.doc(currentChatId.toString()).collection("messages").doc(msgId)
      .set({
        type: 1,
        text: "",
        imgs: [],
        readed: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        ...dialog
      });
    this.chats.doc(currentChatId).update({
      ["unread." + target.id]: firebase.firestore.FieldValue.increment(+1)
    });
  }
  render() {
    if (this.state.padding) return <div className="pt-5 text-center">Loading...</div>
    return (
      <main className="chat">
        <div className="chat-row">
          <ChatList
            className={this.state.chatListClass}
            headerHeight={this.state.headerHeight}
            talking={this.HandleChangeChatId}
            chats={this.state.chats}
          />
          <ChatSpace
            className={this.state.chatSpaceClass}
            headerHeight={this.state.headerHeight}
            toList={this.showChatList}
            current={this.state.current}
            AddMessages={this.AddMessages}
          />
        </div>
      </main>
    )
  }
}

export default Chat;
