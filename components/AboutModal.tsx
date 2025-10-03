import React from 'react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
                onClick={e => e.stopPropagation()} // Prevent click from closing modal
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    The Science of Sound
                </h2>

                <div className="space-y-6 text-base text-gray-300 leading-relaxed">
                     <p>
                        This soundscape is the culmination of over 35 years of personal meditation practice. It is a tool I use myself, designed to create a complex, oscillating audio environment based on principles of <strong>Sacred Geometry</strong> and resonant frequencies for a focused therapeutic experience.
                    </p>
                    <p className="font-semibold text-cyan-300 bg-cyan-900/30 p-3 rounded-lg border border-cyan-800/50">
                        For the most profound and effective experience, please use headphones. This ensures that the binaural beat frequencies are delivered correctly to each ear, which is essential for the cognitive entrainment effect.
                    </p>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">Inspiration: The Bentov Model & The Cosmic Torus</h3>
                        <p>
                            The core visual of the torus and the concept of a cyclical, breathing universe are deeply inspired by the work of consciousness researcher Itzhak Bentov, particularly his seminal book, <em className="italic">"Stalking the Wild Pendulum"</em>.
                        </p>
                        <p className="mt-2">
                            Bentov proposed a profound model of the universe, not as a singular event, but as a continuous, breathing cycle. From a state of absolute consciousness, or **Zero Point**, the universe expands outward in a "big bang," creating matter and experience. This expansion eventually contracts, falling back into a singularity to begin the cycle anew. The visualization in this application seeks to create an immersive echo of this universal, toroidal energy flow.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">The Schumann Resonance: Earth's Heartbeat</h3>
                        <p>
                            A core component of our soundscape is the <strong>Schumann Resonance</strong>, approximately <strong>7.83 Hz</strong>. This is the natural electromagnetic frequency of our planet, a resonance created between the Earth's surface and the ionosphere. Incredibly, our brains resonate at this same frequency in the Alpha/Theta states. By tuning into 7.83 Hz, we align our personal consciousness with the fundamental heartbeat of our planet.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">A Pure & Uncompressed Sonic Environment</h3>
                        <p>
                            The entire soundscape is generated in real-time within your browser, ensuring the highest possible audio fidelity. The core carrier tones are mathematically perfect sine waves—the purest form of sound—containing no unwanted harmonics or distortion. This is combined with algorithmically generated colored noise (White, Pink, Brown). This approach creates a clean and unobtrusive frequency clearance, where the therapeutic tones stand out distinctly against the immersive noise bed, free from the artifacts found in compressed audio files like MP3s. What you hear is a pure, direct, and uncompressed signal designed for maximum clarity and effect.
                        </p>
                    </div>

                     <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">The Audio Journey: A Three-Phase Sequence</h3>
                        <p>
                            The soundscape is carefully structured into three equal phases, each with a specific colored noise to guide your meditative journey. The session progresses as follows:
                        </p>
                        <ul className="list-decimal list-inside mt-2 space-y-2 pl-2">
                            <li><strong>Phase 1: White Noise:</strong> The journey begins with white noise, which contains all audible frequencies equally. This creates a sonic "blank slate," masking external distractions and helping to clear the mind for a state of focused awareness.</li>
                            <li><strong>Phase 2: Pink Noise:</strong> The sound then softens into pink noise. With its reduced high-frequency intensity, pink noise is more balanced, promoting sustained concentration and a state of calm immersion.</li>
                            <li><strong>Phase 3: Brown Noise:</strong> The final phase transitions to deep, rumbling brown noise. This grounding frequency is excellent for profound relaxation and can help guide you into a deeply meditative state, preparing you to return to your day with tranquility.</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">The Torus: Nature's Perfect Shape</h3>
                        <p>
                            The toroidal shape is one of the most fundamental forms in the universe. It is found in the magnetic field of planets and stars, and even in the energy field of the human heart, representing a self-sustaining, balanced system of energy flow. On a cosmic scale, as described by Itzhak Bentov, this same toroidal flow represents the continuous cycle of the universe itself, from creation to dissolution and back again.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-cyan-400 mb-2">Benefits of Frequency Healing</h3>
                        <p>
                            By immersing ourselves in these specific frequencies, we can experience profound benefits. The <strong>40 Hz</strong> preset, for instance, corresponds to frequencies being explored in neuro-regeneration programs for their cognitive benefits.
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                            <li><strong>Psychological:</strong> Entraining the brain can promote deep relaxation, reduce anxiety, and enhance focus.</li>
                            <li><strong>Physical:</strong> Sound vibrations can resonate with the body's cells and energy centers (chakras), helping to release tension.</li>
                            <li><strong>Universal:</strong> Tapping into these fundamental frequencies connects us to the underlying resonant patterns of the universe.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};