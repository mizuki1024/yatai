// lib/googleMaps.js

const geocodeLatLng = async (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    const latLng = new window.google.maps.LatLng(lat, lng);
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject("No results found");
          }
        } else {
          reject("Geocoder failed due to: " + status);
        }
      });
    });
  };
  
  export { geocodeLatLng };
  