import React, { useState } from "react";
import SideBar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import useAutoLogout from "../hooks/useAutoLogout";

export default function PrivateLayout({ children }) {

  useAutoLogout();
  const [toggleMenuBar, setToggleMenuBar] = useState(false);

  return (
    <>
      <div className="flex  h-full w-full">
        <SideBar
          toggleMenuBar={toggleMenuBar}
          setToggleMenuBar={setToggleMenuBar}
        />
        <div
          className={`${
            toggleMenuBar ? "w-[calc(100%-100px)]" : "w-[calc(100%-220px)]"
          } ml-[auto] side--content--area transition duration-150]`}
        >
          <Topbar
            setToggleMenuBar={setToggleMenuBar}
            toggleMenuBar={toggleMenuBar}
          />
          <div className="content--area p-5">{children}</div>
        </div>
      </div>
      
    </>
  );
}
