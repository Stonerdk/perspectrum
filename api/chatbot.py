from langchain.document_loaders import TextLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
import os
import numpy as np
from langchain.schema import HumanMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chardet
from langchain.docstore.document import Document
import pickle
import gzip
from dotenv import load_dotenv

load_dotenv()

class PersonaChatbot:
    def __init__(self, openai_api_key):
        self.embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
        self.chat_model = ChatOpenAI(model="gpt-4o", temperature=0.7, openai_api_key=openai_api_key)
        self.topics = ['economics', 'science', 'social', 'politics']
        self.persona_vectordbs = {}
        for topic in self.topics:
            self.persona_vectordbs[topic] = FAISS.load_local(f'./v4/{topic}', self.embedding_model, allow_dangerous_deserialization=True)

    def recommend_topics(self, query):
        """Use OpenAI API to recommend 3 most related topics based on the query."""
        prompt = (
            f"Given the query: '{query}', select the 3 most relevant topics from the following list:\n"
            f"{', '.join(self.topics)}\n"
            f"Provide only the list of topics separated by commas."
        )
        response = self.chat_model([HumanMessage(content=prompt)])
        recommended_topics = [topic.strip() for topic in response.content.split(',')]
        # Ensure valid topics
        recommended_topics = [topic for topic in recommended_topics if topic in self.topics]
        return recommended_topics[:5]

    def recommend_personas(self, query, selected_topics):
        """Use LLM to recommend 3 most appropriate personas among selected topics."""
        prompt = (
            f"Given the query: '{query}' and the topics: {', '.join(selected_topics)}, "
            f"select the 3 most appropriate topics for answering the question. "
            f"Provide only the list of topics separated by commas."
        )
        response = self.chat_model([HumanMessage(content=prompt)])
        recommended_personas = [topic.strip() for topic in response.content.split(',')]
        # Ensure valid topics from selected_topics
        recommended_personas = [topic.lower() for topic in recommended_personas if topic.lower() in selected_topics]
        return recommended_personas[:3]

    def answer_question(self, query, personas):
      """Get answers from the selected personas."""
      answers = {}
      for persona in personas:
          if persona in self.persona_vectordbs:
              retriever = self.persona_vectordbs[persona].as_retriever()
              docs = retriever.get_relevant_documents(query)
              context = "\n\n".join([doc.page_content for doc in docs])
              from langchain.prompts import PromptTemplate
              prompt_template = PromptTemplate(
                  input_variables=["persona", "context", "question"],
                  template=(
                      "Please think from a {persona} perspective.\n\n"
                      "{context}\n\n"
                      "Question: {question} please answer me briefly, whithin two sentences \n"
                      "Answer:"
                  )
              )
              from langchain.chains import LLMChain
              chain = LLMChain(
                  llm=self.chat_model,
                  prompt=prompt_template
              )
              output = chain.run(
                  persona=persona,
                  context=context,
                  question=query
              )
              answers[persona] = output
          else:
              answers[persona] = f"No data available for persona '{persona}'."
      return answers


    def run_chatbot(self):
        """Run the chatbot interaction loop."""
        print("Welcome to the Persona Chatbot Service!")
        while True:
            print("\n1. Start a new discussion")
            print("2. Exit")
            choice = input("Select an option: ")

            if choice == "1":
                query = input("Enter the topic you want to discuss: ")
                recommended_topics = self.recommend_topics(query)
                if not recommended_topics:
                    print("No relevant topics found. Please try again.")
                    continue
                print(f"Recommended topics: {', '.join(recommended_topics)}")

                while True:
                  print("\n1. Ask Question")
                  print("2. Exit")
                  choice_new = input("Select an option: ")
                  if choice_new=="1":
                    question = input("Enter your question: ")
                    recommended_personas = self.recommend_personas(question, recommended_topics)
                    if not recommended_personas:
                        print("No personas could be recommended based on your question.")
                        continue
                    print(f"Personas selected to answer: {', '.join(recommended_personas)}")

                    answers = self.answer_question(question, recommended_personas)
                    for persona, answer in answers.items():
                        print(f"\nAnswer from '{persona}': {answer}")
                  elif choice_new=="2":
                    print("Exiting chatbot. Goodbye!")
                    break

            elif choice == "2":
                print("Exiting chatbot. Goodbye!")
                break
            else:
                print("Invalid choice. Please try again.")

bot = PersonaChatbot(openai_api_key=os.getenv("OPENAI_API_KEY"))