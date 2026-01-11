import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// 7日間の推移データ
const weeklyData = [
  { date: '1/5', rank: 892 },
  { date: '1/6', rank: 654 },
  { date: '1/7', rank: 423 },
  { date: '1/8', rank: 287 },
  { date: '1/9', rank: 156 },
  { date: '1/10', rank: 78 },
  { date: '1/11', rank: 45 },
];

// カテゴリ別データ
const categoryData = [
  { category: '家電', count: 156, growth: '+23%' },
  { category: 'PC周辺機器', count: 89, growth: '+18%' },
  { category: '生活用品', count: 67, growth: '+15%' },
  { category: 'ウェアラブル', count: 45, growth: '+31%' },
  { category: '食品', count: 34, growth: '+12%' },
];

export function RankChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">1位商品のランク推移（7日間）</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis reversed tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value}位`, 'ランク']}
            />
            <Line
              type="monotone"
              dataKey="rank"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ fill: '#7c3aed', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        7日間で847位→45位に急上昇
      </p>
    </div>
  );
}

export function CategoryChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">カテゴリ別検出数</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} stroke="#6b7280" width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value}件`, '検出数']}
            />
            <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// デフォルトエクスポート（dynamic import用）
export default function SampleCharts() {
  return (
    <>
      <RankChart />
      <CategoryChart />
    </>
  );
}
