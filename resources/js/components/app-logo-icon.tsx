import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/favicon_io/apple-touch-icon.png"
            alt="App Logo"
        />
    );
}
