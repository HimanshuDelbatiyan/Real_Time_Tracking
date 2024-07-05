/**
 * Connecting to the WebSocket Server
 * Note: By Default it will try to connect to the same HTTP Server it is served from
 * If we have our WebSocket server running on different server then pass that as an argument.
 */
const socket = io()
let name
name = prompt("Enter your name here:")

if(!name)
{
    name = prompt("It is necessary:")
}

/**
 * Checking if the current browser support Geolocation API
 */
if(navigator.geolocation)
{
    // Configuring the Geolocation API to keep watching the user device position
    // if change then execute the associated callback or if any error then log that shit into the console.
    navigator.geolocation.watchPosition((position)=>
    {
        // Getting the latitude and longitude of user's  device
        const {latitude,longitude} = position.coords
        // Sending an event to the WebSocket Server with user device coordinates
        socket.emit("sendLocation",{latitude,longitude,name})
    },(error)=>
    {
        console.error(error)
    },
        {
            /**
             * Specifying some settings for the Geolocation API
             */
            enableHighAccuracy:true,// Off course, we want high accuracy
            timeout:5000, // Defining the time under which the browser should provide response
            maximumAge:0 // No Caching,Once fetched data is considered stale.
        }
    )
}

/**
 * Creating the instance of Map and specifying the element inside it will be shown.
 * using the "Leaflet Library"
 * as well setting the "Starting Point for the map"
 * and Zoom Level too !
 */
const map = L.map("map").setView([0,0],16)

/**
 * Adding the OpenStreetMap "tile layer"/style to the map instance we created.
 * It is nothing but just the displaying style for the map.
 *
 * -----> Tile Layer is a collection of small images in grid to form the
 * map at various zoom levels.
 * There are many tile layer provider like open street map.
 */
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
{
    attribution: "Open Street Map"
}).addTo(map) // Adding it to the map instance.

/**
 * Defining an Object which will hold unique id of each user as well as their
 * @type {{}}
 */
const markers = {};

socket.on("receive-location",(data)=>
{
    const {name,id,latitude,longitude} = data;

    // Setting the view of the map where the new user device is present.
    map.setView([latitude,longitude],16)

    // If the connected user already have a marker then just change the
    // change the location of the map
    if(markers[id])
    {
        markers[id].setLatLng([latitude,longitude]).bindPopup(`Hey it's me ${name}`)
    }
    else
    {
        // Otherwise create a new marker and add it to the map as well as marker's object.
        markers[id] = L.marker([latitude,longitude]).addTo(map)
    }
})

// When user disconnects then just remove the maker from the map as well as
// from the markers object
socket.on("user-disconnected",({id})=>
{
    // Remove from the map
    map.removeLayer(markers[id])
    // Delete the object property.
    delete markers[id]
})

