import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject, takeUntil } from 'rxjs';
import circleToPolygon from 'circle-to-polygon';
import * as turf from '@turf/turf';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var Windy: any; // Declare Windy as a global variable
declare var L: any;
declare var $: any;

interface AnalysisField {
  code: string;
  name: string;
  startTime: string;
  pressureLevels: string[];
  steps: string[];
}

const CALENDAR_DISPLAY_FORMAT = 'DD/MM/YYYY';
// const GEOSERVER_DOMAIN = 'http://geoserver.atviettelsolutions.com/gsv18';
const GEOSERVER_DOMAIN = 'http://10.60.109.17:8080/gsv18';
const GEOSERVER_WMS = GEOSERVER_DOMAIN + '/VTMAP/wms';

@Component({
  selector: 'app-map-demo',
  templateUrl: './map-demo.component.html',
  styleUrls: ['./map-demo.component.scss'],
})
export class MapDemoComponent implements OnInit {
  map: any;
  baseLayer: any;
  analysisData: AnalysisField[] = [];
  analysisField?: AnalysisField;

  formGroup!: FormGroup;
  tileLayer: any;
  layerCache: Map<string, any> = new Map();

  constructor(private fb: FormBuilder) {
    this.initData();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
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
    const worldMap = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }
    );

    const southWest = L.latLng(0.1819767485545991, 94.98199279711885);
    const northEast = L.latLng(25.018021347077003, 125.01800720288115);
    const bounds = L.latLngBounds(southWest, northEast);
    this.map = L.map('windy', {
      center: [16.0544, 108.2022],
      layers: [worldMap, worldBoundary],
      zoom: 4,
      maxZoom: 22,
      minZoom: 1,
      zoomControl: false,
      // fitBounds: bounds,
      // maxBounds: bounds,
    });
    this.loadData();
  }

  initData() {
    this.analysisData = [
      {
        code: 'mhtd_w',
        name: 'Gió',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt', '200', '300', '500', '700'],
        steps: [
          '000',
          '006',
          '012',
          '018',
          '024',
          '030',
          '036',
          '042',
          '048',
          '072',
        ],
      },
      {
        code: 'mhtd_w10m',
        name: 'Gió bề mặt',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: [
          '000',
          '006',
          '012',
          '018',
          '024',
          '030',
          '036',
          '042',
          '048',
          '072',
        ],
      },
      {
        code: 'mhtd_rain',
        name: 'Mưa',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: [
          '000',
          '006',
          '012',
          '018',
          '024',
          '030',
          '036',
          '042',
          '048',
          '072',
        ],
      },
      {
        code: 'mhtd_pmsl',
        name: 'Khí áp',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: [
          '000',
          '006',
          '012',
          '018',
          '024',
          '030',
          '036',
          '042',
          '048',
          '072',
        ],
      },
    ];
    this.analysisField = this.analysisData[0];
    this.initForm();
  }

  initForm() {
    this.formGroup = this.fb.group({
      code: [this.analysisField?.code, [Validators.required]],
      startTime: [this.analysisField?.startTime, [Validators.required]],
      pressureLevel: [
        this.analysisField?.pressureLevels[0],
        [Validators.required],
      ],
      step: [this.analysisField?.steps[0], [Validators.required]],
      // isWindContour: [false],
      isWind10mContour: [false],
      // isRainContour: [false],
      // isPressureContour: [false],
    });
    this.formGroup.controls['code'].valueChanges.subscribe((code) => {
      this.analysisField = this.analysisData.find((a) => a.code === code);
    });
  }

  loadData() {
    this.updateLayers();
  }

  updateLayers() {
    if (!this.map || !this.analysisField) return;
    let formValue = this.formGroup.value;
    let layerOptions: any = {
      layers: `VTMAP:${formValue.code}`,
      time: formValue.startTime,
      format: 'image/png',
      transparent: true,
      opacity: 0.8,
      version: '1.1.1',
      // DIM_LEV: +formValue.pressureLevel,
    };
    if (!Number.isNaN(+formValue.pressureLevel)) {
      layerOptions.DIM_LEV = +formValue.pressureLevel;
    }
    if (!Number.isNaN(+formValue.step)) {
      formValue.time = moment(formValue.startTime)
        .add(+formValue.step, 'hours')
        .toISOString();
      layerOptions.time = formValue.time;
    }
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }
    this.tileLayer = L.nonTiledLayer
      .wms(GEOSERVER_WMS, layerOptions)
      .addTo(this.map);

    if (formValue.isWind10mContour) {
      layerOptions.layers = `VTMAP:mhtd_w10m`;
      layerOptions.styles = 'wind_10m_1';
      this.clearLayerCache('mhtd_w10m');

      let contour = L.nonTiledLayer
        .wms(GEOSERVER_WMS, layerOptions)
        .addTo(this.map);
      this.layerCache.set('mhtd_w10m', contour);
    } else {
      this.clearLayerCache('mhtd_w10m');
    }
  }

  clearLayerCache(layerCode: string) {
    if (this.layerCache.get(layerCode)) {
      this.map.removeLayer(this.layerCache.get(layerCode));
      this.layerCache.delete(layerCode);
    }
  }
}
