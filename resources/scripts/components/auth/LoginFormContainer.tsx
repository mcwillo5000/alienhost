import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    width: 100%;
    
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-8`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 700px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        {title && (
            <h2 
                css={tw`text-3xl text-center font-medium py-4`}
                style={{ color: 'var(--theme-text-base)' }}
            >
                {title}
            </h2>
        )}
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <Form {...props} ref={ref}>
            <div 
                css={tw`w-full`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}
            >
                {props.children}
            </div>
        </Form>
        <p 
            css={tw`text-center text-xs mt-4`}
            style={{ color: 'var(--theme-text-muted)' }}
        >
            &copy; 2015 - {new Date().getFullYear()}&nbsp;
            <a
                rel={'noopener nofollow noreferrer'}
                href={'https://pterodactyl.io'}
                target={'_blank'}
                css={tw`no-underline hover:underline transition-colors duration-200`}
                style={{ 
                    color: 'var(--theme-text-muted)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-text-base)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-muted)'}
            >
                Pterodactyl Software
            </a>
        </p>
    </Container>
));