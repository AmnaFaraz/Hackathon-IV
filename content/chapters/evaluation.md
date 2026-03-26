# Chapter 6: Evaluating AI Systems

## Why Evaluation Matters

You can't improve what you can't measure. LLM evaluation is uniquely challenging because outputs are open-ended — there's rarely a single "correct" answer. A system that works for 90% of inputs can still fail catastrophically on the remaining 10%.

Rigorous evaluation is what separates production AI from demos.

## Types of Evaluation

### Automated Metrics

**BLEU (Bilingual Evaluation Understudy)**
Measures n-gram overlap between generated and reference text. Widely used for translation/summarization.
```
BLEU = BP × exp(Σ wₙ × log pₙ)
```
Range: 0-1 (higher = more similar to reference)

**ROUGE (Recall-Oriented Understudy for Gisting Evaluation)**
```
ROUGE-1: Unigram overlap
ROUGE-2: Bigram overlap
ROUGE-L: Longest common subsequence
```

**Perplexity**
Measures how "surprised" the model is by a held-out test set. Lower = better language model.
```python
import math
perplexity = math.exp(average_cross_entropy_loss)
```

### LLM-as-Judge

Use a stronger LLM to evaluate outputs from your system. Increasingly common for production evaluation:

```python
def evaluate_response(question: str, answer: str, context: str) -> dict:
    prompt = f"""Rate this AI response on a scale of 1-5 for:
1. Correctness (is it factually accurate?)
2. Relevance (does it answer the question?)
3. Completeness (is the answer complete?)
4. Faithfulness (is it grounded in the context?)

Question: {question}
Context: {context}
Answer: {answer}

Output JSON: {{"correctness": X, "relevance": X, "completeness": X, "faithfulness": X, "reasoning": "..."}}"""

    # Use Groq to evaluate
    ...
```

### Human Evaluation

The gold standard. Have humans rate outputs on:
- **Helpfulness**: Did it solve the user's problem?
- **Harmlessness**: Did it avoid harmful outputs?
- **Honesty**: Did it acknowledge uncertainty?

**A/B Testing**: Compare two systems on live traffic and measure user satisfaction.

## RAG-Specific Metrics (RAGAS)

| Metric | Measures | Formula |
|--------|---------|---------|
| Faithfulness | Answer grounded in context? | |correct facts| / |all facts| |
| Answer Relevancy | Does answer address question? | Cosine sim(question, answer) |
| Context Precision | Retrieved context relevant? | |relevant chunks| / |total chunks| |
| Context Recall | All needed info retrieved? | |retrieved needed| / |all needed| |

## Evaluation Datasets

Build a representative test set before deploying:
- 50-200 question-answer pairs
- Cover edge cases and failure modes
- Include adversarial examples
- Update as you discover new failures

```python
test_cases = [
    {
        "question": "What is the capital of Pakistan?",
        "expected": "Islamabad",
        "category": "factual"
    },
    {
        "question": "Explain backpropagation simply",
        "expected": None,  # Human eval needed
        "category": "explanation"
    }
]
```

## Continuous Evaluation

Production systems need ongoing monitoring:

### Drift Detection
Model behavior can change when:
- User query distribution shifts
- Retrieved document quality degrades
- Underlying model is updated

### Logging & Tracing
```python
# Log every inference for analysis
{
    "timestamp": "2024-01-01T12:00:00Z",
    "query": "...",
    "retrieved_chunks": [...],
    "response": "...",
    "latency_ms": 342,
    "tokens_used": 1847,
    "user_feedback": null  # Filled in later
}
```

### User Feedback Signals
- 👍 / 👎 buttons
- "Was this helpful?" prompts
- Follow-up question analysis (no follow-up = probably answered)
- Session abandonment rate

## Evaluation Pitfalls

- **Overfitting to eval set**: If you tune for metrics, you may not improve real-world performance
- **Metric gaming**: BLEU can be gamed by verbose outputs with matching n-grams
- **Evaluating the wrong thing**: Measure what users care about, not what's easy to measure
- **Small test sets**: Need statistical significance to trust results
- **Leakage**: Test questions appearing in training data

## Production Monitoring Tools

- **LangSmith**: Tracing + evaluation for LangChain apps
- **Weights & Biases**: Experiment tracking + LLM monitoring
- **Helicone**: API proxy with built-in logging
- **RAGAS**: Automated RAG evaluation framework
- **TruLens**: Feedback functions for LLM apps
