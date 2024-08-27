export const COLOR_TYPES = {
  GRADIENT: 'GRADIENT',
  COLOR: 'COLOR',
}

export const MODEL = {
  GSM: {
    w: 'ne:gsm_w',
    w10: 'ne:gsm_w10',
    pmsl: 'ne:gsm_psml',
    h: 'ne:gsm_h'
  },
  SWAN_GSM: {
    hs: 'ne:sw_gsm_hs',
    hswe: 'ne:sw_gsm_hswe',
    theta0: 'ne:sw_gsm_theta0'
  },
  SUWAT: {
    zeta: 'ne:Suw_zeta'
  }
}

export const pmslColors = [
  { key: 992, color: 'rgb(255, 38, 38)' },
  { key: 994, color: 'rgb(255, 64, 64)' },
  { key: 996, color: 'rgb(255, 89, 89)' },
  { key: 998, color: 'rgb(255, 115, 115)' },
  { key: 1000, color: 'rgb(255, 140, 140)' },
  { key: 1002, color: 'rgb(255, 166, 166)' },
  { key: 1004, color: 'rgb(255, 191, 191)' },
  { key: 1006, color: 'rgb(255, 217, 217)' },
  { key: 1008, color: 'rgb(255, 242, 242)' },
  { key: 1010, color: 'rgb(255, 255, 255)' },
  { key: 1012, color: 'rgb(255, 255, 255)' },
  { key: 1014, color: 'rgb(242, 242, 255)' },
  { key: 1016, color: 'rgb(217, 217, 255)' },
  { key: 1018, color: 'rgb(191, 191, 255)' },
  { key: 1020, color: 'rgb(166, 166, 255)' },
  { key: 1022, color: 'rgb(140, 140, 255)' },
  { key: 1024, color: 'rgb(115, 115, 255)' },
  { key: 1026, color: 'rgb(89, 89, 255)' },
  { key: 1028, color: 'rgb(64, 64, 255)' },
  { key: 1030, color: 'rgb(38, 38, 255)' },
  { key: 1032, color: '' },
];

export const rain6hColors = [
  { key: 0, color: 'rgb(255, 255, 255)' },
  { key: 1, color: 'rgb(184, 184, 255)' },
  { key: 5, color: 'rgb(127, 153, 229)' },
  { key: 10, color: 'rgb(127, 180, 210)' },
  { key: 15, color: 'rgb(127, 210, 180)' },
  { key: 20, color: 'rgb(200, 255, 150)' },
  { key: 25, color: 'rgb(150, 255, 120)' },
  { key: 30, color: 'rgb(100, 250, 100)' },
  { key: 35, color: 'rgb(50, 240, 50)' },
  { key: 40, color: 'rgb(255, 255, 180)' },
  { key: 45, color: 'rgb(255, 255, 130)' },
  { key: 50, color: 'rgb(255, 255, 80)' },
  { key: 55, color: 'rgb(255, 240, 50)' },
  { key: 60, color: 'rgb(255, 210, 150)' },
  { key: 65, color: 'rgb(255, 180, 120)' },
  { key: 70, color: 'rgb(255, 150, 90)' },
  { key: 75, color: 'rgb(255, 100, 50)' },
  { key: 80, color: 'rgb(255, 75, 40)' },
  { key: 85, color: 'rgb(255, 50, 30)' },
  { key: 90, color: 'rgb(255, 25, 19)' },
  { key: 100, color: '' },
];

export const hue_rain_24h_48h = [
  { key: 0, color: 'rgb(255, 255, 255)' },
  { key: 5, color: 'rgb(184, 184, 255)' },
  { key: 10, color: 'rgb(127, 153, 229)' },
  { key: 20, color: 'rgb(127, 180, 210)' },
  { key: 30, color: 'rgb(127, 210, 180)' },
  { key: 40, color: 'rgb(200, 255, 150)' },
  { key: 50, color: 'rgb(150, 255, 120)' },
  { key: 60, color: 'rgb(100, 250, 100)' },
  { key: 70, color: 'rgb(50, 240, 50)' },
  { key: 80, color: 'rgb(255, 255, 180)' },
  { key: 90, color: 'rgb(255, 255, 130)' },
  { key: 100, color: 'rgb(255, 255, 80)' },
  { key: 120, color: 'rgb(255, 240, 50)' },
  { key: 140, color: 'rgb(255, 210, 150)' },
  { key: 160, color: 'rgb(255, 180, 120)' },
  { key: 180, color: 'rgb(255, 150, 90)' },
  { key: 200, color: 'rgb(255, 100, 50)' },
  { key: 250, color: 'rgb(255, 75, 40)' },
  { key: 300, color: 'rgb(255, 50, 30)' },
  { key: 350, color: 'rgb(255, 25, 19)' },
  { key: 400, color: '' },
];

