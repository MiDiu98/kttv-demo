import { Component, OnInit } from '@angular/core';
import circleToPolygon from 'circle-to-polygon';
import * as turf from '@turf/turf';
import { HttpClient } from '@angular/common/http';
// import * as L from 'leaflet';
// var L = require('leaflet');
// require('leaflet-measure');

declare var L: any;
const GEOSERVER_DOMAIN = 'http://10.60.109.17:8080/gsv18';

@Component({
  selector: 'app-map-two',
  templateUrl: './map-two.component.html',
  styleUrls: ['./map-two.component.scss'],
})
export class MapTwoComponent implements OnInit {
  DEFAULT_RADIUS = 100;
  DEFAULT_MAX_RADIUS = 300;
  map: any;
  homeMarker: any = undefined;
  homeMarkerCircle: any = undefined;
  geojson: any = undefined;
  private infoControl!: any;
  private legendControl!: any;

  constructor(private http: HttpClient) {
    this.getPosition = this.getPosition.bind(this);
    this.getColor = this.getColor.bind(this);
    this.setStateStyle = this.setStateStyle.bind(this);
    this.onEachFeature = this.onEachFeature.bind(this);
    this.highlightFeature = this.highlightFeature.bind(this);
    this.resetHighlight = this.resetHighlight.bind(this);
    this.zoomToFeature = this.zoomToFeature.bind(this);
    this.createLegendControl = this.createLegendControl.bind(this);
    this.createLegendStyle = this.createLegendStyle.bind(this);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.renderMap();
    // this.renderMarker();
    // this.showMyLocation();
    // this.drawTangentTwoCircle();
    this.renderChoropleth();
    this.addCustomControl();
    this.testPane();
  }

  renderMap() {
    const worldBoundary = L.tileLayer(
      GEOSERVER_DOMAIN +
        '/gwc/service/wmts?layer=VTMAP:kttv_base&style=&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}',
      {
        attribution:
          'Map tiles by <a target="_top" rel="noopener" href="https://map.viettel.vn">Viettelmaps</a>',
        id: 'vt_trans',
        tileSize: 256,
        zoomOffset: 0,
        accessToken: '6ht5fdbc-1996-4f54-87gf-5664f304f3d2',
        zIndex: 3,
      }
    );

    this.map = L.map('map', {
      center: [16.0544, 108.2022],
      layers: [worldBoundary],
      zoom: 6,
      maxZoom: 22,
      minZoom: 1,
      zoomControl: false,
    });

    this.addMapControl();
    this.testGroupLayer();
  }

  addMapControl() {
    L.control.scale().addTo(this.map);
    // this.map.zoomControl.setPosition('bottomright')
    L.control.browserPrint().addTo(this.map);
    L.control.measure().addTo(this.map);
  }

  printMap() {
    window.print();
  }

  renderMarker() {
    let marker = L.marker([16, 108], {
      draggable: true,
      title: 'This is hover text for marker',
      opacity: 0.5,
    })
      .addTo(this.map)
      .bindPopup(
        `<h1>Ba Na Hill</h1><p>Sun World Ba Na Hills boast a dizzily vibrant and fascinating indoor game zone. Fantasy Park si the largest indoor game zone of Vietnam that includes countless</p><div class="w-100 h-100"><image class="w-100 h-100" src="data:image/jpeg;base64,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" /></div>`
      )
      .openPopup();
  }

  showMyLocation() {
    if (!navigator.geolocation) {
      window.alert(`Your browser doesn't support geolocation feature`);
    } else {
      navigator.geolocation.getCurrentPosition(this.getPosition);
    }
  }

  getPosition(position: any) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    let accuracy = position.coords.accuracy;

    if (this.homeMarker) {
      this.map.removeLayer(this.homeMarker);
    }
    if (this.homeMarkerCircle) {
      this.map.removeLayer(this.homeMarkerCircle);
    }

