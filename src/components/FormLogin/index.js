import React, { useState } from "react";
import "./index.scss";
import { auth } from "../../firebaseAPI";
import { useHistory } from "react-router-dom";
import {
  Formik,
  Form
} from "formik";
import {
  emailRequired,
  required
} from "../../tool/validate";
import TextField from "../TextField";
import MainBtn from "../BtnMain";
import SocialAuth from "../SocialAuth";
import Alert from "../Alert";


// 提示登入錯誤訊息
const handleError = Err => {
  switch (Err) {
    case "auth/wrong-password":
      return (
        <Alert className="alert-danger">
          密碼錯誤
        </Alert>
      );
    case "auth/user-not-found":
      return (
        <Alert className="alert-danger">
          此帳號不存在
        </Alert>
      );
    default:
      return null
  }
};

// 主要表單
const FormLogin = (props) => {
  const history = useHistory();
  const [ responseStatus, setResponseStatus ] = useState(null);


  return (
    <div className="login">
      <h1>登入帳號</h1>
      <SocialAuth/>
      <p>或者用電子郵件登入</p>
      <Formik
        initialValues={{
          email: '',
          password: ''
        }}
        onSubmit={async (values, {resetForm}) => {
          const { email, password } = values;
          try {
            await auth.signInWithEmailAndPassword(email, password);
            history.push("/");
          } catch (error) {
            setResponseStatus(error.code);
            resetForm({
              email: '',
              password: ''
            });
          }
        }}
      >
        <>
          {responseStatus && handleError(responseStatus)}
          <Form>
            <TextField label="Email" name="email" type="email" validate={emailRequired} />
            <TextField label="密碼" name="password" type="password" validate={required}/>
            <p><button type={"button"} className="link" onClick={props.onClickForgetForm}>忘記密碼？</button></p>
            <MainBtn text="登入" type="submit"/>
          </Form>
        </>
      </Formik>
    </div>
  )
};

export default FormLogin;
