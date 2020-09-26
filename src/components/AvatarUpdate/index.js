import React, { createRef } from "react";
import style from "./index.module.scss";
import { storage, db } from "../../firebaseAPI";
import {AuthContext} from "../../Auth";

class AvatarUpdate extends React.Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      imgFileLocal: null,
      imgUrl: null
    };
    this.ChangeFile = this.ChangeFile.bind(this);
    this.CheckImgSize = this.CheckImgSize.bind(this);
    this.HandlerImg = this.HandlerImg.bind(this);
    this.Compression = this.Compression.bind(this);
    this.SetUserAvatar = this.SetUserAvatar.bind(this);
    this.DeleteUserAvatar = this.DeleteUserAvatar.bind(this);
    this._file = createRef();
    this._canvas = createRef();
    this.users = db.collection("users");
  }
  componentDidMount() {
    const { currentUser } = this.context;
    if (currentUser) {
      this.users.doc(currentUser.uid).get()
        .then(res => {
          this.setState({
            imgFileLocal: res.data().avatar.fileLocation,
            imgUrl: res.data().avatar.url
          },function () {
            this.HandlerImg(this.state.imgUrl);
          });
        });
    }
  }
  ChangeFile() {
    const reader = new FileReader();
    const files = this._file.current.files[0];

    if (typeof files !== "undefined") {
      if (this.CheckImgSize(files.size)) {
        reader.readAsDataURL(files);
        reader.onload = () => {
          const url = reader.result;
          if (url.length > 0) {
            this.HandlerImg(url, files);
          }
        }
      } else {
        this._file.current.value = "";
      }
    }
  }
  CheckImgSize(size) {
    const maxBytes = 10485760;
    const stok = Math.ceil(size / 1024);
    const mtok = Math.ceil(maxBytes / 1024);

    if (size > maxBytes) {
      alert(`您所選擇的檔案大小為 ${stok}KB，已超過上傳上限。(檔案上限：${mtok}KB。)`);
      return false;
    } else {
      return true;
    }
  }
  HandlerImg(url, file) {
    let dx, dy;
    const viewDimensions = {
      width: 100,
      height: 100
    };
    const canvas = this._canvas.current;
    const then = this;

    if (canvas.getContext) {
      const _img = new Image();
      _img.src = url;
      _img.onload = function() {
        const ctx = canvas.getContext('2d');
        const { width, height } = then.ImgDimensions(_img, viewDimensions);
        canvas.width = width;
        canvas.height = height;
        dx = (width - width) / 2;
        dy = (height - height) / 2;
        ctx.drawImage(this, dx, dy, viewDimensions.width, viewDimensions.height);
        if (file) then.Compression(file);
      }
    }
  }
  ImgDimensions(img, viewDimensions) {
    let scale, mate;
    let { width, height } = img;
    const minSize = Math.min(width, height);
    const maxSize = Math.min(width, height);

    if (viewDimensions.width === viewDimensions.height) {
      return viewDimensions;
    } else if (Math.min(viewDimensions.width, viewDimensions.height) >= maxSize) {
      mate = maxSize;
    } else {
      mate = minSize;
    }

    switch (mate) {
      case viewDimensions.width:
        scale = width / viewDimensions.width;
        width = viewDimensions.width;
        height = height / scale;
        break;
      default:
        scale = height / viewDimensions.height;
        width = width / scale;
        height = viewDimensions.height;
        break;
    }

    return {
      width,
      height
    };
  }
  Compression(file) {
    const then = this;
    this._canvas.current.toBlob(function (blob) {
      let fileName = file.name.replace(/(.+)(\.(jpg|jpeg|png))$/gi, Date.now() + '$2')

      const local = "avatars/" + fileName;
      const ref = storage.ref(local);
      ref.put(blob).then(snapshot => {
        then.SetUserAvatar(local);
      });
    }, file.type, .9);
  }
  async SetUserAvatar(local) {
    const { currentUser } = this.context;
    if (this.state.imgFileLocal && this.state.imgFileLocal !== "avatars/default.jpg") {
      await this.DeleteUserAvatar();
    }
    storage.ref(local).getDownloadURL()
      .then(url => {
        this.users.doc(currentUser.uid).update({
          avatar: {
            fileLocation: local,
            url
          }
        })
          .then(() => {
            this.setState({
              imgFileLocal: local,
              imgUrl: url
            })
          });
      });
  }
  DeleteUserAvatar() {
    storage.ref(this.state.imgFileLocal).delete()
      .then(() => console.log("success"));
  }
  render () {
    return (
      <div className={style.avatar}>
        <div className={style["img-frame"]}>
          <canvas ref={this._canvas}></canvas>
        </div>
        <div className="d-none">
          <input
            ref={this._file}
            type="file"
            name="avatar"
            id="avatar"
            accept="image/png, image/jpeg"
            onChange={this.ChangeFile}
          />
        </div>
        <button className={style['avatar-btn']} onClick={()=> this._file.current.click()}>編輯</button>
      </div>
    )
  }
}


export default AvatarUpdate;
