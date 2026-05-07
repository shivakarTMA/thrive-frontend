import './assets/css/main.scss'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import Routing from './Routing';

function App() {
  return (
    <>
    <Routing/>
    <ToastContainer/>
    </>
  );
}

export default App;
