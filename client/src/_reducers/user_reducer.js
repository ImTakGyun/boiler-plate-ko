import { LOGIN_USER, REGISTER_USER, AUTH_USER } from "../_actions/types";
export default function Reducer(
  state = {} /* state가 undefined일 때만 {}로 초기화 */,
  action
) {
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, loginSuccess: action.payload };
    case REGISTER_USER:
      return { ...state, register: action.payload };
    case AUTH_USER:
      return { ...state, userData: action.payload };
    default:
      return state;
  }
}
