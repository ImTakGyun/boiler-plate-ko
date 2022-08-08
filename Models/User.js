const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, //이메일 작성시에 공백이 있다면 공백을 없애주는 역할 Ex) gyun 1712@gmail.com -> gyun1712@gamil.com
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    //관리자와 일반 유저를 구분해주는 역할
    type: Number,
    default: 0, //role의 기본값은 항상 0(일반 유저)
  },
  image: String,
  token: {
    //유효성 관리 역할
    type: String,
  },
  tokenExp: {
    //토큰의 유효 기간
    type: Number,
  },
});

const User = mongoose.model("User", userSchema);
//스키마를 모델로 감싸 줌 ('모델 이름', 모델용 스키마)

module.exports = { User };
