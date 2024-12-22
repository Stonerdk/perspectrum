
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
import os
from dotenv import load_dotenv
from text_util import *
import numpy as np
import networkx as nx
from dotenv import load_dotenv
from tqdm import tqdm
import pickle

batch_size = 32
def build_graphs(topics, embedding_model):
    persona_graphs = {}
    base_dir = "./new2"

    for topic in topics:
        folder_path = os.path.join(base_dir, topic)
        if not os.path.exists(folder_path):
            pass
        print("doc", topic)
        documents = construct_document(folder_path)

        graph = nx.Graph()
        for i, doc in enumerate(documents):
            graph.add_node(i, content=doc.page_content, metadata=doc.metadata)
        print("embedding", topic)
        texts = [doc.page_content for doc in documents]
        embeddings = []
        for i in tqdm(range(0, len(texts), batch_size), desc="Embedding batches"):
            batch_texts = texts[i:i + batch_size]
            batch_embeddings = embedding_model.embed_documents(batch_texts)
            embeddings.extend(batch_embeddings)
        norms = [np.linalg.norm(embedding) for embedding in embeddings]

        print("construct graph", topic)
        for i in range(len(documents)):
            for j in range(i + 1, len(documents)):
                similarity = np.dot(embeddings[i], embeddings[j]) / (
                    norms[i] * norms[j]
                )
                if similarity > 0.5:  # Threshold for similarity
                    graph.add_edge(i, j, weight=similarity)

        persona_graphs[topic] = graph
    return persona_graphs

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
topics = ['economics', 'science', 'law', 'social', 'environment', 'education', 'politics', 'culture']

graphs = build_graphs(topics, embedding_model)
with open(f"./graphrag/graphs.pkl", "wb") as f:
    pickle.dump(graphs, f)