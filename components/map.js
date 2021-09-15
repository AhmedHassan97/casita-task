import { useState, useEffect } from "react";
import ReactMapGL, {
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import Pins from "./pins";
import CityInfo from "./city-info";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";

const Map = (props) => {
  const [viewport, setViewport] = useState({
    latitude: 40.78343,
    longitude: -73.96625,
    zoom: 5,
  });
  const geolocateStyle = {
    latitude: 40,
    longitude: -100,
    zoom: 1,
    bearing: 0,
    pitch: 0,
    left: 0,
    padding: "10px",
  };

  const fullscreenControlStyle = {
    top: 36,
    left: 0,
    padding: "10px",
  };

  const navStyle = {
    top: 72,
    left: 0,
    padding: "10px",
  };

  const scaleControlStyle = {
    bottom: 36,
    left: 0,
    padding: "10px",
  };

  const messageType = {
    bottom: 40,
    left: 0,
    padding: "10px",
  };
  const [popupInfo, setPopupInfo] = useState(null);

  return (
    <>
      <ReactMapGL
        {...viewport}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={setViewport}
        mapboxApiAccessToken="pk.eyJ1IjoiYWhtZWRoYXNzYW45NyIsImEiOiJja3Rpd3J4bnIwdmF4MndvNmxkcm1oZTZsIn0.yQwnm8nsdHvn3lK3CuyJug"
      >
        <Pins
          data={props.messages}
          onClick={setPopupInfo}
          sentiment={props.sentiment}
        />

        {popupInfo && (
          <Popup
            tipSize={5}
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeOnClick={true}
            onClose={setPopupInfo}
          >
            <CityInfo info={popupInfo} />
          </Popup>
        )}

        <GeolocateControl style={geolocateStyle} />
        <FullscreenControl style={fullscreenControlStyle} />
        <NavigationControl style={navStyle} />
        <ScaleControl style={scaleControlStyle} />
      </ReactMapGL>
    </>
  );
};
export default Map;
