import React from "react";
import "./index.scss";
import style from "./account.module.scss";
import { auth, db } from "../../firebaseAPI";
import { Formik, Form } from "formik";
import TextField from "../../components/TextField";
import { required } from "../../tool/validate";
import AvatarUpdate from "../../components/AvatarUpdate";
import { AuthContext } from "../../Auth";


const EditArea = (props) => {
  if (props.isEdit) {
    return (
      <div className="col-12 nickname">
        <Formik
          initialValues={{
            nickname: ""
          }}
          onSubmit={(values, {resetForm}) => {
            const user = auth.currentUser;
            db.collection("users").doc(user.uid).update({
              nickname: values.nickname
            }).then(() => {
              props.getUserInfo();
              resetForm({
                nickname: ""
              });
              props.onClick();
            })
          }}
        >
          <Form className={style["input-field"]}>
            <TextField label="暱稱/稱呼" name="nickname" type="text" validate={required} />
            <button type="submit" className="btn">確認</button>
          </Form>
        </Formik>
      </div>
    )
  } else {
    return (
      <>
        <div className="col-4">
          <p className="label">稱呼</p>
        </div>
        <div className="col-8 nickname">
          <p className="value pr-4">{props.nickname ? props.nickname : "nobody"}</p>
          <button className="btn btn-sm" onClick={props.onClick}>編輯</button>
        </div>
      </>
    )
  }
};


class Account extends React.Component{
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      email: null,
      nickname: null,
      isEdit: false
    };
    this.getUserInfo = this.getUserInfo.bind(this);
    this.handlerClick = this.handlerClick.bind(this);
  }
  getUserInfo() {
    const { currentUser } = this.context;
    const then = this;
    db.collection('users').doc(currentUser.uid).get()
      .then(res => {
        const data = res.data();
        then.setState({
          email: currentUser.email,
          nickname: data.nickname
        })
      });
  }
  handlerClick() {
    this.setState(state => ({
      isEdit: !state.isEdit
    }))
  }
  componentDidMount() {
    this.getUserInfo();
  }
  render(){
    return (
      <main className="account">
        <div className="container">
          <h1 className="text-center">會員資料</h1>
          <div className="account-content">
            <AvatarUpdate />
            <div className="row">
              <EditArea nickname={this.state.nickname} getUserInfo={this.getUserInfo} isEdit={this.state.isEdit} onClick={this.handlerClick} />
            </div>
            <div className="row">
              <div className="col-4">
                <p className="label">Email</p>
              </div>
              <div className="col-8">
                <p className="value">{this.state.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }
}

export default Account;
