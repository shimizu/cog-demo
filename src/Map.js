import React, {useState,  useEffect } from 'react';
import DeckGL, { MapView, FlyToInterpolator }from 'deck.gl';
import { bbox, buffer, point, bboxPolygon} from "@turf/turf"

console.log(bbox)

import { renderLayers } from "./RenderLayers";


import dammyData from './data/dammy.json'

// 初期ビューポートの設定
const INITIAL_VIEW_STATE = {
    latitude: 35.73202612464274,
    longitude: 137.53268402693763,
    zoom: 1
};


function Map() {
    //マウスカーソルスタイル
    const [cursor, setCursor] = useState('move')

    const [viwState, setViewState] = useState(INITIAL_VIEW_STATE)

    const [cogBbox, setCogBbox] = useState(null)
    const [cogBboxPoly, setCogBboxPoly] = useState(null)


    useEffect(() => {
        console.log("cogBbox", cogBbox)


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
                zoom: 6,
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
                    cogBboxPoly: cogBboxPoly,
                    onClick: handleOnClick 
                })}
                onHover={handlerOnMakerHover}
            >
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