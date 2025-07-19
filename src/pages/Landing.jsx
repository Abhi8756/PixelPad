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
            preserveObjectStacking: true,
        });

        fabricRef.current = canvas;

        // Prevent canvas from clearing drawings
        canvas.renderOnAddRemove = true;
        
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
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#020617', color: 'white' }}>
            {/* Left Sidebar - Tools */}
            <div style={{ 
                width: '320px', 
                backgroundColor: '#0f172a', 
                borderRight: '1px solid #374151', 
                padding: '24px', 
                overflowY: 'auto' 
            }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7', margin: 0 }}>PixelPad</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', margin: 0 }}>Professional Drawing Studio</p>
                </div>

                {/* Drawing Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#d8b4fe', margin: '0 0 12px 0' }}>Drawing Tools</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={toggleDrawing}
                                style={{
                                    backgroundColor: isDrawing ? '#9333ea' : '#374151',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    width: '100%',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                {isDrawing ? 'Drawing Active' : 'Draw Mode'}
                            </button>

                            <button
                                onClick={toggleEraser}
                                style={{
                                    backgroundColor: isErasing ? '#dc2626' : '#374151',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    width: '100%',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                {isErasing ? 'Erasing Active' : 'Eraser'}
                            </button>
                        </div>
                    </div>

                    {/* Brush Settings */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#d8b4fe', margin: '0 0 12px 0' }}>Brush Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#cbd5e1' }}>Color</label>
                                <input
                                    type="color"
                                    value={brushColor}
                                    onChange={(e) => changeBrushColor(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '8px',
                                        border: '2px solid #374151',
                                        backgroundColor: '#1e293b'
                                    }}
                                    disabled={isErasing}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#cbd5e1' }}>
                                    Brush Size: {brushWidth}px
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={brushWidth}
                                    onChange={(e) => changeBrushWidth(parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#374151',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Text Tools */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#d8b4fe', margin: '0 0 12px 0' }}>Text Tools</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button 
                                onClick={addText} 
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    width: '100%',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Add Text
                            </button>

                            <select
                                value={fontFamily}
                                onChange={(e) => changeFontFamily(e.target.value)}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #374151',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '8px'
                                }}
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
                                placeholder="Font Size"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #374151',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '8px'
                                }}
                            />

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => updateStyle('bold')} 
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    B
                                </button>
                                <button 
                                    onClick={() => updateStyle('italic')} 
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontStyle: 'italic',
                                        cursor: 'pointer'
                                    }}
                                >
                                    I
                                </button>
                                <button 
                                    onClick={() => updateStyle('underline')} 
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    U
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Import/Export */}
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#d8b4fe', margin: '0 0 12px 0' }}>Import & Export</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{
                                backgroundColor: '#16a34a',
                                color: 'white',
                                border: 'none',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                width: '100%',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'block',
                                textAlign: 'center'
                            }}>
                                Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            <button
                                onClick={exportAsPNG}
                                style={{
                                    backgroundColor: '#ca8a04',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    width: '100%',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Export PNG
                            </button>

                            <button
                                onClick={exportAsPDF}
                                style={{
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    width: '100%',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div style={{ flex: 1, backgroundColor: '#020617', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '8px', 
                    padding: '24px', 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <canvas 
                        ref={canvasRef} 
                        style={{ 
                            border: '2px solid #374151', 
                            borderRadius: '8px', 
                            backgroundColor: 'white',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }} 
                    />
                </div>
            </div>
        </div>
    )
}

export default Landing