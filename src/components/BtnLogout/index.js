import React from "react";
import style from "./index.module.scss";
import { auth } from "../../firebaseAPI";

const BtnLogout = (props) => {
  return (
    <button
      className={style.logout}
      type="button"
      aria-label="logout"
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
        auth.signOut();
        alert('已登出');
      }}
    >
      登出
    </button>
  )
};

export default BtnLogout;
