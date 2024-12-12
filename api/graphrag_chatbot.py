#####GraphRAG
import os
import networkx as nx
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chardet
from langchain.docstore.document import Document
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import numpy as np
import pickle
from prompt import Prompt

load_dotenv()

class GraphRAGChatbot:
    def __init__(self, openai_api_key):
        # constants
        self.topics = [
            "economics",
            "science",
            "law",
            "social",
            "environment",
            "education",
            "politics",
            "culture",
        ]
        self.prev_question = ""
        self.prev_personas = []
        self.max_turns = 10
        # heavy
        self.prompt = Prompt(self.topics)
        self.embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
        self.chat_model = ChatOpenAI(
            model="gpt-4o-mini", temperature=0.7, openai_api_key=openai_api_key
        )
        self.persona_graphs = pickle.load(open("./graphrag/graphs.pkl", "rb"))
        self.dialogue_history = []
        self.persona_contexts = {}


    def recommend_topics(self, query):
        """Use OpenAI API to recommend 5 most related topics based on the query."""
        response = self.chat_model(self.prompt.recommend_topics(query))
        recommended_topics = [topic.strip() for topic in response.content.split(",")]
        recommended_topics = [
            topic for topic in recommended_topics if topic in self.topics
        ]
        return recommended_topics[:5]


    def recommend_personas(self, query, selected_topics): # TODO: error prone
        """Use LLM to recommend 3 most appropriate personas among selected topics."""
        response = self.chat_model(self.prompt.recommend_personas(query, selected_topics))
        recommended_personas = [
            topic.strip().lower() for topic in response.content.split(",")
        ]
        recommended_personas = [
            topic for topic in recommended_personas if topic in selected_topics
        ]
        return recommended_personas[:3]


    async def retrieve(self, personas):
        self.prev_personas = personas
        self.persona_contexts = { persona: "" for persona in personas }
        self.dialogue_history = [] # reset
        for persona in personas:
            if persona in self.persona_graphs.items():
                graph = self.persona_graphs[persona]
                relevant_nodes = self.retrieve_relevant_nodes(graph, self.prev_question)
                self.persona_contexts[persona] = "\n\n".join(
                    [graph.nodes[node]["content"] for node in relevant_nodes]
                )

        chain = self.prompt.query_chain(self.chat_model)
        for persona in personas:
            yield (persona, "...")
            response = chain.run(persona=persona, context=self.persona_contexts[persona], question=self.prev_question)
            self.dialogue_history.append((persona, response))
            yield (persona, response)
        return


    async def debate(self):
        total_exchanges = self.max_turns * len(self.prev_personas)
        chain = self.prompt.query_debate_chain(self.chat_model)
        for persona in self.prev_personas:
            yield (persona, "...")
            history_text = ""
            for speaker, utterance in self.dialogue_history[-6:]:
                history_text += f"{speaker.capitalize()}: {utterance}\n"
            response = chain.run(
                persona=persona,
                context=self.persona_contexts[persona],
                dialogue_history=history_text,
                question=self.prev_question,
            )
            self.dialogue_history.append((persona, response))
            yield (persona, response)
        if len(self.dialogue_history) >= total_exchanges:
            self.dialogue_history = []
            self.prev_personas = []
            self.prev_question = ""
        return

    async def reset(self):
        self.dialogue_history = []
        self.prev_personas = []
        self.prev_question = ""

    def is_debating(self):
        return self.dialogue_history != []


    def retrieve_relevant_nodes(self, graph, query):
        """Retrieve nodes from the graph that are most relevant to the query."""
        query_embedding = self.embedding_model.embed_query(query)
        query_norm = max(1e-10, np.linalg.norm(query_embedding))
        nodes, data = zip(*graph.nodes(data=True))
        contents = [d["content"] for d in data]
        node_embeddings = np.array(self.embedding_model.embed_documents(contents)) # num_node, D
        node_norms = np.linalg.norm(node_embeddings, axis=1)
        node_norms[node_norms == 0] = 1e-10
        similarities = (node_embeddings @ query_embedding) / (node_norms * query_norm)
        similarities = np.nan_to_num(similarities)
        top_indices = np.argsort(similarities)[-10:][::-1]
        top_nodes = [nodes[i] for i in top_indices]
        return top_nodes


    def run_chatbot(self):
        """Run the chatbot interaction loop."""
        print("Welcome to the GraphRAG Chatbot Service!")
        while True:
            print("\n1. Start a new discussion")
            print("\n2. Exit")
            print("\n3. Debate")

            choice = input("Select an option: ")

            if choice == "1":
                query = input("Enter the topic you want to discuss: ")
                recommended_topics = self.recommend_topics(query)
                if not recommended_topics:
                    print("No relevant topics found. Please try again.")
                    continue
                print(f"Recommended topics: {', '.join(recommended_topics)}")

                question = input("Enter your question: ")
                recommended_personas = self.recommend_personas(
                    question, recommended_topics
                )
                if not recommended_personas:
                    print("No personas could be recommended based on your question.")
                    continue
                print(f"Personas selected to answer: {', '.join(recommended_personas)}")

                answers = self.answer_question(question, recommended_personas)
                for persona, answer in answers.items():
                    print(f"\nAnswer from '{persona}': {answer}")

            elif choice == "2":
                print("Exiting chatbot. Goodbye!")
                break

            elif choice == "3":
                question = input("Enter the question for the debate: ")
                recommended_topics = self.recommend_topics(question)
                if not recommended_topics:
                    print("No relevant topics found. Please try again.")
                    continue
                print(f"Recommended topics: {', '.join(recommended_topics)}")

                recommended_personas = self.recommend_personas(
                    question, recommended_topics
                )
                if not recommended_personas:
                    print("No personas could be recommended based on your question.")
                    continue
                print(
                    f"Personas selected for the debate: {', '.join(recommended_personas)}"
                )

                self.debate_question(question, recommended_personas)
            else:
                print("Invalid choice. Please try again.")

bot = GraphRAGChatbot(openai_api_key=os.getenv("OPENAI_API_KEY"))
# generative ai copyright issue