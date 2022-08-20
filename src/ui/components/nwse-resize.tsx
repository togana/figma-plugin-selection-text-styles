import { PointerEvent as ReactPointerEvent } from 'react';
import styled from 'styled-components';

const NwseResizeStyle = styled.div`
  position: absolute;
  right: 1px;
  bottom: 2px;
  cursor: nwse-resize;
`;

const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.onpointermove = (e: PointerEvent) => {
    const size = {
      w: Math.max(250, Math.floor(e.clientX + 5)),
      h: Math.max(250, Math.floor(e.clientY + 5)),
    };
    parent.postMessage({ pluginMessage: { type: 'resize', size: size } }, '*');
  };
};

const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
  e.currentTarget.releasePointerCapture(e.pointerId);
  e.currentTarget.onpointermove = null;
};

const NwseResizeSvg = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 0V16H0L16 0Z" fill="white" />
    <path d="M6.22577 16H3L16 3V6.22576L6.22577 16Z" fill="#8C8C8C" />
    <path
      d="M11.8602 16H8.63441L16 8.63441V11.8602L11.8602 16Z"
      fill="#8C8C8C"
    />
  </svg>
);

export const NwseResize = () => (
  <NwseResizeStyle onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
    <NwseResizeSvg />
  </NwseResizeStyle>
);
