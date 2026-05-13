import { faker } from '@faker-js/faker'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const args = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1])
}

const transactionCount = Number(args.get('--transactions') ?? 50_000)
const merchantCount = Number(args.get('--merchants') ?? 200)

faker.seed(20260513)

const categories = [
  'SaaS',
  'Cloud',
  'Travel',
  'Meals',
  'Office',
  'Hardware',
  'Marketing',
  'Legal',
  'Finance',
  'Education',
  'Subscriptions',
  'Shipping',
  'Events',
  'Recruiting',
  'Facilities',
]

const cards = [
  { name: 'Ops Primary', last4: '4129' },
  { name: 'Engineering', last4: '8821' },
  { name: 'Marketing', last4: '6730' },
  { name: 'Travel', last4: '1442' },
  { name: 'Executive', last4: '9204' },
]

const knownMerchants = [
  ['Vercel', 'vercel.com', 'SaaS'],
  ['Linear', 'linear.app', 'SaaS'],
  ['Figma', 'figma.com', 'SaaS'],
  ['Datadog', 'datadoghq.com', 'Cloud'],
  ['Amazon Web Services', 'aws.amazon.com', 'Cloud'],
  ['Google Cloud', 'cloud.google.com', 'Cloud'],
  ['OpenAI', 'openai.com', 'SaaS'],
  ['GitHub', 'github.com', 'SaaS'],
  ['Slack', 'slack.com', 'SaaS'],
  ['Notion', 'notion.so', 'SaaS'],
  ['Stripe', 'stripe.com', 'Finance'],
  ['Mercury', 'mercury.com', 'Finance'],
  ['Ramp', 'ramp.com', 'Finance'],
  ['Brex', 'brex.com', 'Finance'],
  ['Zoom', 'zoom.us', 'SaaS'],
  ['Airtable', 'airtable.com', 'SaaS'],
  ['Asana', 'asana.com', 'SaaS'],
  ['Dropbox', 'dropbox.com', 'SaaS'],
  ['Atlassian', 'atlassian.com', 'SaaS'],
  ['Sentry', 'sentry.io', 'Cloud'],
  ['Cloudflare', 'cloudflare.com', 'Cloud'],
  ['Twilio', 'twilio.com', 'Cloud'],
  ['Segment', 'segment.com', 'Marketing'],
  ['HubSpot', 'hubspot.com', 'Marketing'],
  ['Mailchimp', 'mailchimp.com', 'Marketing'],
  ['Webflow', 'webflow.com', 'Marketing'],
  ['Adobe', 'adobe.com', 'Marketing'],
  ['Canva', 'canva.com', 'Marketing'],
  ['Delta Air Lines', 'delta.com', 'Travel'],
  ['United Airlines', 'united.com', 'Travel'],
  ['Airbnb', 'airbnb.com', 'Travel'],
  ['Uber', 'uber.com', 'Travel'],
  ['Lyft', 'lyft.com', 'Travel'],
  ['Hilton', 'hilton.com', 'Travel'],
  ['Marriott', 'marriott.com', 'Travel'],
  ['DoorDash', 'doordash.com', 'Meals'],
  ['Sweetgreen', 'sweetgreen.com', 'Meals'],
  ['Chipotle', 'chipotle.com', 'Meals'],
  ['Staples', 'staples.com', 'Office'],
  ['Apple', 'apple.com', 'Hardware'],
  ['Dell', 'dell.com', 'Hardware'],
  ['FedEx', 'fedex.com', 'Shipping'],
  ['Docusign', 'docusign.com', 'Legal'],
  ['Carta', 'carta.com', 'Finance'],
  ['LinkedIn', 'linkedin.com', 'Recruiting'],
]

const merchantFallbacks = Array.from({ length: Math.max(merchantCount - knownMerchants.length, 0) }, (_, index) => {
  const name = `${faker.company.name().replace(/[,&.]/g, '').split(' ').slice(0, 2).join(' ')} ${index + 1}`
  const domain = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18)}.com`
  return [name, domain, faker.helpers.arrayElement(categories)]
})

const merchants = [...knownMerchants, ...merchantFallbacks]
  .slice(0, merchantCount)
  .map(([name, domain, category], index) => ({
    id: `merchant_${String(index + 1).padStart(3, '0')}`,
    name,
    domain,
    category,
    logoUrl: `https://logo.clearbit.com/${domain}`,
  }))

const statusWeights = [
  { weight: 75, value: 'Cleared' },
  { weight: 14, value: 'Pending' },
  { weight: 7, value: 'Flagged' },
  { weight: 4, value: 'Declined' },
]

const now = new Date()
const twoYearsAgo = new Date(now)
twoYearsAgo.setMonth(twoYearsAgo.getMonth() - 24)

const amountForCategory = (category) => {
  const ranges = {
    SaaS: [24, 12_500],
    Cloud: [120, 35_000],
    Travel: [18, 4_800],
    Meals: [8, 950],
    Office: [12, 1_800],
    Hardware: [80, 8_500],
    Marketing: [50, 15_000],
    Legal: [350, 25_000],
    Finance: [10, 5_500],
    Education: [20, 2_200],
    Subscriptions: [8, 1_200],
    Shipping: [8, 1_400],
    Events: [250, 18_000],
    Recruiting: [95, 9_000],
    Facilities: [40, 7_000],
  }
  const [min, max] = ranges[category] ?? [8, 5_000]
  return Number(faker.number.float({ min, max, fractionDigits: 2 }).toFixed(2))
}

const transactions = Array.from({ length: transactionCount }, (_, index) => {
  const merchant = faker.helpers.arrayElement(merchants)
  const category = faker.datatype.boolean({ probability: 0.82 })
    ? merchant.category
    : faker.helpers.arrayElement(categories)
  const card = faker.helpers.arrayElement(cards)
  const date = faker.date.between({ from: twoYearsAgo, to: now })
  const amount = amountForCategory(category)
  const status = faker.helpers.weightedArrayElement(statusWeights)
  const owner = faker.person.fullName()

  return {
    id: `txn_${String(index + 1).padStart(6, '0')}`,
    date: date.toISOString(),
    merchant: merchant.name,
    merchantId: merchant.id,
    domain: merchant.domain,
    logoUrl: merchant.logoUrl,
    category,
    card: card.name,
    cardLast4: card.last4,
    amount,
    status,
    description: `${merchant.name} ${faker.commerce.productAdjective()} ${category.toLowerCase()} charge`,
    owner,
    location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
    receipt: faker.datatype.boolean({ probability: 0.68 }),
  }
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

const outputPath = resolve(root, 'public/data/transactions.json')
await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(transactions)}\n`)

console.log(`Generated ${transactions.length.toLocaleString()} transactions at ${outputPath}`)
