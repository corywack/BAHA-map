mapboxgl.accessToken = 'pk.eyJ1IjoiY29yeS0zIiwiYSI6ImNtaDljYjczdjBwaGIycW9ueGlhcTE0bG0ifQ.ZJYi9EUPZvS1JE-jwbJXlQ';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/cory-3/cmh9ck0x000pu01r56s27hlkl',
  center: [-122.2585, 37.8719], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 13 // starting zoom
    });

