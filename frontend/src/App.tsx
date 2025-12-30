import { Layout } from '@/components/layout/Layout'
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary'
import { AssetDistribution } from '@/components/dashboard/AssetDistribution'
import { NetWorthChart } from '@/components/dashboard/NetWorthChart'
import { AssetList } from '@/components/portfolio/AssetList'

function App() {
  return (
    <Layout>
      <PortfolioSummary />

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <AssetDistribution />
        <NetWorthChart />
      </div>

      <AssetList />
    </Layout>
  )
}

export default App
