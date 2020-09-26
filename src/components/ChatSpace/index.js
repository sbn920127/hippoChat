import React, {createRef} from "react";
import "./index.scss";
import avatar from "./img/avatar.png";

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
  const msg = props.msg;
  let _className = "dialog";
  if (msg.uid === "dkfjl2kjelkje") _className += " local"
  else _className += " remote";
  return (
    <div className={_className}>
      {
        msg.uid !== "dkfjl2kjelkje" && (
          <div className="avatar">
            <img src={avatar} alt=""/>
          </div>
        )
      }
      <div className="say">{msg.content}</div>
      <div className="states">
        <div>{isReaded(msg.readed)}</div>
        <div>{msg.date}</div>
      </div>
    </div>
  )
};

class ChatSpace extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      inputHeight: "auto",
      dialogueHeight: 0,
      text: '',
      dialogue: [
        {
          id: "k3erjlkjsf",
          type: 1,
          date: "2020/09/11 12:00",
          readed: false,
          uid: "dkfjl2kjelkje",
          content: "你在幹嘛？"
        },
        {
          id: "k3erjlskjsf",
          type: 1,
          date: "2020/09/11 12:00",
          readed: false,
          uid: "dkfjl2kjelkjekjfks",
          content: "睡覺，不要吵"
        }
      ]
    };
    this.chatInputSection = createRef();
    this.chatHeight = createRef();
    this.inputHandle = this.inputHandle.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.submitHandle = this.submitHandle.bind(this);
  }
  componentDidMount() {
    setTimeout(() => {
      this.updateDimensions();
    }, 600);
  }
  updateDimensions() {
    this.setState({
      dialogueHeight: "auto"
    }, function () {
      this.setState({
        dialogueHeight: window.innerHeight - (this.props.headerHeight + this.chatInputSection.current.clientHeight + this.chatHeight.current.clientHeight + 2)
      });
    });
  }
  inputHandle(e) {
    const target = e.target;
    this.setState({
      inputHeight: "auto"
    }, function () {
      this.setState({
        inputHeight: textareaDimensions(target)
      });
      this.updateDimensions();
    });
    this.setState({
      text: e.target.value,
    });
  }
  submitHandle(e) {
    const target = e.target;
    // let value = target.value;
    if (e.nativeEvent.keyCode === 13) {
      console.log('submit');
    }
  }
  render() {
    const list = this.state.dialogue;
    const msgList = [];
    if (list.length > 0) {
      list.map(d => msgList.push(<TextMsg key={d.id} msg={d} />))
    }
    return (
      <section className={"chat-space" + " " + this.props.className}>
        <header className="chat-space-header" ref={this.chatHeight}>
          <button className="icon-btn" onClick={this.props.toList}><i className="fa fa-chevron-left"></i></button>
          <h4 className="user-name">心機鬼</h4>
        </header>
        <div className="chat-space-body">
          <div className="dialogue" style={{height: this.state.dialogueHeight}}>
            {msgList}
          </div>
          <div className="chat-input" ref={this.chatInputSection}>
            <div className="chat-input-field">
              <textarea
                rows="1"
                placeholder="輸入訊息"
                value={this.state.text}
                onChange={this.inputHandle}
                onKeyPress={this.submitHandle}
                style={{height: this.state.inputHeight}}
              ></textarea>
            </div>
            <div className="chat-input-tool">
              <button className="icon-btn" title="傳送檔案"><i className="fa fa-paperclip"></i></button>
              <button className="icon-btn" title="emoji"><i className="fa fa-smile-o"></i></button>
            </div>
          </div>
        </div>
      </section>
    )
  }
}


export default ChatSpace;
