import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

async function initMongo() {

    try {

        const connectionString = process.env.ATLAS_CONNECTION_STRING;

        if(!connectionString) {
            throw new Error('Mongo connection string missing in .env file');
        }

        const client = new MongoClient(connectionString);

        await client.connect();

        return client;
    } catch(error) {
        console.log('error', error);
        throw new Error('Failed to Connect to MongoDB')
    } 
}

export const mongoClient = await initMongo();