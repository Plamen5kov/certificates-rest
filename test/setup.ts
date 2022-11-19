import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase, SeederOptions } from 'typeorm-extension';
import { options } from '../data-source-test.config'
import { exec } from "child_process";
import * as fs from 'fs'
const initializedTestsFlagName = 'test-db-is-initialized'

/**
 * This code is necessary for the test config, because when the nest application is starting up nest handles conenction and entitiy initialization, but the "npm run seed" command doesn't and neither does "npm run db:create" works reliably because if the ts-node execution speed.
 * The seed command will only make a connection but and although it has found entities, it will not trigger syncronize even if it's specified in the datasource options.
 * The workaround I found was to attach 
 */
module.exports = async function (globalConfig, projectConfig) {
    console.log("Setting up test environment and seeding")

    const testsAreSetup = fs.existsSync(initializedTestsFlagName)
    if (!testsAreSetup) {

        console.log("Creating database...")
        await createDatabase({ options });

        const testSeedCommand = "npm run seed -- -d ./data-source-test.config.ts"
        const seedTestData = new Promise((resolve, reject) => {
            exec(testSeedCommand, (error, stdout, stderr) => {
                if (error) return reject(error)
                if (stderr) return reject(stderr)
                return resolve(true)
            });
        })

        console.log(`running test seed command... ${testSeedCommand}`)
        await seedTestData
        fs.writeFileSync(initializedTestsFlagName, "")
    } else {
        console.log("Nothing to do, you're all set...")
    }
};