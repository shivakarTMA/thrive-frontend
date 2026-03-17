
import { combineReducers } from 'redux';
import authReducer from './authSlice';
import optionListReducer from './optionListSlice'
import clubTimingReducer from './clubTimingSlice'


const rootReducer = combineReducers({
  auth: authReducer,
  optionList: optionListReducer,
  clubTiming: clubTimingReducer,
});

export default rootReducer;
