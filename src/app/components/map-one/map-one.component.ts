import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject, takeUntil } from 'rxjs';

declare var Windy: any; // Declare Windy as a global variable
declare var L: any;
declare var $: any;

const CALENDAR_DISPLAY_FORMAT = 'DD/MM/YYYY';
// const GEOSERVER_DOMAIN = 'http://geoserver.atviettelsolutions.com/gsv18';
const GEOSERVER_DOMAIN = 'http://10.60.109.17:8080/gsv18';
const GEOSERVER_WMS = GEOSERVER_DOMAIN + '/VTMAP/wms';

interface Legend {
  style: string;
  values: string[];
}
interface Calendar {
  display: string;
  query: string;
}
interface Layer {
  name: string;
  code: string;
}

@Component({
  selector: 'app-map-one',
  templateUrl: './map-one.component.html',
  styleUrls: ['./map-one.component.scss'],
})
export class MapOneComponent implements OnInit, AfterViewInit {
  title = 'demo-windy';
  calendarList: Calendar[] = [
    {
      display: moment().format(CALENDAR_DISPLAY_FORMAT),
      // query: '2024-06-26',
      query: '2024-06-18',
    },
    {
      display: moment().add(1, 'days').format(CALENDAR_DISPLAY_FORMAT),
      // query: '2024-06-27',
      query: '2024-06-19',
    },
    {
      display: moment().add(2, 'days').format(CALENDAR_DISPLAY_FORMAT),
      // query: '2024-06-28',
      query: '2024-06-20',
    },
    {
      display: moment().add(3, 'days').format(CALENDAR_DISPLAY_FORMAT),
      // query: '2024-06-29',
      query: '2024-06-21',
    },
  ];
  TIMELINE_PER_DAY: number[] = [0, 3, 6, 9, 12, 15, 18, 21];
  // TIMELINE_PER_DAY: number[] = [0, 6, 12, 18];
  START_HOUR: number = 0;
  END_HOUR: number = 18;
  isPlaying: boolean = false;
  interval!: any;
  STEP_PER_TIMELINE: number = 100;
  levelStep: number = 0;
  timeStep: number =
    this.TIMELINE_PER_DAY.indexOf(this.START_HOUR) * this.STEP_PER_TIMELINE;
  timeDisplay: string = '';
  min: number = 0;
  max: number =
    this.calendarList.length *
      this.TIMELINE_PER_DAY.length *
      this.STEP_PER_TIMELINE -
    1;
  SPEED: number = 4000 / this.STEP_PER_TIMELINE; // Time for 1 step
  lastStep: number =
    this.max -
    (this.TIMELINE_PER_DAY.length -
      1 -
      this.TIMELINE_PER_DAY.indexOf(this.END_HOUR)) *
      this.STEP_PER_TIMELINE -
    1;
  baseLayer: any;
  layerHot: any;
  layerCold: any;
  layerColorFill: any;
  layerColorContour: any;
  worldBoundary: any;
  layerMenuSelected: number = 0;
  layers: Layer[] = [
    {
      name: 'Mưa',
      // code: 'VTMAP:COVERAGEVIEW_WIND_SPEED',
      // code: 'xwnd',
      // code: '',
      code: 'rain',
    },
    {
      name: 'Nhiệt độ',
      // code: 'VTMAP:t',
      // code: 'ywnd',
      code: 't',
    },
    {
      name: 'Khí áp',
      // code: 'VTMAP:cloud'
      // code: 'theta0',
      code: 'ps',
    },
  ];
  layerTime: string = '';
  map: any;
  nextCacheLayer: string = 'HOT';
  legends: Legend[] = [
    {
      values: ['m/s', '0', '3', '5', '10', '15', '20', '30'],
      style:
        'background: linear-gradient(to right, rgb(98, 113, 184), rgb(98, 113, 184), rgb(98, 113, 184), rgb(98, 113, 184), rgb(61, 110, 163), rgb(74, 148, 170), rgb(74, 146, 148), rgb(77, 142, 124), rgb(76, 164, 76), rgb(103, 164, 54), rgb(162, 135, 64), rgb(162, 109, 92), rgb(141, 63, 92), rgb(151, 75, 145), rgb(95, 100, 160), rgb(91, 136, 161), rgb(91, 136, 161));',
    },
    {
      values: ['°C', '-20', '0', '10', '20', '30', '40'],
      style:
        'background: linear-gradient(to right, rgb(149, 137, 211), rgb(149, 137, 211), rgb(149, 137, 211), rgb(149, 137, 211), rgb(150, 209, 216), rgb(129, 204, 197), rgb(103, 180, 186), rgb(95, 143, 197), rgb(80, 140, 62), rgb(121, 146, 28), rgb(171, 161, 14), rgb(223, 177, 6), rgb(243, 150, 6), rgb(236, 95, 21), rgb(190, 65, 18), rgb(138, 43, 10), rgb(138, 43, 10));',
    },
    {
      values: ['mm', '1.5', '2', '3', '7', '10', '20', '30'],
      style:
        'background: linear-gradient(to right, rgb(65, 125, 170), rgb(65, 125, 170), rgb(65, 125, 170), rgb(65, 125, 170), rgb(62, 148, 171), rgb(62, 169, 172), rgb(62, 172, 172), rgb(62, 172, 172), rgb(62, 172, 172), rgb(55, 166, 137), rgb(68, 145, 61), rgb(121, 156, 60), rgb(170, 171, 62), rgb(170, 64, 62), rgb(180, 57, 114), rgb(175, 60, 161), rgb(175, 60, 161));',
    },
  ];
  infoDetailMarker = L.marker([], { draggable: true });
  isMarkerInfoEnable: boolean = false;
  nextFeatureInfoRequest$ = new Subject<void>();
  nextTemperatureLayerRequest$ = new Subject<void>();
  markerInfoCloseBtn = document.createElement('a');
  temperatureLayer: any = L.geoJSON();
  temperatureGeoJSON: any;
  velocityLayer: any;