export const hue_rain_72h = [
  { key: 0, color: 'rgb(255, 255, 255)' },
  { key: 10, color: 'rgb(184, 184, 255)' },
  { key: 20, color: 'rgb(127, 153, 229)' },
  { key: 30, color: 'rgb(127, 180, 210)' },
  { key: 50, color: 'rgb(127, 210, 180)' },
  { key: 70, color: 'rgb(200, 255, 150)' },
  { key: 90, color: 'rgb(150, 255, 120)' },
  { key: 120, color: 'rgb(100, 250, 100)' },
  { key: 150, color: 'rgb(50, 240, 50)' },
  { key: 200, color: 'rgb(255, 255, 180)' },
  { key: 250, color: 'rgb(255, 255, 130)' },
  { key: 300, color: 'rgb(255, 255, 80)' },
  { key: 350, color: 'rgb(255, 240, 50)' },
  { key: 400, color: 'rgb(255, 210, 150)' },
  { key: 450, color: 'rgb(255, 180, 120)' },
  { key: 500, color: 'rgb(255, 150, 90)' },
  { key: 550, color: 'rgb(255, 100, 50)' },
  { key: 600, color: 'rgb(255, 75, 40)' },
  { key: 650, color: 'rgb(255, 50, 30)' },
  { key: 700, color: 'rgb(255, 25, 19)' },
  { key: 750, color: '' },
];

export const t2mColorBar = [
  { key: 0, color: 'rgb(153, 0, 204)' },
  { key: 2, color: 'rgb(45, 45, 255)' },
  { key: 4, color: 'rgb(89, 89, 255)' },
  { key: 6, color: 'rgb(137, 137, 255)' },
  { key: 8, color: 'rgb(162, 162, 233)' },
  { key: 10, color: 'rgb(0, 255, 255)' },
  { key: 12, color: 'rgb(0, 229, 153)' },
  { key: 14, color: 'rgb(0, 178, 76)' },
  { key: 16, color: 'rgb(51, 153, 0)' },
  { key: 18, color: 'rgb(102, 255, 0)' },
  { key: 20, color: 'rgb(255, 255, 25)' },
  { key: 22, color: 'rgb(255, 204, 22)' },
  { key: 24, color: 'rgb(255, 153, 20)' },
  { key: 26, color: 'rgb(255, 102, 17)' },
  { key: 28, color: 'rgb(255, 51, 15)' },
  { key: 30, color: 'rgb(255, 0, 0)' },
  { key: 32, color: 'rgb(229, 0, 0)' },
  { key: 34, color: 'rgb(204, 0, 0)' },
  { key: 36, color: 'rgb(178, 0, 0)' }
];

const rh2mColorBar = [
{ key: 0, color: 'rgb(255, 72, 0)' },
{ key: 10, color: 'rgb(255, 72, 0)' },
{ key: 20, color: 'rgb(255, 144, 0)' },
{ key: 30, color: 'rgb(255, 196, 0)' },
{ key: 40, color: 'rgb(255, 235, 0)' },
{ key: 50, color: 'rgb(209, 255, 51)' },
{ key: 60, color: 'rgb(206, 255, 255)' },
{ key: 70, color: 'rgb(156, 238, 255)' },
{ key: 80, color: 'rgb(109, 193, 255)' },
{ key: 90, color: 'rgb(65, 150, 255)' },
{ key: 100, color: '' }
];

const thicknessColorBar = [
{ key: 5400, color: 'rgb(153, 0, 204)' },
{ key: 5430, color: 'rgb(45, 45, 255)' },
{ key: 5460, color: 'rgb(89, 89, 255)' },
{ key: 5490, color: 'rgb(137, 137, 255)' },
{ key: 5520, color: 'rgb(162, 162, 233)' },
{ key: 5550, color: 'rgb(0, 255, 255)' },
{ key: 5580, color: 'rgb(0, 229, 153)' },
{ key: 5610, color: 'rgb(0, 178, 76)' },
{ key: 5640, color: 'rgb(51, 153, 0)' },
{ key: 5670, color: 'rgb(102, 255, 0)' },
{ key: 5700, color: 'rgb(255, 255, 25)' },
{ key: 5730, color: 'rgb(255, 204, 22)' },
{ key: 5760, color: 'rgb(255, 153, 20)' },
{ key: 5790, color: 'rgb(255, 102, 17)' },
{ key: 5820, color: 'rgb(255, 51, 15)' },
{ key: 5850, color: 'rgb(255, 0, 0)' },
{ key: 5880, color: 'rgb(229, 0, 0)' },
{ key: 5910, color: 'rgb(204, 0, 0)' },
{ key: 5940, color: 'rgb(178, 0, 0)' },
{ key: 5970, color: '' }
];

