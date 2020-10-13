import React, { createRef, useContext} from "react";
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

// textarea 調整高度
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

const Dialog = (props) => {
  const { currentUser } = useContext(AuthContext);
  const currentUid = currentUser.uid;
  let _className = style["dialog"];
  const msg = props.msg;
  const target = props.members.filter(user => user.id === msg.sentBy)[0];

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
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this._header = createRef();
    this._chatInputSection = createRef();
    this.state = {
      headerHeight: 'auto',
      inputHeight: 'auto',
      dialogueHeight: 'auto',
      value: '',
      showing: false
    };
    this.UpdateDimensions = this.UpdateDimensions.bind(this);
    this.inputHandle = this.inputHandle.bind(this);
    this.submitHandle = this.submitHandle.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.UpdateDimensions);
  }
  shouldComponentUpdate(nextProps, nextState) {
    // console.log(77, nextState.dialogueHeight == "auto", Object.keys(nextProps.current.chat).length > 0);
    if (nextState.dialogueHeight == "auto" && Object.keys(nextProps.current.chat).length > 0 && this._header.current) {
      this.UpdateDimensions();
    }
    return true;
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.UpdateDimensions);
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
  inputHandle(e) {
    const target = e.target;

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

    // enter event
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
    const { chat, members, dialogue } = this.props.current;
    let messages = [];

    if (members.length > 0) {
      messages = dialogue.map(msg => <Dialog key={msg.id} msg={msg} members={members}/>);
    }

    if (Object.keys(chat).length == 0) {
      return <section className={_className}></section>
    }

    return (
      <section className={_className}>
        <header ref={this._header} className={style["chat-space-header"]}>
          <button className={style["icon-btn"]} onClick={this.props.toList}><i className="fa fa-chevron-left"/></button>
          <h4 className={style["user-name"]}>{ Object.keys(this.props.current.chat).length > 0 ? this.props.current.chat.name : "..." }</h4>
        </header>
        <div className={style["chat-space-body"]}>
          <div className={style["dialogue"]} style={{height: this.state.dialogueHeight}}>
            { messages.length ? messages : null }
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
