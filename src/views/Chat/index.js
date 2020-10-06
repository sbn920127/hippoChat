import React from "react";
import "./index.scss";
import ChatList from "../../components/ChatList";
import ChatSpace from "../../components/ChatSpace";
import { AuthContext } from "../../Auth";
import {db} from "../../firebaseAPI";
import firebase from "firebase";




class Chat extends React.Component{
  static contextType = AuthContext
  constructor(props) {
    super(props);
    this.users = db.collection('users');
    this.userChats = db.collection('userChats');
    this.chats = db.collection('chats');
    this.chatMessages = db.collection('chatMessages');

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
    this.HandlerchangeChatId = this.HandlerchangeChatId.bind(this);
    this.GetChats = this.GetChats.bind(this);
    this.SetCurrentChat = this.SetCurrentChat.bind(this);
    this.GetCurrentUsers = this.GetCurrentUsers.bind(this);
    this.GetCurrentMessages = this.GetCurrentMessages.bind(this);
    this.AddMessages = this.AddMessages.bind(this);
    this.UpdateLastMessage = this.UpdateLastMessage.bind(this);
    this.GetMessages = this.GetMessages.bind(this);
  }
  componentDidMount() {
    console.log("component Did Mount");
    this.IsMobile();
    this.GetChats();
    this.GetMessages();
    window.addEventListener('resize', this.WindowResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.WindowResize);
  }
  UpdateDimensions() {
    if (this.props.header.current) {
      this.setState({
        headerHeight: this.props.header.current.clientHeight
      })
    }
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
    this.isMobile();
  }
  HandlerchangeChatId(chat_id) {
    const { currentChatId, changeChatId } = this.context;
    let chatId;

    if (!currentChatId) {
      chatId = this.state.chats[0].id
    } else if (chat_id) {
      chatId = chat_id
    } else {
      chatId = currentChatId
    }

    if (!currentChatId || chat_id) {
      changeChatId(chatId);
    }

    this.setState({
      current: {
        chat: {},
        members: [],
        dialogue: []
      },
    }, async function () {;
      await this.SetCurrentChat(chatId);
      await this.GetCurrentMessages(chatId);
    });

    this.setState({
      padding: false
    }, function () {
      this.UpdateDimensions();
      this.showChatSpace();
    });
  }
  async GetChats() {
    const { currentUser } = this.context;
    let first;

    // this.chats.where('members', "array-contains", currentUser.uid)
    //   .onSnapshot(async function (snapshot) {
    //     const docChanges = snapshot.docChanges();
    //     const chatIds = [];
    //     const chats = [];
    //
    //     for (const index in docChanges) {
    //       const change = docChanges[index];
    //       const chatId = change.doc.id;
    //       const chatData = change.doc.data();
    //       let _chat;
    //
    //     if (change.type === "removed") {
    //       const index = chatIds.indexOf(change.doc.id);
    //       chatIds.splice(index, 1);
    //     } else {
    //       const messages = this.chatMessages.doc(chatId).collection('messages');
    //       const lastMessage = await messages.orderBy("created", "desc").limit(1).get()
    //         .then(newsDoc => {
    //           if (newsDoc.size > 0) {
    //             const news = newsDoc.docs[0];
    //             const data = news.data();
    //             return {
    //               last_msg_id: news.id,
    //               last_msg: data.type === 1 ? data.text : "傳給你圖片"
    //             }
    //           }
    //         });
    //       _chat = {
    //         ...chatData,
    //         chatId,
    //       }
    //     }
    //   }
    //
    //
    //
    //
    // })

    this.chats.orderBy("last_msg_id", "desc").get()
      .then(async chatsDoc => {
        if (chatsDoc.size > 0) {
          // 取得我的所有 chat ID
          const getAllChat = () => {
            return this.userChats.doc(currentUser.uid).get()
              .then(doc => {
                if (!doc.exists) return [];
                return Object.values(doc.data());
              });
          };
          const chatIds = await getAllChat();
          const chats = [];

          // 所有 chat document array
          let chatDocs = chatsDoc.docs;
          for(let i in chatDocs) {
            const chatDoc = chatDocs[i];
            // 只處理我的 chat
            if (chatIds.includes(chatDoc.id)) {
              const chat = chatDoc.data();
              const _chat = {
                ...chat,
                id: chatDoc.id
              };
              const messages = this.chatMessages.doc(chatDoc.id).collection('messages');
              const lastMessage = await messages.orderBy("created", "desc").limit(1).get()
                .then(newsDoc => {
                  if (newsDoc.size > 0) {
                    const news = newsDoc.docs[0];
                    const data = news.data();
                    return {
                      last_msg_id: news.id,
                      last_msg: data.type === 1 ? data.text : "傳給你圖片"
                    }
                  }
                });

              // 如果是 1by1 狀態，取得 chat 對象資料
              if (!chat.name && !chat.avatar) {
                const targetId = chat.members.filter(member => member !== currentUser.uid)[0];
                const target = await this.users.doc(targetId).get()
                  .then(userDoc => {
                    return userDoc.data();
                  });
                _chat.name = target.nickname;
                _chat.avatar = target.avatar.url;
              }

              // 取得列表第一個ＩＤ
              if (i == 0) {
                first = !first && chatDoc.id;
              }

              if (lastMessage) {
                chats.push({
                  ..._chat,
                  ...lastMessage,
                });
              } else {
                chats.push(_chat);
              }
            }
          }
          this.setState({
            chats: chats
          }, () => {
            this.HandlerchangeChatId();
          });
        } else {
          this.setState({
            padding: false
          })
        }
      })
  }
  async GetMessages() {
    const { currentUser } = this.context;
    const then = this;

    // for (const i in chats) {
    //   const chatId = chats[i].id.toString();
    //   const chat = chats[i];
    //   let unread = 0;
    //   let oldRead = 0;
    //   let last_msg = "",
    //       last_msg_id = "";
    //   const chatMessages = this.chatMessages.doc(chatId).collection('messages');
    //
    //   // 每個 chat 的訊息
    //   chatMessages.orderBy("created", "desc").onSnapshot(async function (snapshot) {
    //     const docChanges = snapshot.docChanges();
    //
    //     for (const index in docChanges) {
    //       const change = docChanges[index];
    //
    //       if (change.type === "added") {
    //         const id = change.doc.id;
    //         const msgData = change.doc.data();
    //         const msg = {
    //           ...msgData,
    //           id
    //         };
    //
    //         // 更新 message 未讀 => 已讀
    //         if (msgData.sentBy !== currentUser.uid && !msgData.readed) {
    //           await chatMessages.doc(id).update({
    //             readed: true
    //           })
    //         }
    //
    //         // 更新 chat 未讀總計
    //         if (!msg.readed) {
    //           oldRead = unread;
    //           unread++;
    //         }
    //
    //         // 更新 最新訊息
    //         last_msg = msg.text;
    //         last_msg_id = msg.id;
    //
    //       }
    //     }
    //
    //     if (last_msg && last_msg_id || oldRead !== unread) {
    //       then.chats.doc(chatId).update({
    //         unread: unread,
    //         last_msg: last_msg,
    //         last_msg_id: last_msg_id
    //       }).then(() => {
    //         then.GetChats();
    //       })
    //     }
    //   });
    // }
  }
  async SetCurrentChat(id) {
    const chat = this.state.chats.filter(chat => {
      return chat.id === id
    })[0];

    this.setState(state => ({
      current: {
        ...state.current,
        chat: chat
      }
    }));

    await this.GetCurrentUsers(chat.members);
  }
  GetCurrentMessages(chatId) {
    const then = this;
    const { currentUser } = this.context;
    const chatMessages = this.chatMessages.doc(chatId.toString()).collection("messages");
    const _messages = [];

    chatMessages.orderBy("created", "desc")
      .onSnapshot(async function (snapshot) {
        const docChanges = snapshot.docChanges();

        for (const index in docChanges) {
          const change = docChanges[index];

          if (change.type === 'added') {
            const msgId = change.doc.id;
            const msgData = change.doc.data();
            const msg = {
              ...msgData,
              id: msgId
            };

            if (msgData.sentBy !== currentUser.uid && !msgData.readed) {
              await chatMessages.doc(msgId).update({
                readed: true
              }).then(() => {
                msg.readed = true
              })
            }

            if(!_messages.some(item => item === msgId)) {
              _messages.push(msg);
            }
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

    // chatMessages.orderBy("created", "desc").get()
    //   .then(async msgsDoc => {
    //     if (msgsDoc.size > 0) {
    //       for (const i in msgsDoc.docs) {
    //         const msgDoc = msgsDoc.docs[i];
    //         const data = msgDoc.data();
    //         const msg = {
    //           ...data
    //         };
    //         // 更新對方未讀訊息
    //         if (msgDoc.sentBy === currentUser.uid && !data.readed) {
    //           await chatMessages.doc(msgDoc.id).update({
    //             readed: true
    //           }).then(() => {
    //             msg.readed = true
    //           })
    //         }
    //
    //         _messages.push({
    //           ...msg,
    //           id: msgDoc.id,
    //         })
    //       }
    //       this.setState(state => ({
    //         current: {
    //           ...state.current,
    //           dialogue: [
    //             ...state.current.dialogue,
    //             ..._messages
    //           ]
    //         }
    //       }))
    //     }
    //   })
  }
  UpdateLastMessage(msg) {

    // const chats = this.state.chats.map(chat => {
    //   if (chat.id === currentChatId) {
    //     chat.last_msg_id = msg.id;
    //     chat.last_msg = msg.text;
    //   }
    //   return chat;
    // });
    //
    // chats.sort((a, b) => b.last_msg_id - a.last_msg_id);
    // this.setState({
    //   chats
    // }, function () {
    //   this.chats.doc(currentChatId).update({
    //     last_msg_id: msg.id,
    //     last_msg: msg.text
    //   });
    // });

    // const chatIds = this.chats.map(chat => chat.id);
    // console.log(chatIds);
  }
  GetCurrentUsers(users) {
    const _users = [];

    this.users.get()
      .then(usersDoc => {
        if (usersDoc.size > 0) {
          const userDocs = usersDoc.docs;
          for (const i in userDocs) {
            const userDoc = userDocs[i];
            if (users.includes(userDoc.id)) {
              _users.push({
                ...userDoc.data(),
                id: userDoc.id
              });
            }
          }

          this.setState(state => ({
            current: {
              ...state.current,
              members: [
                ...state.current.members,
                ..._users,
              ]
            }
          }))
        }
      })
  }
  AddMessages(dialog) {
    const { currentChatId } = this.context;
    const msgId = Date.now().toString();
    console.log("Add Messages");
    console.log(dialog);

    this.chatMessages.doc(currentChatId.toString()).collection("messages").doc(msgId)
      .set({
        type: 1,
        text: "",
        imgs: [],
        readed: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        ...dialog
      })
      .then(() => {
        this.UpdateLastMessage({id: msgId, ...dialog});
      })
  }
  render() {
    if (this.state.padding) return <div className="pt-5 text-center">Loading...</div>
    return (
      <main className="chat">
        <div className="chat-row">
          <ChatList
            className={this.state.chatListClass}
            headerHeight={this.state.headerHeight}
            talking={this.HandlerchangeChatId}
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
