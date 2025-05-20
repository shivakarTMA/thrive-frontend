import React, { useState } from "react";
import { Circles } from "react-loader-spinner";

const Loading = () => {
  return (
    <div className='fixed left-[0px] w-full top-[0px] min-h-screen flex items-center justify-center before:[" "] before:w-full before:min-h-screen before:absolute before:bg-black before:opacity-[0.5] before:z-[-1] z-[9]'>
      <Circles
        height="80"
        width="80"
        color="white"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperclassName=""
        visible={true}
      />
    </div>
  );
};

const IsLoadingHOC = (WrappedComponent) => {
  function HOC(props) {
    const [isLoading, setLoading] = useState(false);

    const setLoadingState = (isComponentLoading) => {
      setLoading(isComponentLoading);
    };

    return (
      <>
        {isLoading && <Loading />}
        <WrappedComponent
          {...props}
          isLoading={isLoading}
          setLoading={setLoadingState}
        />
      </>
    );
  }
  return HOC;
};

export default IsLoadingHOC;
