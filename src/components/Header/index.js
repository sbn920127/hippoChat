import React, {useContext} from "react";
import {Link} from "react-router-dom";
import style from "./index.module.scss";
import BurgerMenuIcon from "../BtnBurgerMenu";
import LogoutBtn from "../BtnLogout";
import { AuthContext } from "../../Auth";

const Menus = (props) => {
  const { currentUser, changeChatId } = useContext(AuthContext);
  if (currentUser) {
    return (
      <>
        <li className={style["nav-item"]}>
          <Link
            to="/chat"
            className={style["nav-link"]}
            onClick={() => {
              changeChatId("");
              props.onClick();
            }}
          >Chat</Link>
        </li>
        <li className={style["nav-item"]}>
          <Link
            to="/account"
            className={style["nav-link"]}
            onClick={props.onClick}
          >帳號</Link>
        </li>
        <li className={style["nav-item"]}>
          <LogoutBtn onClick={props.onClick}/>
        </li>
      </>
    );
  }
  return (
    <>
      <li className={style["nav-item"]}>
        <Link to="/login" className={style["nav-link"]}>登入/註冊</Link>
      </li>
    </>
  )
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuActive: false,
      navClass: style.nav
    };
    this.handlerClick = this.handlerClick.bind(this);
  }

  handlerClick() {
    this.setState(state => ({
      menuActive: !state.menuActive,
      navClass: !state.menuActive ? style['nav-active'] : style.nav
    }));
  }

  render() {
    return (
      <header className={style.header} ref={this.props.headerRef}>
        <nav className={style.navbar}>
          <Link to="/" className={style["navbar-brand"]}>Hippo chat</Link>
          <ul className={this.state.navClass}>
            <Menus onClick={this.handlerClick}/>
          </ul>
          <BurgerMenuIcon className={style["burger-menu"]} active={this.state.menuActive} onClick={() => this.handlerClick()}/>
        </nav>
      </header>
    )
  }
}

export default Header;
