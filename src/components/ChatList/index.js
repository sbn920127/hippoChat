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

  if (now.get('date') === date.get('date')) {
    if (seconds === 0 || seconds === 1) {
      result = `1秒前`;
    } else if (seconds <= 60) {
      result = `${seconds}秒前`;
    } else if (minutes <= 60) {
      result = `${minutes}分鐘前`;
    } else if (hours <= 24) {
      result = date.format("H:mm");
    }
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
  const { currentUser, currentChatId } = useContext(AuthContext);
  const chat = props.chat;
  const date = HandlerDate(chat.last_msg_id);
  const _class = currentChatId === chat.id ? style['item-active'] : style.item;
  const id = currentUser.uid;



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
          {chat.unread[id] > 0 ? <span className={style.unread}>{chat.unread[id]}</span> : null}
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
      roomHeight: 0,
      padding: false
    };
    this.search = createRef();
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
  }
  componentDidMount() {
    window.addEventListener('resize', this.UpdateDimensions);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.headerHeight !== nextProps.headerHeight) {
      this.UpdateDimensions();
    }
    return true;
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.UpdateDimensions);
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