  constructor(private http: HttpClient) {
    this.calculateTimeDisplay = this.calculateTimeDisplay.bind(this);
    this.updateLayers = this.updateLayers.bind(this);
    this.onTimeSlideHandle = this.onTimeSlideHandle.bind(this);
    this.bringBackLayerHot = this.bringBackLayerHot.bind(this);
    this.bringBackLayerCold = this.bringBackLayerCold.bind(this);
    this.onMarkerDragend = this.onMarkerDragend.bind(this);
    this.onMapClick = this.onMapClick.bind(this);
    this.renderTemperatureLayer = this.renderTemperatureLayer.bind(this);
  }

  ngOnInit(): void {
    this.timeStep =
      this.TIMELINE_PER_DAY.indexOf(this.START_HOUR) * this.STEP_PER_TIMELINE;
    this.calculateTimeDisplay();
  }

  ngAfterViewInit(): void {
    // this.baseLayer = L.tileLayer(
    //   'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}',
    //   {
    //     minZoom: 0,
    //     maxZoom: 20,
    //     attribution:
    //       '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //     ext: 'png',
    //   }
    // );
    let googleSat = L.tileLayer(
      'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }
    );

    const southWest = L.latLng(0.1819767485545991, 94.98199279711885);
    const northEast = L.latLng(25.018021347077003, 125.01800720288115);
    const bounds = L.latLngBounds(southWest, northEast);
    this.map = L.map('windy', {
      center: [16.0544, 108.2022],
      layers: [googleSat],
      zoom: 4,
      maxZoom: 22,
      minZoom: 1,
      zoomControl: false,
      // fitBounds: bounds,
      // maxBounds: bounds,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this.updateLayers();
    this.updateViewTemperatureLayer();
    // Marker Hoàng sa, trường sa
    const HoangSaIcon = L.divIcon({
      html: `Quần đảo Hoàng Sa (Việt Nam)`,
      className: 'text-island',
      iconSize: [120, 20],
    });
    L.marker([16.525858, 111.720906], { icon: HoangSaIcon }).addTo(this.map);
    const TruongSaIcon = L.divIcon({
      html: `Quần đảo Trường Sa (Việt Nam)`,
      className: 'text-island',
      iconSize: [120, 20],
    });
    L.marker([9.51856, 112.77977], { icon: TruongSaIcon }).addTo(this.map);
    // setTimeout(() => {
    //   this.loadCountryBourderLayer()
    // }, 5000)

    // this.initWindyMap();

    $('input[type="range"]').rangeslider({
      polyfill: false,
      rangeClass: 'rangeslider',
      disabledClass: 'rangeslider-disabled',
      horizontalClass: 'rangeslider-horizontal',
      verticalClass: 'rangeslider-vertical',
      fillClass: 'rangeslider-fill-lower',
      handleClass: 'rangeslider-thumb',
      onInit: function () {
        //No args are passed, so we can't change context of this
        const pluginInstance = this;

        //Move the range-output inside the handle so we can do all the stuff in css
        $(pluginInstance.$element)
          .parents('.range')
          .find('.range-output')
          .appendTo(pluginInstance.$handle);
      },
      onSlide: this.onTimeSlideHandle,
    });

    this.loadVelocityLayer();
    // this.loadImageLayer();

    this.map.on('click', this.onMapClick);
    this.markerInfoCloseBtn.className = 'picker-close-button';
    this.markerInfoCloseBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    this.markerInfoCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isMarkerInfoEnable = false;
      this.infoDetailMarker.remove();
    });
    this.infoDetailMarker.on('dragend', this.onMarkerDragend);
    this.map.on('zoomend', this.renderTemperatureLayer);
  }

