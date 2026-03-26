# Chapter 4: Fine-tuning LLMs

## Why Fine-tune?

While prompt engineering and RAG solve many problems, there are cases where fine-tuning provides unique benefits:

- **Consistent behavior**: Bake instructions into weights, not prompts
- **Domain expertise**: Deep knowledge in a specialized area
- **Style/tone**: Match company voice across all outputs
- **Efficiency**: Smaller fine-tuned model can outperform larger base model
- **Reduced context**: No need for lengthy system prompts

## Types of Fine-tuning

### Full Fine-tuning
Update all model weights on your dataset. Most powerful but requires massive GPU memory (multiple A100s for 7B models). Rarely practical for most teams.

### Parameter-Efficient Fine-tuning (PEFT)
Update only a small subset of parameters while freezing the rest. The dominant approach today.

**LoRA (Low-Rank Adaptation)**:
```
W_original (frozen) + ΔW (trainable)
ΔW = A × B  where A is (d×r) and B is (r×d)
r << d  (typical: r=4 to r=64)
```
Only A and B are trained — typically 0.1-1% of original parameters.

**QLoRA**: LoRA + 4-bit quantization. Enables fine-tuning 7B models on a single consumer GPU (24GB VRAM).

### Instruction Fine-tuning
Fine-tune on instruction-following datasets to make base models chat-capable:
```json
{
  "instruction": "Summarize this text in 3 bullet points",
  "input": "The history of artificial intelligence...",
  "output": "• AI began in the 1950s...\n• Key breakthrough...\n• Modern era..."
}
```

## Data Preparation

Quality > Quantity. 1,000 high-quality examples often beats 100,000 noisy ones.

**Dataset requirements:**
- Consistent format (Alpaca, ShareGPT, or custom)
- Diverse examples covering your use cases
- Correct, high-quality outputs
- Balanced class distribution

**Format example (Alpaca)**:
```json
[
  {
    "instruction": "...",
    "input": "...",
    "output": "..."
  }
]
```

## Training Pipeline

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer

# Load base model
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.2-3B")

# Apply LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
)
model = get_peft_model(model, lora_config)

# Train
trainer = SFTTrainer(model=model, train_dataset=dataset, ...)
trainer.train()
```

## Evaluation

**Perplexity**: Lower = model is less "surprised" by the test data

**Task-specific metrics**:
- BLEU/ROUGE for summarization
- Accuracy for classification
- Human evaluation for open-ended generation

**Catastrophic forgetting**: Fine-tuning can reduce performance on original tasks. Use PEFT and small learning rates to minimize.

## Free Fine-tuning Resources

| Platform | Free Tier | GPU |
|----------|----------|-----|
| Google Colab | Yes | T4 (15GB) |
| Kaggle Notebooks | Yes | P100 (16GB) |
| RunPod | ~$0.20/hr | A100 |
| Hugging Face | Free inference | Via API |

## When NOT to Fine-tune

- When RAG or few-shot prompting is sufficient
- When you don't have quality training data
- When the base model already performs well
- When you need to update knowledge frequently (use RAG instead)

Fine-tuning is expensive and time-consuming. Exhaust simpler approaches first.
