import React, {useState} from "react";
import "./index.scss";
import { auth } from "../../firebaseAPI";
import Modal from "../Modal";
import {Form, Formik} from "formik";
import TextField from "../TextField";
import MainBtn from "../BtnMain";
import { emailRequired } from "../../tool/validate";
import Alert from "../Alert";


// 提示登入錯誤訊息
const handleMsg = res => {
  switch (res) {
    case "success":
      return (
        <Alert className="alert-success">
          已發送到你的Email
        </Alert>
      );
    case "auth/user-not-found":
      return (
        <Alert className="alert-danger">
          沒有符合的註冊Email資訊
        </Alert>
      );
    default:
      return null
  }
};

const FormForgetPassword = (props) => {
  const [ responseStatus, setResponseStatus ] = useState(null);
  return (
    <Modal className="forget-password" title={"忘記密碼？"} onClick={props.onClick}>
      <p>請輸入當初註冊的Email，我們將會寄一封重設密碼信給您</p>
      <Formik
        initialValues={{
          email: ""
        }}
        onSubmit={async (values, { resetForm }) => {
          try {
            await auth.sendPasswordResetEmail(values.email)
              .then(() => {
                setResponseStatus("success");
                resetForm({
                  email: '',
                  password: ''
                });
              });
          } catch (error) {
            setResponseStatus(error.code);
            resetForm({
              email: '',
              password: ''
            });
          }
        }}
      >
        <Form>
          { responseStatus && handleMsg(responseStatus)}
          <TextField label={"Email"} name={"email"} type={"email"} validate={emailRequired} />
          <MainBtn type={"submit"} text={"送出"} />
        </Form>
      </Formik>
    </Modal>
  )
};

export default FormForgetPassword;
