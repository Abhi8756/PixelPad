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
        <div className="flex h-screen bg-slate-950 text-white">
            {/* Left Sidebar - Tools */}
            <div className="w-80 bg-slate-900 border-r border-slate-700 p-6 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-purple-400">PixelPad</h1>
                    <p className="text-slate-400 text-sm mt-1">Professional Drawing Studio</p>
                </div>

                {/* Drawing Tools */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Drawing Tools</h3>
                        <div className="space-y-3">
                            <button
                                onClick={toggleDrawing}
                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                                    isDrawing 
                                        ? 'bg-purple-600 text-white shadow-lg' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {isDrawing ? '🎨 Drawing Active' : '✏️ Draw Mode'}
                            </button>

                            <button
                                onClick={toggleEraser}
                                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                                    isErasing 
                                        ? 'bg-red-600 text-white shadow-lg' 
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                            >
                                {isErasing ? '🧹 Erasing Active' : '🧽 Eraser'}
                            </button>
                        </div>
                    </div>

                    {/* Brush Settings */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Brush Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-300">Color</label>
                                <input
                                    type="color"
                                    value={brushColor}
                                    onChange={(e) => changeBrushColor(e.target.value)}
                                    className="w-full h-12 rounded-lg border-2 border-slate-700 bg-slate-800"
                                    disabled={isErasing}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-300">
                                    Brush Size: {brushWidth}px
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={brushWidth}
                                    onChange={(e) => changeBrushWidth(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text Tools */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Text Tools</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={addText} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
                            >
                                📝 Add Text
                            </button>

                            <select
                                value={fontFamily}
                                onChange={(e) => changeFontFamily(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
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
                                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
                                placeholder="Font Size"
                            />

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateStyle('bold')} 
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-bold"
                                >
                                    B
                                </button>
                                <button 
                                    onClick={() => updateStyle('italic')} 
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg italic"
                                >
                                    I
                                </button>
                                <button 
                                    onClick={() => updateStyle('underline')} 
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg underline"
                                >
                                    U
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Import/Export */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Import & Export</h3>
                        <div className="space-y-3">
                            <label className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg cursor-pointer block text-center font-medium transition-all">
                                📁 Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={exportAsPNG}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
                            >
                                💾 Export PNG
                            </button>

                            <button
                                onClick={exportAsPDF}
                                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all"
                            >
                                📄 Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 bg-slate-950 p-6 flex flex-col">
                <div className="bg-slate-900 rounded-lg p-6 flex-1 flex items-center justify-center">
                    <canvas 
                        ref={canvasRef} 
                        className="border-2 border-slate-700 rounded-lg shadow-2xl bg-white" 
                    />
                </div>
            </div>
        </div>
    )
}

export default Landing