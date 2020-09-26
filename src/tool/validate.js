// 驗證EMAIL(必填、格式)
export const emailRequired = (value) => {
  let error;
  if (!value) {
    error = '必填'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
    error = '無效的Email格式';
  }
  return error;
};

// 驗證密碼(必填、格式)
export const passwordRequired = (value) => {
  let error;
  if (!value) {
    error = '必填';
  } else if (value.length < 6) {
    error = '密碼太短囉';
  } else if (!/[A-Z]{1,}/i.test(value)) {
    error = '至少要一個字母';
  }
  return error;
};

// 驗證是否必填
export const required = (value) => {
  let error;
  if (!value) {
    error = '必填';
  }
  return error;
};
