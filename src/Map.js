import React, {useState,  useEffect } from 'react';
import DeckGL, { MapView, FlyToInterpolator }from 'deck.gl';
import { bbox, buffer, point, bboxPolygon} from "@turf/turf"
import GeoTIFF, { fromUrl }  from 'geotiff';
import BaseMap from 'react-map-gl';


import { renderLayers } from "./RenderLayers";


import dammyData from './data/dammy.json'

// 初期ビューポートの設定
const INITIAL_VIEW_STATE = {
    latitude: 35.73202612464274,
    longitude: 137.53268402693763,
    zoom: 1
};

const GeotiffURL = "https://g3-data.s3.ap-northeast-1.amazonaws.com/COG/test/cog-forestloss-tile.tif"

function Map() {
    //マウスカーソルスタイル
    const [cursor, setCursor] = useState('pointer')

    let cog = null

    const [viwState, setViewState] = useState(INITIAL_VIEW_STATE)

    const [cogBbox, setCogBbox] = useState(null)
    const [cogBboxPoly, setCogBboxPoly] = useState(null)

    const [rasterData, setRasterData] = useState(null)

    useEffect(() => {
        if (!cogBbox) return;
        const loadAoiRaster = async ()=>{
            const cog = await fromUrl(GeotiffURL)
            const aoiRaster = await cog.readRasters({
                bbox: cogBbox,
                resX: 0.01,
                resY: 0.01
            });

            setRasterData(aoiRaster)

        }
        loadAoiRaster()


    }, [cogBbox])


    const handleOnClick = (e)=>{

        const calBuffer = buffer(point([e.lon, e.lat]), 200, { units: 'kilometers' });
        const calBBox = bbox(calBuffer);
        setCogBbox(calBBox)

        const calBBoxPolygon = bboxPolygon(calBBox)
        setCogBboxPoly(calBBoxPolygon)


        setViewState(v=>{
            return {
                longitude: e.lon,
                latitude: e.lat,
                zoom: 7,
                transitionDuration: 1000, //アニメーションの秒数を設定する
                transitionInterpolator: new FlyToInterpolator() // アニメーションのスタイルを設定する
            }
        })
    }


    //マウスホバーハンドラ
    const handlerOnMakerHover = d => {
        //マーカー外をホバーしたとき
        if (!d.layer) {
            setCursor('move')
        }else{
            //マーカーをホバーしたとき
            setCursor('pointer')
        }
    }

    return (
        <div>
            <DeckGL
                views={new MapView({ repeat: true })}
                initialViewState={viwState}
                controller={true}
                getCursor={() => cursor}
                layers={renderLayers({ 
                    data: dammyData,
                    rasterData: rasterData,
                    cogBbox: cogBbox,
                    cogBboxPoly: cogBboxPoly,
                    onClick: handleOnClick 
                })}
                //onHover={handlerOnMakerHover}
            >
                <BaseMap
                    mapStyle={"mapbox://styles/mapbox/light-v10"}
                    mapboxAccessToken={"pk.eyJ1Ijoic2hpbWl6dSIsImEiOiJjbGViajl1bWwxOW04M3Zwa2Uxc3J4eTNoIn0.Z3KLWOUk9-rr9qGvQsNOPw"}
                />

            </DeckGL>
            <div className="attribution">
                <a
                    href="http://www.openstreetmap.org/about/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    © OpenStreetMap
                </a>
            </div>
        </div>
    );
}

export default Map;