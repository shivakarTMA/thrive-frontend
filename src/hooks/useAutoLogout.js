// useAutoLogout.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { performLogout } from "../Redux/Reducers/logoutHandler";

const INACTIVITY_TIME = 30 * 60 * 1000;

export default function useAutoLogout() {
  const dispatch = useDispatch();
  const timer = useRef(null);

  const resetTimer = () => {
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      performLogout(dispatch);
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
}