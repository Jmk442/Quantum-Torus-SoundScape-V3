import React from 'react';
import { logoSrc } from '../assets/logo.png.ts';

interface SpiralStudiosModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SpiralStudiosModal: React.FC<SpiralStudiosModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="w-full max-w-2xl max-h-[90vh] bg-gray-900/80 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 text-gray-300 p-6 md:p-8 relative overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <div className="flex flex-col items-center mb-6">
                    <img src={logoSrc} alt="Spiral Studios Logo" className="w-24 h-24 mb-4" />
                    <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        About Spiral Studios · Quantum Soundscape
                    </h2>
                </div>

                <div className="space-y-6 text-base text-gray-300 leading-relaxed">
                    <p>
                        Spiral Studios builds creative tools at the meeting point of sound, story, and healing. Quantum Soundscape is our flagship audio environment—born from lived experience with acquired brain injury (ABI), shaped by trauma-aware practices, and designed with accessibility at its core.
                    </p>
                    <p>
                        This project isn’t just an app; it’s a space. Frequencies, rhythms, and visual layers come together to create immersive soundscapes that invite calm, focus, and self-exploration. Every element has been considered for inclusivity—whether through adaptive design, simplified controls, or sensory-friendly modes—so that anyone can engage at their own pace.
                    </p>
                    <p>
                        Right now, Quantum Soundscape is a tester—just a placeholder portal for our landing page. A full series of Spiral Studios apps will be rolling out soon, each carrying the same commitment to inclusivity, accessibility, and trauma-aware design.
                    </p>
                    <p>
                        If you’ve stumbled in here: welcome. You’ll be hearing much more from us very soon.
                    </p>
                </div>
            </div>
        </div>
    );
};