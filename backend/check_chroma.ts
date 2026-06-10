import { ChromaClient } from "chromadb";
import { config } from "./src/config";

async function checkChroma() {
  console.log("Connecting to ChromaDB at:", config.chromaUrl);
  const chroma = new ChromaClient({ path: config.chromaUrl });

  try {
    const collection = await chroma.getCollection({ name: "document_chunks" });
    console.log("Successfully connected to collection: document_chunks");
    
    // Count items
    const count = await collection.count();
    console.log(`\nTotal chunks stored in ChromaDB: ${count}`);

    if (count > 0) {
      // Get the first 2 items
      console.log("\nFetching top 2 entries...");
      const results = await collection.peek({ });
      
      console.log(JSON.stringify(results, null, 2));
    }
  } catch (error) {
    console.error("Error accessing ChromaDB collection. It might not exist yet.");
    console.error(error);
  }
}

checkChroma();
