'use client'
import { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { fabric } from 'fabric';

// Define a type for your plants
type Plant = {
    name: string;
    image: string;
    description: string;
};

// This is your main component
const Home: NextPage = () => {
    // Use a state variable to keep track of your plants
    const [plants, setPlants] = useState<Plant[]>([]);
    const [isDrawing, setIsDrawing] = useState(true);
    const canvasRef = useRef(null);

    // Function to add a new plant
    const addPlant = (plant: Plant) => {
        setPlants([...plants, plant]);
    };

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current);
        canvas.setHeight(window.innerHeight);
        canvas.setWidth(window.innerWidth - 400); // Subtract the width of the sidebar

        if (isDrawing) {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = "#000000";
            canvas.freeDrawingBrush.width = 1;
        } else {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = "#FFFFFF";
            canvas.freeDrawingBrush.width = 10;
        }
    }, [isDrawing]);

    const drawRectangle = () => {
        const canvas = canvasRef.current;
        const rect = new fabric.Rect({
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red'
        });
        canvas.add(rect);
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Permaculture Design Tool</title>
                <meta name="description" content="Permaculture design tool with configurable plants" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className="toolbar">
                    <button className="tool" onClick={() => setIsDrawing(true)}>
                        <img src="/pencil-svgrepo-com.svg" alt="Draw" width="40" height="40"/>
                    </button>
                    <button className="tool" onClick={() => setIsDrawing(false)}>
                        <img src="/eraser.svg" alt="Erase" width="40" height="40"/>
                    </button>
                    <button className="tool" onClick={drawRectangle}>
                        <img src="/rectangle-frame.svg" alt="Rectangle" width="40" height="40"/>
                    </button>

                </div>
                <canvas ref={canvasRef} id="c"/>
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
