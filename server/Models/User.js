const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRoudns = 10;
const jwt = require("jsonwebtoken");

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

userSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    //user정보 중에서 password부분이 바뀌었을 때, 신규 가입시에 입력된 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRoudns, function (err, salt) {
      //hash를 만들기 위한 salt 생성
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        // salt를 사용하여 hash값 생성(비밀번호 암호화)
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;

  // jsonwebtoken을 이용해서 token을 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  // user._id + 'secretToken' = token 생성
  // ->
  // 'secretToken' 입력을 통해 user._id를 확인 가능

  user.token = token;
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  //토큰을 decode 한다.
  //위에서 토큰을 만들기 위해 설정한 문자열을 이용
  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 DB에 보관된 token이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};
const User = mongoose.model("User", userSchema);
//스키마를 모델로 감싸 줌 ('모델 이름', 모델용 스키마)

module.exports = { User };
