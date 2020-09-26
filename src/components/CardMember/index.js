import React from "react";
import style from "./index.module.scss"

const CardMember = (props) => {
  const person = props.person;
  return (
    <div className={style.card}>
      <div className={style["img-frame"]}>
        <img src={person.avatar} alt={person.name}/>
      </div>
      <div className={style["card-body"]}>
        <h3 className={style["card-title"]}>{person.nickname}</h3>
        <button className={style.btn} onClick={() => props.onClick(props.id)}>聊天</button>
      </div>
    </div>
  )
};

export default CardMember;
