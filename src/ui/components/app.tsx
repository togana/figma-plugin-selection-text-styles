import { useEffect, useState } from 'react';
import type { SelectedTextNodeTable } from '../../code/selectedTextNode';
import { IconButton } from './icon-button';
import { TdText } from './td-text';
import { SelectIcon } from './select-icon';

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

  if (!Object.keys(table).length) {
    return <p>Select one or more TextNodes.</p>;
  }

  return (
    <table>
      <tbody>
        {Object.keys(table).map((key) => {
          const row = table[key];

          return (
            <tr>
              <TdText>{row.textStyleName}</TdText>
              <TdText>
                {row.fontFamily}/{row.fontStyle}
              </TdText>
              <TdText>
                {row.fontSize}/{row.lineHeight}/{row.letterSpacing}
              </TdText>
              <td>
                <IconButton onClick={() => selectTextNodes(table, key)}>
                  <SelectIcon />
                </IconButton>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
