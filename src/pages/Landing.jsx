import React from 'react'
import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';


const Landing = () => {
    const canvasRef = useRef(null); // ref to HTML canvas
    const fabricRef = useRef(null); // ref to Fabric canvas instance
    const [fontSize, setFontSize] = useState(20);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushWidth, setBrushWidth] = useState(5);

    useEffect(() => {
        // Initialize fabric canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#fff',
        });

        fabricRef.current = canvas;

        // Optional: allow selecting text box on click
        canvas.on('mouse:down', () => {
            const active = canvas.getActiveObject();
            if (active && active.type === 'textbox') {
                setFontSize(active.fontSize || 20);
                setFontFamily(active.fontFamily || 'Arial');
            }
        });

        return () => canvas.dispose();
    }, []);




    const addText = () => {
        const textbox = new fabric.Textbox('Edit me!', {
            left: 100,
            top: 100,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: '#000',
        });

        fabricRef.current.add(textbox);
        fabricRef.current.setActiveObject(textbox);
    };


    const toggleDrawing = () => {
        const canvas = fabricRef.current;
        const mode = !isDrawing;
        setIsDrawing(mode);
        setIsErasing(false); // Exit eraser mode when entering draw mode
        canvas.isDrawingMode = mode;

        if (mode) {
            // Initialize the brush when entering drawing mode
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = brushColor;
            canvas.freeDrawingBrush.width = brushWidth;
        }
    };

    const toggleEraser = () => {
        const canvas = fabricRef.current;
        const mode = !isErasing;
        setIsErasing(mode);
        setIsDrawing(false); // Exit drawing mode when entering eraser mode
        canvas.isDrawingMode = mode;

        if (mode) {
            // Initialize the eraser brush with white color (background color)
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.freeDrawingBrush.color = '#ffffff'; // White color to match background
            canvas.freeDrawingBrush.width = brushWidth;
        }
    };


    const updateStyle = (styleType) => {
        const canvas = fabricRef.current;
        const active = canvas.getActiveObject();

        if (active && active.type === 'textbox') {
            switch (styleType) {
                case 'bold':
                    active.set('fontWeight', active.fontWeight === 'bold' ? 'normal' : 'bold');
                    break;
                case 'italic':
                    active.set('fontStyle', active.fontStyle === 'italic' ? 'normal' : 'italic');
                    break;
                case 'underline':
                    active.set('underline', !active.underline);
                    break;
                default:
                    break;
            }
            canvas.requestRenderAll();
        }
    };

    const changeFontSize = (size) => {
        setFontSize(size);
        const active = fabricRef.current.getActiveObject();
        if (active && active.type === 'textbox') {
            active.set('fontSize', size);
            fabricRef.current.requestRenderAll();
        }
    };

    const changeFontFamily = (font) => {
        setFontFamily(font);
        const active = fabricRef.current.getActiveObject();
        if (active && active.type === 'textbox') {
            active.set('fontFamily', font);
            fabricRef.current.requestRenderAll();
        }
    };

    const changeBrushColor = (color) => {
        setBrushColor(color);
        const canvas = fabricRef.current;
        if (canvas.isDrawingMode && isDrawing) {
            if (!canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            }
            canvas.freeDrawingBrush.color = color;
        }
    };

    const changeBrushWidth = (width) => {
        setBrushWidth(width);
        const canvas = fabricRef.current;
        if (canvas.isDrawingMode) {
            if (isDrawing && !canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            } else if (isErasing && !canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = '#ffffff'; // White for erasing
            }
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.width = width;
            }
        }
    };


    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (f) {
            const data = f.target.result;

            fabric.Image.fromURL(data, (img) => {
                img.set({
                    left: 150,
                    top: 150,
                    scaleX: 0.5,
                    scaleY: 0.5,
                });

                fabricRef.current.add(img);
            });
        };
        reader.readAsDataURL(file);
    };

    const exportAsPNG = () => {
        const canvas = fabricRef.current;
        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 2,
        });

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'canvas.png';
        link.click();
    };

    const exportAsPDF = () => {
        const canvas = fabricRef.current;
        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 2,
        });

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height],
        });

        pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('canvas.pdf');
    };


    return (
        <>
            <div className="text-center w-full h-screen bg-blue-100">
                <h1 className="text-4xl font-bold mt-20">Welcome to PixelPad</h1>
                <p className="mt-4 text-lg">Your go-to platform for pixel art creation and sharing.</p>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={toggleDrawing}
                        className={`px-3 py-1 rounded ${isDrawing ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                        {isDrawing ? 'Exit Draw' : 'Draw Mode'}
                    </button>

                    <button
                        onClick={toggleEraser}
                        className={`px-3 py-1 rounded ${isErasing ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}
                    >
                        {isErasing ? 'Exit Eraser' : 'Eraser'}
                    </button>

                    <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => changeBrushColor(e.target.value)}
                        className="w-10 h-10 p-1"
                        disabled={isErasing}
                    />

                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={brushWidth}
                        onChange={(e) => changeBrushWidth(parseInt(e.target.value))}
                        className="w-32"
                    />
                    <button onClick={addText} className="bg-blue-500 text-white px-3 py-1 rounded">Add Text</button>

                    <select
                        value={fontFamily}
                        onChange={(e) => changeFontFamily(e.target.value)}
                        className="border px-2 py-1"
                    >
                        <option value="Arial">Arial</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Verdana">Verdana</option>
                    </select>

                    <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => changeFontSize(parseInt(e.target.value))}
                        className="border w-20 px-2 py-1"
                    />

                    <button onClick={() => updateStyle('bold')} className="bg-gray-200 px-3 py-1 rounded">B</button>
                    <button onClick={() => updateStyle('italic')} className="bg-gray-200 px-3 py-1 rounded italic">I</button>
                    <button onClick={() => updateStyle('underline')} className="bg-gray-200 px-3 py-1 rounded underline">U</button>
                    <label className="bg-purple-500 text-white px-3 py-1 rounded cursor-pointer">
                        Upload Image
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={exportAsPNG}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                        Export PNG
                    </button>

                    <button
                        onClick={exportAsPDF}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                        Export PDF
                    </button>

                </div>

                <canvas ref={canvasRef} className="border border-gray-300 shadow-lg" />
            </div>
        </>
    )
}

export default Landing