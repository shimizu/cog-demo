import { TileLayer, BitmapLayer, ScatterplotLayer, GeoJsonLayer } from 'deck.gl';
import { color as d3color } from 'd3-color'

const MAKER_COLORS = {
  ALM: '#FF00FF',

  ARR: 'salmon',
  'ARR; WRC': 'orange',
  'ARR; REDD; WRC': 'sandybrown',

  ACoGS: 'red',
  'ACoGS; REDD': 'darkred',

  IFM: 'blue',
  'IFM; REDD': 'darkblue',

  REDD: 'green',
  'REDD; WRC': 'darkgreen'
}

const MAKER_OTHER_COLOR = "gray"

//16進のカラーコード&カラーネームをrgbの配列に変換する
d3color.prototype.toArray = function () {
  return [this.r, this.g, this.b]
}


export function renderLayers({ data, cogBboxPoly, onClick}) {
 
  console.log(data)



  const buffer = new GeoJsonLayer({
    id: 'geojson-layer',
    data: cogBboxPoly,
    pickable: false,
    stroked: true,
    filled: false,
    extruded: false,
    lineWidthMinPixels: 2,
    getLineColor: [255, 0, 0],
  });


  const scatter = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: data,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 100,
    radiusMinPixels: 6,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getRadius: 10,
    getPosition: d => {
      return [d.lon, d.lat]
    },
    getFillColor: d => {
      const c = MAKER_COLORS[d['AFOLU Activities']] || MAKER_OTHER_COLOR
      return d3color(c).toArray()
    },
    getLineColor: [0, 0, 0],
    onClick: d => {
      onClick(d.object)
    }
  })


  //OSMタイルを読み込みベースマップとして表示
  const tileLayer = new TileLayer({
    id:"tile-layer",
    data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: (props) => {
      const {
        bbox: { west, south, east, north }
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  });  

  //レイヤーの重なり順を配列で指定(先頭のレイヤーが一番下になる)
  return [tileLayer, scatter, buffer];
}
