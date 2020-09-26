import React from "react";
import "./index.scss";
import fb from "./img/facebook-f-brands.svg";
import google from "./img/google-brands.svg";
import github from "./img/github-brands.svg";
import firebase from "firebase";
const getAuthProvider = (providerName) => {
  let provider = null;
  switch(providerName) {
    case 'google':
      provider = new firebase.auth.GoogleAuthProvider();
      break;
    case 'facebook':
      provider = new firebase.auth.FacebookAuthProvider();
      break;
    case 'github':
      provider = new firebase.auth.GithubAuthProvider();
      break;
    case 'email':
      provider = new firebase.auth.EmailAuthProvider();
      break;
  }
  return provider
}

const auth = (e, providerName) => {
  const auth = firebase.auth();
  const provider = getAuthProvider(providerName);
  e.preventDefault();
  auth.signInWithPopup(provider)
    .then(res => console.log(res))
    .catch(err => console.log(err));
}

const googleAuth = (e) => {
  const auth = firebase.auth();
  const provider = getAuthProvider('google');
  e.preventDefault();
  auth.signInWithPopup(provider)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};

const facebookAuth = (e) => {
  const auth = firebase.auth();
  const provider = getAuthProvider('facebook');
  e.preventDefault();
  auth.signInWithPopup(provider)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};

const githubAuth = (e) => {
  const auth = firebase.auth();
  const provider = getAuthProvider('google');
  e.preventDefault();
  auth.signInWithPopup(provider)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};



const SocialAuth = () => {

  return (
    <ul className="social-media">
      <li className="social-media-item fb">
        <button className="social-media-link" onClick={e => {auth(e, 'facebook')}}>
          <img src={fb} alt="facebook"/>
        </button>
      </li>
      <li className="social-media-item google">
        <button className="social-media-link" onClick={e => {auth(e, 'google')}}>
          <img src={google} alt="facebook"/>
        </button>
      </li>
      <li className="social-media-item github">
        <button className="social-media-link" onClick={e => auth(e, 'github')}>
          <img src={github} alt="facebook"/>
        </button>
      </li>
    </ul>
  )
};

export default SocialAuth;


