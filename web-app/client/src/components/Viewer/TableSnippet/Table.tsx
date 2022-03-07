/* eslint-disable react/no-array-index-key */
import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { Container } from "react-bootstrap";

import stringToColor from "../../../functions/stringToColor";

const StyledContainer = styled(Container)`
  height: 70vh;
`;

const TableHeader = styled.thead`
  tr {
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      z-index: 1;
    }

    &:first-of-type {
      th:first-of-type {
        border-top-left-radius: 2rem;
      }
      th:last-of-type {
        border-top-right-radius: 2rem;
      }
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    &:last-of-type {
      td:first-of-type {
        border-bottom-left-radius: 1rem;
      }
      td:last-of-type {
        border-bottom-right-radius: 1rem;
      }
    }
  }
`;

const StyledTable = styled.table`
  border-collapse: separate;
  th,
  td {
    transition: 0.15s;
  }
`;

const HeaderBackground = styled.div`
  z-index: 1;
  height: 2rem;
`;

interface Props {
  header: string[];
  rows: string[][];
  colorizedColumns: number[];
  showUncolorizedColumns?: boolean;
  className?: string;
}

const Table: React.FC<Props> = ({
  header,
  rows,
  colorizedColumns,
  showUncolorizedColumns = true,
  className = "",
}) => {
  const [headerWidth, setHeaderWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const changeWidth = useCallback((node: HTMLDivElement) => {
    if (node) {
      setHeaderWidth(node.clientWidth);
    }
  }, []);

  const changeHeight = useCallback((node: HTMLTableRowElement) => {
    if (node) {
      setHeaderHeight(node.clientHeight);
    }
  }, []);

  const uncolorizedColumns = [...Array(header.length)]
    .map((_, index) => index)
    .filter((index) => !colorizedColumns.includes(index));

  const headerClassName =
    "px-4 py-3 text-white text-nowrap text-center position-relative";
  const bodyClassName = "text-center py-1 px-2";

  return (
    <StyledContainer
      fluid
      className="w-100 px-0 overflow-auto snippet-container flex-grow-1 my-2"
      ref={changeWidth}
    >
      <StyledTable className={className}>
        <HeaderBackground
          className="position-absolute bg-light"
          style={{
            width: headerWidth,
            transform: `translateY(-${headerHeight + 6}px`,
          }}
        />
        <TableHeader className="bg-light position-relative">
          <tr className="bg-light" ref={changeHeight}>
            {colorizedColumns.map((index) => (
              <th
                key={header[index]}
                className={headerClassName}
                style={{
                  backgroundColor: stringToColor(header[index], 60, 70),
                }}
              >
                {header[index]}
              </th>
            ))}
            {showUncolorizedColumns &&
              uncolorizedColumns.map((index) => (
                <th
                  key={header[index]}
                  className={headerClassName}
                  style={{
                    backgroundColor: "#17151a",
                  }}
                >
                  {header[index]}
                </th>
              ))}
          </tr>
        </TableHeader>

        <TableBody>
          {rows.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className="position-relative">
              {colorizedColumns.map((index) => (
                <td
                  key={index}
                  className={bodyClassName}
                  style={{
                    backgroundColor: stringToColor(
                      header[index],
                      15,
                      rowIndex % 2 ? 80 : 90
                    ),
                  }}
                >
                  {row[index]}
                </td>
              ))}
              {showUncolorizedColumns &&
                uncolorizedColumns.map((index) => (
                  <td
                    key={index}
                    className={bodyClassName}
                    style={{
                      backgroundColor: stringToColor(
                        header[index],
                        0,
                        rowIndex % 2 ? 80 : 90
                      ),
                    }}
                  >
                    {row[index]}
                  </td>
                ))}
            </tr>
          ))}
        </TableBody>
      </StyledTable>
    </StyledContainer>
  );
};

export default Table;
