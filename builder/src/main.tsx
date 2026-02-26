import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from '@citi-icg-172888/icgds-react';
import App from './App';
import './builder.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ConfigProvider>
            <App />
        </ConfigProvider>
    </StrictMode>,
);
