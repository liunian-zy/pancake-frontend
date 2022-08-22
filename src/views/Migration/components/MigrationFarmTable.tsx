import React, { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Spinner, RowType } from '@pancakeswap/uikit'
import TableHeader from './MigrationTable/TableHeader'
import EmptyText from './MigrationTable/EmptyText'
import TableStyle from './MigrationTable/StyledTable'
import Row, { RowProps } from './MigrationStep2/NewFarm/FarmRow'
import { FarmWithStakedValue } from '../../Farms/components/types'
import { getDisplayApr } from '../../Farms/components/getDisplayApr'
import { getBalanceNumber } from '../../../utils/formatBalance'
import { ColumnsDefTypes } from './types'

const Container = styled.div`
  overflow: hidden;
  margin-bottom: 32px;
  border-radius: 24px 24px 16px 16px;
  background-color: ${({ theme }) => theme.colors.disabled};
  padding: 1px 1px 3px 1px;
`

export interface ITableProps {
  title: string
  noStakedFarmText: string
  account: string
  cakePrice: BigNumber
  columnSchema: ColumnsDefTypes[]
  farms: FarmWithStakedValue[]
  userDataReady: boolean
  sortColumn?: string
}

const MigrationFarmTable: React.FC<React.PropsWithChildren<ITableProps>> = ({
  title,
  noStakedFarmText,
  account,
  cakePrice,
  columnSchema,
  farms,
  userDataReady,
}) => {
  const { t } = useTranslation()

  const rowData = farms.map((farm) => {
    const { token, quoteToken } = farm
    const tokenAddress = token.address
    const quoteTokenAddress = quoteToken.address
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')

    const row: RowProps = {
      apr: {
        value: getDisplayApr(farm.apr, farm.lpRewardsApr),
        pid: farm.pid,
        multiplier: farm.multiplier,
        lpLabel,
        lpSymbol: farm.lpSymbol,
        tokenAddress,
        quoteTokenAddress,
        cakePrice,
        lpRewardsApr: farm.lpRewardsApr,
        originalValue: farm.apr,
      },
      farm: {
        ...farm,
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        lpSymbol: farm.lpSymbol,
        quoteToken: farm.quoteToken,
      },
      staked: {
        label: lpLabel,
        pid: farm.pid,
        stakedBalance: farm.userData.stakedBalance,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
      },
      multiplier: {
        multiplier: farm.multiplier,
      },
    }

    return row
  })

  const columns = useMemo(
    () =>
      columnSchema.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
          switch (column.name) {
            case 'farm':
              return b.id - a.id
            default:
              return 1
          }
        },
        sortable: column.sortable,
      })),
    [columnSchema],
  )

  const sortedRows = rowData.map((row) => {
    // @ts-ignore
    const newRow: RowProps = {}
    columns.forEach((column) => {
      if (!(column.name in row)) {
        throw new Error(`Invalid row data, ${column.name} not found`)
      }
      newRow[column.name] = row[column.name]
    })
    return newRow
  })

  return (
    <Container>
      <TableHeader title={title} />
      <TableStyle>
        {!userDataReady && (
          <Flex padding="50px 10px" justifyContent="center">
            <Spinner />
          </Flex>
        )}
        {!account && <EmptyText text={t('Please connect wallet to check your farms status.')} />}
        {account && userDataReady && sortedRows.length === 0 && <EmptyText text={noStakedFarmText} />}
        {account &&
          userDataReady &&
          sortedRows.map((row) => {
            return <Row {...row} key={`table-row-${row.farm.pid}`} />
          })}
      </TableStyle>
    </Container>
  )
}

export default MigrationFarmTable
