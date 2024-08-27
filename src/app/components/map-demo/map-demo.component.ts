import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable, Subject, takeUntil } from 'rxjs';
import circleToPolygon from 'circle-to-polygon';
import * as turf from '@turf/turf';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  COLOR_TYPES,
  MODEL,
  pmslColors,
  wind10mColors,
  wind200Colors,
  wind500Colors,
  wind700Colors,
} from './color.const';

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
const GEOSERVER_DOMAIN = 'http://localhost:8080/geoserver';
const GEOSERVER_WMS = GEOSERVER_DOMAIN + '/ne/wms';

// http://localhost:8080/geoserver/ne/wms?service=WMS&version=1.1.0&request=GetMap&layers=ne:gsm_h&bbox=59.75,-5.25,155.25,60.25&width=768&height=526&srs=EPSG:4326&styles=&format=application/openlayers

@Component({
  selector: 'app-map-demo',
  templateUrl: './map-demo.component.html',
  styleUrls: ['./map-demo.component.scss'],
})
export class MapDemoComponent implements OnInit {
  COLOR_TYPES = COLOR_TYPES;
  map: any;
  baseLayer: any;
  analysisData: AnalysisField[] = [];
  analysisField?: AnalysisField;
  SuWatAnalysisData: AnalysisField[] = [];
  SuWatAnalysisField?: AnalysisField;
  SwanGSM_AnalysisData: AnalysisField[] = [];
  SwanGSM_AnalysisField?: AnalysisField;

  formGroup!: FormGroup;
  SuWatFormGroup!: FormGroup;
  SwanGSM_FormGroup!: FormGroup;
  // tileLayer: any;
  layerCache: Map<string, any> = new Map();
  legendList: any[] = [];
  currentLegend: any = {};

