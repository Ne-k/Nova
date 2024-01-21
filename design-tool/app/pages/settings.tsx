import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {NextPage} from "next";

const Settings: NextPage = () => {
    const [name, setName] = useState('');
    const [width, setWidth] = useState('');
    const [color, setColor] = useState('');
    const router = useRouter();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Generate a random color if no color is provided
        if (!color) {
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            setColor(randomColor);
        }

        // Add the plant to your plants data (not shown in this example)
        // ...

        // Redirect to the home page after adding the plant
        router.push('/');
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
                Width (in meters):
                <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} required />
            </label>
            <label>
                Color:
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            <button type="submit">Add Plant</button>
        </form>
    );
};

export default Settings;
