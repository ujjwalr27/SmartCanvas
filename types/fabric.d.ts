declare module 'fabric' {
    export const fabric: typeof import('fabric').fabric;
}

declare namespace fabric {
    class Canvas {
        constructor(element: HTMLCanvasElement | string | null, options?: any);
        add(...objects: any[]): Canvas;
        remove(...objects: any[]): Canvas;
        renderAll(): Canvas;
        setActiveObject(object: any): Canvas;
        getActiveObject(): any;
        discardActiveObject(): Canvas;
        toJSON(propertiesToInclude?: string[]): any;
        toDataURL(options?: any): string;
        loadFromJSON(json: any, callback?: () => void): Canvas;
        on(event: string, handler: (e: any) => void): Canvas;
        off(event: string, handler?: (e: any) => void): Canvas;
        getObjects(): any[];
        bringForward(object: any): Canvas;
        sendBackwards(object: any): Canvas;
        getContext(): any;
        dispose(): void;
        setWidth(value: number): Canvas;
        setHeight(value: number): Canvas;
        setZoom(value: number): Canvas;
        getZoom(): number;
        setBackgroundColor(color: string, callback?: () => void): Canvas;
        clear(): Canvas;
    }

    class Object {
        set(key: string | object, value?: any): Object;
        get(key: string): any;
        scale(value: number): Object;
        scaleX: number;
        scaleY: number;
        left: number;
        top: number;
        width: number;
        height: number;
        fill: string;
        opacity: number;
        type: string;
    }

    class Rect extends Object {
        constructor(options?: any);
    }

    class Circle extends Object {
        constructor(options?: any);
        radius: number;
    }

    class IText extends Object {
        constructor(text: string, options?: any);
        text: string;
        fontSize: number;
        fontFamily: string;
        charSpacing: number;
        textAlign: string;
    }

    class Text extends IText {
        constructor(text: string, options?: any);
    }

    class Image extends Object {
        constructor(element: HTMLImageElement, options?: any);
        static fromURL(url: string, callback: (img: Image) => void, options?: any): void;
    }

    class Group extends Object {
        constructor(objects?: Object[], options?: any);
    }
}
