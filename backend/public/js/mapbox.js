// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibW8tZWxzaGVteSIsImEiOiJjbWZrMXExZmMwNnF2MmpzOXdxdmFvc2ZtIn0._O_XBauKEQ6rfY1rwzkrxg';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mo-elshemy/cmfk3z1x8006b01s6azvt8yks',
    center: [-118.113491, 34.111745], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 35 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: { top: 150, bottom: 150, left: 150, right: 150 },
  });
};
