import React from "react";
import style from "./index.module.scss";

const BtnBurgerMenu = (props) => {
  let _className = [style["btn-menu"]];

  if (props.active) _className.push(style["btn-menu-active"]);

  _className = _className.join(" ");

  if (props.className) _className += " " + props.className;

  return (
    <button type="button" className={_className} onClick={props.onClick}>
      <div className={style["burger-box"]}>
        <div className={style["burger-inner"]}></div>
      </div>
    </button>
  )
};

export default BtnBurgerMenu;


