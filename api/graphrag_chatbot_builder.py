
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
import os
from dotenv import load_dotenv
from text_util import *
import numpy as np
import networkx as nx
from dotenv import load_dotenv

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
        embeddings = [
            embedding_model.embed_query(doc.page_content) for doc in documents
        ]
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

if __name__ == "__main__":
    load_dotenv()
    openai_api_key = os.getenv("OPENAI_API_KEY")
    embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
    topics = ['economics', 'science', 'law', 'social', 'environment', 'education', 'politics', 'culture']

    persona_graphs = build_graphs(topics, embedding_model)
    for topic in topics:
        persona_graphs[topic].save_local(f'./graphrag/{topic}')