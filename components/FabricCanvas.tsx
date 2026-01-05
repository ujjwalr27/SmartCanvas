'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Layout, LayoutElement } from '@/lib/types';

interface FabricCanvasProps {
    width: number;
    height: number;
    onCanvasReady?: (canvas: fabric.Canvas) => void;
    initialLayout?: Layout;
}

export default function FabricCanvas({
    width,
    height,
    onCanvasReady,
    initialLayout,
}: FabricCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize Fabric canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: initialLayout?.backgroundColor || '#ffffff',
            preserveObjectStacking: true, // Prevent selected object from jumping to front
        });

        fabricCanvasRef.current = canvas;

        // Make fabric available globally for the editor
        (window as any).fabric = fabric;

        // Load initial layout if provided
        if (initialLayout) {
            loadLayout(canvas, initialLayout);
        }

        // Notify parent component
        if (onCanvasReady) {
            onCanvasReady(canvas);
            console.log('Canvas ready and passed to parent');
        }

        return () => {
            canvas.dispose();
        };
    }, [width, height]);

    const loadLayout = (canvas: fabric.Canvas, layout: Layout) => {
        canvas.clear();
        canvas.setBackgroundColor(layout.backgroundColor || '#ffffff', () => {
            canvas.renderAll();
        });

        layout.elements.forEach((element) => {
            addElementToCanvas(canvas, element);
        });
    };

    const addElementToCanvas = (canvas: fabric.Canvas, element: LayoutElement) => {
        let fabricObject: fabric.Object | null = null;

        if (element.type === 'text') {
            fabricObject = new fabric.Text(element.content || 'Text', {
                left: element.x,
                top: element.y,
                width: element.width,
                fill: element.fill || '#000000',
                fontSize: element.fontSize || 16,
                fontFamily: element.fontFamily || 'Inter',
                fontWeight: element.fontWeight || 'normal',
                textAlign: element.textAlign || 'left',
            });
        } else if (element.type === 'shape') {
            fabricObject = new fabric.Rect({
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fill: element.fill || '#cccccc',
                opacity: element.opacity || 1,
            });
        } else if (element.type === 'image' && element.imageUrl) {
            fabric.Image.fromURL(
                element.imageUrl,
                (img) => {
                    img.set({
                        left: element.x,
                        top: element.y,
                        scaleX: element.width / (img.width || 1),
                        scaleY: element.height / (img.height || 1),
                    });
                    canvas.add(img);
                    canvas.renderAll();
                },
                { crossOrigin: 'anonymous' }
            );
            return;
        }

        if (fabricObject) {
            fabricObject.set({
                id: element.id,
                selectable: true,
                hasControls: true,
                hasBorders: true,
            } as any);

            canvas.add(fabricObject);
        }

        canvas.renderAll();
    };

    // Calculate scale to fit canvas in viewport
    // Use larger max values to ensure full canvas visibility
    const maxViewportWidth = Math.min(width, 1400);
    const maxViewportHeight = Math.min(height, 900);
    const scaleX = maxViewportWidth / width;
    const scaleY = maxViewportHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

    return (
        <div
            className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden shadow-lg bg-white"
            style={{
                width: width * scale,
                height: height * scale,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            />
        </div>
    );
}

export { fabric };
