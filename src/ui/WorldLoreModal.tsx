interface WorldLoreModalProps {
    onClose: () => void;
}

export default function WorldLoreModal({ onClose }: WorldLoreModalProps) {
    return (
        <div className="absolute inset-0 flex items-start justify-center overflow-y-auto" style={{ background: 'rgba(0,0,0,0.94)', zIndex: 50 }}>
            <div className="w-full max-w-sm px-5 pt-10 pb-8">
                <div className="text-[0.65rem] font-bold tracking-widest mb-4" style={{ color: '#4a7a4c' }}>
                    CLASSIFICATION OVERVIEW
                </div>

                <h2 className="text-[1.4rem] font-bold tracking-widest text-white mb-1">THE TERRAS</h2>
                <div className="text-[0.72rem] font-bold tracking-wide mb-5" style={{ color: '#4ade80' }}>
                    Mutated Fauna, Post-Infection
                </div>

                <div className="space-y-5 text-[0.9rem] leading-relaxed" style={{ color: '#bcd4bd' }}>
                    <p>
                        At some point between the infrastructure failures and the quarantine orders,
                        the infection crossed the species barrier. Nobody documented when. Possibly nobody noticed.
                    </p>

                    <p>
                        Mammals were affected first -- rodents, ungulates, felines, canids. The infection
                        did not kill them. It changed them: skeletal reformation, enhanced senses,
                        altered behavior. Some became faster. Some became smarter. All became more dangerous.
                    </p>

                    <p>
                        What the final field reports described, before documentation stopped, was something
                        no classification system had anticipated.
                    </p>

                    <p>
                        Field researchers began using the term <span style={{ color: '#7ccf5a' }}>Terras</span> -- shorthand
                        for the Latin designation Terrae mutandis, meaning "those changed by the earth."
                        It stuck. The alternative names were worse.
                    </p>

                    <p style={{ color: '#6a8e6c' }}>
                        The full scope of what the infection produced is not documented in any single source.
                        Find documents and survive encounters in the ruins to build your Field Codex.
                    </p>
                </div>

                <button
                    type="button"
                    className="mt-8 w-full rounded py-3 text-[0.95rem] font-bold tracking-wide transition-transform active:scale-95"
                    style={{ background: '#0e2010', color: '#7ccf5a', border: '1px solid #2c4a2e' }}
                    onClick={onClose}
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
}
