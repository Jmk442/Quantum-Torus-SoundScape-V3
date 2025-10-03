import React, { useRef, useEffect } from 'react';
import type { AppStatus, ChakraPreset } from '../types.ts';

interface VisualizationProps {
    isPlaying: boolean;
    analyserNode: AnalyserNode | null;
    selectedPreset?: ChakraPreset;
    status: AppStatus;
    torusSpeed: number;
    backgroundSpeed: number;
}

interface TorusParticle {
    theta: number; // Angle around the major radius
    phi: number;   // Angle around the minor radius
    speedTheta: number; // Speed of revolution
    speedPhi: number;   // Speed of rotation around the tube
    trailFactor: number; // 0 for long/faint (slow), 1 for short/pronounced (fast)
}

interface GalaxyParticle {
    angle: number; 
    radius: number; // normalized radius 0 to 1
    layer: number; // 0, 1, or 2 for depth
    speed: number;
}

const chakraColors: Record<string, [number, number]> = {
    'sub-bass': [350, 10],   // Deep reds
    'root': [0, 20],         // Red
    'sacral': [25, 45],       // Orange
    'solar': [50, 65],        // Yellow
    'heart': [120, 150],      // Green to Teal
    'throat': [180, 210],     // Cyan to Light Blue
    'third-eye': [230, 260],  // Blue to Indigo
    'crown': [270, 300],      // Violet to Magenta
    'soul-star': [300, 330],   // Magenta
    'spirit': [270, 330],       // Violet to Magenta gradient
    'universal': [240, 300],    // Indigo to Magenta gradient
    'galactic': [210, 270],      // Blue to Violet gradient
    'divine-gateway': [200, 320], // A wider rainbow spectrum for the divine
};

