from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import HumanMessage


class Prompt:
    def __init__(self, topics):
        self.topics = topics
        self.query = PromptTemplate(
            input_variables=["persona", "context", "question"],
            template=(
                "As a {persona} perspective, based on the following   :\n\n"
                "{context}\n\n"
                "Answer the question: {question}\n"
                "Your answer:"
            ),
        )
        self.query_custom_persona = PromptTemplate(
            input_variables=["persona", "question"],
            template=(
                "As a {persona}, answer the following question:\n\n"
                "Question: {question}\n"
            )
        )
        self.query_debate = PromptTemplate(
            input_variables=["persona", "dialogue_history", "question", "context"],
            template=(
                "As a {persona}, continue the following debate based on the previous dialogue.\n\n"
                "Context:{context}\n\n"
                "Dialogue history:\n{dialogue_history}\n"
                "Question: {question}\n. Answer within 3 sentences."
                "{persona}, your response:"
            ),
        )
        self.query_custom_debate = PromptTemplate(
            input_variables=["persona", "dialogue_history", "question", "context"],
            template=(
                "As a {persona}, continue the following debate based on the previous dialogue.\n\n"
                "Dialogue history:\n{dialogue_history}\n"
                "Question: {question}\n. Answer within 3 sentences."
                "{persona}, your response:"
            ),
        )
        self.query_summary = PromptTemplate(
            input_variables=["dialogue_history"],
            template=(
                "Summarize the following debate in each persona perspective:\n\n"
                "{dialogue_history}\n\n"
                "Summary:"
            )
        )


    def query_chain(self, model):
        return LLMChain(llm=model, prompt=self.query)

    def query_custom_persona_chain(self, model):
        return LLMChain(llm=model, prompt=self.query_custom_persona)

    def query_debate_chain(self, model):
        return LLMChain(llm=model, prompt=self.query_debate)

    def query_debate_persona_chain(self, model):
        return LLMChain(llm=model, prompt=self.query_custom_debate)

    def query_summary_chain(self, model):
        return LLMChain(llm=model, prompt=self.query_summary)

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
