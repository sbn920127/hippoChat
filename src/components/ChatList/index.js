import React, { createRef }from "react";
import "./index.scss";
import style from "./chatList.module.scss"
import { AuthContext } from "../../Auth";
import { db } from "../../firebaseAPI";
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
  const chat = props.chat;
  const date = HandlerDate(chat.last_msg_id);
  chat.unread = 2;
  chat.last_msg = "this is test this is test  this is test";

  return (
    <li className={style.item} onClick={props.onClick}>
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
      chats: [],
      searchHeight: 0,
      roomHeight: 0
    };
    this.search = createRef();
    this.GetChats = this.GetChats.bind(this);
  }
  componentDidMount() {
    this.setState({
      searchHeight: this.search.current.clientHeight,
    }, function () {
      this.setState((state) => {
        return {
          roomHeight: window.innerHeight - (this.props.headerHeight + state.searchHeight)
        }
      });
    });
    this.GetChats();
  }
  async GetChats() {
    const { currentUser } = this.context;
    const userChats = db.collection('userChats');
    const chats = db.collection('chats');
    const chatMessages = db.collection('chatMessages');

    const _chats = await userChats.doc(currentUser.uid).get()
      .then(doc => {
        if (!doc.exists) return [];
        return Object.values(doc.data());
      });

    chats.orderBy("last_msg_id", "desc").get()
      .then(querySnapshot => {
        const _chat_group = [];

        querySnapshot.forEach(async doc => {
          const messages = chatMessages.doc(doc.id).collection("messages");

          const msg = () => {
            messages.orderBy("created", "desc").limit(1).get()
              .then(res => {
                let _msg;
                res.forEach(msg => {
                  _msg = msg.data();
                });
                return _msg;
              });
          };

          if (_chats.includes(doc.id)) {
            _chat_group.push({
              id: doc.id,
              last_msg: await msg(),
              ...doc.data()
            });
          }
        });
        return _chat_group;
      })
      .then(chats => {
        this.setState({
          chats: chats
        });
      });
  }
  render() {
    const _chats = [];
    if (this.state.chats.length > 0) {
      this.state.chats.forEach(chat => {
        _chats.push(<ChatSummary key={chat.id} chat={chat} onClick={this.props.talking}/>)
      });
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
            {_chats}
          </ul>
        </section>
      )
    } else {
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
          </ul>
        </section>
      )
    }
  }
}

export default ChatList;



