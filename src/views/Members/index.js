import React from "react";
import "./index.scss";
import { db, storage } from "../../firebaseAPI";
import CardMember from "../../components/CardMember";
import { AuthContext } from "../../Auth";


class Members extends React.Component{
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      members: []
    };
    this.createChat = this.createChat.bind(this);
    this.getMembers = this.getMembers.bind(this);
    this.users = db.collection("users");
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
    const { currentUser } = this.context;

    if ( currentUser ) {
      const chats = db.collection('chats');
      const userChats = db.collection('userChats');
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

            this.props.history.push('/chat');
          });

      } else {
        this.props.history.push('/chat');
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
      <main className="members bg-gray">
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