  constructor(private fb: FormBuilder) {
    this.initData();
    this.renderLegend();
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
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
      layers: [worldMap],
      zoom: 4,
      maxZoom: 22,
      minZoom: 1,
      zoomControl: false,
      // fitBounds: bounds,
      // maxBounds: bounds,
    });
    // this.loadData();
    // this.loadWorldBoundary();
  }

  /** Pane use to control z-Index of some group layer */
  loadWorldBoundary() {
    this.map.createPane('worldBoundary');
    this.map.getPane(
      'worldBoundary'
    ).style.zIndex = 650; /** set zIndex = 0 to test */
    this.map.getPane('worldBoundary').style.pointerEvents = 'none';

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
        zIndex: 10000,
        pane: 'worldBoundary',
      }
    ).addTo(this.map);
  }

  initData() {
    const GSM_STEPS = [
      '000',
      '006',
      '012',
      '018',
      '024',
      '030',
      '036',
      '042',
      '048',
      '054',
      '060',
      '066',
      '072',
      '078',
      '084',
      '090',
      '096',
      '102',
      '108',
      '114',
      '120',
      '126',
      '132',
      '138',
      '144',
      '150',
      '156',
      '162',
      '168',
      '174',
      '180',
      '186',
      '192',
      '198',
      '204',
      '210',
      '216',
      '222',
      '228',
      '234',
      '240',
      '264',
    ];

    const SuWAT_STEPS = [
      '000',
      '003',
      '006',
      '009',
      '012',
      '015',
      '018',
      '021',
      '024',
      '027',
      '030',
      '033',
      '036',
      '039',
      '042',
      '045',
      '048',
      '051',
      '054',
      '057',
      '060',
      '063',
      '066',
      '069',
      '072',
      '075',
      '078',
      '081',
      '084',
      '087',
      '090',
    ];

    const SwanGSM_STEPS = [
      '000',
      '003',
      '006',
      '009',
      '012',
      '015',
      '018',
      '021',
      '024',
      '027',
      '030',
      '033',
      '036',
      '039',
      '042',
      '045',
      '048',
      '051',
      '054',
      '057',
      '060',
      '063',
      '066',
      '069',
      '072',
      '075',
      '078',
      '081',
      '084',
      '087',
      '090',
      '093',
      '096',
      '099',
      '102',
      '105',
      '108',
      '111',
      '114',
      '117',
      '120',
      '123',
      '126',
      '129',
      '132',
      '135',
      '138',
      '141',
      '144',
      '147',
      '150',
      '153',
      '156',
      '159',
      '162',
      '165',
      '168',
      '171',
      '174',
      '177',
      '180',
      '183',
      '186',
      '189',
      '192',
      '195',
      '198',
      '201',
      '204',
      '207',
      '210',
      '213',
      '216',
      '219',
      '222',
      '225',
      '228',
      '231',
      '234',
      '237',
      '240',
      '243',
      '246',
    ];

    this.analysisData = [
      {
        code: MODEL.GSM.w,
        name: 'Gió',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt', '200', '300', '500', '700', '850'],
        steps: GSM_STEPS,
      },
      {
        code: MODEL.GSM.w10,
        name: 'Gió bề mặt',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: GSM_STEPS,
      },
      // {
      //   code: 'mhtd_rain',
      //   name: 'Mưa',
      //   startTime: '2024-07-21T12:00:00Z',
      //   pressureLevels: ['Bề mặt'],
      //   steps: GSM_STEPS,
      // },
      {
        code: MODEL.GSM.pmsl,
        name: 'Khí áp',
        startTime: '2024-07-21T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: GSM_STEPS,
      },
    ];
    this.analysisField = this.analysisData[0];

    /** SuWAT */
    this.SuWatAnalysisData = [
      {
        code: MODEL.SUWAT.zeta,
        name: 'Nước dâng',
        startTime: '2017-09-12T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: SuWAT_STEPS,
      },
    ];
    this.SuWatAnalysisField = this.SuWatAnalysisData[0];

    /** SwanGSM */
    this.SwanGSM_AnalysisData = [
      {
        code: MODEL.SWAN_GSM.hs,
        name: 'Độ cao sóng có nghĩa',
        startTime: '2024-06-26T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: SwanGSM_STEPS,
      },
      {
        code: MODEL.SWAN_GSM.theta0,
        name: 'Hướng sóng có nghĩa',
        startTime: '2024-06-26T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: SwanGSM_STEPS,
      },
      {
        code: MODEL.SWAN_GSM.hswe,
        name: 'Độ cao sóng lửng',
        startTime: '2024-06-26T12:00:00Z',
        pressureLevels: ['Bề mặt'],
        steps: SwanGSM_STEPS,
      },
    ];
    this.SwanGSM_AnalysisField = this.SwanGSM_AnalysisData[0];

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
      isFill: [true],
      // isWindContour: [false],
      isWind10mContour: [false],
      // isRainContour: [false],
      // isPressureContour: [false],
    });
    this.formGroup.controls['code'].valueChanges.subscribe((code) => {
      this.analysisField = this.analysisData.find((a) => a.code === code);
    });

    /** SuWAT */
    this.SuWatFormGroup = this.fb.group({
      code: [this.SuWatAnalysisField?.code, [Validators.required]],
      startTime: [this.SuWatAnalysisField?.startTime, [Validators.required]],
      pressureLevel: [
        this.SuWatAnalysisField?.pressureLevels[0],
        [Validators.required],
      ],
      step: [this.SuWatAnalysisField?.steps[0], [Validators.required]],
      isFill: [false],
    });
    this.SuWatFormGroup.controls['code'].valueChanges.subscribe((code) => {
      this.SuWatAnalysisField = this.SuWatAnalysisData.find(
        (a) => a.code === code
      );
    });

    /** SwanGSM */
    this.SwanGSM_FormGroup = this.fb.group({
      code: [this.SwanGSM_AnalysisField?.code, [Validators.required]],
      startTime: [this.SwanGSM_AnalysisField?.startTime, [Validators.required]],
      pressureLevel: [
        this.SwanGSM_AnalysisField?.pressureLevels[0],
        [Validators.required],
      ],
      step: [this.SwanGSM_AnalysisField?.steps[0], [Validators.required]],
      isFill: [false],
    });
    this.SwanGSM_FormGroup.controls['code'].valueChanges.subscribe((code) => {
      this.SwanGSM_AnalysisField = this.SwanGSM_AnalysisData.find(
        (a) => a.code === code
      );
    });
  }

  loadData() {
    // 21/7 12h - 1/8 12h
    // swan-gsm : 26062024 12h 06072024 21h
    // suwat 12092017 12h 16092017 6h
    console.log('load data');

    this.updateGSMLayers();
    this.updateSuWatLayers();
    this.updateSwanGSMLayers();
  }

  updateGSMLayers() {
    // if (!this.map || !this.analysisField) return;
    let formValue = this.formGroup.value;
    let layerOptions: any = {
      layers: `${formValue.code}`,
      time: formValue.startTime,
      format: 'image/png',
      transparent: true,
      opacity: 0.8,
      version: '1.1.1',
      interpolations: 'bicubic',
      styles: `${formValue.code}`,
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

    /** Hiện mảng màu */
    this.loadLayer(formValue.isFill, layerOptions);
    this.getCurrentLegend(formValue.isFill, layerOptions);

    /** Hiện mảng contour */
    this.loadLayer(formValue.isWind10mContour, layerOptions, {
      layers: `${MODEL.GSM.w10}`,
      styles: `${formValue.code}_direction`,
    });
    // this.loadLayer(formValue.isWind10mContour, layerOptions, {
    //   layers: `${MODEL.GSM.w10}`,
    //   styles: `${formValue.code}_contour`
    // });
  }

  updateSuWatLayers() {
    // if (!this.map || !this.SuWatAnalysisField) return;
    let formValue = this.SuWatFormGroup.value;
    let layerOptions: any = {
      layers: `${formValue.code}`,
      time: formValue.startTime,
      format: 'image/png',
      transparent: true,
      opacity: 0.8,
      version: '1.1.1',
      interpolations: 'bilinear',
      styles: `${formValue.code}`,
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

    /** Hiện mảng màu */
    this.loadLayer(formValue.isFill, layerOptions);
  }

  updateSwanGSMLayers() {
    // if (!this.map || !this.SwanGSM_AnalysisField) return;
    let formValue = this.SwanGSM_FormGroup.value;
    let layerOptions: any = {
      layers: `${formValue.code}`,
      time: formValue.startTime,
      format: 'image/png',
      transparent: true,
      opacity: 0.8,
      version: '1.1.1',
      interpolations: 'bilinear',
      styles: `${formValue.code}`,
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

    /** Hiện mảng màu */
    this.loadLayer(formValue.isFill, layerOptions);
  }

  loadLayer(isShow: boolean, layerOptions: any, customOptions?: any) {
    layerOptions = {
      ...layerOptions,
      ...customOptions,
    };
    // console.log(layerOptions);

    // if (isShow) {
    //   this.clearLayerCache(layerOptions.layers);
    //   let contour = L.nonTiledLayer
    //     .wms(GEOSERVER_WMS, layerOptions)
    //     .addTo(this.map);
    //   this.layerCache.set(layerOptions.layers, contour);
    // } else {
    //   this.clearLayerCache(layerOptions.layers);
    // }
  }

  clearLayerCache(layerCode: string) {
    if (this.layerCache.get(layerCode)) {
      this.map.removeLayer(this.layerCache.get(layerCode));
      this.layerCache.delete(layerCode);
    }
  }

  /** Render color */
  renderLegend() {
    this.legendList.push(...[
      {
        code: MODEL.GSM.pmsl,
        type: this.COLOR_TYPES.COLOR,
        data: pmslColors,
      },
      {
        code: MODEL.GSM.w10,
        type: this.COLOR_TYPES.GRADIENT,
        data: wind10mColors,
      },
      {
        code: MODEL.GSM.w,
        lev: '200',
        type: this.COLOR_TYPES.GRADIENT,
        data: wind200Colors,
      },
      {
        code: MODEL.GSM.w,
        lev: '300',
        type: this.COLOR_TYPES.GRADIENT,
        data: wind200Colors,
      },
      {
        code: MODEL.GSM.w,
        lev: '500',
        type: this.COLOR_TYPES.GRADIENT,
        data: wind500Colors,
      },
      {
        code: MODEL.GSM.w,
        lev: '700',
        type: this.COLOR_TYPES.GRADIENT,
        data: wind700Colors,
      },
      {
        code: MODEL.GSM.w,
        lev: '850',
        type: this.COLOR_TYPES.GRADIENT,
        data: wind700Colors,
      },
    ]);
  }

  getCurrentLegend(isShow: boolean, layerOptions: any) {
    console.log('getCurrentLegend', layerOptions);

    if (isShow) {
      let legend = undefined;
      this.currentLegend = undefined;

      for (let i = 0; i < this.legendList.length; i++) {
        let item = this.legendList[i];
        console.log(+item.lev === +layerOptions.DIM_LEV);
        if (
          item.code === layerOptions.layers &&
          layerOptions.layers === MODEL.GSM.w &&
          +item.lev === +layerOptions.DIM_LEV
        ) {
          legend = item;
          break;
        } else if (item.code === layerOptions.layers) {
          legend = item;
        }
      };
      console.log(legend);

      this.currentLegend = legend;
    } else {
      this.currentLegend = undefined;
    }

    console.log(this.legendList);
    console.log(this.currentLegend);
  }
}
