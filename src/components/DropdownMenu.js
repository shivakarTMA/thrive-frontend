import React, { useRef } from "react"; 
import useOutsideClick from "../hooks/useOutsideClick";

const DropdownMenu = ({ children, isOpen, onClose }) => {
  const ref = useRef(null);
  useOutsideClick(ref, () => onClose?.());

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full mt-4 right-0 z-50 bg-white shadow min-w-[180px]"
    >
      {children}
    </div>
  );
};

export default DropdownMenu;
