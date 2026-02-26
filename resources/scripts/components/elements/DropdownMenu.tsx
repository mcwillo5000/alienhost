import React, { createRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    padding: 0.5rem;
    display: flex;
    align-items: center;
    border-radius: 0.375rem;
    width: 100%;
    background: transparent;
    color: var(--theme-text-base);
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 0.875rem;
    
    &:hover {
        ${(props: { danger?: boolean }) => 
            props.danger 
                ? `background: color-mix(in srgb, #ef4444 15%, var(--theme-background-secondary));
                   color: var(--theme-text-base);`
                : `background: color-mix(in srgb, var(--theme-primary) 15%, var(--theme-background-secondary));
                   color: var(--theme-text-base);`
        };
    }
`;

interface State {
    posX: number;
    posY: number;
    visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    menu = createRef<HTMLDivElement>();

    state: State = {
        posX: 0,
        posY: 0,
        visible: false,
    };

    componentWillUnmount() {
        this.removeListeners();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        const menu = this.menu.current;

        if (this.state.visible && !prevState.visible && menu) {
            document.addEventListener('click', this.windowListener);
            document.addEventListener('contextmenu', this.contextMenuListener);
            
            const menuRect = menu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            let left = this.state.posX - menuRect.width;
            if (left < 10) {
                left = this.state.posX + 10;
            }
            if (left + menuRect.width > viewportWidth - 10) {
                left = viewportWidth - menuRect.width - 10;
            }
            
            let top = this.state.posY;
            if (top + menuRect.height > viewportHeight - 10) {
                top = this.state.posY - menuRect.height;
            }
            if (top < 10) {
                top = 10;
            }
            
            menu.style.left = `${Math.round(left)}px`;
            menu.style.top = `${Math.round(top)}px`;
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
    };

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        this.triggerMenu(e.clientX, e.clientY);
    };

    contextMenuListener = () => this.setState({ visible: false });

    windowListener = (e: MouseEvent) => {
        const menu = this.menu.current;

        if (e.button === 2 || !this.state.visible || !menu) {
            return;
        }

        if (e.target === menu || menu.contains(e.target as Node)) {
            return;
        }

        if (e.target !== menu && !menu.contains(e.target as Node)) {
            this.setState({ visible: false });
        }
    };

    triggerMenu = (posX: number, posY?: number) =>
        this.setState((s) => ({
            posX: !s.visible ? posX : s.posX,
            posY: !s.visible ? (posY || 0) : s.posY,
            visible: !s.visible,
        }));

    render() {
        return (
            <div>
                {this.props.renderToggle(this.onClickHandler)}
                {ReactDOM.createPortal(
                    <Fade timeout={150} in={this.state.visible} unmountOnExit>
                        <div
                            ref={this.menu}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setState({ visible: false });
                            }}
                            className="fixed p-2 rounded-lg shadow-sm"
                            style={{ 
                                width: '12rem',
                                backgroundColor: 'var(--theme-background-secondary)',
                                border: '1px solid var(--theme-border)',
                                color: 'var(--theme-text-base)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                zIndex: 9999,
                            }}
                        >
                            {this.props.children}
                        </div>
                    </Fade>,
                    document.body
                )}
            </div>
        );
    }
}

export default DropdownMenu;
