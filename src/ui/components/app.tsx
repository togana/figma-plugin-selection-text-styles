import { useEffect, useState } from 'react';
import type { SelectedTextNodeTable } from '../../code/selectedTextNode';

export const App = () => {
  const [table, setTable] = useState<SelectedTextNodeTable>({});
  useEffect(() => {
    window.onmessage = (event: {
      data: {
        pluginMessage: {
          type: 'init';
          table: SelectedTextNodeTable;
        };
      };
    }) => {
      const pluginMessage = event.data.pluginMessage;
      switch (pluginMessage.type) {
        case 'init':
          setTable(pluginMessage.table);
          break;
      }
    };
  }, []);

  const selectTextNodes = (table: SelectedTextNodeTable, key: string) => {
    parent.postMessage(
      { pluginMessage: { type: 'select-text-node', table, key } },
      '*'
    );
  };

  return (
    <div>
      <h2>selection text styles</h2>
      <table>
        <thead>
          <tr>
            <th>styleName</th>
            <th>fontSize</th>
            <th>lineHeight</th>
            <th>action</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(table).map((key) => {
            const row = table[key];

            return (
              <tr>
                <td>{row.textStyleName}</td>
                <td>{row.fontSize}</td>
                <td>{row.lineHeight}</td>
                <td>
                  <button onClick={() => selectTextNodes(table, key)}>
                    select
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
