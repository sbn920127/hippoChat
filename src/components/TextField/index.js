import React from "react";
import style from "./index.module.scss";
import { useField, Field } from "formik";


const TextField = ({label, ...props}) => {
  const [field, meta] = useField(props);
  let _className = [style.input];
  if (meta.value.length > 0) _className.push(style.writing);
  _className = _className.join(" ");
  return (
    <div className={style["text-field"]}>
      <div className={style["input-field"]}>
        <Field className={_className} {...field} {...props} />
        <label htmlFor={props.name} className={style.label}>{label}</label>
      </div>
      { meta.touched && meta.error ? (<div className={style["invalid-feedback"]}>{meta.error}</div>) : null}
    </div>
  )
};


export default TextField;
