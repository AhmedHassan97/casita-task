import { useState } from "react";
import Map from "../components/map";
import { MongoClient } from "mongodb";
import axios from "axios";
import Fuse from "fuse.js";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { Menu, Transition } from "@headlessui/react";
import React from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const MapPage = (props) => {
  const [sentiment, setSentiment] = useState("All");
  return (
    <div className="flex flex-col">
      <div className="navbar shadow-lg bg-black text-neutral-content ">
        <div className="flex-1 px-2 mx-2">
          <span className="text-lg font-bold">Casita</span>
        </div>
        <div className="flex-none">
          <p className="font-bold text-2xl ">Filter by sentiment</p>
          <Menu
            as="div"
            className="relative inline-block text-left p-2  z-10 ml-auto m-4"
          >
            <div>
              <Menu.Button className="inline-flex justify-center  rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100">
                {sentiment}
                <ChevronDownIcon
                  className="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>
            <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item onClick={() => setSentiment("All")}>
                  {({ active }) => (
                    <a
                      href="/#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm"
                      )}
                    >
                      All{" "}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item onClick={() => setSentiment("Positive")}>
                  {({ active }) => (
                    <a
                      href="/#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm"
                      )}
                    >
                      Positive{" "}
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item onClick={() => setSentiment("Negative")}>
                  {({ active }) => (
                    <a
                      href="/#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm"
                      )}
                    >
                      Negative
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item onClick={() => setSentiment("Neutral")}>
                  {({ active }) => (
                    <a
                      href="/#"
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "block px-4 py-2 text-sm"
                      )}
                    >
                      Neutral
                    </a>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      <Map
        messages={props.messages}
        message={props.messages}
        sentiment={sentiment}
      />
    </div>
  );
};

export default MapPage;

export async function getStaticProps() {
  const cities = await axios.get(
    "https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json"
  );

  const client = await MongoClient.connect(
    process.env.NEXT_PUBLIC_DATABASE_URL
  );

  const database = client.db("casita");
  const collection_message = database.collection("messages");

  const allMessages = await collection_message.find().toArray();

  const messagesWithCities = allMessages.map((mess) => {
    const MessageArray = mess.message.split(",");

    return MessageArray.map((word) => {
      const options = {
        // Search in `author` and in `tags` array
        distance: 0,
        ignoreLocation: true,
        threshold: 0,
        keys: ["name"],
      };

      const fuse = new Fuse(cities.data, options);

      const result = fuse.search(word.replace(" ", ""));
      // console.log(result)
      if (result.length !== 0) {
        // console.log("yes")
        const endResult = result.map((item) => item.item);
        // console.log({...mess,...endResult[0]})
        return { ...mess, ...endResult[0] };
      } else {
        return {};
      }
    }).filter((value) => Object.keys(value).length !== 0)[0];
  });

  for (let index = 0; index < messagesWithCities.length; index++) {
    const element = messagesWithCities[index];
    const config = {
      method: "get",
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${element.name}.json?access_token=pk.eyJ1IjoiYWhtZWRoYXNzYW45NyIsImEiOiJja3Rpd3J4bnIwdmF4MndvNmxkcm1oZTZsIn0.yQwnm8nsdHvn3lK3CuyJug`,
      headers: {},
    };

    const request = await axios(config);
    messagesWithCities[index] = {
      ...messagesWithCities[index],
      coordinates: request.data.features[0].geometry.coordinates,
    };
  }

  return {
    props: {
      messages: messagesWithCities.map((message) => ({
        message: message.message,
        sentiment: message.sentiment,
        id: message._id.toString(),
        country: message.country,
        geonameid: message.geonameid,
        City: message.name,
        subcountry: message.subcountry,
        longitude: message.coordinates[0],
        latitude: message.coordinates[1],
      })),
      cities: messagesWithCities.map((message) => ({
        longitude: message.coordinates[0],
        latitude: message.coordinates[1],
      })),
    },
  };
}
