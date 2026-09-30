-- Seed content for the Research & Publications section.
-- Run after migrations/20260930000000_research_publications.sql. Edit freely from /admin afterwards.

UPDATE profile SET
  research_summary = 'I work on adapting vision-language models to low-resource languages, starting with Bangla. My recent work shows that for Bangla image captioning, vocabulary coverage, not model size or trainable-parameter budget, is the main bottleneck, and that common automatic metrics need human validation before their scores can be trusted. I am interested in efficient multilingual multimodal learning, trustworthy evaluation, and the systems that make training feasible on modest hardware.',
  research_interests = '["Vision-Language Models", "Low-resource & Multilingual NLP", "Parameter-Efficient Fine-Tuning", "Evaluation & Human Judgment", "Efficient ML Systems"]'::jsonb;

INSERT INTO publications (title, authors, venue, year, status, abstract, highlights, tags, code_url, bibtex, featured, "order")
VALUES (
  'Bridging the Vocabulary Gap: Parameter-Efficient Adaptation of Vision-Language Models for Bangla Image Captioning, with a Human-Judgment Pilot Study',
  '["Onik Jahan Sagor"]'::jsonb,
  'Preprint',
  '2026',
  'preprint',
  'Bangla image captioning has received comparatively limited attention in the vision-language literature, and the validity of common automatic metrics for Bangla remains uncertain. We study the adaptation of English-centric and multilingual vision-language models (VLMs) to Bangla through controlled vocabulary, adaptation, and data-regime experiments. A six-stage GiT-base ablation shows that increasing the trainable parameter surface to 26.9% does not yield usable Bangla generation when the original vocabulary is retained, while extending the tokenizer with 29,055 Bangla wordpieces reduces token fertility from 4.155 to 1.176. Qwen2-VL-2B experiments show that script representability alone does not produce Bangla captions zero-shot; after adaptation it produces stronger compositional captions than the bridged GiT controls. A silver-to-gold curriculum achieves the strongest result (BLEU-4 0.108, CIDEr 0.354) with 0.178% trainable parameters and about 6.9 GPU-hours on an 8 GB consumer GPU. A blinded human study with seven annotators (Krippendorff''s alpha = 0.79) finds that LaBSE similarity and BLEU-4 track human adequacy ratings best, whereas reference-free multilingual CLIPScore does not.',
  '["Vocabulary coverage, not trainable-parameter budget, gates Bangla generation: 26.9% trainable params still fail without tokenizer extension.", "Extending the tokenizer with 29k Bangla wordpieces cuts token fertility 4.16 → 1.18.", "Silver-to-gold curriculum reaches CIDEr 0.354 with 0.178% trainable params in ~6.9 GPU-hours on an 8 GB GPU.", "Blinded 7-annotator human study (α = 0.79): LaBSE and BLEU-4 track human adequacy; multilingual CLIPScore does not."]'::jsonb,
  '["Vision-Language", "Bangla", "PEFT / LoRA", "Evaluation"]'::jsonb,
  'https://github.com/BlackBeard009/bangla-vlm-lora',
  '@misc{sagor2026bridging,
  title  = {Bridging the Vocabulary Gap: Parameter-Efficient Adaptation of Vision-Language Models for Bangla Image Captioning, with a Human-Judgment Pilot Study},
  author = {Sagor, Onik Jahan},
  year   = {2026},
  note   = {Preprint}
}',
  true,
  0
);
