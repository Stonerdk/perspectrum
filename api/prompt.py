from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import HumanMessage


class Prompt:
    def __init__(self, topics):
        self.topics = topics
        self.query_legacy = PromptTemplate(
            input_variables=["persona", "context", "question"],
            template=(
                "Please think from a {persona} perspective.\n\n"
                "{context}\n\n"
                "Question: {question}\n"
                "Answer:"
            ),
        )
        self.query = PromptTemplate(
            input_variables=["persona", "context", "question"],
            template=(
                "As a {persona}, based on the following   :\n\n"
                "{context}\n\n"
                "Answer the question: {question}\n"
                "Your answer:"
            ),
        )
        self.query_debate = PromptTemplate(
            input_variables=["persona", "context", "dialogue_history", "question"],
            template=(
                "As a {persona}, continue the following debate based on the context and previous dialogue.\n\n"
                "Context:\n{context}\n\n"
                "Dialogue history:\n{dialogue_history}\n"
                "Question: {question}\n. Answer within 3 sentences."
                "{persona}, your response:"
            ),
        )

    def query_chain(self, model):
        return LLMChain(llm=model, prompt=self.query)

    def query_debate_chain(self, model):
        return LLMChain(llm=model, prompt=self.query_debate)

    def recommend_topics(self, query):
        prompt = (
            f"Given the query: '{query}', select the 5 most relevant topics from the following list:\n"
            f"{', '.join(self.topics)}\n"
            f"Provide only the list of topics separated by commas."
        )
        return [HumanMessage(content=prompt)]

    def recommend_personas(self, query, selected_topics):
        """Use LLM to recommend 3 most appropriate personas among selected topics."""
        prompt = (
            f"Given the query: '{query}' and the topics: {', '.join(selected_topics)}, "
            f"select the 3 most appropriate topics for answering the question. "
            f"Provide only the list of topics separated by commas."
        )
        return [HumanMessage(content=prompt)]
