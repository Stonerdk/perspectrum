from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
import os
from dotenv import load_dotenv
from text_util import *
from dotenv import load_dotenv

load_dotenv()

def build_personas(topics, embedding_model):
    vdb = {}
    base_dir = './new2'
    for topic in topics:
        folder_path = os.path.join(base_dir, topic)
        if not os.path.exists(folder_path):
            continue
        documents = construct_document(folder_path)
        if documents:
            vdb[topic] = FAISS.from_documents(documents, embedding_model)
        else:
            print(f"No documents found or decoded in folder for topic '{topic}'.")
    return vdb

if __name__ == "__main__":
    load_dotenv()
    openai_api_key = os.getenv("OPENAI_API_KEY")
    embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
    topics = ['economics', 'science', 'social', 'politics']
    os.system("rm -f PersonaChatbot.pickle")
    vdb = build_personas(topics, embedding_model)
    for topic in topics:
        vdb[topic].save_local(f'./v4/{topic}')