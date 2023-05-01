import { Box, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import numeral from 'numeral'

const LineChart = dynamic(
  () => import('@shopify/polaris-viz').then((module) => module.LineChart),
  { ssr: false }
)

interface PriceWidgetProps {
  currentPrice: string
  data: any
}

const PriceWidget = ({ currentPrice, data }: PriceWidgetProps) => {
  return (
    <Box
      w="32.3rem"
      h="18rem"
      p={5}
      borderWidth="1px"
      ml='2.8rem'
      borderRadius="lg"
      overflow="hidden"
    >
      <Stat size="md" mb={5} ml={4}>
        <StatLabel fontWeight={400}>Bitcoin</StatLabel>
        <StatNumber fontSize={16}>$ {currentPrice}</StatNumber>
      </Stat>
      <LineChart
        theme="Light"
        xAxisOptions={{ hide: true }}
        yAxisOptions={{
          integersOnly: true,
          labelFormatter: (value) => `$ ${numeral(value).format('0,0')}`
        }}
        showLegend={false}
        data={[
          {
            'name': 'BTC',
            'data': data
          }
        ]}
      />
    </Box>
  )
}

export default PriceWidget
