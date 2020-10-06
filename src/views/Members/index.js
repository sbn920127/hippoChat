import React from "react";
import "./index.scss";
import { db, storage } from "../../firebaseAPI";
import CardMember from "../../components/CardMember";
import { AuthContext } from "../../Auth";


class Members extends React.Component{
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.users = db.collection("users");
    this.userChats = db.collection("userChats");
    this.state = {
      members: []
    };
    this.createChat = this.createChat.bind(this);
    this.getMembers = this.getMembers.bind(this);

  }
  componentDidMount() {
    this.users.get()
      .then(this.getMembers);
  }
  componentWillUnmount() {
  }
  getMembers(querySnapshot) {
    const { currentUser } = this.context;
    const _members = [];

    querySnapshot.forEach(function (user) {
      const data = user.data();
      if (currentUser && currentUser.uid === user.id) { return false }
      _members.push({
        id: user.id,
        nickname: data.nickname,
        avatar: data.avatar.url
      });
    });

    this.setState({
      members: _members
    });
  }
  async createChat(id) {
    const { currentUser, changeChatId } = this.context;
    const userChats = db.collection('userChats');

    if ( currentUser ) {
      const chats = db.collection('chats');
      const myselfIsFirst = await userChats.doc(currentUser.uid).get()
        .then(doc => {
          if (!doc.exists) return false;
          return Object.keys(doc.data()).includes(id)
        });
      const targetIsFirst = await userChats.doc(currentUser.uid).get()
        .then(doc => {
          if (!doc.exists) return false;
          return Object.keys(doc.data()).includes(currentUser.uid)
        });

      if (!myselfIsFirst && !targetIsFirst) {
        chats.add({
          name: null,
          avatar: null,
          members: [currentUser.uid, id],
          last_msg_id: null,
          unread: 0
        })
          .then(docRef => {
            const chatId = docRef.id;
            userChats.doc(currentUser.uid).set({
              [id]: chatId,
            }, {merge: true});
            userChats.doc(id).set({
              [currentUser.uid]: chatId,
            });
            changeChatId(chatId);
            this.props.history.push(`/chat`);
          });
      } else {
        this.userChats.doc(currentUser.uid).get()
          .then(doc => {
            if (doc.exists) {
              changeChatId(doc.data()[id]);
              console.log(23, doc.data()[id]);
              this.props.history.push("/chat");
            }
          });
      }
    } else {
      this.props.history.push('/login');
    }
  }
  render() {
    const _members = this.state.members.map(member => (
      <div key={member.id} className="col-6 col-md-4 col-lg-3">
        <CardMember id={member.id} person={member} onClick={this.createChat} />
      </div>
    ));
    return (
      <main className="members bg-secondary">
        <div className="container">
          <div className="row">
            {_members}
          </div>
        </div>
      </main>
    )
  }
}

export default Members;
