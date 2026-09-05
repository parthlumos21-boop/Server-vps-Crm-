const { connectDatabase, disconnectDatabase, mongoose } = require('../config/db')
const { env } = require('../config/env')

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const collectionNames = args
  .filter((arg) => arg !== '--apply')
  .map((arg) => String(arg || '').trim())
  .filter(Boolean)

const usage = () => {
  console.log('Usage:')
  console.log('  node scripts/clear-collection-data.cjs users')
  console.log('  node scripts/clear-collection-data.cjs users --apply')
  console.log('  node scripts/clear-collection-data.cjs users accounts visitors --apply')
}

const collectionExists = async (db, collectionName) => {
  const matches = await db.listCollections({ name: collectionName }).toArray()
  return matches.length > 0
}

const main = async () => {
  if (collectionNames.length === 0) {
    usage()
    process.exitCode = 1
    return
  }

  await connectDatabase()
  const db = mongoose.connection.db
  await db.admin().ping()

  console.log(`Connected to MongoDB database "${env.mongo.dbName}".`)
  console.log(apply ? 'APPLY MODE - DATA WILL BE DELETED' : 'DRY RUN - NO DATA WILL BE DELETED')

  for (const collectionName of collectionNames) {
    const existsBefore = await collectionExists(db, collectionName)

    if (!existsBefore) {
      console.log(`\nCollection "${collectionName}" does not exist. Nothing to clear.`)
      continue
    }

    const collection = db.collection(collectionName)
    const countBefore = await collection.countDocuments()

    console.log(`\nCollection: ${collectionName}`)
    console.log(`Documents before: ${countBefore}`)

    if (!apply) {
      console.log('Skipped deleteMany({}) because --apply was not provided.')
      continue
    }

    const result = await collection.deleteMany({})
    const countAfter = await collection.countDocuments()
    const existsAfter = await collectionExists(db, collectionName)

    console.log(`Deleted documents: ${result.deletedCount}`)
    console.log(`Documents after: ${countAfter}`)
    console.log(`Collection still exists: ${existsAfter ? 'yes' : 'no'}`)
  }
}

main()
  .catch((error) => {
    console.error('Failed to clear collection data.')
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase().catch(() => {})
  })
