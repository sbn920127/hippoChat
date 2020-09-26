import React from "react";
import "./index.scss";
import avatar from "./img/avatar.png";
import ChatList from "../../components/ChatList";
import ChatSpace from "../../components/ChatSpace";


class Chat extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      mobile: null,
      chatListClass: '',
      chatSpaceClass: '',
      headerHeight: null
    };
    this.isMobile = this.isMobile.bind(this);
    this.windowResize = this.windowResize.bind(this);
    this.showChatList = this.showChatList.bind(this);
    this.showChatSpace = this.showChatSpace.bind(this);
  }
  componentDidMount() {
    if (this.props.header.current) {
      this.setState({
        headerHeight: this.props.header.current.clientHeight
      })
    }
    this.isMobile();
    window.addEventListener('resize', this.windowResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResize);
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
  isMobile() {
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
  windowResize() {
    this.isMobile();
  }
  render() {
    return (
      <main className="chat">
        <div className="chat-row">
          <ChatList
            className={this.state.chatListClass}
            headerHeight={this.state.headerHeight}
            talking={this.showChatSpace}
          />
          <ChatSpace
            className={this.state.chatSpaceClass}
            headerHeight={this.state.headerHeight}
            toList={this.showChatList}
          />
        </div>
      </main>
    )
  }
}

export default Chat;
