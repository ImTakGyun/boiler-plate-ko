const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const config = require("./config/key");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./Models/User");

//클라이언트의 x-www-form-urlencoded 형식의 데이터를 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));
//클라이언트의 json을 분석해서 가져옴
app.use(bodyParser.json());

app.use(cookieParser());
//app.use(cors());
const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! It's gyun server");
});

app.post("/api/users/register", (req, res) => {
  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.

  const user = new User(req.body); //bodyParser에 의해서 client가 보내는 request 요청에 담긴 내용을 body를 통해 가져올 수 있음

  user.save((err, userInfo) => {
    //mongoDB의 메서드 save() => 모델 생성 후 DB에 저장
    if (err) return res.json({ success: false, err }); //실패시에 실패 메세지 json 형식으로 res에 담아 보냄
    return res.status(200).json({
      //성공시에 성공 메세지 json 형식으로 res에 담아보냄
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    //요청된 이메이리이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      //비밀번호 까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 1. 쿠기 2. 로컬스토리지
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

//관리자인지 일반유저인지 등을 인증하는 auth 페이지
app.get("/api/users/auth", auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 이야기는 Authentication이 True라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true, // 상황에 따라 변경 가능, 현재상황에서는 role = 0 이면 일반 유저 role != 0 이면 관리자
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

app.get("/api/hello", (req, res) => {
  res.send("안녕하세요");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
