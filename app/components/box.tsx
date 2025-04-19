'use client';

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

interface BoxProps {
    fetchComponent: () => Promise<React.ReactNode>;
}

let isBoxVisible = false;
let isCloseDisabled = false;

export const BoxManager = {
    show: async (fetchComponent: () => Promise<React.ReactNode>) => {
        const boxes = document.querySelectorAll('#box');
        if (boxes.length === 0) {
            isBoxVisible = false;
        }
        if (isBoxVisible) return;
        isBoxVisible = true;

        const container = document.createElement('div');
        document.body.appendChild(container);

        container.id = 'box';
        const root = ReactDOM.createRoot(container as HTMLElement);

        const close = () => {
            root.unmount();
            document.body.removeChild(container);
            isBoxVisible = false;
        };

        root.render(
            <Box fetchComponent={fetchComponent} />
        );

        return close;
    },
    disableclose: () => {
        isCloseDisabled = true;
        const boxes = document.querySelectorAll('#box');
        if (boxes.length > 0) {
            boxes.forEach((box) => {
                const closeButton = box.querySelector('#close-box-button');
                if (closeButton) {
                    closeButton.remove();
                }
            });
        }
        const overlays = document.querySelectorAll('#box-overlay');
        if (overlays.length > 0) {
            overlays.forEach((overlay) => {
                (overlay as HTMLElement).onclick = null;
            });
        }
    },
    enableclose: () => {
        isCloseDisabled = false;
        const boxes = document.querySelectorAll('#box');
        if (boxes.length > 0) {
            boxes.forEach((box) => {
                const overlay = box.querySelector('#box-overlay') as HTMLElement;
                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        const closeEvent = new Event('closeBox');
                        document.dispatchEvent(closeEvent);
                    }
                };
                const innerbox = box.querySelector('#inner-box');
                const closeButton = document.createElement('button');
                closeButton.id = 'close-box-button';
                closeButton.innerText = '✖';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.background = 'transparent';
                closeButton.style.border = 'none';
                closeButton.style.fontSize = '16px';
                closeButton.style.cursor = 'pointer';
                closeButton.onclick = () => {
                    const closeEvent = new Event('closeBox');
                    document.dispatchEvent(closeEvent);
                };
                if (innerbox) {
                    const otherclosebuttons = box.querySelectorAll('#close-box-button');
                    otherclosebuttons.forEach(element => {
                        element.remove();
                    });
                    innerbox.appendChild(closeButton);
                }
            });
        }
    },
};

const Box: React.FC<BoxProps> = ({ fetchComponent }) => {
    const [content, setContent] = useState<React.ReactNode>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        const loadContent = async () => {
            const component = await fetchComponent();
            setContent(component);
        };

        loadContent();
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
            const interval = setInterval(() => {
                loadContent();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [fetchComponent, updateKey]);

    useEffect(() => {
        if (content) {
            setTimeout(() => setIsVisible(true), 10);
        }
    }, [content]);

    useEffect(() => {
        const magictrick = () => {
            closeBox();
        };
        document.addEventListener('closeBox', magictrick);
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && (window as any).__NEXT_HMR_CB) {
            const originalCallback = (window as any).__NEXT_HMR_CB;
            (window as any).__NEXT_HMR_CB = (...args: any) => {
                originalCallback(...args);
                setUpdateKey(prev => prev + 1);
            };
        }
        return () => {
            document.removeEventListener('closeBox', magictrick);
        };
    }, []);

    const closeBox = () => {
        if (isCloseDisabled) return;
        setIsVisible(false);
        setTimeout(() => {
            isBoxVisible = false;
            const boxes = document.querySelectorAll('#box');
            if (boxes.length > 0) {
                boxes.forEach((box) => {
                    box.remove();
                });
            }
        }, 300);
    };

    return (
        <>
            {content && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        opacity: isVisible ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                    onClick={() => {
                        if (isCloseDisabled) return;
                        const closeEvent = new Event('closeBox');
                        document.dispatchEvent(closeEvent);
                    }}
                    id="box-overlay"
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '50%',
                            height: '50%',
                            backgroundColor: '#333',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden',
                            animation: isVisible
                                ? 'fadeIn 0.3s ease forwards'
                                : 'fadeOut 0.3s ease forwards',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        id="inner-box"
                    >
                        <button
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: isCloseDisabled ? 'none' : 'block',
                            }}
                            onClick={() => {
                                if (isCloseDisabled) return;
                                const closeEvent = new Event('closeBox');
                                document.dispatchEvent(closeEvent);
                            }}
                            id="close-box-button"
                        >
                            ✖
                        </button>
                        <div style={{ padding: '16px' }}>{content}</div>
                    </div>
                    <style>{`
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(-100px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }

                        @keyframes fadeOut {
                            from {
                                opacity: 1;
                                transform: translateY(0);
                            }
                            to {
                                opacity: 0;
                                transform: translateY(100px);
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
};

export default Box;