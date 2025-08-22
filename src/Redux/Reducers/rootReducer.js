
import { combineReducers } from 'redux';
import authReducer from './authSlice';
import optionListReducer from './optionListSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  optionList: optionListReducer,
});

export default rootReducer;
