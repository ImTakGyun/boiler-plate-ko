import { LOGIN_USER } from "../_actions/types";
export default function (
  state = {} /* state가 undefined일 때만 {}로 초기화 */,
  action
) {
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, loginSuccess: action.payload };
    default:
      return state;
  }
}
