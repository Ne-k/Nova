'use client'
import { useEffect, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import * as PIXI from 'pixi.js';

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
    const drawingCanvas = useRef<HTMLDivElement>(null); // Add this line

    // Function to add a new plant
    const addPlant = (plant: Plant) => {
        setPlants([...plants, plant]);
    };

    useEffect(() => {
        if (!drawingCanvas.current) return;
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1099bb
        });
        drawingCanvas.current.appendChild(app.view as unknown as Node);

        let drawing = false;
        let currentLine: PIXI.Graphics | null = null;

        function startDrawing(e: PIXI.InteractionEvent) {
            drawing = true;
            currentLine = new PIXI.Graphics();
            app.stage.addChild(currentLine);
            currentLine.lineStyle(2, 0xffd900, 1);
            currentLine.moveTo(e.data.global.x, e.data.global.y);
        }

        function draw(e: PIXI.InteractionEvent) {
            if (!drawing || !currentLine) return;
            currentLine.lineTo(e.data.global.x, e.data.global.y);
            currentLine.closePath();
            currentLine.moveTo(e.data.global.x, e.data.global.y);
        }


        function endDrawing() {
            drawing = false;
            currentLine = null;
        }

        app.renderer.plugins.interaction.on('pointerdown', startDrawing);
        app.renderer.plugins.interaction.on('pointermove', draw);
        app.renderer.plugins.interaction.on('pointerup', endDrawing);
        app.renderer.plugins.interaction.on('pointerupoutside', endDrawing);

        return () => {
            app.renderer.plugins.interaction.off('pointerdown', startDrawing);
            app.renderer.plugins.interaction.off('pointermove', draw);
            app.renderer.plugins.interaction.off('pointerup', endDrawing);
            app.renderer.plugins.interaction.off('pointerupoutside', endDrawing);
            app.destroy(true);
        };
    }, []);

    return (
        <div className={styles.container}>
            <Head>
                <title>Permaculture Design Tool</title>
                <meta name="description" content="Permaculture design tool with configurable plants" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main} ref={drawingCanvas}></main>

            <aside className={styles.sidebar}>
                <h1>Configured Plants</h1>
                {plants.map((plant, index) => (
                    <div key={index} className={styles.card}>
                        <h2>{plant.name}</h2>
                        <Image src={plant.image} alt={plant.name} width={500} height={300}/>
                        <p>{plant.description}</p>
                    </div>
                ))}
            </aside>

        </div>
    );
};

export default Home;