  loadCountryBourderLayer() {
    //  this.worldBoundary = L.tileLayer(
    //   GEOSERVER_DOMAIN +
    //     '/gwc/service/wmts?layer=VTMAP:kttv_base&style=&tilematrixset=EPSG%3A900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A900913%3A{z}&TileCol={x}&TileRow={y}',
    //   {
    //     attribution:
    //       'Map tiles by <a target="_top" rel="noopener" href="https://map.viettel.vn">Viettelmaps</a>',
    //     id: 'vt_trans',
    //     tileSize: 256,
    //     zoomOffset: 0,
    //     accessToken: '6ht5fdbc-1996-4f54-87gf-5664f304f3d2',
    //     zIndex: 3,
    //   }
    // )
    // this.worldBoundary.addTo(this.map);

    this.worldBoundary = L.nonTiledLayer
      .wms(GEOSERVER_WMS, {
        layers: 'kttv_base',
        format: 'image/png',
        transparent: true,
        opacity: 1,
        version: '1.1.1',
      })
      .addTo(this.map);
  }

  loadPSContour() {
    if (!this.map) return;
    const layerCode = 'ps';
    const layerOptions: any = {
      layers: layerCode,
      time: this.layerTime,
      format: 'image/png',
      transparent: true,
      opacity: 1,
      version: '1.1.1',
      styles: 'contour_ps',
      // DIM_LEV: ''
    };
    if (!this.layerColorContour) {
      this.layerColorContour = L.nonTiledLayer
        .wms(GEOSERVER_WMS, layerOptions)
        .addTo(this.map);
    } else {
      this.layerColorContour.setParams(layerOptions);
    }
  }

