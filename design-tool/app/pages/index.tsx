'use client'
import { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Stage, Layer, Line, Rect } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import LineConfig = Konva.LineConfig;

type Plant = {
    name: string;
    image: string;
    description: string;
};

type Line = {
    tool: string;
    points: number[];
    id: string;
};

const Home: NextPage = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isDrawing, setIsDrawing] = useState(true);
    const [lines, setLines] = useState<Line[]>([]);
    const stageRef = useRef(null);
    const [tool, setTool] = useState('pencil')
    const [eraserSize, setEraserSize] = useState(5);

    const addPlant = (plant: Plant) => {
        setPlants([...plants, plant]);
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        setIsDrawing(true);
        const stage = e.target.getStage();
        if (stage) {
            const pos = stage.getPointerPosition();
            if (pos) {
                setLines([...lines, { tool: tool, points: [pos.x, pos.y, pos.x, pos.y], id: uuidv4() }]);
            }
        }
    };


    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing) return;
        const stage = e.target.getStage();
        if (stage) {
            const point = stage.getPointerPosition();
            if (point) {
                let lastLine = lines[lines.length - 1];
                if (lastLine) {
                    // Update the last two points for rectangle
                    if (lastLine.tool === 'rectangle') {
                        const newPoints = [lastLine.points[0], lastLine.points[1], point.x, point.y];
                        const newLine = { ...lastLine, points: newPoints };
                        lines.splice(lines.length - 1, 1, newLine);
                    } else {
                        const newPoints = lastLine.points.concat([point.x, point.y]);
                        const newLine = { ...lastLine, points: newPoints };
                        lines.splice(lines.length - 1, 1, newLine);
                    }
                    setLines([...lines]);
                }
            }
        }
    };


    const handleMouseUp = () => {
        setIsDrawing(false); // Add this line
    };


    const drawRectangle = () => {
        setLines([...lines, { tool: 'rectangle', points: [20, 20, 100, 100], id: uuidv4() }]);
    };

    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;

    return (
        <div className={styles.container}>
            <Head>
                <title>Permaculture Design Tool</title>
                <meta name="description" content="Permaculture design tool with configurable plants" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className="toolbar" style={{border: '2px solid #000', borderRadius: '15px', padding: '10px'}}>
                    <button className="tool" onClick={() => setTool('pencil')}>
                        <img src="/pencil-svgrepo-com.svg" alt="Draw" width="40" height="40"/>
                    </button>
                    <button className="tool" onClick={() => setTool('eraser')}>
                        <img src="/eraser.svg" alt="Erase" width="40" height="40"/>
                    </button>
                    {tool === 'eraser' && (
                        <input type="range" min="1" max="50" value={eraserSize}
                               onChange={(e) => setEraserSize(Number(e.target.value))}
                        />
                    )}
                </div>

                <Stage width={width - 400} height={height} ref={stageRef} onMouseDown={handleMouseDown}
                       onMousemove={handleMouseMove} onMouseUp={handleMouseUp}>
                    <Layer>
                        {lines.map((line, i) => {
                            if (line.tool === 'rectangle') {
                                const rectConfig = {
                                    key: i,
                                    x: line.points[0],
                                    y: line.points[1],
                                    width: line.points[2] - line.points[0],
                                    height: line.points[3] - line.points[1],
                                    fill: '#df4b26'
                                };
                                return <Rect {...rectConfig} />;
                            } else {
                                const lineConfig: LineConfig = {
                                    key: i,
                                    points: line.points,
                                    stroke: line.tool === 'pencil' ? '#df4b26' : '#fff',
                                    strokeWidth: line.tool === 'pencil' ? 5 : eraserSize,
                                    tension: 0.5,
                                    lineCap: 'round',
                                    globalCompositeOperation: line.tool === 'pencil' ? 'source-over' : 'destination-out'
                                };
                                return <Line {...lineConfig} />;
                            }
                        })}
                    </Layer>
                </Stage>
            </main>

            <aside className={styles.sidebar}>
                <h1>Configured Plants</h1>
                {plants.map((plant, index) => (
                    <div key={index} className={styles.card}>
                        <h2>{plant.name}</h2>
                        <Image src={plant.image} alt={plant.name} width={300} height={300}/>
                        <p>{plant.description}</p>
                    </div>
                ))}
            </aside>
        </div>
    );
};

export default Home;
