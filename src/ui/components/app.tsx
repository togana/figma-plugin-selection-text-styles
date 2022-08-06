import { useEffect } from 'react';

export const App = () => {
  useEffect(() => {
    window.onmessage = (event: {
      data: { pluginMessage: { type: 'init'; message: string } };
    }) => {
      const pluginMessage = event.data.pluginMessage;
      switch (pluginMessage.type) {
        case 'init':
          console.log('plugin init', pluginMessage.message);
          break;
      }
    };
  }, []);

  return (
    <div>
      <h2>selection text styles</h2>
    </div>
  );
};