  loadVelocityLayer() {
    // this.http.get('assets/2022081100f000.wind.json').subscribe((data) => {
      this.http.get('assets/water-gbr.json').subscribe((data) => {
      this.velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          // velocityType: 'Global Wind',
          velocityType: 'Velocity',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data',

          angleConvention: 'meteoCCW',
          showCardinal: true,
          speedUnit: 'mph',
        },
        data: data,
        // maxVelocity: 15,
        colorScale: [
          'rgba(255, 255, 220, .4)',
          // 'rgb(98, 113, 183)',
          // 'rgb(57, 97, 159)',
          // 'rgb(74, 148, 169)',
          // 'rgb(77, 141, 123)',
          // 'rgb(83, 165, 83)',
          // 'rgb(53, 159, 53)',
          // 'rgb(167, 157, 81)',
          // 'rgb(159, 127, 58)',
          // 'rgb(161, 108, 92)',
          // 'rgb(129, 58, 78)',
          // 'rgb(175, 80, 136)',
          // 'rgb(117, 74, 147)',
          // 'rgb(109, 97, 163)',
          // 'rgb(68, 105, 141)',
          // 'rgb(92, 144, 152)',
          // 'rgb(125, 68, 165)',
          // 'rgb(231, 215, 215)',
          // 'rgb(219, 212, 135)',
          // 'rgb(205, 202, 112)',
          // 'rgb(128, 128, 128)',
        ],
        lineWidth: 2,
        velocityScale: 0.007,
        opacity: 1,
        // lineWidth: 5,
        // lineHeight: 2,
        // velocityScale: 0.003,
        // opacity: 0.3,
      }).addTo(this.map);
    });
  }

  loadImageLayer() {
    const imageUrl = 'assets/24hrainprob2023071800_050.gif';
    const errorOverlayUrl =
      'https://cdn-icons-png.flaticon.com/512/110/110686.png';
    const altText = '24hrainprob2023071800_050';
    const latLngBounds = L.latLngBounds([
      [0.1819767485545991, 94.98199279711885],
      [25.018021347077003, 125.01800720288115],
    ]);

    const imageLayer = L.imageOverlay(imageUrl, latLngBounds, {
      opacity: 1,
      errorOverlayUrl: errorOverlayUrl,
      alt: altText,
      interactive: true,
    }).addTo(this.map);
  }

  onMapClick(e: any) {
    if (!this.isMarkerInfoEnable) {
      this.isMarkerInfoEnable = true;
    }
    this.updateMarkerInfo(e.latlng);
  }

  onMarkerDragend() {
    this.updateMarkerInfo(undefined);
  }

  updateMarkerInfo(latlng: any) {
    const newLatLng = latlng || this.infoDetailMarker.getLatLng();
    const layerCode = this.layers[this.layerMenuSelected].code;
    if (!newLatLng || !layerCode) return;
    this.getLayerFeatureInfo(
      layerCode === 'VTMAP:COVERAGEVIEW_WIND_SPEED'
        ? 'VTMAP:COVERAGEVIEW_wind'
        : layerCode,
      newLatLng
    ).subscribe((res: any) => {
      console.log(res);

      let contentValue: string = 'Không xác định';
      if (res.features && res.features.length > 0) {
        const { properties } = res.features[0];
        switch (this.layerMenuSelected) {
          case 0:
            // Gió
            const u = properties.u * 0.01 + 0;
            const v = properties.v * 0.01 + 0;

            const wind = Math.sqrt(u ** 2 + v ** 2);
            const directionAngle = this.windDirection(u, v);
            const direction = 'NESW';
            let directionCode = direction[Math.floor(directionAngle / 90)];
            if (directionAngle % 90 !== 0) {
              if (directionAngle < 90) {
                directionCode = directionCode + 'E';
              } else if (directionAngle < 180) {
                directionCode = 'S' + directionCode;
              } else if (directionAngle < 270) {
                directionCode = directionCode + 'W';
              } else {
                directionCode = 'N' + directionCode;
              }
            }
            const rotateDeg = -45 + directionAngle;
            // contentValue = `<div class="wind-direction" title="Hướng gió từ"><i class="fa-solid fa-location-arrow" style="transform: rotate(${rotateDeg}deg)"></i>${directionCode}</div> ${Math.round(
            //   wind
            // )}m/s`;
            contentValue = Math.round(properties.rain) + ' mm';
            break;

          case 1:
            // Nhiệt độ
            // const t = properties.t * 0.01 + 250.15; // độ K
            // contentValue = Math.round(t - 273.15) + '°C';
            const t = properties.t; // độ K
            contentValue = Math.round(t - 273.15) + ' °C';
            break;

          case 2:
            // Mây
            // const cloud = properties.cloud * 0.0001 + 0;
            // contentValue = Math.round(cloud * 100) + '%';
            const airPressure = properties.ps;
            contentValue = Math.round(airPressure) + ' hPa';
            break;

          default:
            break;
        }
        // contentValue = properties[layerCode];
      } else {
        console.log('Error');
        console.log(res.exceptions);
      }
      const layerName = this.layers[this.layerMenuSelected].name;

      const span = document.createElement('span');
      span.innerHTML = `<div class="p-title">${layerName}</div><p>${contentValue}</p>`;
      const pickerContent = document.createElement('div');
      pickerContent.className = 'picker-content';
      pickerContent.appendChild(span);
      pickerContent.appendChild(this.markerInfoCloseBtn);
      const pickerLines = document.createElement('div');
      pickerLines.className = 'picker-lines';

      const htmlFragment = document.createElement('div');

      htmlFragment.appendChild(pickerLines);
      htmlFragment.appendChild(pickerContent);

      const icon = L.divIcon({
        html: htmlFragment,
        className: 'picker open',
        iconAnchor: [0, 125],
      });
      this.infoDetailMarker.setIcon(icon).setLatLng(newLatLng).addTo(this.map);
    });
  }

  onTimeSlideHandle(position: number, value: number) {
    this.timeStep = value;
    this.calculateTimeDisplay();
  }

  setLayerMenuSelected(layerMenu: number) {
    this.layerMenuSelected = layerMenu;
    this.updateLayers();
    this.updateViewTemperatureLayer();
  }

  onCalendarClick(index: number) {
    const middleStepOfIndex =
      (index + 0.5) * this.TIMELINE_PER_DAY.length * this.STEP_PER_TIMELINE;
    $('#timeRange').val(middleStepOfIndex).change();
  }

  playPause() {
    this.isPlaying = !this.isPlaying;
    clearInterval(this.interval);
    if (this.isPlaying) {
      const inputRange = $('#timeRange');
      this.interval = setInterval(() => {
        if (this.timeStep >= this.lastStep || this.timeStep >= this.max) {
          this.isPlaying = false;
          clearInterval(this.interval);
        }
        inputRange.val(this.timeStep + 1).change();
      }, this.SPEED);
    }
  }

  calculateTimeDisplay() {
    const stepPerDay = this.TIMELINE_PER_DAY.length * this.STEP_PER_TIMELINE;
    const dayIndex = Math.floor(this.timeStep / stepPerDay);
    const hourIndex = Math.floor(
      (this.timeStep % stepPerDay) / this.STEP_PER_TIMELINE
    );
    const dayQuery = this.calendarList[dayIndex].query;
    const hour = this.TIMELINE_PER_DAY[hourIndex];

    const layerTime = `${dayQuery}T${hour < 10 ? '0' + hour : hour}:00:00Z`;
    if (layerTime !== this.layerTime) {
      this.layerTime = layerTime;
      this.updateLayers();
      this.updateViewTemperatureLayer();
    }
    // const dayDisplay = this.calendarList[dayIndex].display;
    const dayDisplay = this.calendarList[dayIndex].query;
    this.timeDisplay = `${dayDisplay} - ${hour}:00`;
  }

  // updateLayers() {
  //   if (!this.map) return;
  //   const layerCode = this.layers[this.layerMenuSelected].code;
  //   const layerOptions: any = {
  //     layers: layerCode,
  //     time: this.layerTime,
  //     format: 'image/png',
  //     transparent: true,
  //     opacity: 0.8,
  //     version: '1.1.1',
  //   };
  //   if (this.nextCacheLayer === 'HOT') {
  //     if (!this.layerHot) {
  //       this.layerHot = L.tileLayer
  //         .wms(GEOSERVER_WMS, layerOptions)
  //         .addTo(this.map);
  //       // this.layerHot = L.nonTiledLayer
  //       //   .wms(GEOSERVER_WMS, {
  //       //     layers: layerCode,
  //       //     time: this.layerTime,
  //       //     format: 'image/png',
  //       //     transparent: true,
  //       //     opacity: 0.8,
  //       //     // version: '1.1.1',
  //       //     // crs: L.CRS.EPSG4326,
  //       //     styles: 'test_contour_fill',
  //       //   })
  //       //   .addTo(this.map);
  //       this.layerHot.once('load', this.bringBackLayerCold);
  //       this.layerHot = L.nonTiledLayer
  //         .wms(GEOSERVER_WMS, {
  //           maxZoom: 19,
  //           minZoom: 4,
  //           zIndex: 2, // setting a zIndex enforces the layer ordering after adding/removing multiple layers
  //           opacity: 1.0,
  //           layers: 'VTMAP:rain_new1',
  //           format: 'image/png',
  //           transparent: true,
  //           attribution: '&copy; terrestris ' + new Date().getFullYear(),
  //           pane: 'tilePane',
  //           bounds: L.latLngBounds([-56.0, -180], [60.0, 180]),
  //           styles: 'dieuum_test_contour',
  //           // version: '1.1.1',
  //           // crs: L.CRS.EPSG4326,
  //           time: this.layerTime,
  //         })
  //         .addTo(this.map);
  //       this.layerHot.once('load', this.bringBackLayerCold);

  //       const latLngBounds = L.latLngBounds([
  //         [-15.25, 59.75],
  //         [60.25, 155.25],
  //       ]);
  //     } else {
  //       this.layerHot.off('load', this.bringBackLayerCold);
  //       this.layerHot.once('load', this.bringBackLayerCold);
  //       this.layerHot.setParams(layerOptions);
  //     }
  //     this.nextCacheLayer = 'COLD';
  //   } else {
  //     if (!this.layerCold) {
  //       this.layerCold = L.tileLayer
  //         .wms(GEOSERVER_WMS, layerOptions)
  //         .addTo(this.map);
  //       this.layerCold.once('load', this.bringBackLayerHot);
  //     } else {

  //       this.layerCold.off('load', this.bringBackLayerHot);
  //       this.layerCold.once('load', this.bringBackLayerHot);
  //       this.layerCold.setParams(layerOptions);
  //     }

  //     this.nextCacheLayer = 'HOT';
  //   }
  //   if (this.isMarkerInfoEnable) {
  //     this.updateMarkerInfo(undefined);
  //   }
  // }

  updateLayers() {
    if (!this.map) return;
    const layerCode = this.layers[this.layerMenuSelected].code;
    const layerOptions: any = {
      layers: layerCode,
      time: this.layerTime,
      format: 'image/png',
      transparent: true,
      opacity: 0.8,
      version: '1.1.1',
      // DIM_LEV: ''
    };
    if (!this.layerColorFill) {
      this.layerColorFill = L.tileLayer
      // this.layerColorFill = L.nonTiledLayer
        .wms(GEOSERVER_WMS, layerOptions)
        .addTo(this.map);
    } else {
      this.layerColorFill.setParams(layerOptions);
    }
    if (this.isMarkerInfoEnable) {
      this.updateMarkerInfo(undefined);
    }
    this.loadPSContour();
    if (!this.worldBoundary) {
      this.loadCountryBourderLayer();  
    }
  }

  bringBackLayerHot() {
    if (this.layerHot) {
      this.layerHot.bringToBack();
      this.baseLayer.bringToBack();
    }
  }

  bringBackLayerCold() {
    if (this.layerCold) {
      this.layerCold.bringToBack();
      this.baseLayer.bringToBack();
    }
  }

  getLayerFeatureInfo(layer: string, latlng: any): Observable<any> {
    this.nextFeatureInfoRequest$.next();
    const PRECISION = 0.0001;
    const bbox = `${latlng.lng - PRECISION},${latlng.lat - PRECISION},${
      latlng.lng + PRECISION
    },${latlng.lat + PRECISION}`;
    const options = {
      params: {
        SERVICE: 'WMS',
        REQUEST: 'GetFeatureInfo',
        VERSION: '1.1.1',
        FORMAT: 'application/json',
        LAYERS: layer,
        QUERY_LAYERS: layer,
        exceptions: 'application/json',
        INFO_FORMAT: 'application/json',
        FEATURE_COUNT: 50,
        X: 50,
        Y: 50,
        SRS: 'EPSG:4326',
        WIDTH: 101,
        HEIGHT: 101,
        BBOX: bbox,
        // time: this.layerTime,
      },
    };
    return this.http
      .get(GEOSERVER_WMS, options)
      .pipe(takeUntil(this.nextFeatureInfoRequest$));
  }

  updateViewTemperatureLayer() {
    // this.nextTemperatureLayerRequest$.next();
    // const [date, time] = this.layerTime.split('T');
    // // Layer này cố định date 17h và lấy giờ theo obs
    // const obs = parseInt(time.substring(0, 2));
    // const options = {
    //   params: {
    //     service: 'WFS',
    //     version: '2.0.0',
    //     request: 'GetFeature',
    //     typeName: 'VTMAP:view_temperature',
    //     outputFormat: 'application/json',
    //     // CQL_FILTER: `DtDate='${date}T17:00:00Z' AND obs=${obs}`,
    //     sortBy: 'StationName',
    //   },
    // };
    // this.http
    //   .get(GEOSERVER_DOMAIN + '/VTMAP/ows', options)
    //   .pipe(takeUntil(this.nextTemperatureLayerRequest$))
    //   .subscribe((res: any) => {
    //     this.temperatureGeoJSON = res;
    //     this.renderTemperatureLayer();
    //   });
  }

  renderTemperatureLayer() {
    this.temperatureLayer.remove();
    const minimumDistanceRequired = 80; // pixel
    const renderedPoints: any[] = [];
    this.temperatureLayer = L.geoJSON(this.temperatureGeoJSON, {
      pointToLayer: (feature: any, latlng: any) => {
        const point = this.map.latLngToLayerPoint(latlng);
        const existTooClosePoint = renderedPoints.some(
          (renderedPoint) =>
            renderedPoint.distanceTo(point) < minimumDistanceRequired
        );
        if (existTooClosePoint) return;
        renderedPoints.push(point);
        const html = `
        <div class="temp-station">
          <span>${feature.properties['StationName']}, ${
          Math.round(feature.properties['temperature']) + '°'
        }</span>
        </div>
        `;
        const icon = L.divIcon({
          html,
          className: 'text-label',
          iconSize: [200, 30],
        });
        return L.marker(latlng, { icon });
      },
    }).addTo(this.map);
  }

  windDirection(u: number, v: number) {
    return (270 - (Math.atan2(u, v) * 180) / Math.PI) % 360;
  }

  initWindyMap() {
    const options = {
      key: 'PsLAtXpsPTZexBwUkO7Mx5I', // Replace with your Windy API key
      lat: 51.505, // Initial latitude
      lon: -0.09, // Initial longitude
      zoom: 5, // Initial zoom level
    };

    const windy = new Windy(options);

    windy.on('load', () => {
      console.log('Windy API loaded');
    });
  }
}
