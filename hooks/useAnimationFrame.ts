import { useRef, useEffect } from 'react';

export const useAnimationFrame = (isRunning: boolean, callback: (deltaTime: number) => void) => {
    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const animate = (time: number) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = (time - previousTimeRef.current) / 1000; // convert to seconds
                callback(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        if (isRunning) {
            previousTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                previousTimeRef.current = undefined;
            }
        };
    }, [isRunning, callback]);
};
