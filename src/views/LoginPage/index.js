import React from "react";
import "./index.scss";
import style from "./login.module.scss";
import LoginForm from "../../components/FormLogin";
import Register from "../../components/FormRegister";
import ForgetPassword from "../../components/FormForgetPassword";
import Modal from "../../components/Modal";
import {Link} from "react-router-dom";

const ReturnMsg = (props) => {
  switch (props.code) {
    case 'success':
      return (
        <Modal title="歡迎您已成為 Hippo" onClick={props.onClick}>
          <p>我們已寄註冊驗證信到你的Email，請您繼續完成驗證。</p>
          <Link to="/" className="btn btn-rounded btn-primary">回首頁</Link>
        </Modal>
      );
    case 'auth/email-already-in-use':
      return (
        <Modal title="註冊失敗" onClick={props.onClick}>
          <p>這個Email已經是網站會員，沒有辦法重複註冊喔。</p>
        </Modal>
      );
    default:
      return null
  }
};


class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: "activeA",
      hide: "groupB",
      responseStatus: null,
      isModalOpen: false,
      forgetPasswordStatus: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.showForgetPassword = this.showForgetPassword.bind(this);
    this.handleResponseStatus = this.handleResponseStatus.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }
  handleClick() {
    this.setState(state => ({
      active: state.active === "activeA" ? "activeB" : "activeA"
    }));
    setTimeout(() => this.setState(state => ({
      hide: state.hide === "groupB" ? "groupA" : "groupB"
    })), 400);
  }
  showForgetPassword() {
    this.setState(state => ({
      forgetPasswordStatus: !state.forgetPasswordStatus
    }));
  }
  handleResponseStatus(res) {
    this.setState(state => ({
      responseStatus: res,
      isModalOpen: true
    }))
  }
  hideModal() {
    this.setState(state => ({
      isModalOpen: false
    }))
  }
  render() {
    let innerClass= `${style.inner} ${this.state.active}`;
    let groupAClass = this.state.hide === "groupA" ? "hide" : "";
    let groupBClass = this.state.hide === "groupB" ? "hide" : "";
    return(
      <main className="container-fluid">
        <div className={innerClass}>
          <div className={`form groupA ${groupAClass}`}>
            <LoginForm onClickForgetForm={this.showForgetPassword} />
          </div>
          <div className={`box groupA ${groupAClass}`}>
            <div className="box-inner">
              <h2 className="text-white">你是新成員？</h2>
              <button
                type="button"
                className="btn btn-rounded btn-white-outline"
                onClick={() => this.handleClick()}
              >前往註冊</button>
            </div>
          </div>
          <div className={`form groupB ${groupBClass}`}>
            <Register handleResponse={this.handleResponseStatus}/>
          </div>
          <div className={`box groupB ${groupBClass}`}>
            <div className="box-inner">
              <h2 className="text-white">你已經有帳號了嗎？</h2>
              <button
                type="button"
                className="btn btn-rounded btn-white-outline"
                onClick={() => this.handleClick()}
              >前往登入</button>
            </div>
          </div>
        </div>
        {this.state.forgetPasswordStatus && <ForgetPassword onClick={this.showForgetPassword} />}
        {this.state.isModalOpen && <ReturnMsg code={this.state.responseStatus} onClick={this.hideModal} />}
      </main>
    )
  }
};

export default LoginPage;