export const Visualization: React.FC<VisualizationProps> = ({ isPlaying, analyserNode, selectedPreset, status, torusSpeed, backgroundSpeed }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>(0);
    const torusParticlesRef = useRef<TorusParticle[]>([]);
    const galaxyParticlesRef = useRef<GalaxyParticle[]>([]);
    
    const isPlayingRef = useRef(isPlaying);
    const rotationRef = useRef({ x: 0, y: 0, z: 0 });
    const selectedPresetRef = useRef(selectedPreset);
    const statusRef = useRef(status);
    const torusSpeedRef = useRef(torusSpeed);
    const backgroundSpeedRef = useRef(backgroundSpeed);

    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { selectedPresetRef.current = selectedPreset; }, [selectedPreset]);
    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { torusSpeedRef.current = torusSpeed; }, [torusSpeed]);
    useEffect(() => { backgroundSpeedRef.current = backgroundSpeed; }, [backgroundSpeed]);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !analyserNode) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        let currentWidth = 0;
        let currentHeight = 0;
        
        const initializeTorusParticles = () => {
            torusParticlesRef.current = Array.from({ length: 800 }, () => {
                const speedTheta = (Math.random() - 0.5) * 0.01;
                const speedPhi = (Math.random() - 0.5) * 0.02;
                const trailFactor = Math.min(Math.abs(speedTheta) / 0.005, 1.0);

                return {
                    theta: Math.random() * Math.PI * 2,
                    phi: Math.random() * Math.PI * 2,
                    speedTheta,
                    speedPhi,
                    trailFactor,
                };
            });
        };

        const initializeGalaxyParticles = () => {
            galaxyParticlesRef.current = Array.from({ length: 2000 }, () => {
                const layer = Math.floor(Math.random() * 3);
                return {
                    angle: Math.random() * Math.PI * 2,
                    radius: Math.random(), 
                    layer,
                    speed: (0.0001 + Math.random() * 0.0002) * (3 - layer) // Closer layers move faster
                };
            });
        };
        
        const drawGalacticBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, elapsedTime: number) => {
            const preset = selectedPresetRef.current;
            const [startHue, endHue] = preset ? chakraColors[preset.id] || [200, 260] : [200, 260];
            const baseHue = (startHue + endHue) / 2;
            
            const centerX = width / 2;
            const centerY = height / 2;

            // The tilt of the galactic plane now uses a slow, time-based oscillation
            const tiltAngle = (Math.PI / 2.5) + (Math.sin(elapsedTime * 0.1) * 0.1); // Slow, gentle oscillation
            const cosTilt = Math.cos(tiltAngle);

            // Time-based color oscillation
            const colorOscillation = Math.sin(elapsedTime * 1.5); // A sine wave from -1 to 1 for a smooth pulse
            const hueShift = colorOscillation * 30; // Oscillates between -30 and +30 degrees of hue

            galaxyParticlesRef.current.forEach(p => {
                const layerDepth = p.layer + 1; // 1, 2, or 3
                const perspectiveScale = 1 / (layerDepth * 0.5 + 0.5); // Further layers are smaller
                
                const currentMaxRadius = Math.max(width, height) * 0.8;
                const r = p.radius * currentMaxRadius;
                
                // 2D projection of a tilted 3D point
                const px = centerX + Math.cos(p.angle) * r;
                const py = centerY + Math.sin(p.angle) * r * cosTilt; // Apply tilt
                
                const hue = (baseHue + hueShift + 360) % 360;
                const saturation = 90;
                const lightness = 50 + p.radius * 20;
                const alpha = 0.3 * perspectiveScale * (p.radius * 0.5 + 0.5);

                ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
                
                const lineLength = (3 + p.radius * 3) * perspectiveScale;
                const endX = centerX + Math.cos(p.angle) * (r + lineLength);
                const endY = centerY + Math.sin(p.angle) * (r + lineLength) * cosTilt; // Apply tilt to end point

                ctx.lineWidth = (0.5 + p.radius * 1) * perspectiveScale;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            });
        };

        const draw = () => {
            animationFrameId.current = requestAnimationFrame(draw);
            
            if (!isPlayingRef.current) {
                ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
                ctx.fillRect(0, 0, currentWidth, currentHeight);
                return;
            }

            analyserNode.getByteFrequencyData(dataArray);

            let sumSquares = 0;
            for(const value of dataArray) {
                const normalizedValue = value / 255.0;
                sumSquares += normalizedValue * normalizedValue;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);
            const visualIntensity = Math.min(rms * 5, 1.0);
            
            ctx.fillStyle = 'rgba(17, 24, 39, 0.15)';
            ctx.fillRect(0, 0, currentWidth, currentHeight);

            const elapsedTime = statusRef.current.elapsedTime;
            
            // Update and draw the background
            galaxyParticlesRef.current.forEach(p => {
                p.radius += p.speed * backgroundSpeedRef.current;
                // Recycle particle if it goes off screen
                if (p.radius > 1.0) {
                    p.radius = Math.random() * 0.05; // Reset near the center
                    p.angle = Math.random() * Math.PI * 2;
                }
            });
            drawGalacticBackground(ctx, currentWidth, currentHeight, elapsedTime);
            
            if (torusParticlesRef.current.length === 0 && currentWidth > 0) {
                 initializeTorusParticles();
                 initializeGalaxyParticles();
            }

            const centerX = currentWidth / 2;
            const centerY = currentHeight / 2;

            const majorRadius = currentHeight * 0.25;
            const baseMinorRadius = currentHeight * 0.08;
            const pulsatingMinorRadius = baseMinorRadius + visualIntensity * baseMinorRadius * 0.8;

            const torusSpeed = torusSpeedRef.current;
            rotationRef.current.x += 0.0005 * torusSpeed;
            rotationRef.current.y += 0.0008 * torusSpeed;
            rotationRef.current.z += 0.0017 * torusSpeed;

            const cosX = Math.cos(rotationRef.current.x);
            const sinX = Math.sin(rotationRef.current.x);
            const cosY = Math.cos(rotationRef.current.y);
            const sinY = Math.sin(rotationRef.current.y);
            const cosZ = Math.cos(rotationRef.current.z);
            const sinZ = Math.sin(rotationRef.current.z);
            
            const fov = currentWidth * 0.8;

            const defaultHueRange: [number, number] = [200, 260];
            const currentPreset = selectedPresetRef.current;
            const colorRange = currentPreset && currentPreset.id in chakraColors ? chakraColors[currentPreset.id] : defaultHueRange;
            const [startHue, endHue] = colorRange;
            const hueSpan = endHue >= startHue ? endHue - startHue : (360 - startHue) + endHue;
            const zBeatFreq = statusRef.current.zBeatFreq;

            torusParticlesRef.current.forEach(p => {
                p.theta += (p.speedTheta + visualIntensity * 0.005) * torusSpeed;
                p.phi += p.speedPhi * torusSpeed;

                const rCosPhi = pulsatingMinorRadius * Math.cos(p.phi);
                let x = (majorRadius + rCosPhi) * Math.cos(p.theta);
                let y = (majorRadius + rCosPhi) * Math.sin(p.theta);
                let z = pulsatingMinorRadius * Math.sin(p.phi);

                const tempX1 = x * cosZ - y * sinZ;
                const tempY1 = x * sinZ + y * cosZ;
                x = tempX1;
                y = tempY1;

                const tempZ1 = z * cosY - x * sinY;
                const tempX2 = z * sinY + x * cosY;
                z = tempZ1;
                x = tempX2;

                const tempY2 = y * cosX - z * sinX;
                const tempZ2 = y * sinX + z * cosX;
                y = tempY2;
                z = tempZ2;

                const perspective = fov / (fov + z);
                const screenX = centerX + x * perspective;
                const screenY = centerY + y * perspective;
                
                const baseSize = (1 + visualIntensity) * perspective * 1.5;
                const size = baseSize * (0.7 + p.trailFactor * 0.8);
                const baseOpacity = Math.max(0.1, perspective * 0.8);
                const opacity = baseOpacity * (0.8 + p.trailFactor * 0.5);
                
                const zHighlightFactor = Math.sin(p.phi * 8 + zBeatFreq * 5);
                let particleFillStyle: string;

                if (zHighlightFactor > 0.9) {
                    const highlightLightness = 80 + visualIntensity * 15;
                    particleFillStyle = `hsla(50, 100%, ${highlightLightness}%, ${opacity})`;
                } else {
                    const normalizedTheta = (p.theta % (Math.PI * 2)) / (Math.PI * 2);
                    const hue = (startHue + (normalizedTheta * hueSpan)) % 360;
                    const baseLightness = 60 + visualIntensity * 20;
                    
                    // Add glow effect for particles passing through the center hole
                    // (1 - cos(phi)) / 2 maps cos(phi) from [1, -1] to [0, 1], peaking at phi=PI (inner edge)
                    const glowFactor = (1 - Math.cos(p.phi)) / 2; 
                    const finalLightness = baseLightness + glowFactor * 25; // Add up to 25% brightness
                    
                    particleFillStyle = `hsla(${hue}, 100%, ${finalLightness}%, ${opacity})`;
                }
                
                ctx.beginPath();
                ctx.arc(screenX, screenY, Math.max(0.1, size), 0, Math.PI * 2);
                ctx.fillStyle = particleFillStyle;
                ctx.fill();
            });
        };

        const resizeObserver = new ResizeObserver(entries => {
            if (!entries || entries.length === 0) return;
            const { width, height } = entries[0].contentRect;
            
            // By wrapping the resize logic in requestAnimationFrame, we avoid a synchronous loop
            // where updating the canvas size immediately triggers another resize notification.
            requestAnimationFrame(() => {
                if (currentWidth !== width || currentHeight !== height) {
                    currentWidth = width;
                    currentHeight = height;

                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    if (!canvas || !ctx) return;

                    canvas.width = width * window.devicePixelRatio;
                    canvas.height = height * window.devicePixelRatio;
                    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

                    initializeTorusParticles();
                    initializeGalaxyParticles();
                }
            });
        });
        
        resizeObserver.observe(canvas);
        draw();

        return () => {
            resizeObserver.unobserve(canvas);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [analyserNode]);

    return <canvas ref={canvasRef} className="w-full h-full"></canvas>;
};