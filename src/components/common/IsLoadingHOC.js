import React, { useState } from "react";
import { ClipLoader } from "react-spinners";

// Loader component using react-spinners
const Loading = () => {
  return (
    <div className="fixed inset-0 z-[9] flex items-center justify-center bg-black bg-opacity-50">
      <ClipLoader color="#ffffff" size={60} />
    </div>
  );
};

// Higher-Order Component for managing loading state
const IsLoadingHOC = (WrappedComponent) => {
  const HOC = (props) => {
    const [isLoading, setLoading] = useState(false);

    const setLoadingState = (loadingState) => {
      setLoading(loadingState);
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
  };

  return HOC;
};

export default IsLoadingHOC;


// Example usage of IsLoadingHOC
// Uncomment the following lines to see how to use the HOC in a component
// import React, { useEffect } from "react";
// import IsLoadingHOC from "./IsLoadingHOC";

// const Dashboard = ({ isLoading, setLoading }) => {
//   useEffect(() => {
//     setLoading(true);
//     setTimeout(() => setLoading(false), 2000); // simulate async
//   }, []);

//   return <div className="text-white">Dashboard Content</div>;
// };

// export default IsLoadingHOC(Dashboard);