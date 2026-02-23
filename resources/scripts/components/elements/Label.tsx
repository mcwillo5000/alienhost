import styled from 'styled-components/macro';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-xs uppercase mb-1 sm:mb-2 font-semibold`};
    color: var(--theme-text-base);
    ${(props) => props.isLight && 'color: var(--theme-text-base);'};
`;

export default Label;