export const wind10mColors = [
  { from: 0 , fromColor: 'rgb(255, 255, 217)', to: 5.5, toColor: 'rgb(255, 255, 140)'},
  { from: 5.5 , fromColor: 'rgb(255, 255, 140)', to: 8.0, toColor: 'rgb(255, 255, 64)'},
  { from: 8.0 , fromColor: 'rgb(255, 255, 64)', to: 10.8, toColor: 'rgb(166, 255, 0)'},
  { from: 10.8 , fromColor: 'rgb(166, 255, 0)', to: 13.9, toColor: 'rgb(89 ,255, 0)'},
  { from: 13.9 , fromColor: 'rgb(89 ,255, 0)', to: 17.2, toColor: 'rgb(13 ,255, 0)'},
  { from: 17.2 , fromColor: 'rgb(13 ,255, 0)', to: 20.8, toColor: 'rgb( 0 ,191, 0)'},
  { from: 20.8, fromColor: 'rgb( 0 ,191, 0)', to: 24.5, toColor: 'rgb( 0 ,191, 0)'},
  { from: 24.5, fromColor: 'rgb( 0 ,191, 0)', to: 24.5, toColor: 'rgb(0, 115, 0)'},
];

export const wind200Colors = [
  { from: 0 , fromColor: 'rgb(255, 255, 217)', to: 10, toColor: 'rgb(255, 255, 140)'},
  { from: 10 , fromColor: 'rgb(255, 255, 140)', to: 20, toColor: 'rgb(255, 255, 64)'},
  { from: 20 , fromColor: 'rgb(255, 255, 64)', to: 30, toColor: 'rgb(166, 255, 0)'},
  { from: 30 , fromColor: 'rgb(166, 255, 0)', to: 40, toColor: 'rgb(89 ,255, 0)'},
  { from: 40 , fromColor: 'rgb(89 ,255, 0)', to: 50, toColor: 'rgb(13 ,255, 0)'},
  { from: 50 , fromColor: 'rgb(13 ,255, 0)', to: 60, toColor: 'rgb( 0 ,191, 0)'},
  { from: 60, fromColor: 'rgb( 0 ,191, 0)', to: 80, toColor: 'rgb( 0 ,191, 0)'},
  { from: 80, fromColor: 'rgb( 0 ,191, 0)', to: 100, toColor: 'rgb(0, 115, 0)'},
];

export const wind500Colors = [
  { from: 0 , fromColor: 'rgb(255, 255, 217)', to: 5, toColor: 'rgb(255, 255, 140)'},
  { from: 5 , fromColor: 'rgb(255, 255, 140)', to: 10, toColor: 'rgb(255, 255, 64)'},
  { from: 10 , fromColor: 'rgb(255, 255, 64)', to: 15, toColor: 'rgb(166, 255, 0)'},
  { from: 15 , fromColor: 'rgb(166, 255, 0)', to: 20, toColor: 'rgb(89 ,255, 0)'},
  { from: 20 , fromColor: 'rgb(89 ,255, 0)', to: 25, toColor: 'rgb(13 ,255, 0)'},
  { from: 25 , fromColor: 'rgb(13 ,255, 0)', to: 30, toColor: 'rgb( 0 ,191, 0)'},
  { from: 30, fromColor: 'rgb( 0 ,191, 0)', to: 50, toColor: 'rgb( 0 ,191, 0)'},
  { from: 50, fromColor: 'rgb( 0 ,191, 0)', to: 80, toColor: 'rgb(0, 115, 0)'},
];

export const wind700Colors = [
  { from: 0 , fromColor: 'rgb(255, 255, 217)', to: 5, toColor: 'rgb(255, 255, 140)'},
  { from: 5 , fromColor: 'rgb(255, 255, 140)', to: 10, toColor: 'rgb(255, 255, 64)'},
  { from: 10 , fromColor: 'rgb(255, 255, 64)', to: 15, toColor: 'rgb(166, 255, 0)'},
  { from: 15 , fromColor: 'rgb(166, 255, 0)', to: 20, toColor: 'rgb(89 ,255, 0)'},
  { from: 20 , fromColor: 'rgb(89 ,255, 0)', to: 25, toColor: 'rgb(13 ,255, 0)'},
  { from: 25 , fromColor: 'rgb(13 ,255, 0)', to: 30, toColor: 'rgb( 0 ,191, 0)'},
  { from: 30, fromColor: 'rgb( 0 ,191, 0)', to: 40, toColor: 'rgb( 0 ,191, 0)'},
  { from: 40, fromColor: 'rgb( 0 ,191, 0)', to: 50, toColor: 'rgb(0, 115, 0)'},
];
