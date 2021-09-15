import React from "react";

function CityInfo(props) {
  // const displayName = `${info.city}, ${info.state}`;
  console.log(props);
  return (
    <div>
      <div className="text-black font-bold">Message: {props.info.message}</div>
    </div>
  );
}

export default CityInfo;
