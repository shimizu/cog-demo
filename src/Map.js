import React, {useState,  useEffect } from 'react';
import DeckGL, { MapView, FlyToInterpolator }from 'deck.gl';
import { bbox, buffer, point, bboxPolygon} from "@turf/turf"
import GeoTIFF, { fromUrl }  from 'geotiff';
import BaseMap from 'react-map-gl';


import { renderLayers } from "./RenderLayers";

/*
import dammyData from './data/point.json'
*/

import dammyData from './data/all.json'

dammyData = Object.keys(dammyData).map(key =>{
    return point([dammyData[key].longitude, dammyData[key].latitude], {id:key})
})


// 初期ビューポートの設定
const INITIAL_VIEW_STATE = {
    latitude: 35.73202612464274,
    longitude: 137.53268402693763,
    zoom: 1
};

const GeotiffURL = "https://rating-platform-dev-geo.s3.ap-northeast-1.amazonaws.com/cog/cog-Hansen_GFC-2021-v1.9_lossyear.tif"

function Map() {
    const [cogURL, setCOGURL] = useState(GeotiffURL)

    //マウスカーソルスタイル
    const [cursor, setCursor] = useState('pointer')

    let cog = null

    const [viwState, setViewState] = useState(INITIAL_VIEW_STATE)

    const [cogBbox, setCogBbox] = useState(null)
    const [cogBboxPoly, setCogBboxPoly] = useState(null)

    const [rasterData, setRasterData] = useState(null)

    useEffect(() => {
        if (!cogBbox) return;
        if (!cogURL) return;
        const loadAoiRaster = async ()=>{
            const cog = await fromUrl(cogURL)
            const aoiRaster = await cog.readRasters({
                bbox: cogBbox,
                resX: 0.01,
                resY: 0.01
            });

            setRasterData(aoiRaster)

        }
        loadAoiRaster()


    }, [cogBbox, cogURL])


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

    const handlerOnChange =  (e) => {
        setRasterData(null)
        setCOGURL(e.target.value)
    } 


    return (
        <div>
            <h1>cloud optimized geotiff(COG)リクエストテスト</h1>
            <p>下記URLを変更して地図上マーカーをクリックしてください。正しくCOGが読み込めている場合、地図上にデータが可視化されます</p>
            <label>COG URL:<input
                style={{width:"600px", marginBottom:"1em"}} 
                type="text"
                defaultValue={cogURL}
                onChange={handlerOnChange}
                >
            </input></label>
            <div style={{
                position: "relative",
                width: "100%",
                height: "600px",
                marigin: "10px"
            }}>
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
            </div>
        </div>
    );
}

export default Map;