import chardet
import os
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read())
    return result['encoding']

def load_file(file_path):
    try:
        encoding = detect_encoding(file_path)
        with open(file_path, 'r', encoding=encoding) as f:
            text = f.read()
        return text
    except Exception as e:
        print(f"Failed to load {file_path}: {e}")
        return None

def construct_document(folder_path, chunk_size=1000, chunk_overlap=50):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    documents = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.txt'):
            file_path = os.path.join(folder_path, filename)
            text = load_file(file_path)
            if text:
                doc = Document(page_content=text, metadata={"source": file_path})
                docs = text_splitter.split_documents([doc])
                documents.extend(docs)
    return documents