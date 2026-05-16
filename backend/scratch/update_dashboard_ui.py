import os

file_path = r'd:\Projects\Boss Finance\BossFinance\frontend\src\app\admin\dashboard\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update Interface
content = content.replace(
    'sanctioned: string;\n  outstanding: string;',
    'sanctioned: string;\n  recovered: string;\n  outstanding: string;'
)

# Update Cards
old_cards = """              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard label="Target Collections" value={stats.expected} subtitle={`Due in ${activeTab} period`} variant="default" />
                <StatCard label="Actual Collections" value={stats.actual} subtitle={`Collected in ${activeTab} period`} variant="accent" />
                <StatCard label="Amount Sanctioned" value={stats.sanctioned} variant="default" />
                <StatCard label="Outstanding Balance" value={stats.outstanding} variant="default" />
              </div>"""

new_cards = """              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <StatCard label="Total Sanctioned Amount" value={stats.sanctioned} subtitle="Principal disbursed across all loans" variant="default" />
                <StatCard label="Total Recovered (Came Back)" value={stats.recovered} subtitle="Total repayments + interest received" variant="accent" />
                <StatCard label="Outstanding Balance" value={stats.outstanding} subtitle="Remaining capital to be collected" variant="default" />
              </div>"""

# Try both CRLF and LF
if old_cards in content:
    content = content.replace(old_cards, new_cards)
else:
    old_cards_lf = old_cards.replace('\r\n', '\n')
    new_cards_lf = new_cards.replace('\r\n', '\n')
    content = content.replace(old_cards_lf, new_cards_lf)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated dashboard page.")
