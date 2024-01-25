'use client'
import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../app/styles/Home.module.css';
import {Stage, Layer, Line, Rect, Circle, Text} from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import LineConfig = Konva.LineConfig;
import {useRouter} from "next/navigation";
import { Group } from 'react-konva';



interface KonvaDragEvent extends React.DragEvent {
    evt: DragEvent & {
        dataTransfer: DataTransfer;
    };
}

type Plant = {
    name: string;
    image: string;
    description: string;
    color: string;
    x?: number;
    y?: number;
};


type Line = {
    tool: string;
    points: number[];
    id: string;
    size: number;
};

const Home: NextPage = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isDrawing, setIsDrawing] = useState(true);
    const [lines, setLines] = useState<Line[]>([]);
    const stageRef = useRef<Konva.Stage>(null);
    const [tool, setTool] = useState('pencil')
    const [eraserSize, setEraserSize] = useState(5);
    const [pencilSize, setPencilSize] = useState(5)
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
    const DragContext = React.createContext(null);
    const [draggedPlant, setDraggedPlant] = useState<Plant | null>(null);
    const [sidebarPlants, setSidebarPlants] = useState<Plant[]>([]);
    const [canvasPlants, setCanvasPlants] = useState<Plant[]>([]);





    const router = useRouter();

    const addPlant = (plant: Plant) => {
        setPlants([...plants, plant]);
    };

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        setIsDrawing(true);
        const stage = e.target.getStage();
        if (stage) {
            const pos = stage.getPointerPosition();
            if (pos) {
                setLines([...lines, { tool: tool, points: [pos.x, pos.y, pos.x, pos.y], id: uuidv4(), size: tool === 'pencil' ? pencilSize : eraserSize }]); // Update this line
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
        if (stage) {
            const point = stage.getPointerPosition();
            if (point) {
                setCursorPos(point);
            }
        }
    };


    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                setLines(lines.slice(0, -1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lines]);

    useEffect(() => {
        const plants = JSON.parse(localStorage.getItem('plants') || '[]');
        setPlants(plants);
    }, []);



    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;

    return (

        <div className={styles.container}>
            <Head>
                <title>Permaculture Design Tool</title>
                <meta name="description" content="Permaculture design tool with configurable plants"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className={styles.main}>
                <div className="toolbar" style={{border: '2px solid #000', borderRadius: '15px', padding: '10px'}}>
                    <button className="tool" onClick={() => setTool('cursor')}>
                        <img src="/icons8-cursor-26.png" alt="Cursor" width="40" height="40"/>
                    </button>
                    <button className="tool" onClick={() => setTool('pencil')}>
                        <img src="/pencil-svgrepo-com.svg" alt="Draw" width="40" height="40"/>
                    </button>
                    {tool === 'pencil' && (
                        <input type="range" min="1" max="50" value={pencilSize}
                               onChange={(e) => setPencilSize(Number(e.target.value))}
                        />
                    )}
                    <button className="tool" onClick={() => setTool('eraser')}>
                        <img src="/eraser.svg" alt="Erase" width="40" height="40"/>
                    </button>
                    {tool === 'eraser' && (
                        <input type="range" min="1" max="50" value={eraserSize}
                               onChange={(e) => setEraserSize(Number(e.target.value))}
                        />
                    )}
                </div>

                <Stage onDrop={(event: React.DragEvent) => {
                    const index = event.dataTransfer.getData('application/reactflow');
                    const stageRef = useRef<Konva.Stage>(null);

                    if (draggedPlant) {
                        const stage = event.currentTarget as unknown as Konva.Stage;
                        const pos = stage.getPointerPosition();

                        if(pos) {
                            setCanvasPlants(prevCanvasPlants => [...prevCanvasPlants, { ...draggedPlant, x: pos.x, y: pos.y }]);
                        }

                        setSidebarPlants(prevSidebarPlants => prevSidebarPlants.filter(plant => plant !== draggedPlant));
                        setDraggedPlant(null);
                    }

                    if (stageRef.current) {
                        const pos = stageRef.current.getPointerPosition();
                        if(pos) {
                            setPlants(plants => plants.map((plant, i) => i === Number(index) ? { ...plant, x: pos.x, y: pos.y } : plant));
                        }
                    }
                }}

                       onDragOver={(event: React.DragEvent) => event.preventDefault()}
                    width={width - 400} height={height} ref={stageRef}
                       onMouseDown={tool !== 'cursor' ? handleMouseDown : undefined}
                       onMousemove={tool !== 'cursor' ? handleMouseMove : undefined}
                       onMouseUp={tool !== 'cursor' ? handleMouseUp : undefined}>
                    <Layer>
                        {canvasPlants.map((plant, index) => (
                            <Group key={index} x={plant.x} y={plant.y}>
                                <Circle
                                    radius={40}
                                    fill={plant.color}
                                />
                                <Text
                                    text={plant.name}
                                    width={100}
                                    align='center'
                                />
                            </Group>
                        ))}
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
                                    strokeWidth: line.size,
                                    tension: 0.5,
                                    lineCap: 'round',
                                    globalCompositeOperation: line.tool === 'pencil' ? 'source-over' : 'destination-out'
                                };
                                return <Line {...lineConfig} />;
                            }
                        })}
                        {(tool === 'pencil' || tool === 'eraser') && (
                            <Circle
                                x={cursorPos.x}
                                y={cursorPos.y}
                                radius={tool === 'pencil' ? pencilSize : eraserSize}
                                stroke={tool === 'pencil' ? '#df4b26' : '#fff'}
                                strokeWidth={1}
                            />
                        )}
                    </Layer>
                </Stage>
            </main>

            <aside className={styles.sidebar}>
                <button className="configure-button" onClick={() => router.push('/settings')}>
                    Configure Plants
                </button>
                <Stage width={200} height={plants.length * 100}>
                    {plants.map((plant, index) => (
                        <Layer   key={index}
                                 draggable
                                 onMouseDown={() => setDraggedPlant(plant)}
                        >
                            <Circle
                                x={100}
                                y={index * 100 + 50}
                                radius={40}
                                fill={plant.color}
                            />
                            <Text
                                x={50}
                                y={index * 100 + 50 - 10} // Subtract half the height of the text
                                text={plant.name}
                                width={100}
                                align='center'
                            />
                        </Layer>
                    ))}

                </Stage>
            </aside>

        </div>
    );
};

export default Home;
