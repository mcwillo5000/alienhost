import React, { useEffect, useState } from 'react';
import Fade from '@/components/elements/Fade';
import Portal from '@/components/elements/Portal';
import copy from 'copy-to-clipboard';
import classNames from 'classnames';

// Module-level reference to dismiss the currently visible notification
// before showing a new one, preventing stacking.
let dismissCurrent: (() => void) | null = null;

interface CopyOnClickProps {
    text: string | number | null | undefined;
    showInNotification?: boolean;
    children: React.ReactNode;
}

const CopyOnClick = ({ text, showInNotification = true, children }: CopyOnClickProps) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;

        const timeout = setTimeout(() => {
            setCopied(false);
            if (dismissCurrent === dismiss) {
                dismissCurrent = null;
            }
        }, 2500);

        const dismiss = () => {
            clearTimeout(timeout);
            setCopied(false);
        };

        dismissCurrent = dismiss;

        return () => {
            clearTimeout(timeout);
        };
    }, [copied]);

    if (!React.isValidElement(children)) {
        throw new Error('Component passed to <CopyOnClick/> must be a valid React element.');
    }

    const child = !text
        ? React.Children.only(children)
        : React.cloneElement(React.Children.only(children), {
              className: classNames(children.props.className || '', 'cursor-pointer'),
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                  if (dismissCurrent) {
                      dismissCurrent();
                      dismissCurrent = null;
                  }
                  copy(String(text));
                  setCopied(true);
                  if (typeof children.props.onClick === 'function') {
                      children.props.onClick(e);
                  }
              },
          });

    return (
        <>
            {copied && (
                <Portal>
                    <Fade in appear timeout={250} key={copied ? 'visible' : 'invisible'}>
                        <div className={'fixed z-50 bottom-0 right-0 m-4'}>
                            <div 
                                className={'rounded-md py-3 px-4 shadow-lg border'}
                                style={{
                                    backgroundColor: 'var(--theme-background-secondary)',
                                    color: 'var(--theme-text-base)',
                                    borderColor: 'var(--theme-border)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <p>
                                    {showInNotification
                                        ? `Copied "${String(text)}" to clipboard.`
                                        : 'Copied text to clipboard.'}
                                </p>
                            </div>
                        </div>
                    </Fade>
                </Portal>
            )}
            {child}
        </>
    );
};

export default CopyOnClick;
