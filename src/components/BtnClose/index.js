import React from "react";
import "./index.scss";

const BtnClose = (props) => {
  return (
    <button
      className="close"
      type="button"
      aria-label="close"
      onClick={props.onClick}
    >
      <span aria-hidden="true">&times;</span>
    </button>
  )
};

export default BtnClose;
