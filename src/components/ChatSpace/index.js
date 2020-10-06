import React, { useState, createRef, useContext} from "react";
import style from "./index.module.scss";
import {AuthContext} from "../../Auth";
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
    result = date.format("H:mm");
  } else if (hours <= 48) {
    result = "昨天";
  } else if (hours <= 72) {
    result = "前天";
  } else {
    result = date.format("MM/DD");
  }
  return result;
}

function textareaDimensions(target) {
  const maxHeight = 150;
  const _clientHeight = target.clientHeight;
  const _scrollHeight = target.scrollHeight;
  let height = _clientHeight < maxHeight ? _scrollHeight : _clientHeight ;

  if (height > maxHeight) {
    height = maxHeight;
  }
  return height;
}

function isReaded(readed) {
  return readed ? "已讀" : '';
}

const TextMsg = (props) => {
  const { currentUser } = useContext(AuthContext);
  const currentUid = currentUser.uid;
  let _className = style["dialog"];
  const msg = props.msg;
  const target = props.members.filter(user => user.id == msg.sentBy)[0];



  if (msg.sentBy === currentUid) {
    _className += " " + style["local"]
  } else {
    _className += " " + style["remote"];
  }

  return (
    <div className={_className}>
      {
        msg.sentBy !== currentUid && (
          <div className={style["avatar"]}>
            <img src={target.avatar.url} alt={target.nickname}/>
          </div>
        )
      }
      <div className={style["say"]}>{msg.text}</div>
      <div className={style["states"]}>
        { msg.sentBy === currentUid && <div>{isReaded(msg.readed)}</div>}
        <div>{HandlerDate(msg.id)}</div>
      </div>
    </div>
  )
};

class ChatSpace extends React.Component{
  static contextType = AuthContext
  constructor(props) {
    super(props);
    this._header = createRef();
    this._chatInputSection = createRef();
    this.state = {
      headerHeight: 'auto',
      inputHeight: 'auto',
      dialogueHeight: 'auto',
      value: ''
    };
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
    this.inputHandle = this.inputHandle.bind(this);
    this.submitHandle = this.submitHandle.bind(this);
  }
  componentDidMount() {
    const { currentUser } = this.context;
    this.UpdateDimensions();
  }
  UpdateDimensions() {
    this.setState({
      headerHeight: this._header.current.clientHeight
    }, function () {
      this.setState(state => ({
        dialogueHeight: window.innerHeight - (this.props.headerHeight + this._chatInputSection.current.clientHeight + state.headerHeight + 2)
      }));
    });
  }
  // GetChat() {
  //   const { currentChatUid } = this.context
  //   db.collection('chats').doc(currentChatUid.toString()).get()
  //     .then(doc => {
  //       if (doc.exists) {
  //         const data = doc.data();
  //         const members = Object.values(data.members);
  //         this.setState({
  //           chat: data
  //         });
  //         members.forEach((id, i) => {
  //           this.GetUsers(id, i,  members.length);
  //         })
  //       }
  //     })
  // }
  // GetUsers(id, index, length) {
  //   const users = db.collection('users');
  //   users.doc(id).get()
  //     .then(user => {
  //       if (user.exists) {
  //         this.setState(state => ({
  //           members: state.members.concat([{
  //             ...user.data(),
  //             id
  //           }])
  //         }), function () {
  //           if (index === length -1) {
  //             this.setState({
  //               padding: false
  //             })
  //           }
  //         });
  //       }
  //     })
  // }
  // AddMessages(dialog) {
  //   const { currentUser, currentChatUid } = this.context;
  //   const chatId = currentChatUid.toString();
  //
  //   db.collection('chatMessages').doc(chatId).collection('messages')
  //     .add({
  //       type: 1,
  //       text: this.state.text,
  //       imgs: [],
  //       //   imgs: [{
  //       //   fileLocation: "",
  //       //   url: ""
  //       // }],
  //       ,
  //       create: firebase.firestore.FieldValue.serverTimestamp(),
  //       ...dialog
  //     }).then(docRef => {
  //     console.log("Document written with ID: ", docRef.id);
  //   })
  // }
  inputHandle(e) {
    const target = e.target

    this.setState({
      value: target.value
    });

    this.setState({
      inputHeight: "auto"
    }, function () {
      this.setState({
        inputHeight: textareaDimensions(target)
      });
      this.UpdateDimensions();
    });
  }
  submitHandle(e) {
    const { currentUser } = this.context;
    if (e.nativeEvent.keyCode === 13) {
      e.preventDefault();

       let msg = this.state.value;

       if (typeof msg === "string") {
         msg = msg.trim();
         if (msg.length > 0) {
           this.props.AddMessages({
             text: msg,
             sentBy: currentUser.uid
           });
           this.setState({
             value: ""
           })
         }
       }
    }
  }
  render() {
    const _className = this.props.className ? "chat-space " + this.props.className : "chat-space";

    const list = this.props.current.dialogue;
    const msgList = [];

    if (list.length > 0 && this.props.current.members.length > 0) {
      list.forEach(dia => msgList.push(<TextMsg key={dia.id} msg={dia} members={this.props.current.members}/>))
    }

    return (
      <section className={_className}>
        <header ref={this._header} className={style["chat-space-header"]}>
          <button className={style["icon-btn"]} onClick={this.props.toList}><i className="fa fa-chevron-left"/></button>
          <h4 className={style["user-name"]}>{ this.props.current.chat.name }</h4>
        </header>
        <div className={style["chat-space-body"]}>
          <div className={style["dialogue"]} style={{height: this.state.dialogueHeight}}>
            { msgList }
          </div>
          <div className={style["chat-input"]} ref={this._chatInputSection}>
            <div className={style["chat-input-field"]}>
              <textarea
                rows="1"
                placeholder="輸入訊息"
                value={this.state.value}
                onChange={this.inputHandle}
                onKeyPress={this.submitHandle}
                style={{height: this.state.inputHeight}}
              />
            </div>
            <div className={style["chat-input-tool"]}>
              <button className={style["icon-btn"]} title="傳送檔案"><i className="fa fa-paperclip"/></button>
              <button className={style["icon-btn"]} title="emoji"><i className="fa fa-smile-o"/></button>
              <button
                className={style["icon-btn"]}
                title="傳送"
                onClick={this.inputHandle}
              >
                <i className="fa fa-paper-plane"/>
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }
}


export default ChatSpace;