    this.homeMarker = L.marker([lat, lng]).addTo(this.map);
    this.homeMarkerCircle = L.circle([lat, lng], { radius: accuracy }).addTo(
      this.map
    );
    let featureGroup = L.featureGroup([
      this.homeMarker,
      this.homeMarkerCircle,
    ]).addTo(this.map);
    this.map.fitBounds(featureGroup.getBounds());
  }

  drawTangentTwoCircle() {
    const circle1 = {
      Time: 1664334000,
      Latitude: 15.565423965454102,
      Longitude: 108.03556060791016,
      Altitude: 972.6632080078125,
      rvmax: 72.37226104736328 * this.DEFAULT_MAX_RADIUS,
      vmax: 25.255535125732422,
    };
    const circle2 = {
      Time: 1664344800,
      Latitude: 15.767115592956543,
      Longitude: 107.49742889404297,
      Altitude: 987.0066528320312,
      rvmax: 92.53065490722656 * this.DEFAULT_MAX_RADIUS,
      vmax: 21.281734466552734,
    };

    /** Draw two circles */
    L.circle([circle1.Latitude, circle1.Longitude], {
      radius: circle1.rvmax,
    }).addTo(this.map);
    L.circle([circle2.Latitude, circle2.Longitude], {
      radius: circle2.rvmax,
    }).addTo(this.map);

    /** The idea of ​​drawing tangents to two circles
     * is to find a point where its tangents to the two circles will coincide.
     * Extend the tangent of 2 circles to get the required point,
     * this point belongs to the line passing through the center of 2 circles.
     * Then 2 similar triangles will appear, based on the ratio in similar triangles
     * we can determine the distance of this point to 2 centers.
     *
     * Let (O, R1) and (I, R2) be the center, radius of 2 circles; P is the required point
     * with the order on the line respectively O, I, P then we have the ratio:
     * @params R2/R1 = IP/OP = IP/(OI + IP)  => IP = R2*OI/(R1 - R2)
     */
    let pointI = [circle1.Longitude, circle1.Latitude];
    let pointO = [circle2.Longitude, circle2.Latitude];
    let options = { units: 'kilometers' as turf.Units };
    let OI = turf.distance(pointI, pointO, options);
    let OP = OI + (OI * circle1.rvmax) / (circle2.rvmax - circle1.rvmax);
    let pointP = this.findPointAlongExtendLine(
      pointI,
      pointO,
      OI,
      OP,
      options.units
    );
    let point = turf.point(pointP);

    /** Find t */
    let circlePolygon1 = circleToPolygon(
      [circle1.Longitude, circle1.Latitude],
      circle1.rvmax,
      32
    );
    let circlePolygon2 = circleToPolygon(
      [circle2.Longitude, circle2.Latitude],
      circle2.rvmax,
      32
    );
    let polygon1 = turf.polygon([circlePolygon1.coordinates[0]]);
    let polygon2 = turf.polygon([circlePolygon2.coordinates[0]]);
    let tangents1 = turf.polygonTangents(point, polygon1);
    let tangents2 = turf.polygonTangents(point, polygon2);

    let coordinateCircle1_1 = tangents1.features[0].geometry.coordinates;
    let coordinateCircle1_2 = tangents1.features[1].geometry.coordinates;
    let coordinateCircle2_1 = tangents2.features[0].geometry.coordinates;
    let coordinateCircle2_2 = tangents2.features[1].geometry.coordinates;

    let track: [number, number][] = [
      coordinateCircle1_1,
      coordinateCircle1_2,
      coordinateCircle2_2,
      coordinateCircle2_1,
    ].map((point) => [point[1], point[0]]);

    const polygon = L.polygon(track, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
    }).addTo(this.map);

    this.drawMainAffectAreaByStorm(
      coordinateCircle1_1,
      coordinateCircle1_2,
      coordinateCircle2_1,
      coordinateCircle2_2,
      circle1.rvmax
    );
  }

  /** Draw main affect area by storm */
  drawMainAffectAreaByStorm(
    coord1_1: any,
    coord1_2: any,
    coord2_1: any,
    coord2_2: any,
    rvmax: number
  ) {
    // let line1 = turf.lineString([coord1_1, coord1_2]);
    // let line2 = turf.lineString([coord2_1, coord2_2]);

    // console.log(rvmax * this.DEFAULT_MAX_RADIUS);
    // console.log(rvmax * (this.DEFAULT_MAX_RADIUS - this.DEFAULT_RADIUS));
    let mainLine1 = turf.lineOffset(
      turf.lineString([coord1_1, coord2_1]),
      // - rvmax * (this.DEFAULT_MAX_RADIUS - this.DEFAULT_RADIUS),
      -4342,
      {
        units: 'meters',
      }
    );
    let mainLine2 = turf.lineOffset(
      turf.lineString([coord2_2, coord1_2]),
      // -rvmax * (this.DEFAULT_MAX_RADIUS - this.DEFAULT_RADIUS),
      -4342,
      {
        units: 'meters',
      }
    );

    // console.log(mainLine1);
    // console.log(mainLine2);

    let coordinateCircle1_1 = mainLine1.geometry.coordinates[0];
    let coordinateCircle1_2 = mainLine1.geometry.coordinates[1];
    let coordinateCircle2_1 = mainLine2.geometry.coordinates[0];
    let coordinateCircle2_2 = mainLine2.geometry.coordinates[1];

    let track: [number, number][] = [
      coordinateCircle1_1,
      coordinateCircle1_2,
      coordinateCircle2_1,
      coordinateCircle2_2,
    ].map((point) => [point[1], point[0]]);

    const polygon = L.polygon(track, {
      color: '#3BF131',
      weight: 0,
      opacity: 0.8,
      fillColor: '#3BF131',
      fillOpacity: 0.8,
    }).addTo(this.map);
  }

  /**
   * @method  Find a point along a line another point a certain distance away from another point
   * based on the answer here: @link https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point
   * Then point (xt,yt)=(((1−t)x0+tx1),((1−t)y0+ty1))
   */
  findPointAlongExtendLine(
    point1: any,
    point2: any,
    distanceAB: number,
    distanceABC: number,
    unit: turf.Units
  ) {
    let t = distanceABC / distanceAB;
    let pointC = [
      (1 - t) * point2[0] + t * point1[0],
      (1 - t) * point2[1] + t * point1[1],
    ];

    L.marker([pointC[1], pointC[0]]).addTo(this.map);
    return pointC;
  }

  /** Test group layer */
  testGroupLayer() {
    var littleton = L.marker([39.61, -105.02]).bindPopup(
        'This is Littleton, CO.'
      ),
      denver = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
      aurora = L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.'),
      golden = L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.');

    var cities = L.layerGroup([littleton, denver, aurora, golden]);
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    });

    var osmHOT = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France',
      }
    );

    var baseMaps = {
      OpenStreetMap: osm,
      "<span style='color: red'>OpenStreetMap.HOT</span>": osmHOT,
    };

    var overlayMaps = {
      Cities: cities,
    };
    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(this.map);

    /** Updated layer, group layer */
    var crownHill = L.marker([39.75, -105.09]).bindPopup(
        'This is Crown Hill Park.'
      ),
      rubyHill = L.marker([39.68, -105.0]).bindPopup('This is Ruby Hill Park.');

    var parks = L.layerGroup([crownHill, rubyHill]);
    var openTopoMap = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
      }
    );

    layerControl.addBaseLayer(openTopoMap, 'OpenTopoMap');
    layerControl.addOverlay(parks, 'Parks');

    setTimeout(() => {
      layerControl.removeLayer(openTopoMap);
      layerControl.removeLayer(parks);
    }, 3000);

    // console.log('Baselayer: ', layerControl.getContainer());
    // console.log('Overlayer: ', layerControl.getContainer());
  }

  renderChoropleth() {
    this.http.get('assets/us-state.json').subscribe((statesData: any) => {
      this.geojson = L.geoJson(statesData, {
        style: this.setStateStyle,
        onEachFeature: this.onEachFeature,
      }).addTo(this.map);
    });
  }

  setStateStyle(feature: any) {
    return {
      fillColor: this.getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  }

  getColor(d: any) {
    return d > 1000
      ? '#800026'
      : d > 500
      ? '#BD0026'
      : d > 200
      ? '#E31A1C'
      : d > 100
      ? '#FC4E2A'
      : d > 50
      ? '#FD8D3C'
      : d > 20
      ? '#FEB24C'
      : d > 10
      ? '#FED976'
      : '#FFEDA0';
  }

  highlightFeature(e: any) {
    var layer = e.target;

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7,
    });

    layer.bringToFront();
    this.infoControl.update(layer.feature.properties); // Update info control with feature properties
  }

  resetHighlight(e: any) {
    this.geojson.resetStyle(e.target);
    this.infoControl.update(); // Reset info control
  }

  zoomToFeature(e: any) {
    this.map.fitBounds(e.target.getBounds());
  }

  onEachFeature(feature: any, layer: any) {
    layer.on({
      mouseover: this.highlightFeature,
      mouseout: this.resetHighlight,
      click: this.zoomToFeature,
    });
  }

  /** -------------- Custom control ------------------------------------------------ */
  addCustomControl() {
    this.infoControl = this.createInfoControl();
    this.infoControl.addTo(this.map);
    this.legendControl = this.createLegendControl();
    this.legendControl.addTo(this.map);
  }

  createInfoControl() {
    const info = L.control();

    info.onAdd = function (map: any) {
      this._div = L.DomUtil.create('div', 'info'); // Create a div with a class "info"
      this.update();
      return this._div;
    };

    // Method to update the control based on feature properties passed
    info.update = function (props?: any) {
      this._div.innerHTML =
        '<h4>US Population Density</h4>' +
        (props
          ? '<b>' +
            props.name +
            '</b><br />' +
            props.density +
            ' people / mi<sup>2</sup>'
          : 'Hover over a state');
    };

    return info;
  }

  createLegendControl() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = this.createLegendStyle;

    return legend;
  }

  createLegendStyle(map: any) {
    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        this.getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  }

  /** Pane use to control z-Index of some group layer */
  testPane() {
    this.map.createPane('labels');
    this.map.getPane('labels').style.zIndex = 650; /** set zIndex = 0 to test */
    this.map.getPane('labels').style.pointerEvents = 'none';

    var positron = L.tileLayer(
      'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
      {
        attribution: '©OpenStreetMap, ©CartoDB',
      }
    ).addTo(this.map);

    var positronLabels = L.tileLayer(
      'https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels',
      }
    ).addTo(this.map);

    this.http.get('assets/eu-countries.json').subscribe((data: any) => {
      let euCountries = L.geoJson(data, {
        style: this.setStateStyle,
        onEachFeature: this.onEachFeature,
      }).addTo(this.map);

      euCountries.eachLayer(function (layer: any) {
        layer.bindPopup(layer.feature.properties.name);
      });
    });

    // positronLabels.removeFrom(this.map);
    // console.log(this.map.getPanes());
    // console.log(this.map.getPane('labels'));
  }
}
