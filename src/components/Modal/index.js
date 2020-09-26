import React, {useState} from "react";
import "./index.scss";
import CloseBtn from "../BtnClose";

const Modal = (props) => {
  let classN = props.className ? props.className : '';

  if (props.title.length) {
    return (
      <>
        <div className={`modal modal-format ${classN}`}>
          <div className="modal-inner">
            <CloseBtn onClick={props.onClick} />
            <div className="modal-header">
              <h1>{props.title}</h1>
            </div>
            <div className="modal-content">
              {props.children}
            </div>
          </div>
        </div>
        <div className="modal-overlay"></div>
      </>
    )
  }
  return (
    <>
      <div className={`modal ${classN}`}>
        <div className="modal-inner">
          <CloseBtn onClick={props.onclick} />
          <div className="modal-content">
            {props.children}
          </div>
        </div>
      </div>
      <div className="modal-overlay"></div>
    </>
  )
};

export default Modal;
