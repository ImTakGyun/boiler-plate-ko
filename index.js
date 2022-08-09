const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");

const config = require("./config/key");

const { User } = require("./models/User");

//클라이언트의 Url을 분석해서 가져옴
app.use(bodyParser.urlencoded({ extended: true }));
//클라이언트의 json을 분석해서 가져옴
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! It's nodemon");
});

app.post("/register", (req, res) => {
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
