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

load_dotenv()

class GraphRAGChatbot:
    def __init__(self, openai_api_key):
        self.embedding_model = OpenAIEmbeddings(openai_api_key=openai_api_key)
        self.chat_model = ChatOpenAI(
            model="gpt-4o-mini", temperature=0.7, openai_api_key=openai_api_key
        )
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
        self.persona_graphs = pickle.load(open("./graphrag/graphs.pkl", "rb"))

    def recommend_topics(self, query):
        """Use OpenAI API to recommend 5 most related topics based on the query."""
        prompt = (
            f"Given the query: '{query}', select the 5 most relevant topics from the following list:\n"
            f"{', '.join(self.topics)}\n"
            f"Provide only the list of topics separated by commas."
        )
        response = self.chat_model([HumanMessage(content=prompt)])
        recommended_topics = [topic.strip() for topic in response.content.split(",")]
        recommended_topics = [
            topic for topic in recommended_topics if topic in self.topics
        ]
        return recommended_topics[:5]

    def answer_question(self, query, personas):
        """Answer questions using GraphRAG."""
        answers = {}
        for persona in personas:
            if persona in self.persona_graphs:
                graph = self.persona_graphs[persona]
                # Find relevant nodes based on the query
                relevant_nodes = self.retrieve_relevant_nodes(graph, query)

                # Aggregate content from relevant nodes
                context = "\n\n".join(
                    [graph.nodes[node]["content"] for node in relevant_nodes]
                )

                # Generate answer
                prompt_template = PromptTemplate(
                    input_variables=["persona", "context", "question"],
                    template=(
                        "Please think from a {persona} perspective.\n\n"
                        "{context}\n\n"
                        "Question: {question}\n"
                        "Answer:"
                    ),
                )
                chain = LLMChain(llm=self.chat_model, prompt=prompt_template)
                output = chain.run(persona=persona, context=context, question=query)
                answers[persona] = output
            else:
                answers[persona] = f"No data available for persona '{persona}'."
        return answers

    def retrieve_relevant_nodes(self, graph, query):
        """Retrieve nodes from the graph that are most relevant to the query."""
        query_embedding = self.embedding_model.embed_query(query)
        query_norm = np.linalg.norm(query_embedding)
        if query_norm == 0:
            query_norm = 1e-10
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

    async def debate_question(self, question, personas):
        persona_contexts = {}
        for persona in personas:
            if persona in self.persona_graphs.items():
                graph = self.persona_graphs[persona]
                relevant_nodes = self.retrieve_relevant_nodes(graph, question)
                persona_contexts[persona] = "\n\n".join(
                    [graph.nodes[node]["content"] for node in relevant_nodes]
                )
            else:
                persona_contexts[persona] = ""

        dialogue_history = []
        max_turns = 1  # Each persona speaks up to 10 times
        total_exchanges = max_turns * len(personas)

        prompt_template = PromptTemplate(
            input_variables=["persona", "context", "question"],
            template=(
                "As a {persona}, based on the following   :\n\n"
                "{context}\n\n"
                "Answer the question: {question}\n"
                "Your answer:"
            ),
        )
        chain = LLMChain(llm=self.chat_model, prompt=prompt_template)

        for persona in personas:
            response = chain.run(persona=persona, context=persona_contexts[persona], question=question)
            dialogue_history.append((persona, response))
            yield (persona, response)

        prompt_template = PromptTemplate(
            input_variables=["persona", "context", "dialogue_history", "question"],
            template=(
                "As a {persona}, continue the following debate based on the context and previous dialogue.\n\n"
                "Context:\n{context}\n\n"
                "Dialogue history:\n{dialogue_history}\n"
                "Question: {question}\n. Answer within 3 sentences."
                "{persona}, your response:"
            ),
        )
        chain = LLMChain(llm=self.chat_model, prompt=prompt_template)

        for _ in range(max_turns):
            for persona in personas:
                history_text = ""
                for speaker, utterance in dialogue_history[-6:]:
                    history_text += f"{speaker.capitalize()}: {utterance}\n"
                response = chain.run(
                    persona=persona,
                    context=persona_contexts[persona],
                    dialogue_history=history_text,
                    question=question,
                )
                dialogue_history.append((persona, response))
                yield (persona, response)
                if len(dialogue_history) >= total_exchanges:
                    return
            if len(dialogue_history) >= total_exchanges:
                return

    def recommend_personas(self, query, selected_topics):
        """Use LLM to recommend 3 most appropriate personas among selected topics."""
        prompt = (
            f"Given the query: '{query}' and the topics: {', '.join(selected_topics)}, "
            f"select the 3 most appropriate topics for answering the question. "
            f"Provide only the list of topics separated by commas."
        )
        response = self.chat_model([HumanMessage(content=prompt)])
        recommended_personas = [
            topic.strip().lower() for topic in response.content.split(",")
        ]
        # Ensure valid topics from selected_topics
        recommended_personas = [
            topic for topic in recommended_personas if topic in selected_topics
        ]
        return recommended_personas[:3]

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