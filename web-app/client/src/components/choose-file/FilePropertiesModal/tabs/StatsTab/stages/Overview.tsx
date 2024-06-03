import { FC } from 'react';
import { Table } from '@components/common/uikit/FileStats/Table';
import { getFileStats_datasetInfo } from '@graphql/operations/queries/__generated__/getFileStats';
import { getOverview } from '@utils/fileStats';

type OverviewProps = {
  datasetInfo: getFileStats_datasetInfo;
};

export const Overview: FC<OverviewProps> = ({ datasetInfo }: OverviewProps) => (
  <Table>
    <tbody>
      {getOverview(datasetInfo).map((item) => (
        <tr key={item.name}>
          <th>{item.name}</th>
          <td>{item.value}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);
