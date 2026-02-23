import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { ButtonProps, Options } from '@/components/elements/button/types';
import styles from './style.module.css';
import { useBleeps } from '@/components/RivionBleepsProvider';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, shape, size, variant, className, onClick, ...rest }, ref) => {
        const bleeps = useBleeps();
        
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            bleeps.click?.play();
            onClick?.(e);
        };
        
        return (
            <button
                ref={ref}
                className={classNames(
                    styles.button,
                    styles.primary,
                    {
                        [styles.secondary]: variant === Options.Variant.Secondary,
                        [styles.start]: variant === Options.Variant.Start,
                        [styles.restart]: variant === Options.Variant.Restart,
                        [styles.stop]: variant === Options.Variant.Stop,
                        [styles.kill]: variant === Options.Variant.Kill,
                        [styles.square]: shape === Options.Shape.IconSquare,
                        [styles.small]: size === Options.Size.Small,
                        [styles.compact]: size === Options.Size.Compact,
                        [styles.large]: size === Options.Size.Large,
                    },
                    className
                )}
                onClick={handleClick}
                {...rest}
            >
                {children}
            </button>
        );
    }
);

const TextButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
    
    <Button ref={ref} className={classNames(styles.text, className)} {...props} />
));

const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
    
    <Button ref={ref} className={classNames(styles.danger, className)} {...props} />
));

const _Button = Object.assign(Button, {
    Sizes: Options.Size,
    Shapes: Options.Shape,
    Variants: Options.Variant,
    Text: TextButton,
    Danger: DangerButton,
});

export default _Button;
