import React, { createRef, useContext }from "react";
import "./index.scss";
import style from "./chatList.module.scss"
import { AuthContext } from "../../Auth";
import moment from "moment";

function HandlerDate(d) {
  const now = moment();
  const date = moment(+d);
  const seconds = now.diff(date, "seconds");
  const minutes = now.diff(date, "minutes");
  const hours = now.diff(date, "hours");
  let result;

  if (seconds <= 60) {
    result = `${seconds}秒前`;
  } else if (minutes <= 60) {
    result = `${minutes}分鐘前`;
  } else if (hours <= 24) {
    result = date.format("H:mm:ss");
  } else if (hours <= 48) {
    result = "昨天";
  } else if (hours <= 72) {
    result = "前天";
  } else {
    result = date.format("MM/DD");
  }
  return result;
}

const ChatSummary = (props) => {
  const { currentChatId } = useContext(AuthContext);
  const chat = props.chat;
  const date = HandlerDate(chat.last_msg_id);
  const _class = currentChatId === chat.id ? style['item-active'] : style.item;


  return (
    <li className={_class} onClick={() => {props.onClick(chat.id)}}>
      <div className={style.summary}>
        <div className={style["summary-avatar"]}>
          <img src={chat.avatar} alt=""/>
        </div>
        <h4 className={style["summary-name"]}>{chat.name}
          {chat.members.length > 2 ? <span>{`(${chat.members.length})`}</span> : null}
        </h4>
        <p className={style["summary-text"]}>{chat.last_msg}</p>
        <div className={style.col}>
          <div className={style.date}>{date}</div>
          {chat.unread > 0 ? <span className={style.unread}>{chat.unread}</span> : null}
        </div>
      </div>
    </li>
  )
};

class ChatList extends React.Component{
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      searchHeight: "auto",
      roomHeight: 0
    };
    this.search = createRef();
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
  }
  componentDidMount() {
    this.UpdateDimensions();
  }
  UpdateDimensions() {
    this.setState({
      searchHeight: this.search.current.clientHeight,
    }, function () {
      this.setState((state) => {
        return {
          roomHeight: window.innerHeight - (this.props.headerHeight + state.searchHeight)
        }
      });
    });
  }
  // GetChats() {
  //   const { currentUser } = this.context;
  //   const users = db.collection('users');
  //   const userChats = db.collection('userChats');
  //   const chats = db.collection('chats');
  //   const chatMessages = db.collection('chatMessages');
  //   let first;
  //
  //   userChats.doc(currentUser.uid).get()
  //     .then(doc => {
  //       if (!doc.exists) return [];
  //       return Object.values(doc.data());
  //     })
  //     .then(_chats => {
  //       chats.orderBy("last_msg_id", "desc").get()
  //         .then(querySnapshot => {
  //           querySnapshot.forEach(doc => {
  //
  //             const messages = chatMessages.doc(doc.id).collection("messages");
  //             const target = doc.data().members.filter(person => person !== currentUser.uid)[0];
  //             if (_chats.includes(doc.id)) {
  //               if (!first) {
  //                 first = doc.id;
  //                 this.props.getfirstChat(first);
  //               }
  //               users.doc(target).get()
  //                 .then(uDoc => {
  //                   if (uDoc.exists) {
  //                     const user = uDoc.data();
  //                     return {
  //                       name: user.nickname,
  //                       avatar: user.avatar.url
  //                     };
  //                   }
  //                 })
  //                 .then(target => {
  //                   messages.orderBy("created", "desc").limit(1).get()
  //                     .then(Mdoc => {
  //                       let _msg;
  //                       if (Mdoc.exists) {
  //                         Mdoc.forEach(msg => {
  //                           _msg = msg.data();
  //                         });
  //                       } else {
  //                         _msg = ""
  //                       }
  //
  //                       this.setState(state => {
  //                         return {
  //                           chats: state.chats.concat([{
  //                             ...doc.data(),
  //                             name: target.name,
  //                             avatar: target.avatar,
  //                             id: doc.id,
  //                             last_msg: _msg
  //                           }])
  //                         };
  //                       })
  //                     })
  //                 })
  //             }
  //           });
  //         })
  //     });
  // }
  render() {
    const _chats = this.props.chats.map(chat => <ChatSummary key={chat.id} chat={chat} onClick={this.props.talking}/>);
    return (
      <section className={`chat-control ${this.props.className}`}>
        <div className="chat-search" ref={this.search}>
          <div className="input-field">
            <label htmlFor="roomSearch">
              搜尋
              <i className="fa fa-search"></i>
            </label>
            <input id="roomSearch" type="text" />
          </div>
          <button className="icon-btn" title="排序"><i className="fa fa-sort"></i></button>
        </div>
        <ul className={style.items} style={{height: this.state.roomHeight}}>
          {_chats.length > 0 ? _chats :
            <p className="text-center pt-5">找個人聊天吧！</p>
          }
        </ul>
      </section>
    )
  }
}

export default ChatList;



