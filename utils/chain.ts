import { mongoClient } from "@/utils/mongo-client"
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb"; 
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { PromptTemplate, ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

async function initChain() {

    const model = new ChatOpenAI({streaming: true});

    const database = mongoClient.db(process.env.MONGO_DB);

    const envCollection = process.env.MONGO_COLLECTION;

    if(!envCollection) {
        throw new Error('Missing Collection in Environment Variables');
    }

    const collection = database.collection(envCollection);

    const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings({}), {
        collection,
        indexName: process.env.MONGO_INDEX,
        textKey: "text",
        embeddingKey: "embedding"
    });

    const retriever = vectorStore.asRetriever();

    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder("chat_history"),
        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
        ],
    ]);

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt
    });

    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        ["system", "Answer the user's questions based on the below context:\n\n{context}",],
        new MessagesPlaceholder("chat_history"),
        ["user", "{input}"],
    ]);

    const historyAwareCombineDocsChain = await createStuffDocumentsChain({
        llm: model,
        prompt: historyAwareRetrievalPrompt,
    });

    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCombineDocsChain,
    });

    return conversationalRetrievalChain;
}

export const chain = await initChain();