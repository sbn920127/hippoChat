import React from "react";
import "./index.scss";
import { auth, db, storage } from "../../firebaseAPI";
import { Formik, Form } from "formik";
import {emailRequired, passwordRequired, required} from "../../tool/validate";

import TextField from "../TextField";
import MainBtn from "../BtnMain";
import SocialAuth from "../SocialAuth";

const FormRegister = (props) => {

  return (
    <div className="register">
      <h1>註冊帳號</h1>
      <SocialAuth />
      <p>或者用電子郵件註冊</p>
      <Formik
        initialValues={{
          nickname: '',
          email: '',
          password: ''
        }}
        onSubmit={async (values, {resetForm}) => {
          let { email, password, nickname } = values;
          try {
            await auth.createUserWithEmailAndPassword(email, password)
              .then(res => {
                const defaultImg = "avatars/default.jpg";
                props.handleResponse('success');
                storage.ref(defaultImg).getDownloadURL()
                  .then(url => {
                    db.collection("users").doc(res.user.uid).set({
                      nickname,
                      avatar: {
                        fileLocation: defaultImg,
                        url: url
                      }
                    });
                  });
                resetForm({
                  nickname: '',
                  email: '',
                  password: ''
                });
              });
          } catch (error) {
            props.handleResponse(error.code);
            resetForm({
              nickname: '',
              email: '',
              password: ''
            });
          }
        }}
      >
        <>
          <Form>
            <TextField label="暱稱/稱呼" name="nickname" type="text" validate={required} />
            <TextField label="Email" name="email" type="email" validate={emailRequired} />
            <TextField label="密碼" name="password" type="password" validate={passwordRequired}/>
            <MainBtn text="註冊" type="submit"/>
          </Form>
        </>
      </Formik>
    </div>

  )
};

export default FormRegister;


