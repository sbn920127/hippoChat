import React from "react";
import "./index.scss";

const BtnMain = (props) => {
  return (
    <button type={props.type || "button"} className="main-btn" onChange={props.onChange}>
      <span>{props.text}</span>
    </button>
  )
};

export default BtnMain;
