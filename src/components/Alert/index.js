import React, { useState } from "react";
import "./index.scss";
import CloseBtn from "../BtnClose";


const Alert = (props) => {
  const [ hide, setHide ] = useState(false);

  if (hide) {
    return null;
  }

  return (
    <div className={`alert ${props.className}`} role="alert">
      {props.hasCloseBtn && <CloseBtn onClick={() => setHide(true)} />}
      {props.children}
    </div>
  )
};

export default Alert;
