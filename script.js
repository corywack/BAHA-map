mapboxgl.accessToken = 'pk.eyJ1IjoiY29yeS0zIiwiYSI6ImNtaDljYjczdjBwaGIycW9ueGlhcTE0bG0ifQ.ZJYi9EUPZvS1JE-jwbJXlQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/cory-3/cmhp3xur3004i01ssgqwt98pw',
  center: [-122.2585, 37.8719],
  zoom: 13
});

let sortedFeatures = [];

let popup = new mapboxgl.Popup({
  closeButton: true,
  closeOnClick: false
});

map.on('load', function() {
  map.addSource('points-data', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/corywack/BAHA-map/main/data/map.geojson'
  });

  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'points-data',
    paint: {
      'circle-color': '#4264FB',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });


  map.once('idle', () => {
    const rendered = map.queryRenderedFeatures({ layers: ['points-layer'] });

    const arr = rendered
      .map(f => {
        const d = String(f.properties.Designated || '').trim();
        const y = parseInt(d.slice(-4));
        if (Number.isNaN(y)) return null;
        return {
          coords: f.geometry.coordinates,
          props: { ...f.properties, Year: y }
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.props.Year - b.props.Year);

    sortedFeatures = arr;
    console.log('Tour ready. Years:', sortedFeatures.map(x => x.props.Year));
  });

  map.on('click', 'points-layer', (e) => {
    const feature = e.features[0];
    const coords = feature.geometry.coordinates;
    const p = feature.properties;
    const year = (() => {
      const d = String(p.Designated || '').trim();
      const y = parseInt(d.slice(-4));
      return Number.isNaN(y) ? '' : y;
    })();

    popup
      .setLngLat(coords)
      .setHTML(`
        <h3>${p.Landmark}</h3>
        <p><strong>Architect & Date:</strong> ${p["Architect + Date"]}</p>
        <p><strong>Designated:</strong> ${p.Designated}</p>
        ${p.Link ? `<p><a href="${p.Link}" target="_blank">More Information</a></p>` : ''}
        ${p.Notes ? `<p><strong>Notes:</strong> ${p.Notes}</p>` : ''}
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'points-layer', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'points-layer', () => map.getCanvas().style.cursor = '');
});

let tourActive = false;
let tourIndex = 0;

function populateSidebar() {
  const list = document.getElementById('siteList');
  list.innerHTML = '';
  sortedFeatures.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item.props.Landmark;
    li.addEventListener('click', () => {
      tourIndex = i;
      showFeature(tourIndex);
      updateUI();
    });
    list.appendChild(li);
  });
}

function updateUI() {
  const items = document.querySelectorAll('#siteList li');
  items.forEach((li, i) =>
    li.classList.toggle('active', i === tourIndex)
  );

  document.getElementById('progress').textContent =
    `${tourIndex + 1} of ${sortedFeatures.length}`;
}

function showFeature(index) {
  const { coords, props: p } = sortedFeatures[index];
  map.flyTo({ center: coords, zoom: 15 });

  popup
    .setLngLat(coords)
    .setHTML(`
      <h3>${p.Landmark}</h3>
      <p><strong>Address:</strong> ${p.Address}</p>
      <p><strong>Architect & Date:</strong> ${p["Architect + Date"]}</p>
      <p><strong>Designated:</strong> ${p.Designated}</p>
      ${p.Link ? `<p><a href="${p.Link}" target="_blank">More Information</a></p>` : ''}
      ${p.Notes ? `<p><strong>Notes:</strong> ${p.Notes}</p>` : ''}
    `)
    .addTo(map);

  updateUI();
}

document.getElementById('tourBtn').addEventListener('click', () => {
  if (tourActive) {
    location.reload();
    return;
  }

  if (sortedFeatures.length === 0) return;

  tourActive = true;

  document.getElementById('tourBtn').textContent = "Exit Timeline Tour ✕";

  document.getElementById('tourUI').classList.remove('hidden');

  populateSidebar();
  tourIndex = 0;
  showFeature(tourIndex);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (tourIndex < sortedFeatures.length - 1) {
    tourIndex++;
    showFeature(tourIndex);
  }
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (tourIndex > 0) {
    tourIndex--;
    showFeature(tourIndex);
  }
});

document.addEventListener('keydown', (e) => {
  if (!tourActive) return;

  if (e.key === "ArrowRight" && tourIndex < sortedFeatures.length - 1) {
    tourIndex++;
    showFeature(tourIndex);
  }

  if (e.key === "ArrowLeft" && tourIndex > 0) {
    tourIndex--;
    showFeature(tourIndex);
  }
});
